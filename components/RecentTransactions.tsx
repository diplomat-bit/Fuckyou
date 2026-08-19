import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import Card from './Card';
import { Transaction, View } from '../types';
import { 
    ArrowUpRight, ArrowDownLeft, ShieldCheck, 
    AlertTriangle, Info, Search, FileJson, Share2, FileText,
    Bot, Send, Sparkles, Lock, Activity, Terminal, XCircle,
    Database, Eye, RefreshCw, Cpu, Zap, Globe, Shield,
    ChevronRight, ChevronDown, Filter, Download, CreditCard,
    Wallet, PieChart, TrendingUp, AlertOctagon
} from 'lucide-react';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const COMPANY_NAME = "Quantum Financial";
const DEMO_MODE = true;

// Sanitized Knowledge Base from the "Golden Ticket" article
const KNOWLEDGE_BASE = `
${COMPANY_NAME} Business Demo: A Comprehensive Guide.
This is a "Golden Ticket" experience. We are letting the user "Test Drive" the car (the code).
It must have "Bells and Whistles" - distinct features, high polish.
It is a "Cheat Sheet" for business banking.
NO PRESSURE environment. Metaphor: Kick the tires. See the engine roar.
Robust Payment & Collection capabilities (Wire, ACH).
Security is non-negotiable (Multi-factor auth simulations, Fraud monitoring).
Reporting & Analytics (Data visualization).
Integration capabilities (ERP, Accounting).
AUDIT STORAGE: Every sensitive action must be logged.
Tone: Elite, Professional, High-Performance, Secure.
${COMPANY_NAME}, a titan in the financial world, offers a suite of business banking solutions designed to streamline operations, enhance security, and support your growth.
Getting a demo is your golden ticket to seeing these powerful features in action before committing.
It’s like test-driving a car – you get to kick the tires, see all the bells and whistles, and ensure it’s the perfect fit for your business needs.
We’ll cover everything from the initial setup to exploring key functionalities and understanding the benefits that come with partnering with a global financial institution like ${COMPANY_NAME}.
A demo allows you to virtually walk through the entire platform. You get to see firsthand how easy it is to manage your accounts, process payments, track expenses, and access sophisticated reporting tools.
This isn’t just about looking at pretty interfaces; it’s about understanding the real-world application of these tools for your specific business.
Are you struggling with international payments? Worried about fraud? Need better insights into your cash flow? A demo lets you ask those specific questions and see how ${COMPANY_NAME}’s solutions can address them.
It’s also a fantastic opportunity to get a feel for the user experience. Is the platform intuitive? Can your team easily navigate it?
The demo provides a no-pressure environment to explore, interact, and evaluate without any commitment.
It’s about empowering yourself with knowledge so you can make an informed decision that aligns with your business goals and operational needs.
Plus, you get to see how ${COMPANY_NAME} integrates with other business tools you might already be using, saving you time and preventing data silos.
This proactive approach to understanding your financial tools can save you a ton of headaches down the line and ensure you’re leveraging the best resources available to drive your business forward.
It’s your chance to see the future of your business finances, laid out before you, in a clear and interactive way.
`;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AuditLog {
    id: string;
    timestamp: string;
    action: string;
    details: string;
    status: 'SUCCESS' | 'WARNING' | 'ERROR';
    hash: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    timestamp: Date;
    isTyping?: boolean;
}

