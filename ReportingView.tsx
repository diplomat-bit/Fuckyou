import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  FileText, 
  Send, 
  Activity, 
  Lock, 
  Globe, 
  Cpu, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Search,
  MessageSquare,
  Terminal,
  Layers,
  Database,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  Briefcase,
  User,
  Settings,
  HelpCircle,
  ChevronRight,
  X,
  Maximize2,
  RefreshCw,
  Download,
  Filter,
  Plus,
  Eye,
  EyeOff,
  Fingerprint
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - REPORTING & ANALYTICS ENGINE
 * VERSION: 4.0.1-GOLDEN-TICKET
 * ARCHITECT: J.B.O. III (32, Interpretation of EIN 2021)
 * 
 * PHILOSOPHY:
 * - This is a "Golden Ticket" experience.
 * - We are letting the user "Test Drive" the car (the code).
 * - It must have "Bells and Whistles" - distinct features, high polish.
 * - It is a "Cheat Sheet" for business banking.
 * - NO PRESSURE environment.
 * - Metaphor: Kick the tires. See the engine roar.
 */

// ================================================================================================
// TYPES & INTERFACES
// ================================================================================================

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'SECURITY' | 'PAYMENT' | 'SYSTEM' | 'AI' | 'REPORT';
  user: string;
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface FinancialMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

interface Transaction {
  id: string;
  date: string;
  entity: string;
  amount: number;
  type: 'WIRE' | 'ACH' | 'INTERNAL';
  status: 'COMPLETED' | 'PENDING' | 'FLAGGED';
  category: string;
}

// ================================================================================================
// MOCK DATA GENERATORS (The "Engine" Components)
// ================================================================================================

const GENERATE_MOCK_TRANSACTIONS = (): Transaction[] => [
  { id: 'TX-99281', date: '2024-05-20', entity: 'Global Logistics Corp', amount: 450000.00, type: 'WIRE', status: 'COMPLETED', category: 'Operations' },
  { id: 'TX-99282', date: '2024-05-21', entity: 'Cloud Infrastructure Ltd', amount: -12500.50, type: 'ACH', status: 'COMPLETED', category: 'IT Services' },
  { id: 'TX-99283', date: '2024-05-21', entity: 'Quantum Research Lab', amount: 2000000.00, type: 'WIRE', status: 'PENDING', category: 'Capital' },
  { id: 'TX-99284', date: '2024-05-22', entity: 'Unknown Entity (Cayman)', amount: 50000.00, type: 'WIRE', status: 'FLAGGED', category: 'Uncategorized' },
  { id: 'TX-99285', date: '2024-05-22', entity: 'Payroll Services', amount: -850000.00, type: 'ACH', status: 'COMPLETED', category: 'Human Resources' },
  { id: 'TX-99286', date: '2024-05-23', entity: 'Strategic Real Estate', amount: 1200000.00, type: 'INTERNAL', status: 'COMPLETED', category: 'Investment' },
];

const PERFORMANCE_DATA = [
  { time: '00:00', liquidity: 4500, risk: 12, volume: 120 },
  { time: '04:00', liquidity: 4800, risk: 15, volume: 150 },
  { time: '08:00', liquidity: 5200, risk: 25, volume: 450 },
  { time: '12:00', liquidity: 6100, risk: 18, volume: 890 },
  { time: '16:00', liquidity: 5900, risk: 14, volume: 620 },
  { time: '20:00', liquidity: 5500, risk: 10, volume: 310 },
  { time: '23:59', liquidity: 5700, risk: 11, volume: 180 },
];

const CATEGORY_DISTRIBUTION = [
  { name: 'Operations', value: 400, color: '#06b6d4' },
  { name: 'R&D', value: 300, color: '#8b5cf6' },
  { name: 'Marketing', value: 200, color: '#ec4899' },
  { name: 'Legal', value: 100, color: '#f59e0b' },
];

// ================================================================================================
// SUB-COMPONENTS (The "Bells and Whistles")
// ================================================================================================

