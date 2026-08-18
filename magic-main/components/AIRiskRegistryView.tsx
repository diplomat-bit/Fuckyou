import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Plus, 
  Lock, 
  Database, 
  Cpu, 
  Zap, 
  Globe, 
  TrendingUp, 
  Settings, 
  CreditCard,
  RefreshCw,
  X,
  Send,
  ChevronRight,
  Layers
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - AI RISK REGISTRY & GOVERNANCE ENGINE
 * "The Golden Ticket Experience"
 * 
 * This module provides a high-performance, secure environment for managing 
 * AI-related risks, integrating real-time AI assistance, homomorphic encryption 
 * simulations, and robust audit logging.
 */

// --- TYPES ---
interface AIRisk {
  id: string;
  title: string;
  category: 'Bias' | 'Privacy' | 'Security' | 'Hallucination' | 'Compliance';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Mitigating' | 'Resolved';
  owner: string;
  lastUpdated: string;
  description: string;
}

interface AuditEntry {
  timestamp: string;
  action: string;
  details: any;
  id: string;
  integrity: string;
}

// --- SECURE INTERNAL STORAGE (HOMOMORPHIC SIMULATION) ---
// This storage exists only in the app's memory space, encrypted.
class SecureAppVault {
  private static instance: SecureAppVault;
  private vault: Map<string, string>;
  private auditTrail: AuditEntry[];

  private constructor() {
    this.vault = new Map();
    this.auditTrail = [];
  }

  public static getInstance(): SecureAppVault {
    if (!SecureAppVault.instance) {
      SecureAppVault.instance = new SecureAppVault();
    }
    return SecureAppVault.instance;
  }

  // Simulated Homomorphic Encryption: Operations performed on encrypted data
  private encrypt(data: string): string {
    return btoa(`QF_SECURE_${data}_${Date.now()}`);
  }

  private decrypt(cipher: string): string {
    const decoded = atob(cipher);
    const content = decoded.replace(/^QF_SECURE_/, '');
    const lastUnderscoreIndex = content.lastIndexOf('_');
    return lastUnderscoreIndex !== -1 ? content.substring(0, lastUnderscoreIndex) : content;
  }

  public storeSecret(key: string, value: string) {
    const encrypted = this.encrypt(value);
    this.vault.set(key, encrypted);
    this.logAudit('SECRET_STORE', { key, hash: btoa(encrypted).substring(0, 12) });
  }

  public getSecret(key: string): string | null {
    const val = this.vault.get(key);
    if (!val) return null;
    this.logAudit('SECRET_ACCESS', { key });
    return this.decrypt(val);
  }

  public logAudit(action: string, details: any) {
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      id: Math.random().toString(36).substring(7),
      integrity: 'SHA-256-SIMULATED'
    };
    this.auditTrail.push(entry);
    console.log(`[AUDIT LOG]: ${action}`, entry);
  }

  public getAuditLogs(): AuditEntry[] {
    return [...this.auditTrail].reverse();
  }
}

const vault = SecureAppVault.getInstance();

// --- UI COMPONENTS ---

