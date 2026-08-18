import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  LayoutDashboard,
  CreditCard,
  PieChart as PieChartIcon,
  ShieldAlert,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Send,
  Bot,
  User,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Lock,
  FileText,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Mock Data Generation ---

const generateDates = (days: number) => {
  const dates = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const MOCK_ACCOUNTS = [
  { id: 'acc_001', name: 'Business Checking', type: 'Checking', balance: 124500.50, currency: 'USD', change: 2.4 },
  { id: 'acc_002', name: 'Tax Savings', type: 'Savings', balance: 45000.00, currency: 'USD', change: 0.5 },
  { id: 'acc_003', name: 'Operations Fund', type: 'Checking', balance: 28900.75, currency: 'USD', change: -1.2 },
  { id: 'acc_004', name: 'Global Ventures', type: 'Investment', balance: 156000.00, currency: 'USD', change: 5.8 },
];

const MOCK_TRANSACTIONS = Array.from({ length: 50 }).map((_, i) => ({
  id: `tx_${1000 + i}`,
  date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  merchant: ['AWS Web Services', 'WeWork Office', 'Uber Business', 'Delta Airlines', 'Staples', 'Slack Technologies', 'Salesforce'][Math.floor(Math.random() * 7)],
  amount: Math.floor(Math.random() * 5000) + 50,
  type: Math.random() > 0.3 ? 'debit' : 'credit',
  category: ['Software', 'Office', 'Travel', 'Utilities', 'Services'][Math.floor(Math.random() * 5)],
  status: Math.random() > 0.1 ? 'Completed' : 'Pending',
})).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const ANALYTICS_DATA = generateDates(14).map(date => ({
  date,
  revenue: Math.floor(Math.random() * 10000) + 5000,
  expenses: Math.floor(Math.random() * 8000) + 2000,
  profit: Math.floor(Math.random() * 4000) + 1000,
}));

const SPENDING_BY_CATEGORY = [
  { name: 'Software', value: 4500 },
  { name: 'Office', value: 3200 },
  { name: 'Travel', value: 2100 },
  { name: 'Marketing', value: 5600 },
  { name: 'Payroll', value: 12000 },
];

const SECURITY_LOGS = Array.from({ length: 20 }).map((_, i) => ({
  id: `log_${i}`,
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  event: ['Login Success', 'Password Change', 'API Key Created', 'Failed Login Attempt', '2FA Verified'][Math.floor(Math.random() * 5)],
  ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
  location: ['New York, US', 'London, UK', 'Tokyo, JP', 'San Francisco, US'][Math.floor(Math.random() * 4)],
  severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// --- Types ---

type ViewState = 'dashboard' | 'accounts' | 'payments' | 'analytics' | 'security';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// --- Components ---

const Sidebar = ({ activeView, setActiveView, isOpen, toggleSidebar }: { activeView: ViewState, setActiveView: (v: ViewState) => void, isOpen: boolean, toggleSidebar: () => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: CreditCard },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: PieChartIcon },
    { id: 'security', label: 'Security', icon: ShieldAlert },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 shadow-xl`}>
      <div className="flex items-center justify-between h-16 px-6 bg-slate-950">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">NexusBank</span>
        </div>
        <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveView(item.id as ViewState); if (window.innerWidth < 1024) toggleSidebar(); }}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeView === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
        <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </button>
        <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors mt-1">
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => (
  <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
    <div className="flex items-center">
      <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md mr-4">
        <Menu className="w-6 h-6" />
      </button>
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search transactions, accounts..."
          className="pl-10 pr-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 lg:w-96 transition-all"
        />
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
      <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-800">Alex Morgan</p>
          <p className="text-xs text-slate-500">Finance Director</p>
        </div>
        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
          <User className="w-6 h-6 text-slate-500" />
        </div>
      </div>
    </div>
  </header>
);

const DashboardWidget = ({ title, value, change, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-blue-50 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <span className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
        {Math.abs(change)}%
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const PaymentForm = () => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setTimeout(() => setStatus('success'), 1500);
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
        <Send className="w-5 h-5 mr-2 text-blue-600" />
        New Transfer
      </h2>
      {status === 'success' ? (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Transfer Successful</h3>
          <p className="text-slate-500 mt-2">Transaction ID: #TRX-{Math.floor(Math.random() * 100000)}</p>
          <button onClick={() => setStatus('idle')} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
            Make Another Transfer
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">From Account</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                {MOCK_ACCOUNTS.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} (***{acc.id.slice(-3)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="number" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" required />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Recipient Name</label>
            <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter recipient name" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reference / Note</label>
            <textarea className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24" placeholder="Invoice #1234..." />
          </div>
          <button
            type="submit"
            disabled={status === 'processing'}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            {status === 'processing' ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : 'Send Funds'}
          </button>
        </form>
      )}
    </div>
  );
};

const AnalyticsChart = () => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-slate-900">Revenue vs Expenses</h3>
      <select className="text-sm border-slate-300 border rounded-md px-2 py-1">
        <option>Last 14 Days</option>
        <option>Last 30 Days</option>
        <option>Last Quarter</option>
      </select>
    </div>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={ANALYTICS_DATA}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
          <RechartsTooltip
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend />
          <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
          <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Expenses" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const SecurityPanel = () => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
      <h3 className="text-lg font-bold text-slate-900 flex items-center">
        <ShieldAlert className="w-5 h-5 mr-2 text-blue-600" />
        Security Audit Log
      </h3>
      <button className="text-sm text-blue-600 hover:underline">Export Log</button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-medium">
          <tr>
            <th className="px-6 py-3">Event</th>
            <th className="px-6 py-3">Timestamp</th>
            <th className="px-6 py-3">Location</th>
            <th className="px-6 py-3">IP Address</th>
            <th className="px-6 py-3">Severity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {SECURITY_LOGS.map((log) => (
            <tr key={log.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-900">{log.event}</td>
              <td className="px-6 py-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="px-6 py-4 text-slate-500">{log.location}</td>
              <td className="px-6 py-4 text-slate-500 font-mono text-xs">{log.ip}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                  ${log.severity === 'high' ? 'bg-red-100 text-red-800' :
                    log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'}`}>
                  {log.severity}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ChatInterface = ({ onAction }: { onAction: (action: any) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am your NexusBank AI assistant. I can help you navigate the dashboard, analyze spending, or set up transfers. Try saying "Show me my analytics" or "Go to payments".', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("API Key missing");
      }
      const ai = new GoogleGenAI({});
      const genAI = new GoogleGenAi(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const systemPrompt = `
        You are an AI assistant for a banking dashboard called NexusBank.
        Your goal is to help the user navigate and understand their financial data.
        
        The dashboard has the following views (IDs): 'dashboard', 'accounts', 'payments', 'analytics', 'security'.
        
        When the user asks to see something, you should respond with a JSON object containing an "action" and a "message".
        
        Possible actions:
        - "navigate": payload should be one of the view IDs.
        - "insight": payload is null, just provide a helpful text response about the data (simulated).
        - "none": just a text response.

        Example User: "Take me to the payments page"
        Response: { "action": "navigate", "payload": "payments", "message": "Navigating to the Payments section." }

        Example User: "Show me my security logs"
        Response: { "action": "navigate", "payload": "security", "message": "Opening Security Logs." }

        Example User: "Hello"
        Response: { "action": "none", "payload": null, "message": "Hello! How can I assist you with your banking today?" }

        IMPORTANT: Output ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
      `;

      const result = await model.generateContent([systemPrompt, `User: ${userMsg.content}`]);
      const responseText = result.response.text();
      
      // Clean up potential markdown code blocks if the model adds them despite instructions
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanJson);
      } catch (e) {
        parsedResponse = { action: 'none', message: responseText }; // Fallback
      }

      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: parsedResponse.message || parsedResponse.text || "I processed that.", 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, aiMsg]);

      if (parsedResponse.action === 'navigate' && parsedResponse.payload) {
        onAction({ type: 'NAVIGATE', payload: parsedResponse.payload });
      }

    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "I'm sorry, I'm currently running in demo mode without a live AI connection (or the API key is missing). I can still simulate navigation if you click the menu items!", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-slate-900 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Nexus AI Assistant</span>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Beta</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask AI to navigate or analyze..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- Main Component ---

export default function BusinessDemoView() {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAIAction = (action: { type: string, payload: any }) => {
    if (action.type === 'NAVIGATE') {
      setActiveView(action.payload);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardWidget title="Total Balance" value="$355,001.25" change={2.4} trend="up" icon={DollarSign} />
              <DashboardWidget title="Monthly Revenue" value="$84,230.00" change={5.1} trend="up" icon={Activity} />
              <DashboardWidget title="Expenses" value="$32,450.50" change={-1.2} trend="down" icon={CreditCard} />
              <DashboardWidget title="Active Users" value="1,240" change={12.5} trend="up" icon={User} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Cash Flow Overview</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ANALYTICS_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                      <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                      <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Spending by Category</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={SPENDING_BY_CATEGORY}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {SPENDING_BY_CATEGORY.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                <button onClick={() => setActiveView('accounts')} className="text-sm text-blue-600 hover:underline flex items-center">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">Merchant</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {MOCK_TRANSACTIONS.slice(0, 5).map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{tx.merchant}</td>
                        <td className="px-6 py-4 text-slate-500">{tx.date}</td>
                        <td className="px-6 py-4 text-slate-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center text-xs font-medium ${tx.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {tx.status === 'Completed' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                            {tx.status}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-medium ${tx.type === 'credit' ? 'text-green-600' : 'text-slate-900'}`}>
                          {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'accounts':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-900">Your Accounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_ACCOUNTS.map((acc) => (
                <div key={acc.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className={`text-sm font-medium ${acc.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {acc.change >= 0 ? '+' : ''}{acc.change}%
                    </span>
                  </div>
                  <h3 className="text-slate-500 text-sm font-medium">{acc.name}</h3>
                  <p className="text-3xl font-bold text-slate-900 mt-1">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm text-slate-500">
                    <span>{acc.type}</span>
                    <span className="font-mono">**** {acc.id.slice(-4)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Transaction History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Merchant</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {MOCK_TRANSACTIONS.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{tx.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{tx.merchant}</td>
                        <td className="px-6 py-4 text-slate-500">{tx.date}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">${tx.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="animate-in fade-in duration-500">
            <PaymentForm />
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-900">Financial Analytics</h2>
            <AnalyticsChart />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Expense Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={SPENDING_BY_CATEGORY} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                        {SPENDING_BY_CATEGORY.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Growth</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ANALYTICS_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-center text-slate-500 mt-4">Profit trend over the last 14 days indicates a <span className="text-green-600 font-bold">12% increase</span>.</p>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-900">Security Center</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
                <div className="p-4 bg-green-100 rounded-full mr-4">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Security Status</p>
                  <p className="text-xl font-bold text-green-600">Secure</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
                <div className="p-4 bg-blue-100 rounded-full mr-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Last Audit</p>
                  <p className="text-xl font-bold text-slate-900">24h ago</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
                <div className="p-4 bg-yellow-100 rounded-full mr-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Active Alerts</p>
                  <p className="text-xl font-bold text-slate-900">0</p>
                </div>
              </div>
            </div>
            <SecurityPanel />
          </div>
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <ChatInterface onAction={handleAIAction} />
    </div>
  );
}import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  LayoutDashboard,
  CreditCard,
  PieChart as PieChartIcon,
  ShieldAlert,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Send,
  Bot,
  User,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Lock,
  FileText,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Mock Data Generation ---

const generateDates = (days: number) => {
  const dates = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const MOCK_ACCOUNTS = [
  { id: 'acc_001', name: 'Business Checking', type: 'Checking', balance: 124500.50, currency: 'USD', change: 2.4 },
  { id: 'acc_002', name: 'Tax Savings', type: 'Savings', balance: 45000.00, currency: 'USD', change: 0.5 },
  { id: 'acc_003', name: 'Operations Fund', type: 'Checking', balance: 28900.75, currency: 'USD', change: -1.2 },
  { id: 'acc_004', name: 'Global Ventures', type: 'Investment', balance: 156000.00, currency: 'USD', change: 5.8 },
];

const MOCK_TRANSACTIONS = Array.from({ length: 50 }).map((_, i) => ({
  id: `tx_${1000 + i}`,
  date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  merchant: ['AWS Web Services', 'WeWork Office', 'Uber Business', 'Delta Airlines', 'Staples', 'Slack Technologies', 'Salesforce'][Math.floor(Math.random() * 7)],
  amount: Math.floor(Math.random() * 5000) + 50,
  type: Math.random() > 0.3 ? 'debit' : 'credit',
  category: ['Software', 'Office', 'Travel', 'Utilities', 'Services'][Math.floor(Math.random() * 5)],
  status: Math.random() > 0.1 ? 'Completed' : 'Pending',
})).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const ANALYTICS_DATA = generateDates(14).map(date => ({
  date,
  revenue: Math.floor(Math.random() * 10000) + 5000,
  expenses: Math.floor(Math.random() * 8000) + 2000,
  profit: Math.floor(Math.random() * 4000) + 1000,
}));

const SPENDING_BY_CATEGORY = [
  { name: 'Software', value: 4500 },
  { name: 'Office', value: 3200 },
  { name: 'Travel', value: 2100 },
  { name: 'Marketing', value: 5600 },
  { name: 'Payroll', value: 12000 },
];

const SECURITY_LOGS = Array.from({ length: 20 }).map((_, i) => ({
  id: `log_${i}`,
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  event: ['Login Success', 'Password Change', 'API Key Created', 'Failed Login Attempt', '2FA Verified'][Math.floor(Math.random() * 5)],
  ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
  location: ['New York, US', 'London, UK', 'Tokyo, JP', 'San Francisco, US'][Math.floor(Math.random() * 4)],
  severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// --- Types ---

type ViewState = 'dashboard' | 'accounts' | 'payments' | 'analytics' | 'security';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

// --- Components ---

const Sidebar = ({ activeView, setActiveView, isOpen, toggleSidebar }: { activeView: ViewState, setActiveView: (v: ViewState) => void, isOpen: boolean, toggleSidebar: () => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'accounts', label: 'Accounts', icon: CreditCard },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'analytics', label: 'Analytics', icon: PieChartIcon },
    { id: 'security', label: 'Security', icon: ShieldAlert },
  ];

  return (
    <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 shadow-xl`}>
      <div className="flex items-center justify-between h-16 px-6 bg-slate-950">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">NexusBank</span>
        </div>
        <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="mt-6 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveView(item.id as ViewState); if (window.innerWidth < 1024) toggleSidebar(); }}
            className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeView === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
        <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <Settings className="w-5 h-5 mr-3" />
          Settings
        </button>
        <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors mt-1">
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

const Header = ({ toggleSidebar }: { toggleSidebar: () => void }) => (
  <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20">
    <div className="flex items-center">
      <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md mr-4">
        <Menu className="w-6 h-6" />
      </button>
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search transactions, accounts..."
          className="pl-10 pr-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 lg:w-96 transition-all"
        />
      </div>
    </div>
    <div className="flex items-center space-x-4">
      <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
      <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-800">Alex Morgan</p>
          <p className="text-xs text-slate-500">Finance Director</p>
        </div>
        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
          <User className="w-6 h-6 text-slate-500" />
        </div>
      </div>
    </div>
  </header>
);

const DashboardWidget = ({ title, value, change, icon: Icon, trend }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-blue-50 rounded-lg">
        <Icon className="w-6 h-6 text-blue-600" />
      </div>
      <span className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
        {Math.abs(change)}%
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const PaymentForm = () => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setTimeout(() => setStatus('success'), 1500);
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 max-w-2xl mx-auto">
      <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
        <Send className="w-5 h-5 mr-2 text-blue-600" />
        New Transfer
      </h2>
      {status === 'success' ? (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Transfer Successful</h3>
          <p className="text-slate-500 mt-2">Transaction ID: #TRX-{Math.floor(Math.random() * 100000)}</p>
          <button onClick={() => setStatus('idle')} className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800">
            Make Another Transfer
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">From Account</label>
              <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                {MOCK_ACCOUNTS.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} (***{acc.id.slice(-3)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="number" className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="0.00" required />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Recipient Name</label>
            <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter recipient name" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Reference / Note</label>
            <textarea className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24" placeholder="Invoice #1234..." />
          </div>
          <button
            type="submit"
            disabled={status === 'processing'}
            className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            {status === 'processing' ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : 'Send Funds'}
          </button>
        </form>
      )}
    </div>
  );
};

const AnalyticsChart = () => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg font-bold text-slate-900">Revenue vs Expenses</h3>
      <select className="text-sm border-slate-300 border rounded-md px-2 py-1">
        <option>Last 14 Days</option>
        <option>Last 30 Days</option>
        <option>Last Quarter</option>
      </select>
    </div>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={ANALYTICS_DATA}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
          <RechartsTooltip
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ fontSize: '12px' }}
          />
          <Legend />
          <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
          <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Expenses" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const SecurityPanel = () => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="p-6 border-b border-slate-200 flex justify-between items-center">
      <h3 className="text-lg font-bold text-slate-900 flex items-center">
        <ShieldAlert className="w-5 h-5 mr-2 text-blue-600" />
        Security Audit Log
      </h3>
      <button className="text-sm text-blue-600 hover:underline">Export Log</button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 text-slate-500 font-medium">
          <tr>
            <th className="px-6 py-3">Event</th>
            <th className="px-6 py-3">Timestamp</th>
            <th className="px-6 py-3">Location</th>
            <th className="px-6 py-3">IP Address</th>
            <th className="px-6 py-3">Severity</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {SECURITY_LOGS.map((log) => (
            <tr key={log.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium text-slate-900">{log.event}</td>
              <td className="px-6 py-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
              <td className="px-6 py-4 text-slate-500">{log.location}</td>
              <td className="px-6 py-4 text-slate-500 font-mono text-xs">{log.ip}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                  ${log.severity === 'high' ? 'bg-red-100 text-red-800' :
                    log.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'}`}>
                  {log.severity}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const ChatInterface = ({ onAction }: { onAction: (action: any) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am your NexusBank AI assistant. I can help you navigate the dashboard, analyze spending, or set up transfers. Try saying "Show me my analytics" or "Go to payments".', timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error("API Key missing");
      }

      const genAI = new GoogleGenAi(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const systemPrompt = `
        You are an AI assistant for a banking dashboard called NexusBank.
        Your goal is to help the user navigate and understand their financial data.
        
        The dashboard has the following views (IDs): 'dashboard', 'accounts', 'payments', 'analytics', 'security'.
        
        When the user asks to see something, you should respond with a JSON object containing an "action" and a "message".
        
        Possible actions:
        - "navigate": payload should be one of the view IDs.
        - "insight": payload is null, just provide a helpful text response about the data (simulated).
        - "none": just a text response.

        Example User: "Take me to the payments page"
        Response: { "action": "navigate", "payload": "payments", "message": "Navigating to the Payments section." }

        Example User: "Show me my security logs"
        Response: { "action": "navigate", "payload": "security", "message": "Opening Security Logs." }

        Example User: "Hello"
        Response: { "action": "none", "payload": null, "message": "Hello! How can I assist you with your banking today?" }

        IMPORTANT: Output ONLY valid JSON. Do not include markdown formatting like \`\`\`json.
      `;

      const result = await model.generateContent([systemPrompt, `User: ${userMsg.content}`]);
      const responseText = result.response.text();
      
      // Clean up potential markdown code blocks if the model adds them despite instructions
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(cleanJson);
      } catch (e) {
        parsedResponse = { action: 'none', message: responseText }; // Fallback
      }

      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: parsedResponse.message || parsedResponse.text || "I processed that.", 
        timestamp: new Date() 
      };
      
      setMessages(prev => [...prev, aiMsg]);

      if (parsedResponse.action === 'navigate' && parsedResponse.payload) {
        onAction({ type: 'NAVIGATE', payload: parsedResponse.payload });
      }

    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "I'm sorry, I'm currently running in demo mode without a live AI connection (or the API key is missing). I can still simulate navigation if you click the menu items!", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-slate-900 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Nexus AI Assistant</span>
            </div>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">Beta</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask AI to navigate or analyze..."
                className="flex-1 px-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- Main Component ---

export default function BusinessDemoView() {
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAIAction = (action: { type: string, payload: any }) => {
    if (action.type === 'NAVIGATE') {
      setActiveView(action.payload);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardWidget title="Total Balance" value="$355,001.25" change={2.4} trend="up" icon={DollarSign} />
              <DashboardWidget title="Monthly Revenue" value="$84,230.00" change={5.1} trend="up" icon={Activity} />
              <DashboardWidget title="Expenses" value="$32,450.50" change={-1.2} trend="down" icon={CreditCard} />
              <DashboardWidget title="Active Users" value="1,240" change={12.5} trend="up" icon={User} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Cash Flow Overview</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ANALYTICS_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                      <RechartsTooltip cursor={{ fill: '#f1f5f9' }} />
                      <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Spending by Category</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={SPENDING_BY_CATEGORY}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {SPENDING_BY_CATEGORY.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Recent Transactions</h3>
                <button onClick={() => setActiveView('accounts')} className="text-sm text-blue-600 hover:underline flex items-center">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">Merchant</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {MOCK_TRANSACTIONS.slice(0, 5).map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">{tx.merchant}</td>
                        <td className="px-6 py-4 text-slate-500">{tx.date}</td>
                        <td className="px-6 py-4 text-slate-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center text-xs font-medium ${tx.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {tx.status === 'Completed' ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertTriangle className="w-3 h-3 mr-1" />}
                            {tx.status}
                          </span>
                        </td>
                        <td className={`px-6 py-4 text-right font-medium ${tx.type === 'credit' ? 'text-green-600' : 'text-slate-900'}`}>
                          {tx.type === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'accounts':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-900">Your Accounts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_ACCOUNTS.map((acc) => (
                <div key={acc.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className={`text-sm font-medium ${acc.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {acc.change >= 0 ? '+' : ''}{acc.change}%
                    </span>
                  </div>
                  <h3 className="text-slate-500 text-sm font-medium">{acc.name}</h3>
                  <p className="text-3xl font-bold text-slate-900 mt-1">${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm text-slate-500">
                    <span>{acc.type}</span>
                    <span className="font-mono">**** {acc.id.slice(-4)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Transaction History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Merchant</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {MOCK_TRANSACTIONS.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{tx.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">{tx.merchant}</td>
                        <td className="px-6 py-4 text-slate-500">{tx.date}</td>
                        <td className="px-6 py-4 font-medium text-slate-900">${tx.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="animate-in fade-in duration-500">
            <PaymentForm />
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-900">Financial Analytics</h2>
            <AnalyticsChart />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Expense Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={SPENDING_BY_CATEGORY} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                        {SPENDING_BY_CATEGORY.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Monthly Growth</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ANALYTICS_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" hide />
                      <YAxis hide />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-center text-slate-500 mt-4">Profit trend over the last 14 days indicates a <span className="text-green-600 font-bold">12% increase</span>.</p>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-slate-900">Security Center</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
                <div className="p-4 bg-green-100 rounded-full mr-4">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Security Status</p>
                  <p className="text-xl font-bold text-green-600">Secure</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
                <div className="p-4 bg-blue-100 rounded-full mr-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Last Audit</p>
                  <p className="text-xl font-bold text-slate-900">24h ago</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
                <div className="p-4 bg-yellow-100 rounded-full mr-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Active Alerts</p>
                  <p className="text-xl font-bold text-slate-900">0</p>
                </div>
              </div>
            </div>
            <SecurityPanel />
          </div>
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={sidebarOpen} 
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <ChatInterface onAction={handleAIAction} />
    </div>
  );
}
