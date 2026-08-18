import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Globe, 
  Activity, 
  RefreshCw, 
  AlertTriangle, 
  Briefcase, 
  ShieldCheck, 
  Zap, 
  MessageSquare, 
  Send, 
  Lock, 
  Cpu, 
  BarChart3, 
  Layers, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search,
  Filter,
  Download,
  History,
  Terminal,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  ComposedChart,
  Line
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import Card from './Card';

/**
 * QUANTUM FINANCIAL - GLOBAL TREASURY NEXUS v4.0
 * 
 * PHILOSOPHY: 
 * This is the "Golden Ticket" experience. High-performance, secure, and elite.
 * Designed for the 32-year-old visionary architecting the future of global finance.
 * 
 * FEATURES:
 * - Real-time Liquidity Engine
 * - AI-Powered Treasury Assistant (Gemini 3 Flash)
 * - Multi-Rail Payment Initiation (Wire, ACH, Quantum)
 * - Immutable Audit Storage
 * - Fraud Vector Monitoring
 */

// ================================================================================================
// TYPE DEFINITIONS & INTERFACES
// ================================================================================================

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
}

interface ChatMessage {
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
}

interface FXPosition {
  currency: string;
  amount: number;
  rate: number;
  trend: number;
  volatility: number;
  status: 'stable' | 'volatile' | 'hedged';
}

interface PaymentRequest {
  id: string;
  recipient: string;
  amount: number;
  currency: string;
  method: 'WIRE' | 'ACH' | 'QUANTUM';
  status: 'PENDING' | 'AUTHORIZED' | 'EXECUTED' | 'FLAGGED';
  timestamp: string;
}

// ================================================================================================
// CONSTANTS & MOCK DATA (THE ENGINE ROOM)
// ================================================================================================

const COLORS = ['#06b6d4', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

const INITIAL_FX_POSITIONS: FXPosition[] = [
  { currency: 'USD', amount: 125000000, rate: 1.0, trend: 2.5, volatility: 0.02, status: 'stable' },
  { currency: 'EUR', amount: 45000000, rate: 1.08, trend: -0.5, volatility: 0.05, status: 'hedged' },
  { currency: 'GBP', amount: 21000000, rate: 1.26, trend: 1.2, volatility: 0.08, status: 'stable' },
  { currency: 'JPY', amount: 1500000000, rate: 0.0067, trend: -1.8, volatility: 0.15, status: 'volatile' },
  { currency: 'CHF', amount: 12000000, rate: 1.12, trend: 0.3, volatility: 0.01, status: 'stable' },
  { currency: 'SGD', amount: 8500000, rate: 0.74, trend: 0.8, volatility: 0.03, status: 'stable' },
];

const LIQUIDITY_FORECAST = Array.from({ length: 24 }, (_, i) => ({
  period: `W${i + 1}`,
  inflow: 15000 + Math.random() * 10000,
  outflow: 12000 + Math.random() * 8000,
  reserve: 50000 + (Math.random() * 5000),
  risk: Math.random() * 100
}));

const FRAUD_ALERTS = [
  { id: 'F-992', type: 'Velocity Spike', entity: 'Vendor_X', score: 88, time: '2 mins ago' },
  { id: 'F-993', type: 'Geographic Anomaly', entity: 'Terminal_04', score: 72, time: '15 mins ago' },
];

// ================================================================================================
// HELPER COMPONENTS (THE BELLS & WHISTLES)
// ================================================================================================

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStyles = () => {
    switch (status.toUpperCase()) {
      case 'STABLE': case 'AUTHORIZED': case 'EXECUTED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'VOLATILE': case 'FLAGGED': case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'HEDGED': case 'PENDING': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${getStyles()}`}>
      {status}
    </span>
  );
};

const MetricTile: React.FC<{ 
  label: string; 
  value: string; 
  subValue?: string; 
  trend?: 'up' | 'down'; 
  icon?: React.ReactNode 
}> = ({ label, value, subValue, trend, icon }) => (
  <div className="group bg-gray-900/40 backdrop-blur-xl p-5 rounded-2xl border border-gray-800 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
    <div className="flex justify-between items-start mb-3">
      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{label}</p>
      <div className="text-cyan-400 group-hover:scale-110 transition-transform duration-300">{icon}</div>
    </div>
    <p className="text-3xl font-black text-white tracking-tight">{value}</p>
    {subValue && (
      <div className="flex items-center mt-2">
        <span className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownLeft size={14} className="mr-1" />}
          {subValue}
        </span>
        <span className="text-[10px] text-gray-600 ml-2 font-medium">vs. last cycle</span>
      </div>
    )}
  </div>
);