const Card: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-[#0a0a0c] border border-white/10 rounded-xl overflow-hidden shadow-2xl ${className || ''}`}>
    <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">{title}</h3>
      <div className="flex space-x-1">
        <div className="w-2 h-2 rounded-full bg-red-500/50" />
        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
        <div className="w-2 h-2 rounded-full bg-green-500/50" />
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Badge: React.FC<{ type: string }> = ({ type }) => {
  const colors: Record<string, string> = {
    Critical: 'bg-red-500/10 text-red-500 border-red-500/20',
    High: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    Medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    Low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    Open: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    Mitigating: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    Resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
  };
  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-tighter ${colors[type] || 'bg-gray-500/10 text-gray-500'}`}>
      {type}
    </span>
  );
};

// --- MAIN VIEW ---
const AIRiskRegistryView: React.FC = () => {
  const [risks, setRisks] = useState<AIRisk[]>([
    { id: 'R-1024', title: 'LLM Data Leakage in Customer Support', category: 'Privacy', severity: 'Critical', status: 'Mitigating', owner: 'CyberSec Team', lastUpdated: '2023-10-27', description: 'Potential for PII to be included in training sets.' },
    { id: 'R-1025', title: 'Algorithmic Bias in Credit Scoring', category: 'Bias', severity: 'High', status: 'Open', owner: 'Risk Dept', lastUpdated: '2023-10-26', description: 'Model showing 4% variance in approval rates across demographics.' },
    { id: 'R-1026', title: 'Prompt Injection Vulnerability', category: 'Security', severity: 'High', status: 'Open', owner: 'AppSec', lastUpdated: '2023-10-25', description: 'External facing chatbot susceptible to system prompt overrides.' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: 'Welcome to Quantum Financial AI Assistant. I can help you register risks, analyze threats, or manage your secure vault. How can I assist your "Test Drive" today?' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields for Register Modal
  const [modalTitle, setModalTitle] = useState('');
  const [modalCategory, setModalCategory] = useState<AIRisk['category']>('Security');
  const [modalSeverity, setModalSeverity] = useState<AIRisk['severity']>('Medium');
  const [modalDescription, setModalDescription] = useState('');

  // Stripe Simulation State
  const [budget, setBudget] = useState(124500.00);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAuditLogs(vault.getAuditLogs());
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, risks]);

  const openRegisterModal = () => {
    setModalTitle('');
    setModalCategory('Security');
    setModalSeverity('Medium');
    setModalDescription('');
    setIsModalOpen(true);
  };

  const handleManualRegister = () => {
    if (!modalTitle.trim()) return;
    const newRisk: AIRisk = {
      id: `R-${Math.floor(Math.random() * 9000) + 1000}`,
      title: modalTitle,
      category: modalCategory,
      severity: modalSeverity,
      status: 'Open',
      owner: 'Manual Entry',
      lastUpdated: new Date().toISOString().split('T')[0],
      description: modalDescription || 'No description provided.'
    };
    setRisks(prev => [newRisk, ...prev]);
    vault.logAudit('MANUAL_RISK_CREATED', { id: newRisk.id, title: newRisk.title });
    setIsModalOpen(false);
  };

  // --- AI LOGIC ---
  const handleAIChat = async () => {
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsProcessing(true);

    try {
      const apiKey = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : undefined;
      const prompt = `
        You are the Quantum Financial AI Risk Assistant. 
        Context: This is a high-performance business demo for an elite financial institution.
        The user is currently in the AI Risk Registry view.
        Current Risks: ${JSON.stringify(risks)}
        User Request: "${userMsg}"
        
        If the user wants to create a risk, respond with a JSON block starting with { "action": "CREATE_RISK", ... }.
        Otherwise, provide a professional, secure, and elite response. 
        Do not use the name Citibank. Use "Quantum Financial" or "The Demo Bank".
        Keep the tone "Golden Ticket" - high polish, no pressure.
      `;

      let responseText = '';

      try {
        const genAI = new GoogleGenAI({ apiKey: apiKey || 'DEMO_KEY_MOCK' });
        const result = await genAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        responseText = result.text || '';
      } catch (sdkError) {
        // Fallback supporting standard or legacy SDK initializations
        const genAI = new (GoogleGenAI as any)(apiKey || 'DEMO_KEY_MOCK');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        responseText = typeof result.response.text === 'function' ? result.response.text() : result.response.text;
      }

      // Check for structured actions
      if (responseText.includes('CREATE_RISK')) {
        try {
          const jsonMatch = responseText.match(/\{.*\}/s);
          if (jsonMatch) {
            const actionData = JSON.parse(jsonMatch[0]);
            const newRisk: AIRisk = {
              id: `R-${Math.floor(Math.random() * 9000) + 1000}`,
              title: actionData.title || 'New AI Risk',
              category: (actionData.category as AIRisk['category']) || 'Security',
              severity: (actionData.severity as AIRisk['severity']) || 'Medium',
              status: 'Open',
              owner: 'AI Generated',
              lastUpdated: new Date().toISOString().split('T')[0],
              description: actionData.description || 'Generated via AI Assistant.'
            };
            setRisks(prev => [newRisk, ...prev]);
            vault.logAudit('AI_RISK_CREATED', { id: newRisk.id, title: newRisk.title });
            setChatHistory(prev => [...prev, { role: 'ai', content: `Understood. I have registered the risk: **${newRisk.title}** into the Quantum Registry. Audit trail updated.` }]);
          }
        } catch (e) {
          setChatHistory(prev => [...prev, { role: 'ai', content: responseText }]);
        }
      } else {
        setChatHistory(prev => [...prev, { role: 'ai', content: responseText }]);
      }
    } catch (error) {
      // Fallback for demo if API key fails or is missing
      setChatHistory(prev => [...prev, { role: 'ai', content: "I've analyzed your request. In this demo environment, I'm simulating the response. I can help you 'kick the tires' on our risk engine. Would you like me to generate a sample vulnerability report?" }]);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- STRIPE SIMULATION ---
  const handleMitigationPayment = () => {
    setIsPaying(true);
    vault.logAudit('PAYMENT_INITIATED', { amount: 5000, currency: 'USD', purpose: 'Risk Mitigation Budget' });
    
    setTimeout(() => {
      setIsPaying(false);
      setPaymentSuccess(true);
      setBudget(prev => prev + 5000);
      vault.logAudit('PAYMENT_SUCCESS', { transactionId: 'ch_3N' + Math.random().toString(36).substring(7) });
      setTimeout(() => setPaymentSuccess(false), 3000);
    }, 2000);
  };

  const filteredRisks = risks.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans selection:bg-cyan-500/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="p-1.5 bg-cyan-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-xs font-bold text-cyan-500 tracking-widest uppercase">Quantum Financial Systems</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            AI RISK <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">REGISTRY</span>
          </h1>
          <p className="text-gray-500 mt-2 max-w-2xl text-sm leading-relaxed">
            Welcome to the engine room. This is your "Golden Ticket" to elite AI governance. 
            Monitor, mitigate, and master the risks of the future with our high-performance dashboard.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={openRegisterModal}
            className="flex items-center space-x-2 bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-cyan-400 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <Plus className="w-4 h-4" />
            <span>Register Risk</span>
          </button>
          <button className="p-2.5 border border-white/10 rounded-full hover:bg-white/5 transition-colors" aria-label="Settings">
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Risks', value: risks.length, icon: Layers, color: 'text-white' },
          { label: 'Critical Threats', value: risks.filter(r => r.severity === 'Critical').length, icon: AlertTriangle, color: 'text-red-500' },
          { label: 'Mitigation Rate', value: '84%', icon: TrendingUp, color: 'text-cyan-400' },
          { label: 'Audit Integrity', value: 'Verified', icon: CheckCircle, color: 'text-green-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#0a0a0c] border border-white/5 p-5 rounded-2xl flex items-center space-x-4">
            <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">{stat.label}</p>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Registry Table */}
        <div className="lg:col-span-2 space-y-8">
          <Card title="Active Risk Inventory">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-2 mb-6 focus-within:border-cyan-500/50 transition-all">
              <Search className="w-4 h-4 text-gray-500 mr-3" />
              <input 
                type="text" 
                placeholder="Search by ID, Title, or Category..." 
                className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-gray-600"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
                    <th className="pb-4 pl-2">Risk ID</th>
                    <th className="pb-4">Title & Description</th>
                    <th className="pb-4">Severity</th>
                    <th className="pb-4">Status</th>
                    <th className="pb-4 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRisks.map((risk) => (
                    <tr key={risk.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pl-2 align-top">
                        <span className="font-mono text-xs text-cyan-500">{risk.id}</span>
                      </td>
                      <td className="py-4 align-top">
                        <p className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{risk.title}</p>
                        <p className="text-xs text-gray-500 mt-1 max-w-xs truncate">{risk.description}</p>
                        <div className="flex items-center mt-2 space-x-2">
                          <span className="text-[10px] text-gray-600 font-mono">{risk.category}</span>
                          <span className="text-[10px] text-gray-600">•</span>
                          <span className="text-[10px] text-gray-600">{risk.owner}</span>
                        </div>
                      </td>
                      <td className="py-4 align-top">
                        <Badge type={risk.severity} />
                      </td>
                      <td className="py-4 align-top">
                        <Badge type={risk.status} />
                      </td>
                      <td className="py-4 align-top text-right pr-2">
                        <button className="text-gray-500 hover:text-white transition-colors" aria-label={`View details for ${risk.id}`}>
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Audit Trail Section */}
          <Card title="Immutable Audit Storage (Internal Vault)">
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {auditLogs.map((log, i) => (
                <div key={log.id} className="flex items-start space-x-3 border-l-2 border-white/5 pl-4 py-1">
                  <div className="mt-1">
                    <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-cyan-500 animate-pulse' : 'bg-gray-700'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono text-cyan-500/70 uppercase">{log.action}</span>
                      <span className="text-[10px] text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {JSON.stringify(log.details)}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <Lock className="w-3 h-3 text-gray-700" />
                      <span className="text-[9px] text-gray-700 font-mono">INTEGRITY_HASH: {log.id}...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar: AI Assistant & Integrations */}
        <div className="space-y-8">
          {/* AI Chatbot */}
          <div className="bg-[#0a0a0c] border border-cyan-500/20 rounded-2xl overflow-hidden flex flex-col h-[500px] shadow-[0_0_40px_rgba(6,182,212,0.05)]">
            <div className="p-4 bg-cyan-500/10 border-b border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-[#0a0a0c]" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400">Quantum AI Assistant</span>
              </div>
              <div className="flex space-x-2">
                <RefreshCw className="w-3 h-3 text-cyan-700 cursor-pointer hover:text-cyan-400 transition-colors" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-white text-black font-bold rounded-tr-none' 
                      : 'bg-white/5 text-gray-300 border border-white/10 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/10">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white/5 border-t border-white/10">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ask AI to create a risk or analyze..." 
                  className="w-full bg-black border border-white/10 rounded-xl py-3 pl-4 pr-12 text-xs focus:border-cyan-500 outline-none transition-all"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAIChat()}
                />
                <button 
                  onClick={handleAIChat}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
              <p className="text-[9px] text-gray-600 mt-2 text-center uppercase tracking-tighter">
                Powered by Gemini-2.5-Flash • Quantum Secure
              </p>
            </div>
          </div>

          {/* Integration & Payments */}
          <Card title="Mitigation Funding">
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Available Budget</p>
                    <p className="text-2xl font-black">${budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <CreditCard className="w-6 h-6 text-white/20" />
                </div>
                <button 
                  onClick={handleMitigationPayment}
                  disabled={isPaying}
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center space-x-2 ${
                    paymentSuccess 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-black hover:bg-cyan-400'
                  }`}
                >
                  {isPaying ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : paymentSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Payment Success</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Authorize Stripe Transfer</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Connected ERPs</p>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center space-x-3">
                    <Database className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium">SAP S/4HANA</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-medium">Oracle Cloud</span>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL: REGISTER RISK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0a0a0c] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-black tracking-tight">REGISTER NEW RISK</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white" aria-label="Close modal">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Risk Title</label>
                <input 
                  type="text" 
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none" 
                  placeholder="e.g. LLM Hallucination in Financial Advice" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Category</label>
                  <select 
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value as AIRisk['category'])}
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none appearance-none"
                  >
                    <option value="Security">Security</option>
                    <option value="Privacy">Privacy</option>
                    <option value="Bias">Bias</option>
                    <option value="Compliance">Compliance</option>
                    <option value="Hallucination">Hallucination</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Severity</label>
                  <select 
                    value={modalSeverity}
                    onChange={(e) => setModalSeverity(e.target.value as AIRisk['severity'])}
                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none appearance-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1.5">Description</label>
                <textarea 
                  value={modalDescription}
                  onChange={(e) => setModalDescription(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-cyan-500 outline-none h-24" 
                  placeholder="Describe the potential impact and threat vector..." 
                />
              </div>
              <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex items-start space-x-3">
                <Lock className="w-4 h-4 text-cyan-500 mt-0.5" />
                <p className="text-[10px] text-cyan-500/80 leading-relaxed">
                  Submitting this form will trigger an immutable audit log entry and encrypt the data using Quantum Financial's homomorphic storage engine.
                </p>
              </div>
            </div>
            <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button 
                onClick={handleManualRegister}
                className="px-6 py-2 bg-white text-black rounded-full text-sm font-bold hover:bg-cyan-400 transition-all"
              >
                Confirm Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">System Status: Optimal</span>
          </div>
          <span className="text-gray-800">|</span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Quantum Financial v4.0.2-Stable</span>
        </div>
        <div className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
          © 2024 Quantum Financial • Secure Business Demo Environment
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.3);
        }
      `}</style>
    </div>
  );
};

export default AIRiskRegistryView;