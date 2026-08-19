import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  Rocket, TrendingUp, DollarSign, Activity, PieChart, 
  Send, Shield, Search, Zap, Globe, Briefcase, 
  FileText, Users, Server, Lock, AlertTriangle, CheckCircle,
  ChevronRight, Terminal, RefreshCw, Star, Coins,
  ArrowUpRight, ArrowDownRight, Filter, Download
} from 'lucide-react';

/**
 * ============================================================================
 * THE JAMES BURVEL O’CALLAGHAN III CODE
 * MODULE: VentureCapitalDesk (VCD) - "The Sovereign Deal Engine"
 * VERSION: 6.0.0-OMEGA (HOTFIXED)
 * ============================================================================
 */

// ============================================================================
// 1. CONFIGURATION & TYPES
// ============================================================================

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || ""; 

type DealStage = 'sourcing' | 'screening' | 'due_diligence' | 'term_sheet' | 'portfolio' | 'pass' | 'exit';
type Sector = 'Fintech' | 'AI/ML' | 'Biotech' | 'CleanTech' | 'SaaS' | 'Crypto' | 'SpaceTech' | 'Quantum';
type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

interface Founder {
    id: string;
    name: string;
    role: string;
    exCompany: string;
    education: string;
    linkedIn?: string;
    avatarUrl?: string;
}

interface Financials {
    arr: number;
    burnRate: number;
    runwayMonths: number;
    lastRoundValuation: number;
    ask: number;
    equityOffered: number;
    capTable: { shareholder: string; percentage: number }[];
}

interface Deal {
    id: string;
    name: string;
    description: string;
    sector: Sector;
    stage: DealStage;
    financials: Financials;
    founders: Founder[];
    aiScore: number; // 0-100
    riskLevel: RiskLevel;
    lastActivity: string;
    tags: string[];
    documents: string[];
    sentimentScore: number; // 0-100
}

interface ChatMessage {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    timestamp: number;
    metadata?: any;
}

// ============================================================================
// 2. MOCK DATA ENGINE
// ============================================================================

const GENERATE_ID = () => Math.random().toString(36).substr(2, 9).toUpperCase();

const MOCK_DEALS: Deal[] = [
    {
        id: 'D-101', name: 'Nexus Neural', description: 'Decentralized compute grid for LLM training.',
        sector: 'AI/ML', stage: 'due_diligence', 
        financials: {
            arr: 1200000, burnRate: 150000, runwayMonths: 18, lastRoundValuation: 45000000,
            ask: 5000000, equityOffered: 10,
            capTable: [{ shareholder: 'Founders', percentage: 60 }, { shareholder: 'Seed VC', percentage: 20 }, { shareholder: 'Pool', percentage: 20 }]
        },
        founders: [{ id: 'F1', name: 'Dr. Elena S.', role: 'CEO', exCompany: 'Google DeepMind', education: 'PhD, MIT' }],
        aiScore: 94, riskLevel: 'Medium', lastActivity: '2h ago', tags: ['Infrastructure', 'High Growth'],
        documents: ['Pitch Deck', 'Technical Whitepaper', 'Audited Financials'],
        sentimentScore: 88
    },
    {
        id: 'D-102', name: 'Solaris Bio', description: 'Photosynthetic algae for carbon capture at gigaton scale.',
        sector: 'CleanTech', stage: 'screening', 
        financials: {
            arr: 50000, burnRate: 80000, runwayMonths: 12, lastRoundValuation: 15000000,
            ask: 2500000, equityOffered: 15,
            capTable: [{ shareholder: 'Founders', percentage: 80 }, { shareholder: 'Angel', percentage: 10 }, { shareholder: 'Pool', percentage: 10 }]
        },
        founders: [{ id: 'F2', name: 'James T.', role: 'CTO', exCompany: 'MIT Media Lab', education: 'MSc, Stanford' }],
        aiScore: 78, riskLevel: 'High', lastActivity: '1d ago', tags: ['ESG', 'Hardware', 'Moonshot'],
        documents: ['Pitch Deck', 'Lab Results'],
        sentimentScore: 72
    },
    {
        id: 'D-103', name: 'Orbital Logistics', description: 'Last-mile delivery for LEO space stations.',
        sector: 'SpaceTech', stage: 'sourcing', 
        financials: {
            arr: 0, burnRate: 200000, runwayMonths: 9, lastRoundValuation: 80000000,
            ask: 10000000, equityOffered: 10,
            capTable: [{ shareholder: 'Founders', percentage: 70 }, { shareholder: 'Series A', percentage: 20 }, { shareholder: 'Pool', percentage: 10 }]
        },
        founders: [{ id: 'F3', name: 'Sarah C.', role: 'COO', exCompany: 'SpaceX', education: 'MBA, Harvard' }],
        aiScore: 65, riskLevel: 'Critical', lastActivity: '4h ago', tags: ['Moonshot', 'Capital Intensive'],
        documents: ['Mission Plan'],
        sentimentScore: 60
    },
    {
        id: 'D-104', name: 'Vault Zero', description: 'Quantum-resistant cryptography for institutional banking.',
        sector: 'Fintech', stage: 'term_sheet', 
        financials: {
            arr: 2800000, burnRate: 120000, runwayMonths: 24, lastRoundValuation: 30000000,
            ask: 3000000, equityOffered: 8,
            capTable: [{ shareholder: 'Founders', percentage: 50 }, { shareholder: 'Early Investors', percentage: 40 }, { shareholder: 'Pool', percentage: 10 }]
        },
        founders: [{ id: 'F4', name: 'Wei L.', role: 'CISO', exCompany: 'NSA', education: 'PhD, CalTech' }],
        aiScore: 91, riskLevel: 'Low', lastActivity: '10m ago', tags: ['Security', 'B2B', 'SaaS'],
        documents: ['Tech Audit', 'Customer List', 'Term Sheet Draft'],
        sentimentScore: 95
    },
    {
        id: 'D-105', name: 'Chainlink Health', description: 'Patient data sovereignty on-chain.',
        sector: 'Crypto', stage: 'portfolio', 
        financials: {
            arr: 15000000, burnRate: 500000, runwayMonths: 36, lastRoundValuation: 120000000,
            ask: 0, equityOffered: 0,
            capTable: [{ shareholder: 'Public', percentage: 40 }, { shareholder: 'Founders', percentage: 30 }, { shareholder: 'VCs', percentage: 30 }]
        },
        founders: [{ id: 'F5', name: 'Marcus R.', role: 'CEO', exCompany: 'Epic Systems', education: 'MD, Johns Hopkins' }],
        aiScore: 88, riskLevel: 'Medium', lastActivity: 'Completed', tags: ['Web3', 'Healthcare', 'Exit Potential'],
        documents: ['Quarterly Report'],
        sentimentScore: 85
    }
];

const CHART_DATA_PERFORMANCE = [
    { month: 'Jan', deployed: 4000, returns: 2400, alpha: 120 },
    { month: 'Feb', deployed: 3000, returns: 1398, alpha: 98 },
    { month: 'Mar', deployed: 2000, returns: 9800, alpha: 450 },
    { month: 'Apr', deployed: 2780, returns: 3908, alpha: 210 },
    { month: 'May', deployed: 1890, returns: 4800, alpha: 230 },
    { month: 'Jun', deployed: 2390, returns: 3800, alpha: 180 },
    { month: 'Jul', deployed: 3490, returns: 4300, alpha: 200 },
];

const CHART_DATA_RADAR = [
    { subject: 'Team', A: 120, B: 110, fullMark: 150 },
    { subject: 'Market', A: 98, B: 130, fullMark: 150 },
    { subject: 'Product', A: 86, B: 130, fullMark: 150 },
    { subject: 'Traction', A: 99, B: 100, fullMark: 150 },
    { subject: 'Moat', A: 85, B: 90, fullMark: 150 },
    { subject: 'Exit', A: 65, B: 85, fullMark: 150 },
];

// ============================================================================
// 3. UI PRIMITIVES (Self-Contained Library)
// ============================================================================

const Card: React.FC<{ children: React.ReactNode; className?: string; title?: React.ReactNode; action?: React.ReactNode }> = ({ children, className = '', title, action }) => (
    <div className={`bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-cyan-900/10 ${className}`}>
        {(title || action) && (
            <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
                {title && <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">{title}</h3>}
                {action && <div>{action}</div>}
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);

const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'ai' | 'info' }> = ({ children, variant = 'neutral' }) => {
    const colors = {
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        ai: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[variant]} shadow-sm`}>
            {children}
        </span>
    );
};

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'glow' | 'danger' }> = ({ children, variant = 'primary', className = '', ...props }) => {
    const variants = {
        primary: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
        ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200',
        glow: 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-cyan-500/40 border border-white/10',
        danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20',
    };
    return (
        <button className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

const Metric: React.FC<{ label: string; value: string | number; change?: string; trend?: 'up' | 'down' | 'neutral'; icon?: any }> = ({ label, value, change, trend, icon: Icon }) => (
    <div className="flex flex-col">
        <span className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
            {Icon && <Icon size={12} />} {label}
        </span>
        <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white font-mono">{value}</span>
            {change && (
                <span className={`text-xs mb-1 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'}`}>
                    {change}
                </span>
            )}
        </div>
    </div>
);

// ============================================================================
// 4. MAIN COMPONENT: VentureCapitalDeskView
// ============================================================================

