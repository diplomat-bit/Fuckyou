import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, 
    LineChart, Line, CartesianGrid, AreaChart, Area, PieChart, Pie 
} from 'recharts';

/**
 * QUANTUM FINANCIAL - ELITE BUSINESS DEMO ENGINE
 * VERSION: 4.0.0 "GOLDEN TICKET"
 * 
 * PHILOSOPHY: 
 * - High-Performance, Secure, Professional.
 * - "Kick the tires" - Full interactive simulation.
 * - Generative AI Integration (Backend Proxied).
 * - Audit-First Architecture.
 */

// --- TYPES & INTERFACES ---

export interface AuditEntry {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    severity: 'INFO' | 'WARN' | 'CRITICAL';
    details: string;
    checksum: string; // Simulated cryptographic link
}

export interface EnhancedAIInsight {
    id: string;
    title: string;
    description: string;
    urgency: 'low' | 'medium' | 'high';
    confidenceScore: number;
    actionable: boolean;
    actionType: 'rebalance_portfolio' | 'set_stop_loss' | 'execute_trade' | 'liquidity_provision' | 'wire_transfer' | 'fraud_alert';
    details?: any;
    tags: string[];
    geinFactor: number;
    riskAnalysis: {
        volatilityIndex: number;
        sharpeRatio: number;
        maxDrawdown: number;
    };
    backtestData: { name: string; value: number }[];
    alternativeActions: {
        actionType: string;
        rationale: string;
        confidence: number;
    }[];
}