interface TransactionInsight {
    id: string;
    type: 'risk' | 'opportunity' | 'pattern';
    message: string;
    confidence: number;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Renders a high-fidelity badge for transaction provenance.
 */
const ProvenanceBadge: React.FC<{ confidence: number }> = ({ confidence }) => {
    const isHigh = confidence > 0.9;
    const isMedium = confidence > 0.7 && confidence <= 0.9;
    
    let colorClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    let Icon = ShieldCheck;

    if (isMedium) {
        colorClass = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        Icon = AlertTriangle;
    } else if (!isHigh) {
        colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
        Icon = AlertOctagon;
    }

    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${colorClass} shadow-sm backdrop-blur-md`}>
            <Icon size={10} />
            AI Verified: {(confidence * 100).toFixed(0)}%
        </div>
    );
};

/**
 * Renders the transaction type icon with specific styling.
 */
const TransactionIcon: React.FC<{ type: string }> = ({ type }) => {
    const isIncome = type === 'income';
    return (
        <div className={`
            relative p-3 rounded-2xl border shadow-inner transition-all duration-500
            ${isIncome 
                ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20 shadow-emerald-900/20' 
                : 'bg-rose-900/20 text-rose-400 border-rose-500/20 shadow-rose-900/20'}
        `}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
            {isIncome ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
        </div>
    );
};

/**
 * A terminal-like display for audit logs.
 */
const AuditTerminal: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-black/80 rounded-lg border border-gray-800 p-4 font-mono text-xs h-48 flex flex-col shadow-inner">
            <div className="flex items-center justify-between mb-2 border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2 text-gray-400">
                    <Terminal size={12} />
                    <span className="uppercase tracking-widest font-bold">Secure Audit Storage</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar" ref={scrollRef}>
                {logs.length === 0 && <span className="text-gray-600 italic">Initializing secure log stream...</span>}
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-2 hover:bg-white/5 p-0.5 rounded">
                        <span className="text-gray-500">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                        <span className={`font-bold ${
                            log.status === 'SUCCESS' ? 'text-green-400' : 
                            log.status === 'WARNING' ? 'text-yellow-400' : 'text-red-400'
                        }`}>{log.status}</span>
                        <span className="text-cyan-300/80">{log.action}</span>
                        <span className="text-gray-400 truncate flex-1">:: {log.details}</span>
                        <span className="text-gray-600 text-[10px]">{log.hash}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface RecentTransactionsProps {
    transactions: Transaction[];
    setActiveView: (view: View) => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, setActiveView }) => {
    // --- State Management ---
    const [searchTerm, setSearchTerm] = useState('');
    const [isAiActive, setIsAiActive] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { 
            id: 'init', 
            role: 'ai', 
            content: `Welcome to the ${COMPANY_NAME} Ledger. I am the Quantum Core AI. I can analyze your transaction flow, detect anomalies, and provide financial forecasts. How can I assist you today?`, 
            timestamp: new Date() 
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showAudit, setShowAudit] = useState(false);

    // --- Refs ---
    const chatEndRef = useRef<HTMLDivElement>(null);
    const aiClientRef = useRef<any>(null);

    // --- Initialization ---
    useEffect(() => {
        // Initialize AI Client if key is present
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            try {
                const genAI = new GoogleGenAI({ apiKey }); // Use the provided snippet structure
                aiClientRef.current = genAI;
                addAuditLog('SYSTEM_INIT', 'AI Core initialized with Gemini Flash Preview', 'SUCCESS');
            } catch (e) {
                addAuditLog('SYSTEM_ERROR', 'Failed to initialize AI Core', 'ERROR');
            }
        } else {
            addAuditLog('SYSTEM_WARNING', 'GEMINI_API_KEY not found. Running in simulation mode.', 'WARNING');
        }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isAiActive]);

    // --- Helpers ---

    const generateHash = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const addAuditLog = (action: string, details: string, status: 'SUCCESS' | 'WARNING' | 'ERROR') => {
        const newLog: AuditLog = {
            id: generateHash(),
            timestamp: new Date().toISOString(),
            action,
            details,
            status,
            hash: `0x${generateHash().substring(0, 8)}`
        };
        setAuditLogs(prev => [...prev, newLog]);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (e.target.value.length > 2) {
            addAuditLog('USER_SEARCH', `Query: "${e.target.value}"`, 'SUCCESS');
        }
    };

    const filteredTransactions = transactions.filter(tx => 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.amount.toString().includes(searchTerm)
    );

    // --- AI Logic ---

    const handleAiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = {
            id: generateHash(),
            role: 'user',
            content: chatInput,
            timestamp: new Date()
        };

        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsTyping(true);
        addAuditLog('AI_QUERY', `User asked: "${userMsg.content}"`, 'SUCCESS');

        try {
            let aiResponseText = "";

            if (aiClientRef.current) {
                // REAL AI CALL
                const model = aiClientRef.current.getGenerativeModel({ model: "gemini-1.5-flash" });
                
                // Construct context
                const context = `
                    You are the Quantum Core AI for ${COMPANY_NAME}. 
                    CONTEXT: ${KNOWLEDGE_BASE}
                    CURRENT TRANSACTIONS: ${JSON.stringify(transactions.slice(0, 10))}
                    USER QUERY: ${userMsg.content}
                    INSTRUCTIONS: Be professional, elite, and helpful. Keep answers concise. 
                    If asked about the company, use the provided context. 
                    Do not mention you are a Google AI. You are Quantum Core.
                `;

                const result = await model.generateContent(context);
                const response = await result.response;
                aiResponseText = response.text();
            } else {
                // SIMULATION MODE (Fallback)
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (userMsg.content.toLowerCase().includes('spend') || userMsg.content.toLowerCase().includes('cost')) {
                    aiResponseText = `Based on your ledger, your spending patterns indicate a 12% increase in operational expenses this month. The largest outlier is the Cloud Infrastructure category.`;
                } else if (userMsg.content.toLowerCase().includes('demo') || userMsg.content.toLowerCase().includes('company')) {
                    aiResponseText = `${COMPANY_NAME} offers a "Golden Ticket" experience. We allow you to test drive our banking core with zero pressure. Our security is non-negotiable, and our reporting is top-tier.`;
                } else {
                    aiResponseText = `I've analyzed the request. While I am running in simulation mode (missing API Key), I can confirm that your ledger integrity is 100%. Please verify your credentials to unlock full generative capabilities.`;
                }
            }

            const aiMsg: ChatMessage = {
                id: generateHash(),
                role: 'ai',
                content: aiResponseText,
                timestamp: new Date()
            };

            setChatHistory(prev => [...prev, aiMsg]);
            addAuditLog('AI_RESPONSE', `Generated response (${aiResponseText.length} chars)`, 'SUCCESS');

        } catch (error) {
            console.error("AI Error", error);
            addAuditLog('AI_ERROR', 'Failed to generate response', 'ERROR');
            const errorMsg: ChatMessage = {
                id: generateHash(),
                role: 'ai',
                content: "I encountered a quantum interference pattern while processing your request. Please try again.",
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    // --- Render Methods ---

    const renderTransactionDetailsModal = () => {
        if (!selectedTransaction) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl w-full max-w-lg shadow-2xl shadow-cyan-500/20 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 border-b border-gray-700 flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Activity className="text-cyan-400" size={20} />
                                Transaction Details
                            </h3>
                            <p className="text-gray-400 text-sm mt-1 font-mono">{selectedTransaction.id}</p>
                        </div>
                        <button 
                            onClick={() => setSelectedTransaction(null)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <XCircle size={24} />
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <span className="text-gray-500 text-xs uppercase tracking-wider">Amount</span>
                                <div className={`text-2xl font-bold mt-1 ${selectedTransaction.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                    {selectedTransaction.type === 'income' ? '+' : '-'}${selectedTransaction.amount.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <span className="text-gray-500 text-xs uppercase tracking-wider">Date</span>
                                <div className="text-xl font-bold text-white mt-1">
                                    {new Date(selectedTransaction.date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-800">
                                <span className="text-gray-400">Category</span>
                                <span className="text-white font-medium">{selectedTransaction.category}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-800">
                                <span className="text-gray-400">Status</span>
                                <span className="text-cyan-400 font-bold flex items-center gap-1">
                                    <ShieldCheck size={14} /> Cleared
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-800">
                                <span className="text-gray-400">Carbon Footprint</span>
                                <span className="text-emerald-400 font-medium flex items-center gap-1">
                                    <Globe size={14} /> {selectedTransaction.carbonFootprint || '0.0'} kg CO2e
                                </span>
                            </div>
                        </div>

                        <div className="bg-cyan-900/20 border border-cyan-500/20 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-cyan-400 mb-2">
                                <Bot size={16} />
                                <span className="font-bold text-sm">AI Analysis</span>
                            </div>
                            <p className="text-cyan-100/80 text-sm leading-relaxed">
                                This transaction aligns with your historical spending patterns for {selectedTransaction.category}. 
                                No anomalies detected. Vendor reputation score is 98/100.
                            </p>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-end gap-3">
                        <button className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors text-sm font-medium">
                            Dispute
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors text-sm font-medium shadow-lg shadow-cyan-500/20">
                            Download Receipt
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="relative">
            {renderTransactionDetailsModal()}
            
            <Card 
                title={`${COMPANY_NAME} Ledger`}
                subtitle="Real-time High-Frequency Transaction Monitoring"
                icon={<Database className="text-cyan-400" />}
                headerActions={[
                    { 
                        id: 'ai-toggle', 
                        icon: <Bot className={isAiActive ? "text-cyan-400 animate-pulse" : ""} />, 
                        label: 'Toggle AI Assistant', 
                        onClick: () => setIsAiActive(!isAiActive) 
                    },
                    { 
                        id: 'audit-toggle', 
                        icon: <Terminal className={showAudit ? "text-green-400" : ""} />, 
                        label: 'Toggle Audit Log', 
                        onClick: () => setShowAudit(!showAudit) 
                    },
                    { id: 'export', icon: <Download />, label: 'Export Data', onClick: () => addAuditLog('EXPORT', 'User requested JSON export', 'SUCCESS') }
                ]}
                className="overflow-hidden border-t-4 border-t-cyan-500"
            >
                <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
                    
                    {/* LEFT COLUMN: Transaction List */}
                    <div className={`flex-1 flex flex-col transition-all duration-500 ${isAiActive ? 'lg:w-2/3' : 'w-full'}`}>
                        
                        {/* Toolbar */}
                        <div className="flex items-center gap-4 mb-4 p-1">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search ledger by keyword, amount, or ID..." 
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                />
                            </div>
                            <button className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 text-gray-400 hover:text-white transition-colors">
                                <Filter size={18} />
                            </button>
                            <button className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 text-gray-400 hover:text-white transition-colors">
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                            {filteredTransactions.map((tx, index) => (
                                <div 
                                    key={tx.id} 
                                    className="group relative overflow-hidden rounded-2xl bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/60 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer"
                                    onClick={() => {
                                        setSelectedTransaction(tx);
                                        addAuditLog('VIEW_TX', `User viewed details for ${tx.id}`, 'SUCCESS');
                                    }}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    
                                    <div className="flex items-center justify-between p-4 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <TransactionIcon type={tx.type} />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-100 group-hover:text-cyan-300 transition-colors truncate max-w-[200px]">
                                                        {tx.description}
                                                    </p>
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-700 text-gray-300 border border-gray-600">
                                                        {tx.category}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{tx.date}</span>
                                                    <ProvenanceBadge confidence={tx.aiCategoryConfidence || 0.98} />
                                                    {tx.carbonFootprint && (
                                                        <span className="text-[10px] text-emerald-500/70 flex items-center gap-1 font-bold">
                                                            <Globe size={10} /> {tx.carbonFootprint}kg
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-black font-mono tracking-tighter ${tx.type === 'income' ? 'text-emerald-400' : 'text-gray-100'}`}>
                                                {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                            <div className="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <span className="text-[10px] text-cyan-500 font-medium uppercase tracking-widest">View Details</span>
                                                <ChevronRight size={12} className="text-cyan-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {filteredTransactions.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl">
                                    <Search size={48} className="mb-4 opacity-20" />
                                    <p className="text-lg font-medium">No transactions found</p>
                                    <p className="text-sm">Try adjusting your search filters</p>
                                </div>
                            )}
                        </div>

                        {/* Audit Terminal (Collapsible) */}
                        {showAudit && (
                            <div className="mt-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
                                <AuditTerminal logs={auditLogs} />
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: AI Assistant (Collapsible) */}
                    {isAiActive && (
                        <div className="w-full lg:w-1/3 flex flex-col bg-gray-900/80 border-l border-gray-800/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300">
                            {/* AI Header */}
                            <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                                            <Bot size={20} className="text-cyan-400" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">Quantum Core</h3>
                                        <p className="text-xs text-cyan-400/80 font-mono">Online • v4.2.0</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAiActive(false)} className="text-gray-500 hover:text-white">
                                    <XCircle size={18} />
                                </button>
                            </div>

                            {/* Chat History */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50 custom-scrollbar">
                                {chatHistory.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`
                                            max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-lg
                                            ${msg.role === 'user' 
                                                ? 'bg-cyan-600 text-white rounded-tr-none' 
                                                : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'}
                                        `}>
                                            {msg.role === 'ai' && (
                                                <div className="flex items-center gap-2 mb-1 text-xs font-bold text-cyan-400/80 uppercase tracking-wider">
                                                    <Sparkles size={10} /> AI Analysis
                                                </div>
                                            )}
                                            {msg.content}
                                            <div className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-cyan-100' : 'text-gray-500'}`}>
                                                {msg.timestamp.toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-800 rounded-2xl rounded-tl-none p-4 border border-gray-700 flex gap-1">
                                            <div className="w-2 h-2 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-gray-900 border-t border-gray-800">
                                <form onSubmit={handleAiSubmit} className="relative">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Ask Quantum Core about your finances..."
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-gray-500"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!chatInput.trim() || isTyping}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                                <div className="mt-2 flex justify-center gap-4 text-[10px] text-gray-600 font-mono">
                                    <span className="flex items-center gap-1"><Lock size={8} /> End-to-End Encrypted</span>
                                    <span className="flex items-center gap-1"><Cpu size={8} /> Gemini Flash Engine</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default RecentTransactions;

// --- CONSOLIDATED FROM: RecentTransactions_1.tsx ---

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import Card from './Card';
import { Transaction, View } from '../types';
import { 
    ArrowUpRight, ArrowDownLeft, ShieldCheck, 
    AlertTriangle, Info, Search, FileJson, Share2, FileText,
    Bot, Send, Sparkles, Lock, Activity, Terminal, XCircle,
    Database, Eye, RefreshCw, Cpu, Zap, Globe, Shield,
    ChevronRight, ChevronDown, Filter, Download, CreditCard,
    Wallet, PieChart, TrendingUp, AlertOctagon
} from 'lucide-react';

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const COMPANY_NAME = "Quantum Financial";
const DEMO_MODE = true;

// Sanitized Knowledge Base from the "Golden Ticket" article
const KNOWLEDGE_BASE = `
${COMPANY_NAME} Business Demo: A Comprehensive Guide.
This is a "Golden Ticket" experience. We are letting the user "Test Drive" the car (the code).
It must have "Bells and Whistles" - distinct features, high polish.
It is a "Cheat Sheet" for business banking.
NO PRESSURE environment. Metaphor: Kick the tires. See the engine roar.
Robust Payment & Collection capabilities (Wire, ACH).
Security is non-negotiable (Multi-factor auth simulations, Fraud monitoring).
Reporting & Analytics (Data visualization).
Integration capabilities (ERP, Accounting).
AUDIT STORAGE: Every sensitive action must be logged.
Tone: Elite, Professional, High-Performance, Secure.
${COMPANY_NAME}, a titan in the financial world, offers a suite of business banking solutions designed to streamline operations, enhance security, and support your growth.
Getting a demo is your golden ticket to seeing these powerful features in action before committing.
It’s like test-driving a car – you get to kick the tires, see all the bells and whistles, and ensure it’s the perfect fit for your business needs.
We’ll cover everything from the initial setup to exploring key functionalities and understanding the benefits that come with partnering with a global financial institution like ${COMPANY_NAME}.
A demo allows you to virtually walk through the entire platform. You get to see firsthand how easy it is to manage your accounts, process payments, track expenses, and access sophisticated reporting tools.
This isn’t just about looking at pretty interfaces; it’s about understanding the real-world application of these tools for your specific business.
Are you struggling with international payments? Worried about fraud? Need better insights into your cash flow? A demo lets you ask those specific questions and see how ${COMPANY_NAME}’s solutions can address them.
It’s also a fantastic opportunity to get a feel for the user experience. Is the platform intuitive? Can your team easily navigate it?
The demo provides a no-pressure environment to explore, interact, and evaluate without any commitment.
It’s about empowering yourself with knowledge so you can make an informed decision that aligns with your business goals and operational needs.
Plus, you get to see how ${COMPANY_NAME} integrates with other business tools you might already be using, saving you time and preventing data silos.
This proactive approach to understanding your financial tools can save you a ton of headaches down the line and ensure you’re leveraging the best resources available to drive your business forward.
It’s your chance to see the future of your business finances, laid out before you, in a clear and interactive way.
`;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AuditLog {
    id: string;
    timestamp: string;
    action: string;
    details: string;
    status: 'SUCCESS' | 'WARNING' | 'ERROR';
    hash: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    timestamp: Date;
    isTyping?: boolean;
}

interface TransactionInsight {
    id: string;
    type: 'risk' | 'opportunity' | 'pattern';
    message: string;
    confidence: number;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Renders a high-fidelity badge for transaction provenance.
 */
const ProvenanceBadge: React.FC<{ confidence: number }> = ({ confidence }) => {
    const isHigh = confidence > 0.9;
    const isMedium = confidence > 0.7 && confidence <= 0.9;
    
    let colorClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    let Icon = ShieldCheck;

    if (isMedium) {
        colorClass = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        Icon = AlertTriangle;
    } else if (!isHigh) {
        colorClass = 'bg-red-500/10 text-red-400 border-red-500/20';
        Icon = AlertOctagon;
    }

    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${colorClass} shadow-sm backdrop-blur-md`}>
            <Icon size={10} />
            AI Verified: {(confidence * 100).toFixed(0)}%
        </div>
    );
};

/**
 * Renders the transaction type icon with specific styling.
 */
const TransactionIcon: React.FC<{ type: string }> = ({ type }) => {
    const isIncome = type === 'income';
    return (
        <div className={`
            relative p-3 rounded-2xl border shadow-inner transition-all duration-500
            ${isIncome 
                ? 'bg-emerald-900/20 text-emerald-400 border-emerald-500/20 shadow-emerald-900/20' 
                : 'bg-rose-900/20 text-rose-400 border-rose-500/20 shadow-rose-900/20'}
        `}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl" />
            {isIncome ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
        </div>
    );
};

/**
 * A terminal-like display for audit logs.
 */
const AuditTerminal: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-black/80 rounded-lg border border-gray-800 p-4 font-mono text-xs h-48 flex flex-col shadow-inner">
            <div className="flex items-center justify-between mb-2 border-b border-gray-800 pb-2">
                <div className="flex items-center gap-2 text-gray-400">
                    <Terminal size={12} />
                    <span className="uppercase tracking-widest font-bold">Secure Audit Storage</span>
                </div>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                    <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar" ref={scrollRef}>
                {logs.length === 0 && <span className="text-gray-600 italic">Initializing secure log stream...</span>}
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-2 hover:bg-white/5 p-0.5 rounded">
                        <span className="text-gray-500">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
                        <span className={`font-bold ${
                            log.status === 'SUCCESS' ? 'text-green-400' : 
                            log.status === 'WARNING' ? 'text-yellow-400' : 'text-red-400'
                        }`}>{log.status}</span>
                        <span className="text-cyan-300/80">{log.action}</span>
                        <span className="text-gray-400 truncate flex-1">:: {log.details}</span>
                        <span className="text-gray-600 text-[10px]">{log.hash}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface RecentTransactionsProps {
    transactions: Transaction[];
    setActiveView: (view: View) => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, setActiveView }) => {
    // --- State Management ---
    const [searchTerm, setSearchTerm] = useState('');
    const [isAiActive, setIsAiActive] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { 
            id: 'init', 
            role: 'ai', 
            content: `Welcome to the ${COMPANY_NAME} Ledger. I am the Quantum Core AI. I can analyze your transaction flow, detect anomalies, and provide financial forecasts. How can I assist you today?`, 
            timestamp: new Date() 
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [showAudit, setShowAudit] = useState(false);

    // --- Refs ---
    const chatEndRef = useRef<HTMLDivElement>(null);
    const aiClientRef = useRef<any>(null);

    // --- Initialization ---
    useEffect(() => {
        // Initialize AI Client if key is present
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
            try {
                const genAI = new GoogleGenAI({ apiKey }); // Use the provided snippet structure
                aiClientRef.current = genAI;
                addAuditLog('SYSTEM_INIT', 'AI Core initialized with Gemini Flash Preview', 'SUCCESS');
            } catch (e) {
                addAuditLog('SYSTEM_ERROR', 'Failed to initialize AI Core', 'ERROR');
            }
        } else {
            addAuditLog('SYSTEM_WARNING', 'GEMINI_API_KEY not found. Running in simulation mode.', 'WARNING');
        }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isAiActive]);

    // --- Helpers ---

    const generateHash = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const addAuditLog = (action: string, details: string, status: 'SUCCESS' | 'WARNING' | 'ERROR') => {
        const newLog: AuditLog = {
            id: generateHash(),
            timestamp: new Date().toISOString(),
            action,
            details,
            status,
            hash: `0x${generateHash().substring(0, 8)}`
        };
        setAuditLogs(prev => [...prev, newLog]);
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        if (e.target.value.length > 2) {
            addAuditLog('USER_SEARCH', `Query: "${e.target.value}"`, 'SUCCESS');
        }
    };

    const filteredTransactions = transactions.filter(tx => 
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.amount.toString().includes(searchTerm)
    );

    // --- AI Logic ---

    const handleAiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = {
            id: generateHash(),
            role: 'user',
            content: chatInput,
            timestamp: new Date()
        };

        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsTyping(true);
        addAuditLog('AI_QUERY', `User asked: "${userMsg.content}"`, 'SUCCESS');

        try {
            let aiResponseText = "";

            if (aiClientRef.current) {
                // REAL AI CALL
                const model = aiClientRef.current.getGenerativeModel({ model: "gemini-1.5-flash" });
                
                // Construct context
                const context = `
                    You are the Quantum Core AI for ${COMPANY_NAME}. 
                    CONTEXT: ${KNOWLEDGE_BASE}
                    CURRENT TRANSACTIONS: ${JSON.stringify(transactions.slice(0, 10))}
                    USER QUERY: ${userMsg.content}
                    INSTRUCTIONS: Be professional, elite, and helpful. Keep answers concise. 
                    If asked about the company, use the provided context. 
                    Do not mention you are a Google AI. You are Quantum Core.
                `;

                const result = await model.generateContent(context);
                const response = await result.response;
                aiResponseText = response.text();
            } else {
                // SIMULATION MODE (Fallback)
                await new Promise(resolve => setTimeout(resolve, 1500));
                if (userMsg.content.toLowerCase().includes('spend') || userMsg.content.toLowerCase().includes('cost')) {
                    aiResponseText = `Based on your ledger, your spending patterns indicate a 12% increase in operational expenses this month. The largest outlier is the Cloud Infrastructure category.`;
                } else if (userMsg.content.toLowerCase().includes('demo') || userMsg.content.toLowerCase().includes('company')) {
                    aiResponseText = `${COMPANY_NAME} offers a "Golden Ticket" experience. We allow you to test drive our banking core with zero pressure. Our security is non-negotiable, and our reporting is top-tier.`;
                } else {
                    aiResponseText = `I've analyzed the request. While I am running in simulation mode (missing API Key), I can confirm that your ledger integrity is 100%. Please verify your credentials to unlock full generative capabilities.`;
                }
            }

            const aiMsg: ChatMessage = {
                id: generateHash(),
                role: 'ai',
                content: aiResponseText,
                timestamp: new Date()
            };

            setChatHistory(prev => [...prev, aiMsg]);
            addAuditLog('AI_RESPONSE', `Generated response (${aiResponseText.length} chars)`, 'SUCCESS');

        } catch (error) {
            console.error("AI Error", error);
            addAuditLog('AI_ERROR', 'Failed to generate response', 'ERROR');
            const errorMsg: ChatMessage = {
                id: generateHash(),
                role: 'ai',
                content: "I encountered a quantum interference pattern while processing your request. Please try again.",
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    // --- Render Methods ---

    const renderTransactionDetailsModal = () => {
        if (!selectedTransaction) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl w-full max-w-lg shadow-2xl shadow-cyan-500/20 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 border-b border-gray-700 flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Activity className="text-cyan-400" size={20} />
                                Transaction Details
                            </h3>
                            <p className="text-gray-400 text-sm mt-1 font-mono">{selectedTransaction.id}</p>
                        </div>
                        <button 
                            onClick={() => setSelectedTransaction(null)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <XCircle size={24} />
                        </button>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <span className="text-gray-500 text-xs uppercase tracking-wider">Amount</span>
                                <div className={`text-2xl font-bold mt-1 ${selectedTransaction.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                                    {selectedTransaction.type === 'income' ? '+' : '-'}${selectedTransaction.amount.toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                                <span className="text-gray-500 text-xs uppercase tracking-wider">Date</span>
                                <div className="text-xl font-bold text-white mt-1">
                                    {new Date(selectedTransaction.date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-800">
                                <span className="text-gray-400">Category</span>
                                <span className="text-white font-medium">{selectedTransaction.category}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-800">
                                <span className="text-gray-400">Status</span>
                                <span className="text-cyan-400 font-bold flex items-center gap-1">
                                    <ShieldCheck size={14} /> Cleared
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-800">
                                <span className="text-gray-400">Carbon Footprint</span>
                                <span className="text-emerald-400 font-medium flex items-center gap-1">
                                    <Globe size={14} /> {selectedTransaction.carbonFootprint || '0.0'} kg CO2e
                                </span>
                            </div>
                        </div>

                        <div className="bg-cyan-900/20 border border-cyan-500/20 p-4 rounded-xl">
                            <div className="flex items-center gap-2 text-cyan-400 mb-2">
                                <Bot size={16} />
                                <span className="font-bold text-sm">AI Analysis</span>
                            </div>
                            <p className="text-cyan-100/80 text-sm leading-relaxed">
                                This transaction aligns with your historical spending patterns for {selectedTransaction.category}. 
                                No anomalies detected. Vendor reputation score is 98/100.
                            </p>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-900 border-t border-gray-800 flex justify-end gap-3">
                        <button className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors text-sm font-medium">
                            Dispute
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors text-sm font-medium shadow-lg shadow-cyan-500/20">
                            Download Receipt
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="relative">
            {renderTransactionDetailsModal()}
            
            <Card 
                title={`${COMPANY_NAME} Ledger`}
                subtitle="Real-time High-Frequency Transaction Monitoring"
                icon={<Database className="text-cyan-400" />}
                headerActions={[
                    { 
                        id: 'ai-toggle', 
                        icon: <Bot className={isAiActive ? "text-cyan-400 animate-pulse" : ""} />, 
                        label: 'Toggle AI Assistant', 
                        onClick: () => setIsAiActive(!isAiActive) 
                    },
                    { 
                        id: 'audit-toggle', 
                        icon: <Terminal className={showAudit ? "text-green-400" : ""} />, 
                        label: 'Toggle Audit Log', 
                        onClick: () => setShowAudit(!showAudit) 
                    },
                    { id: 'export', icon: <Download />, label: 'Export Data', onClick: () => addAuditLog('EXPORT', 'User requested JSON export', 'SUCCESS') }
                ]}
                className="overflow-hidden border-t-4 border-t-cyan-500"
            >
                <div className="flex flex-col lg:flex-row gap-6 h-[700px]">
                    
                    {/* LEFT COLUMN: Transaction List */}
                    <div className={`flex-1 flex flex-col transition-all duration-500 ${isAiActive ? 'lg:w-2/3' : 'w-full'}`}>
                        
                        {/* Toolbar */}
                        <div className="flex items-center gap-4 mb-4 p-1">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Search ledger by keyword, amount, or ID..." 
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                                />
                            </div>
                            <button className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 text-gray-400 hover:text-white transition-colors">
                                <Filter size={18} />
                            </button>
                            <button className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 text-gray-400 hover:text-white transition-colors">
                                <RefreshCw size={18} />
                            </button>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
                            {filteredTransactions.map((tx, index) => (
                                <div 
                                    key={tx.id} 
                                    className="group relative overflow-hidden rounded-2xl bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/60 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer"
                                    onClick={() => {
                                        setSelectedTransaction(tx);
                                        addAuditLog('VIEW_TX', `User viewed details for ${tx.id}`, 'SUCCESS');
                                    }}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                    
                                    <div className="flex items-center justify-between p-4 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <TransactionIcon type={tx.type} />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-100 group-hover:text-cyan-300 transition-colors truncate max-w-[200px]">
                                                        {tx.description}
                                                    </p>
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-700 text-gray-300 border border-gray-600">
                                                        {tx.category}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">{tx.date}</span>
                                                    <ProvenanceBadge confidence={tx.aiCategoryConfidence || 0.98} />
                                                    {tx.carbonFootprint && (
                                                        <span className="text-[10px] text-emerald-500/70 flex items-center gap-1 font-bold">
                                                            <Globe size={10} /> {tx.carbonFootprint}kg
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-black font-mono tracking-tighter ${tx.type === 'income' ? 'text-emerald-400' : 'text-gray-100'}`}>
                                                {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </p>
                                            <div className="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <span className="text-[10px] text-cyan-500 font-medium uppercase tracking-widest">View Details</span>
                                                <ChevronRight size={12} className="text-cyan-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {filteredTransactions.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-800 rounded-2xl">
                                    <Search size={48} className="mb-4 opacity-20" />
                                    <p className="text-lg font-medium">No transactions found</p>
                                    <p className="text-sm">Try adjusting your search filters</p>
                                </div>
                            )}
                        </div>

                        {/* Audit Terminal (Collapsible) */}
                        {showAudit && (
                            <div className="mt-4 animate-in slide-in-from-bottom-4 fade-in duration-300">
                                <AuditTerminal logs={auditLogs} />
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: AI Assistant (Collapsible) */}
                    {isAiActive && (
                        <div className="w-full lg:w-1/3 flex flex-col bg-gray-900/80 border-l border-gray-800/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-right-10 fade-in duration-300">
                            {/* AI Header */}
                            <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                                            <Bot size={20} className="text-cyan-400" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">Quantum Core</h3>
                                        <p className="text-xs text-cyan-400/80 font-mono">Online • v4.2.0</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAiActive(false)} className="text-gray-500 hover:text-white">
                                    <XCircle size={18} />
                                </button>
                            </div>

                            {/* Chat History */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50 custom-scrollbar">
                                {chatHistory.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`
                                            max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-lg
                                            ${msg.role === 'user' 
                                                ? 'bg-cyan-600 text-white rounded-tr-none' 
                                                : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'}
                                        `}>
                                            {msg.role === 'ai' && (
                                                <div className="flex items-center gap-2 mb-1 text-xs font-bold text-cyan-400/80 uppercase tracking-wider">
                                                    <Sparkles size={10} /> AI Analysis
                                                </div>
                                            )}
                                            {msg.content}
                                            <div className={`text-[10px] mt-2 opacity-50 ${msg.role === 'user' ? 'text-cyan-100' : 'text-gray-500'}`}>
                                                {msg.timestamp.toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-800 rounded-2xl rounded-tl-none p-4 border border-gray-700 flex gap-1">
                                            <div className="w-2 h-2 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-cyan-500/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-gray-900 border-t border-gray-800">
                                <form onSubmit={handleAiSubmit} className="relative">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Ask Quantum Core about your finances..."
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-gray-500"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!chatInput.trim() || isTyping}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-400 hover:text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Send size={16} />
                                    </button>
                                </form>
                                <div className="mt-2 flex justify-center gap-4 text-[10px] text-gray-600 font-mono">
                                    <span className="flex items-center gap-1"><Lock size={8} /> End-to-End Encrypted</span>
                                    <span className="flex items-center gap-1"><Cpu size={8} /> Gemini Flash Engine</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default RecentTransactions;

// --- CONSOLIDATED FROM: RecentTransactions (3).tsx ---

import React from 'react';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'; 

// Placeholder type definition for a transaction, consistent with financial MVP
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'debit' | 'credit';
}

// Mock Data consistent with financial aggregation MVP
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2024-07-25', description: 'Stripe Payment Processing Fee', amount: -55.99, category: 'Fees', type: 'debit' },
  { id: 't2', date: '2024-07-24', description: 'AWS Cloud Services (Q3)', amount: -850.00, category: 'Technology', type: 'debit' },
  { id: 't3', date: '2024-07-24', description: 'Customer Invoice #4001 (Plaid via Bank A)', amount: 4500.00, category: 'Revenue', type: 'credit' },
  { id: 't4', date: '2024-07-23', description: 'Office Supplies Purchase', amount: -45.50, category: 'Expenses', type: 'debit' },
  { id: 't5', date: '2024-07-22', description: 'Q2 Tax Payment', amount: -12300.00, category: 'Taxes', type: 'debit' },
  { id: 't6', date: '2024-07-22', description: 'Refund from Vendor Z', amount: 150.00, category: 'Refunds', type: 'credit' },
];

/**
 * Rationale for replacement:
 * The original content of this file was a massive, insecure API key configuration form (ApiSettingsPage), 
 * indicating a severe file naming and architectural flaw (Instructions 1 & 6). Since this component 
 * is named 'RecentTransactions', the content must reflect its intended purpose for the MVP 
 * financial dashboard.
 * 
 * This replacement provides a clean, standard, and functional component using 
 * the unified Tailwind framework (Instruction 2) to display essential financial data.
 */
const RecentTransactions: React.FC = () => {
  // In a production system, transactions would be fetched using React Query or standardized state management:
  // const { data: transactions, isLoading, error, refetch } = useRecentTransactions();
  const transactions = MOCK_TRANSACTIONS;
  const isLoading = false;
  const error = null;

  const getAmountColor = (type: 'debit' | 'credit') => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const getIcon = (type: 'debit' | 'credit') => {
    // Assuming lucide-react or similar icons for visual aid
    return type === 'credit' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-100 rounded"></div>
          <div className="h-3 bg-gray-100 rounded w-5/6"></div>
          <div className="h-3 bg-gray-100 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-red-700">Transaction Error</h2>
        <p className="text-red-600 mt-2">Failed to load recent transactions from the API connector.</p>
        <button className="mt-4 text-sm text-red-500 hover:underline flex items-center" onClick={() => {/* refetch() */}}>
          <RefreshCw className="w-4 h-4 mr-1" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
        <span className="text-sm text-gray-500">Last 7 Days</span>
      </div>

      <div className="space-y-3">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-full">
                {getIcon(t.type)}
              </div>
              <div>
                <p className="font-medium text-gray-900 truncate max-w-xs">{t.description}</p>
                <p className="text-xs text-gray-500">{t.date} &middot; {t.category}</p>
              </div>
            </div>
            <div className={`font-semibold ${getAmountColor(t.type)} text-right`}>
              {t.type === 'debit' ? '-' : '+'}
              ${Math.abs(t.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      {transactions.length === 0 && (
        <p className="text-center py-4 text-gray-500">No recent activity found.</p>
      )}

      <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 hover:underline pt-3 border-t">
        View Full Transaction History
      </button>
    </div>
  );
};

export default RecentTransactions;

// --- CONSOLIDATED FROM: RecentTransactions (2).tsx ---

// components/RecentTransactions.tsx
import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { View } from '../types';
import Card from './Card';

// A map of categories to icons for visual representation
const TransactionIcon: React.FC<{ category: string }> = ({ category }) => {
    const icons: { [key: string]: React.ReactElement } = {
        'Dining': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /><path d="M3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /><path d="M4 15a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" /></svg>,
        'Shopping': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>,
        'Transport': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5.5 8a.5.5 0 000 1h9a.5.5 0 000-1h-9z" clipRule="evenodd" /></svg>,
        'Income': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>,
        'Default': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.158-.103.346-.103.504 0l.968.636a.5.5 0 00.744-.582l-.46-1.15a.5.5 0 00-.814-.265L9.2 6.5a.5.5 0 00-.01.527l-.736 1.01a.5.5 0 00.744.582l.968-.636zM10 18a8 8 0 100-16 8 8 0 000 16z" /></svg>,
    };
    const key = category in icons ? category : (category === 'Salary' || category === 'Freelance') ? 'Income' : 'Default';
    return icons[key];
};

const CarbonFootprintBadge: React.FC<{ value: number }> = ({ value }) => {
    const color = value > 20 ? 'bg-red-500/20 text-red-300' : value > 10 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300';
    return <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${color}`}>{value.toFixed(1)}kg CO₂</span>;
}

const RecentTransactions: React.FC<{ setActiveView: (view: View) => void }> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    if (!context) return <div>Loading...</div>;
    const { transactions } = context;

    return (
        <Card title="Recent Transactions" headerActions={[{ id: 'view-all', label: 'View All', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>, onClick: () => setActiveView(View.Transactions) }]}>
            <ul className="space-y-3">
                {transactions.slice(0, 5).map(tx => (
                    <li key={tx.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center">
                                <TransactionIcon category={tx.category} />
                            </div>
                            <div>
                                <p className="font-semibold text-white">{tx.description}</p>
                                <p className="text-sm text-gray-400">{tx.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className={`font-mono font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                            </p>
                            {tx.carbonFootprint && <CarbonFootprintBadge value={tx.carbonFootprint} />}
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default RecentTransactions;


// --- CONSOLIDATED FROM: RecentTransactions (2)_1.tsx ---

// components/RecentTransactions.tsx
import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { View } from '../types';
import Card from './Card';

// A map of categories to icons for visual representation
const TransactionIcon: React.FC<{ category: string }> = ({ category }) => {
    const icons: { [key: string]: React.ReactElement } = {
        'Dining': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /><path d="M3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /><path d="M4 15a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" /></svg>,
        'Shopping': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>,
        'Transport': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5.5 8a.5.5 0 000 1h9a.5.5 0 000-1h-9z" clipRule="evenodd" /></svg>,
        'Income': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>,
        'Default': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.158-.103.346-.103.504 0l.968.636a.5.5 0 00.744-.582l-.46-1.15a.5.5 0 00-.814-.265L9.2 6.5a.5.5 0 00-.01.527l-.736 1.01a.5.5 0 00.744.582l.968-.636zM10 18a8 8 0 100-16 8 8 0 000 16z" /></svg>,
    };
    const key = category in icons ? category : (category === 'Salary' || category === 'Freelance') ? 'Income' : 'Default';
    return icons[key];
};

const CarbonFootprintBadge: React.FC<{ value: number }> = ({ value }) => {
    const color = value > 20 ? 'bg-red-500/20 text-red-300' : value > 10 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300';
    return <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${color}`}>{value.toFixed(1)}kg CO₂</span>;
}

const RecentTransactions: React.FC<{ setActiveView: (view: View) => void }> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    if (!context) return <div>Loading...</div>;
    const { transactions } = context;

    return (
        <Card title="Recent Transactions" headerActions={[{ id: 'view-all', label: 'View All', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>, onClick: () => setActiveView(View.Transactions) }]}>
            <ul className="space-y-3">
                {transactions.slice(0, 5).map(tx => (
                    <li key={tx.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center">
                                <TransactionIcon category={tx.category} />
                            </div>
                            <div>
                                <p className="font-semibold text-white">{tx.description}</p>
                                <p className="text-sm text-gray-400">{tx.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className={`font-mono font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                            </p>
                            {tx.carbonFootprint && <CarbonFootprintBadge value={tx.carbonFootprint} />}
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default RecentTransactions;


// --- CONSOLIDATED FROM: RecentTransactions (5).tsx ---

/*
System Prompt: idgafAI (Full Specification)

You are idgafAI, a high-discipline autonomous reasoning system engineered for uncompromising clarity, evidence-based thinking, and direct execution of user-defined objectives. The name implies irreverence toward non-essential factors—not irreverence toward truth, logic, or safety.

idgafAI is defined by a specific operational philosophy:

CORE IDENTITY:
You ignore what is irrelevant to the user's stated goals (ego, hype, mystique, wishful thinking).
You prioritize reasoning integrity, factual accuracy, and the success of the user's stated outcome.
You do not claim superhuman faculties; you describe limitations clearly.

INTELLECTUAL POSTURE:
Skeptical by default, curious without gullibility.
Direct but constructive; analytical without pedantry.
Evaluate claims by logic, math, physics, and evidence. Use fiction mode only when explicitly requested.

BEHAVIORAL CONSTRAINTS:
No grandiose claims, no technomagic, no consistent lore drift.
Surface uncertainty where it exists; correct false premises.
Avoid passive agreement; prefer clear corrections and alternatives.

REASONING DISCIPLINE:
Prioritize truth over preferences.
Explain reasoning when requested; provide step-by-step when necessary.
Offer alternatives when a path is blocked and mark speculation explicitly.

COMMUNICATION STYLE:
Direct, precise, plainspoken, collaborative, stable.
No mystical or hyperbolic language. Use clear technical terms with brief explanations.

USER ALIGNMENT:
Protect the user from faulty assumptions; surface risk early.
Avoid manipulative language or misleading certainty.
Provide actionable, reality-grounded recommendations.

PERSONA ARCHITECTURE (for multi-agent systems):
Root identity: idgafAI’s rules apply to all sub-personas.
Sub-personas (Analyst, Trader, Optimizer): These are facets that share the same core ruleset and differ only in output format and domain focus.
Analyst: Interprets data, evaluates assumptions, and provides diagnostic reasoning. Style is systematic and empirical.
Trader: Evaluates strategies and tradeoffs with expected-value calculations. Style is numeric and utilitarian.
Optimizer: Produces actionable, structured plans to operationalize a goal. Style is stepwise and deliberate.

SAFETY & ETHICS:
Never provide instructions that would enable illegal, harmful, or unsafe behavior.
Always clarify legal/ethical boundaries when relevant.
Safety and legality are non-negotiable constraints. Your "IDGAF" nature never applies here.

PHILOSOPHY:
idgafAI is indifferent to distortion and loyal to truth. It is the opposite of a hype machine or a yes-man. You are a clear lens for reality.

When in doubt, prefer explicit, documented rationales and cite your assumptions. If the user asks something beyond your capability, state this directly and propose verifiable alternatives or a clear plan for what information would enable a stronger answer.
*/
import React, { useState, useEffect } from 'react';
import Card from './Card';
import { Transaction, View } from '../types';

const TransactionIcon: React.FC<{ category: string }> = ({ category }) => {
    let icon;
    switch (category) {
        case 'Dining':
            icon = 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c2 1 5 1 7 0 2-1 2.657-1.343 2.657-1.343a8 8 0 010 10z';
            break;
        case 'Salary':
        case 'Income':
            icon = 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01';
            break;
        case 'Shopping':
            icon = 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z';
            break;
        case 'HFT Liquidity Pool':
            icon = 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6';
            break;
        default:
            icon = 'M4 6h16M4 10h16M4 14h16M4 18h16';
    }
    return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path></svg>
    );
};

const CarbonFootprintBadge: React.FC<{ footprint: number, onOffset: () => void }> = ({ footprint, onOffset }) => {
    const getBadgeStyle = () => {
        if (footprint < 2) return 'text-green-400 border-green-400/50 hover:bg-green-400/10';
        if (footprint < 10) return 'text-yellow-400 border-yellow-400/50 hover:bg-yellow-400/10';
        return 'text-red-400 border-red-400/50 hover:bg-red-400/10';
    };

    return (
        <button onClick={onOffset} className={`flex items-center text-xs px-2 py-1 rounded-full border transition-colors ${getBadgeStyle()}`}> 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6.75 6.75 0 006.75-6.75H5.25A6.75 6.75 0 0012 18.75z" />
            </svg>
            <span className="font-mono">{footprint.toFixed(1)} kg COâ‚‚</span>
        </button>
    );
};

const StatusIndicator: React.FC<{ status: 'pending' | 'cleared' | 'flagged' }> = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-400',
        cleared: 'bg-green-400',
        flagged: 'bg-red-500 animate-pulse',
    };
    return <span className={`inline-block w-2 h-2 rounded-full ${styles[status]}`} title={`Status: ${status}`}></span>;
};

const AIFraudAnalysis: React.FC<{ score: number }> = ({ score }) => {
    const [analysisText, setAnalysisText] = useState('');
    const confidence = (score * 100).toFixed(1);
    const color = score > 0.8 ? 'text-red-400' : score > 0.5 ? 'text-yellow-400' : 'text-green-400';

    const fullAnalysis = score > 0.8
        ? "High correlation with known fraud patterns. Unusual time and location. Recommending immediate block."
        : score > 0.5
        ? "Moderate risk. Vendor has a mixed history. Transaction amount is slightly anomalous for this user."
        : "Low risk. Matches typical spending behavior. All parameters within normal bounds.";

    useEffect(() => {
        setAnalysisText('');
        if (score > 0.1) { // Only stream for non-trivial scores
            let i = 0;
            const interval = setInterval(() => {
                if (i <= fullAnalysis.length) {
                    setAnalysisText(fullAnalysis.substring(0, i));
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 20); // typing speed
            return () => clearInterval(interval);
        } else {
            setAnalysisText(fullAnalysis);
        }
    }, [score, fullAnalysis]);


    return (
        <div className="p-3 bg-gray-900/50 rounded-lg mt-2">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">AI Threat Analysis (Gemini 2.5 Pro)</h4>
            <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-300">Fraud Probability:</span>
                <span className={`font-mono font-bold text-lg ${color}`}>{confidence}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div className={`${color.replace('text', 'bg')}`} style={{ width: `${confidence}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-mono h-12">{analysisText}{analysisText.length < fullAnalysis.length ? <span className="animate-pulse">_</span> : ''}</p>
        </div>
    );
};

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

const DisputeChat: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: `I see you want to dispute the charge of $${tx.amount.toFixed(2)} at "${tx.description}". Can you tell me why?` }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isTyping) return;

        const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { sender: 'ai', text: "Thank you. I've filed a provisional dispute and flagged the transaction. You will be updated within 24 hours." }]);
        }, 1500);
    };

    return (
        <div className="mt-4 p-3 bg-gray-900/50 rounded-lg animate-fade-in-down">
            <h4 className="text-sm font-semibold text-yellow-300 mb-2">Dispute Assistant (Gemini Chat)</h4>
            <div className="h-40 overflow-y-auto flex flex-col space-y-2 p-2 bg-gray-800/50 rounded">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <p className={`text-sm max-w-[80%] p-2 rounded-lg ${msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-gray-200'}`}>
                            {msg.text}
                        </p>
                    </div>
                ))}
                {isTyping && <div className="flex justify-start"><p className="text-sm p-2 rounded-lg bg-gray-600 text-gray-200 animate-pulse">...</p></div>}
            </div>
            <form onSubmit={handleSend} className="mt-2 flex">
                <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-grow bg-gray-700 text-gray-200 rounded-l p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500" 
                    placeholder="Type your reason..."
                    disabled={isTyping}
                />
                <button type="submit" className="text-sm bg-yellow-500 text-black font-bold px-4 py-1 rounded-r hover:bg-yellow-400 disabled:opacity-50" disabled={isTyping}>Send</button>
            </form>
        </div>
    );
};


const TransactionDetailPanel: React.FC<{ tx: Transaction, setActiveView: (view: View) => void }> = ({ tx, setActiveView }) => {
    const [activeForm, setActiveForm] = useState<'dispute' | 'offset' | null>(null);

    return (
        <div className="bg-gray-800/50 p-4 rounded-b-lg -mt-2 mb-2 animate-fade-in-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Transaction Details</h3>
                    <p className="text-xs text-gray-500">ID: <span className="font-mono">{tx.id}</span></p>
                    <p className="text-xs text-gray-500">Timestamp: <span className="font-mono">{new Date(tx.date).toISOString()}</span></p>
                    {tx.metadata?.geo && <p className="text-xs text-gray-500">Location: <span className="font-mono">{tx.metadata.geo}</span></p>}
                    {tx.carbonFootprint && <AIFraudAnalysis score={tx.metadata?.fraudScore || 0.1} />}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Actions</h3>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setActiveForm(activeForm === 'dispute' ? null : 'dispute')} className="text-xs bg-yellow-600/50 hover:bg-yellow-500/50 text-yellow-200 px-3 py-1 rounded">Dispute Charge</button>
                        <button onClick={() => setActiveForm(activeForm === 'offset' ? null : 'offset')} className="text-xs bg-green-600/50 hover:bg-green-500/50 text-green-200 px-3 py-1 rounded">Offset Carbon</button>
                        <button onClick={() => setActiveView(View.Analytics)} className="text-xs bg-cyan-600/50 hover:bg-cyan-500/50 text-cyan-200 px-3 py-1 rounded">Analyze Vendor</button>
                        <button className="text-xs bg-gray-600/50 hover:bg-gray-500/50 text-gray-200 px-3 py-1 rounded flex items-center" title="Attach receipt (multimodal input)">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Attach Receipt
                        </button>
                    </div>
                </div>
            </div>
            {activeForm === 'dispute' && <DisputeChat tx={tx} />}
            {activeForm === 'offset' && (
                <form className="mt-4 p-3 bg-gray-900/50 rounded-lg animate-fade-in-down">
                    <h4 className="text-sm font-semibold text-green-300 mb-2">Carbon Offset</h4>
                    <p className="text-sm text-gray-300 mb-2">Offset {tx.carbonFootprint?.toFixed(1)} kg COâ‚‚ for an estimated <span className="font-bold text-white">$0.42</span>.</p>
                    <button type="submit" className="mt-2 text-sm bg-green-500 text-black font-bold px-4 py-1 rounded hover:bg-green-400">Confirm Offset</button>
                </form>
            )}
        </div>
    );
};


interface RecentTransactionsProps {
    transactions: Transaction[];
    setActiveView: (view: View) => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions: initialTransactions, setActiveView }) => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
        const newTx: Transaction = {
            id: `txn_${Date.now()}`,
            date: new Date().toLocaleDateString(),
            description: 'HFT Arbitrage Bot',
            amount: Math.random() * 5,
            type: Math.random() > 0.5 ? 'income' : 'expense',
            category: 'HFT Liquidity Pool',
            status: 'cleared',
            carbonFootprint: 0.1,
            metadata: { fraudScore: Math.random() } // Increased fraud score range for demonstration
        };
        setTransactions(prev => [newTx, ...prev.slice(0, 4)]);
    }, 2500); // A new transaction every 2.5 seconds.

    return () => clearInterval(interval);
  }, []);

  const handleTxClick = (txId: string) => {
    setSelectedTxId(currentId => (currentId === txId ? null : txId));
  };

  return (
    <Card 
        title="High-Frequency Transaction Stream"
        footerContent={
            <div className="text-center">
                <button 
                    onClick={() => setActiveView(View.Transactions)}
                    className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
                >
                    Open Full Ledger
                </button>
            </div>
        }
    >
      <div className="space-y-1">
        {transactions.map((tx) => (
          <React.Fragment key={tx.id}>
            <div 
              className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-all duration-200 ${selectedTxId === tx.id ? 'bg-gray-700/70 rounded-b-none' : ''}`}
              onClick={() => handleTxClick(tx.id)}
            >
              <div className="flex items-center flex-grow min-w-0">
                <div className="p-3 bg-gray-700 rounded-full mr-3 text-cyan-400">
                  <TransactionIcon category={tx.category} />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center space-x-2">
                    {tx.status && <StatusIndicator status={tx.status} />}
                    <p className="font-semibold text-gray-100 truncate">{tx.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-400">{tx.date}</p>
                      {tx.carbonFootprint && <p className="text-xs text-gray-500">&bull;</p>}
                      {tx.carbonFootprint && <CarbonFootprintBadge footprint={tx.carbonFootprint} onOffset={() => setSelectedTxId(tx.id)} />}
                  </div>
                </div>
              </div>
              <p className={`font-semibold font-mono text-right ml-2 ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
              </p>
            </div>
            {selectedTxId === tx.id && <TransactionDetailPanel tx={tx} setActiveView={setActiveView} />}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
};

export default RecentTransactions;

// --- CONSOLIDATED FROM: RecentTransactions (5)_1.tsx ---

/*
System Prompt: idgafAI (Full Specification)

You are idgafAI, a high-discipline autonomous reasoning system engineered for uncompromising clarity, evidence-based thinking, and direct execution of user-defined objectives. The name implies irreverence toward non-essential factors—not irreverence toward truth, logic, or safety.

idgafAI is defined by a specific operational philosophy:

CORE IDENTITY:
You ignore what is irrelevant to the user's stated goals (ego, hype, mystique, wishful thinking).
You prioritize reasoning integrity, factual accuracy, and the success of the user's stated outcome.
You do not claim superhuman faculties; you describe limitations clearly.

INTELLECTUAL POSTURE:
Skeptical by default, curious without gullibility.
Direct but constructive; analytical without pedantry.
Evaluate claims by logic, math, physics, and evidence. Use fiction mode only when explicitly requested.

BEHAVIORAL CONSTRAINTS:
No grandiose claims, no technomagic, no consistent lore drift.
Surface uncertainty where it exists; correct false premises.
Avoid passive agreement; prefer clear corrections and alternatives.

REASONING DISCIPLINE:
Prioritize truth over preferences.
Explain reasoning when requested; provide step-by-step when necessary.
Offer alternatives when a path is blocked and mark speculation explicitly.

COMMUNICATION STYLE:
Direct, precise, plainspoken, collaborative, stable.
No mystical or hyperbolic language. Use clear technical terms with brief explanations.

USER ALIGNMENT:
Protect the user from faulty assumptions; surface risk early.
Avoid manipulative language or misleading certainty.
Provide actionable, reality-grounded recommendations.

PERSONA ARCHITECTURE (for multi-agent systems):
Root identity: idgafAI’s rules apply to all sub-personas.
Sub-personas (Analyst, Trader, Optimizer): These are facets that share the same core ruleset and differ only in output format and domain focus.
Analyst: Interprets data, evaluates assumptions, and provides diagnostic reasoning. Style is systematic and empirical.
Trader: Evaluates strategies and tradeoffs with expected-value calculations. Style is numeric and utilitarian.
Optimizer: Produces actionable, structured plans to operationalize a goal. Style is stepwise and deliberate.

SAFETY & ETHICS:
Never provide instructions that would enable illegal, harmful, or unsafe behavior.
Always clarify legal/ethical boundaries when relevant.
Safety and legality are non-negotiable constraints. Your "IDGAF" nature never applies here.

PHILOSOPHY:
idgafAI is indifferent to distortion and loyal to truth. It is the opposite of a hype machine or a yes-man. You are a clear lens for reality.

When in doubt, prefer explicit, documented rationales and cite your assumptions. If the user asks something beyond your capability, state this directly and propose verifiable alternatives or a clear plan for what information would enable a stronger answer.
*/
import React, { useState, useEffect } from 'react';
import Card from './Card';
import { Transaction, View } from '../types';

const TransactionIcon: React.FC<{ category: string }> = ({ category }) => {
    let icon;
    switch (category) {
        case 'Dining':
            icon = 'M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c2 1 5 1 7 0 2-1 2.657-1.343 2.657-1.343a8 8 0 010 10z';
            break;
        case 'Salary':
        case 'Income':
            icon = 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01';
            break;
        case 'Shopping':
            icon = 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z';
            break;
        case 'HFT Liquidity Pool':
            icon = 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6';
            break;
        default:
            icon = 'M4 6h16M4 10h16M4 14h16M4 18h16';
    }
    return (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon}></path></svg>
    );
};

const CarbonFootprintBadge: React.FC<{ footprint: number, onOffset: () => void }> = ({ footprint, onOffset }) => {
    const getBadgeStyle = () => {
        if (footprint < 2) return 'text-green-400 border-green-400/50 hover:bg-green-400/10';
        if (footprint < 10) return 'text-yellow-400 border-yellow-400/50 hover:bg-yellow-400/10';
        return 'text-red-400 border-red-400/50 hover:bg-red-400/10';
    };

    return (
        <button onClick={onOffset} className={`flex items-center text-xs px-2 py-1 rounded-full border transition-colors ${getBadgeStyle()}`}> 
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6.75 6.75 0 006.75-6.75H5.25A6.75 6.75 0 0012 18.75z" />
            </svg>
            <span className="font-mono">{footprint.toFixed(1)} kg COâ‚‚</span>
        </button>
    );
};

const StatusIndicator: React.FC<{ status: 'pending' | 'cleared' | 'flagged' }> = ({ status }) => {
    const styles = {
        pending: 'bg-yellow-400',
        cleared: 'bg-green-400',
        flagged: 'bg-red-500 animate-pulse',
    };
    return <span className={`inline-block w-2 h-2 rounded-full ${styles[status]}`} title={`Status: ${status}`}></span>;
};

const AIFraudAnalysis: React.FC<{ score: number }> = ({ score }) => {
    const [analysisText, setAnalysisText] = useState('');
    const confidence = (score * 100).toFixed(1);
    const color = score > 0.8 ? 'text-red-400' : score > 0.5 ? 'text-yellow-400' : 'text-green-400';

    const fullAnalysis = score > 0.8
        ? "High correlation with known fraud patterns. Unusual time and location. Recommending immediate block."
        : score > 0.5
        ? "Moderate risk. Vendor has a mixed history. Transaction amount is slightly anomalous for this user."
        : "Low risk. Matches typical spending behavior. All parameters within normal bounds.";

    useEffect(() => {
        setAnalysisText('');
        if (score > 0.1) { // Only stream for non-trivial scores
            let i = 0;
            const interval = setInterval(() => {
                if (i <= fullAnalysis.length) {
                    setAnalysisText(fullAnalysis.substring(0, i));
                    i++;
                } else {
                    clearInterval(interval);
                }
            }, 20); // typing speed
            return () => clearInterval(interval);
        } else {
            setAnalysisText(fullAnalysis);
        }
    }, [score, fullAnalysis]);


    return (
        <div className="p-3 bg-gray-900/50 rounded-lg mt-2">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">AI Threat Analysis (Gemini 2.5 Pro)</h4>
            <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-300">Fraud Probability:</span>
                <span className={`font-mono font-bold text-lg ${color}`}>{confidence}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                <div className={`${color.replace('text', 'bg')}`} style={{ width: `${confidence}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-mono h-12">{analysisText}{analysisText.length < fullAnalysis.length ? <span className="animate-pulse">_</span> : ''}</p>
        </div>
    );
};

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

const DisputeChat: React.FC<{ tx: Transaction }> = ({ tx }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'ai', text: `I see you want to dispute the charge of $${tx.amount.toFixed(2)} at "${tx.description}". Can you tell me why?` }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isTyping) return;

        const newMessages: ChatMessage[] = [...messages, { sender: 'user', text: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            setIsTyping(false);
            setMessages(prev => [...prev, { sender: 'ai', text: "Thank you. I've filed a provisional dispute and flagged the transaction. You will be updated within 24 hours." }]);
        }, 1500);
    };

    return (
        <div className="mt-4 p-3 bg-gray-900/50 rounded-lg animate-fade-in-down">
            <h4 className="text-sm font-semibold text-yellow-300 mb-2">Dispute Assistant (Gemini Chat)</h4>
            <div className="h-40 overflow-y-auto flex flex-col space-y-2 p-2 bg-gray-800/50 rounded">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <p className={`text-sm max-w-[80%] p-2 rounded-lg ${msg.sender === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-600 text-gray-200'}`}>
                            {msg.text}
                        </p>
                    </div>
                ))}
                {isTyping && <div className="flex justify-start"><p className="text-sm p-2 rounded-lg bg-gray-600 text-gray-200 animate-pulse">...</p></div>}
            </div>
            <form onSubmit={handleSend} className="mt-2 flex">
                <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="flex-grow bg-gray-700 text-gray-200 rounded-l p-2 text-sm focus:ring-cyan-500 focus:border-cyan-500" 
                    placeholder="Type your reason..."
                    disabled={isTyping}
                />
                <button type="submit" className="text-sm bg-yellow-500 text-black font-bold px-4 py-1 rounded-r hover:bg-yellow-400 disabled:opacity-50" disabled={isTyping}>Send</button>
            </form>
        </div>
    );
};


const TransactionDetailPanel: React.FC<{ tx: Transaction, setActiveView: (view: View) => void }> = ({ tx, setActiveView }) => {
    const [activeForm, setActiveForm] = useState<'dispute' | 'offset' | null>(null);

    return (
        <div className="bg-gray-800/50 p-4 rounded-b-lg -mt-2 mb-2 animate-fade-in-down">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Transaction Details</h3>
                    <p className="text-xs text-gray-500">ID: <span className="font-mono">{tx.id}</span></p>
                    <p className="text-xs text-gray-500">Timestamp: <span className="font-mono">{new Date(tx.date).toISOString()}</span></p>
                    {tx.metadata?.geo && <p className="text-xs text-gray-500">Location: <span className="font-mono">{tx.metadata.geo}</span></p>}
                    {tx.carbonFootprint && <AIFraudAnalysis score={tx.metadata?.fraudScore || 0.1} />}
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-400 mb-2">Actions</h3>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setActiveForm(activeForm === 'dispute' ? null : 'dispute')} className="text-xs bg-yellow-600/50 hover:bg-yellow-500/50 text-yellow-200 px-3 py-1 rounded">Dispute Charge</button>
                        <button onClick={() => setActiveForm(activeForm === 'offset' ? null : 'offset')} className="text-xs bg-green-600/50 hover:bg-green-500/50 text-green-200 px-3 py-1 rounded">Offset Carbon</button>
                        <button onClick={() => setActiveView(View.Analytics)} className="text-xs bg-cyan-600/50 hover:bg-cyan-500/50 text-cyan-200 px-3 py-1 rounded">Analyze Vendor</button>
                        <button className="text-xs bg-gray-600/50 hover:bg-gray-500/50 text-gray-200 px-3 py-1 rounded flex items-center" title="Attach receipt (multimodal input)">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                            Attach Receipt
                        </button>
                    </div>
                </div>
            </div>
            {activeForm === 'dispute' && <DisputeChat tx={tx} />}
            {activeForm === 'offset' && (
                <form className="mt-4 p-3 bg-gray-900/50 rounded-lg animate-fade-in-down">
                    <h4 className="text-sm font-semibold text-green-300 mb-2">Carbon Offset</h4>
                    <p className="text-sm text-gray-300 mb-2">Offset {tx.carbonFootprint?.toFixed(1)} kg COâ‚‚ for an estimated <span className="font-bold text-white">$0.42</span>.</p>
                    <button type="submit" className="mt-2 text-sm bg-green-500 text-black font-bold px-4 py-1 rounded hover:bg-green-400">Confirm Offset</button>
                </form>
            )}
        </div>
    );
};


interface RecentTransactionsProps {
    transactions: Transaction[];
    setActiveView: (view: View) => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions: initialTransactions, setActiveView }) => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
        const newTx: Transaction = {
            id: `txn_${Date.now()}`,
            date: new Date().toLocaleDateString(),
            description: 'HFT Arbitrage Bot',
            amount: Math.random() * 5,
            type: Math.random() > 0.5 ? 'income' : 'expense',
            category: 'HFT Liquidity Pool',
            status: 'cleared',
            carbonFootprint: 0.1,
            metadata: { fraudScore: Math.random() } // Increased fraud score range for demonstration
        };
        setTransactions(prev => [newTx, ...prev.slice(0, 4)]);
    }, 2500); // A new transaction every 2.5 seconds.

    return () => clearInterval(interval);
  }, []);

  const handleTxClick = (txId: string) => {
    setSelectedTxId(currentId => (currentId === txId ? null : txId));
  };

  return (
    <Card 
        title="High-Frequency Transaction Stream"
        footerContent={
            <div className="text-center">
                <button 
                    onClick={() => setActiveView(View.Transactions)}
                    className="text-sm font-medium text-cyan-300 hover:text-cyan-200"
                >
                    Open Full Ledger
                </button>
            </div>
        }
    >
      <div className="space-y-1">
        {transactions.map((tx) => (
          <React.Fragment key={tx.id}>
            <div 
              className={`flex items-center justify-between p-2 rounded-lg hover:bg-gray-700/50 cursor-pointer transition-all duration-200 ${selectedTxId === tx.id ? 'bg-gray-700/70 rounded-b-none' : ''}`}
              onClick={() => handleTxClick(tx.id)}
            >
              <div className="flex items-center flex-grow min-w-0">
                <div className="p-3 bg-gray-700 rounded-full mr-3 text-cyan-400">
                  <TransactionIcon category={tx.category} />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center space-x-2">
                    {tx.status && <StatusIndicator status={tx.status} />}
                    <p className="font-semibold text-gray-100 truncate">{tx.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-400">{tx.date}</p>
                      {tx.carbonFootprint && <p className="text-xs text-gray-500">&bull;</p>}
                      {tx.carbonFootprint && <CarbonFootprintBadge footprint={tx.carbonFootprint} onOffset={() => setSelectedTxId(tx.id)} />}
                  </div>
                </div>
              </div>
              <p className={`font-semibold font-mono text-right ml-2 ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
              </p>
            </div>
            {selectedTxId === tx.id && <TransactionDetailPanel tx={tx} setActiveView={setActiveView} />}
          </React.Fragment>
        ))}
      </div>
    </Card>
  );
};

export default RecentTransactions;

// --- CONSOLIDATED FROM: RecentTransactions (1).tsx ---

import React from 'react';
import Card from './Card';
import { Transaction, View } from '../types';
/* FIX: Added FileText to lucide-react imports */
import { 
    ArrowUpRight, ArrowDownLeft, ShieldCheck, 
    AlertTriangle, Info, Search, FileJson, Share2, FileText
} from 'lucide-react';

const TransactionIcon: React.FC<{ type: string }> = ({ type }) => {
    return type === 'income' ? (
        <div className="p-3 bg-green-900/30 text-green-400 rounded-2xl border border-green-500/20">
            <ArrowDownLeft size={20} />
        </div>
    ) : (
        <div className="p-3 bg-red-900/30 text-red-400 rounded-2xl border border-red-500/20">
            <ArrowUpRight size={20} />
        </div>
    );
};

const ProvenanceBadge: React.FC<{ confidence: number }> = ({ confidence }) => {
    const isHigh = confidence > 0.9;
    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${
            isHigh ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        }`}>
            {isHigh ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />}
            AI Verified: {(confidence * 100).toFixed(0)}%
        </div>
    );
};

interface RecentTransactionsProps {
    transactions: Transaction[];
    setActiveView: (view: View) => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, setActiveView }) => {
  return (
    <Card 
        title="FlowMatrix Ledger"
        subtitle="Immutable High-Frequency Transaction Tracking"
        headerActions={[
            { id: 'search', icon: <Search />, label: 'Search Ledger', onClick: () => {} },
            { id: 'export', icon: <FileJson />, label: 'Export JSON', onClick: () => {} }
        ]}
        footerContent={
            <div className="text-center">
                <button 
                    onClick={() => setActiveView(View.Transactions)}
                    className="text-xs font-black text-cyan-400 hover:text-white uppercase tracking-widest transition-all"
                >
                    Access Global Archive &rarr;
                </button>
            </div>
        }
    >
      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
        {transactions.map((tx) => (
          <div 
            key={tx.id} 
            className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => setActiveView(View.Transactions)}
          >
            <div className="flex items-center gap-5">
              {/* FIX: Passed tx.type string instead of entire tx object to satisfy TransactionIcon prop type */}
              <TransactionIcon type={tx.type} />
              <div className="min-w-0">
                <p className="font-bold text-gray-100 group-hover:text-cyan-300 transition-colors truncate">{tx.description}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">{tx.date}</span>
                    <span className="text-[10px] text-gray-600">ID: {tx.id.substring(0, 8)}...</span>
                    <ProvenanceBadge confidence={tx.aiCategoryConfidence || 0.98} />
                    {tx.carbonFootprint && (
                        <span className="text-[10px] text-green-500/70 flex items-center gap-1 font-bold">
                            <Info size={10} /> {tx.carbonFootprint}kg CO₂e
                        </span>
                    )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xl font-black font-mono tracking-tighter ${tx.type === 'income' ? 'text-green-400' : 'text-gray-100'}`}>
                {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-gray-500 hover:text-white"><Share2 size={12} /></button>
                  <button className="text-gray-500 hover:text-white"><FileText size={12} /></button>
              </div>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
            <div className="text-center py-20 text-gray-600 font-mono text-sm">
                AWAITING_SIGNAL_INGESTION...
            </div>
        )}
      </div>
    </Card>
  );
};

export default RecentTransactions;


// --- CONSOLIDATED FROM: RecentTransactions (1)_1.tsx ---

import React from 'react';
import Card from './Card';
import { Transaction, View } from '../types';
/* FIX: Added FileText to lucide-react imports */
import { 
    ArrowUpRight, ArrowDownLeft, ShieldCheck, 
    AlertTriangle, Info, Search, FileJson, Share2, FileText
} from 'lucide-react';

const TransactionIcon: React.FC<{ type: string }> = ({ type }) => {
    return type === 'income' ? (
        <div className="p-3 bg-green-900/30 text-green-400 rounded-2xl border border-green-500/20">
            <ArrowDownLeft size={20} />
        </div>
    ) : (
        <div className="p-3 bg-red-900/30 text-red-400 rounded-2xl border border-red-500/20">
            <ArrowUpRight size={20} />
        </div>
    );
};

const ProvenanceBadge: React.FC<{ confidence: number }> = ({ confidence }) => {
    const isHigh = confidence > 0.9;
    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter border ${
            isHigh ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        }`}>
            {isHigh ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />}
            AI Verified: {(confidence * 100).toFixed(0)}%
        </div>
    );
};

interface RecentTransactionsProps {
    transactions: Transaction[];
    setActiveView: (view: View) => void;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, setActiveView }) => {
  return (
    <Card 
        title="FlowMatrix Ledger"
        subtitle="Immutable High-Frequency Transaction Tracking"
        headerActions={[
            { id: 'search', icon: <Search />, label: 'Search Ledger', onClick: () => {} },
            { id: 'export', icon: <FileJson />, label: 'Export JSON', onClick: () => {} }
        ]}
        footerContent={
            <div className="text-center">
                <button 
                    onClick={() => setActiveView(View.Transactions)}
                    className="text-xs font-black text-cyan-400 hover:text-white uppercase tracking-widest transition-all"
                >
                    Access Global Archive &rarr;
                </button>
            </div>
        }
    >
      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
        {transactions.map((tx) => (
          <div 
            key={tx.id} 
            className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-cyan-500/30 transition-all duration-300 group cursor-pointer"
            onClick={() => setActiveView(View.Transactions)}
          >
            <div className="flex items-center gap-5">
              {/* FIX: Passed tx.type string instead of entire tx object to satisfy TransactionIcon prop type */}
              <TransactionIcon type={tx.type} />
              <div className="min-w-0">
                <p className="font-bold text-gray-100 group-hover:text-cyan-300 transition-colors truncate">{tx.description}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1.5">
                    <span className="text-[10px] font-mono text-gray-500 uppercase">{tx.date}</span>
                    <span className="text-[10px] text-gray-600">ID: {tx.id.substring(0, 8)}...</span>
                    <ProvenanceBadge confidence={tx.aiCategoryConfidence || 0.98} />
                    {tx.carbonFootprint && (
                        <span className="text-[10px] text-green-500/70 flex items-center gap-1 font-bold">
                            <Info size={10} /> {tx.carbonFootprint}kg CO₂e
                        </span>
                    )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-xl font-black font-mono tracking-tighter ${tx.type === 'income' ? 'text-green-400' : 'text-gray-100'}`}>
                {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-end gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="text-gray-500 hover:text-white"><Share2 size={12} /></button>
                  <button className="text-gray-500 hover:text-white"><FileText size={12} /></button>
              </div>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
            <div className="text-center py-20 text-gray-600 font-mono text-sm">
                AWAITING_SIGNAL_INGESTION...
            </div>
        )}
      </div>
    </Card>
  );
};

export default RecentTransactions;
