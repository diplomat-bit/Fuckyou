import React, { useState, useContext, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
    Zap, Users, Layers, FileText, 
    ShieldCheck, Activity, CheckCircle2, ArrowUpRight, 
    ArrowDownLeft, Filter, Search, MessageSquare, 
    Send, ShieldAlert, Globe, Cpu, Database, 
    Lock, Eye, EyeOff, Terminal, BarChart3, 
    CreditCard, Landmark, RefreshCcw, Settings,
    Bell, UserCheck, Fingerprint, Key, AlertTriangle,
    ChevronRight, Download, Share2, Trash2, Plus,
    ExternalLink, Briefcase, TrendingUp, PieChart,
    Clock, Shield, HardDrive, Server, Code
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { DataContext } from '../context/DataContext';
import Card from './Card';

/**
 * QUANTUM FINANCIAL NEXUS - THE GOLDEN TICKET EXPERIENCE
 * 
 * This is a high-performance, elite business banking demo environment.
 * Metaphor: You are in the cockpit of a financial supercar. 
 * Kick the tires. See the engine roar.
 * 
 * PHILOSOPHY:
 * - No Pressure.
 * - High Polish.
 * - Robust Security.
 * - AI-Driven Intelligence.
 */

// ================================================================================================
// TYPE DEFINITIONS & INTERFACES
// ================================================================================================

type Tab = 'PAYMENTS' | 'ENTITIES' | 'VIRTUAL_LEDGER' | 'RECONCILIATION' | 'SECURITY' | 'ANALYTICS' | 'AUDIT';

interface AuditEntry {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    details: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    ipAddress: string;
}

interface ChatMessage {
    role: 'user' | 'ai' | 'system';
    content: string;
    timestamp: string;
    actionTriggered?: string;
}

interface PaymentIntent {
    id: string;
    status: 'Succeeded' | 'Pending' | 'Failed' | 'Processing';
    amount: number;
    currency: string;
    customer: string;
    date: string;
    method: 'WIRE' | 'ACH' | 'SWIFT';
    riskScore: number;
}

interface FraudAlert {
    id: string;
    type: string;
    severity: 'High' | 'Medium' | 'Low';
    description: string;
    timestamp: string;
    status: 'Open' | 'Investigating' | 'Resolved';
}

// ================================================================================================
// MOCK DATA & CONSTANTS
// ================================================================================================

const INITIAL_PAYMENTS: PaymentIntent[] = [
    { id: 'TXN-99281-QX', status: 'Succeeded', amount: 1250000, currency: 'USD', customer: 'Nexus Global Corp', date: '2025-01-22 14:30', method: 'WIRE', riskScore: 0.02 },
    { id: 'TXN-88122-AL', status: 'Pending', amount: 540000, currency: 'USD', customer: 'Alpha Ventures', date: '2025-01-22 14:45', method: 'ACH', riskScore: 0.15 },
    { id: 'TXN-77310-GM', status: 'Failed', amount: 9800000, currency: 'USD', customer: 'Gamma Systems', date: '2025-01-21 09:00', method: 'SWIFT', riskScore: 0.88 },
    { id: 'TXN-66211-BT', status: 'Succeeded', amount: 45000, currency: 'EUR', customer: 'Berlin Tech Hub', date: '2025-01-21 10:15', method: 'WIRE', riskScore: 0.01 },
    { id: 'TXN-55109-SN', status: 'Processing', amount: 220000, currency: 'GBP', customer: 'SkyNet Logistics', date: '2025-01-22 15:00', method: 'ACH', riskScore: 0.05 },
];

const FRAUD_ALERTS: FraudAlert[] = [
    { id: 'ALR-001', type: 'Velocity Spike', severity: 'High', description: 'Multiple high-value wires to unverified offshore accounts detected within 5 minutes.', timestamp: '2025-01-22 14:55', status: 'Open' },
    { id: 'ALR-002', type: 'Geo-Anomaly', severity: 'Medium', description: 'Login attempt from unrecognized IP range in Eastern Europe.', timestamp: '2025-01-22 12:20', status: 'Investigating' },
    { id: 'ALR-003', type: 'MFA Bypass Attempt', severity: 'High', description: 'Repeated failed biometric verification on administrative account.', timestamp: '2025-01-21 23:45', status: 'Resolved' },
];

// ================================================================================================
// SUB-COMPONENTS (MODALS & FORMS)
// ================================================================================================

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-cyan-500/10">
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <Trash2 size={20} className="text-gray-500 hover:text-red-400" />
                    </button>
                </div>
                <div className="p-8 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

// ================================================================================================
// MAIN COMPONENT LOGIC
// ================================================================================================

const useStripeNexusView: React.FC = () => {
    // Context & State
    const { deductCredits, userProfile } = useContext(DataContext)!;
    const [activeTab, setActiveTab] = useState<Tab>('PAYMENTS');
    const [payments, setPayments] = useState<PaymentIntent[]>(INITIAL_PAYMENTS);
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { role: 'system', content: 'Quantum Financial AI Core Online. How can I assist your global operations today?', timestamp: new Date().toLocaleTimeString() }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [showWireModal, setShowWireModal] = useState(false);
    const [showMfaModal, setShowMfaModal] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [isSecureMode, setIsSecureMode] = useState(true);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // --------------------------------------------------------------------------------------------
    // AUDIT LOGGING ENGINE
    // --------------------------------------------------------------------------------------------
    const logAction = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'INFO') => {
        const newEntry: AuditEntry = {
            id: `AUD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            timestamp: new Date().toISOString(),
            action,
            actor: userProfile?.name || 'System Architect',
            details,
            severity,
            ipAddress: '192.168.1.104 (Encrypted Tunnel)'
        };
        setAuditLogs(prev => [newEntry, ...prev]);
        console.log(`[AUDIT] ${action}: ${details}`);
    }, [userProfile]);

    // --------------------------------------------------------------------------------------------
    // AI CORE INTEGRATION (GEMINI)
    // --------------------------------------------------------------------------------------------
    const handleAiChat = async () => {
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = { role: 'user', content: chatInput, timestamp: new Date().toLocaleTimeString() };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAiLoading(true);
        logAction('AI_QUERY', `User asked: ${chatInput.substring(0, 50)}...`);

        try {
            // Using the provided GEMINI_API_KEY logic
            const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const systemPrompt = `
                You are the Quantum Financial AI Strategist. 
                You are helping a high-net-worth business user manage their global financial institution.
                The company is "Quantum Financial" (NEVER mention Citibank).
                The user is "James".
                You can trigger UI actions by including specific tags in your response:
                [ACTION:OPEN_WIRE] - To open the wire transfer form.
                [ACTION:SHOW_SECURITY] - To switch to the security tab.
                [ACTION:GENERATE_REPORT] - To simulate report generation.
                
                Tone: Elite, Professional, Secure, High-Performance.
                Metaphor: Financial supercar, Golden Ticket, Kick the tires.
            `;

            const result = await model.generateContent([systemPrompt, ...chatHistory.map(m => m.content), chatInput]);
            const responseText = result.response.text();

            // Parse actions
            let actionTriggered = '';
            if (responseText.includes('[ACTION:OPEN_WIRE]')) {
                setShowWireModal(true);
                actionTriggered = 'OPEN_WIRE';
            } else if (responseText.includes('[ACTION:SHOW_SECURITY]')) {
                setActiveTab('SECURITY');
                actionTriggered = 'SHOW_SECURITY';
            }

            const aiMsg: ChatMessage = { 
                role: 'ai', 
                content: responseText.replace(/\[ACTION:.*\]/g, ''), 
                timestamp: new Date().toLocaleTimeString(),
                actionTriggered
            };
            
            setChatHistory(prev => [...prev, aiMsg]);
            logAction('AI_RESPONSE', `AI responded and triggered ${actionTriggered || 'no action'}`);
        } catch (error) {
            console.error("AI Core Error:", error);
            setChatHistory(prev => [...prev, { role: 'ai', content: "I apologize, but my neural link is experiencing latency. Please try again.", timestamp: new Date().toLocaleTimeString() }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    // --------------------------------------------------------------------------------------------
    // BUSINESS ACTIONS
    // --------------------------------------------------------------------------------------------
    const handleWireTransfer = (e: React.FormEvent) => {
        e.preventDefault();
        logAction('WIRE_INITIATED', 'User submitted wire transfer form for $250,000.00', 'WARNING');
        setShowWireModal(false);
        setShowMfaModal(true);
    };

    const verifyMfa = () => {
        if (mfaCode === '123456') {
            logAction('WIRE_AUTHORIZED', 'MFA Verified. Wire TXN-QX-992 dispatched to SWIFT network.', 'INFO');
            setShowMfaModal(false);
            setMfaCode('');
            alert("WIRE DISPATCHED: The engine is roaring. Funds are in flight.");
        } else {
            logAction('MFA_FAILURE', 'Incorrect MFA code entered.', 'CRITICAL');
            alert("ACCESS DENIED: Security protocols engaged.");
        }
    };

    const handleRefund = (id: string, cost: number) => {
        if (deductCredits(cost)) {
            setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Processing' } : p));
            logAction('REFUND_REQUESTED', `Refund initiated for ${id}. Cost: ${cost} SC.`);
        }
    };

    // --------------------------------------------------------------------------------------------
    // RENDER HELPERS
    // --------------------------------------------------------------------------------------------
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const renderPayments = () => (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-emerald-950/10 border-emerald-500/30 group hover:border-emerald-400 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Gross Liquidity</p>
                            <p className="text-3xl font-black text-white font-mono">$42.8M</p>
                        </div>
                        <TrendingUp className="text-emerald-500 group-hover:scale-110 transition-transform" size={20} />
                    </div>
                    <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[75%] animate-pulse" />
                    </div>
                </Card>
                <Card className="bg-indigo-950/10 border-indigo-500/30 group hover:border-indigo-400 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Active Wires</p>
                            <p className="text-3xl font-black text-white font-mono">14</p>
                        </div>
                        <Globe className="text-indigo-500 group-hover:rotate-12 transition-transform" size={20} />
                    </div>
                    <p className="text-[10px] text-indigo-300 mt-2 font-mono">Global reach: 124 countries</p>
                </Card>
                <Card className="bg-amber-950/10 border-amber-500/30 group hover:border-amber-400 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Risk Index</p>
                            <p className="text-3xl font-black text-white font-mono">0.04</p>
                        </div>
                        <ShieldCheck className="text-amber-500" size={20} />
                    </div>
                    <p className="text-[10px] text-amber-300 mt-2 font-mono">Status: ULTRA-SECURE</p>
                </Card>
                <Card className="bg-cyan-950/10 border-cyan-500/30 group hover:border-cyan-400 transition-all">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-1">Sovereign Credits</p>
                            <p className="text-3xl font-black text-white font-mono">142.5K</p>
                        </div>
                        <Zap className="text-cyan-500 animate-bounce" size={20} />
                    </div>
                    <p className="text-[10px] text-cyan-300 mt-2 font-mono">Fuel for the engine</p>
                </Card>
            </div>
            
            <Card title="Global Transaction Registry" className="p-0 overflow-hidden bg-black/40 border-gray-800 shadow-2xl">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/20">
                    <div className="flex gap-2">
                        <button className="px-3 py-1 bg-gray-800 rounded-md text-[10px] font-bold text-gray-400 hover:text-white transition-colors">ALL</button>
                        <button className="px-3 py-1 hover:bg-gray-800 rounded-md text-[10px] font-bold text-gray-500 hover:text-white transition-colors">WIRES</button>
                        <button className="px-3 py-1 hover:bg-gray-800 rounded-md text-[10px] font-bold text-gray-500 hover:text-white transition-colors">ACH</button>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                        <input 
                            type="text" 
                            placeholder="Filter by ID or Entity..." 
                            className="bg-gray-950 border border-gray-800 rounded-full pl-9 pr-4 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-cyan-500/50 w-64"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left font-mono">
                        <thead className="bg-gray-900/80 border-b border-gray-800 text-[10px] text-gray-500 font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Counterparty</th>
                                <th className="px-6 py-4">Method</th>
                                <th className="px-6 py-4 text-right">Magnitude</th>
                                <th className="px-6 py-4 text-center">Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {payments.map(p => (
                                <tr key={p.id} className="hover:bg-cyan-500/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${p.riskScore > 0.5 ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`} />
                                            <span className="text-cyan-400 font-bold">{p.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                                            p.status === 'Succeeded' ? 'border-green-500/30 text-green-400 bg-green-500/5' :
                                            p.status === 'Pending' ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' :
                                            p.status === 'Processing' ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' :
                                            'border-red-500/30 text-red-400 bg-red-500/5'
                                        }`}>{p.status.toUpperCase()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300 font-medium">{p.customer}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold">
                                            {p.method === 'WIRE' ? <Zap size={12} /> : <RefreshCcw size={12} />}
                                            {p.method}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-black text-white">
                                        {p.currency} {p.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleRefund(p.id, 100)}
                                            className="p-2 text-gray-600 hover:text-cyan-400 transition-colors"
                                            title="Initiate Reversal (100 SC)"
                                        >
                                            <RefreshCcw size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );

    const renderSecurity = () => (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-700">
            <div className="lg:col-span-2 space-y-6">
                <Card title="Neural Fraud Monitoring" subtitle="Real-time heuristic analysis of global traffic" icon={<ShieldAlert className="text-red-500" />}>
                    <div className="space-y-4">
                        {FRAUD_ALERTS.map(alert => (
                            <div key={alert.id} className="flex items-start gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-2xl hover:border-red-500/30 transition-all">
                                <div className={`p-2 rounded-xl ${alert.severity === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    <AlertTriangle size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="text-sm font-black text-white uppercase tracking-tight">{alert.type}</h4>
                                        <span className="text-[10px] font-mono text-gray-500">{alert.timestamp}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed mb-3">{alert.description}</p>
                                    <div className="flex gap-3">
                                        <button className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:underline">Investigate</button>
                                        <button className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white">Dismiss</button>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                                        alert.status === 'Open' ? 'border-red-500/50 text-red-400' : 'border-amber-500/50 text-amber-400'
                                    }`}>
                                        {alert.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="Biometric Access Control" icon={<Fingerprint className="text-cyan-500" />}>
                        <div className="flex items-center justify-between p-4 bg-gray-950 rounded-xl border border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                                    <UserCheck className="text-cyan-500" size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-white">James B. O'Callaghan III</p>
                                    <p className="text-[10px] text-gray-500">Architect Level Access</p>
                                </div>
                            </div>
                            <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        </div>
                        <button className="w-full mt-4 py-3 bg-gray-800 hover:bg-gray-700 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all">
                            Rotate Master Keys
                        </button>
                    </Card>
                    <Card title="Encryption Status" icon={<Lock className="text-indigo-500" />}>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Protocol</span>
                                <span className="text-[10px] font-mono text-indigo-400">AES-256-GCM-QUANTUM</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Tunnel</span>
                                <span className="text-[10px] font-mono text-green-400">ACTIVE / SHIELDED</span>
                            </div>
                            <div className="pt-2">
                                <div className="flex justify-between mb-1">
                                    <span className="text-[9px] text-gray-500 uppercase">Entropy Level</span>
                                    <span className="text-[9px] text-gray-400">99.9%</span>
                                </div>
                                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[99%]" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="space-y-6">
                <Card title="Security Posture" className="bg-gradient-to-b from-gray-900 to-black border-gray-700">
                    <div className="flex flex-col items-center py-8">
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="96" cy="96" r="80" fill="none" stroke="#1f2937" strokeWidth="12" />
                                <circle cx="96" cy="96" r="80" fill="none" stroke="#06b6d4" strokeWidth="12" strokeDasharray="502.4" strokeDashoffset="50.24" strokeLinecap="round" className="animate-pulse" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-black text-white italic">90</span>
                                <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Secure Score</span>
                            </div>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                            <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl text-center">
                                <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Threats Blocked</p>
                                <p className="text-lg font-black text-white">1,242</p>
                            </div>
                            <div className="p-3 bg-gray-950 border border-gray-800 rounded-xl text-center">
                                <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">MFA Success</p>
                                <p className="text-lg font-black text-white">100%</p>
                            </div>
                        </div>
                    </div>
                </Card>
                <Card title="System Integrity" icon={<Activity size={16} className="text-green-500" />}>
                    <div className="space-y-3">
                        {['Core Ledger', 'Auth Gateway', 'SWIFT Bridge', 'AI Strategist'].map(service => (
                            <div key={service} className="flex justify-between items-center p-2 hover:bg-gray-800/50 rounded-lg transition-colors">
                                <span className="text-xs text-gray-300">{service}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono text-green-500">OPERATIONAL</span>
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderAudit = () => (
        <Card title="Immutable Audit Storage" subtitle="Every sensitive action is cryptographically logged" icon={<Database className="text-cyan-500" />}>
            <div className="overflow-x-auto">
                <table className="w-full text-xs font-mono">
                    <thead className="text-gray-500 border-b border-gray-800">
                        <tr>
                            <th className="px-4 py-3 text-left">TIMESTAMP</th>
                            <th className="px-4 py-3 text-left">ACTION</th>
                            <th className="px-4 py-3 text-left">ACTOR</th>
                            <th className="px-4 py-3 text-left">DETAILS</th>
                            <th className="px-4 py-3 text-right">SEVERITY</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {auditLogs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-12 text-center text-gray-600 italic">
                                    No audit entries recorded in this session.
                                </td>
                            </tr>
                        ) : (
                            auditLogs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                    <td className="px-4 py-3 font-bold text-white">{log.action}</td>
                                    <td className="px-4 py-3 text-cyan-500">{log.actor}</td>
                                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{log.details}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                                            log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                            log.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-cyan-500/20 text-cyan-400'
                                        }`}>
                                            {log.severity}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );

    // --------------------------------------------------------------------------------------------
    // MAIN RENDER
    // --------------------------------------------------------------------------------------------
    return (
        <div className="flex flex-col lg:flex-row gap-8 h-full min-h-screen bg-black text-gray-100 p-4 lg:p-8 font-sans selection:bg-cyan-500/30">
            
            {/* LEFT COLUMN: MAIN DASHBOARD */}
            <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                
                {/* HEADER SECTION */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8">
                    <div className="animate-in slide-in-from-left duration-700">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-cyan-600 rounded-lg shadow-[0_0_20px_rgba(8,145,178,0.4)]">
                                <Landmark className="text-white" size={24} />
                            </div>
                            <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">Quantum Financial</h1>
                        </div>
                        <p className="text-cyan-400 text-sm font-mono tracking-[0.4em] uppercase flex items-center gap-2">
                            <Cpu size={14} className="animate-spin-slow" /> Unified Financial Nexus // Rail-01
                        </p>
                    </div>
                    <div className="flex gap-4 animate-in slide-in-from-right duration-700">
                        <div className="bg-gray-900 border border-gray-700 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl">
                            <div className="relative">
                                <Activity className="text-green-500 animate-pulse" size={18} />
                                <div className="absolute inset-0 bg-green-500/20 blur-md animate-pulse" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">System Status</span>
                                <span className="text-xs font-bold text-green-400 uppercase">Nominal</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsSecureMode(!isSecureMode)}
                            className={`px-4 py-2 rounded-2xl border transition-all flex items-center gap-2 ${
                                isSecureMode ? 'bg-cyan-600/10 border-cyan-500/50 text-cyan-400' : 'bg-red-600/10 border-red-500/50 text-red-400'
                            }`}
                        >
                            {isSecureMode ? <Shield size={18} /> : <ShieldOff size={18} />}
                            <span className="text-xs font-black uppercase tracking-widest">{isSecureMode ? 'Shielded' : 'Exposed'}</span>
                        </button>
                    </div>
                </header>

                {/* NAVIGATION TABS */}
                <div className="flex flex-wrap gap-2 bg-gray-900/30 p-1.5 rounded-2xl border border-gray-800/50 w-fit backdrop-blur-sm">
                    {[
                        { id: 'PAYMENTS', label: 'Payments', icon: <Zap size={14} /> },
                        { id: 'SECURITY', label: 'Security', icon: <ShieldCheck size={14} /> },
                        { id: 'AUDIT', label: 'Audit Log', icon: <Database size={14} /> },
                        { id: 'ANALYTICS', label: 'Analytics', icon: <BarChart3 size={14} /> },
                        { id: 'VIRTUAL_LEDGER', label: 'Ledgers', icon: <Layers size={14} /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as Tab);
                                logAction('TAB_SWITCH', `User navigated to ${tab.label}`);
                            }}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${
                                activeTab === tab.id 
                                ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(8,145,178,0.4)] scale-105' 
                                : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                            }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* MAIN CONTENT AREA */}
                <main className="min-h-[600px] pb-12">
                    {activeTab === 'PAYMENTS' && renderPayments()}
                    {activeTab === 'SECURITY' && renderSecurity()}
                    {activeTab === 'AUDIT' && renderAudit()}
                    {activeTab === 'ANALYTICS' && (
                        <div className="flex flex-col items-center justify-center h-[400px] text-gray-600 border-2 border-dashed border-gray-800 rounded-3xl">
                            <BarChart3 size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-mono uppercase tracking-widest">Synthesizing Global Market Data...</p>
                        </div>
                    )}
                    {activeTab === 'VIRTUAL_LEDGER' && (
                        <div className="flex flex-col items-center justify-center h-[400px] text-gray-600 border-2 border-dashed border-gray-800 rounded-3xl">
                            <Layers size={48} className="mb-4 opacity-20" />
                            <p className="text-sm font-mono uppercase tracking-widest">Synchronizing Distributed Ledgers...</p>
                        </div>
                    )}
                </main>
            </div>

            {/* RIGHT COLUMN: AI COCKPIT & CHAT */}
            <div className="w-full lg:w-[400px] flex flex-col gap-6 animate-in slide-in-from-right duration-1000">
                
                {/* AI CHAT INTERFACE */}
                <Card className="flex-1 flex flex-col p-0 overflow-hidden bg-gray-900/40 border-gray-800 shadow-2xl backdrop-blur-xl min-h-[600px]">
                    <div className="p-6 border-b border-gray-800 bg-gradient-to-r from-cyan-900/20 to-transparent flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center shadow-[0_0_15px_rgba(8,145,178,0.5)]">
                                    <Cpu className="text-white" size={20} />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-white uppercase tracking-tighter italic">Sovereign Strategist</h3>
                                <p className="text-[9px] text-cyan-400 font-mono uppercase tracking-widest">AI Core v4.2-Flash</p>
                            </div>
                        </div>
                        <Settings size={16} className="text-gray-600 hover:text-white cursor-pointer transition-colors" />
                    </div>

                    {/* CHAT MESSAGES */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                        {chatHistory.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-cyan-600 text-white rounded-tr-none shadow-lg' 
                                    : msg.role === 'system'
                                    ? 'bg-gray-800/50 text-gray-400 border border-gray-700 italic text-center w-full'
                                    : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                }`}>
                                    {msg.content}
                                    {msg.actionTriggered && (
                                        <div className="mt-3 pt-3 border-t border-gray-700 flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase">
                                            <Zap size={12} /> Action Executed: {msg.actionTriggered}
                                        </div>
                                    )}
                                    <div className={`mt-2 text-[8px] opacity-50 font-mono ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.timestamp}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isAiLoading && (
                            <div className="flex justify-start animate-pulse">
                                <div className="bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-700">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* CHAT INPUT */}
                    <div className="p-6 border-t border-gray-800 bg-black/40">
                        <div className="relative flex items-center">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAiChat()}
                                placeholder="Command the AI Strategist..."
                                className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-5 pr-14 py-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-700"
                            />
                            <button 
                                onClick={handleAiChat}
                                disabled={isAiLoading || !chatInput.trim()}
                                className="absolute right-2 p-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 text-white rounded-xl transition-all shadow-lg"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="mt-3 text-[9px] text-gray-600 text-center font-mono uppercase tracking-widest">
                            Neural Link Secured // End-to-End Encrypted
                        </p>
                    </div>
                </Card>

                {/* QUICK ACTIONS CARD */}
                <Card title="Cockpit Controls" className="bg-gray-900/20 border-gray-800">
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setShowWireModal(true)}
                            className="flex flex-col items-center gap-2 p-4 bg-gray-800/50 hover:bg-cyan-600/20 border border-gray-700 rounded-2xl transition-all group"
                        >
                            <ArrowUpRight className="text-cyan-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">New Wire</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 bg-gray-800/50 hover:bg-indigo-600/20 border border-gray-700 rounded-2xl transition-all group">
                            <Plus className="text-indigo-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Add Entity</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 bg-gray-800/50 hover:bg-amber-600/20 border border-gray-700 rounded-2xl transition-all group">
                            <FileText className="text-amber-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Reports</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 p-4 bg-gray-800/50 hover:bg-emerald-600/20 border border-gray-700 rounded-2xl transition-all group">
                            <Share2 className="text-emerald-500 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Export Data</span>
                        </button>
                    </div>
                </Card>
            </div>

            {/* MODALS */}
            
            {/* WIRE TRANSFER MODAL */}
            <Modal isOpen={showWireModal} onClose={() => setShowWireModal(false)} title="Initiate Global Wire Transfer">
                <form onSubmit={handleWireTransfer} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Origin Account</label>
                            <select className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none">
                                <option>Quantum Operating (USD) - *4242</option>
                                <option>Global Reserve (EUR) - *8812</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Currency</label>
                            <select className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none">
                                <option>USD - US Dollar</option>
                                <option>EUR - Euro</option>
                                <option>GBP - British Pound</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recipient Name</label>
                        <input type="text" placeholder="Legal Entity Name" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none" required />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">SWIFT / BIC</label>
                            <input type="text" placeholder="8 or 11 characters" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Account Number / IBAN</label>
                            <input type="text" placeholder="Full account string" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500/50 outline-none" required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                            <input type="number" placeholder="0.00" className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-8 pr-4 py-4 text-2xl font-black text-white focus:border-cyan-500/50 outline-none" required />
                        </div>
                    </div>
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex gap-4">
                        <ShieldAlert className="text-amber-500 shrink-0" size={24} />
                        <p className="text-xs text-amber-200 leading-relaxed">
                            <span className="font-black uppercase">Security Notice:</span> This transaction exceeds your standard velocity limit. Multi-factor authentication will be required upon submission.
                        </p>
                    </div>
                    <button type="submit" className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-cyan-500/20 transition-all">
                        Authorize Dispatch
                    </button>
                </form>
            </Modal>

            {/* MFA MODAL */}
            <Modal isOpen={showMfaModal} onClose={() => setShowMfaModal(false)} title="Security Verification Required">
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-cyan-500/10 flex items-center justify-center border-2 border-cyan-500/30 animate-pulse">
                            <Key className="text-cyan-500" size={32} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-lg font-black text-white uppercase italic">Enter Authorization Code</h3>
                        <p className="text-xs text-gray-500">A secure code has been sent to your registered biometric device.</p>
                    </div>
                    <div className="flex justify-center gap-3">
                        <input 
                            type="text" 
                            maxLength={6}
                            value={mfaCode}
                            onChange={(e) => setMfaCode(e.target.value)}
                            placeholder="000000"
                            className="w-48 bg-gray-950 border-2 border-gray-800 rounded-2xl px-4 py-4 text-3xl font-black text-center tracking-[0.5em] text-cyan-400 focus:border-cyan-500 outline-none"
                        />
                    </div>
                    <p className="text-[10px] text-gray-600 uppercase font-bold">Demo Code: 123456</p>
                    <button 
                        onClick={verifyMfa}
                        className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-cyan-400 transition-all"
                    >
                        Verify Identity
                    </button>
                </div>
            </Modal>

            {/* CUSTOM SCROLLBAR STYLES */}
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
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

export default useStripeNexusView;