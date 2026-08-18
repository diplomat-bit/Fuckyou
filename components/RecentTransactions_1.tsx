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