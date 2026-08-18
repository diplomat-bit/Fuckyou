import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Shield, 
  Zap, 
  Lock, 
  Activity, 
  Database, 
  Cpu, 
  MessageSquare, 
  Send, 
  RefreshCw, 
  Download, 
  Filter, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Globe, 
  BarChart3,
  ChevronRight,
  Search,
  Settings,
  UserCheck,
  FileText,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Terminal
} from 'lucide-react';

/**
 * QUANTUM FINANCIAL - INSTITUTIONAL GRADE SUBSCRIPTION ENGINE
 * 
 * PHILOSOPHY:
 * - "Golden Ticket" Experience: High-polish, elite performance.
 * - "Test Drive": Interactive, no-pressure environment.
 * - "Bells and Whistles": Advanced analytics, AI integration, and security simulations.
 * - "Cheat Sheet": Simplified view of complex business banking.
 * 
 * TECHNICAL ARCHITECTURE:
 * - Robust state management for subscriptions and audit logs.
 * - Integrated Gemini AI for natural language command processing.
 * - Multi-factor authentication (MFA) simulation.
 * - Real-time fraud monitoring simulation.
 * - ERP/Accounting integration hooks.
 */

// ================================================================================================
// TYPE DEFINITIONS
// ================================================================================================

interface SubscriptionItemPrice {
  id: string;
  nickname: string | null;
  unit_amount: number | null; // Amount in cents
  currency: string;
  product: string | { id: string; name: string };
}

interface SubscriptionItem {
  id: string;
  price: SubscriptionItemPrice;
  quantity: number;
}

interface Subscription {
  id: string;
  customer: string | { id: string; name?: string; email?: string };
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'unpaid' | 'incomplete' | 'incomplete_expired' | 'paused' | 'ended';
  created: number;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  trial_start: number | null;
  trial_end: number | null;
  items: {
    data: SubscriptionItem[];
  };
  metadata?: Record<string, string>;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
  ipAddress: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface SubscriptionListProps {
  subscriptions: Subscription[];
  isLoading?: boolean;
  error?: string | null;
}

// ================================================================================================
// CONSTANTS & MOCK DATA
// ================================================================================================

const INSTITUTION_NAME = "Quantum Financial";
const DEMO_USER = "Executive_Admin_Alpha";
const SYSTEM_IP = "192.168.1.104";

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    action: 'SYSTEM_BOOT',
    user: 'SYSTEM',
    details: 'Quantum Financial Subscription Engine initialized.',
    severity: 'info',
    ipAddress: '127.0.0.1'
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    action: 'MFA_VERIFIED',
    user: DEMO_USER,
    details: 'Biometric handshake successful.',
    severity: 'info',
    ipAddress: SYSTEM_IP
  }
];

// ================================================================================================
// HELPER COMPONENTS
// ================================================================================================

const StatusBadge: React.FC<{ status: Subscription['status'] }> = ({ status }) => {
  const config = {
    active: { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: <CheckCircle size={12} /> },
    trialing: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: <Clock size={12} /> },
    canceled: { color: 'bg-rose-500/20 text-rose-400 border-rose-500/30', icon: <Trash2 size={12} /> },
    unpaid: { color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: <AlertTriangle size={12} /> },
    past_due: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: <AlertTriangle size={12} /> },
    paused: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: <Lock size={12} /> },
    default: { color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: <Activity size={12} /> }
  };

  const { color, icon } = config[status] || config.default;

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${color}`}>
      {icon}
      {status.replace(/_/g, ' ')}
    </span>
  );
};

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className, title }) => (
  <div className={`bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between bg-slate-900/20">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <div className="w-1 h-4 bg-cyan-500 rounded-full" />
          {title}
        </h3>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-700" />
          <div className="w-2 h-2 rounded-full bg-slate-700" />
        </div>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

// ================================================================================================
// MAIN COMPONENT
// ================================================================================================