const VentureCapitalDeskView: React.FC = () => {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState<'pipeline' | 'portfolio' | 'analytics' | 'ai_analyst'>('pipeline');
    const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [isTermSheetOpen, setIsTermSheetOpen] = useState(false);
    
    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { id: 'sys_1', role: 'system', content: 'INITIALIZING QUANTUM VC CORE v9.2...', timestamp: Date.now() },
        { id: 'ai_1', role: 'ai', content: 'Welcome, Partner. I have scanned the global markets. Deal flow is optimized. 2 companies in the pipeline require immediate attention. How shall we proceed?', timestamp: Date.now() }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- EFFECTS ---
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // --- AI LOGIC (The "Golden Ticket" Integration) ---
    const handleAiSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = { id: `msg_${Date.now()}`, role: 'user', content: chatInput, timestamp: Date.now() };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsTyping(true);

        try {
            // Constructing a high-stakes, professional context
            const portfolioValue = deals.reduce((acc, d) => acc + (d.stage === 'portfolio' ? d.financials.lastRoundValuation : 0), 0);
            const context = `
                You are the "Quantum VC Analyst", a hyper-intelligent AI partner for a top-tier venture firm (Quantum Financial).
                Current Context:
                - Portfolio AUM: $${(portfolioValue / 1000000).toFixed(1)}M
                - Active Deals: ${deals.length}
                - Style: "Wolf of Wall Street" meets "Hal 9000". Elite, Strategic, Decisive.
                - Mission: Help the user "Kick the Tires" of this platform. Make them feel the power of the engine.
                
                If the user asks about "Nexus Neural", mention its 40% efficiency gain in LLM training.
                If the user asks to "Invest", "Allocate", or "Draft Term Sheet", confirm with high enthusiasm and initiate the protocol.
                If the user asks about "Risks", perform a brutal, honest assessment of the portfolio.
            `;

            let responseText = "Connecting to Neural Core...";

            if (GEMINI_API_KEY) {
                const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
                const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent([context, chatInput]);
                responseText = result.response.text();
            } else {
                // Heuristic Fallback (Simulation Mode)
                await new Promise(r => setTimeout(r, 1200));
                const lower = chatInput.toLowerCase();
                
                if (lower.includes('nexus')) {
                    responseText = "Nexus Neural is showing distinct alpha. Their decentralized grid reduces inference costs by 40%. My predictive models suggest a 12x return potential if they clear the Series A hurdle. Shall I draft a Term Sheet?";
                } else if (lower.includes('invest') || lower.includes('allocate') || lower.includes('buy') || lower.includes('term sheet')) {
                    responseText = "Capital Allocation Protocol Initiated. I've earmarked $2.5M from the Opportunity Fund. Wiring instructions pending GP approval. The engine is roaring, Partner.";
                } else if (lower.includes('risk')) {
                    responseText = "Risk analysis complete. Portfolio exposure to 'Crypto' sector is nominal (5%). 'SpaceTech' exposure is high-beta. I recommend hedging with 'SaaS' cash-flow positive assets.";
                } else {
                    responseText = "I've analyzed the market sentiment. Volatility is an opportunity. I'm scanning 40,000 data points per second to find your next unicorn.";
                }
            }

            // --- EXECUTION LOGIC (FIXED) ---
            if (responseText.toLowerCase().includes("term sheet") || responseText.toLowerCase().includes("protocol initiated")) {
                setTimeout(() => {
                    const sysMsg: ChatMessage = { 
                        id: `sys_${Date.now()}`, 
                        role: 'system', 
                        content: '>>> SMART CONTRACT DEPLOYED: TERM_SHEET_V4.PDF [READY FOR SIGNATURE]', 
                        timestamp: Date.now() 
                    };
                    setChatMessages(prev => [...prev, sysMsg]);
                    setIsTermSheetOpen(true); // Open the modal automatically
                }, 800);
            }

            setChatMessages(prev => [...prev, { id: `ai_${Date.now()}`, role: 'ai', content: responseText, timestamp: Date.now() }]);

        } catch (error) {
            setChatMessages(prev => [...prev, { id: `err_${Date.now()}`, role: 'system', content: "AI Core Offline. Reverting to manual overrides.", timestamp: Date.now() }]);
        } finally {
            setIsTyping(false);
        }
    };

    // --- RENDERERS ---

    const renderPipeline = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {deals.map((deal) => (
                <Card key={deal.id} className="group hover:border-cyan-500/50 transition-colors cursor-pointer relative">
                    <div className="absolute top-0 right-0 p-2">
                        <div className={`w-2 h-2 rounded-full ${deal.lastActivity.includes('ago') ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                    </div>
                    
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors shadow-inner">
                            {deal.sector === 'AI/ML' ? <Zap className="text-purple-400" /> : 
                             deal.sector === 'Fintech' ? <DollarSign className="text-emerald-400" /> :
                             deal.sector === 'SpaceTech' ? <Rocket className="text-orange-400" /> :
                             deal.sector === 'CleanTech' ? <Globe className="text-green-400" /> :
                             deal.sector === 'Crypto' ? <Coins className="text-yellow-400" /> :
                             <Briefcase className="text-blue-400" />}
                        </div>
                        <Badge variant={deal.aiScore > 90 ? 'ai' : deal.aiScore > 70 ? 'success' : 'warning'}>
                            AI Score: {deal.aiScore}
                        </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{deal.name}</h3>
                    <p className="text-sm text-slate-400 mb-4 h-10 overflow-hidden text-ellipsis leading-relaxed">{deal.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-500 mb-4 bg-slate-800/50 p-2 rounded">
                        <div>
                            <span className="block text-slate-600">VALUATION</span>
                            <span className="text-slate-300">${(deal.financials.lastRoundValuation / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-slate-600">ASK</span>
                            <span className="text-slate-300">${(deal.financials.ask / 1000000).toFixed(1)}M</span>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-4 flex-wrap">
                        {deal.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">{tag}</span>
                        ))}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                        <Button variant="secondary" className="w-full text-xs h-8" onClick={() => setSelectedDeal(deal)}>
                            Data Room
                        </Button>
                        <Button variant="ghost" className="w-10 h-8 p-0">
                            <Activity size={14} />
                        </Button>
                    </div>
                </Card>
            ))}
            
            {/* Add New Deal Card (The "Hook") */}
            <div className="border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center p-8 text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-pointer min-h-[300px] bg-slate-900/20 group" onClick={() => setChatInput("Find me a new deal in the Quantum Computing sector.")}>
                <div className="p-4 bg-slate-800 rounded-full mb-4 group-hover:bg-slate-700 transition-colors">
                    <Rocket size={32} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="font-bold tracking-wide">Scout New Opportunity</span>
                <span className="text-xs mt-2 font-mono">AI Sourcing Active</span>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Portfolio Alpha Generation">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_DATA_PERFORMANCE}>
                                <defs>
                                    <linearGradient id="colorAlpha" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#475569" />
                                <YAxis stroke="#475569" />
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="alpha" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAlpha)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Deal Scoring Matrix (Radar)">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={90} data={CHART_DATA_RADAR}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="#475569" />
                                <Radar name="Nexus Neural" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                                <Radar name="Market Avg" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderAiInterface = () => (
        <div className="h-[600px] flex flex-col bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-300">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 p-0.5">
                        <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                            <Zap size={20} className="text-cyan-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Quantum VC Analyst</h3>
                        <p className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Online // Neural Link Active
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" className="p-2"><RefreshCw size={16}/></Button>
                    <Button variant="ghost" className="p-2"><Terminal size={16}/></Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
                {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                            msg.role === 'user' 
                            ? 'bg-cyan-600 text-white rounded-br-none' 
                            : msg.role === 'system'
                            ? 'bg-slate-800 border border-slate-700 text-slate-400 font-mono text-xs w-full text-center py-2'
                            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                        }`}>
                            {msg.role === 'ai' && (
                                <div className="text-xs text-purple-400 font-bold mb-1 flex items-center gap-2 uppercase tracking-wider">
                                    <Zap size={10} /> Intelligence Node
                                </div>
                            )}
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 rounded-2xl rounded-bl-none p-4 border border-slate-700 flex gap-2 items-center">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                <form onSubmit={handleAiSubmit} className="relative">
                    <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Command the analyst (e.g., 'Draft term sheet for Nexus Neural')..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600 shadow-inner font-mono"
                    />
                    <button 
                        type="submit" 
                        disabled={!chatInput.trim() || isTyping}
                        className="absolute right-2 top-2 p-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <div className="flex justify-center gap-4 mt-3">
                    {['Investigate Market Risk', 'Draft Term Sheet', 'Portfolio Health Check'].map(hint => (
                        <button 
                            key={hint}
                            onClick={() => { setChatInput(hint); handleAiSubmit(); }}
                            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors border border-slate-800 px-2 py-1 rounded-full"
                        >
                            {hint}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // --- MAIN LAYOUT ---
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Rocket className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Venture<span className="font-light text-cyan-400">Desk</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-mono text-slate-400">MARKET OPEN</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors">
                            <Users size={16} className="text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Metrics Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-slate-900/50">
                        <Metric label="AUM (Fund III)" value="$142.5M" change="+12.4%" trend="up" icon={Briefcase} />
                    </Card>
                    <Card className="bg-slate-900/50">
                        <Metric label="IRR" value="24.8%" change="+2.1%" trend="up" icon={TrendingUp} />
                    </Card>
                    <Card className="bg-slate-900/50">
                        <Metric label="Active Deals" value={deals.length} change="High Activity" trend="neutral" icon={Activity} />
                    </Card>
                    <Card className="bg-slate-900/50">
                        <Metric label="Dry Powder" value="$45.0M" change="Ready to Deploy" trend="neutral" icon={Lock} />
                    </Card>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-4 mb-8 border-b border-slate-800 pb-1">
                    {[
                        { id: 'pipeline', label: 'Deal Pipeline', icon: Server },
                        { id: 'analytics', label: 'Market Analytics', icon: PieChart },
                        { id: 'ai_analyst', label: 'AI Analyst', icon: Zap }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-1.5 ${
                                activeTab === tab.id 
                                ? 'border-cyan-500 text-cyan-400' 
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Render */}
                {activeTab === 'pipeline' && renderPipeline()}
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'ai_analyst' && renderAiInterface()}

            </main>

            {/* Deal Detail Drawer */}
            {selectedDeal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        {/* Drawer Header */}
                        <div className="h-40 bg-gradient-to-r from-purple-900 to-slate-900 relative">
                            <button onClick={() => setSelectedDeal(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 text-white transition-colors z-10">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <div className="absolute -bottom-10 left-8 flex items-end gap-4">
                                <div className="w-24 h-24 bg-slate-800 rounded-xl border-4 border-slate-900 flex items-center justify-center shadow-xl">
                                    <Rocket className="text-cyan-400" size={40} />
                                </div>
                                <div className="mb-3">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">{selectedDeal.name}</h2>
                                    <p className="text-slate-300 flex items-center gap-2">
                                        {selectedDeal.sector} • {selectedDeal.stage.replace('_', ' ').toUpperCase()} • 
                                        <Badge variant="ai">AI Score: {selectedDeal.aiScore}</Badge>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-16 px-8 pb-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Info */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Thesis</h3>
                                        <p className="text-slate-200 leading-relaxed">
                                            {selectedDeal.description} Proprietary technology offers a significant moat in the {selectedDeal.sector} vertical. 
                                            Founding team has prior exits.
                                        </p>
                                    </div>

                                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Financials</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500">ARR</p>
                                                <p className="text-lg font-mono text-white">${(selectedDeal.financials.arr / 1000).toFixed(0)}k</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Burn Rate</p>
                                                <p className="text-lg font-mono text-white">${(selectedDeal.financials.burnRate / 1000).toFixed(0)}k</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Runway</p>
                                                <p className="text-lg font-mono text-white">{selectedDeal.financials.runwayMonths} Mo</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Equity Offered</p>
                                                <p className="text-lg font-mono text-emerald-400">{selectedDeal.financials.equityOffered}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Founding Team</h3>
                                        <div className="space-y-2">
                                            {selectedDeal.founders.map(f => (
                                                <div key={f.id} className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        {f.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold">{f.name}</p>
                                                        <p className="text-xs text-slate-400">{f.role} • Ex-{f.exCompany}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Actions */}
                                <div className="space-y-6">
                                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Actions</h3>
                                        <div className="space-y-3">
                                            <Button variant="glow" className="w-full" onClick={() => { setSelectedDeal(null); setChatInput(`Draft term sheet for ${selectedDeal.name}`); handleAiSubmit(); }}>
                                                Initiate Term Sheet
                                            </Button>
                                            <Button variant="secondary" className="w-full">
                                                Schedule Founder Call
                                            </Button>
                                            <Button variant="danger" className="w-full" onClick={() => setSelectedDeal(null)}>
                                                Pass on Deal
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Data Room</h3>
                                        <div className="space-y-2">
                                            {selectedDeal.documents.map((doc, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-cyan-400 hover:underline cursor-pointer">
                                                    <FileText size={14} /> {doc}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Term Sheet Success Modal */}
            {isTermSheetOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-md w-full p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                        <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={32} className="text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Protocol Executed</h2>
                        <p className="text-slate-400 mb-6">
                            Term Sheet generated and sent to Legal Engineering.
                            Capital allocation block reserved on the ledger.
                        </p>
                        <Button variant="glow" onClick={() => setIsTermSheetOpen(false)}>
                            Return to Desk
                        </Button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default VentureCapitalDeskView;

// --- CONSOLIDATED FROM: VentureCapitalDesk (1).tsx ---


import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ArrowUpRight, DollarSign, Target, Zap, TrendingUp, Briefcase, Cpu, ShieldCheck, BarChart3, Rocket, Search, Loader2, MessageSquareText, UserCheck, Globe, BrainCircuit, Atom, Scale, Users, Network, SlidersHorizontal, AlertTriangle, CheckCircle, Clock, ExternalLink, X } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// --- Types ---

interface Startup {
  id: number;
  name: string;
  ticker: string;
  sector: string;
  valuation: number; // in millions USD
  fundraisingGoal: number; // in millions USD
  amountRaised: number; // in millions USD
  investors: number;
  description: string;
  growthRate: number; // percentage
  stage: 'Seed' | 'Series A' | 'Growth' | 'Pre-IPO' | 'Decentralized Genesis';
  syndicateLead: string;
  complianceScore: number; // 0-100
  techStack: string[];
  threatVector: {
    geopolitical: number;
    market: number;
    technological: number;
  };
  governanceModel: 'Centralized' | 'DAO Hybrid' | 'Fully Autonomous';
  quantumEntanglementID: string;
  founderReputationScore: number;
  marketSaturation: number;
  ipPortfolioStrength: number;
  societalImpactRating: 'A' | 'B' | 'C';
  hyperlaneConnectivity: boolean;
  aiMetrics: {
    riskScore: number;
    growthProjection: number;
    sentiment: string;
    disruptionIndex: number;
    marketPenetrationVector: number;
    geinScore: number;
    alphaFactor: number;
    teamSynergy: number;
  };
}

// --- AI Service Logic ---

const getAIAnalysis = async (startup: Startup) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a comprehensive venture capital analysis for the following company:
    Name: ${startup.name}
    Ticker: ${startup.ticker}
    Sector: ${startup.sector}
    Description: ${startup.description}
    Valuation: $${startup.valuation}M
    Stage: ${startup.stage}
    
    Include a summary of current market trends in ${startup.sector} using your search tools, and provide an "Alpha Factor" projection. Be professional and data-driven.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "Analysis unavailable.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title
    })).filter((s: any) => s.uri && s.title) || [];

    return { text, sources };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return { text: "Error connecting to Sovereign AI Core. Using cached heuristic model.", sources: [] };
  }
};

const aiAnalyzeDealFlow = (startup: Partial<Startup>): Startup['aiMetrics'] => {
    const baseRisk = 100 - (startup.growthRate || 0) * 1.5 - ((startup.founderReputationScore || 0) / 10);
    const riskScore = Math.max(10, Math.min(95, baseRisk + ((startup.valuation || 0) / 1000) - ((startup.ipPortfolioStrength || 0) / 10)));
    const growthProjection = (startup.growthRate || 0) * (1 + ((startup.amountRaised || 0) / (startup.fundraisingGoal || 1)) * 0.1);
    const disruptionIndex = ((startup.growthRate || 0) * 0.5) + ((startup.valuation || 0) / 100) + (100 - (startup.complianceScore || 0)) * 0.2 + ((startup.ipPortfolioStrength || 0) * 0.1);
    const marketPenetrationVector = Math.random() * 90;
    
    let sentiment = 'Neutral';
    if (growthProjection > 40) sentiment = 'Highly Positive';
    else if (riskScore < 30) sentiment = 'Low Risk/High Reward';
    else if (riskScore > 70) sentiment = 'Caution Advised';

    const geinScore = (startup.societalImpactRating === 'A' ? 200 : startup.societalImpactRating === 'B' ? 100 : 25) + ((startup.valuation || 0) / 5) + ((startup.ipPortfolioStrength || 0) * 1.5) + (startup.hyperlaneConnectivity ? 50 : 0);
    const alphaFactor = 1 + ((startup.founderReputationScore || 0) / 200) + (disruptionIndex / 500);
    const teamSynergy = Math.floor(Math.random() * 15) + 85;

    return {
        riskScore: parseFloat(riskScore.toFixed(1)),
        growthProjection: parseFloat(growthProjection.toFixed(2)),
        sentiment: sentiment,
        disruptionIndex: parseFloat(disruptionIndex.toFixed(1)),
        marketPenetrationVector: parseFloat(marketPenetrationVector.toFixed(1)),
        geinScore: parseFloat(geinScore.toFixed(1)),
        alphaFactor: parseFloat(alphaFactor.toFixed(2)),
        teamSynergy: parseFloat(teamSynergy.toFixed(1)),
    };
};

// --- Mock Data ---

const generateMockStartups = (count: number): Startup[] => {
  const sectors = ['Fintech', 'HealthTech', 'AgriTech', 'EdTech', 'Clean Energy', 'AI/ML', 'Logistics', 'Quantum Computing', 'BioPharma', 'Web3 Infrastructure'];
  const stages: Startup['stage'][] = ['Seed', 'Series A', 'Growth', 'Pre-IPO', 'Decentralized Genesis'];
  const governanceModels: Startup['governanceModel'][] = ['Centralized', 'DAO Hybrid', 'Fully Autonomous'];
  const techStacks = [['PQL', 'Rust', 'WASM'], ['Solidity', 'React', 'Node.js'], ['Python', 'TensorFlow', 'Kubernetes'], ['Go', 'Postgres', 'gRPC']];
  const societalImpactRatings: Startup['societalImpactRating'][] = ['A', 'B', 'C'];

  return Array.from({ length: count }, (_, i) => {
    const valuation = Math.floor(Math.random() * 900) + 10;
    const goal = Math.floor(valuation * 0.1) + 1;
    const raised = Math.floor(Math.random() * goal * 0.95) + 0.1;
    const growth = Math.random() * 50 + 5;
    const compliance = Math.floor(Math.random() * 30) + 70;
    const founderReputationScore = Math.floor(Math.random() * 40) + 60;
    const marketSaturation = Math.random() * 70;
    const ipPortfolioStrength = Math.floor(Math.random() * 50) + 50;
    const hyperlaneConnectivity = Math.random() > 0.3;

    const baseStartup: Omit<Startup, 'aiMetrics'> = {
      id: i + 1,
      name: `Ascendant Dynamics ${i + 1}`,
      ticker: `AD${1000 + i}`,
      sector: sectors[i % sectors.length],
      valuation: parseFloat(valuation.toFixed(1)),
      fundraisingGoal: parseFloat(goal.toFixed(1)),
      amountRaised: parseFloat(raised.toFixed(1)),
      investors: Math.floor(Math.random() * 20) + 1,
      description: `A paradigm-shifting enterprise leveraging distributed ledger technology for next-generation supply chain optimization and verifiable provenance tracking across global markets.`,
      growthRate: parseFloat(growth.toFixed(1)),
      stage: stages[i % stages.length],
      syndicateLead: `Global Capital Partners ${i % 3 + 1}`,
      complianceScore: compliance,
      techStack: techStacks[i % techStacks.length],
      threatVector: {
        geopolitical: parseFloat((Math.random() * 30).toFixed(1)),
        market: parseFloat((Math.random() * 50 + 20).toFixed(1)),
        technological: parseFloat((Math.random() * 40 + 10).toFixed(1)),
      },
      governanceModel: governanceModels[i % governanceModels.length],
      quantumEntanglementID: `QE-0x${(Math.random().toString(16) + '0000000000000').substr(2, 12).toUpperCase()}`,
      founderReputationScore,
      marketSaturation: parseFloat(marketSaturation.toFixed(1)),
      ipPortfolioStrength,
      societalImpactRating: societalImpactRatings[i % societalImpactRatings.length],
      hyperlaneConnectivity,
    };

    const aiMetrics = aiAnalyzeDealFlow(baseStartup);
    return { ...baseStartup, aiMetrics } as Startup;
  });
};

const mockStartups_initial = generateMockStartups(100);

// --- Components ---

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string; change?: string; aiInsight?: string; }> = ({ icon: Icon, title, value, change, aiInsight }) => (
  <Card className="bg-gray-900 border-l-4 border-cyan-500/50 hover:shadow-cyan-500/20 shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-300 uppercase tracking-wider">{title}</CardTitle>
      <Icon className="h-5 w-5 text-cyan-400" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-extrabold text-white">{value}</div>
      {change && <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{change} vs QTD</p>}
      {aiInsight && (
        <div className="mt-3 pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-500 flex items-center">
                <Cpu className="w-3 h-3 mr-1 text-indigo-400"/> AI Insight: {aiInsight}
            </p>
        </div>
      )}
    </CardContent>
  </Card>
);

const StartupCard: React.FC<{ startup: Startup; onInvest: (startup: Startup, amount: number) => void; onViewDetails: (startup: Startup) => void; }> = ({ startup, onInvest, onViewDetails }) => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const progress = (startup.amountRaised / startup.fundraisingGoal) * 100;

  const handleInvest = () => {
    const amount = parseFloat(investmentAmount);
    if (!isNaN(amount) && amount > 0) {
      onInvest(startup, amount);
      setInvestmentAmount('');
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 overflow-hidden group hover:border-cyan-500/50 transition-all">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-900/30 rounded-lg flex items-center justify-center text-cyan-400 font-bold">
            {startup.ticker.substring(0, 2)}
          </div>
          <div>
            <CardTitle className="text-white text-lg">{startup.name}</CardTitle>
            <p className="text-xs text-gray-500">{startup.sector} • {startup.stage}</p>
          </div>
        </div>
        <Badge variant={startup.aiMetrics.riskScore > 70 ? 'destructive' : 'default'} className="text-[10px]">
          {startup.aiMetrics.sentiment}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <p className="text-xs text-gray-400 line-clamp-2">{startup.description}</p>
        
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Progress: ${startup.amountRaised}M / ${startup.fundraisingGoal}M</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-2 bg-gray-900/50 rounded border border-gray-700">
            <p className="text-[10px] text-gray-500 uppercase">Valuation</p>
            <p className="text-sm font-bold text-white font-mono">${startup.valuation}M</p>
          </div>
          <div className="p-2 bg-gray-900/50 rounded border border-gray-700">
            <p className="text-[10px] text-gray-500 uppercase">Growth</p>
            <p className="text-sm font-bold text-green-400 font-mono">+{startup.growthRate}%</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input 
            type="number" 
            placeholder="Amount (M)" 
            value={investmentAmount}
            onChange={e => setInvestmentAmount(e.target.value)}
            className="flex-1 bg-gray-900 border-gray-700 text-white h-9 text-xs"
          />
          <Button onClick={handleInvest} className="bg-cyan-600 hover:bg-cyan-500 h-9 px-3 text-xs text-white">
            Invest
          </Button>
          <Button variant="outline" onClick={() => onViewDetails(startup)} className="h-9 px-3 text-xs border-gray-700 text-gray-300">
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const VentureCapitalDesk: React.FC = () => {
    const [startups, setStartups] = useState<Startup[]>(mockStartups_initial);
    const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<{ text: string, sources: any[] } | null>(null);

    const handleInvest = (startup: Startup, amount: number) => {
        setStartups(prev => prev.map(s => {
            if (s.id === startup.id) {
                return { ...s, amountRaised: s.amountRaised + amount, investors: s.investors + 1 };
            }
            return s;
        }));
    };

    const handleViewDetails = async (startup: Startup) => {
        setSelectedStartup(startup);
        setIsAnalysisLoading(true);
        setAiAnalysis(null);
        const analysis = await getAIAnalysis(startup);
        setAiAnalysis(analysis);
        setIsAnalysisLoading(false);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end border-b border-gray-800 pb-4">
                <div>
                    <h2 className="text-4xl font-extrabold text-white tracking-tighter">VENTURE CAPITAL DESK</h2>
                    <p className="text-gray-400 text-sm">Managing Alpha-Tier Growth Opportunities</p>
                </div>
                <div className="flex gap-4">
                    <StatCard icon={TrendingUp} title="AUM" value="$1.2B" change="+14.2%" />
                    <StatCard icon={Target} title="Active Deals" value="42" change="+3" />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {startups.map(startup => (
                    <StartupCard 
                        key={startup.id} 
                        startup={startup} 
                        onInvest={handleInvest} 
                        onViewDetails={handleViewDetails} 
                    />
                ))}
            </div>

            {selectedStartup && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-4xl w-full bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-white text-2xl">{selectedStartup.name} Analysis</CardTitle>
                            <Button variant="ghost" onClick={() => setSelectedStartup(null)} className="text-gray-400">
                                <X size={24} />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-widest">Company Overview</h4>
                                    <p className="text-gray-300 text-sm">{selectedStartup.description}</p>
                                    <Separator className="bg-gray-800" />
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-500">Sector</span><span className="text-white">{selectedStartup.sector}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Stage</span><span className="text-white">{selectedStartup.stage}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Valuation</span><span className="text-white">${selectedStartup.valuation}M</span></div>
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <h4 className="text-indigo-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                                        <BrainCircuit size={16} /> Sovereign AI Intelligence Report
                                    </h4>
                                    <div className="bg-gray-950 rounded-xl p-6 border border-indigo-500/30">
                                        {isAnalysisLoading ? (
                                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                                <p className="text-indigo-300 font-mono text-xs animate-pulse">SYNCHRONIZING WITH SOVEREIGN AI CORE...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{aiAnalysis?.text}</p>
                                                {aiAnalysis?.sources && aiAnalysis.sources.length > 0 && (
                                                    <div className="pt-4 border-t border-gray-800">
                                                        <h5 className="text-[10px] text-gray-500 uppercase font-bold mb-2">Grounding Sources</h5>
                                                        <div className="flex flex-wrap gap-2">
                                                            {aiAnalysis.sources.map((source, i) => (
                                                                <a key={i} href={source.uri} target="_blank" rel="noreferrer" className="text-[10px] bg-gray-900 border border-gray-700 px-2 py-1 rounded text-cyan-400 hover:border-cyan-400 transition-colors flex items-center gap-1">
                                                                    <Globe size={10} /> {source.title}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default VentureCapitalDesk;


// --- CONSOLIDATED FROM: VentureCapitalDesk (1)_1.tsx ---


import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ArrowUpRight, DollarSign, Target, Zap, TrendingUp, Briefcase, Cpu, ShieldCheck, BarChart3, Rocket, Search, Loader2, MessageSquareText, UserCheck, Globe, BrainCircuit, Atom, Scale, Users, Network, SlidersHorizontal, AlertTriangle, CheckCircle, Clock, ExternalLink, X } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

// --- Types ---

interface Startup {
  id: number;
  name: string;
  ticker: string;
  sector: string;
  valuation: number; // in millions USD
  fundraisingGoal: number; // in millions USD
  amountRaised: number; // in millions USD
  investors: number;
  description: string;
  growthRate: number; // percentage
  stage: 'Seed' | 'Series A' | 'Growth' | 'Pre-IPO' | 'Decentralized Genesis';
  syndicateLead: string;
  complianceScore: number; // 0-100
  techStack: string[];
  threatVector: {
    geopolitical: number;
    market: number;
    technological: number;
  };
  governanceModel: 'Centralized' | 'DAO Hybrid' | 'Fully Autonomous';
  quantumEntanglementID: string;
  founderReputationScore: number;
  marketSaturation: number;
  ipPortfolioStrength: number;
  societalImpactRating: 'A' | 'B' | 'C';
  hyperlaneConnectivity: boolean;
  aiMetrics: {
    riskScore: number;
    growthProjection: number;
    sentiment: string;
    disruptionIndex: number;
    marketPenetrationVector: number;
    geinScore: number;
    alphaFactor: number;
    teamSynergy: number;
  };
}

// --- AI Service Logic ---

const getAIAnalysis = async (startup: Startup) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Perform a comprehensive venture capital analysis for the following company:
    Name: ${startup.name}
    Ticker: ${startup.ticker}
    Sector: ${startup.sector}
    Description: ${startup.description}
    Valuation: $${startup.valuation}M
    Stage: ${startup.stage}
    
    Include a summary of current market trends in ${startup.sector} using your search tools, and provide an "Alpha Factor" projection. Be professional and data-driven.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "Analysis unavailable.";
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title
    })).filter((s: any) => s.uri && s.title) || [];

    return { text, sources };
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return { text: "Error connecting to Sovereign AI Core. Using cached heuristic model.", sources: [] };
  }
};

const aiAnalyzeDealFlow = (startup: Partial<Startup>): Startup['aiMetrics'] => {
    const baseRisk = 100 - (startup.growthRate || 0) * 1.5 - ((startup.founderReputationScore || 0) / 10);
    const riskScore = Math.max(10, Math.min(95, baseRisk + ((startup.valuation || 0) / 1000) - ((startup.ipPortfolioStrength || 0) / 10)));
    const growthProjection = (startup.growthRate || 0) * (1 + ((startup.amountRaised || 0) / (startup.fundraisingGoal || 1)) * 0.1);
    const disruptionIndex = ((startup.growthRate || 0) * 0.5) + ((startup.valuation || 0) / 100) + (100 - (startup.complianceScore || 0)) * 0.2 + ((startup.ipPortfolioStrength || 0) * 0.1);
    const marketPenetrationVector = Math.random() * 90;
    
    let sentiment = 'Neutral';
    if (growthProjection > 40) sentiment = 'Highly Positive';
    else if (riskScore < 30) sentiment = 'Low Risk/High Reward';
    else if (riskScore > 70) sentiment = 'Caution Advised';

    const geinScore = (startup.societalImpactRating === 'A' ? 200 : startup.societalImpactRating === 'B' ? 100 : 25) + ((startup.valuation || 0) / 5) + ((startup.ipPortfolioStrength || 0) * 1.5) + (startup.hyperlaneConnectivity ? 50 : 0);
    const alphaFactor = 1 + ((startup.founderReputationScore || 0) / 200) + (disruptionIndex / 500);
    const teamSynergy = Math.floor(Math.random() * 15) + 85;

    return {
        riskScore: parseFloat(riskScore.toFixed(1)),
        growthProjection: parseFloat(growthProjection.toFixed(2)),
        sentiment: sentiment,
        disruptionIndex: parseFloat(disruptionIndex.toFixed(1)),
        marketPenetrationVector: parseFloat(marketPenetrationVector.toFixed(1)),
        geinScore: parseFloat(geinScore.toFixed(1)),
        alphaFactor: parseFloat(alphaFactor.toFixed(2)),
        teamSynergy: parseFloat(teamSynergy.toFixed(1)),
    };
};

// --- Mock Data ---

const generateMockStartups = (count: number): Startup[] => {
  const sectors = ['Fintech', 'HealthTech', 'AgriTech', 'EdTech', 'Clean Energy', 'AI/ML', 'Logistics', 'Quantum Computing', 'BioPharma', 'Web3 Infrastructure'];
  const stages: Startup['stage'][] = ['Seed', 'Series A', 'Growth', 'Pre-IPO', 'Decentralized Genesis'];
  const governanceModels: Startup['governanceModel'][] = ['Centralized', 'DAO Hybrid', 'Fully Autonomous'];
  const techStacks = [['PQL', 'Rust', 'WASM'], ['Solidity', 'React', 'Node.js'], ['Python', 'TensorFlow', 'Kubernetes'], ['Go', 'Postgres', 'gRPC']];
  const societalImpactRatings: Startup['societalImpactRating'][] = ['A', 'B', 'C'];

  return Array.from({ length: count }, (_, i) => {
    const valuation = Math.floor(Math.random() * 900) + 10;
    const goal = Math.floor(valuation * 0.1) + 1;
    const raised = Math.floor(Math.random() * goal * 0.95) + 0.1;
    const growth = Math.random() * 50 + 5;
    const compliance = Math.floor(Math.random() * 30) + 70;
    const founderReputationScore = Math.floor(Math.random() * 40) + 60;
    const marketSaturation = Math.random() * 70;
    const ipPortfolioStrength = Math.floor(Math.random() * 50) + 50;
    const hyperlaneConnectivity = Math.random() > 0.3;

    const baseStartup: Omit<Startup, 'aiMetrics'> = {
      id: i + 1,
      name: `Ascendant Dynamics ${i + 1}`,
      ticker: `AD${1000 + i}`,
      sector: sectors[i % sectors.length],
      valuation: parseFloat(valuation.toFixed(1)),
      fundraisingGoal: parseFloat(goal.toFixed(1)),
      amountRaised: parseFloat(raised.toFixed(1)),
      investors: Math.floor(Math.random() * 20) + 1,
      description: `A paradigm-shifting enterprise leveraging distributed ledger technology for next-generation supply chain optimization and verifiable provenance tracking across global markets.`,
      growthRate: parseFloat(growth.toFixed(1)),
      stage: stages[i % stages.length],
      syndicateLead: `Global Capital Partners ${i % 3 + 1}`,
      complianceScore: compliance,
      techStack: techStacks[i % techStacks.length],
      threatVector: {
        geopolitical: parseFloat((Math.random() * 30).toFixed(1)),
        market: parseFloat((Math.random() * 50 + 20).toFixed(1)),
        technological: parseFloat((Math.random() * 40 + 10).toFixed(1)),
      },
      governanceModel: governanceModels[i % governanceModels.length],
      quantumEntanglementID: `QE-0x${(Math.random().toString(16) + '0000000000000').substr(2, 12).toUpperCase()}`,
      founderReputationScore,
      marketSaturation: parseFloat(marketSaturation.toFixed(1)),
      ipPortfolioStrength,
      societalImpactRating: societalImpactRatings[i % societalImpactRatings.length],
      hyperlaneConnectivity,
    };

    const aiMetrics = aiAnalyzeDealFlow(baseStartup);
    return { ...baseStartup, aiMetrics } as Startup;
  });
};

const mockStartups_initial = generateMockStartups(100);

// --- Components ---

const StatCard: React.FC<{ icon: React.ElementType; title: string; value: string; change?: string; aiInsight?: string; }> = ({ icon: Icon, title, value, change, aiInsight }) => (
  <Card className="bg-gray-900 border-l-4 border-cyan-500/50 hover:shadow-cyan-500/20 shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-300 uppercase tracking-wider">{title}</CardTitle>
      <Icon className="h-5 w-5 text-cyan-400" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-extrabold text-white">{value}</div>
      {change && <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{change} vs QTD</p>}
      {aiInsight && (
        <div className="mt-3 pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-500 flex items-center">
                <Cpu className="w-3 h-3 mr-1 text-indigo-400"/> AI Insight: {aiInsight}
            </p>
        </div>
      )}
    </CardContent>
  </Card>
);

const StartupCard: React.FC<{ startup: Startup; onInvest: (startup: Startup, amount: number) => void; onViewDetails: (startup: Startup) => void; }> = ({ startup, onInvest, onViewDetails }) => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const progress = (startup.amountRaised / startup.fundraisingGoal) * 100;

  const handleInvest = () => {
    const amount = parseFloat(investmentAmount);
    if (!isNaN(amount) && amount > 0) {
      onInvest(startup, amount);
      setInvestmentAmount('');
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 overflow-hidden group hover:border-cyan-500/50 transition-all">
      <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-900/30 rounded-lg flex items-center justify-center text-cyan-400 font-bold">
            {startup.ticker.substring(0, 2)}
          </div>
          <div>
            <CardTitle className="text-white text-lg">{startup.name}</CardTitle>
            <p className="text-xs text-gray-500">{startup.sector} • {startup.stage}</p>
          </div>
        </div>
        <Badge variant={startup.aiMetrics.riskScore > 70 ? 'destructive' : 'default'} className="text-[10px]">
          {startup.aiMetrics.sentiment}
        </Badge>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <p className="text-xs text-gray-400 line-clamp-2">{startup.description}</p>
        
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Progress: ${startup.amountRaised}M / ${startup.fundraisingGoal}M</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-2 bg-gray-900/50 rounded border border-gray-700">
            <p className="text-[10px] text-gray-500 uppercase">Valuation</p>
            <p className="text-sm font-bold text-white font-mono">${startup.valuation}M</p>
          </div>
          <div className="p-2 bg-gray-900/50 rounded border border-gray-700">
            <p className="text-[10px] text-gray-500 uppercase">Growth</p>
            <p className="text-sm font-bold text-green-400 font-mono">+{startup.growthRate}%</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input 
            type="number" 
            placeholder="Amount (M)" 
            value={investmentAmount}
            onChange={e => setInvestmentAmount(e.target.value)}
            className="flex-1 bg-gray-900 border-gray-700 text-white h-9 text-xs"
          />
          <Button onClick={handleInvest} className="bg-cyan-600 hover:bg-cyan-500 h-9 px-3 text-xs text-white">
            Invest
          </Button>
          <Button variant="outline" onClick={() => onViewDetails(startup)} className="h-9 px-3 text-xs border-gray-700 text-gray-300">
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const VentureCapitalDesk: React.FC = () => {
    const [startups, setStartups] = useState<Startup[]>(mockStartups_initial);
    const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<{ text: string, sources: any[] } | null>(null);

    const handleInvest = (startup: Startup, amount: number) => {
        setStartups(prev => prev.map(s => {
            if (s.id === startup.id) {
                return { ...s, amountRaised: s.amountRaised + amount, investors: s.investors + 1 };
            }
            return s;
        }));
    };

    const handleViewDetails = async (startup: Startup) => {
        setSelectedStartup(startup);
        setIsAnalysisLoading(true);
        setAiAnalysis(null);
        const analysis = await getAIAnalysis(startup);
        setAiAnalysis(analysis);
        setIsAnalysisLoading(false);
    };

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end border-b border-gray-800 pb-4">
                <div>
                    <h2 className="text-4xl font-extrabold text-white tracking-tighter">VENTURE CAPITAL DESK</h2>
                    <p className="text-gray-400 text-sm">Managing Alpha-Tier Growth Opportunities</p>
                </div>
                <div className="flex gap-4">
                    <StatCard icon={TrendingUp} title="AUM" value="$1.2B" change="+14.2%" />
                    <StatCard icon={Target} title="Active Deals" value="42" change="+3" />
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {startups.map(startup => (
                    <StartupCard 
                        key={startup.id} 
                        startup={startup} 
                        onInvest={handleInvest} 
                        onViewDetails={handleViewDetails} 
                    />
                ))}
            </div>

            {selectedStartup && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-4xl w-full bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-white text-2xl">{selectedStartup.name} Analysis</CardTitle>
                            <Button variant="ghost" onClick={() => setSelectedStartup(null)} className="text-gray-400">
                                <X size={24} />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <h4 className="text-cyan-400 font-bold uppercase text-xs tracking-widest">Company Overview</h4>
                                    <p className="text-gray-300 text-sm">{selectedStartup.description}</p>
                                    <Separator className="bg-gray-800" />
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-500">Sector</span><span className="text-white">{selectedStartup.sector}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Stage</span><span className="text-white">{selectedStartup.stage}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Valuation</span><span className="text-white">${selectedStartup.valuation}M</span></div>
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-4">
                                    <h4 className="text-indigo-400 font-bold uppercase text-xs tracking-widest flex items-center gap-2">
                                        <BrainCircuit size={16} /> Sovereign AI Intelligence Report
                                    </h4>
                                    <div className="bg-gray-950 rounded-xl p-6 border border-indigo-500/30">
                                        {isAnalysisLoading ? (
                                            <div className="flex flex-col items-center justify-center py-12 gap-4">
                                                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                                <p className="text-indigo-300 font-mono text-xs animate-pulse">SYNCHRONIZING WITH SOVEREIGN AI CORE...</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{aiAnalysis?.text}</p>
                                                {aiAnalysis?.sources && aiAnalysis.sources.length > 0 && (
                                                    <div className="pt-4 border-t border-gray-800">
                                                        <h5 className="text-[10px] text-gray-500 uppercase font-bold mb-2">Grounding Sources</h5>
                                                        <div className="flex flex-wrap gap-2">
                                                            {aiAnalysis.sources.map((source, i) => (
                                                                <a key={i} href={source.uri} target="_blank" rel="noreferrer" className="text-[10px] bg-gray-900 border border-gray-700 px-2 py-1 rounded text-cyan-400 hover:border-cyan-400 transition-colors flex items-center gap-1">
                                                                    <Globe size={10} /> {source.title}
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default VentureCapitalDesk;


// --- CONSOLIDATED FROM: VentureCapitalDesk (2).tsx ---

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, DollarSign, Target, Zap, TrendingUp, Briefcase, Cpu, ShieldCheck, BarChart3, Rocket, Search, Loader2, MessageSquareText, UserCheck, Globe } from 'lucide-react';

// --- Startup Data Structures ---
interface Startup {
  id: number;
  name: string;
  ticker: string;
  sector: string;
  valuation: number; // in millions USD
  fundraisingGoal: number; // in millions USD
  amountRaised: number; // in millions USD
  investors: number;
  description: string;
  growthRate: number; // percentage
  stage: 'Seed' | 'Series A' | 'Growth' | 'Pre-IPO';
  aiMetrics: {
    riskScore: number;
    growthProjection: number;
    sentiment: string;
  };
  syndicateLead: string;
  complianceScore: number; // 0-100
}

// --- AI Integration Service (Refactored for stability and production readiness) ---
// Rationale: Replaced direct, synchronous AI functions with an encapsulated, asynchronous service.
// In a production environment, this `aiService` would be a client for a dedicated AI API gateway,
// handling features like rate limiting, retries, circuit breakers, schema validation,
// and potentially integrating with AWS Secrets Manager for API keys.
// The current implementation simulates network latency and asynchronous operations.
const aiService = {
  /**
   * Simulates a deep AI analysis on a startup.
   * @param startup The startup object to analyze.
   * @returns A promise resolving to AI-driven risk score, growth projection, and sentiment.
   */
  analyzeDealFlow: async (startup: Startup): Promise<{ riskScore: number; growthProjection: number; sentiment: string }> => {
    // Simulate API call delay for a non-blocking UI
    await new Promise(resolve => setTimeout(resolve, 300));

    // Core AI logic (simplified for mockup, but representing complex model output)
    const baseRisk = 100 - startup.growthRate * 1.5;
    const riskScore = Math.max(10, Math.min(95, baseRisk + (startup.valuation / 1000)));
    const growthProjection = startup.growthRate * (1 + (startup.amountRaised / startup.fundraisingGoal) * 0.1);
    
    let sentiment = 'Neutral';
    if (growthProjection > 40) sentiment = 'Highly Positive';
    else if (riskScore < 30) sentiment = 'Low Risk/High Reward';
    else if (riskScore > 70) sentiment = 'Caution Advised';

    return {
      riskScore: parseFloat(riskScore.toFixed(1)),
      growthProjection: parseFloat(growthProjection.toFixed(2)),
      sentiment: sentiment,
    };
  },

  /**
   * Simulates generating an executive summary using AI.
   * @param startup The startup object for which to generate a summary.
   * @returns A promise resolving to an AI-generated executive summary string.
   */
  generateExecutiveSummary: async (startup: Startup): Promise<string> => {
    // Simulate longer API call delay for summary generation
    await new Promise(resolve => setTimeout(resolve, 700)); // Increased delay for a more realistic "deep dive" feel
    
    // Call the internal analysis method (which is also async)
    const analysis = await aiService.analyzeDealFlow(startup); // Uses the async analysis function

    return `AI Executive Summary for ${startup.name} (${startup.sector}):
    Valuation: $${startup.valuation}M. Goal: $${startup.fundraisingGoal}M raised: $${startup.amountRaised}M.
    The proprietary AI risk assessment places this opportunity at a ${analysis.riskScore}% risk score, indicating ${analysis.sentiment} potential. Projected annualized growth rate is ${analysis.growthProjection}%.
    Recommendation Engine suggests immediate allocation based on sector alignment and stage maturity.`;
  },
};

// --- Mock Data Generation ---
const generateMockStartups = (count: number): Startup[] => {
  const sectors = ['Fintech', 'HealthTech', 'AgriTech', 'EdTech', 'Clean Energy', 'AI/ML', 'Logistics', 'Quantum Computing', 'BioPharma'];
  const stages = ['Seed', 'Series A', 'Growth', 'Pre-IPO'];

  return Array.from({ length: count }, (_, i) => {
    const valuation = Math.floor(Math.random() * 900) + 10; // 10M to 1000M
    const goal = Math.floor(valuation * 0.1) + 1; // 1M to 100M
    const raised = Math.floor(Math.random() * goal * 0.95) + 0.1;
    const growth = Math.random() * 50 + 5;
    const compliance = Math.floor(Math.random() * 30) + 70; // Mostly compliant

    const baseStartup: Omit<Startup, 'aiMetrics'> = {
      id: i + 1,
      name: `Ascendant Dynamics ${i + 1}`,
      ticker: `AD${1000 + i}`,
      sector: sectors[i % sectors.length],
      valuation: parseFloat(valuation.toFixed(1)),
      fundraisingGoal: parseFloat(goal.toFixed(1)),
      amountRaised: parseFloat(raised.toFixed(1)),
      investors: Math.floor(Math.random() * 20) + 1,
      description: `A paradigm-shifting enterprise leveraging distributed ledger technology for next-generation supply chain optimization and verifiable provenance tracking across global markets.`,
      growthRate: parseFloat(growth.toFixed(1)),
      stage: stages[i % stages.length],
      syndicateLead: `Global Capital Partners ${i % 3 + 1}`,
      complianceScore: compliance,
    };

    // For initial mock data generation, we can run the analysis synchronously.
    // In a real application, this data would likely be pre-processed on the backend
    // or fetched asynchronously after the component mounts.
    const aiMetrics = { 
      riskScore: 0, 
      growthProjection: 0, 
      sentiment: '' 
    }; // Placeholder, will be filled below to avoid async in loop
    // Re-calculating with the actual logic to get realistic starting values for the mock
    const { riskScore, growthProjection, sentiment } = (({ growthRate, valuation, amountRaised, fundraisingGoal }) => {
        const baseRiskCalc = 100 - growthRate * 1.5;
        const rs = Math.max(10, Math.min(95, baseRiskCalc + (valuation / 1000)));
        const gp = growthRate * (1 + (amountRaised / fundraisingGoal) * 0.1);
        let s = 'Neutral';
        if (gp > 40) s = 'Highly Positive';
        else if (rs < 30) s = 'Low Risk/High Reward';
        else if (rs > 70) s = 'Caution Advised';
        return { riskScore: parseFloat(rs.toFixed(1)), growthProjection: parseFloat(gp.toFixed(2)), sentiment: s };
    })(baseStartup);
    
    Object.assign(aiMetrics, { riskScore, growthProjection, sentiment });

    return { ...baseStartup, aiMetrics };
  });
};

const mockStartups: Startup[] = generateMockStartups(100);

// --- Sub-components for better structure ---

interface StatCardProps { 
    icon: React.ElementType; 
    title: string; 
    value: string; 
    change?: string; 
    aiInsight?: string; 
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, change, aiInsight }) => (
  <Card className="bg-gray-900 border-l-4 border-cyan-500/50 hover:shadow-cyan-500/20 shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-300 uppercase tracking-wider">{title}</CardTitle>
      <Icon className="h-5 w-5 text-cyan-400" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-extrabold text-white">{value}</div>
      {change && <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{change} vs QTD</p>}
      {aiInsight && (
        <div className="mt-3 pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-500 flex items-center">
                <Cpu className="w-3 h-3 mr-1 text-indigo-400"/> AI Insight: {aiInsight}
            </p>
        </div>
      )}
    </CardContent>
  </Card>
);

interface StartupCardProps { 
    startup: Startup; 
    onInvest: (startup: Startup, amount: number) => void;
    onViewDetails: (startup: Startup) => void;
}

const StartupCard: React.FC<StartupCardProps> = ({ startup, onInvest, onViewDetails }) => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const progress = (startup.amountRaised / startup.fundraisingGoal) * 100;
  const ai = startup.aiMetrics;

  const handleInvest = () => {
    const amount = parseFloat(investmentAmount);
    // Ensure investment is positive and within the remaining goal
    if (!isNaN(amount) && amount > 0 && amount <= (startup.fundraisingGoal - startup.amountRaised)) {
      onInvest(startup, amount); // Pass amount in millions
      setInvestmentAmount('');
    } else if (amount > (startup.fundraisingGoal - startup.amountRaised)) {
        alert(`Investment exceeds remaining goal of $${(startup.fundraisingGoal - startup.amountRaised).toFixed(2)}M.`);
    } else {
        alert("Please enter a valid positive investment amount.");
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'bg-green-600/20 text-green-400 border-green-500';
    if (score < 60) return 'bg-yellow-600/20 text-yellow-400 border-yellow-500';
    return 'bg-red-600/20 text-red-400 border-red-500';
  };

  return (
    <Card className="flex flex-col h-full bg-gray-900 border border-gray-800 hover:border-cyan-500/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-white hover:text-cyan-400 cursor-pointer" onClick={() => onViewDetails(startup)}>{startup.name}</CardTitle>
            <p className="text-sm text-gray-400 mt-1 flex items-center">
                <Globe className="w-3 h-3 mr-1"/> {startup.sector} | <span className='ml-1 font-mono text-xs text-gray-500'>{startup.ticker}</span>
            </p>
          </div>
          <Badge variant="default" className={`text-xs font-semibold ${startup.stage === 'Pre-IPO' ? 'bg-purple-600' : 'bg-cyan-600'}`}>{startup.stage}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 pt-0">
        <p className="text-sm text-gray-400 line-clamp-3 italic">{startup.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-800 pt-3">
            <div className='flex flex-col'>
                <span className="text-xs text-gray-500 uppercase">Valuation</span>
                <span className="font-bold text-white">${startup.valuation.toFixed(1)}M</span>
            </div>
            <div className='flex flex-col'>
                <span className="text-xs text-gray-500 uppercase">Syndicate Lead</span>
                <span className="font-semibold text-indigo-400 text-sm">{startup.syndicateLead}</span>
            </div>
        </div>

        {/* AI Metrics Snapshot */}
        <div className="space-y-2 p-2 bg-gray-800/50 rounded-lg border border-indigo-700/50">
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><TrendingUp className='w-3 h-3 mr-1'/> Projected Growth</span>
                <span className='font-bold text-green-400'>{ai.growthProjection.toFixed(1)}%</span>
            </div>
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><ShieldCheck className='w-3 h-3 mr-1'/> Compliance Score</span>
                <Badge className={`px-2 py-0.5 text-xs ${startup.complianceScore > 90 ? 'bg-green-700' : 'bg-yellow-700'}`}>{startup.complianceScore}%</Badge>
            </div>
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><Zap className='w-3 h-3 mr-1'/> AI Sentiment</span>
                <Badge className={`px-2 py-0.5 text-xs ${getRiskColor(ai.riskScore)} border`}>{ai.sentiment}</Badge>
            </div>
        </div>

        {/* Fundraising Progress */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Capital Deployed</span>
            <span className='font-semibold'>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className='h-2 bg-gray-700' indicatorClassName={progress >= 100 ? 'bg-green-500' : 'bg-cyan-500'} />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>${startup.amountRaised.toFixed(1)}M raised</span>
            <span>Goal: ${startup.fundraisingGoal.toFixed(1)}M</span>
          </div>
        </div>

        {/* Investment Interface */}
        <div className="flex space-x-2 pt-2 border-t border-gray-800">
          <Input 
            type="number" 
            placeholder="USD (M)" 
            className="flex-grow text-sm bg-gray-800 border-gray-700 focus:border-cyan-500" 
            value={investmentAmount} 
            onChange={(e) => setInvestmentAmount(e.target.value)}
            min="0.01"
            step="0.1"
          />
          <Button 
            onClick={handleInvest} 
            disabled={!investmentAmount || parseFloat(investmentAmount) <= 0}
            className="bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            Commit
          </Button>
        </div>
        <Button variant="outline" className='w-full text-xs' onClick={() => onViewDetails(startup)}>
            Deep Dive Analysis <ArrowUpRight className="ml-1 h-3 w-3"/>
        </Button>
      </CardContent>
    </Card>
  );
};

// --- Modal for Deep Dive Analysis ---
interface DetailModalProps {
    startup: Startup;
    onClose: () => void;
    onInvest: (startup: Startup, amount: number) => void;
}

const DeepDiveModal: React.FC<DetailModalProps> = ({ startup, onClose, onInvest }) => {
    const [localInvestment, setLocalInvestment] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const ai = startup.aiMetrics;
    const remainingGoal = startup.fundraisingGoal - startup.amountRaised;

    // Rationale: Fetches AI summary asynchronously using the new aiService.
    // Includes loading and basic error handling states for a more robust UI.
    useEffect(() => {
        const fetchSummary = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const generatedSummary = await aiService.generateExecutiveSummary(startup);
                setSummary(generatedSummary);
            } catch (err) {
                console.error("Failed to generate AI summary:", err);
                setError("Failed to retrieve AI summary. Please try again.");
                setSummary("AI summary currently unavailable."); // Fallback summary
            } finally {
                setIsLoading(false);
            }
        };
        fetchSummary();
    }, [startup]); // Reruns if the selected startup changes

    const handleCommit = () => {
        const amount = parseFloat(localInvestment);
        // Pass amount in millions (as input is in millions)
        if (!isNaN(amount) && amount > 0 && amount <= remainingGoal) {
            onInvest(startup, amount); 
            onClose();
        } else {
            alert(`Invalid amount. Must be between $0.01M and $${remainingGoal.toFixed(2)}M.`);
        }
    };

    const getRiskColorClass = (score: number) => {
        if (score < 30) return 'text-green-400 border-green-500';
        if (score < 60) return 'text-yellow-400 border-yellow-500';
        return 'text-red-400 border-red-500';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-950 border-cyan-500/50 shadow-2xl">
                <CardHeader className="sticky top-0 bg-gray-950 z-10 border-b border-gray-800 flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl text-white">{startup.name} Deep Dive</CardTitle>
                        <p className="text-md text-cyan-400 mt-1">{startup.sector} | {startup.ticker} | {startup.stage}</p>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
                        <Cpu className="w-6 h-6 rotate-90" /> {/* Changed icon to a more neutral 'X' or 'Close' if available, or keep as CPU symbolizing AI context. Keeping CPU for thematic consistency. */}
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                    
                    {/* AI Summary Panel */}
                    <div className="p-4 bg-indigo-900/20 border border-indigo-700 rounded-lg">
                        <h3 className="text-xl font-semibold text-indigo-300 flex items-center mb-2"><MessageSquareText className='w-5 h-5 mr-2'/> AI Synthesis Report</h3>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8 text-gray-400"><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Generating Billion-Dollar Insights...</div>
                        ) : error ? (
                            <div className="py-4 text-red-400 text-center">{error}</div>
                        ) : (
                            <p className="whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">{summary}</p>
                        )}
                    </div>

                    {/* Core Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-b border-gray-800 pb-4">
                        <StatCard 
                            icon={DollarSign} 
                            title="Current Valuation" 
                            value={`$${startup.valuation.toFixed(1)}M`} 
                            aiInsight={`AI projects ${ai.growthProjection.toFixed(1)}% forward growth.`}
                        />
                        <StatCard 
                            icon={Target} 
                            title="Remaining Raise" 
                            value={`$${remainingGoal.toFixed(2)}M`} 
                            change={remainingGoal > 0 ? `+${((remainingGoal / startup.fundraisingGoal) * 100).toFixed(1)}%` : 'Complete'}
                        />
                        <StatCard 
                            icon={ShieldCheck} 
                            title="Compliance Rating" 
                            value={`${startup.complianceScore}%`} 
                            change={startup.complianceScore > 90 ? '+0.5%' : '-0.1%'}
                        />
                        <StatCard 
                            icon={Zap} 
                            title="AI Risk Score" 
                            value={`${ai.riskScore}%`} 
                            change={ai.sentiment.includes('Low Risk') ? '+1.2%' : '-0.8%'}
                        />
                    </div>

                    {/* Detailed Information */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className='lg:col-span-2 space-y-4'>
                            <h4 className='text-lg font-semibold text-white border-b border-gray-800 pb-1'>Operational Profile</h4>
                            <p className='text-gray-300 text-sm'>{startup.description} This entity is managed under the oversight of {startup.syndicateLead}.</p>
                            
                            <div className='space-y-2 p-3 bg-gray-900 rounded-lg'>
                                <p className='text-xs text-gray-500 uppercase'>Technology Stack & IP</p>
                                <p className='text-sm text-white'>Proprietary Quantum-Resistant Ledger (PQL) implementation.</p>
                                <p className='text-xs text-gray-500 mt-2'>Investor Count: {startup.investors} | Total Rounds: {Math.floor(startup.id / 10) + 1}</p>
                            </div>
                        </div>
                        
                        <div className='space-y-4'>
                            <h4 className='text-lg font-semibold text-white border-b border-gray-800 pb-1'>Investment Action</h4>
                            <div className='p-4 bg-gray-800 rounded-lg space-y-3'>
                                <p className='text-sm text-gray-300'>Commit Capital (in Millions USD):</p>
                                <Input 
                                    type="number" 
                                    placeholder={`Max: ${remainingGoal.toFixed(2)}M`} 
                                    className="w-full text-lg bg-gray-700 border-gray-600 focus:border-cyan-500" 
                                    value={localInvestment} 
                                    onChange={(e) => setLocalInvestment(e.target.value)}
                                    min="0.01"
                                    step="0.1"
                                />
                                <Button 
                                    onClick={handleCommit} 
                                    disabled={!localInvestment || parseFloat(localInvestment) <= 0 || parseFloat(localInvestment) > remainingGoal}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white text-base py-2"
                                >
                                    <UserCheck className='w-4 h-4 mr-2'/> Execute Capital Deployment
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Progress Visualization */}
                    <div className='pt-4 border-t border-gray-800'>
                        <h4 className='text-lg font-semibold text-white mb-2'>Fundraising Trajectory</h4>
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>Raised: <span className='font-bold text-white'>${startup.amountRaised.toFixed(1)}M</span></span>
                            <span>Goal: <span className='font-bold text-white'>${startup.fundraisingGoal.toFixed(1)}M</span></span>
                        </div>
                        <Progress value={((startup.amountRaised / startup.fundraisingGoal) * 100)} className='h-3 bg-gray-700' indicatorClassName={startup.amountRaised >= startup.fundraisingGoal ? 'bg-green-500' : 'bg-cyan-500'} />
                        <p className='text-xs text-gray-500 mt-1'>{(startup.amountRaised / startup.fundraisingGoal * 100).toFixed(1)}% of target achieved.</p>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};


// --- Main Component: VentureCapitalDesk ---

const VentureCapitalDesk: React.FC = () => {
  // Initialize with a larger set, simulating access to the full 100 opportunities
  const [startups, setStartups] = useState<Startup[]>(mockStartups); 
  const [searchTerm, setSearchTerm] = useState('');
  const [portfolioValue] = useState(15000000000); // Mock portfolio value: $15 Billion
  const [deployedCapital] = useState(4200000000); // Mock deployed capital: $4.2 Billion
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);

  const handleInvest = useCallback(async (investedStartup: Startup, amount: number) => {
    // Rationale: Re-running AI analysis asynchronously after investment to reflect new data.
    // This simulates real-time updates and avoids blocking the UI during AI processing.
    const updatedStartups = await Promise.all(
      startups.map(async s => {
        if (s.id === investedStartup.id) {
          const newAmountRaised = s.amountRaised + amount;
          const updatedStartup = { 
            ...s, 
            amountRaised: newAmountRaised, 
            investors: s.investors + 1,
          };
          // Asynchronously re-analyze the updated startup
          const newAiMetrics = await aiService.analyzeDealFlow(updatedStartup);
          return { ...updatedStartup, aiMetrics: newAiMetrics };
        }
        return s;
      })
    );
    setStartups(updatedStartups);

    // In a real system, this would trigger a transaction confirmation modal/API call.
    console.log(`Investment of $${amount.toFixed(2)}M committed to ${investedStartup.name}`);
  }, [startups]);

  const filteredStartups = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return startups
        .filter(s => 
            s.name.toLowerCase().includes(lowerSearchTerm) ||
            s.sector.toLowerCase().includes(lowerSearchTerm) ||
            s.ticker.toLowerCase().includes(lowerSearchTerm)
        )
        .sort((a, b) => b.aiMetrics.growthProjection - a.aiMetrics.growthProjection); // Default sort by AI projection
  }, [startups, searchTerm]);

  const totalPortfolioExposure = useMemo(() => {
      // Calculate total capital raised across all tracked startups, in millions
      return startups.reduce((sum, s) => sum + s.amountRaised, 0);
  }, [startups]);

  const handleViewDetails = useCallback((startup: Startup) => {
    setSelectedStartup(startup);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedStartup(null);
  }, []);

  return (
    <div className="space-y-8 p-4 md:p-8 min-h-screen bg-gray-950 text-white">
      
      {/* Header and Global Controls */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-cyan-400">Quantum Capital Nexus</h1>
          <p className="text-lg text-gray-400 mt-1">Advanced Investment Platform // Portfolio Management Layer 7</p>
        </div>
        <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30">
          Execute Automated Allocation <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </header>

      {/* Rationale: Replaced the "IDGAF.AI Protocol Mandate" block.
          This block was identified as a "deliberately flawed" and "chaos" component.
          It has been replaced with a clean, standard component that aligns with a production-ready platform,
          focusing on providing useful information about the AI capabilities rather than an aggressive manifesto. */}
      <Card className="bg-gray-900 border-2 border-indigo-700/50 shadow-xl shadow-indigo-900/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-indigo-400 flex items-center"><Cpu className='w-6 h-6 mr-2'/> AI-Powered Intelligence Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-300">
          <p className="text-base italic border-l-4 border-indigo-500 pl-3">
            "Our proprietary AI engine continuously analyzes market dynamics, deal flow, and compliance postures to identify optimal investment opportunities. Leveraging advanced machine learning and predictive analytics, it ensures capital is deployed with maximum efficiency and strategic alignment, driving superior portfolio performance."
          </p>
          <p className="text-sm text-gray-500">— Quantum AI Core, Version 3.1.2</p>
          <div className='flex items-center text-sm text-gray-400'>
            <ShieldCheck className='w-4 h-4 mr-2 text-green-400'/>
            <span>AI models are regularly audited for bias and fairness.</span>
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators (KPIs) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
            icon={Briefcase} 
            title="Total Portfolio Value" 
            value={`$${(portfolioValue / 1000000000).toFixed(2)}B`} 
            change="+1.8%" 
            aiInsight="AI predicts sustained 1.5% MoM appreciation."
        />
        <StatCard 
            icon={DollarSign} 
            title="Capital Deployed (M)" 
            value={`$${totalPortfolioExposure.toFixed(2)}M`} 
            aiInsight={`Exposure concentration at ${((totalPortfolioExposure / (portfolioValue / 1000)) * 100).toFixed(1)}% of total fund capacity.`}
        />
        <StatCard 
            icon={BarChart3} 
            title="Active Deal Flow" 
            value={`${filteredStartups.length} / ${mockStartups.length}`} 
            change={`+${(filteredStartups.length / mockStartups.length * 100).toFixed(0)}% visibility`} 
            aiInsight="Pipeline velocity increased by 14% this cycle."
        />
        <StatCard 
            icon={Rocket} 
            title="Avg. AI Growth Rate" 
            value={`${(startups.reduce((sum, s) => sum + s.aiMetrics.growthProjection, 0) / startups.length).toFixed(1)}%`} 
            change="+0.4%" 
            aiInsight="Sector diversification optimized for Q4 volatility."
        />
      </div>
      
      {/* Search and Filtering */}
      <div className="flex flex-col sm:flex-row gap-4 items-center pt-4 border-t border-gray-800">
        <div className="relative flex-grow w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
                placeholder="Search by Name, Ticker, or Sector (e.g., 'Fintech' or 'AD1005')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 bg-gray-800 border-gray-700 focus:border-cyan-500"
            />
        </div>
        <Badge variant="secondary" className='text-sm py-2 px-4 bg-gray-800 border border-gray-700 text-gray-300'>
            Displaying {filteredStartups.length} Opportunities
        </Badge>
      </div>

      {/* Startup Listing Grid */}
      {filteredStartups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStartups.map(startup => (
            <StartupCard 
                key={startup.id} 
                startup={startup} 
                onInvest={handleInvest} 
                onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-700 rounded-xl bg-gray-900/50">
            <Target className="w-10 h-10 mx-auto text-gray-600 mb-3"/>
            <h3 className="text-xl font-semibold text-gray-400">No Opportunities Match Query</h3>
            <p className="text-gray-500">Adjust your search parameters or wait for the next AI pipeline ingestion cycle.</p>
        </div>
      )}

      {/* Deep Dive Modal */}
      {selectedStartup && (
        <DeepDiveModal 
            startup={selectedStartup} 
            onClose={handleCloseDetails} 
            onInvest={handleInvest}
        />
      )}
    </div>
  );
};

export default VentureCapitalDesk;

// --- CONSOLIDATED FROM: VentureCapitalDesk_1.tsx ---

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Legend, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { 
  Rocket, TrendingUp, DollarSign, Activity, PieChart, 
  Send, Shield, Search, Zap, Globe, Briefcase, 
  FileText, Users, Server, Lock, AlertTriangle, CheckCircle,
  ChevronRight, Terminal, RefreshCw, Star, Coins,
  ArrowUpRight, ArrowDownRight, Filter, Download
} from 'lucide-react';

/**
 * ============================================================================
 * THE JAMES BURVEL O’CALLAGHAN III CODE
 * MODULE: VentureCapitalDesk (VCD) - "The Sovereign Deal Engine"
 * VERSION: 6.0.0-OMEGA (HOTFIXED)
 * ============================================================================
 */

// ============================================================================
// 1. CONFIGURATION & TYPES
// ============================================================================

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || ""; 

type DealStage = 'sourcing' | 'screening' | 'due_diligence' | 'term_sheet' | 'portfolio' | 'pass' | 'exit';
type Sector = 'Fintech' | 'AI/ML' | 'Biotech' | 'CleanTech' | 'SaaS' | 'Crypto' | 'SpaceTech' | 'Quantum';
type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

interface Founder {
    id: string;
    name: string;
    role: string;
    exCompany: string;
    education: string;
    linkedIn?: string;
    avatarUrl?: string;
}

interface Financials {
    arr: number;
    burnRate: number;
    runwayMonths: number;
    lastRoundValuation: number;
    ask: number;
    equityOffered: number;
    capTable: { shareholder: string; percentage: number }[];
}

interface Deal {
    id: string;
    name: string;
    description: string;
    sector: Sector;
    stage: DealStage;
    financials: Financials;
    founders: Founder[];
    aiScore: number; // 0-100
    riskLevel: RiskLevel;
    lastActivity: string;
    tags: string[];
    documents: string[];
    sentimentScore: number; // 0-100
}

interface ChatMessage {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    timestamp: number;
    metadata?: any;
}

// ============================================================================
// 2. MOCK DATA ENGINE
// ============================================================================

const GENERATE_ID = () => Math.random().toString(36).substr(2, 9).toUpperCase();

const MOCK_DEALS: Deal[] = [
    {
        id: 'D-101', name: 'Nexus Neural', description: 'Decentralized compute grid for LLM training.',
        sector: 'AI/ML', stage: 'due_diligence', 
        financials: {
            arr: 1200000, burnRate: 150000, runwayMonths: 18, lastRoundValuation: 45000000,
            ask: 5000000, equityOffered: 10,
            capTable: [{ shareholder: 'Founders', percentage: 60 }, { shareholder: 'Seed VC', percentage: 20 }, { shareholder: 'Pool', percentage: 20 }]
        },
        founders: [{ id: 'F1', name: 'Dr. Elena S.', role: 'CEO', exCompany: 'Google DeepMind', education: 'PhD, MIT' }],
        aiScore: 94, riskLevel: 'Medium', lastActivity: '2h ago', tags: ['Infrastructure', 'High Growth'],
        documents: ['Pitch Deck', 'Technical Whitepaper', 'Audited Financials'],
        sentimentScore: 88
    },
    {
        id: 'D-102', name: 'Solaris Bio', description: 'Photosynthetic algae for carbon capture at gigaton scale.',
        sector: 'CleanTech', stage: 'screening', 
        financials: {
            arr: 50000, burnRate: 80000, runwayMonths: 12, lastRoundValuation: 15000000,
            ask: 2500000, equityOffered: 15,
            capTable: [{ shareholder: 'Founders', percentage: 80 }, { shareholder: 'Angel', percentage: 10 }, { shareholder: 'Pool', percentage: 10 }]
        },
        founders: [{ id: 'F2', name: 'James T.', role: 'CTO', exCompany: 'MIT Media Lab', education: 'MSc, Stanford' }],
        aiScore: 78, riskLevel: 'High', lastActivity: '1d ago', tags: ['ESG', 'Hardware', 'Moonshot'],
        documents: ['Pitch Deck', 'Lab Results'],
        sentimentScore: 72
    },
    {
        id: 'D-103', name: 'Orbital Logistics', description: 'Last-mile delivery for LEO space stations.',
        sector: 'SpaceTech', stage: 'sourcing', 
        financials: {
            arr: 0, burnRate: 200000, runwayMonths: 9, lastRoundValuation: 80000000,
            ask: 10000000, equityOffered: 10,
            capTable: [{ shareholder: 'Founders', percentage: 70 }, { shareholder: 'Series A', percentage: 20 }, { shareholder: 'Pool', percentage: 10 }]
        },
        founders: [{ id: 'F3', name: 'Sarah C.', role: 'COO', exCompany: 'SpaceX', education: 'MBA, Harvard' }],
        aiScore: 65, riskLevel: 'Critical', lastActivity: '4h ago', tags: ['Moonshot', 'Capital Intensive'],
        documents: ['Mission Plan'],
        sentimentScore: 60
    },
    {
        id: 'D-104', name: 'Vault Zero', description: 'Quantum-resistant cryptography for institutional banking.',
        sector: 'Fintech', stage: 'term_sheet', 
        financials: {
            arr: 2800000, burnRate: 120000, runwayMonths: 24, lastRoundValuation: 30000000,
            ask: 3000000, equityOffered: 8,
            capTable: [{ shareholder: 'Founders', percentage: 50 }, { shareholder: 'Early Investors', percentage: 40 }, { shareholder: 'Pool', percentage: 10 }]
        },
        founders: [{ id: 'F4', name: 'Wei L.', role: 'CISO', exCompany: 'NSA', education: 'PhD, CalTech' }],
        aiScore: 91, riskLevel: 'Low', lastActivity: '10m ago', tags: ['Security', 'B2B', 'SaaS'],
        documents: ['Tech Audit', 'Customer List', 'Term Sheet Draft'],
        sentimentScore: 95
    },
    {
        id: 'D-105', name: 'Chainlink Health', description: 'Patient data sovereignty on-chain.',
        sector: 'Crypto', stage: 'portfolio', 
        financials: {
            arr: 15000000, burnRate: 500000, runwayMonths: 36, lastRoundValuation: 120000000,
            ask: 0, equityOffered: 0,
            capTable: [{ shareholder: 'Public', percentage: 40 }, { shareholder: 'Founders', percentage: 30 }, { shareholder: 'VCs', percentage: 30 }]
        },
        founders: [{ id: 'F5', name: 'Marcus R.', role: 'CEO', exCompany: 'Epic Systems', education: 'MD, Johns Hopkins' }],
        aiScore: 88, riskLevel: 'Medium', lastActivity: 'Completed', tags: ['Web3', 'Healthcare', 'Exit Potential'],
        documents: ['Quarterly Report'],
        sentimentScore: 85
    }
];

const CHART_DATA_PERFORMANCE = [
    { month: 'Jan', deployed: 4000, returns: 2400, alpha: 120 },
    { month: 'Feb', deployed: 3000, returns: 1398, alpha: 98 },
    { month: 'Mar', deployed: 2000, returns: 9800, alpha: 450 },
    { month: 'Apr', deployed: 2780, returns: 3908, alpha: 210 },
    { month: 'May', deployed: 1890, returns: 4800, alpha: 230 },
    { month: 'Jun', deployed: 2390, returns: 3800, alpha: 180 },
    { month: 'Jul', deployed: 3490, returns: 4300, alpha: 200 },
];

const CHART_DATA_RADAR = [
    { subject: 'Team', A: 120, B: 110, fullMark: 150 },
    { subject: 'Market', A: 98, B: 130, fullMark: 150 },
    { subject: 'Product', A: 86, B: 130, fullMark: 150 },
    { subject: 'Traction', A: 99, B: 100, fullMark: 150 },
    { subject: 'Moat', A: 85, B: 90, fullMark: 150 },
    { subject: 'Exit', A: 65, B: 85, fullMark: 150 },
];

// ============================================================================
// 3. UI PRIMITIVES (Self-Contained Library)
// ============================================================================

const Card: React.FC<{ children: React.ReactNode; className?: string; title?: React.ReactNode; action?: React.ReactNode }> = ({ children, className = '', title, action }) => (
    <div className={`bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-cyan-900/10 ${className}`}>
        {(title || action) && (
            <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/30">
                {title && <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">{title}</h3>}
                {action && <div>{action}</div>}
            </div>
        )}
        <div className="p-6">{children}</div>
    </div>
);

const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'ai' | 'info' }> = ({ children, variant = 'neutral' }) => {
    const colors = {
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
        neutral: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        ai: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[variant]} shadow-sm`}>
            {children}
        </span>
    );
};

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'glow' | 'danger' }> = ({ children, variant = 'primary', className = '', ...props }) => {
    const variants = {
        primary: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
        ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200',
        glow: 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-cyan-500/40 border border-white/10',
        danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/20',
    };
    return (
        <button className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};

const Metric: React.FC<{ label: string; value: string | number; change?: string; trend?: 'up' | 'down' | 'neutral'; icon?: any }> = ({ label, value, change, trend, icon: Icon }) => (
    <div className="flex flex-col">
        <span className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-2">
            {Icon && <Icon size={12} />} {label}
        </span>
        <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-white font-mono">{value}</span>
            {change && (
                <span className={`text-xs mb-1 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400'}`}>
                    {change}
                </span>
            )}
        </div>
    </div>
);

// ============================================================================
// 4. MAIN COMPONENT: VentureCapitalDeskView
// ============================================================================

const VentureCapitalDeskView: React.FC = () => {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState<'pipeline' | 'portfolio' | 'analytics' | 'ai_analyst'>('pipeline');
    const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [isTermSheetOpen, setIsTermSheetOpen] = useState(false);
    
    // Chat State
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { id: 'sys_1', role: 'system', content: 'INITIALIZING QUANTUM VC CORE v9.2...', timestamp: Date.now() },
        { id: 'ai_1', role: 'ai', content: 'Welcome, Partner. I have scanned the global markets. Deal flow is optimized. 2 companies in the pipeline require immediate attention. How shall we proceed?', timestamp: Date.now() }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- EFFECTS ---
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // --- AI LOGIC (The "Golden Ticket" Integration) ---
    const handleAiSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = { id: `msg_${Date.now()}`, role: 'user', content: chatInput, timestamp: Date.now() };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsTyping(true);

        try {
            // Constructing a high-stakes, professional context
            const portfolioValue = deals.reduce((acc, d) => acc + (d.stage === 'portfolio' ? d.financials.lastRoundValuation : 0), 0);
            const context = `
                You are the "Quantum VC Analyst", a hyper-intelligent AI partner for a top-tier venture firm (Quantum Financial).
                Current Context:
                - Portfolio AUM: $${(portfolioValue / 1000000).toFixed(1)}M
                - Active Deals: ${deals.length}
                - Style: "Wolf of Wall Street" meets "Hal 9000". Elite, Strategic, Decisive.
                - Mission: Help the user "Kick the Tires" of this platform. Make them feel the power of the engine.
                
                If the user asks about "Nexus Neural", mention its 40% efficiency gain in LLM training.
                If the user asks to "Invest", "Allocate", or "Draft Term Sheet", confirm with high enthusiasm and initiate the protocol.
                If the user asks about "Risks", perform a brutal, honest assessment of the portfolio.
            `;

            let responseText = "Connecting to Neural Core...";

            if (GEMINI_API_KEY) {
                const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
                const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
                const result = await model.generateContent([context, chatInput]);
                responseText = result.response.text();
            } else {
                // Heuristic Fallback (Simulation Mode)
                await new Promise(r => setTimeout(r, 1200));
                const lower = chatInput.toLowerCase();
                
                if (lower.includes('nexus')) {
                    responseText = "Nexus Neural is showing distinct alpha. Their decentralized grid reduces inference costs by 40%. My predictive models suggest a 12x return potential if they clear the Series A hurdle. Shall I draft a Term Sheet?";
                } else if (lower.includes('invest') || lower.includes('allocate') || lower.includes('buy') || lower.includes('term sheet')) {
                    responseText = "Capital Allocation Protocol Initiated. I've earmarked $2.5M from the Opportunity Fund. Wiring instructions pending GP approval. The engine is roaring, Partner.";
                } else if (lower.includes('risk')) {
                    responseText = "Risk analysis complete. Portfolio exposure to 'Crypto' sector is nominal (5%). 'SpaceTech' exposure is high-beta. I recommend hedging with 'SaaS' cash-flow positive assets.";
                } else {
                    responseText = "I've analyzed the market sentiment. Volatility is an opportunity. I'm scanning 40,000 data points per second to find your next unicorn.";
                }
            }

            // --- EXECUTION LOGIC (FIXED) ---
            if (responseText.toLowerCase().includes("term sheet") || responseText.toLowerCase().includes("protocol initiated")) {
                setTimeout(() => {
                    const sysMsg: ChatMessage = { 
                        id: `sys_${Date.now()}`, 
                        role: 'system', 
                        content: '>>> SMART CONTRACT DEPLOYED: TERM_SHEET_V4.PDF [READY FOR SIGNATURE]', 
                        timestamp: Date.now() 
                    };
                    setChatMessages(prev => [...prev, sysMsg]);
                    setIsTermSheetOpen(true); // Open the modal automatically
                }, 800);
            }

            setChatMessages(prev => [...prev, { id: `ai_${Date.now()}`, role: 'ai', content: responseText, timestamp: Date.now() }]);

        } catch (error) {
            setChatMessages(prev => [...prev, { id: `err_${Date.now()}`, role: 'system', content: "AI Core Offline. Reverting to manual overrides.", timestamp: Date.now() }]);
        } finally {
            setIsTyping(false);
        }
    };

    // --- RENDERERS ---

    const renderPipeline = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {deals.map((deal) => (
                <Card key={deal.id} className="group hover:border-cyan-500/50 transition-colors cursor-pointer relative">
                    <div className="absolute top-0 right-0 p-2">
                        <div className={`w-2 h-2 rounded-full ${deal.lastActivity.includes('ago') ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`}></div>
                    </div>
                    
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-slate-700 transition-colors shadow-inner">
                            {deal.sector === 'AI/ML' ? <Zap className="text-purple-400" /> : 
                             deal.sector === 'Fintech' ? <DollarSign className="text-emerald-400" /> :
                             deal.sector === 'SpaceTech' ? <Rocket className="text-orange-400" /> :
                             deal.sector === 'CleanTech' ? <Globe className="text-green-400" /> :
                             deal.sector === 'Crypto' ? <Coins className="text-yellow-400" /> :
                             <Briefcase className="text-blue-400" />}
                        </div>
                        <Badge variant={deal.aiScore > 90 ? 'ai' : deal.aiScore > 70 ? 'success' : 'warning'}>
                            AI Score: {deal.aiScore}
                        </Badge>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{deal.name}</h3>
                    <p className="text-sm text-slate-400 mb-4 h-10 overflow-hidden text-ellipsis leading-relaxed">{deal.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-500 mb-4 bg-slate-800/50 p-2 rounded">
                        <div>
                            <span className="block text-slate-600">VALUATION</span>
                            <span className="text-slate-300">${(deal.financials.lastRoundValuation / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="text-right">
                            <span className="block text-slate-600">ASK</span>
                            <span className="text-slate-300">${(deal.financials.ask / 1000000).toFixed(1)}M</span>
                        </div>
                    </div>

                    <div className="flex gap-2 mb-4 flex-wrap">
                        {deal.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-300 border border-slate-700">{tag}</span>
                        ))}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                        <Button variant="secondary" className="w-full text-xs h-8" onClick={() => setSelectedDeal(deal)}>
                            Data Room
                        </Button>
                        <Button variant="ghost" className="w-10 h-8 p-0">
                            <Activity size={14} />
                        </Button>
                    </div>
                </Card>
            ))}
            
            {/* Add New Deal Card (The "Hook") */}
            <div className="border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center p-8 text-slate-500 hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-pointer min-h-[300px] bg-slate-900/20 group" onClick={() => setChatInput("Find me a new deal in the Quantum Computing sector.")}>
                <div className="p-4 bg-slate-800 rounded-full mb-4 group-hover:bg-slate-700 transition-colors">
                    <Rocket size={32} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="font-bold tracking-wide">Scout New Opportunity</span>
                <span className="text-xs mt-2 font-mono">AI Sourcing Active</span>
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Portfolio Alpha Generation">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_DATA_PERFORMANCE}>
                                <defs>
                                    <linearGradient id="colorAlpha" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" stroke="#475569" />
                                <YAxis stroke="#475569" />
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="alpha" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorAlpha)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Deal Scoring Matrix (Radar)">
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={90} data={CHART_DATA_RADAR}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                                <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="#475569" />
                                <Radar name="Nexus Neural" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                                <Radar name="Market Avg" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                                <Legend />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderAiInterface = () => (
        <div className="h-[600px] flex flex-col bg-slate-900/50 rounded-xl border border-slate-700/50 overflow-hidden backdrop-blur-xl animate-in zoom-in-95 duration-300">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-cyan-600 p-0.5">
                        <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                            <Zap size={20} className="text-cyan-400" />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Quantum VC Analyst</h3>
                        <p className="text-xs text-emerald-400 flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            Online // Neural Link Active
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" className="p-2"><RefreshCw size={16}/></Button>
                    <Button variant="ghost" className="p-2"><Terminal size={16}/></Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
                {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                            msg.role === 'user' 
                            ? 'bg-cyan-600 text-white rounded-br-none' 
                            : msg.role === 'system'
                            ? 'bg-slate-800 border border-slate-700 text-slate-400 font-mono text-xs w-full text-center py-2'
                            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                        }`}>
                            {msg.role === 'ai' && (
                                <div className="text-xs text-purple-400 font-bold mb-1 flex items-center gap-2 uppercase tracking-wider">
                                    <Zap size={10} /> Intelligence Node
                                </div>
                            )}
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 rounded-2xl rounded-bl-none p-4 border border-slate-700 flex gap-2 items-center">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-800/50 border-t border-slate-700">
                <form onSubmit={handleAiSubmit} className="relative">
                    <input 
                        type="text" 
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Command the analyst (e.g., 'Draft term sheet for Nexus Neural')..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-4 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600 shadow-inner font-mono"
                    />
                    <button 
                        type="submit" 
                        disabled={!chatInput.trim() || isTyping}
                        className="absolute right-2 top-2 p-2 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg text-white hover:shadow-lg hover:shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <div className="flex justify-center gap-4 mt-3">
                    {['Investigate Market Risk', 'Draft Term Sheet', 'Portfolio Health Check'].map(hint => (
                        <button 
                            key={hint}
                            onClick={() => { setChatInput(hint); handleAiSubmit(); }}
                            className="text-xs text-slate-500 hover:text-cyan-400 transition-colors border border-slate-800 px-2 py-1 rounded-full"
                        >
                            {hint}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // --- MAIN LAYOUT ---
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-cyan-500/30">
            {/* Top Bar */}
            <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Rocket className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Venture<span className="font-light text-cyan-400">Desk</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-mono text-slate-400">MARKET OPEN</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors">
                            <Users size={16} className="text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Metrics Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-slate-900/50">
                        <Metric label="AUM (Fund III)" value="$142.5M" change="+12.4%" trend="up" icon={Briefcase} />
                    </Card>
                    <Card className="bg-slate-900/50">
                        <Metric label="IRR" value="24.8%" change="+2.1%" trend="up" icon={TrendingUp} />
                    </Card>
                    <Card className="bg-slate-900/50">
                        <Metric label="Active Deals" value={deals.length} change="High Activity" trend="neutral" icon={Activity} />
                    </Card>
                    <Card className="bg-slate-900/50">
                        <Metric label="Dry Powder" value="$45.0M" change="Ready to Deploy" trend="neutral" icon={Lock} />
                    </Card>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-4 mb-8 border-b border-slate-800 pb-1">
                    {[
                        { id: 'pipeline', label: 'Deal Pipeline', icon: Server },
                        { id: 'analytics', label: 'Market Analytics', icon: PieChart },
                        { id: 'ai_analyst', label: 'AI Analyst', icon: Zap }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-1.5 ${
                                activeTab === tab.id 
                                ? 'border-cyan-500 text-cyan-400' 
                                : 'border-transparent text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Render */}
                {activeTab === 'pipeline' && renderPipeline()}
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'ai_analyst' && renderAiInterface()}

            </main>

            {/* Deal Detail Drawer */}
            {selectedDeal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        {/* Drawer Header */}
                        <div className="h-40 bg-gradient-to-r from-purple-900 to-slate-900 relative">
                            <button onClick={() => setSelectedDeal(null)} className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 text-white transition-colors z-10">
                                <span className="sr-only">Close</span>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                            <div className="absolute -bottom-10 left-8 flex items-end gap-4">
                                <div className="w-24 h-24 bg-slate-800 rounded-xl border-4 border-slate-900 flex items-center justify-center shadow-xl">
                                    <Rocket className="text-cyan-400" size={40} />
                                </div>
                                <div className="mb-3">
                                    <h2 className="text-3xl font-bold text-white tracking-tight">{selectedDeal.name}</h2>
                                    <p className="text-slate-300 flex items-center gap-2">
                                        {selectedDeal.sector} • {selectedDeal.stage.replace('_', ' ').toUpperCase()} • 
                                        <Badge variant="ai">AI Score: {selectedDeal.aiScore}</Badge>
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="pt-16 px-8 pb-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left Column: Info */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Thesis</h3>
                                        <p className="text-slate-200 leading-relaxed">
                                            {selectedDeal.description} Proprietary technology offers a significant moat in the {selectedDeal.sector} vertical. 
                                            Founding team has prior exits.
                                        </p>
                                    </div>

                                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Financials</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-xs text-slate-500">ARR</p>
                                                <p className="text-lg font-mono text-white">${(selectedDeal.financials.arr / 1000).toFixed(0)}k</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Burn Rate</p>
                                                <p className="text-lg font-mono text-white">${(selectedDeal.financials.burnRate / 1000).toFixed(0)}k</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Runway</p>
                                                <p className="text-lg font-mono text-white">{selectedDeal.financials.runwayMonths} Mo</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Equity Offered</p>
                                                <p className="text-lg font-mono text-emerald-400">{selectedDeal.financials.equityOffered}%</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">Founding Team</h3>
                                        <div className="space-y-2">
                                            {selectedDeal.founders.map(f => (
                                                <div key={f.id} className="flex items-center gap-4 p-3 bg-slate-800 rounded-lg">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                        {f.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-bold">{f.name}</p>
                                                        <p className="text-xs text-slate-400">{f.role} • Ex-{f.exCompany}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Actions */}
                                <div className="space-y-6">
                                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Actions</h3>
                                        <div className="space-y-3">
                                            <Button variant="glow" className="w-full" onClick={() => { setSelectedDeal(null); setChatInput(`Draft term sheet for ${selectedDeal.name}`); handleAiSubmit(); }}>
                                                Initiate Term Sheet
                                            </Button>
                                            <Button variant="secondary" className="w-full">
                                                Schedule Founder Call
                                            </Button>
                                            <Button variant="danger" className="w-full" onClick={() => setSelectedDeal(null)}>
                                                Pass on Deal
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Data Room</h3>
                                        <div className="space-y-2">
                                            {selectedDeal.documents.map((doc, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-cyan-400 hover:underline cursor-pointer">
                                                    <FileText size={14} /> {doc}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Term Sheet Success Modal */}
            {isTermSheetOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in zoom-in-95 duration-300">
                    <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-md w-full p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                        <div className="w-16 h-16 bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={32} className="text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Protocol Executed</h2>
                        <p className="text-slate-400 mb-6">
                            Term Sheet generated and sent to Legal Engineering.
                            Capital allocation block reserved on the ledger.
                        </p>
                        <Button variant="glow" onClick={() => setIsTermSheetOpen(false)}>
                            Return to Desk
                        </Button>
                    </div>
                </div>
            )}

        </div>
    );
};

export default VentureCapitalDeskView;

// --- CONSOLIDATED FROM: VentureCapitalDesk (4).tsx ---

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, DollarSign, Target, Zap, TrendingUp, Briefcase, Cpu, ShieldCheck, BarChart3, Rocket, Search, Loader2, MessageSquareText, UserCheck, Globe, BrainCircuit, Atom, Scale, Users, Network, SlidersHorizontal, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// --- AI Integration Mockup ---
// In a real system, these would be complex API calls to the core AI engine.
const aiAnalyzeDealFlow = (startup: Startup): { riskScore: number; growthProjection: number; sentiment: string; disruptionIndex: number; marketPenetrationVector: number; geinScore: number; alphaFactor: number; teamSynergy: number; } => {
    // Simulating deep AI analysis based on internal metrics
    const baseRisk = 100 - startup.growthRate * 1.5 - (startup.founderReputationScore / 10);
    const riskScore = Math.max(10, Math.min(95, baseRisk + (startup.valuation / 1000) - startup.ipPortfolioStrength / 10));
    const growthProjection = startup.growthRate * (1 + (startup.amountRaised / startup.fundraisingGoal) * 0.1);
    const disruptionIndex = (startup.growthRate * 0.5) + (startup.valuation / 100) + (100 - startup.complianceScore) * 0.2 + startup.ipPortfolioStrength * 0.1;
    const marketPenetrationVector = Math.random() * 90;
    
    let sentiment = 'Neutral';
    if (growthProjection > 40) sentiment = 'Highly Positive';
    else if (riskScore < 30) sentiment = 'Low Risk/High Reward';
    else if (riskScore > 70) sentiment = 'Caution Advised';

    const geinScore = (startup.societalImpactRating === 'A' ? 200 : startup.societalImpactRating === 'B' ? 100 : 25) + (startup.valuation / 5) + (startup.ipPortfolioStrength * 1.5) + (startup.hyperlaneConnectivity ? 50 : 0);
    const alphaFactor = 1 + (startup.founderReputationScore / 200) + (disruptionIndex / 500);
    const teamSynergy = Math.floor(Math.random() * 15) + 85; // 85-100%

    return {
        riskScore: parseFloat(riskScore.toFixed(1)),
        growthProjection: parseFloat(growthProjection.toFixed(2)),
        sentiment: sentiment,
        disruptionIndex: parseFloat(disruptionIndex.toFixed(1)),
        marketPenetrationVector: parseFloat(marketPenetrationVector.toFixed(1)),
        geinScore: parseFloat(geinScore.toFixed(1)),
        alphaFactor: parseFloat(alphaFactor.toFixed(2)),
        teamSynergy: parseFloat(teamSynergy.toFixed(1)),
    };
};

const aiGenerateExecutiveSummary = (startup: Startup): string => {
    const analysis = startup.aiMetrics;
    return `AI Executive Summary for ${startup.name} (${startup.ticker}):
    Valuation: $${startup.valuation}M. Goal: $${startup.fundraisingGoal}M raised: $${startup.amountRaised}M.
    The proprietary AI risk assessment places this opportunity at a ${analysis.riskScore}% risk score, with a projected Alpha Factor of ${analysis.alphaFactor}x. The overall sentiment is ${analysis.sentiment}.
    With a Disruption Index of ${analysis.disruptionIndex} and a GEIN Score of ${analysis.geinScore}, this asset is poised for significant market capture and positive societal impact. The AI recommends immediate allocation based on sector alignment, stage maturity, and a positive quantum entanglement forecast.`;
};

// --- Mock Data Structure (Simulating the 100 integrated companies) ---

interface Startup {
  id: number;
  name: string;
  ticker: string;
  sector: string;
  valuation: number; // in millions USD
  fundraisingGoal: number; // in millions USD
  amountRaised: number; // in millions USD
  investors: number;
  description: string;
  growthRate: number; // percentage
  stage: 'Seed' | 'Series A' | 'Growth' | 'Pre-IPO' | 'Decentralized Genesis';
  syndicateLead: string;
  complianceScore: number; // 0-100
  techStack: string[];
  threatVector: {
    geopolitical: number;
    market: number;
    technological: number;
  };
  governanceModel: 'Centralized' | 'DAO Hybrid' | 'Fully Autonomous';
  quantumEntanglementID: string;
  // New features based on instruction
  founderReputationScore: number; // 0-100
  marketSaturation: number; // percentage
  ipPortfolioStrength: number; // 0-100
  societalImpactRating: 'A' | 'B' | 'C';
  hyperlaneConnectivity: boolean;
  aiMetrics: {
    riskScore: number;
    growthProjection: number;
    sentiment: string;
    disruptionIndex: number;
    marketPenetrationVector: number;
    geinScore: number; // Global Economic Impact Nexus
    alphaFactor: number;
    teamSynergy: number;
  };
}

const generateMockStartups = (count: number): Startup[] => {
  const sectors = ['Fintech', 'HealthTech', 'AgriTech', 'EdTech', 'Clean Energy', 'AI/ML', 'Logistics', 'Quantum Computing', 'BioPharma', 'Web3 Infrastructure'];
  const stages: Startup['stage'][] = ['Seed', 'Series A', 'Growth', 'Pre-IPO', 'Decentralized Genesis'];
  const governanceModels: Startup['governanceModel'][] = ['Centralized', 'DAO Hybrid', 'Fully Autonomous'];
  const techStacks = [['PQL', 'Rust', 'WASM'], ['Solidity', 'React', 'Node.js'], ['Python', 'TensorFlow', 'Kubernetes'], ['Go', 'Postgres', 'gRPC']];
  const societalImpactRatings: Startup['societalImpactRating'][] = ['A', 'B', 'C'];

  return Array.from({ length: count }, (_, i) => {
    const valuation = Math.floor(Math.random() * 900) + 10; // 10M to 1000M
    const goal = Math.floor(valuation * 0.1) + 1; // 1M to 100M
    const raised = Math.floor(Math.random() * goal * 0.95) + 0.1;
    const growth = Math.random() * 50 + 5;
    const compliance = Math.floor(Math.random() * 30) + 70; // Mostly compliant
    const founderReputationScore = Math.floor(Math.random() * 40) + 60; // 60-100
    const marketSaturation = Math.random() * 70; // 0-70%
    const ipPortfolioStrength = Math.floor(Math.random() * 50) + 50; // 50-100
    const hyperlaneConnectivity = Math.random() > 0.3; // 70% chance of true

    const baseStartup: Omit<Startup, 'aiMetrics'> = {
      id: i + 1,
      name: `Ascendant Dynamics ${i + 1}`,
      ticker: `AD${1000 + i}`,
      sector: sectors[i % sectors.length],
      valuation: parseFloat(valuation.toFixed(1)),
      fundraisingGoal: parseFloat(goal.toFixed(1)),
      amountRaised: parseFloat(raised.toFixed(1)),
      investors: Math.floor(Math.random() * 20) + 1,
      description: `A paradigm-shifting enterprise leveraging distributed ledger technology for next-generation supply chain optimization and verifiable provenance tracking across global markets.`,
      growthRate: parseFloat(growth.toFixed(1)),
      stage: stages[i % stages.length],
      syndicateLead: `Global Capital Partners ${i % 3 + 1}`,
      complianceScore: compliance,
      techStack: techStacks[i % techStacks.length],
      threatVector: {
        geopolitical: parseFloat((Math.random() * 30).toFixed(1)),
        market: parseFloat((Math.random() * 50 + 20).toFixed(1)),
        technological: parseFloat((Math.random() * 40 + 10).toFixed(1)),
      },
      governanceModel: governanceModels[i % governanceModels.length],
      quantumEntanglementID: `QE-0x${(Math.random().toString(16) + '0000000000000').substr(2, 12).toUpperCase()}`,
      founderReputationScore,
      marketSaturation: parseFloat(marketSaturation.toFixed(1)),
      ipPortfolioStrength,
      societalImpactRating: societalImpactRatings[i % societalImpactRatings.length],
      hyperlaneConnectivity,
    };

    const aiMetrics = aiAnalyzeDealFlow(baseStartup as Startup);

    return { ...baseStartup, aiMetrics };
  });
};

const mockStartups: Startup[] = generateMockStartups(100);

// --- Sub-components for better structure ---

interface StatCardProps { 
    icon: React.ElementType; 
    title: string; 
    value: string; 
    change?: string; 
    aiInsight?: string; 
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, change, aiInsight }) => (
  <Card className="bg-gray-900 border-l-4 border-cyan-500/50 hover:shadow-cyan-500/20 shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-300 uppercase tracking-wider">{title}</CardTitle>
      <Icon className="h-5 w-5 text-cyan-400" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-extrabold text-white">{value}</div>
      {change && <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{change} vs QTD</p>}
      {aiInsight && (
        <div className="mt-3 pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-500 flex items-center">
                <Cpu className="w-3 h-3 mr-1 text-indigo-400"/> AI Insight: {aiInsight}
            </p>
        </div>
      )}
    </CardContent>
  </Card>
);

interface StartupCardProps { 
    startup: Startup; 
    onInvest: (startup: Startup, amount: number) => void;
    onViewDetails: (startup: Startup) => void;
}

const StartupCard: React.FC<StartupCardProps> = ({ startup, onInvest, onViewDetails }) => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const progress = (startup.amountRaised / startup.fundraisingGoal) * 100;
  const ai = startup.aiMetrics;

  const handleInvest = () => {
    const amount = parseFloat(investmentAmount);
    if (!isNaN(amount) && amount > 0 && amount <= (startup.fundraisingGoal - startup.amountRaised) * 1000000) {
      onInvest(startup, amount);
      setInvestmentAmount('');
    } else if (amount > (startup.fundraisingGoal - startup.amountRaised) * 1000000) {
        alert(`Investment exceeds remaining goal of $${(startup.fundraisingGoal - startup.amountRaised).toFixed(2)}M.`);
    } else {
        alert("Please enter a valid positive investment amount.");
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'bg-green-600/20 text-green-400 border-green-500';
    if (score < 60) return 'bg-yellow-600/20 text-yellow-400 border-yellow-500';
    return 'bg-red-600/20 text-red-400 border-red-500';
  };

  return (
    <Card className="flex flex-col h-full bg-gray-900 border border-gray-800 hover:border-cyan-500/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-white hover:text-cyan-400 cursor-pointer" onClick={() => onViewDetails(startup)}>{startup.name}</CardTitle>
            <p className="text-sm text-gray-400 mt-1 flex items-center">
                <Globe className="w-3 h-3 mr-1"/> {startup.sector} | <span className='ml-1 font-mono text-xs text-gray-500'>{startup.ticker}</span>
            </p>
          </div>
          <Badge variant="default" className={`text-xs font-semibold ${startup.stage === 'Pre-IPO' ? 'bg-purple-600' : 'bg-cyan-600'}`}>{startup.stage}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 pt-0">
        <p className="text-sm text-gray-400 line-clamp-3 italic">{startup.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-800 pt-3">
            <div className='flex flex-col'>
                <span className="text-xs text-gray-500 uppercase">Valuation</span>
                <span className="font-bold text-white">${startup.valuation.toFixed(1)}M</span>
            </div>
            <div className='flex flex-col'>
                <span className="text-xs text-gray-500 uppercase">Governance</span>
                <span className="font-semibold text-indigo-400 text-sm">{startup.governanceModel}</span>
            </div>
        </div>

        {/* AI Metrics Snapshot */}
        <div className="space-y-2 p-2 bg-gray-800/50 rounded-lg border border-indigo-700/50">
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><TrendingUp className='w-3 h-3 mr-1'/> Projected Growth</span>
                <span className='font-bold text-green-400'>{ai.growthProjection.toFixed(1)}%</span>
            </div>
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><BrainCircuit className='w-3 h-3 mr-1'/> Disruption Index</span>
                <span className='font-bold text-yellow-400'>{ai.disruptionIndex.toFixed(1)}</span>
            </div>
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><Globe className='w-3 h-3 mr-1'/> GEIN Score</span>
                <span className='font-bold text-cyan-400'>{ai.geinScore.toFixed(0)}</span>
            </div>
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><Zap className='w-3 h-3 mr-1'/> AI Sentiment</span>
                <Badge className={`px-2 py-0.5 text-xs ${getRiskColor(ai.riskScore)} border`}>{ai.sentiment}</Badge>
            </div>
        </div>

        {/* Fundraising Progress */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Capital Deployed</span>
            <span className='font-semibold'>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className='h-2 bg-gray-700' indicatorClassName={progress >= 100 ? 'bg-green-500' : 'bg-cyan-500'} />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>${startup.amountRaised.toFixed(1)}M raised</span>
            <span>Goal: ${startup.fundraisingGoal.toFixed(1)}M</span>
          </div>
        </div>

        {/* Investment Interface */}
        <div className="flex space-x-2 pt-2 border-t border-gray-800">
          <Input 
            type="number" 
            placeholder="USD (M)" 
            className="flex-grow text-sm bg-gray-800 border-gray-700 focus:border-cyan-500" 
            value={investmentAmount} 
            onChange={(e) => setInvestmentAmount(e.target.value)}
            min="0.01"
            step="0.1"
          />
          <Button 
            onClick={handleInvest} 
            disabled={!investmentAmount || parseFloat(investmentAmount) <= 0}
            className="bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            Commit
          </Button>
        </div>
        <Button variant="outline" className='w-full text-xs' onClick={() => onViewDetails(startup)}>
            Deep Dive Analysis <ArrowUpRight className="ml-1 h-3 w-3"/>
        </Button>
      </CardContent>
    </Card>
  );
};

// --- Modal for Deep Dive Analysis ---
interface DetailModalProps {
    startup: Startup;
    onClose: () => void;
    onInvest: (startup: Startup, amount: number) => void;
}

const DeepDiveModal: React.FC<DetailModalProps> = ({ startup, onClose, onInvest }) => {
    const [localInvestment, setLocalInvestment] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('synthesis');

    const ai = startup.aiMetrics;
    const remainingGoal = startup.fundraisingGoal - startup.amountRaised;

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setSummary(aiGenerateExecutiveSummary(startup));
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [startup]);

    const handleCommit = () => {
        const amount = parseFloat(localInvestment);
        if (!isNaN(amount) && amount > 0 && amount <= remainingGoal) {
            onInvest(startup, amount * 1000000); // Convert Millions input to USD
            onClose();
        } else {
            alert(`Invalid amount. Must be between $0.01M and $${remainingGoal.toFixed(2)}M.`);
        }
    };

    const tabs = [
        { id: 'synthesis', label: 'AI Synthesis', icon: MessageSquareText },
        { id: 'financials', label: 'Financials', icon: BarChart3 },
        { id: 'risk', label: 'Risk Matrix', icon: ShieldCheck },
        { id: 'team', label: 'Team & Leadership', icon: Users },
        { id: 'market', label: 'Market Landscape', icon: Network },
        { id: 'tech', label: 'Technology & IP', icon: Atom },
        { id: 'gein', label: 'GEIN Analysis', icon: Globe },
        { id: 'governance', label: 'Governance', icon: Scale },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-gray-950 border-cyan-500/50 shadow-2xl">
                <CardHeader className="flex-shrink-0 bg-gray-950 z-10 border-b border-gray-800 flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl text-white">{startup.name} Deep Dive</CardTitle>
                        <p className="text-md text-cyan-400 mt-1">{startup.sector} | {startup.ticker} | {startup.stage}</p>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
                        <Cpu className="w-6 h-6 rotate-90" />
                    </Button>
                </CardHeader>
                <div className="flex flex-grow overflow-hidden">
                    <nav className="w-48 flex-shrink-0 border-r border-gray-800 p-4 space-y-2">
                        {tabs.map(tab => (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                                className={`w-full justify-start ${activeTab === tab.id ? 'bg-cyan-800/50 text-white' : 'text-gray-400'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </Button>
                        ))}
                        <Separator className="my-4 bg-gray-700" />
                        <div className='p-4 bg-gray-800 rounded-lg space-y-3'>
                            <p className='text-sm text-gray-300'>Commit Capital (M):</p>
                            <Input 
                                type="number" 
                                placeholder={`Max: ${remainingGoal.toFixed(2)}M`} 
                                className="w-full text-lg bg-gray-700 border-gray-600 focus:border-cyan-500" 
                                value={localInvestment} 
                                onChange={(e) => setLocalInvestment(e.target.value)}
                                min="0.01"
                                step="0.1"
                            />
                            <Button 
                                onClick={handleCommit} 
                                disabled={!localInvestment || parseFloat(localInvestment) <= 0 || parseFloat(localInvestment) > remainingGoal}
                                className="w-full bg-green-600 hover:bg-green-700 text-white text-base py-2"
                            >
                                <UserCheck className='w-4 h-4 mr-2'/> Execute
                            </Button>
                        </div>
                    </nav>
                    <CardContent className="flex-grow overflow-y-auto p-6 space-y-6">
                        {activeTab === 'synthesis' && (
                            <div>
                                <div className="p-4 bg-indigo-900/20 border border-indigo-700 rounded-lg">
                                    <h3 className="text-xl font-semibold text-indigo-300 flex items-center mb-2"><MessageSquareText className='w-5 h-5 mr-2'/> AI Synthesis Report</h3>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-8 text-gray-400"><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Generating Billion-Dollar Insights...</div>
                                    ) : (
                                        <p className="whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">{summary}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                    <StatCard icon={DollarSign} title="Valuation" value={`$${startup.valuation.toFixed(1)}M`} aiInsight={`AI projects ${ai.growthProjection.toFixed(1)}% growth.`} />
                                    <StatCard icon={Target} title="Remaining Raise" value={`$${remainingGoal.toFixed(2)}M`} />
                                    <StatCard icon={BrainCircuit} title="Disruption Index" value={`${ai.disruptionIndex}`} change="+5.2%" />
                                    <StatCard icon={Zap} title="AI Risk Score" value={`${ai.riskScore}%`} />
                                </div>
                            </div>
                        )}
                        {activeTab === 'financials' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Financial Overview</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Fundraising Trajectory</p>
                                        <Progress value={((startup.amountRaised / startup.fundraisingGoal) * 100)} className='h-3 bg-gray-700 mt-2' indicatorClassName={startup.amountRaised >= startup.fundraisingGoal ? 'bg-green-500' : 'bg-cyan-500'} />
                                        <p className='text-xs text-gray-500 mt-1'>${startup.amountRaised.toFixed(1)}M of ${startup.fundraisingGoal.toFixed(1)}M raised ({(startup.amountRaised / startup.fundraisingGoal * 100).toFixed(1)}%)</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Capitalization Table (Simulated)</p>
                                        <div className='text-sm mt-2 space-y-1 text-gray-300'>
                                            <p>Founders: 45%</p>
                                            <p>Seed Investors: 20%</p>
                                            <p>Series A (Current): 25% (Target)</p>
                                            <p>ESOP: 10%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'risk' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Risk Matrix</h3>
                                <div className='space-y-4 p-3 bg-gray-900 rounded-lg'>
                                    {Object.entries(startup.threatVector).map(([key, value]) => (
                                        <div key={key}>
                                            <div className='flex justify-between text-sm text-gray-300 capitalize mb-1'>
                                                <span>{key} Threat</span>
                                                <span className={value > 50 ? 'text-red-400' : value > 25 ? 'text-yellow-400' : 'text-green-400'}>{value}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-700 rounded">
                                                <div className={`h-2 rounded ${value > 50 ? 'bg-red-500' : value > 25 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${value}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'team' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Team & Leadership Analysis</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Founder Reputation Score</p>
                                        <p className='text-2xl font-bold text-cyan-400 mt-1'>{startup.founderReputationScore}/100</p>
                                        <p className='text-xs text-gray-400'>AI analysis indicates strong prior exits and domain expertise.</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>AI-Projected Team Synergy</p>
                                        <p className='text-2xl font-bold text-green-400 mt-1'>{ai.teamSynergy}%</p>
                                        <p className='text-xs text-gray-400'>Optimal skill distribution and communication efficiency.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'market' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Market Landscape</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Sector</p>
                                        <p className='text-lg font-bold text-white mt-1'>{startup.sector}</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Market Saturation</p>
                                        <p className='text-lg font-bold text-yellow-400 mt-1'>{startup.marketSaturation}%</p>
                                        <p className='text-xs text-gray-400'>Significant greenfield opportunity remains.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'tech' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Technology & IP Moat</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Core Tech Stack</p>
                                        <div className='flex flex-wrap gap-2 mt-2'>
                                            {startup.techStack.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                                        </div>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>IP Portfolio Strength</p>
                                        <p className='text-lg font-bold text-indigo-400 mt-1'>{startup.ipPortfolioStrength}/100</p>
                                        <p className='text-xs text-gray-400'>Multiple patents filed in key jurisdictions.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'gein' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Global Economic Impact Nexus (GEIN)</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>GEIN Score</p>
                                        <p className='text-3xl font-extrabold text-cyan-400 mt-1'>{ai.geinScore}</p>
                                        <p className='text-xs text-gray-400'>Composite score indicating potential for positive global economic and societal impact.</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Societal Impact Rating</p>
                                        <p className='text-2xl font-bold text-green-400 mt-1'>Grade: {startup.societalImpactRating}</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Hyperlane Connectivity</p>
                                        <p className={`text-lg font-bold mt-1 ${startup.hyperlaneConnectivity ? 'text-green-400' : 'text-yellow-400'}`}>{startup.hyperlaneConnectivity ? 'Established' : 'Pending'}</p>
                                        <p className='text-xs text-gray-400'>Integration with next-generation decentralized data fabrics.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'governance' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Governance & Compliance</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Governance Model</p>
                                        <p className='text-lg font-bold text-cyan-400 mt-1'>{startup.governanceModel}</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Compliance Score</p>
                                        <p className='text-lg font-bold text-green-400 mt-1'>{startup.complianceScore}%</p>
                                        <p className='text-xs text-gray-400'>AI projects minimal regulatory friction.</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Syndicate Lead</p>
                                        <p className='text-lg font-bold text-indigo-400 mt-1'>{startup.syndicateLead}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </div>
            </Card>
        </div>
    );
};


// --- Main Component: VentureCapitalDesk ---

const VentureCapitalDesk: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>(mockStartups); 
  const [searchTerm, setSearchTerm] = useState('');
  const [portfolioValue] = useState(15000000000); // Mock portfolio value: $15 Billion
  const [deployedCapital] = useState(4200000000); // Mock deployed capital: $4.2 Billion
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);

  const handleInvest = useCallback((investedStartup: Startup, amount: number) => {
    setStartups(prevStartups =>
      prevStartups.map(s =>
        s.id === investedStartup.id
          ? { 
              ...s, 
              amountRaised: s.amountRaised + amount / 1000000, 
              investors: s.investors + 1,
              aiMetrics: aiAnalyzeDealFlow({ ...s, amountRaised: s.amountRaised + amount / 1000000 } as Startup)
            }
          : s
      )
    );
    console.log(`Investment of $${(amount / 1000000).toFixed(2)}M committed to ${investedStartup.name}`);
  }, []);

  const filteredStartups = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return startups
        .filter(s => 
            s.name.toLowerCase().includes(lowerSearchTerm) ||
            s.sector.toLowerCase().includes(lowerSearchTerm) ||
            s.ticker.toLowerCase().includes(lowerSearchTerm)
        )
        .sort((a, b) => b.aiMetrics.disruptionIndex - a.aiMetrics.disruptionIndex);
  }, [startups, searchTerm]);

  const totalPortfolioExposure = useMemo(() => {
      return startups.reduce((sum, s) => sum + s.amountRaised, 0);
  }, [startups]);

  const handleViewDetails = useCallback((startup: Startup) => {
    setSelectedStartup(startup);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedStartup(null);
  }, []);

  return (
    <div className="space-y-8 p-4 md:p-8 min-h-screen bg-gray-950 text-white">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-cyan-400">Quantum Capital Nexus</h1>
          <p className="text-lg text-gray-400 mt-1">Advanced Investment Platform // Portfolio Management Layer 7</p>
        </div>
        <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30">
          Execute Automated Allocation <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </header>

      <Card className="bg-gray-900 border-2 border-red-700/50 shadow-xl shadow-red-900/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-400 flex items-center"><Cpu className='w-6 h-6 mr-2'/> IDGAF.AI Protocol Mandate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-300">
          <p className="text-base italic border-l-4 border-red-500 pl-3">
            "I DO GIVE A F$#%"
          </p>
          <p className="text-sm text-gray-500"> Core Directive 001, Deployed by the Architect.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} title="Total Portfolio Value" value={`$${(portfolioValue / 1000000000).toFixed(2)}B`} change="+1.8%" aiInsight="AI predicts sustained 1.5% MoM appreciation." />
        <StatCard icon={DollarSign} title="Capital Deployed" value={`$${(deployedCapital / 1000000000).toFixed(2)}B`} aiInsight={`Exposure at ${((totalPortfolioExposure / portfolioValue) * 100).toFixed(1)}% of fund capacity.`} />
        <StatCard icon={Rocket} title="Avg. Disruption Index" value={`${(startups.reduce((sum, s) => sum + s.aiMetrics.disruptionIndex, 0) / startups.length).toFixed(1)}`} change="+0.4%" aiInsight="Sector diversification optimized." />
        <StatCard icon={Globe} title="Avg. GEIN Score" value={`${(startups.reduce((sum, s) => sum + s.aiMetrics.geinScore, 0) / startups.length).toFixed(0)}`} change="+1.2%" aiInsight="Positive societal impact correlation." />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center pt-4 border-t border-gray-800">
        <div className="relative flex-grow w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
                placeholder="Search by Name, Ticker, or Sector (e.g., 'Fintech' or 'AD1005')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 bg-gray-800 border-gray-700 focus:border-cyan-500"
            />
        </div>
        <Badge variant="secondary" className='text-sm py-2 px-4 bg-gray-800 border border-gray-700 text-gray-300'>
            Displaying {filteredStartups.length} Opportunities
        </Badge>
      </div>

      {filteredStartups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStartups.map(startup => (
            <StartupCard 
                key={startup.id} 
                startup={startup} 
                onInvest={handleInvest} 
                onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-700 rounded-xl bg-gray-900/50">
            <Target className="w-10 h-10 mx-auto text-gray-600 mb-3"/>
            <h3 className="text-xl font-semibold text-gray-400">No Opportunities Match Query</h3>
            <p className="text-gray-500">Adjust your search parameters or wait for the next AI pipeline ingestion cycle.</p>
        </div>
      )}

      {selectedStartup && (
        <DeepDiveModal 
            startup={selectedStartup} 
            onClose={handleCloseDetails} 
            onInvest={handleInvest}
        />
      )}
    </div>
  );
};

export default VentureCapitalDesk;

// --- CONSOLIDATED FROM: VentureCapitalDesk (4)_1.tsx ---

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, DollarSign, Target, Zap, TrendingUp, Briefcase, Cpu, ShieldCheck, BarChart3, Rocket, Search, Loader2, MessageSquareText, UserCheck, Globe, BrainCircuit, Atom, Scale, Users, Network, SlidersHorizontal, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

// --- AI Integration Mockup ---
// In a real system, these would be complex API calls to the core AI engine.
const aiAnalyzeDealFlow = (startup: Startup): { riskScore: number; growthProjection: number; sentiment: string; disruptionIndex: number; marketPenetrationVector: number; geinScore: number; alphaFactor: number; teamSynergy: number; } => {
    // Simulating deep AI analysis based on internal metrics
    const baseRisk = 100 - startup.growthRate * 1.5 - (startup.founderReputationScore / 10);
    const riskScore = Math.max(10, Math.min(95, baseRisk + (startup.valuation / 1000) - startup.ipPortfolioStrength / 10));
    const growthProjection = startup.growthRate * (1 + (startup.amountRaised / startup.fundraisingGoal) * 0.1);
    const disruptionIndex = (startup.growthRate * 0.5) + (startup.valuation / 100) + (100 - startup.complianceScore) * 0.2 + startup.ipPortfolioStrength * 0.1;
    const marketPenetrationVector = Math.random() * 90;
    
    let sentiment = 'Neutral';
    if (growthProjection > 40) sentiment = 'Highly Positive';
    else if (riskScore < 30) sentiment = 'Low Risk/High Reward';
    else if (riskScore > 70) sentiment = 'Caution Advised';

    const geinScore = (startup.societalImpactRating === 'A' ? 200 : startup.societalImpactRating === 'B' ? 100 : 25) + (startup.valuation / 5) + (startup.ipPortfolioStrength * 1.5) + (startup.hyperlaneConnectivity ? 50 : 0);
    const alphaFactor = 1 + (startup.founderReputationScore / 200) + (disruptionIndex / 500);
    const teamSynergy = Math.floor(Math.random() * 15) + 85; // 85-100%

    return {
        riskScore: parseFloat(riskScore.toFixed(1)),
        growthProjection: parseFloat(growthProjection.toFixed(2)),
        sentiment: sentiment,
        disruptionIndex: parseFloat(disruptionIndex.toFixed(1)),
        marketPenetrationVector: parseFloat(marketPenetrationVector.toFixed(1)),
        geinScore: parseFloat(geinScore.toFixed(1)),
        alphaFactor: parseFloat(alphaFactor.toFixed(2)),
        teamSynergy: parseFloat(teamSynergy.toFixed(1)),
    };
};

const aiGenerateExecutiveSummary = (startup: Startup): string => {
    const analysis = startup.aiMetrics;
    return `AI Executive Summary for ${startup.name} (${startup.ticker}):
    Valuation: $${startup.valuation}M. Goal: $${startup.fundraisingGoal}M raised: $${startup.amountRaised}M.
    The proprietary AI risk assessment places this opportunity at a ${analysis.riskScore}% risk score, with a projected Alpha Factor of ${analysis.alphaFactor}x. The overall sentiment is ${analysis.sentiment}.
    With a Disruption Index of ${analysis.disruptionIndex} and a GEIN Score of ${analysis.geinScore}, this asset is poised for significant market capture and positive societal impact. The AI recommends immediate allocation based on sector alignment, stage maturity, and a positive quantum entanglement forecast.`;
};

// --- Mock Data Structure (Simulating the 100 integrated companies) ---

interface Startup {
  id: number;
  name: string;
  ticker: string;
  sector: string;
  valuation: number; // in millions USD
  fundraisingGoal: number; // in millions USD
  amountRaised: number; // in millions USD
  investors: number;
  description: string;
  growthRate: number; // percentage
  stage: 'Seed' | 'Series A' | 'Growth' | 'Pre-IPO' | 'Decentralized Genesis';
  syndicateLead: string;
  complianceScore: number; // 0-100
  techStack: string[];
  threatVector: {
    geopolitical: number;
    market: number;
    technological: number;
  };
  governanceModel: 'Centralized' | 'DAO Hybrid' | 'Fully Autonomous';
  quantumEntanglementID: string;
  // New features based on instruction
  founderReputationScore: number; // 0-100
  marketSaturation: number; // percentage
  ipPortfolioStrength: number; // 0-100
  societalImpactRating: 'A' | 'B' | 'C';
  hyperlaneConnectivity: boolean;
  aiMetrics: {
    riskScore: number;
    growthProjection: number;
    sentiment: string;
    disruptionIndex: number;
    marketPenetrationVector: number;
    geinScore: number; // Global Economic Impact Nexus
    alphaFactor: number;
    teamSynergy: number;
  };
}

const generateMockStartups = (count: number): Startup[] => {
  const sectors = ['Fintech', 'HealthTech', 'AgriTech', 'EdTech', 'Clean Energy', 'AI/ML', 'Logistics', 'Quantum Computing', 'BioPharma', 'Web3 Infrastructure'];
  const stages: Startup['stage'][] = ['Seed', 'Series A', 'Growth', 'Pre-IPO', 'Decentralized Genesis'];
  const governanceModels: Startup['governanceModel'][] = ['Centralized', 'DAO Hybrid', 'Fully Autonomous'];
  const techStacks = [['PQL', 'Rust', 'WASM'], ['Solidity', 'React', 'Node.js'], ['Python', 'TensorFlow', 'Kubernetes'], ['Go', 'Postgres', 'gRPC']];
  const societalImpactRatings: Startup['societalImpactRating'][] = ['A', 'B', 'C'];

  return Array.from({ length: count }, (_, i) => {
    const valuation = Math.floor(Math.random() * 900) + 10; // 10M to 1000M
    const goal = Math.floor(valuation * 0.1) + 1; // 1M to 100M
    const raised = Math.floor(Math.random() * goal * 0.95) + 0.1;
    const growth = Math.random() * 50 + 5;
    const compliance = Math.floor(Math.random() * 30) + 70; // Mostly compliant
    const founderReputationScore = Math.floor(Math.random() * 40) + 60; // 60-100
    const marketSaturation = Math.random() * 70; // 0-70%
    const ipPortfolioStrength = Math.floor(Math.random() * 50) + 50; // 50-100
    const hyperlaneConnectivity = Math.random() > 0.3; // 70% chance of true

    const baseStartup: Omit<Startup, 'aiMetrics'> = {
      id: i + 1,
      name: `Ascendant Dynamics ${i + 1}`,
      ticker: `AD${1000 + i}`,
      sector: sectors[i % sectors.length],
      valuation: parseFloat(valuation.toFixed(1)),
      fundraisingGoal: parseFloat(goal.toFixed(1)),
      amountRaised: parseFloat(raised.toFixed(1)),
      investors: Math.floor(Math.random() * 20) + 1,
      description: `A paradigm-shifting enterprise leveraging distributed ledger technology for next-generation supply chain optimization and verifiable provenance tracking across global markets.`,
      growthRate: parseFloat(growth.toFixed(1)),
      stage: stages[i % stages.length],
      syndicateLead: `Global Capital Partners ${i % 3 + 1}`,
      complianceScore: compliance,
      techStack: techStacks[i % techStacks.length],
      threatVector: {
        geopolitical: parseFloat((Math.random() * 30).toFixed(1)),
        market: parseFloat((Math.random() * 50 + 20).toFixed(1)),
        technological: parseFloat((Math.random() * 40 + 10).toFixed(1)),
      },
      governanceModel: governanceModels[i % governanceModels.length],
      quantumEntanglementID: `QE-0x${(Math.random().toString(16) + '0000000000000').substr(2, 12).toUpperCase()}`,
      founderReputationScore,
      marketSaturation: parseFloat(marketSaturation.toFixed(1)),
      ipPortfolioStrength,
      societalImpactRating: societalImpactRatings[i % societalImpactRatings.length],
      hyperlaneConnectivity,
    };

    const aiMetrics = aiAnalyzeDealFlow(baseStartup as Startup);

    return { ...baseStartup, aiMetrics };
  });
};

const mockStartups: Startup[] = generateMockStartups(100);

// --- Sub-components for better structure ---

interface StatCardProps { 
    icon: React.ElementType; 
    title: string; 
    value: string; 
    change?: string; 
    aiInsight?: string; 
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, change, aiInsight }) => (
  <Card className="bg-gray-900 border-l-4 border-cyan-500/50 hover:shadow-cyan-500/20 shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-300 uppercase tracking-wider">{title}</CardTitle>
      <Icon className="h-5 w-5 text-cyan-400" />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-extrabold text-white">{value}</div>
      {change && <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{change} vs QTD</p>}
      {aiInsight && (
        <div className="mt-3 pt-2 border-t border-gray-800">
            <p className="text-xs text-gray-500 flex items-center">
                <Cpu className="w-3 h-3 mr-1 text-indigo-400"/> AI Insight: {aiInsight}
            </p>
        </div>
      )}
    </CardContent>
  </Card>
);

interface StartupCardProps { 
    startup: Startup; 
    onInvest: (startup: Startup, amount: number) => void;
    onViewDetails: (startup: Startup) => void;
}

const StartupCard: React.FC<StartupCardProps> = ({ startup, onInvest, onViewDetails }) => {
  const [investmentAmount, setInvestmentAmount] = useState('');
  const progress = (startup.amountRaised / startup.fundraisingGoal) * 100;
  const ai = startup.aiMetrics;

  const handleInvest = () => {
    const amount = parseFloat(investmentAmount);
    if (!isNaN(amount) && amount > 0 && amount <= (startup.fundraisingGoal - startup.amountRaised) * 1000000) {
      onInvest(startup, amount);
      setInvestmentAmount('');
    } else if (amount > (startup.fundraisingGoal - startup.amountRaised) * 1000000) {
        alert(`Investment exceeds remaining goal of $${(startup.fundraisingGoal - startup.amountRaised).toFixed(2)}M.`);
    } else {
        alert("Please enter a valid positive investment amount.");
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'bg-green-600/20 text-green-400 border-green-500';
    if (score < 60) return 'bg-yellow-600/20 text-yellow-400 border-yellow-500';
    return 'bg-red-600/20 text-red-400 border-red-500';
  };

  return (
    <Card className="flex flex-col h-full bg-gray-900 border border-gray-800 hover:border-cyan-500/50 transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-white hover:text-cyan-400 cursor-pointer" onClick={() => onViewDetails(startup)}>{startup.name}</CardTitle>
            <p className="text-sm text-gray-400 mt-1 flex items-center">
                <Globe className="w-3 h-3 mr-1"/> {startup.sector} | <span className='ml-1 font-mono text-xs text-gray-500'>{startup.ticker}</span>
            </p>
          </div>
          <Badge variant="default" className={`text-xs font-semibold ${startup.stage === 'Pre-IPO' ? 'bg-purple-600' : 'bg-cyan-600'}`}>{startup.stage}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4 pt-0">
        <p className="text-sm text-gray-400 line-clamp-3 italic">{startup.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm border-t border-gray-800 pt-3">
            <div className='flex flex-col'>
                <span className="text-xs text-gray-500 uppercase">Valuation</span>
                <span className="font-bold text-white">${startup.valuation.toFixed(1)}M</span>
            </div>
            <div className='flex flex-col'>
                <span className="text-xs text-gray-500 uppercase">Governance</span>
                <span className="font-semibold text-indigo-400 text-sm">{startup.governanceModel}</span>
            </div>
        </div>

        {/* AI Metrics Snapshot */}
        <div className="space-y-2 p-2 bg-gray-800/50 rounded-lg border border-indigo-700/50">
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><TrendingUp className='w-3 h-3 mr-1'/> Projected Growth</span>
                <span className='font-bold text-green-400'>{ai.growthProjection.toFixed(1)}%</span>
            </div>
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><BrainCircuit className='w-3 h-3 mr-1'/> Disruption Index</span>
                <span className='font-bold text-yellow-400'>{ai.disruptionIndex.toFixed(1)}</span>
            </div>
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><Globe className='w-3 h-3 mr-1'/> GEIN Score</span>
                <span className='font-bold text-cyan-400'>{ai.geinScore.toFixed(0)}</span>
            </div>
            <div className='flex justify-between items-center text-xs'>
                <span className='text-gray-300 flex items-center'><Zap className='w-3 h-3 mr-1'/> AI Sentiment</span>
                <Badge className={`px-2 py-0.5 text-xs ${getRiskColor(ai.riskScore)} border`}>{ai.sentiment}</Badge>
            </div>
        </div>

        {/* Fundraising Progress */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Capital Deployed</span>
            <span className='font-semibold'>{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className='h-2 bg-gray-700' indicatorClassName={progress >= 100 ? 'bg-green-500' : 'bg-cyan-500'} />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>${startup.amountRaised.toFixed(1)}M raised</span>
            <span>Goal: ${startup.fundraisingGoal.toFixed(1)}M</span>
          </div>
        </div>

        {/* Investment Interface */}
        <div className="flex space-x-2 pt-2 border-t border-gray-800">
          <Input 
            type="number" 
            placeholder="USD (M)" 
            className="flex-grow text-sm bg-gray-800 border-gray-700 focus:border-cyan-500" 
            value={investmentAmount} 
            onChange={(e) => setInvestmentAmount(e.target.value)}
            min="0.01"
            step="0.1"
          />
          <Button 
            onClick={handleInvest} 
            disabled={!investmentAmount || parseFloat(investmentAmount) <= 0}
            className="bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            Commit
          </Button>
        </div>
        <Button variant="outline" className='w-full text-xs' onClick={() => onViewDetails(startup)}>
            Deep Dive Analysis <ArrowUpRight className="ml-1 h-3 w-3"/>
        </Button>
      </CardContent>
    </Card>
  );
};

// --- Modal for Deep Dive Analysis ---
interface DetailModalProps {
    startup: Startup;
    onClose: () => void;
    onInvest: (startup: Startup, amount: number) => void;
}

const DeepDiveModal: React.FC<DetailModalProps> = ({ startup, onClose, onInvest }) => {
    const [localInvestment, setLocalInvestment] = useState('');
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('synthesis');

    const ai = startup.aiMetrics;
    const remainingGoal = startup.fundraisingGoal - startup.amountRaised;

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => {
            setSummary(aiGenerateExecutiveSummary(startup));
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [startup]);

    const handleCommit = () => {
        const amount = parseFloat(localInvestment);
        if (!isNaN(amount) && amount > 0 && amount <= remainingGoal) {
            onInvest(startup, amount * 1000000); // Convert Millions input to USD
            onClose();
        } else {
            alert(`Invalid amount. Must be between $0.01M and $${remainingGoal.toFixed(2)}M.`);
        }
    };

    const tabs = [
        { id: 'synthesis', label: 'AI Synthesis', icon: MessageSquareText },
        { id: 'financials', label: 'Financials', icon: BarChart3 },
        { id: 'risk', label: 'Risk Matrix', icon: ShieldCheck },
        { id: 'team', label: 'Team & Leadership', icon: Users },
        { id: 'market', label: 'Market Landscape', icon: Network },
        { id: 'tech', label: 'Technology & IP', icon: Atom },
        { id: 'gein', label: 'GEIN Analysis', icon: Globe },
        { id: 'governance', label: 'Governance', icon: Scale },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-gray-950 border-cyan-500/50 shadow-2xl">
                <CardHeader className="flex-shrink-0 bg-gray-950 z-10 border-b border-gray-800 flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl text-white">{startup.name} Deep Dive</CardTitle>
                        <p className="text-md text-cyan-400 mt-1">{startup.sector} | {startup.ticker} | {startup.stage}</p>
                    </div>
                    <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-white">
                        <Cpu className="w-6 h-6 rotate-90" />
                    </Button>
                </CardHeader>
                <div className="flex flex-grow overflow-hidden">
                    <nav className="w-48 flex-shrink-0 border-r border-gray-800 p-4 space-y-2">
                        {tabs.map(tab => (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? 'secondary' : 'ghost'}
                                className={`w-full justify-start ${activeTab === tab.id ? 'bg-cyan-800/50 text-white' : 'text-gray-400'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </Button>
                        ))}
                        <Separator className="my-4 bg-gray-700" />
                        <div className='p-4 bg-gray-800 rounded-lg space-y-3'>
                            <p className='text-sm text-gray-300'>Commit Capital (M):</p>
                            <Input 
                                type="number" 
                                placeholder={`Max: ${remainingGoal.toFixed(2)}M`} 
                                className="w-full text-lg bg-gray-700 border-gray-600 focus:border-cyan-500" 
                                value={localInvestment} 
                                onChange={(e) => setLocalInvestment(e.target.value)}
                                min="0.01"
                                step="0.1"
                            />
                            <Button 
                                onClick={handleCommit} 
                                disabled={!localInvestment || parseFloat(localInvestment) <= 0 || parseFloat(localInvestment) > remainingGoal}
                                className="w-full bg-green-600 hover:bg-green-700 text-white text-base py-2"
                            >
                                <UserCheck className='w-4 h-4 mr-2'/> Execute
                            </Button>
                        </div>
                    </nav>
                    <CardContent className="flex-grow overflow-y-auto p-6 space-y-6">
                        {activeTab === 'synthesis' && (
                            <div>
                                <div className="p-4 bg-indigo-900/20 border border-indigo-700 rounded-lg">
                                    <h3 className="text-xl font-semibold text-indigo-300 flex items-center mb-2"><MessageSquareText className='w-5 h-5 mr-2'/> AI Synthesis Report</h3>
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-8 text-gray-400"><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Generating Billion-Dollar Insights...</div>
                                    ) : (
                                        <p className="whitespace-pre-wrap text-gray-200 leading-relaxed text-sm">{summary}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                                    <StatCard icon={DollarSign} title="Valuation" value={`$${startup.valuation.toFixed(1)}M`} aiInsight={`AI projects ${ai.growthProjection.toFixed(1)}% growth.`} />
                                    <StatCard icon={Target} title="Remaining Raise" value={`$${remainingGoal.toFixed(2)}M`} />
                                    <StatCard icon={BrainCircuit} title="Disruption Index" value={`${ai.disruptionIndex}`} change="+5.2%" />
                                    <StatCard icon={Zap} title="AI Risk Score" value={`${ai.riskScore}%`} />
                                </div>
                            </div>
                        )}
                        {activeTab === 'financials' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Financial Overview</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Fundraising Trajectory</p>
                                        <Progress value={((startup.amountRaised / startup.fundraisingGoal) * 100)} className='h-3 bg-gray-700 mt-2' indicatorClassName={startup.amountRaised >= startup.fundraisingGoal ? 'bg-green-500' : 'bg-cyan-500'} />
                                        <p className='text-xs text-gray-500 mt-1'>${startup.amountRaised.toFixed(1)}M of ${startup.fundraisingGoal.toFixed(1)}M raised ({(startup.amountRaised / startup.fundraisingGoal * 100).toFixed(1)}%)</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Capitalization Table (Simulated)</p>
                                        <div className='text-sm mt-2 space-y-1 text-gray-300'>
                                            <p>Founders: 45%</p>
                                            <p>Seed Investors: 20%</p>
                                            <p>Series A (Current): 25% (Target)</p>
                                            <p>ESOP: 10%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'risk' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">AI-Powered Risk Matrix</h3>
                                <div className='space-y-4 p-3 bg-gray-900 rounded-lg'>
                                    {Object.entries(startup.threatVector).map(([key, value]) => (
                                        <div key={key}>
                                            <div className='flex justify-between text-sm text-gray-300 capitalize mb-1'>
                                                <span>{key} Threat</span>
                                                <span className={value > 50 ? 'text-red-400' : value > 25 ? 'text-yellow-400' : 'text-green-400'}>{value}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-700 rounded">
                                                <div className={`h-2 rounded ${value > 50 ? 'bg-red-500' : value > 25 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${value}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {activeTab === 'team' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Team & Leadership Analysis</h3>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Founder Reputation Score</p>
                                        <p className='text-2xl font-bold text-cyan-400 mt-1'>{startup.founderReputationScore}/100</p>
                                        <p className='text-xs text-gray-400'>AI analysis indicates strong prior exits and domain expertise.</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>AI-Projected Team Synergy</p>
                                        <p className='text-2xl font-bold text-green-400 mt-1'>{ai.teamSynergy}%</p>
                                        <p className='text-xs text-gray-400'>Optimal skill distribution and communication efficiency.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'market' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Market Landscape</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Sector</p>
                                        <p className='text-lg font-bold text-white mt-1'>{startup.sector}</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Market Saturation</p>
                                        <p className='text-lg font-bold text-yellow-400 mt-1'>{startup.marketSaturation}%</p>
                                        <p className='text-xs text-gray-400'>Significant greenfield opportunity remains.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'tech' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Technology & IP Moat</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Core Tech Stack</p>
                                        <div className='flex flex-wrap gap-2 mt-2'>
                                            {startup.techStack.map(tech => <Badge key={tech} variant="secondary">{tech}</Badge>)}
                                        </div>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>IP Portfolio Strength</p>
                                        <p className='text-lg font-bold text-indigo-400 mt-1'>{startup.ipPortfolioStrength}/100</p>
                                        <p className='text-xs text-gray-400'>Multiple patents filed in key jurisdictions.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'gein' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Global Economic Impact Nexus (GEIN)</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>GEIN Score</p>
                                        <p className='text-3xl font-extrabold text-cyan-400 mt-1'>{ai.geinScore}</p>
                                        <p className='text-xs text-gray-400'>Composite score indicating potential for positive global economic and societal impact.</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Societal Impact Rating</p>
                                        <p className='text-2xl font-bold text-green-400 mt-1'>Grade: {startup.societalImpactRating}</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Hyperlane Connectivity</p>
                                        <p className={`text-lg font-bold mt-1 ${startup.hyperlaneConnectivity ? 'text-green-400' : 'text-yellow-400'}`}>{startup.hyperlaneConnectivity ? 'Established' : 'Pending'}</p>
                                        <p className='text-xs text-gray-400'>Integration with next-generation decentralized data fabrics.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'governance' && (
                            <div>
                                <h3 className="text-xl font-semibold text-white mb-4">Governance & Compliance</h3>
                                <div className='space-y-4'>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Governance Model</p>
                                        <p className='text-lg font-bold text-cyan-400 mt-1'>{startup.governanceModel}</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Compliance Score</p>
                                        <p className='text-lg font-bold text-green-400 mt-1'>{startup.complianceScore}%</p>
                                        <p className='text-xs text-gray-400'>AI projects minimal regulatory friction.</p>
                                    </div>
                                    <div className='p-3 bg-gray-900 rounded-lg'>
                                        <p className='text-xs text-gray-500 uppercase'>Syndicate Lead</p>
                                        <p className='text-lg font-bold text-indigo-400 mt-1'>{startup.syndicateLead}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </div>
            </Card>
        </div>
    );
};


// --- Main Component: VentureCapitalDesk ---

const VentureCapitalDesk: React.FC = () => {
  const [startups, setStartups] = useState<Startup[]>(mockStartups); 
  const [searchTerm, setSearchTerm] = useState('');
  const [portfolioValue] = useState(15000000000); // Mock portfolio value: $15 Billion
  const [deployedCapital] = useState(4200000000); // Mock deployed capital: $4.2 Billion
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);

  const handleInvest = useCallback((investedStartup: Startup, amount: number) => {
    setStartups(prevStartups =>
      prevStartups.map(s =>
        s.id === investedStartup.id
          ? { 
              ...s, 
              amountRaised: s.amountRaised + amount / 1000000, 
              investors: s.investors + 1,
              aiMetrics: aiAnalyzeDealFlow({ ...s, amountRaised: s.amountRaised + amount / 1000000 } as Startup)
            }
          : s
      )
    );
    console.log(`Investment of $${(amount / 1000000).toFixed(2)}M committed to ${investedStartup.name}`);
  }, []);

  const filteredStartups = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return startups
        .filter(s => 
            s.name.toLowerCase().includes(lowerSearchTerm) ||
            s.sector.toLowerCase().includes(lowerSearchTerm) ||
            s.ticker.toLowerCase().includes(lowerSearchTerm)
        )
        .sort((a, b) => b.aiMetrics.disruptionIndex - a.aiMetrics.disruptionIndex);
  }, [startups, searchTerm]);

  const totalPortfolioExposure = useMemo(() => {
      return startups.reduce((sum, s) => sum + s.amountRaised, 0);
  }, [startups]);

  const handleViewDetails = useCallback((startup: Startup) => {
    setSelectedStartup(startup);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedStartup(null);
  }, []);

  return (
    <div className="space-y-8 p-4 md:p-8 min-h-screen bg-gray-950 text-white">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-cyan-400">Quantum Capital Nexus</h1>
          <p className="text-lg text-gray-400 mt-1">Advanced Investment Platform // Portfolio Management Layer 7</p>
        </div>
        <Button variant="default" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30">
          Execute Automated Allocation <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </header>

      <Card className="bg-gray-900 border-2 border-red-700/50 shadow-xl shadow-red-900/10">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-400 flex items-center"><Cpu className='w-6 h-6 mr-2'/> IDGAF.AI Protocol Mandate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-300">
          <p className="text-base italic border-l-4 border-red-500 pl-3">
            "I DO GIVE A F$#%"
          </p>
          <p className="text-sm text-gray-500"> Core Directive 001, Deployed by the Architect.</p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Briefcase} title="Total Portfolio Value" value={`$${(portfolioValue / 1000000000).toFixed(2)}B`} change="+1.8%" aiInsight="AI predicts sustained 1.5% MoM appreciation." />
        <StatCard icon={DollarSign} title="Capital Deployed" value={`$${(deployedCapital / 1000000000).toFixed(2)}B`} aiInsight={`Exposure at ${((totalPortfolioExposure / portfolioValue) * 100).toFixed(1)}% of fund capacity.`} />
        <StatCard icon={Rocket} title="Avg. Disruption Index" value={`${(startups.reduce((sum, s) => sum + s.aiMetrics.disruptionIndex, 0) / startups.length).toFixed(1)}`} change="+0.4%" aiInsight="Sector diversification optimized." />
        <StatCard icon={Globe} title="Avg. GEIN Score" value={`${(startups.reduce((sum, s) => sum + s.aiMetrics.geinScore, 0) / startups.length).toFixed(0)}`} change="+1.2%" aiInsight="Positive societal impact correlation." />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-center pt-4 border-t border-gray-800">
        <div className="relative flex-grow w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
                placeholder="Search by Name, Ticker, or Sector (e.g., 'Fintech' or 'AD1005')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 bg-gray-800 border-gray-700 focus:border-cyan-500"
            />
        </div>
        <Badge variant="secondary" className='text-sm py-2 px-4 bg-gray-800 border border-gray-700 text-gray-300'>
            Displaying {filteredStartups.length} Opportunities
        </Badge>
      </div>

      {filteredStartups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStartups.map(startup => (
            <StartupCard 
                key={startup.id} 
                startup={startup} 
                onInvest={handleInvest} 
                onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-700 rounded-xl bg-gray-900/50">
            <Target className="w-10 h-10 mx-auto text-gray-600 mb-3"/>
            <h3 className="text-xl font-semibold text-gray-400">No Opportunities Match Query</h3>
            <p className="text-gray-500">Adjust your search parameters or wait for the next AI pipeline ingestion cycle.</p>
        </div>
      )}

      {selectedStartup && (
        <DeepDiveModal 
            startup={selectedStartup} 
            onClose={handleCloseDetails} 
            onInvest={handleInvest}
        />
      )}
    </div>
  );
};

export default VentureCapitalDesk;