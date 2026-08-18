import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Settings, DollarSign, Activity, TrendingUp, Zap, Server, Shield, Globe, 
  Cpu, BarChart3, ZapIcon, Rocket, Brain, Landmark, Clock, Database, 
  Aperture, Send, ShieldCheck, ShieldAlert, Fingerprint, History, 
  Layers, LayoutDashboard, CreditCard, Wallet, ArrowUpRight, ArrowDownLeft,
  Search, MessageSquare, Bot, Sparkles, Terminal, Lock, Eye, EyeOff,
  FileText, Share2, Download, Filter, Plus, Trash2, CheckCircle2, AlertTriangle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - THE SOVEREIGN COMMAND CENTER
 * 
 * PHILOSOPHY:
 * - This is a "Golden Ticket" experience.
 * - We are letting the user "Test Drive" the car (the code).
 * - It must have "Bells and Whistles" - distinct features, high polish.
 * - It is a "Cheat Sheet" for business banking.
 * - NO PRESSURE environment.
 * - Metaphor: Kick the tires. See the engine roar.
 * 
 * TECHNICAL REQUIREMENTS:
 * - Robust Payment & Collection capabilities (Wire, ACH).
 * - Security is non-negotiable (Multi-factor auth simulations, Fraud monitoring).
 * - Reporting & Analytics (Data visualization).
 * - Integration capabilities (ERP, Accounting).
 * - AUDIT STORAGE: Every sensitive action must be logged.
 */

// ================================================================================================
// TYPE DEFINITIONS & INTERFACES
// ================================================================================================

type PaymentType = 'WIRE' | 'ACH' | 'SWIFT' | 'INTERNAL';
type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'FLAGGED';

interface PaymentOrder {
  id: string;
  recipient: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  amount: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  timestamp: string;
  reference: string;
  initiatedBy: string;
  riskScore: number;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  ipAddress: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  resourceId?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

interface SecurityMetric {
  name: string;
  value: number;
  status: 'SECURE' | 'MONITORING' | 'THREAT_DETECTED';
}

interface BusinessMetric {
  label: string;
  value: number;
  change: number;
  unit: string;
  trend: 'up' | 'down' | 'neutral';
}

// ================================================================================================
// CONSTANTS & MOCK DATA
// ================================================================================================

const CORE_AI_VERSION = "QuantumIntelligence_v9.4.2";
const INSTITUTION_NAME = "Quantum Financial";

const INITIAL_PAYMENTS: PaymentOrder[] = [
  { id: 'TX-9901', recipient: 'Global Logistics Corp', accountNumber: '****8821', routingNumber: '12200024', amount: 450000, currency: 'USD', type: 'WIRE', status: 'COMPLETED', timestamp: new Date(Date.now() - 86400000).toISOString(), reference: 'INV-2024-001', initiatedBy: 'James B. O\'Callaghan', riskScore: 0.02 },
  { id: 'TX-9902', recipient: 'Cloud Infrastructure Ltd', accountNumber: '****4412', routingNumber: '02100002', amount: 125000, currency: 'USD', type: 'ACH', status: 'PROCESSING', timestamp: new Date(Date.now() - 3600000).toISOString(), reference: 'MONTHLY_SUBSCRIPTION', initiatedBy: 'System Auto-Pay', riskScore: 0.01 },
  { id: 'TX-9903', recipient: 'Unknown Entity X', accountNumber: '****0000', swiftCode: 'UNKNUS33', amount: 2500000, currency: 'USD', type: 'SWIFT', status: 'FLAGGED', timestamp: new Date().toISOString(), reference: 'URGENT_TRANSFER', initiatedBy: 'External API', riskScore: 0.89 },
];

const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  { id: 'LOG-001', timestamp: new Date(Date.now() - 172800000).toISOString(), action: 'USER_LOGIN', actor: 'James B. O\'Callaghan', details: 'Successful login via Biometric MFA', ipAddress: '192.168.1.105', severity: 'INFO' },
  { id: 'LOG-002', timestamp: new Date(Date.now() - 86400000).toISOString(), action: 'WIRE_INITIATED', actor: 'James B. O\'Callaghan', details: 'Wire transfer of $450,000 to Global Logistics Corp', ipAddress: '192.168.1.105', severity: 'INFO', resourceId: 'TX-9901' },
  { id: 'LOG-003', timestamp: new Date().toISOString(), action: 'SECURITY_ALERT', actor: 'Quantum Sentinel', details: 'High-risk SWIFT transfer detected and quarantined', ipAddress: 'Internal AI', severity: 'CRITICAL', resourceId: 'TX-9903' },
];