const SubscriptionList: React.FC<SubscriptionListProps> = ({ subscriptions: initialSubscriptions, isLoading: initialLoading, error: initialError }) => {
  // --- State Management ---
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialSubscriptions || []);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: `Welcome to the ${INSTITUTION_NAME} Command Center. I am your Quantum AI Strategist. How can I assist your global operations today?`, timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [mfaStatus, setMfaStatus] = useState<'locked' | 'verifying' | 'unlocked'>('unlocked');
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'security' | 'audit'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- AI Integration ---
  const genAI = useMemo(() => {
    const apiKey = process.env.GEMINI_API_KEY || "";
    return apiKey ? new GoogleGenAI(apiKey) : null;
  }, []);

  // --- Audit Logging Utility ---
  const logAction = useCallback((action: string, details: string, severity: AuditLog['severity'] = 'info') => {
    const newLog: AuditLog = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      user: DEMO_USER,
      details,
      severity,
      ipAddress: SYSTEM_IP
    };
    setAuditLogs(prev => [newLog, ...prev].slice(0, 100));
    console.log(`[AUDIT] ${action}: ${details}`);
  }, []);

  // --- Effects ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (initialSubscriptions) {
      setSubscriptions(initialSubscriptions);
    }
  }, [initialSubscriptions]);

  // --- Handlers ---
  const handleExport = async () => {
    setIsExporting(true);
    logAction('DATA_EXPORT', 'Initiated full subscription ledger export to CSV/JSON.', 'info');
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsExporting(false);
    alert("Ledger exported successfully. Check your secure downloads folder.");
  };

  const handleStatusChange = (id: string, newStatus: Subscription['status']) => {
    setSubscriptions(prev => prev.map(sub => sub.id === id ? { ...sub, status: newStatus } : sub));
    logAction('STATUS_UPDATE', `Subscription ${id} transitioned to ${newStatus}.`, 'warning');
  };

  const handleAiChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim() || isAiThinking) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiThinking(true);

    logAction('AI_QUERY', `User requested: "${chatInput.substring(0, 50)}..."`, 'info');

    try {
      if (!genAI) {
        throw new Error("AI Core not initialized. Check API configuration.");
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are the Quantum Financial AI Strategist. 
        Context: You are managing a high-performance business banking dashboard.
        Current Subscriptions: ${JSON.stringify(subscriptions.map(s => ({ id: s.id, status: s.status, customer: s.customer })))}
        User Instruction: ${chatInput}
        
        Rules:
        1. Be elite, professional, and secure in tone.
        2. If the user wants to "create" or "add" something, describe how you are doing it.
        3. If the user wants to "cancel" or "update", identify the ID.
        4. Do NOT mention Citibank. Use "Quantum Financial".
        5. Keep it concise but high-impact.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setChatMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: text, 
        timestamp: new Date() 
      }]);

      // Simulate "Creating the shit it needs"
      if (chatInput.toLowerCase().includes("add") || chatInput.toLowerCase().includes("create")) {
        const newSub: Subscription = {
          id: `sub_new_${Math.random().toString(36).substr(2, 5)}`,
          customer: { id: 'cust_new', name: 'AI Generated Client', email: 'ai@quantum.financial' },
          status: 'active',
          created: Math.floor(Date.now() / 1000),
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 2592000,
          cancel_at_period_end: false,
          canceled_at: null,
          trial_start: null,
          trial_end: null,
          items: { data: [{ id: 'item_1', quantity: 1, price: { id: 'p_1', nickname: 'AI Premium', unit_amount: 9900, currency: 'usd', product: 'Quantum AI' } }] }
        };
        setSubscriptions(prev => [newSub, ...prev]);
        logAction('AI_AUTO_PROVISION', `AI created new subscription ${newSub.id} based on user intent.`, 'critical');
      }

    } catch (err: any) {
      setChatMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: `System Error: ${err.message}. Please verify your Quantum API credentials.`, 
        timestamp: new Date() 
      }]);
      logAction('AI_ERROR', err.message, 'critical');
    } finally {
      setIsAiThinking(false);
    }
  };

  // --- Filtered Data ---
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const searchStr = searchQuery.toLowerCase();
      const customerName = typeof sub.customer === 'object' ? (sub.customer.name || sub.customer.email || '') : sub.customer;
      return sub.id.toLowerCase().includes(searchStr) || customerName.toLowerCase().includes(searchStr);
    });
  }, [subscriptions, searchQuery]);

  // --- Render Logic ---

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Cpu className="text-cyan-500 animate-pulse" size={32} />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tighter uppercase">Initializing Quantum Core</h2>
          <p className="text-slate-500 font-mono text-xs animate-pulse">Synchronizing global ledgers... Handshaking with DLT nodes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30">
      {/* TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-lg shadow-lg shadow-cyan-500/20">
            <Zap className="text-white fill-white" size={20} />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-white uppercase leading-none">
              {INSTITUTION_NAME} <span className="text-cyan-500">DEMO</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">Institutional Grade Asset Management</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-full border border-slate-800">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Live</span>
          </div>
          <div className="flex items-center gap-3 border-l border-slate-800 pl-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{DEMO_USER}</p>
              <p className="text-[10px] text-slate-500 uppercase">Sovereign Architect</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center text-white font-bold">
              JA
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-8 grid grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: MAIN CONTENT */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* STATS OVERVIEW */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlassCard className="relative group hover:border-cyan-500/50 transition-colors">
              <div className="absolute top-4 right-4 text-cyan-500/20 group-hover:text-cyan-500/40 transition-colors">
                <BarChart3 size={48} />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total ARR</p>
              <h3 className="text-3xl font-black text-white mt-2">$42.8M</h3>
              <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs font-bold">
                <ArrowUpRight size={14} />
                <span>+12.4% vs LY</span>
              </div>
            </GlassCard>
            <GlassCard className="relative group hover:border-blue-500/50 transition-colors">
              <div className="absolute top-4 right-4 text-blue-500/20 group-hover:text-blue-500/40 transition-colors">
                <Globe size={48} />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Nodes</p>
              <h3 className="text-3xl font-black text-white mt-2">{subscriptions.length}</h3>
              <div className="flex items-center gap-1 mt-2 text-blue-400 text-xs font-bold">
                <Activity size={14} />
                <span>Global Distribution</span>
              </div>
            </GlassCard>
            <GlassCard className="relative group hover:border-purple-500/50 transition-colors">
              <div className="absolute top-4 right-4 text-purple-500/20 group-hover:text-purple-500/40 transition-colors">
                <Shield size={48} />
              </div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Risk Score</p>
              <h3 className="text-3xl font-black text-white mt-2">98.2</h3>
              <div className="flex items-center gap-1 mt-2 text-purple-400 text-xs font-bold">
                <Lock size={14} />
                <span>Quantum Encrypted</span>
              </div>
            </GlassCard>
          </div>

          {/* MAIN TABLE SECTION */}
          <GlassCard title="Subscription Ledger" className="min-h-[600px]">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by ID, Customer, or Hash..."
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={handleExport}
                  disabled={isExporting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  {isExporting ? <RefreshCw className="animate-spin" size={18} /> : <Download size={18} />}
                  Export
                </button>
                <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all">
                  <Plus size={18} />
                  New Asset
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-slate-800/60">
                    <th className="pb-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 px-2">Asset ID</th>
                    <th className="pb-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 px-2">Counterparty</th>
                    <th className="pb-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 px-2">Product Matrix</th>
                    <th className="pb-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 px-2">Valuation</th>
                    <th className="pb-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 px-2">Status</th>
                    <th className="pb-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 px-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="group hover:bg-slate-800/20 transition-colors">
                      <td className="py-4 px-2">
                        <div className="flex flex-col">
                          <span className="text-xs font-mono text-cyan-400 font-bold">{sub.id}</span>
                          <span className="text-[10px] text-slate-600 mt-0.5">Created: {new Date(sub.created * 1000).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                            {typeof sub.customer === 'object' ? (sub.customer.name?.[0] || 'U') : 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-200">
                              {typeof sub.customer === 'object' ? sub.customer.name || 'Anonymous Entity' : sub.customer}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {typeof sub.customer === 'object' ? sub.customer.email : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex flex-col gap-1">
                          {sub.items.data.map((item) => (
                            <div key={item.id} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                              <span className="text-xs text-slate-300">
                                {typeof item.price.product === 'object' ? item.price.product.name : item.price.nickname || 'Standard Tier'}
                              </span>
                              <span className="text-[10px] text-slate-600">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-white">
                            {sub.items.data[0]?.price.unit_amount !== null
                              ? `$${((sub.items.data[0].price.unit_amount * (sub.items.data[0].quantity || 1)) / 100).toLocaleString()}`
                              : 'N/A'}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Monthly Recurring</span>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <StatusBadge status={sub.status} />
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleStatusChange(sub.id, sub.status === 'active' ? 'paused' : 'active')}
                            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                            title="Toggle State"
                          >
                            <Settings size={16} />
                          </button>
                          <button 
                            className="p-2 hover:bg-rose-500/20 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                            title="Terminate Link"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredSubscriptions.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-slate-700">
                  <Database size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-400">No Assets Found</h4>
                  <p className="text-sm text-slate-600 max-w-xs mx-auto">The Quantum Ledger returned zero results for your current filter criteria.</p>
                </div>
              </div>
            )}
          </GlassCard>

          {/* AUDIT LOG SECTION */}
          <GlassCard title="Security Audit Trail">
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-3 bg-slate-950/30 border border-slate-800/40 rounded-xl hover:border-slate-700 transition-colors">
                  <div className={`mt-1 p-1.5 rounded-lg ${
                    log.severity === 'critical' ? 'bg-rose-500/20 text-rose-500' : 
                    log.severity === 'warning' ? 'bg-amber-500/20 text-amber-500' : 
                    'bg-cyan-500/20 text-cyan-500'
                  }`}>
                    {log.severity === 'critical' ? <Shield size={14} /> : <Activity size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{log.action}</span>
                      <span className="text-[10px] font-mono text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{log.details}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[9px] text-slate-600 flex items-center gap-1">
                        <UserCheck size={10} /> {log.user}
                      </span>
                      <span className="text-[9px] text-slate-600 flex items-center gap-1">
                        <Globe size={10} /> {log.ipAddress}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: AI & SECURITY */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* AI COMMAND CENTER */}
          <GlassCard className="flex flex-col h-[600px] p-0 overflow-hidden border-cyan-500/30 shadow-cyan-500/5">
            <div className="p-4 border-b border-slate-800 bg-slate-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-cyan-500/40">
                    <Cpu size={20} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tighter">Quantum Strategist</h3>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Neural Link Active</p>
                </div>
              </div>
              <button className="p-2 text-slate-500 hover:text-white transition-colors">
                <Settings size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-950/20">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600 text-white rounded-tr-none shadow-lg shadow-cyan-500/10' 
                      : 'bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-none'
                  }`}>
                    {msg.content}
                    <div className={`text-[9px] mt-2 font-mono ${msg.role === 'user' ? 'text-cyan-200' : 'text-slate-500'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-800/80 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleAiChat} className="p-4 bg-slate-900/40 border-t border-slate-800">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Issue command to Quantum AI..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim() || isAiThinking}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:grayscale"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[9px] text-slate-600 mt-3 text-center uppercase tracking-widest font-bold">
                AI can provision assets and modify ledger states
              </p>
            </form>
          </GlassCard>

          {/* SECURITY PANEL */}
          <GlassCard title="Security Protocol">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500 rounded-lg text-white">
                    <Shield size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Fraud Shield Active</h4>
                    <p className="text-[10px] text-emerald-500 uppercase font-bold">Real-time monitoring</p>
                  </div>
                </div>
                <div className="w-12 h-6 bg-emerald-500/20 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-emerald-500 rounded-full" />
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integration Status</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-2">
                    <Database size={14} className="text-blue-400" />
                    <span className="text-xs font-bold">ERP Sync</span>
                    <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-2">
                    <FileText size={14} className="text-purple-400" />
                    <span className="text-xs font-bold">Tax Engine</span>
                    <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-2">
                    <CreditCard size={14} className="text-amber-400" />
                    <span className="text-xs font-bold">Swift GPI</span>
                    <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-2">
                    <Terminal size={14} className="text-cyan-400" />
                    <span className="text-xs font-bold">API Mesh</span>
                    <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                  <Lock size={16} />
                  Rotate Security Keys
                </button>
              </div>
            </div>
          </GlassCard>

          {/* TEST DRIVE CALLOUT */}
          <div className="p-6 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-cyan-500/10 group-hover:scale-110 transition-transform duration-700">
              <Zap size={120} />
            </div>
            <h4 className="text-lg font-black text-white uppercase tracking-tighter italic">Kick the tires.</h4>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              This is your <span className="text-cyan-400 font-bold">Golden Ticket</span> to the future of finance. 
              Explore the engine, run simulations, and see how {INSTITUTION_NAME} scales with your ambition.
            </p>
            <button className="mt-4 flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest hover:gap-3 transition-all">
              View Documentation <ChevronRight size={14} />
            </button>
          </div>

        </div>
      </main>

      {/* FOOTER / SYSTEM STATUS */}
      <footer className="mt-12 border-t border-slate-800/50 bg-slate-950/50 p-8">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Version</p>
              <p className="text-xs font-mono text-slate-300 mt-1">v4.2.0-QUANTUM-STABLE</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Encryption</p>
              <p className="text-xs font-mono text-slate-300 mt-1">AES-256-GCM-POLY1305</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Latency</p>
              <p className="text-xs font-mono text-emerald-400 mt-1">14ms (Global Edge)</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-bold">
              &copy; 2024 {INSTITUTION_NAME} GLOBAL OPERATIONS. ALL RIGHTS RESERVED.
            </p>
            <p className="text-[9px] text-slate-700 mt-1 italic">
              Confidential Institutional Demo - Unauthorized access is strictly logged and reported.
            </p>
          </div>
        </div>
      </footer>

      {/* CUSTOM SCROLLBAR STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}} />
    </div>
  );
};

export default SubscriptionList;