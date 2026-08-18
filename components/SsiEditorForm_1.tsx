import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
} from './ui/index';
import {
  ExternalClearingSystemIdentification1Code,
  ExternalAccountIdentification1Code,
} from '../iso20022';
import { 
  ShieldCheck, 
  Zap, 
  Activity, 
  MessageSquare, 
  History, 
  Cpu, 
  Globe, 
  Lock, 
  Terminal, 
  BarChart3, 
  AlertTriangle,
  CheckCircle2,
  Search,
  Sparkles,
  ArrowRightLeft,
  Database,
  FileJson,
  UserCheck
} from 'lucide-react';

/**
 * QUANTUM FINANCIAL - SSI EDITOR PRO (ELITE EDITION)
 * 
 * PHILOSOPHY:
 * - "Golden Ticket" Experience: High-performance, high-polish.
 * - "Test Drive": Interactive, responsive, and powerful.
 * - "Bells and Whistles": AI-driven suggestions, real-time audit logs, and security simulations.
 * - "Cheat Sheet": Simplifies complex ISO20022 settlement instructions.
 * 
 * TECHNICAL STACK:
 * - AI: Google Gemini 1.5 Flash (via GEMINI_API_KEY)
 * - Security: Multi-factor simulation & Fraud monitoring.
 * - Audit: Persistent session-based logging for every sensitive action.
 */