const CHART_COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

// ================================================================================================
// HELPER COMPONENTS
// ================================================================================================

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; title?: string; icon?: React.ReactNode }> = ({ children, className = "", title, icon }) => (
  <div className={`bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-cyan-500/30 ${className}`}>
    {(title || icon) && (
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/40">
        <div className="flex items-center space-x-3">
          {icon && <div className="text-cyan-400">{icon}</div>}
          {title && <h3 className="text-sm font-bold uppercase tracking-widest text-gray-300">{title}</h3>}
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 rounded-full bg-gray-700"></div>
          <div className="w-2 h-2 rounded-full bg-gray-700"></div>
          <div className="w-2 h-2 rounded-full bg-gray-700"></div>
        </div>
      </div>
    )}
    <div className="p-6">
      {children}
    </div>
  </div>
);

const StatWidget: React.FC<BusinessMetric & { icon: React.ReactNode }> = ({ label, value, change, unit, trend, icon }) => (
  <div className="p-5 rounded-2xl bg-gray-900/40 border border-gray-800 hover:bg-gray-800/40 transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 rounded-xl bg-gray-800 text-cyan-400 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className={`flex items-center space-x-1 text-xs font-bold ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
        <span>{change}%</span>
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline space-x-1">
        <h4 className="text-2xl font-bold text-white">
          {unit === '$' && '$'}
          {value.toLocaleString()}
          {unit !== '$' && unit}
        </h4>
      </div>
    </div>
  </div>
);

// ================================================================================================
// MAIN DASHBOARD COMPONENT
// ================================================================================================