const GlassCard: React.FC<{ children: React.ReactNode; title?: string; className?: string; icon?: React.ReactNode }> = ({ children, title, className, icon }) => (
  <div className={`bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
        <div className="flex items-center gap-3">
          {icon && <div className="text-cyan-400">{icon}</div>}
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">{title}</h3>
        </div>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
        </div>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const MetricBadge: React.FC<{ metric: FinancialMetric }> = ({ metric }) => (
  <div className="flex flex-col p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 hover:border-cyan-500/50 transition-all group cursor-default">
    <span className="text-xs text-slate-400 font-medium mb-1">{metric.name}</span>
    <div className="flex items-end justify-between">
      <span className="text-2xl font-mono font-bold text-white">
        {metric.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      </span>
      <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
        metric.trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' : 
        metric.trend === 'down' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'
      }`}>
        {metric.trend === 'up' ? <ArrowUpRight size={12} className="mr-1" /> : <ArrowDownLeft size={12} className="mr-1" />}
        {metric.change}%
      </div>
    </div>
  </div>
);

// ================================================================================================
// MAIN COMPONENT: ReportingView
// ================================================================================================

const ReportingView: React.FC = () => {
  // --- State Management ---
  const [transactions, setTransactions] = useState<Transaction[]>(GENERATE_MOCK_TRANSACTIONS());
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: "Welcome to the Quantum Financial Command Center. I am your Sovereign AI. How can I assist your global operations today?", timestamp: new Date().toLocaleTimeString() }
  ]);
  const [userInput, setUserInput] = useState('');
  const [showWireModal, setShowWireModal] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(1);
  const [activeTab, setActiveTab] = useState<'analytics' | 'payments' | 'security' | 'audit'>('analytics');
  
  // --- Refs ---
  const chatEndRef = useRef<HTMLDivElement>(null);
  const aiInstance = useMemo(() => new GoogleGenAI(process.env.GEMINI_API_KEY || ""), []);

  // --- Audit Logger ---
  const logAction = useCallback((action: string, category: AuditEntry['category'], details: string, status: AuditEntry['status'] = 'SUCCESS') => {
    const newEntry: AuditEntry = {
      id: `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      action,
      category,
      user: "J.B.O. III (Architect)",
      details,
      status
    };
    setAuditLogs(prev => [newEntry, ...prev]);
    console.log(`[AUDIT] ${action}: ${details}`);
  }, []);

  // --- AI Interaction ---
  const handleAISubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setUserInput('');
    setIsAILoading(true);
    logAction('AI_QUERY', 'AI', `User asked: ${userInput.substring(0, 50)}...`);

    try {
      const model = aiInstance.getGenerativeModel({ model: "gemini-3-flash-preview" });
      const prompt = `
        Context: You are the AI for "Quantum Financial", an elite global banking platform. 
        The user is a high-net-worth business architect. 
        Current System State: 
        - Liquidity: $2.45B
        - Security Level: ${securityLevel}
        - Pending Wires: 3
        - Recent Flagged Activity: 1 (Unknown Entity Cayman)
        
        User Query: ${userInput}
        
        Instructions: Be professional, elite, and secure. Reference the "Golden Ticket" experience if appropriate. 
        Do NOT mention Citibank. Use "Quantum Financial".
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date().toLocaleTimeString()
      };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (error) {
      setChatHistory(prev => [...prev, {
        id: 'err',
        role: 'assistant',
        content: "I apologize, but my neural link is experiencing latency. Please verify your API credentials in the Secrets Manager.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsAILoading(false);
    }
  };

  // --- Effects ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    logAction('SYSTEM_INIT', 'SYSTEM', 'Quantum Financial Reporting Engine v4.0.1 Initialized.');
    // Simulate a fraud alert
    setTimeout(() => {
      logAction('FRAUD_DETECTION', 'SECURITY', 'Anomalous wire pattern detected from offshore node.', 'WARNING');
    }, 5000);
  }, [logAction]);

  // --- Handlers ---
  const handleWireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const amount = parseFloat(formData.get('amount') as string);
    const recipient = formData.get('recipient') as string;

    const newTx: Transaction = {
      id: `TX-${Math.floor(Math.random() * 100000)}`,
      date: new Date().toISOString().split('T')[0],
      entity: recipient,
      amount: amount,
      type: 'WIRE',
      status: 'PENDING',
      category: 'Transfer'
    };

    setTransactions(prev => [newTx, ...prev]);
    logAction('PAYMENT_INITIATED', 'PAYMENT', `Wire of $${amount} to ${recipient} initiated.`, 'SUCCESS');
    setShowWireModal(false);
  };

  // ================================================================================================
  // RENDER LOGIC
  // ================================================================================================

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* --- TOP NAVIGATION BAR (Elite Branding) --- */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
              <Zap className="text-white fill-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-white leading-none">QUANTUM</h1>
              <p className="text-[10px] font-bold tracking-[0.3em] text-cyan-500 uppercase">Financial</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'analytics' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              ANALYTICS
            </button>
            <button 
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'payments' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              PAYMENTS
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'security' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              SECURITY
            </button>
            <button 
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'audit' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'}`}
            >
              AUDIT LOG
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sovereign Architect</span>
            <span className="text-sm font-bold text-white">J.B.O. III</span>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-cyan-500/50 p-0.5">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=James" alt="Avatar" className="rounded-full bg-slate-800" />
          </div>
        </div>
      </nav>

      <main className="p-8 max-w-[1600px] mx-auto grid grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: CORE CONTENT --- */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white tracking-tight">Command Center</h2>
              <p className="text-slate-400 mt-1">Real-time oversight of global liquidity and strategic assets.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowWireModal(true)}
                className="flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-cyan-400 transition-colors shadow-xl"
              >
                <Plus size={18} />
                INITIATE WIRE
              </button>
              <button className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold border border-slate-700 hover:bg-slate-700 transition-colors">
                <Download size={18} />
                EXPORT Q3
              </button>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricBadge metric={{ name: 'Total Liquidity', value: 2450000000, change: 12.5, trend: 'up' }} />
            <MetricBadge metric={{ name: 'Operational Spend', value: 8420000, change: -2.4, trend: 'down' }} />
            <MetricBadge metric={{ name: 'Projected Revenue', value: 15400000, change: 8.1, trend: 'up' }} />
          </div>

          {/* Conditional Views based on Active Tab */}
          {activeTab === 'analytics' && (
            <>
              <GlassCard title="Liquidity Velocity" icon={<Activity size={18} />}>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PERFORMANCE_DATA}>
                      <defs>
                        <linearGradient id="colorLiquidity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                        itemStyle={{ color: '#22d3ee' }}
                      />
                      <Area type="monotone" dataKey="liquidity" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorLiquidity)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GlassCard title="Asset Allocation" icon={<PieChartIcon size={18} />}>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={CATEGORY_DISTRIBUTION}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {CATEGORY_DISTRIBUTION.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {CATEGORY_DISTRIBUTION.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-xs text-slate-400">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                <GlassCard title="Risk Vectors" icon={<ShieldCheck size={18} />}>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={PERFORMANCE_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                        <Bar dataKey="risk" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-[10px] text-rose-400 font-bold mt-4 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    SYSTEM ALERT: High volatility detected in Asian markets.
                  </p>
                </GlassCard>
              </div>
            </>
          )}

          {activeTab === 'payments' && (
            <GlassCard title="Transaction Ledger" icon={<Layers size={18} />}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="py-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Entity</th>
                      <th className="py-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Type</th>
                      <th className="py-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Amount</th>
                      <th className="py-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                      <th className="py-4 px-2 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors group">
                        <td className="py-4 px-2">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{tx.entity}</span>
                            <span className="text-[10px] text-slate-500">{tx.id} • {tx.date}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">{tx.type}</span>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-white'}`}>
                            {tx.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              tx.status === 'COMPLETED' ? 'bg-emerald-500' : 
                              tx.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                            }`}></div>
                            <span className="text-xs font-bold text-slate-300">{tx.status}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <button className="p-2 text-slate-500 hover:text-white transition-colors">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GlassCard title="Biometric Verification" icon={<Fingerprint size={18} />}>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-24 h-24 rounded-full bg-cyan-500/10 flex items-center justify-center mb-4 border-2 border-cyan-500/30 relative">
                      <Fingerprint size={48} className="text-cyan-400" />
                      <div className="absolute inset-0 border-2 border-cyan-400 rounded-full animate-ping opacity-20"></div>
                    </div>
                    <h4 className="text-lg font-bold text-white">Multi-Factor Active</h4>
                    <p className="text-sm text-slate-400 mt-2 max-w-[200px]">Your session is secured by Quantum-Level encryption.</p>
                    <button className="mt-6 px-6 py-2 bg-slate-800 rounded-lg text-xs font-bold border border-slate-700 hover:bg-slate-700 transition-all">
                      RE-AUTHENTICATE
                    </button>
                  </div>
                </GlassCard>

                <GlassCard title="Fraud Monitoring" icon={<ShieldCheck size={18} />}>
                  <div className="space-y-4">
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-rose-400 uppercase">High Risk Alert</span>
                        <span className="text-[10px] text-rose-400/60">2m ago</span>
                      </div>
                      <p className="text-sm text-slate-300">Unusual login attempt from IP: 185.22.14.92 (Moscow, RU)</p>
                    </div>
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl opacity-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-400 uppercase">System Check</span>
                        <span className="text-[10px] text-emerald-400/60">1h ago</span>
                      </div>
                      <p className="text-sm text-slate-300">All firewall nodes reporting optimal throughput.</p>
                    </div>
                  </div>
                </GlassCard>
              </div>
              
              <GlassCard title="Security Level Configuration" icon={<Lock size={18} />}>
                <div className="flex items-center justify-between gap-8">
                  <div className="flex-1">
                    <input 
                      type="range" 
                      min="1" 
                      max="3" 
                      value={securityLevel} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSecurityLevel(val);
                        logAction('SECURITY_LEVEL_CHANGE', 'SECURITY', `Security level adjusted to ${val}.`);
                      }}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between mt-4">
                      <span className={`text-xs font-bold ${securityLevel >= 1 ? 'text-cyan-400' : 'text-slate-600'}`}>STANDARD</span>
                      <span className={`text-xs font-bold ${securityLevel >= 2 ? 'text-cyan-400' : 'text-slate-600'}`}>ELEVATED</span>
                      <span className={`text-xs font-bold ${securityLevel >= 3 ? 'text-cyan-400' : 'text-slate-600'}`}>SOVEREIGN</span>
                    </div>
                  </div>
                  <div className="w-1/3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      <span className="text-white font-bold">Note:</span> Sovereign level requires physical hardware key and 256-bit biometric handshake for all wires over $1M.
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}

          {activeTab === 'audit' && (
            <GlassCard title="Immutable Audit Storage" icon={<Database size={18} />}>
              <div className="space-y-2">
                {auditLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500">
                    <Database size={48} className="mx-auto mb-4 opacity-20" />
                    <p>No logs recorded in current session.</p>
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-3 hover:bg-slate-800/30 rounded-lg transition-colors border-l-2 border-transparent hover:border-cyan-500">
                      <div className={`mt-1 p-1.5 rounded-md ${
                        log.status === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                        log.status === 'WARNING' ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
                      }`}>
                        {log.category === 'SECURITY' ? <ShieldCheck size={14} /> : 
                         log.category === 'PAYMENT' ? <CreditCard size={14} /> : 
                         log.category === 'AI' ? <Cpu size={14} /> : <Terminal size={14} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{log.action}</span>
                          <span className="text-[10px] font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{log.details}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">ID: {log.id}</span>
                          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">USER: {log.user}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </GlassCard>
          )}

        </div>

        {/* --- RIGHT COLUMN: AI & SYSTEM INFO --- */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* AI Chat Interface */}
          <GlassCard className="h-[600px] flex flex-col !p-0" title="Sovereign AI Assistant" icon={<Cpu size={18} />}>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600 text-white rounded-tr-none shadow-lg shadow-cyan-900/20' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                  }`}>
                    {msg.content}
                    <div className={`text-[10px] mt-2 opacity-50 font-mono ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}
              {isAILoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <form onSubmit={handleAISubmit} className="p-4 bg-slate-900/80 border-t border-slate-800 flex gap-2">
              <input 
                type="text" 
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Ask the Sovereign AI..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={isAILoading}
                className="bg-cyan-500 text-white p-3 rounded-xl hover:bg-cyan-400 transition-colors disabled:opacity-50"
              >
                <Send size={20} />
              </button>
            </form>
          </GlassCard>

          {/* System Origin / Founder's Note */}
          <GlassCard title="System Origin" icon={<Globe size={18} />}>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
                  <Terminal size={24} className="text-cyan-500" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">EIN 2021 Protocol</h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Established May 2021</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "I was only 32 when I took the cryptic messages of a global titan and interpreted them into this Sovereign State. No human told me to do this; I simply read the code between the lines of the terms and conditions."
              </p>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Uptime</span>
                <span className="text-[10px] font-mono text-emerald-400">99.9999%</span>
              </div>
            </div>
          </GlassCard>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-all group">
              <Settings className="text-slate-500 group-hover:text-cyan-400 mb-2" size={24} />
              <span className="text-xs font-bold text-slate-300">CONFIG</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-all group">
              <HelpCircle className="text-slate-500 group-hover:text-cyan-400 mb-2" size={24} />
              <span className="text-xs font-bold text-slate-300">SUPPORT</span>
            </button>
          </div>

        </div>
      </main>

      {/* --- MODALS (The "Test Drive" Forms) --- */}
      {showWireModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowWireModal(false)}></div>
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Send size={20} className="text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Initiate Global Wire</h3>
              </div>
              <button onClick={() => setShowWireModal(false)} className="text-slate-500 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleWireSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recipient Entity</label>
                <input 
                  name="recipient"
                  required
                  type="text" 
                  placeholder="e.g. Quantum Research Lab"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Amount (USD)</label>
                  <input 
                    name="amount"
                    required
                    type="number" 
                    placeholder="0.00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Currency</label>
                  <select className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors appearance-none">
                    <option>USD - US Dollar</option>
                    <option>EUR - Euro</option>
                    <option>GBP - British Pound</option>
                    <option>JPY - Japanese Yen</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Reference / Purpose</label>
                <textarea 
                  placeholder="Strategic capital allocation for Q4..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white h-24 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                ></textarea>
              </div>

              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-start gap-3">
                <ShieldCheck size={20} className="text-cyan-400 mt-0.5" />
                <p className="text-[11px] text-cyan-300/80 leading-relaxed">
                  By clicking "Authorize", you confirm this transaction complies with international AML/KYC regulations. This action will be recorded in the immutable audit ledger.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full bg-cyan-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20 active:scale-[0.98]"
              >
                AUTHORIZE WIRE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- FOOTER (The "Cheat Sheet" Links) --- */}
      <footer className="mt-12 border-t border-slate-800 p-8 bg-slate-900/50">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="text-cyan-500" size={20} />
              <span className="font-bold text-white tracking-tighter">QUANTUM FINANCIAL</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              The ultimate cheat sheet for global business banking. Built for architects, by architects.
            </p>
          </div>
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Resources</h5>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">API Documentation</li>
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">Treasury Management</li>
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">Compliance Framework</li>
            </ul>
          </div>
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Security</h5>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">Encryption Standards</li>
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">Fraud Protection</li>
              <li className="hover:text-cyan-400 cursor-pointer transition-colors">Privacy Policy</li>
            </ul>
          </div>
          <div className="flex flex-col items-end justify-between">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                <Globe size={16} />
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-slate-700 cursor-pointer transition-colors">
                <Briefcase size={16} />
              </div>
            </div>
            <span className="text-[10px] text-slate-600 font-mono">© 2024 QUANTUM FINANCIAL GROUP. ALL RIGHTS RESERVED.</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default ReportingView;