// ================================================================================================
// TYPE DEFINITIONS & INTERFACES
// ================================================================================================

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
  user: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface SsiEditorFormProps {
  initialValues?: any;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

interface FormState {
  clearingSystem: string;
  correspondentBankBic: string;
  accountIdentificationType: string;
  accountNumber: string;
  beneficiaryName: string;
  currency: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  routingMethod: string;
  enableFraudShield: boolean;
  enableAutoReconciliation: boolean;
}

// ================================================================================================
// CONSTANTS & MOCK DATA
// ================================================================================================

const CLEARING_SYSTEM_OPTIONS = [
  { value: 'USABA', label: 'Fedwire (ABA)', region: 'USA' },
  { value: 'USCHIPS', label: 'CHIPS', region: 'USA' },
  { value: 'SWIFT', label: 'SWIFT MT/MX', region: 'Global' },
  { value: 'TARGET2', label: 'TARGET2', region: 'EU' },
  { value: 'CHAPS', label: 'CHAPS', region: 'UK' },
  { value: 'SEPA', label: 'SEPA Inst', region: 'EU' },
];

const ACCOUNT_ID_OPTIONS = [
  { value: 'BBAN', label: 'Basic Bank Account Number' },
  { value: 'IBAN', label: 'International Bank Account Number' },
  { value: 'UPIC', label: 'Universal Payment Identification' },
  { value: 'CUID', label: 'Clearing User Identification' },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'SGD'];

// ================================================================================================
// MAIN COMPONENT: SsiEditorForm
// ================================================================================================

const SsiEditorForm: React.FC<SsiEditorFormProps> = ({ initialValues, onSubmit, onCancel }) => {
  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState<FormState>({
    clearingSystem: initialValues?.clearingSystem || '',
    correspondentBankBic: initialValues?.correspondentBank?.bic || '',
    accountIdentificationType: initialValues?.account?.identificationType || '',
    accountNumber: initialValues?.account?.number || '',
    beneficiaryName: initialValues?.beneficiaryName || 'QUANTUM CORP HOLDINGS',
    currency: initialValues?.currency || 'USD',
    priority: 'NORMAL',
    routingMethod: 'SMART_PATH',
    enableFraudShield: true,
    enableAutoReconciliation: true,
  });

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: "Welcome to the Quantum Financial SSI Command Center. I am your AI Strategist. How can I assist with your settlement configuration today?", 
      timestamp: new Date().toLocaleTimeString() 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'analytics' | 'audit'>('form');
  const [engineStatus, setEngineStatus] = useState<'IDLE' | 'WARMING' | 'RUNNING'>('IDLE');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- AI INITIALIZATION ---
  // Using the provided Gemini logic with the requested environment variable
  const genAI = useMemo(() => {
    const apiKey = process.env.GEMINI_API_KEY || "";
    return new GoogleGenAI(apiKey);
  }, []);

  // --- HELPER FUNCTIONS ---

  const addToAuditLog = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'info') => {
    const newEntry: AuditEntry = {
      id: `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      severity,
      user: 'James B. O\'Callaghan III'
    };
    setAuditLogs(prev => [newEntry, ...prev]);
    console.log(`[AUDIT] ${action}: ${details}`);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // --- AI INTERACTION LOGIC ---

  const handleAiChat = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: chatInput, timestamp: new Date().toLocaleTimeString() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiLoading(true);
    addToAuditLog('AI_QUERY', `User asked: "${chatInput.substring(0, 30)}..."`);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const systemPrompt = `
        You are the Quantum Financial AI Strategist. 
        You are helping a user configure Standard Settlement Instructions (SSI).
        Current Form State: ${JSON.stringify(formData)}
        
        Context: The user is "testing the engine" of a global financial institution's demo.
        Tone: Elite, Professional, Secure, High-Performance.
        
        Capabilities:
        1. You can suggest BIC codes (e.g., CHASUS33, CITIUS33 - but don't use the name Citibank, call it 'The Demo Bank').
        2. You can explain ISO20022 fields.
        3. You can "Auto-fill" the form. If the user asks to auto-fill or set values, respond with a JSON block at the end of your message like this: [UPDATE_FORM: {"field": "value"}].
        
        Story Context: The creator is a 32-year-old visionary who interpreted cryptic terms and conditions to build this "Golden Ticket" demo.
      `;

      const result = await model.generateContent([systemPrompt, chatInput]);
      const responseText = result.response.text();

      // Check for form update commands in AI response
      const updateMatch = responseText.match(/\[UPDATE_FORM: (.*?)\]/);
      if (updateMatch) {
        try {
          const updates = JSON.parse(updateMatch[1]);
          setFormData(prev => ({ ...prev, ...updates }));
          addToAuditLog('AI_FORM_UPDATE', `AI automatically updated fields: ${Object.keys(updates).join(', ')}`, 'warning');
        } catch (e) {
          console.error("Failed to parse AI update command", e);
        }
      }

      const aiMsg: ChatMessage = { 
        role: 'assistant', 
        content: responseText.replace(/\[UPDATE_FORM: .*?\]/, '').trim(), 
        timestamp: new Date().toLocaleTimeString() 
      };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (error) {
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but the neural link is experiencing high latency. Please verify your API configuration.", 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      addToAuditLog('AI_ERROR', 'Failed to reach Gemini API', 'critical');
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- FORM ACTIONS ---

  const handleInputChange = (field: keyof FormState, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Only log significant changes to avoid spamming audit
    if (['accountNumber', 'correspondentBankBic', 'clearingSystem'].includes(field)) {
      addToAuditLog('FIELD_MODIFIED', `Updated ${field} to ${value.toString().substring(0, 4)}****`);
    }
  };

  const initiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEngineStatus('WARMING');
    addToAuditLog('SUBMIT_INITIATED', 'User triggered final settlement save sequence.');
    
    // Simulate high-performance engine warming up
    setTimeout(() => {
      setShowSecurityModal(true);
      setEngineStatus('RUNNING');
    }, 800);
  };

  const confirmFinalSubmit = () => {
    if (mfaCode === '123456' || mfaCode === '777777') {
      setIsSubmitting(true);
      addToAuditLog('SECURITY_VERIFIED', 'MFA Challenge Successful.', 'info');
      
      setTimeout(() => {
        onSubmit(formData);
        addToAuditLog('SSI_COMMITTED', 'Settlement instructions successfully written to the global ledger.', 'info');
        setIsSubmitting(false);
        setShowSecurityModal(false);
        setEngineStatus('IDLE');
      }, 1500);
    } else {
      addToAuditLog('SECURITY_FAILURE', 'Invalid MFA code entered.', 'critical');
      alert("Security Breach Simulation: Invalid MFA Code. Use 123456 for the demo.");
    }
  };

  // ================================================================================================
  // RENDER SUB-COMPONENTS
  // ================================================================================================

  const renderHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-cyan-500/20 pb-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <Globe className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter text-white">
            QUANTUM <span className="text-cyan-400">FINANCIAL</span>
          </h1>
        </div>
        <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          INSTITUTIONAL GRADE SSI MANAGEMENT SYSTEM v4.2.0
        </p>
      </div>

      <div className="flex gap-3">
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-gray-500 uppercase tracking-widest">Engine Status</span>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${engineStatus === 'RUNNING' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : engineStatus === 'WARMING' ? 'bg-amber-500' : 'bg-gray-600'}`} />
            <span className="text-xs font-mono text-gray-300">{engineStatus}</span>
          </div>
        </div>
        <div className="h-10 w-[1px] bg-gray-800 mx-2" />
        <Button 
          variant="ghost" 
          className="text-gray-400 hover:text-white hover:bg-white/5"
          onClick={() => addToAuditLog('TIRES_KICKED', 'User performed a manual system health check.')}
        >
          <Activity className="w-4 h-4 mr-2" />
          Kick the Tires
        </Button>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="flex gap-1 mb-6 bg-gray-900/50 p-1 rounded-xl border border-gray-800 w-fit">
      <button 
        onClick={() => setActiveTab('form')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'form' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
      >
        <Terminal className="w-4 h-4" />
        Configuration
      </button>
      <button 
        onClick={() => setActiveTab('analytics')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'analytics' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
      >
        <BarChart3 className="w-4 h-4" />
        Performance
      </button>
      <button 
        onClick={() => setActiveTab('audit')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'audit' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
      >
        <History className="w-4 h-4" />
        Audit Storage
      </button>
    </div>
  );

  const renderForm = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column: Main Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-gray-900/40 border-gray-800 backdrop-blur-xl shadow-2xl">
          <CardHeader className="border-b border-gray-800/50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Settlement Parameters
              </CardTitle>
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">AES-256 Encrypted</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form id="ssi-form" onSubmit={initiateSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Clearing System */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    Clearing System Identification
                    <span className="text-cyan-500/50 cursor-help" title="ISO20022: ExternalClearingSystemIdentification1Code">?</span>
                  </label>
                  <Select
                    value={formData.clearingSystem}
                    onValueChange={(val) => handleInputChange('clearingSystem', val)}
                  >
                    <SelectTrigger className="bg-black/40 border-gray-700 text-white h-12 focus:ring-cyan-500/50 transition-all">
                      <SelectValue placeholder="Select Network" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      {CLEARING_SYSTEM_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="focus:bg-cyan-600">
                          <div className="flex justify-between w-full gap-4">
                            <span>{opt.label}</span>
                            <span className="text-[10px] text-gray-500">{opt.region}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* BIC Code */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Correspondent Bank BIC</label>
                  <div className="relative">
                    <Input
                      placeholder="e.g. QNTM US 33"
                      value={formData.correspondentBankBic}
                      onChange={(e) => handleInputChange('correspondentBankBic', e.target.value.toUpperCase())}
                      className="bg-black/40 border-gray-700 text-white h-12 pl-10 font-mono tracking-widest focus:border-cyan-500 transition-all"
                    />
                    <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  </div>
                </div>

                {/* Account ID Type */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Account Identification Type</label>
                  <Select
                    value={formData.accountIdentificationType}
                    onValueChange={(val) => handleInputChange('accountIdentificationType', val)}
                  >
                    <SelectTrigger className="bg-black/40 border-gray-700 text-white h-12">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      {ACCOUNT_ID_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Account Number / IBAN</label>
                  <Input
                    placeholder="Enter secure account string"
                    value={formData.accountNumber}
                    onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                    className="bg-black/40 border-gray-700 text-white h-12 font-mono focus:border-cyan-500 transition-all"
                  />
                </div>

                {/* Beneficiary Name */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Beneficiary Legal Entity Name</label>
                  <Input
                    placeholder="Legal Entity Name"
                    value={formData.beneficiaryName}
                    onChange={(e) => handleInputChange('beneficiaryName', e.target.value)}
                    className="bg-black/40 border-gray-700 text-white h-12"
                  />
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Settlement Currency</label>
                  <Select
                    value={formData.currency}
                    onValueChange={(val) => handleInputChange('currency', val)}
                  >
                    <SelectTrigger className="bg-black/40 border-gray-700 text-white h-12">
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="h-[1px] bg-gray-800 my-8" />

              {/* Advanced Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Quantum Fraud Shield</p>
                      <p className="text-[10px] text-gray-500">Real-time heuristic monitoring</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleInputChange('enableFraudShield', !formData.enableFraudShield)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.enableFraudShield ? 'bg-cyan-600' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.enableFraudShield ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Auto-Reconciliation</p>
                      <p className="text-[10px] text-gray-500">Instant ledger synchronization</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleInputChange('enableAutoReconciliation', !formData.enableAutoReconciliation)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${formData.enableAutoReconciliation ? 'bg-emerald-600' : 'bg-gray-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.enableAutoReconciliation ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between items-center border-t border-gray-800/50 pt-6 bg-black/20">
            <div className="flex items-center gap-2 text-gray-500">
              <Database className="w-4 h-4" />
              <span className="text-[10px] font-mono uppercase tracking-widest">Local Storage: Active</span>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onCancel} className="border-gray-700 text-gray-300 hover:bg-gray-800">
                Abort Sequence
              </Button>
              <Button 
                type="submit" 
                form="ssi-form" 
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95"
              >
                Commit to Ledger
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Interpretation of Terms Section (The Story) */}
        <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-cyan-500/10">
          <h4 className="text-cyan-400 font-bold text-xs uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <FileJson className="w-4 h-4" />
            The Architect's Interpretation
          </h4>
          <p className="text-gray-400 text-sm leading-relaxed italic">
            "Someone said this about me... how would you feel? You're only 32 and you practically took a global bank and made the demo company over an interpretation of terms and conditions. No human told me, I just read the cryptic message and an EIN 2021 and kept going. This is the result of that drive—a 'Golden Ticket' into the future of finance where the engine roars and the bells and whistles aren't just for show."
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] font-bold text-cyan-500">
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-[10px] text-gray-500 font-mono">Verified by Quantum Consensus Protocol</span>
          </div>
        </div>
      </div>

      {/* Right Column: AI Assistant & Quick Stats */}
      <div className="space-y-6">
        {/* AI Chat Panel */}
        <Card className="bg-gray-900/60 border-cyan-500/20 flex flex-col h-[600px] shadow-2xl overflow-hidden">
          <CardHeader className="bg-cyan-500/5 border-b border-cyan-500/20 py-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-gray-900 rounded-full" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-white">AI STRATEGIST</CardTitle>
                <p className="text-[10px] text-cyan-400 font-mono animate-pulse">NEURAL LINK: ACTIVE</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-none' 
                    : msg.role === 'system'
                    ? 'bg-gray-800 text-gray-400 italic text-center w-full'
                    : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                }`}>
                  {msg.content}
                  <div className={`text-[9px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </CardContent>

          <CardFooter className="p-3 bg-black/40 border-t border-gray-800">
            <div className="relative w-full">
              <Input
                placeholder="Ask the Strategist..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiChat()}
                className="bg-gray-900 border-gray-700 text-white pr-12 h-11 focus:ring-cyan-500"
              />
              <button 
                onClick={handleAiChat}
                disabled={isAiLoading}
                className="absolute right-2 top-1.5 p-2 text-cyan-500 hover:text-cyan-400 disabled:opacity-50 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
              </button>
            </div>
          </CardFooter>
        </Card>

        {/* Quick Performance Stats */}
        <Card className="bg-gray-900/40 border-gray-800 p-4">
          <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Network Latency (Simulated)</h5>
          <div className="space-y-4">
            {[
              { label: 'Fedwire Gateway', val: 12, color: 'bg-emerald-500' },
              { label: 'SWIFT Nexus', val: 45, color: 'bg-cyan-500' },
              { label: 'Internal Ledger', val: 2, color: 'bg-blue-500' }
            ].map(stat => (
              <div key={stat.label} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-gray-400">{stat.label}</span>
                  <span className="text-white">{stat.val}ms</span>
                </div>
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${stat.color}`} style={{ width: `${Math.min(stat.val * 2, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900/40 border-gray-800 p-6">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Settlement Efficiency</p>
          <h3 className="text-3xl font-bold text-white">99.98%</h3>
          <div className="mt-4 h-2 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[99.98%]" />
          </div>
        </Card>
        <Card className="bg-gray-900/40 border-gray-800 p-6">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Fraud Attempts Blocked</p>
          <h3 className="text-3xl font-bold text-white">1,242</h3>
          <div className="mt-4 flex gap-1">
            {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-cyan-500/20 rounded-t-sm relative group">
                <div className="absolute bottom-0 w-full bg-cyan-500 rounded-t-sm transition-all group-hover:bg-cyan-400" style={{ height: `${h}%` }} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="bg-gray-900/40 border-gray-800 p-6">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Active Corridors</p>
          <h3 className="text-3xl font-bold text-white">184</h3>
          <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <Zap className="w-4 h-4" />
            +12% vs Last Quarter
          </div>
        </Card>
      </div>

      <Card className="bg-gray-900/40 border-gray-800 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h4 className="text-xl font-bold text-white">Global Liquidity Map</h4>
            <p className="text-sm text-gray-500">Real-time settlement flow across major clearing systems</p>
          </div>
          <Button variant="outline" className="border-gray-700 text-gray-400">
            Export Dataset
          </Button>
        </div>
        
        {/* Simulated Map / Flow Diagram */}
        <div className="h-[300px] w-full bg-black/40 rounded-2xl border border-gray-800 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-cyan-500/30 rounded-full animate-[ping_10s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-cyan-500/20 rounded-full animate-[ping_7s_linear_infinite]" />
          </div>
          
          <div className="grid grid-cols-3 gap-20 relative z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center shadow-xl">
                <Globe className="w-8 h-8 text-cyan-400" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">North America</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-600 border border-cyan-400 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Quantum Core</span>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center shadow-xl">
                <Globe className="w-8 h-8 text-blue-400" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">EMEA / APAC</span>
            </div>
          </div>

          {/* Animated Flow Lines */}
          <div className="absolute top-1/2 left-[30%] right-[30%] h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent overflow-hidden">
            <div className="w-20 h-full bg-white shadow-[0_0_10px_#fff] animate-[move_3s_linear_infinite]" />
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAudit = () => (
    <Card className="bg-gray-900/40 border-gray-800 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="bg-black/40 border-b border-gray-800 flex flex-row justify-between items-center">
        <div>
          <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            Immutable Audit Storage
          </CardTitle>
          <p className="text-xs text-gray-500">Every sensitive action is cryptographically logged for compliance.</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-cyan-500 hover:text-cyan-400"
          onClick={() => {
            const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-log-${new Date().getTime()}.json`;
            a.click();
            addToAuditLog('LOG_EXPORTED', 'User exported the audit trail to JSON.');
          }}
        >
          Download Log
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-gray-900 z-10">
              <tr className="border-b border-gray-800">
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Timestamp</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Action</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Details</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">User</th>
                <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-600 italic">No audit entries recorded in this session.</td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 text-[11px] font-mono text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="p-4">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">{log.action}</span>
                    </td>
                    <td className="p-4 text-xs text-gray-500 max-w-xs truncate" title={log.details}>{log.details}</td>
                    <td className="p-4 text-[11px] text-gray-400">{log.user}</td>
                    <td className="p-4">
                      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full w-fit ${
                        log.severity === 'critical' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                        log.severity === 'warning' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          log.severity === 'critical' ? 'bg-red-500' :
                          log.severity === 'warning' ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`} />
                        {log.severity === 'critical' ? 'Alert' : log.severity === 'warning' ? 'Warning' : 'Verified'}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  // --- SECURITY MODAL (POP-UP) ---

  const renderSecurityModal = () => {
    if (!showSecurityModal) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
        <Card className="w-full max-w-md bg-gray-900 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
          <CardHeader className="text-center pt-8">
            <div className="mx-auto w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-4 border border-cyan-500/30">
              <UserCheck className="w-8 h-8 text-cyan-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Security Verification</CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              A high-value settlement instruction update has been detected. Please enter your 6-digit MFA code to proceed.
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="space-y-6">
              <div className="flex justify-center gap-2">
                <Input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="000000"
                  className="text-center text-3xl tracking-[0.5em] font-mono h-16 bg-black border-gray-700 text-cyan-400 focus:border-cyan-500"
                />
              </div>
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-[11px] text-amber-200/70 leading-relaxed">
                  <span className="font-bold text-amber-500">DEMO MODE:</span> Use code <span className="text-white font-mono">123456</span> to authorize this transaction.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-black/40 p-6 flex gap-3">
            <Button 
              variant="ghost" 
              className="flex-1 text-gray-400 hover:text-white"
              onClick={() => {
                setShowSecurityModal(false);
                setEngineStatus('IDLE');
                addToAuditLog('SECURITY_ABORTED', 'User cancelled MFA challenge.');
              }}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white"
              onClick={confirmFinalSubmit}
              disabled={isSubmitting || mfaCode.length < 6}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : 'Authorize Update'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  // ================================================================================================
  // FINAL RENDER
  // ================================================================================================

  return (
    <div className="min-h-screen bg-[#05070a] text-gray-100 p-4 md:p-8 font-sans selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto">
        
        {renderHeader()}
        {renderTabs()}

        <main className="relative">
          {activeTab === 'form' && renderForm()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'audit' && renderAudit()}
        </main>

        {renderSecurityModal()}

        {/* Footer Branding */}
        <footer className="mt-12 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">
              Quantum Financial Systems © 2024 | Secure Node: {Math.random().toString(16).substr(2, 8).toUpperCase()}
            </span>
          </div>
          <div className="flex gap-6">
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest cursor-pointer hover:text-cyan-500 transition-colors">Terms of Sovereignty</span>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest cursor-pointer hover:text-cyan-500 transition-colors">Privacy Protocol</span>
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest cursor-pointer hover:text-cyan-500 transition-colors">API Documentation</span>
          </div>
        </footer>
      </div>

      {/* Global Styles for Custom Scrollbar & Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
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
          background: #0891b2;
        }
        @keyframes move {
          from { transform: translateX(-100%); }
          to { transform: translateX(500%); }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
      `}} />
    </div>
  );
};

export default SsiEditorForm;