// --- AUDIT LOGGING SYSTEM ---
const useAuditLogger = () => {
    const [logs, setLogs] = useState<AuditEntry[]>(() => [
        {
            id: 'LOG-INIT001',
            timestamp: new Date(Date.now() - 60000 * 5).toISOString(),
            action: 'SYSTEM_BOOT',
            actor: 'SYSTEM_KERNEL',
            severity: 'INFO',
            details: 'Quantum Financial Engine v4.0.0 initialized successfully.',
            checksum: 'a1b2c3d4'
        },
        {
            id: 'LOG-INIT002',
            timestamp: new Date(Date.now() - 60000 * 4).toISOString(),
            action: 'SECURE_NODE_CONNECT',
            actor: 'SYSTEM_AUTH_USER_01',
            severity: 'INFO',
            details: 'Connected to secure node 0x4F2 (Frankfurt).',
            checksum: 'e5f6g7h8'
        },
        {
            id: 'LOG-INIT003',
            timestamp: new Date(Date.now() - 60000 * 3).toISOString(),
            action: 'MFA_VERIFICATION',
            actor: 'SYSTEM_AUTH_USER_01',
            severity: 'INFO',
            details: 'Multi-factor authentication verified successfully.',
            checksum: 'i9j0k1l2'
        }
    ]);
    
    const logAction = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'INFO') => {
        const newEntry: AuditEntry = {
            id: `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            timestamp: new Date().toISOString(),
            action,
            actor: 'SYSTEM_AUTH_USER_01',
            severity,
            details,
            checksum: Math.random().toString(16).slice(2)
        };
        setLogs(prev => [newEntry, ...prev].slice(0, 100));
    }, []);

    return { logs, logAction };
};

// --- ICONS ---

const BoltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5.2a1 1 0 01-1.17.986l-3.2-1.1a1 1 0 00-1.26.95l.5 3.5a1 1 0 01-.45.95l-2.7 2.1a1 1 0 00-.55 1.34l3.2 5.9a1 1 0 01.05.52 1 1 0 01-1.6 1.04l-1.4-1.4a1 1 0 00-1.4 1.4l1.4 1.4a3 3 0 004.2 0l9.4-9.4a1 1 0 01-.1-1.5l-5.9-3.2a1 1 0 01-.5-.05l-3.5-.5a1 1 0 00-.95 1.26l1.1 3.2A1 1 0 018.8 11V2a1 1 0 011.3-.954z" clipRule="evenodd" />
    </svg>
);

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
);

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
);

// --- COMPONENTS ---

const Card: React.FC<{ 
    title: React.ReactNode; 
    children: React.ReactNode; 
    className?: string; 
    icon?: React.ReactNode;
    bodyClassName?: string;
    action?: React.ReactNode;
}> = ({ title, children, className = '', icon, bodyClassName = 'p-6', action }) => (
    <div className={`bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-xl overflow-hidden shadow-2xl flex flex-col ${className}`}>
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 shrink-0">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {icon} {title}
            </h3>
            {action ? action : (
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                </div>
            )}
        </div>
        <div className={`flex-1 ${bodyClassName}`}>{children}</div>
    </div>
);

// --- AI CHATBOT ENGINE ---

const QuantumChat: React.FC<{ onAction: (action: string, data: any) => void }> = ({ onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
        { role: 'ai', content: "Welcome to Quantum Financial. I am your AI co-pilot. Think of this as the cockpit of a high-performance vehicle. How can I help you navigate your global finances today?" }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsTyping(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });

            if (!response.ok) throw new Error('API Error');

            const data = await response.json();
            const text = data.response || data.text || data.reply || data.message || (typeof data === 'string' ? data : '');

            // Parse Action
            const actionMatch = text.match(/ACTION:\s*({.*})/);
            if (actionMatch) {
                try {
                    const actionData = JSON.parse(actionMatch[1]);
                    onAction(actionData.type, actionData);
                } catch (e) {
                    console.error("Failed to parse action JSON", e);
                }
            }

            setMessages(prev => [...prev, { role: 'ai', content: text.replace(/ACTION:\s*{.*}/, '') }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: "I apologize, but I'm experiencing a momentary synchronization delay with the global markets. Please try again." }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            {isOpen ? (
                <Card
                    title={<span className="text-sm tracking-widest uppercase text-cyan-400">Quantum AI Co-Pilot</span>}
                    icon={<div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>}
                    className="w-96 h-[500px] animate-in slide-in-from-bottom-10 duration-300"
                    bodyClassName="p-0 flex flex-col"
                    action={
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    }
                >
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && <div className="text-xs text-cyan-500 animate-pulse">AI is calculating market vectors...</div>}
                    </div>
                    
                    {/* Quick Prompts */}
                    <div className="px-4 py-2 bg-gray-950 border-t border-gray-900 flex gap-2 overflow-x-auto shrink-0 custom-scrollbar">
                        {[
                            { label: 'Analyze Risk', text: 'Analyze current portfolio risk exposure.' },
                            { label: 'Trigger Wire', text: 'Initiate a wire transfer of $50,000 to SG-Global-Trade.' },
                            { label: 'Optimize Yield', text: 'What is the best yield optimization strategy right now?' }
                        ].map((p, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setInput(p.text);
                                }}
                                className="shrink-0 px-2 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded text-[10px] text-cyan-400 font-medium transition-colors"
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-800 bg-gray-950 shrink-0">
                        <div className="flex gap-2">
                            <input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Command the system..."
                                className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                            />
                            <button onClick={handleSend} className="bg-cyan-600 p-2 rounded-lg hover:bg-cyan-500">
                                <BoltIcon />
                            </button>
                        </div>
                    </div>
                </Card>
            ) : (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform group"
                >
                    <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-20"></div>
                    <ChatIcon />
                </button>
            )}
        </div>
    );
};

// --- STRIPE SIMULATION MODAL ---

const StripeCheckoutModal: React.FC<{ amount: number; recipient: string; onClose: () => void; onComplete: () => void }> = ({ amount, recipient, onClose, onComplete }) => {
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePay = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setStep(2);
            onComplete();
        }, 2500);
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[110] flex items-center justify-center backdrop-blur-xl p-4">
            <Card
                title={<span className="text-indigo-400">Stripe Secure Payment</span>}
                icon={<ShieldIcon />}
                className="w-full max-w-md"
                action={
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                }
            >
                {step === 1 ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-gray-300">
                        <div className="mb-6">
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Payment to</label>
                            <div className="text-lg font-semibold text-white">{recipient}</div>
                        </div>
                        <div className="mb-8">
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Amount</label>
                            <div className="text-4xl font-black text-white">${amount.toLocaleString()}</div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-800 border border-gray-700 rounded-xl flex items-center gap-4">
                                <div className="w-12 h-8 bg-gray-900 rounded flex items-center justify-center font-bold text-[10px] text-white">VISA</div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white">•••• 4242</div>
                                    <div className="text-xs text-gray-400">Expires 12/28</div>
                                </div>
                            </div>
                            <button 
                                onClick={handlePay}
                                disabled={isProcessing}
                                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {isProcessing ? (
                                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : `Pay $${amount.toLocaleString()}`}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 animate-in zoom-in duration-500 text-gray-300">
                        <div className="w-20 h-20 bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-white">Payment Successful</h2>
                        <p className="text-gray-500 mb-8">Transaction ID: ch_3N5k9L2eZvKYlo2C1</p>
                        <button onClick={onClose} className="w-full bg-gray-800 text-white py-4 rounded-xl font-bold hover:bg-gray-700">Return to Quantum</button>
                    </div>
                )}
                <div className="mt-6 pt-4 border-t border-gray-800 text-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    Secure Encrypted Transaction via Quantum Financial
                </div>
            </Card>
        </div>
    );
};

// --- MAIN COMPONENT ---

export const AIInsights: React.FC = () => {
    const { logs, logAction } = useAuditLogger();
    const [selectedInsight, setSelectedInsight] = useState<EnhancedAIInsight | null>(null);
    const [showStripe, setShowStripe] = useState(false);
    const [stripeData, setStripeData] = useState({ amount: 0, recipient: '' });
    const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
    const [centerView, setCenterView] = useState<'performance' | 'allocation'>('performance');

    // Mock Data Generation
    const insights: EnhancedAIInsight[] = useMemo(() => [
        {
            id: 'ins_1',
            title: 'Anomalous Outflow Detected',
            description: 'A series of high-velocity transfers to a non-whitelisted entity in Singapore has been flagged by our neural monitors.',
            urgency: 'high',
            confidenceScore: 98,
            actionable: true,
            actionType: 'fraud_alert',
            details: { entity: 'SG-Global-Trade', amount: 1250000 },
            tags: ['Security', 'Fraud', 'Critical'],
            geinFactor: 0.99,
            riskAnalysis: { volatilityIndex: 88, sharpeRatio: 0.5, maxDrawdown: 40 },
            backtestData: Array.from({length: 20}, (_, i) => ({ name: `T-${20-i}`, value: 50 + Math.random() * 50 })),
            alternativeActions: [
                { actionType: 'freeze_account', rationale: 'Immediate cessation of all outbound liquidity.', confidence: 95 },
                { actionType: 'manual_review', rationale: 'Escalate to human compliance officer.', confidence: 80 }
            ]
        },
        {
            id: 'ins_2',
            title: 'Yield Optimization: EUR/USD',
            description: 'Predictive models suggest a 48-hour window of increased volatility in the Eurozone. Hedging recommended.',
            urgency: 'medium',
            confidenceScore: 84,
            actionable: true,
            actionType: 'execute_trade',
            details: { pair: 'EUR/USD', strategy: 'Short-Gamma' },
            tags: ['FX', 'Yield', 'Alpha'],
            geinFactor: 0.82,
            riskAnalysis: { volatilityIndex: 34, sharpeRatio: 2.1, maxDrawdown: 5 },
            backtestData: Array.from({length: 20}, (_, i) => ({ name: `T-${20-i}`, value: 100 + i * 2 + Math.random() * 5 })),
            alternativeActions: [
                { actionType: 'spot_buy', rationale: 'Direct exposure to the underlying asset.', confidence: 60 }
            ]
        },
        {
            id: 'ins_3',
            title: 'Liquidity Provision Opportunity',
            description: 'Quantum Pool #42 is showing a 12% APR spike due to institutional rebalancing.',
            urgency: 'low',
            confidenceScore: 72,
            actionable: true,
            actionType: 'liquidity_provision',
            details: { pool: 'Quantum-Alpha-IV' },
            tags: ['Treasury', 'Passive'],
            geinFactor: 0.75,
            riskAnalysis: { volatilityIndex: 12, sharpeRatio: 3.5, maxDrawdown: 2 },
            backtestData: Array.from({length: 20}, (_, i) => ({ name: `T-${20-i}`, value: 100 + Math.sin(i) * 10 })),
            alternativeActions: []
        }
    ], []);

    const filteredInsights = useMemo(() => {
        if (filter === 'all') return insights;
        return insights.filter(i => i.urgency === filter);
    }, [insights, filter]);

    const allocationData = [
        { name: 'USD Liquidity', value: 45, color: '#06b6d4' },
        { name: 'EUR Hedged', value: 25, color: '#3b82f6' },
        { name: 'SGD Yield Pools', value: 20, color: '#8b5cf6' },
        { name: 'Alpha Vaults', value: 10, color: '#ec4899' }
    ];

    const handleAIAction = (type: string, data: any) => {
        const normalizedType = type.toUpperCase();
        logAction(`AI_TRIGGERED_${normalizedType}`, JSON.stringify(data), 'INFO');
        if (normalizedType === 'WIRE_TRANSFER') {
            setStripeData({ amount: data.amount || 1000, recipient: data.recipient || 'Unknown Entity' });
            setShowStripe(true);
        } else {
            alert(`AI Action Triggered: ${normalizedType}\nDetails: ${JSON.stringify(data)}`);
        }
    };

    const executeStrategy = (insight: EnhancedAIInsight) => {
        const actionName = `STRATEGY_EXECUTION_${insight.actionType.toUpperCase()}`;
        logAction(actionName, `Executing strategy for ${insight.id}: ${insight.title}`, 'CRITICAL');
        setSelectedInsight(null);
        
        // Simulate multi-step execution in the audit log
        setTimeout(() => {
            logAction(`${actionName}_PENDING`, `Securing liquidity channels for ${insight.id}...`, 'INFO');
        }, 1500);
        setTimeout(() => {
            logAction(`${actionName}_SUCCESS`, `Strategy ${insight.id} successfully executed. Position established.`, 'INFO');
        }, 3500);
    };

    return (
        <div className="min-h-screen bg-[#05070a] text-gray-300 p-8 font-sans selection:bg-cyan-500/30">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                            <ShieldIcon />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Quantum Financial</h1>
                    </div>
                    <p className="text-gray-500 font-medium tracking-widest text-xs uppercase">Global Institutional Command Center // Secure Node 0x4F2</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-gray-900 border border-gray-800 px-6 py-3 rounded-xl flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">Total Liquidity</span>
                        <span className="text-2xl font-mono text-cyan-400 font-bold">$4,290,122,004.82</span>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 px-6 py-3 rounded-xl flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">System Health</span>
                        <span className="text-2xl font-mono text-green-400 font-bold">99.99%</span>
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Column: Insights */}
                <div className="lg:col-span-4 space-y-8">
                    <Card 
                        title="Strategic Intelligence" 
                        icon={<BoltIcon />} 
                        className="border-l-4 border-l-cyan-500"
                        action={
                            <div className="flex gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800">
                                {(['all', 'high', 'medium', 'low'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-2 py-1 text-[10px] font-bold uppercase rounded transition-colors ${filter === f ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        }
                    >
                        <div className="space-y-4">
                            {filteredInsights.map(insight => (
                                <div 
                                    key={insight.id}
                                    onClick={() => setSelectedInsight(insight)}
                                    className="group relative p-4 bg-gray-800/30 border border-gray-800 rounded-xl hover:border-cyan-500/50 transition-all cursor-pointer overflow-hidden"
                                >
                                    <div className={`absolute top-0 right-0 w-1 h-full ${insight.urgency === 'high' ? 'bg-red-500' : insight.urgency === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{insight.title}</h4>
                                        <div className="text-right">
                                            <span className="text-[10px] font-mono text-gray-500 block">{insight.confidenceScore}% CONF</span>
                                            <span className="text-[9px] font-mono text-cyan-500 block">GEIN: {insight.geinFactor}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-2 mb-3">{insight.description}</p>
                                    <div className="flex gap-2">
                                        {insight.tags.map(t => (
                                            <span key={t} className="text-[9px] px-2 py-0.5 bg-gray-900 rounded border border-gray-700 text-gray-500 uppercase font-bold">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Global Market Vectors" icon={<BoltIcon />}>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={Array.from({length: 12}, (_, i) => ({ name: i, val: 4000 + Math.random() * 2000 }))}>
                                    <defs>
                                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="val" stroke="#06b6d4" fillOpacity={1} fill="url(#colorVal)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Center Column: Detailed Analysis */}
                <div className="lg:col-span-5 space-y-8">
                    <Card 
                        title="Real-Time Performance Engine" 
                        className="h-full"
                        action={
                            <div className="flex gap-1 bg-gray-950 p-1 rounded-lg border border-gray-800">
                                <button
                                    onClick={() => setCenterView('performance')}
                                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded transition-colors ${centerView === 'performance' ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Performance
                                </button>
                                <button
                                    onClick={() => setCenterView('allocation')}
                                    className={`px-2 py-1 text-[10px] font-bold uppercase rounded transition-colors ${centerView === 'allocation' ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Allocation
                                </button>
                            </div>
                        }
                    >
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-gray-800/20 rounded-xl border border-gray-800">
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Alpha Generation</div>
                                <div className="text-xl font-mono text-white">+14.2%</div>
                            </div>
                            <div className="p-4 bg-gray-800/20 rounded-xl border border-gray-800">
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Risk Exposure</div>
                                <div className="text-xl font-mono text-yellow-500">MODERATE</div>
                            </div>
                        </div>
                        <div className="h-[400px]">
                            {centerView === 'performance' ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={Array.from({length: 8}, (_, i) => ({ name: `Node ${i}`, value: Math.random() * 100 }))}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                        <XAxis dataKey="name" stroke="#4b5563" fontSize={10} />
                                        <YAxis stroke="#4b5563" fontSize={10} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                            itemStyle={{ color: '#06b6d4' }}
                                        />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {Array.from({length: 8}).map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#06b6d4' : '#3b82f6'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={allocationData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {allocationData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                        {centerView === 'allocation' && (
                            <div className="grid grid-cols-2 gap-2 mt-4">
                                {allocationData.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-gray-400">{item.name}:</span>
                                        <span className="font-mono font-bold text-white">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-8 p-4 bg-cyan-900/10 border border-cyan-500/20 rounded-xl">
                            <div className="flex items-center gap-3 text-cyan-400 mb-2">
                                <BoltIcon />
                                <span className="text-sm font-bold uppercase tracking-widest">AI Optimization Active</span>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Our proprietary GEIN (Generative Edge & Intelligence Nexus) is currently re-routing liquidity through the Frankfurt-Singapore corridor to minimize latency and maximize yield.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Audit & Security */}
                <div className="lg:col-span-3 space-y-8">
                    <Card title="Immutable Audit Trail" icon={<ShieldIcon />}>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                            {logs.length === 0 && <div className="text-center py-8 text-gray-600 italic text-sm">No sensitive actions recorded in current session.</div>}
                            {logs.map(log => (
                                <div key={log.id} className="p-3 bg-gray-950 border-l-2 border-gray-800 rounded-r-lg">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${log.severity === 'CRITICAL' ? 'bg-red-900/40 text-red-400' : 'bg-gray-800 text-gray-400'}`}>
                                            {log.severity}
                                        </span>
                                        <span className="text-[8px] font-mono text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="text-[11px] font-bold text-gray-300 mb-1">{log.action}</div>
                                    <div className="text-[9px] text-gray-500 font-mono truncate">{log.details}</div>
                                    <div className="mt-2 text-[8px] text-cyan-900 font-mono uppercase tracking-tighter">SIG: {log.checksum}</div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card title="Security Status" icon={<ShieldIcon />}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-green-900/10 border border-green-500/20 rounded-lg">
                                <span className="text-xs font-bold text-green-500">MFA STATUS</span>
                                <span className="text-xs font-mono text-white">VERIFIED</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-cyan-900/10 border border-cyan-500/20 rounded-lg">
                                <span className="text-xs font-bold text-cyan-500">ENCRYPTION</span>
                                <span className="text-xs font-mono text-white">AES-GCM-256</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-purple-900/10 border border-purple-500/20 rounded-lg">
                                <span className="text-xs font-bold text-purple-500">VAULT MODE</span>
                                <span className="text-xs font-mono text-white">HOMOMORPHIC</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            {selectedInsight && (
                <div className="fixed inset-0 bg-black/80 z-[105] flex items-center justify-center backdrop-blur-md p-4">
                    <Card
                        title="Strategic Execution Module"
                        icon={<BoltIcon />}
                        className="w-full max-w-2xl animate-in zoom-in duration-200"
                        bodyClassName="p-8"
                        action={
                            <button onClick={() => setSelectedInsight(null)} className="text-gray-500 hover:text-white">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        }
                    >
                        <div className="mb-8">
                            <div className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2">Insight Analysis</div>
                            <h2 className="text-2xl font-bold text-white mb-4">{selectedInsight.title}</h2>
                            <p className="text-gray-400 leading-relaxed mb-4">{selectedInsight.description}</p>
                            {selectedInsight.details && (
                                <div className="p-3 bg-gray-950 border border-gray-800 rounded-lg font-mono text-xs text-gray-400">
                                    <span className="text-gray-500">METADATA:</span> {JSON.stringify(selectedInsight.details)}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-6 mb-8">
                            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 text-center">
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Volatility</div>
                                <div className="text-xl font-mono text-white">{selectedInsight.riskAnalysis.volatilityIndex}</div>
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 text-center">
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Sharpe</div>
                                <div className="text-xl font-mono text-green-400">{selectedInsight.riskAnalysis.sharpeRatio}</div>
                            </div>
                            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700 text-center">
                                <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Max DD</div>
                                <div className="text-xl font-mono text-red-400">{selectedInsight.riskAnalysis.maxDrawdown}%</div>
                            </div>
                        </div>

                        <div className="h-48 mb-8 bg-gray-950 rounded-xl border border-gray-800 p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={selectedInsight.backtestData}>
                                    <Line type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {selectedInsight.alternativeActions && selectedInsight.alternativeActions.length > 0 && (
                            <div className="mb-8">
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Alternative AI Recommendations</div>
                                <div className="space-y-3">
                                    {selectedInsight.alternativeActions.map((alt, idx) => (
                                        <div key={idx} className="p-3 bg-gray-950 border border-gray-800 rounded-lg flex justify-between items-center">
                                            <div>
                                                <div className="text-xs font-bold text-white uppercase">{alt.actionType.replace('_', ' ')}</div>
                                                <div className="text-[11px] text-gray-400">{alt.rationale}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-mono text-cyan-400 font-bold">{alt.confidence}%</div>
                                                <div className="text-[9px] text-gray-500 uppercase font-bold">Confidence</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button 
                                onClick={() => setSelectedInsight(null)}
                                className="flex-1 px-6 py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors"
                            >
                                Decline Strategy
                            </button>
                            <button 
                                onClick={() => executeStrategy(selectedInsight)}
                                className="flex-1 px-6 py-4 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.02]"
                            >
                                Execute Strategy
                            </button>
                        </div>
                    </Card>
                </div>
            )}

            {showStripe && (
                <StripeCheckoutModal 
                    amount={stripeData.amount} 
                    recipient={stripeData.recipient} 
                    onClose={() => setShowStripe(false)} 
                    onComplete={() => logAction('STRIPE_PAYMENT_SUCCESS', `Paid ${stripeData.amount} to ${stripeData.recipient}`, 'INFO')}
                />
            )}

            {/* Chatbot */}
            <QuantumChat onAction={handleAIAction} />

            {/* Footer Branding */}
            <div className="mt-12 pt-8 border-t border-gray-900 flex justify-between items-center text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                <div>© 2026 Quantum Financial Institutional Group. All Rights Reserved.</div>
                <div className="flex gap-6">
                    <span className="hover:text-cyan-500 cursor-pointer transition-colors">Terms of Service</span>
                    <span className="hover:text-cyan-500 cursor-pointer transition-colors">Privacy Protocol</span>
                    <span className="hover:text-cyan-500 cursor-pointer transition-colors">Regulatory Disclosures</span>
                </div>
            </div>
        </div>
    );
};

export default AIInsights;