// ================================================================================================
// MAIN COMPONENT: TREASURY VIEW (THE MONOLITH)
// ================================================================================================

const TreasuryView: React.FC = () => {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState<'overview' | 'fx' | 'payments' | 'audit'>('overview');
  const [fxPositions, setFxPositions] = useState<FXPosition[]>(INITIAL_FX_POSITIONS);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'system', content: 'Quantum Financial AI Core initialized. How can I assist your global strategy today?', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ recipient: '', amount: '', currency: 'USD', method: 'WIRE' });
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- AI Integration (Gemini) ---
  const genAI = useMemo(() => new GoogleGenAI(process.env.GEMINI_API_KEY || ""), []);

  const logAction = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'low') => {
    const newEntry: AuditEntry = {
      id: `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      action,
      user: "J. O'Callaghan III",
      details,
      severity,
      ipAddress: "192.168.1.104 (Encrypted VPN)"
    };
    setAuditLogs(prev => [newEntry, ...prev].slice(0, 100));
  }, []);

  const handleAiQuery = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date().toLocaleTimeString() }]);
    setIsAiThinking(true);
    logAction("AI_QUERY", `User asked: ${userMsg.substring(0, 50)}...`);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      const prompt = `
        You are the Quantum Financial AI Assistant. 
        Context: You are helping a high-net-worth individual/corporate treasurer manage a global bank demo.
        Tone: Elite, professional, secure, high-performance.
        Current Data: Total Liquidity is $245M. FX Positions: ${JSON.stringify(fxPositions)}.
        User Query: ${userMsg}
        Instructions: Provide strategic advice. If the user wants to "create" or "move" money, explain how they can use the "Payments" tab. 
        Do NOT mention Citibank. Refer to the institution as "Quantum Financial".
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'ai', content: text, timestamp: new Date().toLocaleTimeString() }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "I apologize, but my neural link is experiencing high latency. Please try again.", timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const executePayment = () => {
    if (mfaCode !== '123456') {
      logAction("PAYMENT_FAILURE", "Invalid MFA attempt", "high");
      alert("Invalid MFA Code. Security protocol engaged.");
      return;
    }

    logAction("PAYMENT_EXECUTED", `Transfer of ${paymentForm.amount} ${paymentForm.currency} to ${paymentForm.recipient}`, "medium");
    setShowPaymentModal(false);
    setMfaStep(false);
    setMfaCode('');
    alert("Payment successfully broadcast to the DLT network.");
  };

  // --- Effects ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    logAction("SESSION_START", "User accessed Global Treasury Nexus", "low");
  }, [logAction]);

  // --- Calculations ---
  const totalLiquidity = useMemo(() => 
    fxPositions.reduce((acc, curr) => acc + (curr.amount * curr.rate), 0), 
  [fxPositions]);

  // ================================================================================================
  // RENDER LOGIC
  // ================================================================================================

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-300 font-sans selection:bg-cyan-500/30">
      
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="sticky top-0 z-40 bg-[#0a0a0c]/80 backdrop-blur-md border-b border-gray-800/50 px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Cpu className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase">Quantum Financial</h1>
              <p className="text-[10px] text-cyan-500 font-bold tracking-[0.2em] uppercase">Global Treasury Nexus</p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-gray-900/50 p-1 rounded-xl border border-gray-800">
            {(['overview', 'fx', 'payments', 'audit'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Liquidity (USD)</p>
              <p className="text-xl font-black text-white tracking-tight">
                ${totalLiquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="relative p-3 bg-gray-900 border border-gray-800 rounded-full hover:border-cyan-500 transition-colors group"
            >
              <MessageSquare size={20} className="text-gray-400 group-hover:text-cyan-400" />
              <span className="absolute top-0 right-0 w-3 h-3 bg-cyan-500 border-2 border-[#0a0a0c] rounded-full animate-pulse"></span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-8 pb-24">
        
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Hero Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricTile 
                label="Global Liquidity" 
                value={`$${(totalLiquidity / 1000000).toFixed(1)}M`} 
                subValue="12.4%" 
                trend="up" 
                icon={<Globe size={20} />} 
              />
              <MetricTile 
                label="Net Cash Flow" 
                value="+$4.2M" 
                subValue="3.1%" 
                trend="up" 
                icon={<TrendingUp size={20} />} 
              />
              <MetricTile 
                label="Risk Exposure" 
                value="Low" 
                subValue="0.4%" 
                trend="down" 
                icon={<ShieldCheck size={20} />} 
              />
              <MetricTile 
                label="Active Rails" 
                value="14" 
                subValue="2 new" 
                trend="up" 
                icon={<Layers size={20} />} 
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Chart */}
              <Card title="Liquidity Projection (24-Week Horizon)" className="lg:col-span-2 min-h-[500px]">
                <div className="h-[400px] w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={LIQUIDITY_FORECAST}>
                      <defs>
                        <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                      <XAxis dataKey="period" stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#4b5563" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="inflow" stroke="#06b6d4" fillOpacity={1} fill="url(#colorInflow)" strokeWidth={3} />
                      <Bar dataKey="outflow" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={20} />
                      <Line type="monotone" dataKey="reserve" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-8 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Projected Inflow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-700"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Scheduled Outflow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Reserve Target</span>
                  </div>
                </div>
              </Card>

              {/* Sidebar: Fraud & Alerts */}
              <div className="space-y-6">
                <Card title="Security Sentinel" subtitle="Real-time threat monitoring">
                  <div className="space-y-4 mt-4">
                    {FRAUD_ALERTS.map(alert => (
                      <div key={alert.id} className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-start gap-4 group hover:bg-red-500/10 transition-colors">
                        <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
                          <AlertTriangle size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-sm font-bold text-white">{alert.type}</p>
                            <span className="text-[10px] font-black text-red-500 uppercase">{alert.score}% Risk</span>
                          </div>
                          <p className="text-xs text-gray-500">Detected at {alert.entity} • {alert.time}</p>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:text-white transition-all">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    ))}
                    <button className="w-full py-3 border border-dashed border-gray-800 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:border-cyan-500 hover:text-cyan-500 transition-all">
                      View All Security Events
                    </button>
                  </div>
                </Card>

                <Card title="Quick Actions" className="bg-gradient-to-br from-gray-900 to-[#0a0a0c]">
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button 
                      onClick={() => setShowPaymentModal(true)}
                      className="flex flex-col items-center justify-center p-4 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group"
                    >
                      <Plus className="text-cyan-500 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">New Payment</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group">
                      <RefreshCw className="text-cyan-500 mb-2 group-hover:rotate-180 transition-transform duration-500" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">FX Swap</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group">
                      <Download className="text-cyan-500 mb-2 group-hover:translate-y-1 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Export GL</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-4 bg-gray-800/50 border border-gray-700 rounded-2xl hover:border-cyan-500 hover:bg-cyan-500/5 transition-all group">
                      <History className="text-cyan-500 mb-2 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Audit Logs</span>
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* --- FX TAB --- */}
        {activeTab === 'fx' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Foreign Exchange Desk</h2>
                <p className="text-gray-500 text-sm">Real-time currency exposure and algorithmic hedging.</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-cyan-500 transition-all">
                  Market Analysis
                </button>
                <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-cyan-500/20">
                  Execute Trade
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {fxPositions.map((pos) => (
                <div key={pos.currency} className="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl hover:border-cyan-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-xs font-black text-white">
                        {pos.currency.substring(0, 2)}
                      </div>
                      <span className="text-lg font-black text-white">{pos.currency}</span>
                    </div>
                    <StatusBadge status={pos.status} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-black text-white">
                      {pos.amount.toLocaleString(undefined, { style: 'currency', currency: pos.currency })}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      Rate: {pos.rate.toFixed(4)} USD
                    </p>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between items-center">
                    <div className={`text-xs font-bold ${pos.trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pos.trend > 0 ? '+' : ''}{pos.trend}%
                    </div>
                    <div className="h-8 w-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={Array.from({length: 10}, () => ({v: Math.random()}))}>
                          <Area type="monotone" dataKey="v" stroke={pos.trend > 0 ? '#10b981' : '#ef4444'} fill="transparent" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Card title="Global Exposure Heatmap">
              <div className="h-[400px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fxPositions}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={140}
                      paddingAngle={5}
                      dataKey="amount"
                    >
                      {fxPositions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                    />
                    <Legend verticalAlign="middle" align="right" layout="vertical" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {/* --- PAYMENTS TAB --- */}
        {activeTab === 'payments' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Payment Operations</h2>
              <button 
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20"
              >
                <Plus size={18} /> Initiate Transfer
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card title="Recent Transactions" subtitle="Immutable ledger of all movement">
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-800 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
                          <th className="pb-4 pl-4">Reference</th>
                          <th className="pb-4">Recipient</th>
                          <th className="pb-4">Method</th>
                          <th className="pb-4">Amount</th>
                          <th className="pb-4">Status</th>
                          <th className="pb-4 pr-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {[
                          { id: 'TX-8812', recipient: 'Global Logistics Inc', method: 'WIRE', amount: '$450,000.00', status: 'EXECUTED', date: '10:42 AM' },
                          { id: 'TX-8813', recipient: 'Cloud Systems Ltd', method: 'ACH', amount: '$12,400.00', status: 'PENDING', date: '11:15 AM' },
                          { id: 'TX-8814', recipient: 'Internal Sweep (JPY)', method: 'QUANTUM', amount: '¥15,000,000', status: 'AUTHORIZED', date: '12:01 PM' },
                          { id: 'TX-8815', recipient: 'Unknown Entity', method: 'WIRE', amount: '$1,000,000.00', status: 'FLAGGED', date: '01:30 PM' },
                        ].map((tx) => (
                          <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors group">
                            <td className="py-4 pl-4 font-mono text-cyan-500">{tx.id}</td>
                            <td className="py-4 font-bold text-white">{tx.recipient}</td>
                            <td className="py-4">
                              <span className="px-2 py-1 bg-gray-800 rounded text-[10px] font-bold">{tx.method}</span>
                            </td>
                            <td className="py-4 font-black text-white">{tx.amount}</td>
                            <td className="py-4"><StatusBadge status={tx.status} /></td>
                            <td className="py-4 pr-4 text-right">
                              <button className="p-2 hover:text-cyan-400 transition-colors">
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card title="Payment Rails Status">
                  <div className="space-y-6 mt-4">
                    {[
                      { name: 'SWIFT Global', status: 'Operational', latency: '1.2s', load: 42 },
                      { name: 'ACH Network', status: 'Operational', latency: '0.4s', load: 18 },
                      { name: 'Quantum DLT', status: 'High Performance', latency: '0.01s', load: 8 },
                      { name: 'FedWire', status: 'Maintenance', latency: 'N/A', load: 0 },
                    ].map(rail => (
                      <div key={rail.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white">{rail.name}</span>
                          <span className={`text-[10px] font-black uppercase ${rail.status === 'Operational' || rail.status === 'High Performance' ? 'text-green-500' : 'text-yellow-500'}`}>
                            {rail.status}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${rail.load > 30 ? 'bg-cyan-500' : 'bg-blue-500'}`} 
                            style={{ width: `${rail.load}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-600 font-bold">
                          <span>Latency: {rail.latency}</span>
                          <span>Load: {rail.load}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="p-6 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl shadow-2xl shadow-cyan-500/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Zap size={120} />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2 relative z-10">Quantum Speed</h3>
                  <p className="text-white/70 text-xs mb-6 relative z-10">Experience sub-second settlement across 140+ currencies with our proprietary DLT rail.</p>
                  <button className="px-4 py-2 bg-white text-cyan-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all relative z-10">
                    Upgrade Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- AUDIT TAB --- */}
        {activeTab === 'audit' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Immutable Audit Storage</h2>
                <p className="text-gray-500 text-sm">Every action is cryptographically signed and logged.</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-cyan-500 transition-all">
                <Download size={16} /> Export Signed PDF
              </button>
            </div>

            <Card title="System Activity Log">
              <div className="mt-6 space-y-2">
                {auditLogs.length === 0 ? (
                  <div className="py-20 text-center">
                    <Terminal className="mx-auto text-gray-800 mb-4" size={48} />
                    <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">No logs recorded in this session</p>
                  </div>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-4 bg-gray-900/40 border border-gray-800/50 rounded-xl flex items-center gap-6 hover:bg-gray-800/30 transition-all group">
                      <div className="w-24 text-[10px] font-mono text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-xs font-black text-white uppercase tracking-tighter">{log.action}</span>
                          <StatusBadge status={log.severity} />
                        </div>
                        <p className="text-xs text-gray-500">{log.details}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400">{log.user}</p>
                        <p className="text-[10px] font-mono text-gray-700">{log.ipAddress}</p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Lock size={14} className="text-cyan-500" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        )}

      </main>

      {/* --- AI CHAT OVERLAY --- */}
      <div className={`fixed bottom-0 right-8 w-96 bg-[#0f172a] border-x border-t border-gray-800 rounded-t-2xl shadow-2xl transition-all duration-500 z-50 ${isChatOpen ? 'h-[600px]' : 'h-0 overflow-hidden'}`}>
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Cpu size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-white uppercase tracking-tighter">AI Strategist</p>
              <p className="text-[10px] text-green-500 font-bold uppercase">Online</p>
            </div>
          </div>
          <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-white">
            <XCircle size={20} />
          </button>
        </div>

        <div className="h-[460px] overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-cyan-600 text-white rounded-tr-none' 
                  : msg.role === 'system'
                  ? 'bg-gray-800/50 text-gray-400 italic text-center w-full'
                  : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
              }`}>
                {msg.content}
                <p className="text-[8px] mt-1 opacity-50 text-right">{msg.timestamp}</p>
              </div>
            </div>
          ))}
          {isAiThinking && (
            <div className="flex justify-start">
              <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700 flex gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
          <div className="relative">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
              placeholder="Ask about liquidity, FX, or payments..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all"
            />
            <button 
              onClick={handleAiQuery}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* --- PAYMENT MODAL (THE POP-UP FORM) --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0a0a0c]/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Initiate Transfer</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-white">
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {!mfaStep ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recipient Name / Entity</label>
                    <input 
                      type="text" 
                      value={paymentForm.recipient}
                      onChange={(e) => setPaymentForm({...paymentForm, recipient: e.target.value})}
                      placeholder="e.g. Global Logistics Nexus"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</label>
                      <input 
                        type="number" 
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                        placeholder="0.00"
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Currency</label>
                      <select 
                        value={paymentForm.currency}
                        onChange={(e) => setPaymentForm({...paymentForm, currency: e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 appearance-none"
                      >
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>JPY</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Payment Rail</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['WIRE', 'ACH', 'QUANTUM'].map(m => (
                        <button 
                          key={m}
                          onClick={() => setPaymentForm({...paymentForm, method: m as any})}
                          className={`py-3 rounded-xl text-[10px] font-black border transition-all ${
                            paymentForm.method === m ? 'bg-cyan-500 border-cyan-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-500 hover:border-gray-600'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button 
                    onClick={() => setMfaStep(true)}
                    className="w-full py-4 bg-cyan-500 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-cyan-400 transition-all shadow-xl shadow-cyan-500/20"
                  >
                    Review & Authorize
                  </button>
                </>
              ) : (
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto text-cyan-500">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tighter">Multi-Factor Auth</h4>
                    <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to your secure device.</p>
                  </div>
                  <input 
                    type="text" 
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    placeholder="0 0 0 0 0 0"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-2xl text-center font-mono tracking-[0.5em] text-white focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setMfaStep(false)}
                      className="flex-1 py-4 bg-gray-800 text-gray-400 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-gray-700 transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={executePayment}
                      className="flex-1 py-4 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest text-xs hover:bg-green-500 transition-all shadow-xl shadow-green-500/20"
                    >
                      Confirm
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Demo Code: 123456</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="max-w-[1600px] mx-auto px-8 py-12 border-t border-gray-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
          <div className="w-8 h-8 bg-gray-800 rounded flex items-center justify-center">
            <Cpu size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Quantum Financial</span>
        </div>
        <div className="flex gap-8 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          <a href="#" className="hover:text-cyan-500 transition-colors">Security Policy</a>
          <a href="#" className="hover:text-cyan-500 transition-colors">API Documentation</a>
          <a href="#" className="hover:text-cyan-500 transition-colors">Global SSI Hub</a>
          <a href="#" className="hover:text-cyan-500 transition-colors">System Status</a>
        </div>
        <p className="text-[10px] text-gray-700 font-mono">© 2024 QUANTUM_FINANCIAL_CORE_V4.0 // EIN_2021_COMPLIANT</p>
      </footer>
    </div>
  );
};

export default TreasuryView;