const NationalMetricsDashboard: React.FC = () => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'security' | 'audit'>('overview');
  const [payments, setPayments] = useState<PaymentOrder[]>(INITIAL_PAYMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>(INITIAL_AUDIT_LOGS);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: "Welcome to the Quantum Financial Command Center. I am your Sovereign AI co-pilot. How can I assist with your global treasury operations today?", timestamp: new Date().toISOString() }
  ]);
  const [userInput, setUserInput] = useState("");
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [mfaCode, setMfaCode] = useState("");
  
  // --- Refs ---
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [chatHistory]);

  // --- AI Logic ---
  const genAI = useMemo(() => {
    const apiKey = process.env.GEMINI_API_KEY || "DEMO_MODE";
    return new GoogleGenAI(apiKey);
  }, []);

  const logAction = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'INFO', resourceId?: string) => {
    const newEntry: AuditEntry = {
      id: `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      action,
      actor: "James B. O'Callaghan",
      details,
      ipAddress: "192.168.1.105",
      severity,
      resourceId
    };
    setAuditLogs(prev => [newEntry, ...prev]);
    console.log(`[AUDIT STORAGE] ${action}: ${details}`);
  }, []);

  const handleAiCommand = async (input: string) => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date().toISOString() };
    setChatHistory(prev => [...prev, userMsg]);
    setUserInput("");
    setIsAiLoading(true);

    try {
      // Simulated Intent Parsing for the "Test Drive" experience
      const lowerInput = input.toLowerCase();
      
      if (lowerInput.includes("send") || lowerInput.includes("wire") || lowerInput.includes("pay")) {
        // Simulate a payment creation intent
        const amountMatch = input.match(/\d+/);
        const amount = amountMatch ? parseInt(amountMatch[0]) : 50000;
        
        setTimeout(() => {
          const aiMsg: ChatMessage = { 
            id: (Date.now() + 1).toString(), 
            role: 'assistant', 
            content: `I've prepared a draft WIRE transfer for $${amount.toLocaleString()} to the requested recipient. For security, please authorize this action in the Payments tab or via the MFA prompt I'm about to trigger.`, 
            timestamp: new Date().toISOString() 
          };
          setChatHistory(prev => [...prev, aiMsg]);
          setIsAiLoading(false);
          
          // Trigger MFA for the "Bells and Whistles"
          setPendingAction({ type: 'CREATE_PAYMENT', amount, recipient: 'AI Requested Recipient' });
          setShowMfaModal(true);
        }, 1500);
        return;
      }

      if (lowerInput.includes("audit") || lowerInput.includes("logs")) {
        setTimeout(() => {
          const aiMsg: ChatMessage = { 
            id: (Date.now() + 1).toString(), 
            role: 'assistant', 
            content: `Retrieving the last 5 high-severity audit entries... System is nominal. No unauthorized access attempts detected in the last 24 hours.`, 
            timestamp: new Date().toISOString() 
          };
          setChatHistory(prev => [...prev, aiMsg]);
          setIsAiLoading(false);
          setActiveTab('audit');
        }, 1000);
        return;
      }

      // Default Gemini Call
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `You are the Quantum Financial Sovereign AI. You are helping a high-net-worth business user manage a global bank demo. 
      The user said: "${input}". 
      Context: We are in a "Golden Ticket" demo environment. Be professional, elite, and helpful. 
      Do not mention Citibank. Use "Quantum Financial". 
      Keep it concise and focused on business banking, treasury, and security.`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: text, timestamp: new Date().toISOString() };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (error) {
      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: "I'm currently operating in offline mode due to a synchronization delay, but I can still process local treasury commands. Try asking me to 'Send a wire' or 'Show audit logs'.", timestamp: new Date().toISOString() };
      setChatHistory(prev => [...prev, aiMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const confirmMfa = () => {
    if (mfaCode === "123456" || mfaCode === "000000") {
      if (pendingAction?.type === 'CREATE_PAYMENT') {
        const newPayment: PaymentOrder = {
          id: `TX-${Math.floor(Math.random() * 9000) + 1000}`,
          recipient: pendingAction.recipient,
          accountNumber: '****9999',
          amount: pendingAction.amount,
          currency: 'USD',
          type: 'WIRE',
          status: 'AUTHORIZED',
          timestamp: new Date().toISOString(),
          reference: 'AI_GENERATED_REF',
          initiatedBy: "James B. O'Callaghan (via AI)",
          riskScore: 0.05
        };
        setPayments(prev => [newPayment, ...prev]);
        logAction('WIRE_AUTHORIZED', `Authorized $${pendingAction.amount} wire to ${pendingAction.recipient}`, 'INFO', newPayment.id);
      }
      setShowMfaModal(false);
      setMfaCode("");
      setPendingAction(null);
    } else {
      alert("Invalid MFA Code. In this demo, use 123456.");
    }
  };

  // --- Render Helpers ---

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatWidget label="Total Liquidity" value={42500000} change={12.5} unit="$" trend="up" icon={<Wallet size={24} />} />
        <StatWidget label="Pending Outbound" value={125000} change={2.1} unit="$" trend="down" icon={<ArrowUpRight size={24} />} />
        <StatWidget label="Security Score" value={98} change={0.5} unit="%" trend="up" icon={<ShieldCheck size={24} />} />
        <StatWidget label="Active Entities" value={14} change={0} unit="" trend="neutral" icon={<Globe size={24} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard title="Cash Flow Projection" icon={<Activity size={18} />} className="lg:col-span-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Mon', inflow: 4000, outflow: 2400 },
                { name: 'Tue', inflow: 3000, outflow: 1398 },
                { name: 'Wed', inflow: 2000, outflow: 9800 },
                { name: 'Thu', inflow: 2780, outflow: 3908 },
                { name: 'Fri', inflow: 1890, outflow: 4800 },
                { name: 'Sat', inflow: 2390, outflow: 3800 },
                { name: 'Sun', inflow: 3490, outflow: 4300 },
              ]}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="inflow" stroke="#06b6d4" fillOpacity={1} fill="url(#colorIn)" strokeWidth={3} />
                <Area type="monotone" dataKey="outflow" stroke="#8b5cf6" fillOpacity={0} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard title="Asset Allocation" icon={<Layers size={18} />}>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Operating', value: 45 },
                    { name: 'Reserve', value: 25 },
                    { name: 'Investment', value: 20 },
                    { name: 'Crypto', value: 10 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {CHART_COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Global Payment Engine</h2>
        <button 
          onClick={() => {
            setPendingAction({ type: 'CREATE_PAYMENT', amount: 0, recipient: '' });
            setShowMfaModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-cyan-900/20"
        >
          <Plus size={18} />
          <span>New Transfer</span>
        </button>
      </div>

      <GlassCard className="!p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-widest">
              <th className="px-6 py-4 font-semibold">Recipient / Ref</th>
              <th className="px-6 py-4 font-semibold">Type</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold">Risk</th>
              <th className="px-6 py-4 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {payments.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-white">{tx.recipient}</div>
                  <div className="text-xs text-gray-500">{tx.reference}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded bg-gray-800 text-[10px] font-bold text-gray-300">{tx.type}</span>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-white">
                  ${tx.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      tx.status === 'COMPLETED' ? 'bg-emerald-500' : 
                      tx.status === 'FLAGGED' ? 'bg-rose-500 animate-pulse' : 
                      'bg-amber-500'
                    }`} />
                    <span className="text-xs font-medium text-gray-300">{tx.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${tx.riskScore > 0.5 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                      style={{ width: `${tx.riskScore * 100}%` }}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {new Date(tx.timestamp).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );

  const renderAudit = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Immutable Audit Vault</h2>
        <div className="flex space-x-2">
          <button className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors">
            <Download size={18} />
          </button>
          <button className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {auditLogs.map((log) => (
          <div key={log.id} className="p-4 bg-gray-900/40 border border-gray-800 rounded-xl flex items-start space-x-4 hover:border-gray-700 transition-all">
            <div className={`p-2 rounded-lg ${
              log.severity === 'CRITICAL' ? 'bg-rose-900/20 text-rose-500' : 
              log.severity === 'WARNING' ? 'bg-amber-900/20 text-amber-500' : 
              'bg-cyan-900/20 text-cyan-500'
            }`}>
              {log.severity === 'CRITICAL' ? <ShieldAlert size={20} /> : <History size={20} />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-gray-200">{log.action}</h4>
                <span className="text-[10px] font-mono text-gray-500">{log.timestamp}</span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{log.details}</p>
              <div className="flex items-center space-x-4 mt-2 text-[10px] text-gray-600 font-medium uppercase tracking-tighter">
                <span>Actor: {log.actor}</span>
                <span>IP: {log.ipAddress}</span>
                {log.resourceId && <span>Ref: {log.resourceId}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-300 font-sans selection:bg-cyan-500/30">
      {/* --- Background Effects --- */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* --- Sidebar Navigation --- */}
      <aside className="fixed left-0 top-0 bottom-0 w-20 lg:w-64 bg-gray-950 border-r border-gray-800 z-50 flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Aperture className="text-white animate-spin-slow" size={24} />
          </div>
          <span className="hidden lg:block text-xl font-black tracking-tighter text-white uppercase italic">Quantum</span>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {[
            { id: 'overview', label: 'Command Center', icon: <LayoutDashboard size={20} /> },
            { id: 'payments', label: 'Payment Engine', icon: <CreditCard size={20} /> },
            { id: 'security', label: 'Security Vault', icon: <Shield size={20} /> },
            { id: 'audit', label: 'Audit Storage', icon: <Database size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                activeTab === item.id ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-gray-500 hover:bg-gray-900 hover:text-gray-300'
              }`}
            >
              <div className={activeTab === item.id ? 'text-white' : 'group-hover:text-cyan-400 transition-colors'}>
                {item.icon}
              </div>
              <span className="hidden lg:block font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-800">
          <div className="flex items-center space-x-3 p-2 rounded-xl bg-gray-900/50 border border-gray-800">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-cyan-400">
              <Fingerprint size={18} />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-xs font-bold text-white truncate">James B. O'Callaghan</p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Sovereign Architect</p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="pl-20 lg:pl-64 pt-24 pb-12 px-8 min-h-screen relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-20 lg:left-64 right-0 h-20 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-bold text-white capitalize">{activeTab.replace('-', ' ')}</h1>
            <div className="h-4 w-[1px] bg-gray-800"></div>
            <div className="flex items-center space-x-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>System Live: {CORE_AI_VERSION}</span>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input 
                type="text" 
                placeholder="Search transactions, entities..." 
                className="bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500/50 w-64 transition-all"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-white transition-colors relative">
                <Zap size={20} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-cyan-500 rounded-full border-2 border-gray-950"></div>
              </button>
              <button className="p-2 text-gray-400 hover:text-white transition-colors">
                <Settings size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic View Rendering */}
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'payments' && renderPayments()}
          {activeTab === 'audit' && renderAudit()}
          {activeTab === 'security' && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-500 border border-cyan-500/20 shadow-2xl shadow-cyan-500/10">
                <ShieldCheck size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Quantum Shield Active</h2>
                <p className="text-gray-500 max-w-md mx-auto">Your environment is protected by multi-layered biometric encryption and real-time heuristic fraud monitoring.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mt-8">
                <div className="p-6 bg-gray-900/40 border border-gray-800 rounded-2xl">
                  <Fingerprint className="text-cyan-400 mb-4" size={32} />
                  <h4 className="font-bold text-white">Biometric MFA</h4>
                  <p className="text-xs text-gray-500 mt-2">Enforced for all high-value wires and administrative changes.</p>
                </div>
                <div className="p-6 bg-gray-900/40 border border-gray-800 rounded-2xl">
                  <Brain className="text-purple-400 mb-4" size={32} />
                  <h4 className="font-bold text-white">AI Sentinel</h4>
                  <p className="text-xs text-gray-500 mt-2">Heuristic analysis of transaction patterns to prevent zero-day fraud.</p>
                </div>
                <div className="p-6 bg-gray-900/40 border border-gray-800 rounded-2xl">
                  <Lock className="text-emerald-400 mb-4" size={32} />
                  <h4 className="font-bold text-white">Quantum Encryption</h4>
                  <p className="text-xs text-gray-500 mt-2">All data at rest and in transit is secured via post-quantum algorithms.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- Floating AI Chat Bar --- */}
        <div className="fixed bottom-8 right-8 w-96 z-50">
          <GlassCard className="!p-0 shadow-2xl border-cyan-500/20 flex flex-col h-[500px]">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Sovereign AI</h4>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Online & Synchronized</p>
                </div>
              </div>
              <button className="text-gray-500 hover:text-white transition-colors">
                <Sparkles size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600 text-white rounded-tr-none' 
                      : 'bg-gray-800 text-gray-300 rounded-tl-none border border-gray-700'
                  }`}>
                    {msg.content}
                    <div className={`text-[9px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700 flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-gray-900/60 border-t border-gray-800">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleAiCommand(userInput); }}
                className="relative"
              >
                <input 
                  type="text" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask AI to send a wire, check logs..." 
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-all"
                />
                <button 
                  type="submit"
                  disabled={!userInput.trim() || isAiLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400 disabled:text-gray-600 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </GlassCard>
        </div>
      </main>

      {/* --- MFA / Authorization Modal --- */}
      {showMfaModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" onClick={() => setShowMfaModal(false)}></div>
          <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-500 border border-cyan-500/20 mx-auto shadow-xl">
                <Fingerprint size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Authorization Required</h3>
                <p className="text-gray-500 text-sm">
                  {pendingAction?.type === 'CREATE_PAYMENT' 
                    ? `Confirming a WIRE transfer of $${pendingAction.amount.toLocaleString()} to ${pendingAction.recipient}.`
                    : "Please verify your identity to proceed with this administrative action."}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-center space-x-2">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="w-10 h-12 bg-gray-800 border border-gray-700 rounded-lg flex items-center justify-center text-xl font-bold text-white">
                      {mfaCode[i] || ""}
                    </div>
                  ))}
                </div>
                <input 
                  type="text" 
                  maxLength={6}
                  autoFocus
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  className="absolute inset-0 opacity-0 cursor-default"
                />
                <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">Enter 123456 to authorize</p>
              </div>

              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowMfaModal(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmMfa}
                  className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-lg shadow-cyan-900/20"
                >
                  Authorize
                </button>
              </div>
            </div>
            <div className="bg-gray-800/50 p-4 flex items-center justify-center space-x-2 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <Lock size={12} />
              <span>End-to-End Encrypted Session</span>
            </div>
          </div>
        </div>
      )}

      {/* --- Footer / System Status --- */}
      <footer className="pl-20 lg:pl-64 py-6 px-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-widest space-y-4 md:space-y-0">
        <div className="flex items-center space-x-6">
          <span>© 2024 {INSTITUTION_NAME} Global</span>
          <span className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <span>All Systems Operational</span>
          </span>
        </div>
        <div className="flex items-center space-x-6">
          <a href="#" className="hover:text-cyan-500 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-cyan-500 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-cyan-500 transition-colors">Security Disclosure</a>
          <span className="text-gray-800">|</span>
          <span className="text-cyan-900">Sovereign Node: 0x77ALPHA</span>
        </div>
      </footer>

      {/* --- Custom Scrollbar Styles --- */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}} />
    </div>
  );
};

export default NationalMetricsDashboard;