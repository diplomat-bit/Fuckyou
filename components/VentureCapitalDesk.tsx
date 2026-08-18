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