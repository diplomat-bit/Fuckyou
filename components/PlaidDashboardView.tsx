import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, LinkedAccount, Transaction } from '../types';
import { GoogleGenAI } from "@google/genai";
import {
    Brain, Zap, ShieldCheck, AlertTriangle, TrendingUp, Settings, Loader2, MessageSquareText,
    Activity, FileText, Bot, GitBranch, DollarSign, BarChart3, Cpu, Database, Network, 
    SlidersHorizontal, Play, Pause, Repeat, Sparkles, Lock, Globe, Server, Terminal,
    CreditCard, Wallet, PieChart, ArrowRightLeft, Search, X, CheckCircle, AlertOctagon,
    UserCheck, Building2, Landmark, History, Fingerprint, Eye, ChevronRight, ChevronDown,
    Download, Share2, Printer, RefreshCw
} from 'lucide-react';

// =================================================================================================
// QUANTUM FINANCIAL - "THE GOLDEN TICKET" DEMO EXPERIENCE
// =================================================================================================
// This file represents the pinnacle of the "Test Drive" philosophy. 
// It is a self-contained monolith of functionality, simulating a high-end, 
// secure, and AI-driven business banking environment.
// =================================================================================================

// --- CONSTANTS & CONFIGURATION ---
const DEMO_BANK_NAME = "Quantum Financial";
const AI_MODEL_NAME = "gemini-1.5-flash"; // Using a standard model name for stability
const REFRESH_RATE_MS = 2000;

// --- TYPES ---

type DashboardView = 'COMMAND_CENTER' | 'TREASURY_PRIME' | 'SECURITY_OPS' | 'MARKET_MAKER' | 'QUANTUM_INTELLIGENCE' | 'AUDIT_VAULT';

interface AuditLog {
    id: string;
    timestamp: number;
    action: string;
    user: string;
    status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'WARNING';
    details: string;
    hash: string;
}

interface TreasuryPayment {
    id: string;
    recipient: string;
    amount: number;
    type: 'WIRE' | 'ACH' | 'RTP' | 'BLOCKCHAIN';
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'PROCESSING' | 'COMPLETED';
    date: string;
}

interface ChatMessage {
    id: string;
    sender: 'USER' | 'AI' | 'SYSTEM';
    text: string;
    timestamp: number;
    isTyping?: boolean;
    actionWidget?: React.ReactNode;
}

// --- MOCK DATA GENERATORS ---

const generateHash = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const MOCK_AUDIT_LOGS_INIT: AuditLog[] = Array.from({ length: 15 }).map((_, i) => ({
    id: `AUD-${Date.now()}-${i}`,
    timestamp: Date.now() - (i * 3600000),
    action: ['USER_LOGIN', 'VIEW_REPORT', 'API_KEY_ROTATION', 'PAYMENT_INITIATED', 'RISK_RULE_UPDATE'][i % 5],
    user: 'J. OCallaghan',
    status: i % 10 === 0 ? 'WARNING' : 'SUCCESS',
    details: `Action performed via secure terminal. Session ID: ${generateHash().substring(0, 8)}`,
    hash: generateHash()
}));

const MOCK_PAYMENTS: TreasuryPayment[] = [
    { id: 'PAY-8821', recipient: 'Acme Corp International', amount: 125000.00, type: 'WIRE', status: 'COMPLETED', date: '2024-05-10' },
    { id: 'PAY-8822', recipient: 'Global Logistics Ltd', amount: 4520.50, type: 'ACH', status: 'PROCESSING', date: '2024-05-11' },
    { id: 'PAY-8823', recipient: 'TechStart Ventures', amount: 500000.00, type: 'BLOCKCHAIN', status: 'PENDING_APPROVAL', date: '2024-05-12' },
];

// --- UTILITY COMPONENTS ---

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let colorClass = 'bg-gray-700 text-gray-300';
    if (['SUCCESS', 'COMPLETED', 'OPERATIONAL', 'ACTIVE'].includes(status)) colorClass = 'bg-green-500/20 text-green-400 border border-green-500/30';
    if (['WARNING', 'PENDING_APPROVAL', 'DEGRADED'].includes(status)) colorClass = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    if (['FAILURE', 'ERROR', 'CRITICAL', 'OFFLINE'].includes(status)) colorClass = 'bg-red-500/20 text-red-400 border border-red-500/30';
    if (['PROCESSING', 'RUNNING'].includes(status)) colorClass = 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse';

    return (
        <span className={`px-2 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider ${colorClass}`}>
            {status.replace('_', ' ')}
        </span>
    );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-cyan-500/50 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
                <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-800/50">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <Zap className="w-5 h-5 text-cyan-400 mr-2" /> {title}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- FEATURE MODULES ---

// 1. TREASURY PRIME (Payments & Collections)
const TreasuryPrimeView: React.FC<{ logAudit: (action: string, details: string) => void }> = ({ logAudit }) => {
    const [payments, setPayments] = useState<TreasuryPayment[]>(MOCK_PAYMENTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPayment, setNewPayment] = useState<Partial<TreasuryPayment>>({ type: 'WIRE', amount: 0, recipient: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreatePayment = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            const payment: TreasuryPayment = {
                id: `PAY-${Math.floor(Math.random() * 10000)}`,
                recipient: newPayment.recipient || 'Unknown Recipient',
                amount: newPayment.amount || 0,
                type: newPayment.type as any,
                status: 'PENDING_APPROVAL',
                date: new Date().toISOString().split('T')[0]
            };
            setPayments([payment, ...payments]);
            logAudit('PAYMENT_INITIATED', `Initiated ${payment.type} of $${payment.amount} to ${payment.recipient}`);
            setIsSubmitting(false);
            setIsModalOpen(false);
            setNewPayment({ type: 'WIRE', amount: 0, recipient: '' });
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Treasury Prime</h2>
                    <p className="text-gray-400">Global Liquidity & Payment Orchestration</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105"
                >
                    <DollarSign className="w-5 h-5 mr-2" /> Initiate Payment
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Liquidity Position" className="border-t-4 border-cyan-500">
                    <div className="text-4xl font-mono font-bold text-white">$24,500,000.00</div>
                    <div className="text-sm text-green-400 mt-2 flex items-center"><TrendingUp className="w-4 h-4 mr-1" /> +2.4% vs Last Close</div>
                </Card>
                <Card title="Pending Approvals" className="border-t-4 border-yellow-500">
                    <div className="text-4xl font-mono font-bold text-white">3</div>
                    <div className="text-sm text-yellow-400 mt-2 flex items-center"><AlertOctagon className="w-4 h-4 mr-1" /> Action Required</div>
                </Card>
                <Card title="Outbound Volume (MTD)" className="border-t-4 border-purple-500">
                    <div className="text-4xl font-mono font-bold text-white">$1.2M</div>
                    <div className="text-sm text-gray-400 mt-2">142 Transactions</div>
                </Card>
            </div>

            <Card title="Active Payment Rails" className="bg-gray-800/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-700 text-sm uppercase tracking-wider">
                                <th className="p-4">Payment ID</th>
                                <th className="p-4">Recipient</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300 divide-y divide-gray-700/50">
                            {payments.map(payment => (
                                <tr key={payment.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 font-mono text-cyan-400">{payment.id}</td>
                                    <td className="p-4 font-medium text-white">{payment.recipient}</td>
                                    <td className="p-4"><span className="px-2 py-1 bg-gray-700 rounded text-xs">{payment.type}</span></td>
                                    <td className="p-4 text-gray-400">{payment.date}</td>
                                    <td className="p-4 text-right font-mono text-white">${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="p-4 text-center"><StatusBadge status={payment.status} /></td>
                                    <td className="p-4 text-right">
                                        <button className="text-gray-400 hover:text-white"><Settings className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Initiate Secure Payment">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Payment Rail</label>
                        <div className="grid grid-cols-2 gap-4">
                            {['WIRE', 'ACH', 'RTP', 'BLOCKCHAIN'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setNewPayment({ ...newPayment, type: type as any })}
                                    className={`p-3 rounded-lg border text-center transition-all ${newPayment.type === type ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Recipient Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                            placeholder="e.g. Quantum Suppliers Ltd."
                            value={newPayment.recipient}
                            onChange={e => setNewPayment({ ...newPayment, recipient: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Amount (USD)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500">$</span>
                            <input 
                                type="number" 
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-8 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none font-mono text-lg"
                                placeholder="0.00"
                                value={newPayment.amount || ''}
                                onChange={e => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-800 flex justify-end space-x-3">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        <button 
                            onClick={handleCreatePayment}
                            disabled={isSubmitting || !newPayment.amount || !newPayment.recipient}
                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                            Authorize Payment
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// 2. SECURITY OPS (Audit & Fraud)
const SecurityOpsView: React.FC<{ auditLogs: AuditLog[] }> = ({ auditLogs }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Security Operations Center</h2>
                    <p className="text-gray-400">Real-time Threat Monitoring & Audit Trail</p>
                </div>
                <div className="flex space-x-2">
                    <span className="px-3 py-1 bg-green-900/30 border border-green-500/50 text-green-400 rounded-full text-xs font-bold flex items-center">
                        <ShieldCheck className="w-3 h-3 mr-1" /> SYSTEM SECURE
                    </span>
                    <span className="px-3 py-1 bg-blue-900/30 border border-blue-500/50 text-blue-400 rounded-full text-xs font-bold flex items-center">
                        <Eye className="w-3 h-3 mr-1" /> MONITORING ACTIVE
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Threat Level" className="bg-gray-800/50 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-green-400">LOW</div>
                            <div className="text-xs text-gray-500">DEFCON 5</div>
                        </div>
                        <ShieldCheck className="w-12 h-12 text-green-500/20" />
                    </div>
                </Card>
                <Card title="Active Sessions" className="bg-gray-800/50 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-blue-400">1</div>
                            <div className="text-xs text-gray-500">IP: 192.168.X.X (Secure)</div>
                        </div>
                        <UserCheck className="w-12 h-12 text-blue-500/20" />
                    </div>
                </Card>
                <Card title="Failed Attempts (24h)" className="bg-gray-800/50 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-white">0</div>
                            <div className="text-xs text-gray-500">No anomalies detected</div>
                        </div>
                        <AlertTriangle className="w-12 h-12 text-red-500/20" />
                    </div>
                </Card>
            </div>

            <Card title="Immutable Audit Ledger" className="bg-gray-900 border border-gray-800">
                <div className="h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-2">
                        {auditLogs.map((log) => (
                            <div key={log.id} className="flex items-start p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:bg-gray-800/50 transition-colors group">
                                <div className="mr-4 mt-1">
                                    {log.status === 'SUCCESS' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                    {log.status === 'WARNING' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                                    {log.status === 'FAILURE' && <X className="w-5 h-5 text-red-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-white">{log.action.replace('_', ' ')}</p>
                                        <span className="text-xs font-mono text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 truncate">{log.details}</p>
                                    <div className="mt-2 flex items-center text-[10px] text-gray-600 font-mono">
                                        <Fingerprint className="w-3 h-3 mr-1" /> HASH: {log.hash}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

// 3. QUANTUM INTELLIGENCE (AI Chat)
const QuantumIntelligenceView: React.FC<{ 
    apiKey: string | null; 
    logAudit: (action: string, details: string) => void;
    onNavigate: (view: DashboardView) => void;
}> = ({ apiKey, logAudit, onNavigate }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'msg-0', sender: 'AI', text: `Welcome to ${DEMO_BANK_NAME} Intelligence. I am your dedicated financial sovereign agent. How can I assist with your capital allocation today?`, timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;
        
        const userMsg: ChatMessage = { id: `msg-${Date.now()}`, sender: 'USER', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsProcessing(true);

        // --- AI LOGIC ---
        try {
            let aiResponseText = "I'm processing your request securely.";
            let actionWidget = null;

            if (!apiKey) {
                aiResponseText = "I am currently running in restricted mode. Please configure the GEMINI_API_KEY in the settings to unlock my full cognitive potential.";
            } else {
                // Initialize Gemini
                const genAI = new GoogleGenAI(apiKey);
                const model = genAI.getGenerativeModel({ 
                    model: AI_MODEL_NAME,
                    systemInstruction: `You are the AI Core for ${DEMO_BANK_NAME}. You are elite, professional, and concise. You help the user manage business finances. You can "navigate" the app by suggesting actions. If the user asks to see payments, say you will take them to Treasury Prime. If they ask about security, mention the Security Ops center. Keep responses under 50 words.`
                });

                const result = await model.generateContent(input);
                aiResponseText = result.response.text();
            }

            // --- SIMULATED ACTIONS BASED ON INTENT ---
            const lowerInput = input.toLowerCase();
            if (lowerInput.includes('payment') || lowerInput.includes('transfer') || lowerInput.includes('send')) {
                actionWidget = (
                    <button onClick={() => onNavigate('TREASURY_PRIME')} className="mt-2 px-4 py-2 bg-cyan-600/20 border border-cyan-500 text-cyan-300 rounded-lg text-sm hover:bg-cyan-600/40 transition-colors flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" /> Go to Treasury Prime
                    </button>
                );
                logAudit('AI_NAVIGATE', 'AI suggested navigation to Treasury Prime');
            } else if (lowerInput.includes('security') || lowerInput.includes('audit') || lowerInput.includes('risk')) {
                actionWidget = (
                    <button onClick={() => onNavigate('SECURITY_OPS')} className="mt-2 px-4 py-2 bg-red-600/20 border border-red-500 text-red-300 rounded-lg text-sm hover:bg-red-600/40 transition-colors flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-2" /> Open Security Ops
                    </button>
                );
            } else if (lowerInput.includes('report') || lowerInput.includes('summary')) {
                 actionWidget = (
                    <div className="mt-2 p-3 bg-gray-800 rounded border border-gray-700">
                        <div className="flex items-center text-green-400 text-sm font-bold mb-1"><FileText className="w-4 h-4 mr-2" /> Report Generated</div>
                        <div className="text-xs text-gray-400">Executive_Summary_Q3.pdf</div>
                    </div>
                );
                logAudit('AI_GENERATE_REPORT', 'AI generated Executive Summary Q3');
            }

            const aiMsg: ChatMessage = { 
                id: `msg-${Date.now() + 1}`, 
                sender: 'AI', 
                text: aiResponseText, 
                timestamp: Date.now(),
                actionWidget 
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { id: `err-${Date.now()}`, sender: 'SYSTEM', text: "Secure handshake failed. Please verify API credentials.", timestamp: Date.now() }]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                            msg.sender === 'USER' 
                                ? 'bg-cyan-600 text-white rounded-br-none' 
                                : msg.sender === 'SYSTEM'
                                ? 'bg-red-900/50 border border-red-500 text-red-200'
                                : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-bl-none'
                        }`}>
                            <div className="flex items-center mb-1">
                                {msg.sender === 'AI' && <Bot className="w-4 h-4 mr-2 text-cyan-400" />}
                                {msg.sender === 'SYSTEM' && <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />}
                                <span className="text-xs font-bold opacity-70">{msg.sender === 'USER' ? 'You' : DEMO_BANK_NAME}</span>
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            {msg.actionWidget}
                            <div className="text-[10px] opacity-50 text-right mt-2">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 p-4 rounded-2xl rounded-bl-none border border-gray-700 flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                            <span className="text-xs text-gray-400">Processing secure request...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask Quantum Intelligence to analyze cash flow, initiate payments, or run audits..."
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl pl-4 pr-12 py-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none shadow-inner"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isProcessing}
                        className="absolute right-2 top-2 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Sparkles className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest">Powered by Google Gemini • End-to-End Encrypted</span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---

const PlaidDashboardView: React.FC = () => {
    const context = useContext(DataContext);
    const { geminiApiKey, userProfile } = context || {};
    
    const [activeView, setActiveView] = useState<DashboardView>('COMMAND_CENTER');
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS_INIT);
    const [currentTime, setCurrentTime] = useState(new Date());

    // --- AUDIT LOGGER ---
    const logAudit = useCallback((action: string, details: string) => {
        const newLog: AuditLog = {
            id: `AUD-${Date.now()}`,
            timestamp: Date.now(),
            action,
            user: userProfile?.name || 'Unknown User',
            status: 'SUCCESS',
            details,
            hash: generateHash()
        };
        setAuditLogs(prev => [newLog, ...prev]);
    }, [userProfile]);

    // --- CLOCK ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- RENDER HELPERS ---
    const renderSidebarItem = (view: DashboardView, icon: React.ElementType, label: string) => (
        <button
            onClick={() => setActiveView(view)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeView === view 
                ? 'bg-gradient-to-r from-cyan-900/50 to-transparent border-l-4 border-cyan-500 text-white shadow-lg' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
        >
            <icon className={`w-5 h-5 ${activeView === view ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
            <span className="font-medium tracking-wide">{label}</span>
            {activeView === view && <ChevronRight className="w-4 h-4 ml-auto text-cyan-500/50" />}
        </button>
    );

    const renderContent = () => {
        switch (activeView) {
            case 'TREASURY_PRIME':
                return <TreasuryPrimeView logAudit={logAudit} />;
            case 'SECURITY_OPS':
                return <SecurityOpsView auditLogs={auditLogs} />;
            case 'QUANTUM_INTELLIGENCE':
                return <QuantumIntelligenceView apiKey={geminiApiKey || null} logAudit={logAudit} onNavigate={setActiveView} />;
            case 'COMMAND_CENTER':
            default:
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* HERO SECTION */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-2xl">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Globe className="w-64 h-64 text-cyan-400" />
                            </div>
                            <div className="p-8 relative z-10">
                                <h1 className="text-4xl font-extrabold text-white mb-2">
                                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{userProfile?.name || 'Commander'}</span>
                                </h1>
                                <p className="text-gray-400 max-w-xl text-lg">
                                    Your financial ecosystem is operating at <span className="text-green-400 font-bold">99.9% efficiency</span>. 
                                    Quantum Intelligence has detected 3 optimization opportunities.
                                </p>
                                <div className="mt-6 flex space-x-4">
                                    <button onClick={() => setActiveView('QUANTUM_INTELLIGENCE')} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center">
                                        <Sparkles className="w-5 h-5 mr-2" /> Consult AI Advisor
                                    </button>
                                    <button onClick={() => setActiveView('TREASURY_PRIME')} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all flex items-center">
                                        <DollarSign className="w-5 h-5 mr-2" /> View Cash Position
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* METRICS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card title="Global Liquidity" className="border-t-4 border-cyan-500 hover:shadow-cyan-500/10 transition-shadow">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-3xl font-mono font-bold text-white">$24.5M</div>
                                        <div className="text-xs text-gray-400">USD Equivalent</div>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-cyan-500/50" />
                                </div>
                            </Card>
                            <Card title="Working Capital" className="border-t-4 border-blue-500 hover:shadow-blue-500/10 transition-shadow">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-3xl font-mono font-bold text-white">$8.2M</div>
                                        <div className="text-xs text-gray-400">Available Now</div>
                                    </div>
                                    <Wallet className="w-8 h-8 text-blue-500/50" />
                                </div>
                            </Card>
                            <Card title="Security Score" className="border-t-4 border-green-500 hover:shadow-green-500/10 transition-shadow">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-3xl font-mono font-bold text-green-400">98/100</div>
                                        <div className="text-xs text-gray-400">Audit Compliant</div>
                                    </div>
                                    <ShieldCheck className="w-8 h-8 text-green-500/50" />
                                </div>
                            </Card>
                            <Card title="Pending Actions" className="border-t-4 border-yellow-500 hover:shadow-yellow-500/10 transition-shadow">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-3xl font-mono font-bold text-yellow-400">5</div>
                                        <div className="text-xs text-gray-400">Requires Approval</div>
                                    </div>
                                    <AlertOctagon className="w-8 h-8 text-yellow-500/50" />
                                </div>
                            </Card>
                        </div>

                        {/* RECENT ACTIVITY & AI INSIGHTS */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <Card title="Live Transaction Feed" className="h-full">
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-2 rounded-full ${i % 2 === 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                                        {i % 2 === 0 ? <ArrowRightLeft className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">
                                                            {i % 2 === 0 ? 'Outbound Wire Transfer' : 'Inbound ACH Settlement'}
                                                        </div>
                                                        <div className="text-xs text-gray-400">Ref: {generateHash().substring(0, 8).toUpperCase()}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`font-mono font-bold ${i % 2 === 0 ? 'text-white' : 'text-green-400'}`}>
                                                        {i % 2 === 0 ? '-' : '+'}${((Math.random() * 10000) + 1000).toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Today, 10:{10 + i} AM</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                            <div className="lg:col-span-1">
                                <Card title="Quantum Insights" className="h-full bg-gradient-to-b from-gray-800 to-gray-900">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-xl">
                                            <div className="flex items-center mb-2 text-cyan-400 font-bold text-sm">
                                                <Brain className="w-4 h-4 mr-2" /> Cash Flow Forecast
                                            </div>
                                            <p className="text-sm text-gray-300">
                                                Based on historical patterns, expect a surplus of $1.2M by EOM. Suggest moving excess to Yield Account.
                                            </p>
                                        </div>
                                        <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
                                            <div className="flex items-center mb-2 text-yellow-400 font-bold text-sm">
                                                <AlertTriangle className="w-4 h-4 mr-2" /> Vendor Risk
                                            </div>
                                            <p className="text-sm text-gray-300">
                                                New vendor "TechStart" has a fluctuating credit score. Recommend manual approval for next invoice.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden selection:bg-cyan-500/30">
            {/* SIDEBAR */}
            <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col z-20 shadow-2xl">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold text-white tracking-tight leading-none">{DEMO_BANK_NAME}</h1>
                            <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">Enterprise Demo</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2 mt-2">Main Modules</div>
                    {renderSidebarItem('COMMAND_CENTER', Activity, 'Command Center')}
                    {renderSidebarItem('TREASURY_PRIME', Building2, 'Treasury Prime')}
                    {renderSidebarItem('SECURITY_OPS', ShieldCheck, 'Security Ops')}
                    
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2 mt-6">Intelligence</div>
                    {renderSidebarItem('QUANTUM_INTELLIGENCE', Brain, 'Quantum AI')}
                    {renderSidebarItem('MARKET_MAKER', BarChart3, 'Market Maker')}
                    
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2 mt-6">System</div>
                    {renderSidebarItem('AUDIT_VAULT', FileText, 'Audit Vault')}
                </nav>

                <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800 border border-gray-700">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                            {userProfile?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate">{userProfile?.name || 'User'}</div>
                            <div className="text-xs text-gray-500 truncate">Session ID: {generateHash().substring(0,6)}</div>
                        </div>
                        <Settings className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
                {/* HEADER */}
                <header className="h-16 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center text-gray-400 text-sm">
                        <span className="mr-2">System Status:</span>
                        <span className="flex items-center text-green-400 font-bold">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            OPERATIONAL
                        </span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-white">{currentTime.toLocaleTimeString()}</div>
                            <div className="text-xs text-gray-500">{currentTime.toLocaleDateString()}</div>
                        </div>
                        <div className="h-8 w-px bg-gray-700"></div>
                        <button className="text-gray-400 hover:text-white transition-colors relative">
                            <MessageSquareText className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <Lock className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* VIEWPORT */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default PlaidDashboardView;

// --- CONSOLIDATED FROM: PlaidDashboardView_1.tsx ---

import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, LinkedAccount, Transaction } from '../types';
import { GoogleGenAI } from "@google/genai";
import {
    Brain, Zap, ShieldCheck, AlertTriangle, TrendingUp, Settings, Loader2, MessageSquareText,
    Activity, FileText, Bot, GitBranch, DollarSign, BarChart3, Cpu, Database, Network, 
    SlidersHorizontal, Play, Pause, Repeat, Sparkles, Lock, Globe, Server, Terminal,
    CreditCard, Wallet, PieChart, ArrowRightLeft, Search, X, CheckCircle, AlertOctagon,
    UserCheck, Building2, Landmark, History, Fingerprint, Eye, ChevronRight, ChevronDown,
    Download, Share2, Printer, RefreshCw
} from 'lucide-react';

// =================================================================================================
// QUANTUM FINANCIAL - "THE GOLDEN TICKET" DEMO EXPERIENCE
// =================================================================================================
// This file represents the pinnacle of the "Test Drive" philosophy. 
// It is a self-contained monolith of functionality, simulating a high-end, 
// secure, and AI-driven business banking environment.
// =================================================================================================

// --- CONSTANTS & CONFIGURATION ---
const DEMO_BANK_NAME = "Quantum Financial";
const AI_MODEL_NAME = "gemini-1.5-flash"; // Using a standard model name for stability
const REFRESH_RATE_MS = 2000;

// --- TYPES ---

type DashboardView = 'COMMAND_CENTER' | 'TREASURY_PRIME' | 'SECURITY_OPS' | 'MARKET_MAKER' | 'QUANTUM_INTELLIGENCE' | 'AUDIT_VAULT';

interface AuditLog {
    id: string;
    timestamp: number;
    action: string;
    user: string;
    status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'WARNING';
    details: string;
    hash: string;
}

interface TreasuryPayment {
    id: string;
    recipient: string;
    amount: number;
    type: 'WIRE' | 'ACH' | 'RTP' | 'BLOCKCHAIN';
    status: 'DRAFT' | 'PENDING_APPROVAL' | 'PROCESSING' | 'COMPLETED';
    date: string;
}

interface ChatMessage {
    id: string;
    sender: 'USER' | 'AI' | 'SYSTEM';
    text: string;
    timestamp: number;
    isTyping?: boolean;
    actionWidget?: React.ReactNode;
}

// --- MOCK DATA GENERATORS ---

const generateHash = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const MOCK_AUDIT_LOGS_INIT: AuditLog[] = Array.from({ length: 15 }).map((_, i) => ({
    id: `AUD-${Date.now()}-${i}`,
    timestamp: Date.now() - (i * 3600000),
    action: ['USER_LOGIN', 'VIEW_REPORT', 'API_KEY_ROTATION', 'PAYMENT_INITIATED', 'RISK_RULE_UPDATE'][i % 5],
    user: 'J. OCallaghan',
    status: i % 10 === 0 ? 'WARNING' : 'SUCCESS',
    details: `Action performed via secure terminal. Session ID: ${generateHash().substring(0, 8)}`,
    hash: generateHash()
}));

const MOCK_PAYMENTS: TreasuryPayment[] = [
    { id: 'PAY-8821', recipient: 'Acme Corp International', amount: 125000.00, type: 'WIRE', status: 'COMPLETED', date: '2024-05-10' },
    { id: 'PAY-8822', recipient: 'Global Logistics Ltd', amount: 4520.50, type: 'ACH', status: 'PROCESSING', date: '2024-05-11' },
    { id: 'PAY-8823', recipient: 'TechStart Ventures', amount: 500000.00, type: 'BLOCKCHAIN', status: 'PENDING_APPROVAL', date: '2024-05-12' },
];

// --- UTILITY COMPONENTS ---

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let colorClass = 'bg-gray-700 text-gray-300';
    if (['SUCCESS', 'COMPLETED', 'OPERATIONAL', 'ACTIVE'].includes(status)) colorClass = 'bg-green-500/20 text-green-400 border border-green-500/30';
    if (['WARNING', 'PENDING_APPROVAL', 'DEGRADED'].includes(status)) colorClass = 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    if (['FAILURE', 'ERROR', 'CRITICAL', 'OFFLINE'].includes(status)) colorClass = 'bg-red-500/20 text-red-400 border border-red-500/30';
    if (['PROCESSING', 'RUNNING'].includes(status)) colorClass = 'bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse';

    return (
        <span className={`px-2 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider ${colorClass}`}>
            {status.replace('_', ' ')}
        </span>
    );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-cyan-500/50 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
                <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-gray-800/50">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <Zap className="w-5 h-5 text-cyan-400 mr-2" /> {title}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

// --- FEATURE MODULES ---

// 1. TREASURY PRIME (Payments & Collections)
const TreasuryPrimeView: React.FC<{ logAudit: (action: string, details: string) => void }> = ({ logAudit }) => {
    const [payments, setPayments] = useState<TreasuryPayment[]>(MOCK_PAYMENTS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPayment, setNewPayment] = useState<Partial<TreasuryPayment>>({ type: 'WIRE', amount: 0, recipient: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreatePayment = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            const payment: TreasuryPayment = {
                id: `PAY-${Math.floor(Math.random() * 10000)}`,
                recipient: newPayment.recipient || 'Unknown Recipient',
                amount: newPayment.amount || 0,
                type: newPayment.type as any,
                status: 'PENDING_APPROVAL',
                date: new Date().toISOString().split('T')[0]
            };
            setPayments([payment, ...payments]);
            logAudit('PAYMENT_INITIATED', `Initiated ${payment.type} of $${payment.amount} to ${payment.recipient}`);
            setIsSubmitting(false);
            setIsModalOpen(false);
            setNewPayment({ type: 'WIRE', amount: 0, recipient: '' });
        }, 1500);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Treasury Prime</h2>
                    <p className="text-gray-400">Global Liquidity & Payment Orchestration</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105"
                >
                    <DollarSign className="w-5 h-5 mr-2" /> Initiate Payment
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Liquidity Position" className="border-t-4 border-cyan-500">
                    <div className="text-4xl font-mono font-bold text-white">$24,500,000.00</div>
                    <div className="text-sm text-green-400 mt-2 flex items-center"><TrendingUp className="w-4 h-4 mr-1" /> +2.4% vs Last Close</div>
                </Card>
                <Card title="Pending Approvals" className="border-t-4 border-yellow-500">
                    <div className="text-4xl font-mono font-bold text-white">3</div>
                    <div className="text-sm text-yellow-400 mt-2 flex items-center"><AlertOctagon className="w-4 h-4 mr-1" /> Action Required</div>
                </Card>
                <Card title="Outbound Volume (MTD)" className="border-t-4 border-purple-500">
                    <div className="text-4xl font-mono font-bold text-white">$1.2M</div>
                    <div className="text-sm text-gray-400 mt-2">142 Transactions</div>
                </Card>
            </div>

            <Card title="Active Payment Rails" className="bg-gray-800/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-700 text-sm uppercase tracking-wider">
                                <th className="p-4">Payment ID</th>
                                <th className="p-4">Recipient</th>
                                <th className="p-4">Type</th>
                                <th className="p-4">Date</th>
                                <th className="p-4 text-right">Amount</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300 divide-y divide-gray-700/50">
                            {payments.map(payment => (
                                <tr key={payment.id} className="hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4 font-mono text-cyan-400">{payment.id}</td>
                                    <td className="p-4 font-medium text-white">{payment.recipient}</td>
                                    <td className="p-4"><span className="px-2 py-1 bg-gray-700 rounded text-xs">{payment.type}</span></td>
                                    <td className="p-4 text-gray-400">{payment.date}</td>
                                    <td className="p-4 text-right font-mono text-white">${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="p-4 text-center"><StatusBadge status={payment.status} /></td>
                                    <td className="p-4 text-right">
                                        <button className="text-gray-400 hover:text-white"><Settings className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Initiate Secure Payment">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Payment Rail</label>
                        <div className="grid grid-cols-2 gap-4">
                            {['WIRE', 'ACH', 'RTP', 'BLOCKCHAIN'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setNewPayment({ ...newPayment, type: type as any })}
                                    className={`p-3 rounded-lg border text-center transition-all ${newPayment.type === type ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Recipient Name</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                            placeholder="e.g. Quantum Suppliers Ltd."
                            value={newPayment.recipient}
                            onChange={e => setNewPayment({ ...newPayment, recipient: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Amount (USD)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500">$</span>
                            <input 
                                type="number" 
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-8 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none font-mono text-lg"
                                placeholder="0.00"
                                value={newPayment.amount || ''}
                                onChange={e => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-800 flex justify-end space-x-3">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        <button 
                            onClick={handleCreatePayment}
                            disabled={isSubmitting || !newPayment.amount || !newPayment.recipient}
                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                            Authorize Payment
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// 2. SECURITY OPS (Audit & Fraud)
const SecurityOpsView: React.FC<{ auditLogs: AuditLog[] }> = ({ auditLogs }) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Security Operations Center</h2>
                    <p className="text-gray-400">Real-time Threat Monitoring & Audit Trail</p>
                </div>
                <div className="flex space-x-2">
                    <span className="px-3 py-1 bg-green-900/30 border border-green-500/50 text-green-400 rounded-full text-xs font-bold flex items-center">
                        <ShieldCheck className="w-3 h-3 mr-1" /> SYSTEM SECURE
                    </span>
                    <span className="px-3 py-1 bg-blue-900/30 border border-blue-500/50 text-blue-400 rounded-full text-xs font-bold flex items-center">
                        <Eye className="w-3 h-3 mr-1" /> MONITORING ACTIVE
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Threat Level" className="bg-gray-800/50 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-green-400">LOW</div>
                            <div className="text-xs text-gray-500">DEFCON 5</div>
                        </div>
                        <ShieldCheck className="w-12 h-12 text-green-500/20" />
                    </div>
                </Card>
                <Card title="Active Sessions" className="bg-gray-800/50 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-blue-400">1</div>
                            <div className="text-xs text-gray-500">IP: 192.168.X.X (Secure)</div>
                        </div>
                        <UserCheck className="w-12 h-12 text-blue-500/20" />
                    </div>
                </Card>
                <Card title="Failed Attempts (24h)" className="bg-gray-800/50 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-3xl font-bold text-white">0</div>
                            <div className="text-xs text-gray-500">No anomalies detected</div>
                        </div>
                        <AlertTriangle className="w-12 h-12 text-red-500/20" />
                    </div>
                </Card>
            </div>

            <Card title="Immutable Audit Ledger" className="bg-gray-900 border border-gray-800">
                <div className="h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-2">
                        {auditLogs.map((log) => (
                            <div key={log.id} className="flex items-start p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:bg-gray-800/50 transition-colors group">
                                <div className="mr-4 mt-1">
                                    {log.status === 'SUCCESS' && <CheckCircle className="w-5 h-5 text-green-500" />}
                                    {log.status === 'WARNING' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                                    {log.status === 'FAILURE' && <X className="w-5 h-5 text-red-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-white">{log.action.replace('_', ' ')}</p>
                                        <span className="text-xs font-mono text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 truncate">{log.details}</p>
                                    <div className="mt-2 flex items-center text-[10px] text-gray-600 font-mono">
                                        <Fingerprint className="w-3 h-3 mr-1" /> HASH: {log.hash}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );
};

// 3. QUANTUM INTELLIGENCE (AI Chat)
const QuantumIntelligenceView: React.FC<{ 
    apiKey: string | null; 
    logAudit: (action: string, details: string) => void;
    onNavigate: (view: DashboardView) => void;
}> = ({ apiKey, logAudit, onNavigate }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'msg-0', sender: 'AI', text: `Welcome to ${DEMO_BANK_NAME} Intelligence. I am your dedicated financial sovereign agent. How can I assist with your capital allocation today?`, timestamp: Date.now() }
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;
        
        const userMsg: ChatMessage = { id: `msg-${Date.now()}`, sender: 'USER', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsProcessing(true);

        // --- AI LOGIC ---
        try {
            let aiResponseText = "I'm processing your request securely.";
            let actionWidget = null;

            if (!apiKey) {
                aiResponseText = "I am currently running in restricted mode. Please configure the GEMINI_API_KEY in the settings to unlock my full cognitive potential.";
            } else {
                // Initialize Gemini
                const genAI = new GoogleGenAI(apiKey);
                const model = genAI.getGenerativeModel({ 
                    model: AI_MODEL_NAME,
                    systemInstruction: `You are the AI Core for ${DEMO_BANK_NAME}. You are elite, professional, and concise. You help the user manage business finances. You can "navigate" the app by suggesting actions. If the user asks to see payments, say you will take them to Treasury Prime. If they ask about security, mention the Security Ops center. Keep responses under 50 words.`
                });

                const result = await model.generateContent(input);
                aiResponseText = result.response.text();
            }

            // --- SIMULATED ACTIONS BASED ON INTENT ---
            const lowerInput = input.toLowerCase();
            if (lowerInput.includes('payment') || lowerInput.includes('transfer') || lowerInput.includes('send')) {
                actionWidget = (
                    <button onClick={() => onNavigate('TREASURY_PRIME')} className="mt-2 px-4 py-2 bg-cyan-600/20 border border-cyan-500 text-cyan-300 rounded-lg text-sm hover:bg-cyan-600/40 transition-colors flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" /> Go to Treasury Prime
                    </button>
                );
                logAudit('AI_NAVIGATE', 'AI suggested navigation to Treasury Prime');
            } else if (lowerInput.includes('security') || lowerInput.includes('audit') || lowerInput.includes('risk')) {
                actionWidget = (
                    <button onClick={() => onNavigate('SECURITY_OPS')} className="mt-2 px-4 py-2 bg-red-600/20 border border-red-500 text-red-300 rounded-lg text-sm hover:bg-red-600/40 transition-colors flex items-center">
                        <ShieldCheck className="w-4 h-4 mr-2" /> Open Security Ops
                    </button>
                );
            } else if (lowerInput.includes('report') || lowerInput.includes('summary')) {
                 actionWidget = (
                    <div className="mt-2 p-3 bg-gray-800 rounded border border-gray-700">
                        <div className="flex items-center text-green-400 text-sm font-bold mb-1"><FileText className="w-4 h-4 mr-2" /> Report Generated</div>
                        <div className="text-xs text-gray-400">Executive_Summary_Q3.pdf</div>
                    </div>
                );
                logAudit('AI_GENERATE_REPORT', 'AI generated Executive Summary Q3');
            }

            const aiMsg: ChatMessage = { 
                id: `msg-${Date.now() + 1}`, 
                sender: 'AI', 
                text: aiResponseText, 
                timestamp: Date.now(),
                actionWidget 
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { id: `err-${Date.now()}`, sender: 'SYSTEM', text: "Secure handshake failed. Please verify API credentials.", timestamp: Date.now() }]);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                            msg.sender === 'USER' 
                                ? 'bg-cyan-600 text-white rounded-br-none' 
                                : msg.sender === 'SYSTEM'
                                ? 'bg-red-900/50 border border-red-500 text-red-200'
                                : 'bg-gray-800 border border-gray-700 text-gray-200 rounded-bl-none'
                        }`}>
                            <div className="flex items-center mb-1">
                                {msg.sender === 'AI' && <Bot className="w-4 h-4 mr-2 text-cyan-400" />}
                                {msg.sender === 'SYSTEM' && <AlertTriangle className="w-4 h-4 mr-2 text-red-400" />}
                                <span className="text-xs font-bold opacity-70">{msg.sender === 'USER' ? 'You' : DEMO_BANK_NAME}</span>
                            </div>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                            {msg.actionWidget}
                            <div className="text-[10px] opacity-50 text-right mt-2">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 p-4 rounded-2xl rounded-bl-none border border-gray-700 flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                            <span className="text-xs text-gray-400">Processing secure request...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Ask Quantum Intelligence to analyze cash flow, initiate payments, or run audits..."
                        className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl pl-4 pr-12 py-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none shadow-inner"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!input.trim() || isProcessing}
                        className="absolute right-2 top-2 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Sparkles className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-gray-600 uppercase tracking-widest">Powered by Google Gemini • End-to-End Encrypted</span>
                </div>
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---

const PlaidDashboardView: React.FC = () => {
    const context = useContext(DataContext);
    const { geminiApiKey, userProfile } = context || {};
    
    const [activeView, setActiveView] = useState<DashboardView>('COMMAND_CENTER');
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS_INIT);
    const [currentTime, setCurrentTime] = useState(new Date());

    // --- AUDIT LOGGER ---
    const logAudit = useCallback((action: string, details: string) => {
        const newLog: AuditLog = {
            id: `AUD-${Date.now()}`,
            timestamp: Date.now(),
            action,
            user: userProfile?.name || 'Unknown User',
            status: 'SUCCESS',
            details,
            hash: generateHash()
        };
        setAuditLogs(prev => [newLog, ...prev]);
    }, [userProfile]);

    // --- CLOCK ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // --- RENDER HELPERS ---
    const renderSidebarItem = (view: DashboardView, icon: React.ElementType, label: string) => (
        <button
            onClick={() => setActiveView(view)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeView === view 
                ? 'bg-gradient-to-r from-cyan-900/50 to-transparent border-l-4 border-cyan-500 text-white shadow-lg' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
        >
            <icon className={`w-5 h-5 ${activeView === view ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
            <span className="font-medium tracking-wide">{label}</span>
            {activeView === view && <ChevronRight className="w-4 h-4 ml-auto text-cyan-500/50" />}
        </button>
    );

    const renderContent = () => {
        switch (activeView) {
            case 'TREASURY_PRIME':
                return <TreasuryPrimeView logAudit={logAudit} />;
            case 'SECURITY_OPS':
                return <SecurityOpsView auditLogs={auditLogs} />;
            case 'QUANTUM_INTELLIGENCE':
                return <QuantumIntelligenceView apiKey={geminiApiKey || null} logAudit={logAudit} onNavigate={setActiveView} />;
            case 'COMMAND_CENTER':
            default:
                return (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* HERO SECTION */}
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-2xl">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Globe className="w-64 h-64 text-cyan-400" />
                            </div>
                            <div className="p-8 relative z-10">
                                <h1 className="text-4xl font-extrabold text-white mb-2">
                                    Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{userProfile?.name || 'Commander'}</span>
                                </h1>
                                <p className="text-gray-400 max-w-xl text-lg">
                                    Your financial ecosystem is operating at <span className="text-green-400 font-bold">99.9% efficiency</span>. 
                                    Quantum Intelligence has detected 3 optimization opportunities.
                                </p>
                                <div className="mt-6 flex space-x-4">
                                    <button onClick={() => setActiveView('QUANTUM_INTELLIGENCE')} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center">
                                        <Sparkles className="w-5 h-5 mr-2" /> Consult AI Advisor
                                    </button>
                                    <button onClick={() => setActiveView('TREASURY_PRIME')} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all flex items-center">
                                        <DollarSign className="w-5 h-5 mr-2" /> View Cash Position
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* METRICS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card title="Global Liquidity" className="border-t-4 border-cyan-500 hover:shadow-cyan-500/10 transition-shadow">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-3xl font-mono font-bold text-white">$24.5M</div>
                                        <div className="text-xs text-gray-400">USD Equivalent</div>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-cyan-500/50" />
                                </div>
                            </Card>
                            <Card title="Working Capital" className="border-t-4 border-blue-500 hover:shadow-blue-500/10 transition-shadow">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-3xl font-mono font-bold text-white">$8.2M</div>
                                        <div className="text-xs text-gray-400">Available Now</div>
                                    </div>
                                    <Wallet className="w-8 h-8 text-blue-500/50" />
                                </div>
                            </Card>
                            <Card title="Security Score" className="border-t-4 border-green-500 hover:shadow-green-500/10 transition-shadow">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-3xl font-mono font-bold text-green-400">98/100</div>
                                        <div className="text-xs text-gray-400">Audit Compliant</div>
                                    </div>
                                    <ShieldCheck className="w-8 h-8 text-green-500/50" />
                                </div>
                            </Card>
                            <Card title="Pending Actions" className="border-t-4 border-yellow-500 hover:shadow-yellow-500/10 transition-shadow">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <div className="text-3xl font-mono font-bold text-yellow-400">5</div>
                                        <div className="text-xs text-gray-400">Requires Approval</div>
                                    </div>
                                    <AlertOctagon className="w-8 h-8 text-yellow-500/50" />
                                </div>
                            </Card>
                        </div>

                        {/* RECENT ACTIVITY & AI INSIGHTS */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <Card title="Live Transaction Feed" className="h-full">
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4].map((i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-2 rounded-full ${i % 2 === 0 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                                        {i % 2 === 0 ? <ArrowRightLeft className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white">
                                                            {i % 2 === 0 ? 'Outbound Wire Transfer' : 'Inbound ACH Settlement'}
                                                        </div>
                                                        <div className="text-xs text-gray-400">Ref: {generateHash().substring(0, 8).toUpperCase()}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`font-mono font-bold ${i % 2 === 0 ? 'text-white' : 'text-green-400'}`}>
                                                        {i % 2 === 0 ? '-' : '+'}${((Math.random() * 10000) + 1000).toFixed(2)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Today, 10:{10 + i} AM</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                            <div className="lg:col-span-1">
                                <Card title="Quantum Insights" className="h-full bg-gradient-to-b from-gray-800 to-gray-900">
                                    <div className="space-y-4">
                                        <div className="p-4 bg-cyan-900/20 border border-cyan-500/30 rounded-xl">
                                            <div className="flex items-center mb-2 text-cyan-400 font-bold text-sm">
                                                <Brain className="w-4 h-4 mr-2" /> Cash Flow Forecast
                                            </div>
                                            <p className="text-sm text-gray-300">
                                                Based on historical patterns, expect a surplus of $1.2M by EOM. Suggest moving excess to Yield Account.
                                            </p>
                                        </div>
                                        <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
                                            <div className="flex items-center mb-2 text-yellow-400 font-bold text-sm">
                                                <AlertTriangle className="w-4 h-4 mr-2" /> Vendor Risk
                                            </div>
                                            <p className="text-sm text-gray-300">
                                                New vendor "TechStart" has a fluctuating credit score. Recommend manual approval for next invoice.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-black text-gray-100 font-sans overflow-hidden selection:bg-cyan-500/30">
            {/* SIDEBAR */}
            <aside className="w-72 bg-gray-900 border-r border-gray-800 flex flex-col z-20 shadow-2xl">
                <div className="p-6 border-b border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold text-white tracking-tight leading-none">{DEMO_BANK_NAME}</h1>
                            <span className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">Enterprise Demo</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2 mt-2">Main Modules</div>
                    {renderSidebarItem('COMMAND_CENTER', Activity, 'Command Center')}
                    {renderSidebarItem('TREASURY_PRIME', Building2, 'Treasury Prime')}
                    {renderSidebarItem('SECURITY_OPS', ShieldCheck, 'Security Ops')}
                    
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2 mt-6">Intelligence</div>
                    {renderSidebarItem('QUANTUM_INTELLIGENCE', Brain, 'Quantum AI')}
                    {renderSidebarItem('MARKET_MAKER', BarChart3, 'Market Maker')}
                    
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 mb-2 mt-6">System</div>
                    {renderSidebarItem('AUDIT_VAULT', FileText, 'Audit Vault')}
                </nav>

                <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800 border border-gray-700">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                            {userProfile?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-white truncate">{userProfile?.name || 'User'}</div>
                            <div className="text-xs text-gray-500 truncate">Session ID: {generateHash().substring(0,6)}</div>
                        </div>
                        <Settings className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
                    </div>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
                {/* HEADER */}
                <header className="h-16 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-8 z-10">
                    <div className="flex items-center text-gray-400 text-sm">
                        <span className="mr-2">System Status:</span>
                        <span className="flex items-center text-green-400 font-bold">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            OPERATIONAL
                        </span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="text-right hidden md:block">
                            <div className="text-sm font-bold text-white">{currentTime.toLocaleTimeString()}</div>
                            <div className="text-xs text-gray-500">{currentTime.toLocaleDateString()}</div>
                        </div>
                        <div className="h-8 w-px bg-gray-700"></div>
                        <button className="text-gray-400 hover:text-white transition-colors relative">
                            <MessageSquareText className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
                        </button>
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <Lock className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* VIEWPORT */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default PlaidDashboardView;

// --- CONSOLIDATED FROM: PlaidDashboardView (2).tsx ---

import React, { useContext, useState, useMemo, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, PlaidAccount } from '../types';
import { Brain, Zap, ShieldCheck, AlertTriangle, TrendingUp, Settings, Loader2, MessageSquareText } from 'lucide-react';

// --- REFACTORING: Replaced deliberately flawed/random utilities with deterministic (mocked) logic ---
// Rationale: The original implementation used Math.random() and static strings for critical metrics and summaries.
// This is being replaced with deterministic, even if mocked, logic to simulate a stable system response.
// In a production environment, these functions would interface with a robust backend service.

/**
 * REPLACEMENT: Provides deterministic (mocked) health metrics for the Plaid dashboard.
 * This replaces the previous `calculateHealthScore`, `generateSummary`, and random error/sync counts.
 * In a real application, these metrics would be fetched from a dedicated Plaid integration service.
 * @param accounts - The list of linked Plaid accounts.
 * @returns Object containing healthScore, itemsInError, successfulSyncs, and summary.
 */
const getDashboardMetrics = (accounts: PlaidAccount[]) => {
    let healthScore = 100;
    let itemsInError = 0;

    accounts.forEach((account, index) => {
        // Simulate specific accounts having issues based on ID for consistent (non-random) mock behavior.
        // E.g., accounts ending in '1' or '5' are in error.
        const hasError = account.id.endsWith('1') || account.id.endsWith('5');
        const isStale = account.id.endsWith('2'); // Simulate stale data for accounts ending in '2'

        if (hasError) {
            itemsInError++;
            healthScore -= 10; // Consistent penalty
        }
        if (isStale) {
            healthScore -= 5; // Consistent penalty for staleness
        }
    });

    healthScore = Math.max(0, parseFloat(healthScore.toFixed(2)));
    // Provide a more stable, non-random successful sync count
    const successfulSyncs = accounts.length * 30 + (accounts.length > 0 ? 50 : 0) + itemsInError * 5;

    let summary = "Operational Status: All endpoints are stable.";
    if (itemsInError > 0) {
        summary = `Warning: ${itemsInError} connections require attention. Review linked institutions below.`;
    } else if (healthScore < 80) {
        summary = "Performance Warning: System integrity is okay, but re-authentication or review is recommended for some connections.";
    }

    return {
        healthScore,
        itemsInError,
        successfulSyncs,
        summary
    };
};

/**
 * REPLACEMENT: Provides deterministic (mocked) status for individual Plaid accounts.
 * This replaces the previous `Math.random() > 0.95` for individual account error states.
 * In a real application, this status would come from a backend service monitoring individual connections.
 * @param accountId - The ID of the Plaid account.
 * @returns Object with isError, statusText, and statusColor.
 */
const getAccountStatus = (accountId: string) => {
    // Use a consistent rule to determine mock error status for display purposes
    const isError = accountId.endsWith('1') || accountId.endsWith('5');
    const statusText = isError ? 'Error' : 'Operational';
    const statusColor = isError ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300';
    return { isError, statusText, statusColor };
};

/**
 * REPLACEMENT: Mocked AI assistant service call.
 * This replaces the original `setTimeout` and static responses, providing a more structured and
 * extensible (even if still mocked) AI interaction.
 * Rationale: Hardening AI modules to include error handling, timeouts, fallbacks, and non-blocking calls.
 * @param query - The user's input query.
 * @param metrics - Current dashboard metrics for contextual responses.
 * @returns A promise resolving to the AI-generated response string.
 */
const askPlaidAssistant = async (query: string, metrics: ReturnType<typeof getDashboardMetrics>, userProfileName: string | undefined, linkedAccountsCount: number): Promise<string> => {
    return new Promise(resolve => {
        // Simulate network latency for a non-blocking AI call
        setTimeout(() => {
            const lowerQuery = query.toLowerCase();
            let res = "I am unable to provide a specific answer. Please refine your query or ask about system health, errors, or synchronizations.";

            if (lowerQuery.includes("error")) {
                res = `There are currently ${metrics.itemsInError} items flagged as needing attention. For details, please check the 'Connected Financial Institutions' section.`;
            } else if (lowerQuery.includes("health")) {
                res = `The current System Health Score is ${metrics.healthScore.toFixed(2)}%. This indicates overall system stability.`;
            } else if (lowerQuery.includes("sync")) {
                res = `Total successful synchronizations today are normal. Your ${linkedAccountsCount} linked institutions are syncing regularly.`;
            } else if (lowerQuery.includes("user")) {
                res = `User profile '${userProfileName || 'N/A'}' has ${linkedAccountsCount} active connections.`;
            } else if (lowerQuery.includes("status")) {
                res = metrics.summary;
            } else if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
                res = "Hello! I am your Dashboard Assistant. How can I assist you with your financial data?";
            }

            resolve(`(AI-Generated) ${res}`);
        }, 1500); // Simulate 1.5 second API response time
    });
};

// --- Component Definition ---

const PlaidDashboardView: React.FC = () => {
    const context = useContext(DataContext);
    const [chatOpen, setChatOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("Hello. I am the Dashboard Assistant. How can I help?");
    const [aiLoading, setAiLoading] = useState(false);
    // REFACTORING: Removed arbitrary input length limit to allow for proper backend validation.
    // Frontend validation should be separate and user-friendly, not just a disabling state.
    // const [queryTooLong, setQueryTooLong] = useState(false);

    if (!context) {
        throw new Error("PlaidDashboardView must be used within a DataProvider");
    }

    const { linkedAccounts, plaidApiKey, setActiveView, userProfile } = context;

    // --- REPLACEMENT: Using deterministic mocked metrics ---
    const { healthScore, itemsInError, successfulSyncs, summary } = useMemo(() =>
        getDashboardMetrics(linkedAccounts),
        [linkedAccounts]
    );

    // --- Handlers ---
    const handleQuery = useCallback(async () => {
        if (!query.trim()) return;

        setAiLoading(true);
        setResponse(`Processing: "${query}"...`);
        const currentQuery = query; // Capture query state
        setQuery(""); // Clear input immediately

        try {
            // REPLACEMENT: Calling the new mocked AI assistant service
            const aiResponse = await askPlaidAssistant(currentQuery, { healthScore, itemsInError, successfulSyncs, summary }, userProfile?.name, linkedAccounts.length);
            setResponse(aiResponse);
        } catch (error) {
            console.error("AI Assistant error:", error);
            setResponse("(AI-Generated) Sorry, I encountered an error. Please try again or ask a different question.");
        } finally {
            setAiLoading(false);
        }
    }, [query, healthScore, itemsInError, successfulSyncs, summary, userProfile?.name, linkedAccounts.length]);

    // --- Configuration View (Gate for Plaid API Key) ---
    if (!plaidApiKey) {
        return (
            <div className="space-y-8 p-6 bg-gray-900 min-h-screen">
                <header className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-widest uppercase">
                        Financial Dashboard: Plaid Integration
                    </h1>
                    <button
                        onClick={() => setActiveView(View.APIIntegration)}
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02]"
                    >
                        <Settings className="w-5 h-5 mr-2" /> Configure API Key
                    </button>
                </header>

                <Card title="Configuration: Plaid API Key" className="border-red-500/50">
                    <div className="text-center p-8 space-y-6">
                        <AlertTriangle className="w-16 h-16 mx-auto text-red-400 animate-pulse" />
                        <p className="text-xl text-gray-300">
                            Access to the Plaid Module is restricted. API credentials are required to sync data.
                        </p>
                        <button
                            onClick={() => setActiveView(View.APIIntegration)}
                            className="w-full md:w-auto px-8 py-3 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xl transition duration-300"
                        >
                            Proceed to Configuration
                        </button>
                    </div>
                </Card>
                <div className="text-center text-sm text-gray-500 pt-4">
                    Status: Pending. Awaiting credentials.
                </div>
            </div>
        );
    }

    // --- Dashboard View ---
    return (
        <div className="space-y-8 p-6 bg-gray-900 min-h-screen font-sans">
            <header className="flex justify-between items-center border-b border-gray-700 pb-4">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-widest uppercase">
                    Financial Data Dashboard
                </h1>
                <button
                    onClick={() => setActiveView(View.APIIntegration)}
                    className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition duration-300"
                >
                    <Settings className="w-4 h-4 mr-2" /> Manage Integration
                </button>
            </header>

            {/* Status Banner */}
            <Card title="System Health Status" className="border-l-4 border-cyan-500 bg-gray-800/70">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Brain className="w-10 h-10 text-cyan-400 flex-shrink-0" />
                        <div>
                            <p className="text-lg font-medium text-white">System Score:</p>
                            <p className="text-4xl font-extrabold text-cyan-300">{healthScore.toFixed(2)}%</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-8 max-w-xl">
                        <p className="text-sm italic text-gray-300 border-l-2 border-gray-600 pl-3">
                            <span className="font-bold text-cyan-400">System Note:</span> {summary}
                        </p>
                    </div>
                    <button
                        onClick={() => setChatOpen(!chatOpen)}
                        className={`mt-4 md:mt-0 px-4 py-2 rounded-full text-sm font-semibold transition duration-300 flex items-center ${chatOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white`}
                    >
                        <MessageSquareText className="w-4 h-4 mr-2" /> {chatOpen ? 'Close Chat' : 'Open Chat'}
                    </button>
                </div>
            </Card>

            {/* Chat Interface */}
            {chatOpen && (
                <Card title="Assistant Interface" className="bg-gray-800/90 border-cyan-600/50">
                    <div className="h-64 overflow-y-auto p-3 mb-3 bg-gray-900 rounded-lg border border-gray-700 space-y-3">
                        <div className="flex justify-start">
                            <div className="bg-gray-700 p-3 rounded-lg max-w-[80%] shadow-md">
                                <p className="text-xs font-bold text-cyan-400 mb-1">Assistant</p>
                                <p className="text-sm text-white">{response}</p>
                            </div>
                        </div>
                        {/* REFACTORING: Future enhancement to add chat history storage for better UX. */}
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                            placeholder="Ask about connection stability, errors, or metrics..."
                            className="flex-grow p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                            disabled={aiLoading} // Disable input while AI is processing
                        />
                        <button
                            onClick={handleQuery}
                            disabled={!query.trim() || aiLoading} // Disable button while AI is processing or query is empty
                            className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:bg-gray-600 transition duration-200 flex items-center"
                        >
                            {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                        </button>
                    </div>
                    {/* REFACTORING: Removed arbitrary max char warning. Real validation should be handled with user feedback. */}
                    {/* <p className="text-xs text-gray-500 mt-1">Max 500 characters.</p> */}
                </Card>
            )}

            {/* KPI Grid - REPLACEMENT: Metrics now derived from deterministic mock logic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Connection Resilience" className="shadow-xl border-b-4 border-green-500">
                    <ShieldCheck className="w-8 h-8 text-green-400 mb-2" />
                    <p className="text-5xl font-extrabold text-white my-1">{healthScore.toFixed(1)}%</p>
                    <p className="text-sm text-gray-400">Estimated Stability</p>
                </Card>
                <Card title="Active Errors" className="shadow-xl border-b-4 border-red-500">
                    <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
                    <p className={`text-5xl font-extrabold my-1 ${itemsInError > 0 ? 'text-red-400' : 'text-white'}`}>{itemsInError}</p>
                    <p className="text-sm text-gray-400">Attention needed</p>
                </Card>
                <Card title="Total Syncs (24h)" className="shadow-xl border-b-4 border-cyan-500">
                    <TrendingUp className="w-8 h-8 text-cyan-400 mb-2" />
                    <p className="text-5xl font-extrabold text-white my-1">{successfulSyncs.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Daily Syncs</p>
                </Card>
                <Card title="Institutions Monitored" className="shadow-xl border-b-4 border-indigo-500">
                    <Zap className="w-8 h-8 text-indigo-400 mb-2" />
                    <p className="text-5xl font-extrabold text-white my-1">{linkedAccounts.length}</p>
                    <p className="text-sm text-gray-400">Connected Sources</p>
                </Card>
            </div>

            {/* Institution List */}
            <Card title={`Connected Financial Institutions (${linkedAccounts.length})`} className="bg-gray-800/70">
                {linkedAccounts.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {linkedAccounts.map(account => {
                            // REPLACEMENT: Using deterministic account status
                            const { isError, statusText, statusColor } = getAccountStatus(account.id);

                            return (
                                <div key={account.id} className="p-4 bg-gray-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg hover:bg-gray-700/70 transition duration-200 border border-gray-700">
                                    <div className="flex-grow mb-2 md:mb-0">
                                        <p className="font-bold text-lg text-white">{account.name}</p>
                                        <p className="text-sm text-gray-400">
                                            Type: {account.type.toUpperCase()} | ID: {account.id.substring(0, 8)}...
                                            {account.mask && <span className="ml-4">Masked: ****{account.mask}</span>}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                                            {statusText}
                                        </span>
                                        <button
                                            onClick={() => console.log(`View details for ${account.name}`)}
                                            className="text-cyan-400 hover:text-cyan-300 text-sm"
                                        >
                                            Details &rarr;
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-800 rounded-lg border border-dashed border-gray-700">
                        <Zap className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-500 text-lg">No active Plaid connections. Please configure in settings.</p>
                    </div>
                )}
            </Card>

            {/* General Information */}
            <Card title="Overview" className="bg-gray-800/70 border-l-4 border-indigo-500">
                <div className="text-gray-300 space-y-5 prose prose-invert max-w-none">
                    <p>
                        This dashboard provides an overview of connected financial data sources via the Plaid API. It monitors connection status and basic metrics.
                    </p>
                    <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-gray-400">
                        "System stability is important for reliable data access."
                    </blockquote>
                    <p>
                        The system checks for potential errors across endpoints. This dashboard reflects current telemetry to help manage external service connections.
                    </p>
                </div>
            </Card>

            <footer className="text-center text-xs text-gray-600 pt-6 border-t border-gray-800">
                Plaid Dashboard | Version 1.0 | Managed by System
            </footer>
        </div>
    );
};

export default PlaidDashboardView;

// --- CONSOLIDATED FROM: PlaidDashboardView (4).tsx ---

import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, LinkedAccount } from '../types';
import {
    Brain, Zap, ShieldCheck, AlertTriangle, TrendingUp, Settings, Loader2, MessageSquareText,
    Activity, FileText, Bot, GitBranch, DollarSign, BarChart3, Cpu, Database, Network, SlidersHorizontal, Play, Pause, Repeat, Sparkles
} from 'lucide-react';

// --- Advanced Utility Functions (Simulated) ---

const calculateHealthScore = (accounts: LinkedAccount[]): number => {
    if (accounts.length === 0) return 0;
    let score = 100.0;
    let penalty = 0;
    accounts.forEach(account => {
        const isStale = Math.random() > 0.90;
        const hasRecentError = Math.random() > 0.98;
        if (isStale) penalty += 5;
        if (hasRecentError) penalty += 15;
        if (account.type === 'depository' && Math.random() > 0.7) penalty -= 1;
    });
    score = Math.max(0, 100 - penalty);
    return parseFloat(score.toFixed(2));
};

const generateSummary = (score: number, errorCount: number): string => {
    if (errorCount > 5) return "CRITICAL ALERT: Multiple connections require immediate manual intervention. System stability is at risk.";
    if (score < 70) return "Performance Degradation: System integrity is compromised. Proactive re-authentication is strongly recommended.";
    if (score > 95) return "Optimal Performance: All data endpoints are stable and responding within nominal parameters.";
    return "Stable Operation: Data synchronization is proceeding as expected. Minor fluctuations detected.";
};

// --- Type Definitions for Sub-Modules ---
type HFTStrategy = 'Arbitrage' | 'Market Making' | 'Momentum';
type Trade = { id: string; symbol: string; side: 'BUY' | 'SELL'; price: number; quantity: number; timestamp: number; pnl: number };
type ActiveViewModule = 'HEALTH_STATUS' | 'HFT_SIMULATOR' | 'RISK_SENTINEL' | 'GEMINI_INSIGHTS' | 'ANALYTICS_ENGINE' | 'DATA_TOPOLOGY';

// --- Sub-Components (Self-Contained Apps) ---

const HFTStrategyView: React.FC = () => {
    const [strategy, setStrategy] = useState<HFTStrategy>('Momentum');
    const [isRunning, setIsRunning] = useState(false);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [pnl, setPnl] = useState(0);

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            const newTrade: Trade = {
                id: `T${Date.now()}${Math.random()}`,
                symbol: ['BTC/USD', 'ETH/USD', 'AAPL', 'TSLA'][Math.floor(Math.random() * 4)],
                side: Math.random() > 0.5 ? 'BUY' : 'SELL',
                price: 100 + Math.random() * 5000,
                quantity: Math.random() * 10,
                timestamp: Date.now(),
                pnl: (Math.random() - 0.48) * 100,
            };
            setTrades(prev => [newTrade, ...prev.slice(0, 99)]);
            setPnl(prev => prev + newTrade.pnl);
        }, 250); // High frequency simulation
        return () => clearInterval(interval);
    }, [isRunning]);

    return (
        <Card title="High-Frequency Trading (HFT) Simulator" className="bg-gray-800/90 border-indigo-600/50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <Card title="Strategy Configuration" className="bg-gray-900/50">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-300">Select Strategy</label>
                            <select value={strategy} onChange={e => setStrategy(e.target.value as HFTStrategy)} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white">
                                <option>Arbitrage</option>
                                <option>Market Making</option>
                                <option>Momentum</option>
                            </select>
                        </div>
                        <div className="mt-4 space-y-3">
                            <label className="block text-sm font-medium text-gray-300">Risk Limit ($)</label>
                            <input type="number" defaultValue={10000} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white" />
                        </div>
                        <div className="mt-4 space-y-3">
                            <label className="block text-sm font-medium text-gray-300">Execution Speed (ms)</label>
                            <input type="number" defaultValue={5} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white" />
                        </div>
                        <div className="mt-6 flex space-x-2">
                            <button onClick={() => setIsRunning(!isRunning)} className={`w-full flex items-center justify-center p-3 rounded-lg text-white font-bold transition ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                {isRunning ? <><Pause className="w-5 h-5 mr-2" /> Stop Engine</> : <><Play className="w-5 h-5 mr-2" /> Start Engine</>}
                            </button>
                            <button onClick={() => { setTrades([]); setPnl(0); }} className="p-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"><Repeat className="w-5 h-5" /></button>
                        </div>
                    </Card>
                    <Card title="Performance" className="bg-gray-900/50">
                        <p className="text-sm text-gray-400">Realized P&L</p>
                        <p className={`text-4xl font-mono font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </p>
                        <p className="text-sm text-gray-400 mt-4">Trades Executed</p>
                        <p className="text-3xl font-mono font-bold text-white">{trades.length}</p>
                    </Card>
                </div>
                {/* Trade Log */}
                <div className="lg:col-span-2">
                    <Card title="Live Trade Execution Log" className="bg-gray-900/50 h-[600px] flex flex-col">
                        <div className="grid grid-cols-5 gap-2 text-xs font-bold text-gray-400 border-b border-gray-700 pb-2 mb-2 px-2">
                            <span>Timestamp</span><span>Symbol</span><span>Side</span><span className="text-right">Price</span><span className="text-right">P&L</span>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2 font-mono text-sm space-y-1">
                            {trades.map(trade => (
                                <div key={trade.id} className={`grid grid-cols-5 gap-2 p-1.5 rounded ${trade.side === 'BUY' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                    <span className="text-gray-500">{new Date(trade.timestamp).toLocaleTimeString('en-US', { hour12: false })}.{String(trade.timestamp % 1000).padStart(3, '0')}</span>
                                    <span className="text-white font-semibold">{trade.symbol}</span>
                                    <span className={trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>{trade.side}</span>
                                    <span className="text-right text-white">{trade.price.toFixed(2)}</span>
                                    <span className={`text-right font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{trade.pnl.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </Card>
    );
};

const RiskSentinelView: React.FC = () => {
    const [reportType, setReportType] = useState('AML_Screening');
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportUrl, setReportUrl] = useState<string | null>(null);

    const handleGenerateReport = useCallback(() => {
        setIsGenerating(true);
        setReportUrl(null);
        setTimeout(() => {
            setReportUrl(`/reports/generated/${reportType}_${Date.now()}.pdf`);
            setIsGenerating(false);
        }, 2500);
    }, [reportType]);

    return (
        <Card title="Risk & Compliance Sentinel" className="bg-gray-800/90 border-red-600/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Report Generation */}
                <Card title="Compliance Report Generation" className="bg-gray-900/50">
                    <div className="space-y-4">
                        <p className="text-gray-300">Generate on-demand compliance reports based on real-time transactional data.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Report Type</label>
                            <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white">
                                <option value="AML_Screening">AML Screening Report</option>
                                <option value="SAR_Filing">Suspicious Activity Report (SAR)</option>
                                <option value="KYC_Verification">KYC Verification Summary</option>
                            </select>
                        </div>
                        <button onClick={handleGenerateReport} disabled={isGenerating} className="w-full flex items-center justify-center p-3 rounded-lg text-white font-bold transition bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600">
                            {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : <><FileText className="w-5 h-5 mr-2" /> Generate Report</>}
                        </button>
                        {reportUrl && (
                            <div className="mt-4 p-3 bg-green-900/50 border border-green-500 rounded-lg text-center">
                                <p className="text-green-300">Report generated successfully.</p>
                                <a href={reportUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline text-sm">Download Report</a>
                            </div>
                        )}
                    </div>
                </Card>
                {/* Live Anomaly Feed */}
                <Card title="Live Anomaly Detection Feed" className="bg-gray-900/50">
                    <div className="h-80 overflow-y-auto pr-2 space-y-3">
                        {[...Array(15)].map((_, i) => (
                            <div key={i} className="flex items-start space-x-3 p-2 bg-gray-800/70 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {['High-value transfer', 'Unusual Geo-location', 'Rapid Movement of Funds'][i % 3]}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Account ****{1000 + i * 17} | Risk Score: {75 + (i % 25)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </Card>
    );
};

const GeminiInsightsView: React.FC = () => {
    const { linkedAccounts } = useContext(DataContext)!;
    const [query, setQuery] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [insight, setInsight] = useState<string | null>(null);

    const handleQuerySubmit = useCallback(() => {
        if (!query.trim()) return;
        setIsThinking(true);
        setInsight(null);
        const thinkingTime = 1500 + Math.random() * 2000;
        setTimeout(() => {
            let generatedInsight = `Based on the query "${query}" and analysis of ${linkedAccounts.length} data sources, a multi-modal projection suggests a 15% increase in discretionary spending potential for the next fiscal quarter. Key indicators include reduced debt servicing costs and a positive shift in investment account momentum.`;
            if (query.toLowerCase().includes('risk')) {
                generatedInsight = `Risk analysis indicates a potential concentration risk in the technology sector, representing 68% of the total investment portfolio. Diversification into consumer staples or healthcare is recommended to mitigate volatility. The system has flagged two transactions from a high-risk jurisdiction for further review.`;
            } else if (query.toLowerCase().includes('save')) {
                generatedInsight = `To optimize savings, the model suggests consolidating the balances from accounts ****${linkedAccounts[0]?.mask || '1234'} and ****${linkedAccounts[1]?.mask || '5678'} into a high-yield savings vehicle. This action could potentially increase annual returns by approximately $${(Math.random() * 500 + 200).toFixed(2)}.`;
            }
            setInsight(generatedInsight);
            setIsThinking(false);
        }, thinkingTime);
    }, [query, linkedAccounts]);

    const proactiveInsights = useMemo(() => [
        { title: "Cash Flow Optimization", text: "Unusually high balance in a low-yield checking account. Consider moving funds to a higher-yield instrument.", severity: "low" },
        { title: "Subscription Anomaly", text: "A duplicate subscription charge for 'StreamFlix' was detected across two different cards.", severity: "medium" },
        { title: "Investment Opportunity", text: "Market volatility in the energy sector presents a potential buying opportunity aligned with your stated risk profile.", severity: "low" },
        { title: "Credit Utilization Alert", text: `Credit card ending in ****${linkedAccounts[2]?.mask || '9012'} has a utilization rate of 85%, which may impact credit score.`, severity: "high" },
    ], [linkedAccounts]);

    return (
        <Card title="Gemini Advanced Insights Engine" className="bg-gray-800/90 border-purple-600/50">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Panel: Proactive Insights */}
                <div className="lg:col-span-2 space-y-4">
                    <Card title="Proactive Intelligence Feed" className="bg-gray-900/50">
                        <div className="h-[400px] overflow-y-auto pr-2 space-y-3">
                            {proactiveInsights.map((item, index) => (
                                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                                    item.severity === 'high' ? 'border-red-500 bg-red-500/10' :
                                    item.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                                    'border-cyan-500 bg-cyan-500/10'
                                }`}>
                                    <p className="font-bold text-white">{item.title}</p>
                                    <p className="text-sm text-gray-300">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Panel: Interactive Query */}
                <div className="lg:col-span-3">
                    <Card title="Natural Language Data Interrogation" className="bg-gray-900/50">
                        <p className="text-gray-400 mb-4 text-sm">Engage with your complete financial dataset using natural language. The Gemini model will synthesize information across all connected accounts to provide a holistic response.</p>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Your Query:</label>
                            <textarea
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="e.g., 'Analyze my spending for last month and identify risks' or 'Where can I save more money?'"
                                className="w-full p-3 h-24 bg-gray-700 rounded-md border border-gray-600 text-white resize-none focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                        <button onClick={handleQuerySubmit} disabled={isThinking || !query.trim()} className="mt-4 w-full flex items-center justify-center p-3 rounded-lg text-white font-bold transition bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600">
                            {isThinking ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Thinking...</> : <><Sparkles className="w-5 h-5 mr-2" /> Generate Insight</>}
                        </button>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Generated Insight:</h3>
                            <div className="p-4 min-h-[150px] bg-gray-950 rounded-lg border border-gray-700">
                                {isThinking && <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>}
                                {insight && <p className="text-gray-200 whitespace-pre-wrap">{insight}</p>}
                                {!isThinking && !insight && <p className="text-gray-500 text-center pt-10">Your generated insight will appear here.</p>}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </Card>
    );
};

// --- Main Component ---

const PlaidDashboardView: React.FC = () => {
    const context = useContext(DataContext);
    const [activeModule, setActiveModule] = useState<ActiveViewModule>('HEALTH_STATUS');

    if (!context) {
        throw new Error("PlaidDashboardView must be used within a DataProvider");
    }

    const { linkedAccounts, plaidApiKey, setActiveView } = context;

    const renderModule = () => {
        switch (activeModule) {
            case 'HFT_SIMULATOR': return <HFTStrategyView />;
            case 'RISK_SENTINEL': return <RiskSentinelView />;
            case 'GEMINI_INSIGHTS': return <GeminiInsightsView />;
            // Add other modules here when built
            // case 'ANALYTICS_ENGINE': return <AnalyticsForecastView />;
            // case 'DATA_TOPOLOGY': return <DataTopologyView />;
            case 'HEALTH_STATUS':
            default:
                return <HealthStatusView />;
        }
    };

    if (!plaidApiKey) {
        return (
            <div className="space-y-8 p-6 bg-gray-900 min-h-screen">
                <header className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-widest uppercase">
                        Financial Dashboard: Plaid Integration
                    </h1>
                    <button onClick={() => setActiveView(View.APIIntegration)} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02]">
                        <Settings className="w-5 h-5 mr-2" /> Configure API Key
                    </button>
                </header>
                <Card title="Configuration Required: Plaid API Key" className="border-red-500/50">
                    <div className="text-center p-8 space-y-6">
                        <AlertTriangle className="w-16 h-16 mx-auto text-red-400 animate-pulse" />
                        <p className="text-xl text-gray-300">
                            System Core Uninitialized. API credentials are required to activate data synchronization and enable dashboard modules.
                        </p>
                        <button onClick={() => setActiveView(View.APIIntegration)} className="w-full md:w-auto px-8 py-3 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xl transition duration-300">
                            Proceed to Configuration
                        </button>
                    </div>
                </Card>
                <div className="text-center text-sm text-gray-500 pt-4">Status: OFFLINE. Awaiting credentials for system handshake.</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900 font-sans text-white">
            {/* Sidebar Navigation */}
            <nav className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider">
                        FIN-COMMAND
                    </h1>
                    <p className="text-xs text-gray-500">Plaid Integration Core</p>
                </div>
                <ul className="space-y-2">
                    <ModuleNavItem icon={Activity} label="Health & Status" view="HEALTH_STATUS" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={Cpu} label="HFT Simulator" view="HFT_SIMULATOR" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={ShieldCheck} label="Risk Sentinel" view="RISK_SENTINEL" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={Sparkles} label="Gemini Insights" view="GEMINI_INSIGHTS" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={BarChart3} label="Analytics Engine" view="ANALYTICS_ENGINE" activeModule={activeModule} setActiveModule={setActiveModule} disabled />
                    <ModuleNavItem icon={GitBranch} label="Data Topology" view="DATA_TOPOLOGY" activeModule={activeModule} setActiveModule={setActiveModule} disabled />
                </ul>
                <div className="mt-auto">
                    <button onClick={() => setActiveView(View.APIIntegration)} className="w-full flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition duration-300 text-sm">
                        <Settings className="w-4 h-4 mr-2" /> Manage Integration
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {renderModule()}
                <footer className="text-center text-xs text-gray-600 pt-6 mt-6 border-t border-gray-800">
                    Financial Command Center | Version 2.0 | All Systems Operational
                </footer>
            </main>
        </div>
    );
};

const ModuleNavItem: React.FC<{ icon: React.ElementType, label: string, view: ActiveViewModule, activeModule: ActiveViewModule, setActiveModule: (view: ActiveViewModule) => void, disabled?: boolean }> = ({ icon: Icon, label, view, activeModule, setActiveModule, disabled }) => {
    const isActive = activeModule === view;
    return (
        <li>
            <button
                onClick={() => !disabled && setActiveModule(view)}
                disabled={disabled}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition duration-200 ${isActive ? 'bg-cyan-600/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{label}</span>
                {disabled && <span className="text-xs ml-auto text-gray-500">(Soon)</span>}
            </button>
        </li>
    );
};

const HealthStatusView: React.FC = () => {
    const { linkedAccounts, userProfile } = useContext(DataContext)!;
    const [chatOpen, setChatOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("Hello. I am the Dashboard Assistant. How can I help?");
    const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const healthScore = useMemo(() => calculateHealthScore(linkedAccounts), [linkedAccounts]);
    const itemsInError = useMemo(() => linkedAccounts.filter(acc => Math.random() > 0.95).length, [linkedAccounts]);
    const successfulSyncs = useMemo(() => linkedAccounts.length * 25 + Math.floor(Math.random() * 100), [linkedAccounts]);
    const summary = useMemo(() => generateSummary(healthScore, itemsInError), [healthScore, itemsInError]);

    useEffect(() => {
        // Cleanup interval on component unmount
        return () => {
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
            }
        };
    }, []);

    const handleQuery = useCallback(() => {
        if (!query.trim()) return;

        // Clear any existing stream
        if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
        }
        
        // System instruction influences the response tone and content
        const systemInstruction = "You are a helpful, slightly formal, AI Dashboard Assistant. You provide concise and data-driven answers.";

        let fullResponse = "";
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes("error")) {
            fullResponse = `Analyzing error logs... There are currently ${itemsInError} items flagged with potential errors. It is recommended to run diagnostics on accounts that have not been re-authenticated in the last 90 days for optimal performance.`;
        } else if (lowerQuery.includes("health")) {
            fullResponse = `The current aggregate System Health Score is ${healthScore.toFixed(2)}%. This indicates a high degree of operational stability and data integrity across all connected endpoints.`;
        } else if (lowerQuery.includes("sync")) {
            fullResponse = `Reviewing synchronization telemetry... Total successful data synchronizations in the last 24-hour cycle are within 99.7% of expected parameters. Average data latency is currently 215ms.`;
        } else if (lowerQuery.includes("user")) {
            fullResponse = `Accessing user profile... The profile for ${userProfile?.name || 'N/A'} is associated with ${linkedAccounts.length} active data source connections. All permissions are correctly configured.`;
        } else {
            fullResponse = "I have analyzed the system telemetry. To provide a more detailed analysis, please specify if you're interested in connection health, error rates, or synchronization performance.";
        }

        setResponse("..."); // Indicate thinking
        setQuery(""); // Clear input

        setTimeout(() => { // Simulate initial network latency
            const words = fullResponse.split(' ');
            let currentWordIndex = 0;
            streamIntervalRef.current = setInterval(() => {
                if (currentWordIndex < words.length) {
                    setResponse(words.slice(0, currentWordIndex + 1).join(' '));
                    currentWordIndex++;
                } else {
                    if (streamIntervalRef.current) {
                        clearInterval(streamIntervalRef.current);
                        streamIntervalRef.current = null;
                    }
                }
            }, 50); // Stream one word every 50ms
        }, 300);

    }, [query, itemsInError, healthScore, linkedAccounts.length, userProfile]);

    return (
        <div className="space-y-6">
            <Card title="System Health Status" className="border-l-4 border-cyan-500 bg-gray-800/70">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Brain className="w-10 h-10 text-cyan-400 flex-shrink-0" />
                        <div>
                            <p className="text-lg font-medium text-white">System Score:</p>
                            <p className="text-4xl font-extrabold text-cyan-300">{healthScore.toFixed(2)}%</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-8 max-w-xl">
                        <p className="text-sm italic text-gray-300 border-l-2 border-gray-600 pl-3">
                            <span className="font-bold text-cyan-400">System Note:</span> {summary}
                        </p>
                    </div>
                    <button onClick={() => setChatOpen(!chatOpen)} className={`mt-4 md:mt-0 px-4 py-2 rounded-full text-sm font-semibold transition duration-300 flex items-center ${chatOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white`}>
                        <MessageSquareText className="w-4 h-4 mr-2" /> {chatOpen ? 'Close Assistant' : 'Open Assistant'}
                    </button>
                </div>
            </Card>

            {chatOpen && (
                <Card title="AI Assistant Interface" className="bg-gray-800/90 border-cyan-600/50">
                    <div className="h-64 overflow-y-auto p-3 mb-3 bg-gray-900 rounded-lg border border-gray-700 space-y-3">
                        <div className="flex justify-start">
                            <div className="bg-gray-700 p-3 rounded-lg max-w-[80%] shadow-md">
                                <p className="text-xs font-bold text-cyan-400 mb-1">Assistant</p>
                                <p className="text-sm text-white">{response}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleQuery()} placeholder="Ask about connection stability, errors, or metrics..." className="flex-grow p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" />
                        <button onClick={handleQuery} disabled={!query.trim()} className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:bg-gray-600 transition duration-200 flex items-center"><Zap className="w-5 h-5" /></button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Connection Resilience" className="shadow-xl border-b-4 border-green-500"><ShieldCheck className="w-8 h-8 text-green-400 mb-2" /><p className="text-5xl font-extrabold text-white my-1">{healthScore.toFixed(1)}%</p><p className="text-sm text-gray-400">Estimated Stability</p></Card>
                <Card title="Active Errors" className="shadow-xl border-b-4 border-red-500"><AlertTriangle className="w-8 h-8 text-red-400 mb-2" /><p className={`text-5xl font-extrabold my-1 ${itemsInError > 0 ? 'text-red-400' : 'text-white'}`}>{itemsInError}</p><p className="text-sm text-gray-400">Attention Required</p></Card>
                <Card title="Total Syncs (24h)" className="shadow-xl border-b-4 border-cyan-500"><TrendingUp className="w-8 h-8 text-cyan-400 mb-2" /><p className="text-5xl font-extrabold text-white my-1">{successfulSyncs.toLocaleString()}</p><p className="text-sm text-gray-400">Daily Sync Operations</p></Card>
                <Card title="Institutions Monitored" className="shadow-xl border-b-4 border-indigo-500"><Database className="w-8 h-8 text-indigo-400 mb-2" /><p className="text-5xl font-extrabold text-white my-1">{linkedAccounts.length}</p><p className="text-sm text-gray-400">Connected Data Sources</p></Card>
            </div>

            <Card title={`Connected Financial Institutions (${linkedAccounts.length})`} className="bg-gray-800/70">
                {linkedAccounts.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {linkedAccounts.map(account => {
                            const isError = Math.random() > 0.95;
                            const statusColor = isError ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300';
                            return (
                                <div key={account.id} className="p-4 bg-gray-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg hover:bg-gray-700/70 transition duration-200 border border-gray-700">
                                    <div className="flex-grow mb-2 md:mb-0">
                                        <p className="font-bold text-lg text-white">{account.name}</p>
                                        <p className="text-sm text-gray-400">Type: {account.type?.toUpperCase() || 'UNKNOWN'} | ID: {account.id.substring(0, 8)}...{account.mask && <span className="ml-4">Masked: ****{account.mask}</span>}</p>
                                    </div>
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{isError ? 'Error' : 'Operational'}</span>
                                        <button className="text-cyan-400 hover:text-cyan-300 text-sm">Details &rarr;</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-800 rounded-lg border border-dashed border-gray-700">
                        <Zap className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-500 text-lg">No active Plaid connections. Please configure in settings.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PlaidDashboardView;

// --- CONSOLIDATED FROM: PlaidDashboardView (1).tsx ---


import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, LinkedAccount } from '../types';
import {
    Brain, Zap, ShieldCheck, AlertTriangle, TrendingUp, Settings, Loader2, MessageSquareText,
    Activity, FileText, Bot, GitBranch, DollarSign, BarChart3, Cpu, Database, Network, SlidersHorizontal, Play, Pause, Repeat, Sparkles
} from 'lucide-react';

// --- Advanced Utility Functions (Simulated) ---

const calculateHealthScore = (accounts: LinkedAccount[]): number => {
    if (accounts.length === 0) return 0;
    let score = 100.0;
    let penalty = 0;
    accounts.forEach(account => {
        const isStale = Math.random() > 0.90;
        const hasRecentError = Math.random() > 0.98;
        if (isStale) penalty += 5;
        if (hasRecentError) penalty += 15;
        if (account.type === 'depository' && Math.random() > 0.7) penalty -= 1;
    });
    score = Math.max(0, 100 - penalty);
    return parseFloat(score.toFixed(2));
};

const generateSummary = (score: number, errorCount: number): string => {
    if (errorCount > 5) return "CRITICAL ALERT: Multiple connections require immediate manual intervention. System stability is at risk.";
    if (score < 70) return "Performance Degradation: System integrity is compromised. Proactive re-authentication is strongly recommended.";
    if (score > 95) return "Optimal Performance: All data endpoints are stable and responding within nominal parameters.";
    return "Stable Operation: Data synchronization is proceeding as expected. Minor fluctuations detected.";
};

// --- Type Definitions for Sub-Modules ---
type HFTStrategy = 'Arbitrage' | 'Market Making' | 'Momentum';
type Trade = { id: string; symbol: string; side: 'BUY' | 'SELL'; price: number; quantity: number; timestamp: number; pnl: number };
type ActiveViewModule = 'HEALTH_STATUS' | 'HFT_SIMULATOR' | 'RISK_SENTINEL' | 'GEMINI_INSIGHTS' | 'ANALYTICS_ENGINE' | 'DATA_TOPOLOGY';

// --- Sub-Components (Self-Contained Apps) ---

const HFTStrategyView: React.FC = () => {
    const [strategy, setStrategy] = useState<HFTStrategy>('Momentum');
    const [isRunning, setIsRunning] = useState(false);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [pnl, setPnl] = useState(0);

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            const newTrade: Trade = {
                id: `T${Date.now()}${Math.random()}`,
                symbol: ['BTC/USD', 'ETH/USD', 'AAPL', 'TSLA'][Math.floor(Math.random() * 4)],
                side: Math.random() > 0.5 ? 'BUY' : 'SELL',
                price: 100 + Math.random() * 5000,
                quantity: Math.random() * 10,
                timestamp: Date.now(),
                pnl: (Math.random() - 0.48) * 100,
            };
            setTrades(prev => [newTrade, ...prev.slice(0, 99)]);
            setPnl(prev => prev + newTrade.pnl);
        }, 250); // High frequency simulation
        return () => clearInterval(interval);
    }, [isRunning]);

    return (
        <Card title="High-Frequency Trading (HFT) Simulator" className="bg-gray-800/90 border-indigo-600/50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <Card title="Strategy Configuration" className="bg-gray-900/50">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-300">Select Strategy</label>
                            <select value={strategy} onChange={e => setStrategy(e.target.value as HFTStrategy)} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white">
                                <option>Arbitrage</option>
                                <option>Market Making</option>
                                <option>Momentum</option>
                            </select>
                        </div>
                        <div className="mt-4 space-y-3">
                            <label className="block text-sm font-medium text-gray-300">Risk Limit ($)</label>
                            <input type="number" defaultValue={10000} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white" />
                        </div>
                        <div className="mt-4 space-y-3">
                            <label className="block text-sm font-medium text-gray-300">Execution Speed (ms)</label>
                            <input type="number" defaultValue={5} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white" />
                        </div>
                        <div className="mt-6 flex space-x-2">
                            <button onClick={() => setIsRunning(!isRunning)} className={`w-full flex items-center justify-center p-3 rounded-lg text-white font-bold transition ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                {isRunning ? <><Pause className="w-5 h-5 mr-2" /> Stop Engine</> : <><Play className="w-5 h-5 mr-2" /> Start Engine</>}
                            </button>
                            <button onClick={() => { setTrades([]); setPnl(0); }} className="p-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"><Repeat className="w-5 h-5" /></button>
                        </div>
                    </Card>
                    <Card title="Performance" className="bg-gray-900/50">
                        <p className="text-sm text-gray-400">Realized P&L</p>
                        <p className={`text-4xl font-mono font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </p>
                        <p className="text-sm text-gray-400 mt-4">Trades Executed</p>
                        <p className="text-3xl font-mono font-bold text-white">{trades.length}</p>
                    </Card>
                </div>
                {/* Trade Log */}
                <div className="lg:col-span-2">
                    <Card title="Live Trade Execution Log" className="bg-gray-900/50 h-[600px] flex flex-col">
                        <div className="grid grid-cols-5 gap-2 text-xs font-bold text-gray-400 border-b border-gray-700 pb-2 mb-2 px-2">
                            <span>Timestamp</span><span>Symbol</span><span>Side</span><span className="text-right">Price</span><span className="text-right">P&L</span>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2 font-mono text-sm space-y-1">
                            {trades.map(trade => (
                                <div key={trade.id} className={`grid grid-cols-5 gap-2 p-1.5 rounded ${trade.side === 'BUY' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                    <span className="text-gray-500">{new Date(trade.timestamp).toLocaleTimeString('en-US', { hour12: false })}.{String(trade.timestamp % 1000).padStart(3, '0')}</span>
                                    <span className="text-white font-semibold">{trade.symbol}</span>
                                    <span className={trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>{trade.side}</span>
                                    <span className="text-right text-white">{trade.price.toFixed(2)}</span>
                                    <span className={`text-right font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{trade.pnl.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </Card>
    );
};

const RiskSentinelView: React.FC = () => {
    const [reportType, setReportType] = useState('AML_Screening');
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportUrl, setReportUrl] = useState<string | null>(null);

    const handleGenerateReport = useCallback(() => {
        setIsGenerating(true);
        setReportUrl(null);
        setTimeout(() => {
            setReportUrl(`/reports/generated/${reportType}_${Date.now()}.pdf`);
            setIsGenerating(false);
        }, 2500);
    }, [reportType]);

    return (
        <Card title="Risk & Compliance Sentinel" className="bg-gray-800/90 border-red-600/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Report Generation */}
                <Card title="Compliance Report Generation" className="bg-gray-900/50">
                    <div className="space-y-4">
                        <p className="text-gray-300">Generate on-demand compliance reports based on real-time transactional data.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Report Type</label>
                            <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white">
                                <option value="AML_Screening">AML Screening Report</option>
                                <option value="SAR_Filing">Suspicious Activity Report (SAR)</option>
                                <option value="KYC_Verification">KYC Verification Summary</option>
                            </select>
                        </div>
                        <button onClick={handleGenerateReport} disabled={isGenerating} className="w-full flex items-center justify-center p-3 rounded-lg text-white font-bold transition bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600">
                            {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : <><FileText className="w-5 h-5 mr-2" /> Generate Report</>}
                        </button>
                        {reportUrl && (
                            <div className="mt-4 p-3 bg-green-900/50 border border-green-500 rounded-lg text-center">
                                <p className="text-green-300">Report generated successfully.</p>
                                <a href={reportUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline text-sm">Download Report</a>
                            </div>
                        )}
                    </div>
                </Card>
                {/* Live Anomaly Feed */}
                <Card title="Live Anomaly Detection Feed" className="bg-gray-900/50">
                    <div className="h-80 overflow-y-auto pr-2 space-y-3">
                        {[...Array(15)].map((_, i) => (
                            <div key={i} className="flex items-start space-x-3 p-2 bg-gray-800/70 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {['High-value transfer', 'Unusual Geo-location', 'Rapid Movement of Funds'][i % 3]}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Account ****{1000 + i * 17} | Risk Score: {75 + (i % 25)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </Card>
    );
};

const GeminiInsightsView: React.FC = () => {
    const { linkedAccounts } = useContext(DataContext)!;
    const [query, setQuery] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [insight, setInsight] = useState<string | null>(null);

    const handleQuerySubmit = useCallback(() => {
        if (!query.trim()) return;
        setIsThinking(true);
        setInsight(null);
        const thinkingTime = 1500 + Math.random() * 2000;
        setTimeout(() => {
            let generatedInsight = `Based on the query "${query}" and analysis of ${linkedAccounts.length} data sources, a multi-modal projection suggests a 15% increase in discretionary spending potential for the next fiscal quarter. Key indicators include reduced debt servicing costs and a positive shift in investment account momentum.`;
            if (query.toLowerCase().includes('risk')) {
                generatedInsight = `Risk analysis indicates a potential concentration risk in the technology sector, representing 68% of the total investment portfolio. Diversification into consumer staples or healthcare is recommended to mitigate volatility. The system has flagged two transactions from a high-risk jurisdiction for further review.`;
            } else if (query.toLowerCase().includes('save')) {
                generatedInsight = `To optimize savings, the model suggests consolidating the balances from accounts ****${linkedAccounts[0]?.mask || '1234'} and ****${linkedAccounts[1]?.mask || '5678'} into a high-yield savings vehicle. This action could potentially increase annual returns by approximately $${(Math.random() * 500 + 200).toFixed(2)}.`;
            }
            setInsight(generatedInsight);
            setIsThinking(false);
        }, thinkingTime);
    }, [query, linkedAccounts]);

    const proactiveInsights = useMemo(() => [
        { title: "Cash Flow Optimization", text: "Unusually high balance in a low-yield checking account. Consider moving funds to a higher-yield instrument.", severity: "low" },
        { title: "Subscription Anomaly", text: "A duplicate subscription charge for 'StreamFlix' was detected across two different cards.", severity: "medium" },
        { title: "Investment Opportunity", text: "Market volatility in the energy sector presents a potential buying opportunity aligned with your stated risk profile.", severity: "low" },
        { title: "Credit Utilization Alert", text: `Credit card ending in ****${linkedAccounts[2]?.mask || '9012'} has a utilization rate of 85%, which may impact credit score.`, severity: "high" },
    ], [linkedAccounts]);

    return (
        <Card title="Gemini Advanced Insights Engine" className="bg-gray-800/90 border-purple-600/50">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Panel: Proactive Insights */}
                <div className="lg:col-span-2 space-y-4">
                    <Card title="Proactive Intelligence Feed" className="bg-gray-900/50">
                        <div className="h-[400px] overflow-y-auto pr-2 space-y-3">
                            {proactiveInsights.map((item, index) => (
                                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                                    item.severity === 'high' ? 'border-red-500 bg-red-500/10' :
                                    item.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                                    'border-cyan-500 bg-cyan-500/10'
                                }`}>
                                    <p className="font-bold text-white">{item.title}</p>
                                    <p className="text-sm text-gray-300">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Panel: Interactive Query */}
                <div className="lg:col-span-3">
                    <Card title="Natural Language Data Interrogation" className="bg-gray-900/50">
                        <p className="text-gray-400 mb-4 text-sm">Engage with your complete financial dataset using natural language. The Gemini model will synthesize information across all connected accounts to provide a holistic response.</p>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Your Query:</label>
                            <textarea
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="e.g., 'Analyze my spending for last month and identify risks' or 'Where can I save more money?'"
                                className="w-full p-3 h-24 bg-gray-700 rounded-md border border-gray-600 text-white resize-none focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                        <button onClick={handleQuerySubmit} disabled={isThinking || !query.trim()} className="mt-4 w-full flex items-center justify-center p-3 rounded-lg text-white font-bold transition bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600">
                            {isThinking ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Thinking...</> : <><Sparkles className="w-5 h-5 mr-2" /> Generate Insight</>}
                        </button>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Generated Insight:</h3>
                            <div className="p-4 min-h-[150px] bg-gray-950 rounded-lg border border-gray-700">
                                {isThinking && <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>}
                                {insight && <p className="text-gray-200 whitespace-pre-wrap">{insight}</p>}
                                {!isThinking && !insight && <p className="text-gray-500 text-center pt-10">Your generated insight will appear here.</p>}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </Card>
    );
};

// --- Main Component ---

const PlaidDashboardView: React.FC = () => {
    const context = useContext(DataContext);
    const [activeModule, setActiveModule] = useState<ActiveViewModule>('HEALTH_STATUS');

    if (!context) {
        throw new Error("PlaidDashboardView must be used within a DataProvider");
    }

    const { linkedAccounts, plaidApiKey, setActiveView } = context;

    const renderModule = () => {
        switch (activeModule) {
            case 'HFT_SIMULATOR': return <HFTStrategyView />;
            case 'RISK_SENTINEL': return <RiskSentinelView />;
            case 'GEMINI_INSIGHTS': return <GeminiInsightsView />;
            // Add other modules here when built
            // case 'ANALYTICS_ENGINE': return <AnalyticsForecastView />;
            // case 'DATA_TOPOLOGY': return <DataTopologyView />;
            case 'HEALTH_STATUS':
            default:
                return <HealthStatusView />;
        }
    };

    if (!plaidApiKey) {
        return (
            <div className="space-y-8 p-6 bg-gray-900 min-h-screen">
                <header className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-widest uppercase">
                        Financial Dashboard: Plaid Integration
                    </h1>
                    <button onClick={() => setActiveView(View.APIIntegration)} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02]">
                        <Settings className="w-5 h-5 mr-2" /> Configure API Key
                    </button>
                </header>
                <Card title="Configuration Required: Plaid API Key" className="border-red-500/50">
                    <div className="text-center p-8 space-y-6">
                        <AlertTriangle className="w-16 h-16 mx-auto text-red-400 animate-pulse" />
                        <p className="text-xl text-gray-300">
                            System Core Uninitialized. API credentials are required to activate data synchronization and enable dashboard modules.
                        </p>
                        <button onClick={() => setActiveView(View.APIIntegration)} className="w-full md:w-auto px-8 py-3 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xl transition duration-300">
                            Proceed to Configuration
                        </button>
                    </div>
                </Card>
                <div className="text-center text-sm text-gray-500 pt-4">Status: OFFLINE. Awaiting credentials for system handshake.</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900 font-sans text-white">
            {/* Sidebar Navigation */}
            <nav className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider">
                        FIN-COMMAND
                    </h1>
                    <p className="text-xs text-gray-500">Plaid Integration Core</p>
                </div>
                <ul className="space-y-2">
                    <ModuleNavItem icon={Activity} label="Health & Status" view="HEALTH_STATUS" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={Cpu} label="HFT Simulator" view="HFT_SIMULATOR" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={ShieldCheck} label="Risk Sentinel" view="RISK_SENTINEL" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={Sparkles} label="Gemini Insights" view="GEMINI_INSIGHTS" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={BarChart3} label="Analytics Engine" view="ANALYTICS_ENGINE" activeModule={activeModule} setActiveModule={setActiveModule} disabled />
                    <ModuleNavItem icon={GitBranch} label="Data Topology" view="DATA_TOPOLOGY" activeModule={activeModule} setActiveModule={setActiveModule} disabled />
                </ul>
                <div className="mt-auto">
                    <button onClick={() => setActiveView(View.APIIntegration)} className="w-full flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition duration-300 text-sm">
                        <Settings className="w-4 h-4 mr-2" /> Manage Integration
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {renderModule()}
                <footer className="text-center text-xs text-gray-600 pt-6 mt-6 border-t border-gray-800">
                    Financial Command Center | Version 2.0 | All Systems Operational
                </footer>
            </main>
        </div>
    );
};

const ModuleNavItem: React.FC<{ icon: React.ElementType, label: string, view: ActiveViewModule, activeModule: ActiveViewModule, setActiveModule: (view: ActiveViewModule) => void, disabled?: boolean }> = ({ icon: Icon, label, view, activeModule, setActiveModule, disabled }) => {
    const isActive = activeModule === view;
    return (
        <li>
            <button
                onClick={() => !disabled && setActiveModule(view)}
                disabled={disabled}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition duration-200 ${isActive ? 'bg-cyan-600/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{label}</span>
                {disabled && <span className="text-xs ml-auto text-gray-500">(Soon)</span>}
            </button>
        </li>
    );
};

const HealthStatusView: React.FC = () => {
    const { linkedAccounts, userProfile } = useContext(DataContext)!;
    const [chatOpen, setChatOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("Hello. I am the Dashboard Assistant. How can I help?");
    const streamIntervalRef = useRef<any>(null);

    const healthScore = useMemo(() => calculateHealthScore(linkedAccounts), [linkedAccounts]);
    const itemsInError = useMemo(() => linkedAccounts.filter(acc => Math.random() > 0.95).length, [linkedAccounts]);
    const successfulSyncs = useMemo(() => linkedAccounts.length * 25 + Math.floor(Math.random() * 100), [linkedAccounts]);
    const summary = useMemo(() => generateSummary(healthScore, itemsInError), [healthScore, itemsInError]);

    useEffect(() => {
        // Cleanup interval on component unmount
        return () => {
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
            }
        };
    }, []);

    const handleQuery = useCallback(() => {
        if (!query.trim()) return;

        // Clear any existing stream
        if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
        }
        
        // System instruction influences the response tone and content
        const systemInstruction = "You are a helpful, slightly formal, AI Dashboard Assistant. You provide concise and data-driven answers.";

        let fullResponse = "";
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes("error")) {
            fullResponse = `Analyzing error logs... There are currently ${itemsInError} items flagged with potential errors. It is recommended to run diagnostics on accounts that have not been re-authenticated in the last 90 days for optimal performance.`;
        } else if (lowerQuery.includes("health")) {
            fullResponse = `The current aggregate System Health Score is ${healthScore.toFixed(2)}%. This indicates a high degree of operational stability and data integrity across all connected endpoints.`;
        } else if (lowerQuery.includes("sync")) {
            fullResponse = `Reviewing synchronization telemetry... Total successful data synchronizations in the last 24-hour cycle are within 99.7% of expected parameters. Average data latency is currently 215ms.`;
        } else if (lowerQuery.includes("user")) {
            fullResponse = `Accessing user profile... The profile for ${userProfile?.name || 'N/A'} is associated with ${linkedAccounts.length} active data source connections. All permissions are correctly configured.`;
        } else {
            fullResponse = "I have analyzed the system telemetry. To provide a more detailed analysis, please specify if you're interested in connection health, error rates, or synchronization performance.";
        }

        setResponse("..."); // Indicate thinking
        setQuery(""); // Clear input

        setTimeout(() => { // Simulate initial network latency
            const words = fullResponse.split(' ');
            let currentWordIndex = 0;
            streamIntervalRef.current = setInterval(() => {
                if (currentWordIndex < words.length) {
                    setResponse(words.slice(0, currentWordIndex + 1).join(' '));
                    currentWordIndex++;
                } else {
                    if (streamIntervalRef.current) {
                        clearInterval(streamIntervalRef.current);
                        streamIntervalRef.current = null;
                    }
                }
            }, 50); // Stream one word every 50ms
        }, 300);

    }, [query, itemsInError, healthScore, linkedAccounts.length, userProfile]);

    return (
        <div className="space-y-6">
            <Card title="System Health Status" className="border-l-4 border-cyan-500 bg-gray-800/70">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Brain className="w-10 h-10 text-cyan-400 flex-shrink-0" />
                        <div>
                            <p className="text-lg font-medium text-white">System Score:</p>
                            <p className="text-4xl font-extrabold text-cyan-300">{healthScore.toFixed(2)}%</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-8 max-w-xl">
                        <p className="text-sm italic text-gray-300 border-l-2 border-gray-600 pl-3">
                            <span className="font-bold text-cyan-400">System Note:</span> {summary}
                        </p>
                    </div>
                    <button onClick={() => setChatOpen(!chatOpen)} className={`mt-4 md:mt-0 px-4 py-2 rounded-full text-sm font-semibold transition duration-300 flex items-center ${chatOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white`}>
                        <MessageSquareText className="w-4 h-4 mr-2" /> {chatOpen ? 'Close Assistant' : 'Open Assistant'}
                    </button>
                </div>
            </Card>

            {chatOpen && (
                <Card title="AI Assistant Interface" className="bg-gray-800/90 border-cyan-600/50">
                    <div className="h-64 overflow-y-auto p-3 mb-3 bg-gray-900 rounded-lg border border-gray-700 space-y-3">
                        <div className="flex justify-start">
                            <div className="bg-gray-700 p-3 rounded-lg max-w-[80%] shadow-md">
                                <p className="text-xs font-bold text-cyan-400 mb-1">Assistant</p>
                                <p className="text-sm text-white">{response}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleQuery()} placeholder="Ask about connection stability, errors, or metrics..." className="flex-grow p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" />
                        <button onClick={handleQuery} disabled={!query.trim()} className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:bg-gray-600 transition duration-200 flex items-center"><Zap className="w-5 h-5" /></button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Connection Resilience" className="shadow-xl border-b-4 border-green-500"><ShieldCheck className="w-8 h-8 text-green-400 mb-2" /><p className="text-5xl font-extrabold text-white my-1">{healthScore.toFixed(1)}%</p><p className="text-sm text-gray-400">Estimated Stability</p></Card>
                <Card title="Active Errors" className="shadow-xl border-b-4 border-red-500"><AlertTriangle className="w-8 h-8 text-red-400 mb-2" /><p className={`text-5xl font-extrabold my-1 ${itemsInError > 0 ? 'text-red-400' : 'text-white'}`}>{itemsInError}</p><p className="text-sm text-gray-400">Attention Required</p></Card>
                <Card title="Total Syncs (24h)" className="shadow-xl border-b-4 border-cyan-500"><TrendingUp className="w-8 h-8 text-cyan-400 mb-2" /><p className="text-5xl font-extrabold text-white my-1">{successfulSyncs.toLocaleString()}</p><p className="text-sm text-gray-400">Daily Sync Operations</p></Card>
                <Card title="Institutions Monitored" className="shadow-xl border-b-4 border-indigo-500"><Database className="w-8 h-8 text-indigo-400 mb-2" /><p className="text-5xl font-extrabold text-white my-1">{linkedAccounts.length}</p><p className="text-sm text-gray-400">Connected Data Sources</p></Card>
            </div>

            <Card title={`Connected Financial Institutions (${linkedAccounts.length})`} className="bg-gray-800/70">
                {linkedAccounts.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {linkedAccounts.map(account => {
                            const isError = Math.random() > 0.95;
                            const statusColor = isError ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300';
                            return (
                                <div key={account.id} className="p-4 bg-gray-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg hover:bg-gray-700/70 transition duration-200 border border-gray-700">
                                    <div className="flex-grow mb-2 md:mb-0">
                                        <p className="font-bold text-lg text-white">{account.name}</p>
                                        <p className="text-sm text-gray-400">Type: {account.type?.toUpperCase() || 'UNKNOWN'} | ID: {account.id.substring(0, 8)}...{account.mask && <span className="ml-4">Masked: ****{account.mask}</span>}</p>
                                    </div>
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{isError ? 'Error' : 'Operational'}</span>
                                        <button className="text-cyan-400 hover:text-cyan-300 text-sm">Details &rarr;</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-800 rounded-lg border border-dashed border-gray-700">
                        <Zap className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-500 text-lg">No active Plaid connections. Please configure in settings.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PlaidDashboardView;


// --- CONSOLIDATED FROM: PlaidDashboardView (1)_1.tsx ---


import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, LinkedAccount } from '../types';
import {
    Brain, Zap, ShieldCheck, AlertTriangle, TrendingUp, Settings, Loader2, MessageSquareText,
    Activity, FileText, Bot, GitBranch, DollarSign, BarChart3, Cpu, Database, Network, SlidersHorizontal, Play, Pause, Repeat, Sparkles
} from 'lucide-react';

// --- Advanced Utility Functions (Simulated) ---

const calculateHealthScore = (accounts: LinkedAccount[]): number => {
    if (accounts.length === 0) return 0;
    let score = 100.0;
    let penalty = 0;
    accounts.forEach(account => {
        const isStale = Math.random() > 0.90;
        const hasRecentError = Math.random() > 0.98;
        if (isStale) penalty += 5;
        if (hasRecentError) penalty += 15;
        if (account.type === 'depository' && Math.random() > 0.7) penalty -= 1;
    });
    score = Math.max(0, 100 - penalty);
    return parseFloat(score.toFixed(2));
};

const generateSummary = (score: number, errorCount: number): string => {
    if (errorCount > 5) return "CRITICAL ALERT: Multiple connections require immediate manual intervention. System stability is at risk.";
    if (score < 70) return "Performance Degradation: System integrity is compromised. Proactive re-authentication is strongly recommended.";
    if (score > 95) return "Optimal Performance: All data endpoints are stable and responding within nominal parameters.";
    return "Stable Operation: Data synchronization is proceeding as expected. Minor fluctuations detected.";
};

// --- Type Definitions for Sub-Modules ---
type HFTStrategy = 'Arbitrage' | 'Market Making' | 'Momentum';
type Trade = { id: string; symbol: string; side: 'BUY' | 'SELL'; price: number; quantity: number; timestamp: number; pnl: number };
type ActiveViewModule = 'HEALTH_STATUS' | 'HFT_SIMULATOR' | 'RISK_SENTINEL' | 'GEMINI_INSIGHTS' | 'ANALYTICS_ENGINE' | 'DATA_TOPOLOGY';

// --- Sub-Components (Self-Contained Apps) ---

const HFTStrategyView: React.FC = () => {
    const [strategy, setStrategy] = useState<HFTStrategy>('Momentum');
    const [isRunning, setIsRunning] = useState(false);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [pnl, setPnl] = useState(0);

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            const newTrade: Trade = {
                id: `T${Date.now()}${Math.random()}`,
                symbol: ['BTC/USD', 'ETH/USD', 'AAPL', 'TSLA'][Math.floor(Math.random() * 4)],
                side: Math.random() > 0.5 ? 'BUY' : 'SELL',
                price: 100 + Math.random() * 5000,
                quantity: Math.random() * 10,
                timestamp: Date.now(),
                pnl: (Math.random() - 0.48) * 100,
            };
            setTrades(prev => [newTrade, ...prev.slice(0, 99)]);
            setPnl(prev => prev + newTrade.pnl);
        }, 250); // High frequency simulation
        return () => clearInterval(interval);
    }, [isRunning]);

    return (
        <Card title="High-Frequency Trading (HFT) Simulator" className="bg-gray-800/90 border-indigo-600/50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <Card title="Strategy Configuration" className="bg-gray-900/50">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-300">Select Strategy</label>
                            <select value={strategy} onChange={e => setStrategy(e.target.value as HFTStrategy)} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white">
                                <option>Arbitrage</option>
                                <option>Market Making</option>
                                <option>Momentum</option>
                            </select>
                        </div>
                        <div className="mt-4 space-y-3">
                            <label className="block text-sm font-medium text-gray-300">Risk Limit ($)</label>
                            <input type="number" defaultValue={10000} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white" />
                        </div>
                        <div className="mt-4 space-y-3">
                            <label className="block text-sm font-medium text-gray-300">Execution Speed (ms)</label>
                            <input type="number" defaultValue={5} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white" />
                        </div>
                        <div className="mt-6 flex space-x-2">
                            <button onClick={() => setIsRunning(!isRunning)} className={`w-full flex items-center justify-center p-3 rounded-lg text-white font-bold transition ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                {isRunning ? <><Pause className="w-5 h-5 mr-2" /> Stop Engine</> : <><Play className="w-5 h-5 mr-2" /> Start Engine</>}
                            </button>
                            <button onClick={() => { setTrades([]); setPnl(0); }} className="p-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"><Repeat className="w-5 h-5" /></button>
                        </div>
                    </Card>
                    <Card title="Performance" className="bg-gray-900/50">
                        <p className="text-sm text-gray-400">Realized P&L</p>
                        <p className={`text-4xl font-mono font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </p>
                        <p className="text-sm text-gray-400 mt-4">Trades Executed</p>
                        <p className="text-3xl font-mono font-bold text-white">{trades.length}</p>
                    </Card>
                </div>
                {/* Trade Log */}
                <div className="lg:col-span-2">
                    <Card title="Live Trade Execution Log" className="bg-gray-900/50 h-[600px] flex flex-col">
                        <div className="grid grid-cols-5 gap-2 text-xs font-bold text-gray-400 border-b border-gray-700 pb-2 mb-2 px-2">
                            <span>Timestamp</span><span>Symbol</span><span>Side</span><span className="text-right">Price</span><span className="text-right">P&L</span>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2 font-mono text-sm space-y-1">
                            {trades.map(trade => (
                                <div key={trade.id} className={`grid grid-cols-5 gap-2 p-1.5 rounded ${trade.side === 'BUY' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                    <span className="text-gray-500">{new Date(trade.timestamp).toLocaleTimeString('en-US', { hour12: false })}.{String(trade.timestamp % 1000).padStart(3, '0')}</span>
                                    <span className="text-white font-semibold">{trade.symbol}</span>
                                    <span className={trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>{trade.side}</span>
                                    <span className="text-right text-white">{trade.price.toFixed(2)}</span>
                                    <span className={`text-right font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{trade.pnl.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </Card>
    );
};

const RiskSentinelView: React.FC = () => {
    const [reportType, setReportType] = useState('AML_Screening');
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportUrl, setReportUrl] = useState<string | null>(null);

    const handleGenerateReport = useCallback(() => {
        setIsGenerating(true);
        setReportUrl(null);
        setTimeout(() => {
            setReportUrl(`/reports/generated/${reportType}_${Date.now()}.pdf`);
            setIsGenerating(false);
        }, 2500);
    }, [reportType]);

    return (
        <Card title="Risk & Compliance Sentinel" className="bg-gray-800/90 border-red-600/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Report Generation */}
                <Card title="Compliance Report Generation" className="bg-gray-900/50">
                    <div className="space-y-4">
                        <p className="text-gray-300">Generate on-demand compliance reports based on real-time transactional data.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Report Type</label>
                            <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white">
                                <option value="AML_Screening">AML Screening Report</option>
                                <option value="SAR_Filing">Suspicious Activity Report (SAR)</option>
                                <option value="KYC_Verification">KYC Verification Summary</option>
                            </select>
                        </div>
                        <button onClick={handleGenerateReport} disabled={isGenerating} className="w-full flex items-center justify-center p-3 rounded-lg text-white font-bold transition bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600">
                            {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : <><FileText className="w-5 h-5 mr-2" /> Generate Report</>}
                        </button>
                        {reportUrl && (
                            <div className="mt-4 p-3 bg-green-900/50 border border-green-500 rounded-lg text-center">
                                <p className="text-green-300">Report generated successfully.</p>
                                <a href={reportUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline text-sm">Download Report</a>
                            </div>
                        )}
                    </div>
                </Card>
                {/* Live Anomaly Feed */}
                <Card title="Live Anomaly Detection Feed" className="bg-gray-900/50">
                    <div className="h-80 overflow-y-auto pr-2 space-y-3">
                        {[...Array(15)].map((_, i) => (
                            <div key={i} className="flex items-start space-x-3 p-2 bg-gray-800/70 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {['High-value transfer', 'Unusual Geo-location', 'Rapid Movement of Funds'][i % 3]}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Account ****{1000 + i * 17} | Risk Score: {75 + (i % 25)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </Card>
    );
};

const GeminiInsightsView: React.FC = () => {
    const { linkedAccounts } = useContext(DataContext)!;
    const [query, setQuery] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [insight, setInsight] = useState<string | null>(null);

    const handleQuerySubmit = useCallback(() => {
        if (!query.trim()) return;
        setIsThinking(true);
        setInsight(null);
        const thinkingTime = 1500 + Math.random() * 2000;
        setTimeout(() => {
            let generatedInsight = `Based on the query "${query}" and analysis of ${linkedAccounts.length} data sources, a multi-modal projection suggests a 15% increase in discretionary spending potential for the next fiscal quarter. Key indicators include reduced debt servicing costs and a positive shift in investment account momentum.`;
            if (query.toLowerCase().includes('risk')) {
                generatedInsight = `Risk analysis indicates a potential concentration risk in the technology sector, representing 68% of the total investment portfolio. Diversification into consumer staples or healthcare is recommended to mitigate volatility. The system has flagged two transactions from a high-risk jurisdiction for further review.`;
            } else if (query.toLowerCase().includes('save')) {
                generatedInsight = `To optimize savings, the model suggests consolidating the balances from accounts ****${linkedAccounts[0]?.mask || '1234'} and ****${linkedAccounts[1]?.mask || '5678'} into a high-yield savings vehicle. This action could potentially increase annual returns by approximately $${(Math.random() * 500 + 200).toFixed(2)}.`;
            }
            setInsight(generatedInsight);
            setIsThinking(false);
        }, thinkingTime);
    }, [query, linkedAccounts]);

    const proactiveInsights = useMemo(() => [
        { title: "Cash Flow Optimization", text: "Unusually high balance in a low-yield checking account. Consider moving funds to a higher-yield instrument.", severity: "low" },
        { title: "Subscription Anomaly", text: "A duplicate subscription charge for 'StreamFlix' was detected across two different cards.", severity: "medium" },
        { title: "Investment Opportunity", text: "Market volatility in the energy sector presents a potential buying opportunity aligned with your stated risk profile.", severity: "low" },
        { title: "Credit Utilization Alert", text: `Credit card ending in ****${linkedAccounts[2]?.mask || '9012'} has a utilization rate of 85%, which may impact credit score.`, severity: "high" },
    ], [linkedAccounts]);

    return (
        <Card title="Gemini Advanced Insights Engine" className="bg-gray-800/90 border-purple-600/50">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Panel: Proactive Insights */}
                <div className="lg:col-span-2 space-y-4">
                    <Card title="Proactive Intelligence Feed" className="bg-gray-900/50">
                        <div className="h-[400px] overflow-y-auto pr-2 space-y-3">
                            {proactiveInsights.map((item, index) => (
                                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                                    item.severity === 'high' ? 'border-red-500 bg-red-500/10' :
                                    item.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                                    'border-cyan-500 bg-cyan-500/10'
                                }`}>
                                    <p className="font-bold text-white">{item.title}</p>
                                    <p className="text-sm text-gray-300">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Panel: Interactive Query */}
                <div className="lg:col-span-3">
                    <Card title="Natural Language Data Interrogation" className="bg-gray-900/50">
                        <p className="text-gray-400 mb-4 text-sm">Engage with your complete financial dataset using natural language. The Gemini model will synthesize information across all connected accounts to provide a holistic response.</p>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Your Query:</label>
                            <textarea
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="e.g., 'Analyze my spending for last month and identify risks' or 'Where can I save more money?'"
                                className="w-full p-3 h-24 bg-gray-700 rounded-md border border-gray-600 text-white resize-none focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                        <button onClick={handleQuerySubmit} disabled={isThinking || !query.trim()} className="mt-4 w-full flex items-center justify-center p-3 rounded-lg text-white font-bold transition bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600">
                            {isThinking ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Thinking...</> : <><Sparkles className="w-5 h-5 mr-2" /> Generate Insight</>}
                        </button>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Generated Insight:</h3>
                            <div className="p-4 min-h-[150px] bg-gray-950 rounded-lg border border-gray-700">
                                {isThinking && <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>}
                                {insight && <p className="text-gray-200 whitespace-pre-wrap">{insight}</p>}
                                {!isThinking && !insight && <p className="text-gray-500 text-center pt-10">Your generated insight will appear here.</p>}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </Card>
    );
};

// --- Main Component ---

const PlaidDashboardView: React.FC = () => {
    const context = useContext(DataContext);
    const [activeModule, setActiveModule] = useState<ActiveViewModule>('HEALTH_STATUS');

    if (!context) {
        throw new Error("PlaidDashboardView must be used within a DataProvider");
    }

    const { linkedAccounts, plaidApiKey, setActiveView } = context;

    const renderModule = () => {
        switch (activeModule) {
            case 'HFT_SIMULATOR': return <HFTStrategyView />;
            case 'RISK_SENTINEL': return <RiskSentinelView />;
            case 'GEMINI_INSIGHTS': return <GeminiInsightsView />;
            // Add other modules here when built
            // case 'ANALYTICS_ENGINE': return <AnalyticsForecastView />;
            // case 'DATA_TOPOLOGY': return <DataTopologyView />;
            case 'HEALTH_STATUS':
            default:
                return <HealthStatusView />;
        }
    };

    if (!plaidApiKey) {
        return (
            <div className="space-y-8 p-6 bg-gray-900 min-h-screen">
                <header className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-widest uppercase">
                        Financial Dashboard: Plaid Integration
                    </h1>
                    <button onClick={() => setActiveView(View.APIIntegration)} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02]">
                        <Settings className="w-5 h-5 mr-2" /> Configure API Key
                    </button>
                </header>
                <Card title="Configuration Required: Plaid API Key" className="border-red-500/50">
                    <div className="text-center p-8 space-y-6">
                        <AlertTriangle className="w-16 h-16 mx-auto text-red-400 animate-pulse" />
                        <p className="text-xl text-gray-300">
                            System Core Uninitialized. API credentials are required to activate data synchronization and enable dashboard modules.
                        </p>
                        <button onClick={() => setActiveView(View.APIIntegration)} className="w-full md:w-auto px-8 py-3 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xl transition duration-300">
                            Proceed to Configuration
                        </button>
                    </div>
                </Card>
                <div className="text-center text-sm text-gray-500 pt-4">Status: OFFLINE. Awaiting credentials for system handshake.</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900 font-sans text-white">
            {/* Sidebar Navigation */}
            <nav className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider">
                        FIN-COMMAND
                    </h1>
                    <p className="text-xs text-gray-500">Plaid Integration Core</p>
                </div>
                <ul className="space-y-2">
                    <ModuleNavItem icon={Activity} label="Health & Status" view="HEALTH_STATUS" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={Cpu} label="HFT Simulator" view="HFT_SIMULATOR" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={ShieldCheck} label="Risk Sentinel" view="RISK_SENTINEL" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={Sparkles} label="Gemini Insights" view="GEMINI_INSIGHTS" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={BarChart3} label="Analytics Engine" view="ANALYTICS_ENGINE" activeModule={activeModule} setActiveModule={setActiveModule} disabled />
                    <ModuleNavItem icon={GitBranch} label="Data Topology" view="DATA_TOPOLOGY" activeModule={activeModule} setActiveModule={setActiveModule} disabled />
                </ul>
                <div className="mt-auto">
                    <button onClick={() => setActiveView(View.APIIntegration)} className="w-full flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition duration-300 text-sm">
                        <Settings className="w-4 h-4 mr-2" /> Manage Integration
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {renderModule()}
                <footer className="text-center text-xs text-gray-600 pt-6 mt-6 border-t border-gray-800">
                    Financial Command Center | Version 2.0 | All Systems Operational
                </footer>
            </main>
        </div>
    );
};

const ModuleNavItem: React.FC<{ icon: React.ElementType, label: string, view: ActiveViewModule, activeModule: ActiveViewModule, setActiveModule: (view: ActiveViewModule) => void, disabled?: boolean }> = ({ icon: Icon, label, view, activeModule, setActiveModule, disabled }) => {
    const isActive = activeModule === view;
    return (
        <li>
            <button
                onClick={() => !disabled && setActiveModule(view)}
                disabled={disabled}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition duration-200 ${isActive ? 'bg-cyan-600/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{label}</span>
                {disabled && <span className="text-xs ml-auto text-gray-500">(Soon)</span>}
            </button>
        </li>
    );
};

const HealthStatusView: React.FC = () => {
    const { linkedAccounts, userProfile } = useContext(DataContext)!;
    const [chatOpen, setChatOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("Hello. I am the Dashboard Assistant. How can I help?");
    const streamIntervalRef = useRef<any>(null);

    const healthScore = useMemo(() => calculateHealthScore(linkedAccounts), [linkedAccounts]);
    const itemsInError = useMemo(() => linkedAccounts.filter(acc => Math.random() > 0.95).length, [linkedAccounts]);
    const successfulSyncs = useMemo(() => linkedAccounts.length * 25 + Math.floor(Math.random() * 100), [linkedAccounts]);
    const summary = useMemo(() => generateSummary(healthScore, itemsInError), [healthScore, itemsInError]);

    useEffect(() => {
        // Cleanup interval on component unmount
        return () => {
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
            }
        };
    }, []);

    const handleQuery = useCallback(() => {
        if (!query.trim()) return;

        // Clear any existing stream
        if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
        }
        
        // System instruction influences the response tone and content
        const systemInstruction = "You are a helpful, slightly formal, AI Dashboard Assistant. You provide concise and data-driven answers.";

        let fullResponse = "";
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes("error")) {
            fullResponse = `Analyzing error logs... There are currently ${itemsInError} items flagged with potential errors. It is recommended to run diagnostics on accounts that have not been re-authenticated in the last 90 days for optimal performance.`;
        } else if (lowerQuery.includes("health")) {
            fullResponse = `The current aggregate System Health Score is ${healthScore.toFixed(2)}%. This indicates a high degree of operational stability and data integrity across all connected endpoints.`;
        } else if (lowerQuery.includes("sync")) {
            fullResponse = `Reviewing synchronization telemetry... Total successful data synchronizations in the last 24-hour cycle are within 99.7% of expected parameters. Average data latency is currently 215ms.`;
        } else if (lowerQuery.includes("user")) {
            fullResponse = `Accessing user profile... The profile for ${userProfile?.name || 'N/A'} is associated with ${linkedAccounts.length} active data source connections. All permissions are correctly configured.`;
        } else {
            fullResponse = "I have analyzed the system telemetry. To provide a more detailed analysis, please specify if you're interested in connection health, error rates, or synchronization performance.";
        }

        setResponse("..."); // Indicate thinking
        setQuery(""); // Clear input

        setTimeout(() => { // Simulate initial network latency
            const words = fullResponse.split(' ');
            let currentWordIndex = 0;
            streamIntervalRef.current = setInterval(() => {
                if (currentWordIndex < words.length) {
                    setResponse(words.slice(0, currentWordIndex + 1).join(' '));
                    currentWordIndex++;
                } else {
                    if (streamIntervalRef.current) {
                        clearInterval(streamIntervalRef.current);
                        streamIntervalRef.current = null;
                    }
                }
            }, 50); // Stream one word every 50ms
        }, 300);

    }, [query, itemsInError, healthScore, linkedAccounts.length, userProfile]);

    return (
        <div className="space-y-6">
            <Card title="System Health Status" className="border-l-4 border-cyan-500 bg-gray-800/70">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Brain className="w-10 h-10 text-cyan-400 flex-shrink-0" />
                        <div>
                            <p className="text-lg font-medium text-white">System Score:</p>
                            <p className="text-4xl font-extrabold text-cyan-300">{healthScore.toFixed(2)}%</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-8 max-w-xl">
                        <p className="text-sm italic text-gray-300 border-l-2 border-gray-600 pl-3">
                            <span className="font-bold text-cyan-400">System Note:</span> {summary}
                        </p>
                    </div>
                    <button onClick={() => setChatOpen(!chatOpen)} className={`mt-4 md:mt-0 px-4 py-2 rounded-full text-sm font-semibold transition duration-300 flex items-center ${chatOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white`}>
                        <MessageSquareText className="w-4 h-4 mr-2" /> {chatOpen ? 'Close Assistant' : 'Open Assistant'}
                    </button>
                </div>
            </Card>

            {chatOpen && (
                <Card title="AI Assistant Interface" className="bg-gray-800/90 border-cyan-600/50">
                    <div className="h-64 overflow-y-auto p-3 mb-3 bg-gray-900 rounded-lg border border-gray-700 space-y-3">
                        <div className="flex justify-start">
                            <div className="bg-gray-700 p-3 rounded-lg max-w-[80%] shadow-md">
                                <p className="text-xs font-bold text-cyan-400 mb-1">Assistant</p>
                                <p className="text-sm text-white">{response}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleQuery()} placeholder="Ask about connection stability, errors, or metrics..." className="flex-grow p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" />
                        <button onClick={handleQuery} disabled={!query.trim()} className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:bg-gray-600 transition duration-200 flex items-center"><Zap className="w-5 h-5" /></button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Connection Resilience" className="shadow-xl border-b-4 border-green-500"><ShieldCheck className="w-8 h-8 text-green-400 mb-2" /><p className="text-5xl font-extrabold text-white my-1">{healthScore.toFixed(1)}%</p><p className="text-sm text-gray-400">Estimated Stability</p></Card>
                <Card title="Active Errors" className="shadow-xl border-b-4 border-red-500"><AlertTriangle className="w-8 h-8 text-red-400 mb-2" /><p className={`text-5xl font-extrabold my-1 ${itemsInError > 0 ? 'text-red-400' : 'text-white'}`}>{itemsInError}</p><p className="text-sm text-gray-400">Attention Required</p></Card>
                <Card title="Total Syncs (24h)" className="shadow-xl border-b-4 border-cyan-500"><TrendingUp className="w-8 h-8 text-cyan-400 mb-2" /><p className="text-5xl font-extrabold text-white my-1">{successfulSyncs.toLocaleString()}</p><p className="text-sm text-gray-400">Daily Sync Operations</p></Card>
                <Card title="Institutions Monitored" className="shadow-xl border-b-4 border-indigo-500"><Database className="w-8 h-8 text-indigo-400 mb-2" /><p className="text-5xl font-extrabold text-white my-1">{linkedAccounts.length}</p><p className="text-sm text-gray-400">Connected Data Sources</p></Card>
            </div>

            <Card title={`Connected Financial Institutions (${linkedAccounts.length})`} className="bg-gray-800/70">
                {linkedAccounts.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {linkedAccounts.map(account => {
                            const isError = Math.random() > 0.95;
                            const statusColor = isError ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300';
                            return (
                                <div key={account.id} className="p-4 bg-gray-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg hover:bg-gray-700/70 transition duration-200 border border-gray-700">
                                    <div className="flex-grow mb-2 md:mb-0">
                                        <p className="font-bold text-lg text-white">{account.name}</p>
                                        <p className="text-sm text-gray-400">Type: {account.type?.toUpperCase() || 'UNKNOWN'} | ID: {account.id.substring(0, 8)}...{account.mask && <span className="ml-4">Masked: ****{account.mask}</span>}</p>
                                    </div>
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{isError ? 'Error' : 'Operational'}</span>
                                        <button className="text-cyan-400 hover:text-cyan-300 text-sm">Details &rarr;</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-800 rounded-lg border border-dashed border-gray-700">
                        <Zap className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-500 text-lg">No active Plaid connections. Please configure in settings.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PlaidDashboardView;


// --- CONSOLIDATED FROM: ./components/PlaidDashboardView (2).tsx ---



// --- CONSOLIDATED FROM: PlaidDashboardView (2)_1.tsx ---

import React, { useContext, useState, useMemo, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, PlaidAccount } from '../types';
import { Brain, Zap, ShieldCheck, AlertTriangle, TrendingUp, Settings, Loader2, MessageSquareText } from 'lucide-react';

// --- REFACTORING: Replaced deliberately flawed/random utilities with deterministic (mocked) logic ---
// Rationale: The original implementation used Math.random() and static strings for critical metrics and summaries.
// This is being replaced with deterministic, even if mocked, logic to simulate a stable system response.
// In a production environment, these functions would interface with a robust backend service.

/**
 * REPLACEMENT: Provides deterministic (mocked) health metrics for the Plaid dashboard.
 * This replaces the previous `calculateHealthScore`, `generateSummary`, and random error/sync counts.
 * In a real application, these metrics would be fetched from a dedicated Plaid integration service.
 * @param accounts - The list of linked Plaid accounts.
 * @returns Object containing healthScore, itemsInError, successfulSyncs, and summary.
 */
const getDashboardMetrics = (accounts: PlaidAccount[]) => {
    let healthScore = 100;
    let itemsInError = 0;

    accounts.forEach((account, index) => {
        // Simulate specific accounts having issues based on ID for consistent (non-random) mock behavior.
        // E.g., accounts ending in '1' or '5' are in error.
        const hasError = account.id.endsWith('1') || account.id.endsWith('5');
        const isStale = account.id.endsWith('2'); // Simulate stale data for accounts ending in '2'

        if (hasError) {
            itemsInError++;
            healthScore -= 10; // Consistent penalty
        }
        if (isStale) {
            healthScore -= 5; // Consistent penalty for staleness
        }
    });

    healthScore = Math.max(0, parseFloat(healthScore.toFixed(2)));
    // Provide a more stable, non-random successful sync count
    const successfulSyncs = accounts.length * 30 + (accounts.length > 0 ? 50 : 0) + itemsInError * 5;

    let summary = "Operational Status: All endpoints are stable.";
    if (itemsInError > 0) {
        summary = `Warning: ${itemsInError} connections require attention. Review linked institutions below.`;
    } else if (healthScore < 80) {
        summary = "Performance Warning: System integrity is okay, but re-authentication or review is recommended for some connections.";
    }

    return {
        healthScore,
        itemsInError,
        successfulSyncs,
        summary
    };
};

/**
 * REPLACEMENT: Provides deterministic (mocked) status for individual Plaid accounts.
 * This replaces the previous `Math.random() > 0.95` for individual account error states.
 * In a real application, this status would come from a backend service monitoring individual connections.
 * @param accountId - The ID of the Plaid account.
 * @returns Object with isError, statusText, and statusColor.
 */
const getAccountStatus = (accountId: string) => {
    // Use a consistent rule to determine mock error status for display purposes
    const isError = accountId.endsWith('1') || accountId.endsWith('5');
    const statusText = isError ? 'Error' : 'Operational';
    const statusColor = isError ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300';
    return { isError, statusText, statusColor };
};

/**
 * REPLACEMENT: Mocked AI assistant service call.
 * This replaces the original `setTimeout` and static responses, providing a more structured and
 * extensible (even if still mocked) AI interaction.
 * Rationale: Hardening AI modules to include error handling, timeouts, fallbacks, and non-blocking calls.
 * @param query - The user's input query.
 * @param metrics - Current dashboard metrics for contextual responses.
 * @returns A promise resolving to the AI-generated response string.
 */
const askPlaidAssistant = async (query: string, metrics: ReturnType<typeof getDashboardMetrics>, userProfileName: string | undefined, linkedAccountsCount: number): Promise<string> => {
    return new Promise(resolve => {
        // Simulate network latency for a non-blocking AI call
        setTimeout(() => {
            const lowerQuery = query.toLowerCase();
            let res = "I am unable to provide a specific answer. Please refine your query or ask about system health, errors, or synchronizations.";

            if (lowerQuery.includes("error")) {
                res = `There are currently ${metrics.itemsInError} items flagged as needing attention. For details, please check the 'Connected Financial Institutions' section.`;
            } else if (lowerQuery.includes("health")) {
                res = `The current System Health Score is ${metrics.healthScore.toFixed(2)}%. This indicates overall system stability.`;
            } else if (lowerQuery.includes("sync")) {
                res = `Total successful synchronizations today are normal. Your ${linkedAccountsCount} linked institutions are syncing regularly.`;
            } else if (lowerQuery.includes("user")) {
                res = `User profile '${userProfileName || 'N/A'}' has ${linkedAccountsCount} active connections.`;
            } else if (lowerQuery.includes("status")) {
                res = metrics.summary;
            } else if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
                res = "Hello! I am your Dashboard Assistant. How can I assist you with your financial data?";
            }

            resolve(`(AI-Generated) ${res}`);
        }, 1500); // Simulate 1.5 second API response time
    });
};

// --- Component Definition ---

const PlaidDashboardView: React.FC = () => {
    const context = useContext(DataContext);
    const [chatOpen, setChatOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("Hello. I am the Dashboard Assistant. How can I help?");
    const [aiLoading, setAiLoading] = useState(false);
    // REFACTORING: Removed arbitrary input length limit to allow for proper backend validation.
    // Frontend validation should be separate and user-friendly, not just a disabling state.
    // const [queryTooLong, setQueryTooLong] = useState(false);

    if (!context) {
        throw new Error("PlaidDashboardView must be used within a DataProvider");
    }

    const { linkedAccounts, plaidApiKey, setActiveView, userProfile } = context;

    // --- REPLACEMENT: Using deterministic mocked metrics ---
    const { healthScore, itemsInError, successfulSyncs, summary } = useMemo(() =>
        getDashboardMetrics(linkedAccounts),
        [linkedAccounts]
    );

    // --- Handlers ---
    const handleQuery = useCallback(async () => {
        if (!query.trim()) return;

        setAiLoading(true);
        setResponse(`Processing: "${query}"...`);
        const currentQuery = query; // Capture query state
        setQuery(""); // Clear input immediately

        try {
            // REPLACEMENT: Calling the new mocked AI assistant service
            const aiResponse = await askPlaidAssistant(currentQuery, { healthScore, itemsInError, successfulSyncs, summary }, userProfile?.name, linkedAccounts.length);
            setResponse(aiResponse);
        } catch (error) {
            console.error("AI Assistant error:", error);
            setResponse("(AI-Generated) Sorry, I encountered an error. Please try again or ask a different question.");
        } finally {
            setAiLoading(false);
        }
    }, [query, healthScore, itemsInError, successfulSyncs, summary, userProfile?.name, linkedAccounts.length]);

    // --- Configuration View (Gate for Plaid API Key) ---
    if (!plaidApiKey) {
        return (
            <div className="space-y-8 p-6 bg-gray-900 min-h-screen">
                <header className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-widest uppercase">
                        Financial Dashboard: Plaid Integration
                    </h1>
                    <button
                        onClick={() => setActiveView(View.APIIntegration)}
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02]"
                    >
                        <Settings className="w-5 h-5 mr-2" /> Configure API Key
                    </button>
                </header>

                <Card title="Configuration: Plaid API Key" className="border-red-500/50">
                    <div className="text-center p-8 space-y-6">
                        <AlertTriangle className="w-16 h-16 mx-auto text-red-400 animate-pulse" />
                        <p className="text-xl text-gray-300">
                            Access to the Plaid Module is restricted. API credentials are required to sync data.
                        </p>
                        <button
                            onClick={() => setActiveView(View.APIIntegration)}
                            className="w-full md:w-auto px-8 py-3 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xl transition duration-300"
                        >
                            Proceed to Configuration
                        </button>
                    </div>
                </Card>
                <div className="text-center text-sm text-gray-500 pt-4">
                    Status: Pending. Awaiting credentials.
                </div>
            </div>
        );
    }

    // --- Dashboard View ---
    return (
        <div className="space-y-8 p-6 bg-gray-900 min-h-screen font-sans">
            <header className="flex justify-between items-center border-b border-gray-700 pb-4">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-widest uppercase">
                    Financial Data Dashboard
                </h1>
                <button
                    onClick={() => setActiveView(View.APIIntegration)}
                    className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition duration-300"
                >
                    <Settings className="w-4 h-4 mr-2" /> Manage Integration
                </button>
            </header>

            {/* Status Banner */}
            <Card title="System Health Status" className="border-l-4 border-cyan-500 bg-gray-800/70">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Brain className="w-10 h-10 text-cyan-400 flex-shrink-0" />
                        <div>
                            <p className="text-lg font-medium text-white">System Score:</p>
                            <p className="text-4xl font-extrabold text-cyan-300">{healthScore.toFixed(2)}%</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-8 max-w-xl">
                        <p className="text-sm italic text-gray-300 border-l-2 border-gray-600 pl-3">
                            <span className="font-bold text-cyan-400">System Note:</span> {summary}
                        </p>
                    </div>
                    <button
                        onClick={() => setChatOpen(!chatOpen)}
                        className={`mt-4 md:mt-0 px-4 py-2 rounded-full text-sm font-semibold transition duration-300 flex items-center ${chatOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white`}
                    >
                        <MessageSquareText className="w-4 h-4 mr-2" /> {chatOpen ? 'Close Chat' : 'Open Chat'}
                    </button>
                </div>
            </Card>

            {/* Chat Interface */}
            {chatOpen && (
                <Card title="Assistant Interface" className="bg-gray-800/90 border-cyan-600/50">
                    <div className="h-64 overflow-y-auto p-3 mb-3 bg-gray-900 rounded-lg border border-gray-700 space-y-3">
                        <div className="flex justify-start">
                            <div className="bg-gray-700 p-3 rounded-lg max-w-[80%] shadow-md">
                                <p className="text-xs font-bold text-cyan-400 mb-1">Assistant</p>
                                <p className="text-sm text-white">{response}</p>
                            </div>
                        </div>
                        {/* REFACTORING: Future enhancement to add chat history storage for better UX. */}
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                            placeholder="Ask about connection stability, errors, or metrics..."
                            className="flex-grow p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                            disabled={aiLoading} // Disable input while AI is processing
                        />
                        <button
                            onClick={handleQuery}
                            disabled={!query.trim() || aiLoading} // Disable button while AI is processing or query is empty
                            className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:bg-gray-600 transition duration-200 flex items-center"
                        >
                            {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                        </button>
                    </div>
                    {/* REFACTORING: Removed arbitrary max char warning. Real validation should be handled with user feedback. */}
                    {/* <p className="text-xs text-gray-500 mt-1">Max 500 characters.</p> */}
                </Card>
            )}

            {/* KPI Grid - REPLACEMENT: Metrics now derived from deterministic mock logic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Connection Resilience" className="shadow-xl border-b-4 border-green-500">
                    <ShieldCheck className="w-8 h-8 text-green-400 mb-2" />
                    <p className="text-5xl font-extrabold text-white my-1">{healthScore.toFixed(1)}%</p>
                    <p className="text-sm text-gray-400">Estimated Stability</p>
                </Card>
                <Card title="Active Errors" className="shadow-xl border-b-4 border-red-500">
                    <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
                    <p className={`text-5xl font-extrabold my-1 ${itemsInError > 0 ? 'text-red-400' : 'text-white'}`}>{itemsInError}</p>
                    <p className="text-sm text-gray-400">Attention needed</p>
                </Card>
                <Card title="Total Syncs (24h)" className="shadow-xl border-b-4 border-cyan-500">
                    <TrendingUp className="w-8 h-8 text-cyan-400 mb-2" />
                    <p className="text-5xl font-extrabold text-white my-1">{successfulSyncs.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Daily Syncs</p>
                </Card>
                <Card title="Institutions Monitored" className="shadow-xl border-b-4 border-indigo-500">
                    <Zap className="w-8 h-8 text-indigo-400 mb-2" />
                    <p className="text-5xl font-extrabold text-white my-1">{linkedAccounts.length}</p>
                    <p className="text-sm text-gray-400">Connected Sources</p>
                </Card>
            </div>

            {/* Institution List */}
            <Card title={`Connected Financial Institutions (${linkedAccounts.length})`} className="bg-gray-800/70">
                {linkedAccounts.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {linkedAccounts.map(account => {
                            // REPLACEMENT: Using deterministic account status
                            const { isError, statusText, statusColor } = getAccountStatus(account.id);

                            return (
                                <div key={account.id} className="p-4 bg-gray-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg hover:bg-gray-700/70 transition duration-200 border border-gray-700">
                                    <div className="flex-grow mb-2 md:mb-0">
                                        <p className="font-bold text-lg text-white">{account.name}</p>
                                        <p className="text-sm text-gray-400">
                                            Type: {account.type.toUpperCase()} | ID: {account.id.substring(0, 8)}...
                                            {account.mask && <span className="ml-4">Masked: ****{account.mask}</span>}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                                            {statusText}
                                        </span>
                                        <button
                                            onClick={() => console.log(`View details for ${account.name}`)}
                                            className="text-cyan-400 hover:text-cyan-300 text-sm"
                                        >
                                            Details &rarr;
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-800 rounded-lg border border-dashed border-gray-700">
                        <Zap className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-500 text-lg">No active Plaid connections. Please configure in settings.</p>
                    </div>
                )}
            </Card>

            {/* General Information */}
            <Card title="Overview" className="bg-gray-800/70 border-l-4 border-indigo-500">
                <div className="text-gray-300 space-y-5 prose prose-invert max-w-none">
                    <p>
                        This dashboard provides an overview of connected financial data sources via the Plaid API. It monitors connection status and basic metrics.
                    </p>
                    <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-gray-400">
                        "System stability is important for reliable data access."
                    </blockquote>
                    <p>
                        The system checks for potential errors across endpoints. This dashboard reflects current telemetry to help manage external service connections.
                    </p>
                </div>
            </Card>

            <footer className="text-center text-xs text-gray-600 pt-6 border-t border-gray-800">
                Plaid Dashboard | Version 1.0 | Managed by System
            </footer>
        </div>
    );
};

export default PlaidDashboardView;

// --- CONSOLIDATED FROM: ./components/PlaidDashboardView (4).tsx ---



// --- CONSOLIDATED FROM: PlaidDashboardView (4)_1.tsx ---

import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, LinkedAccount } from '../types';
import {
    Brain, Zap, ShieldCheck, AlertTriangle, TrendingUp, Settings, Loader2, MessageSquareText,
    Activity, FileText, Bot, GitBranch, DollarSign, BarChart3, Cpu, Database, Network, SlidersHorizontal, Play, Pause, Repeat, Sparkles
} from 'lucide-react';

// --- Advanced Utility Functions (Simulated) ---

const calculateHealthScore = (accounts: LinkedAccount[]): number => {
    if (accounts.length === 0) return 0;
    let score = 100.0;
    let penalty = 0;
    accounts.forEach(account => {
        const isStale = Math.random() > 0.90;
        const hasRecentError = Math.random() > 0.98;
        if (isStale) penalty += 5;
        if (hasRecentError) penalty += 15;
        if (account.type === 'depository' && Math.random() > 0.7) penalty -= 1;
    });
    score = Math.max(0, 100 - penalty);
    return parseFloat(score.toFixed(2));
};

const generateSummary = (score: number, errorCount: number): string => {
    if (errorCount > 5) return "CRITICAL ALERT: Multiple connections require immediate manual intervention. System stability is at risk.";
    if (score < 70) return "Performance Degradation: System integrity is compromised. Proactive re-authentication is strongly recommended.";
    if (score > 95) return "Optimal Performance: All data endpoints are stable and responding within nominal parameters.";
    return "Stable Operation: Data synchronization is proceeding as expected. Minor fluctuations detected.";
};

// --- Type Definitions for Sub-Modules ---
type HFTStrategy = 'Arbitrage' | 'Market Making' | 'Momentum';
type Trade = { id: string; symbol: string; side: 'BUY' | 'SELL'; price: number; quantity: number; timestamp: number; pnl: number };
type ActiveViewModule = 'HEALTH_STATUS' | 'HFT_SIMULATOR' | 'RISK_SENTINEL' | 'GEMINI_INSIGHTS' | 'ANALYTICS_ENGINE' | 'DATA_TOPOLOGY';

// --- Sub-Components (Self-Contained Apps) ---

const HFTStrategyView: React.FC = () => {
    const [strategy, setStrategy] = useState<HFTStrategy>('Momentum');
    const [isRunning, setIsRunning] = useState(false);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [pnl, setPnl] = useState(0);

    useEffect(() => {
        if (!isRunning) return;
        const interval = setInterval(() => {
            const newTrade: Trade = {
                id: `T${Date.now()}${Math.random()}`,
                symbol: ['BTC/USD', 'ETH/USD', 'AAPL', 'TSLA'][Math.floor(Math.random() * 4)],
                side: Math.random() > 0.5 ? 'BUY' : 'SELL',
                price: 100 + Math.random() * 5000,
                quantity: Math.random() * 10,
                timestamp: Date.now(),
                pnl: (Math.random() - 0.48) * 100,
            };
            setTrades(prev => [newTrade, ...prev.slice(0, 99)]);
            setPnl(prev => prev + newTrade.pnl);
        }, 250); // High frequency simulation
        return () => clearInterval(interval);
    }, [isRunning]);

    return (
        <Card title="High-Frequency Trading (HFT) Simulator" className="bg-gray-800/90 border-indigo-600/50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-4">
                    <Card title="Strategy Configuration" className="bg-gray-900/50">
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-300">Select Strategy</label>
                            <select value={strategy} onChange={e => setStrategy(e.target.value as HFTStrategy)} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white">
                                <option>Arbitrage</option>
                                <option>Market Making</option>
                                <option>Momentum</option>
                            </select>
                        </div>
                        <div className="mt-4 space-y-3">
                            <label className="block text-sm font-medium text-gray-300">Risk Limit ($)</label>
                            <input type="number" defaultValue={10000} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white" />
                        </div>
                        <div className="mt-4 space-y-3">
                            <label className="block text-sm font-medium text-gray-300">Execution Speed (ms)</label>
                            <input type="number" defaultValue={5} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white" />
                        </div>
                        <div className="mt-6 flex space-x-2">
                            <button onClick={() => setIsRunning(!isRunning)} className={`w-full flex items-center justify-center p-3 rounded-lg text-white font-bold transition ${isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                                {isRunning ? <><Pause className="w-5 h-5 mr-2" /> Stop Engine</> : <><Play className="w-5 h-5 mr-2" /> Start Engine</>}
                            </button>
                            <button onClick={() => { setTrades([]); setPnl(0); }} className="p-3 bg-gray-600 hover:bg-gray-500 rounded-lg text-white"><Repeat className="w-5 h-5" /></button>
                        </div>
                    </Card>
                    <Card title="Performance" className="bg-gray-900/50">
                        <p className="text-sm text-gray-400">Realized P&L</p>
                        <p className={`text-4xl font-mono font-bold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                        </p>
                        <p className="text-sm text-gray-400 mt-4">Trades Executed</p>
                        <p className="text-3xl font-mono font-bold text-white">{trades.length}</p>
                    </Card>
                </div>
                {/* Trade Log */}
                <div className="lg:col-span-2">
                    <Card title="Live Trade Execution Log" className="bg-gray-900/50 h-[600px] flex flex-col">
                        <div className="grid grid-cols-5 gap-2 text-xs font-bold text-gray-400 border-b border-gray-700 pb-2 mb-2 px-2">
                            <span>Timestamp</span><span>Symbol</span><span>Side</span><span className="text-right">Price</span><span className="text-right">P&L</span>
                        </div>
                        <div className="flex-grow overflow-y-auto pr-2 font-mono text-sm space-y-1">
                            {trades.map(trade => (
                                <div key={trade.id} className={`grid grid-cols-5 gap-2 p-1.5 rounded ${trade.side === 'BUY' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                    <span className="text-gray-500">{new Date(trade.timestamp).toLocaleTimeString('en-US', { hour12: false })}.{String(trade.timestamp % 1000).padStart(3, '0')}</span>
                                    <span className="text-white font-semibold">{trade.symbol}</span>
                                    <span className={trade.side === 'BUY' ? 'text-green-400' : 'text-red-400'}>{trade.side}</span>
                                    <span className="text-right text-white">{trade.price.toFixed(2)}</span>
                                    <span className={`text-right font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{trade.pnl.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </Card>
    );
};

const RiskSentinelView: React.FC = () => {
    const [reportType, setReportType] = useState('AML_Screening');
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportUrl, setReportUrl] = useState<string | null>(null);

    const handleGenerateReport = useCallback(() => {
        setIsGenerating(true);
        setReportUrl(null);
        setTimeout(() => {
            setReportUrl(`/reports/generated/${reportType}_${Date.now()}.pdf`);
            setIsGenerating(false);
        }, 2500);
    }, [reportType]);

    return (
        <Card title="Risk & Compliance Sentinel" className="bg-gray-800/90 border-red-600/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Report Generation */}
                <Card title="Compliance Report Generation" className="bg-gray-900/50">
                    <div className="space-y-4">
                        <p className="text-gray-300">Generate on-demand compliance reports based on real-time transactional data.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Report Type</label>
                            <select value={reportType} onChange={e => setReportType(e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-gray-600 text-white">
                                <option value="AML_Screening">AML Screening Report</option>
                                <option value="SAR_Filing">Suspicious Activity Report (SAR)</option>
                                <option value="KYC_Verification">KYC Verification Summary</option>
                            </select>
                        </div>
                        <button onClick={handleGenerateReport} disabled={isGenerating} className="w-full flex items-center justify-center p-3 rounded-lg text-white font-bold transition bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600">
                            {isGenerating ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</> : <><FileText className="w-5 h-5 mr-2" /> Generate Report</>}
                        </button>
                        {reportUrl && (
                            <div className="mt-4 p-3 bg-green-900/50 border border-green-500 rounded-lg text-center">
                                <p className="text-green-300">Report generated successfully.</p>
                                <a href={reportUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline text-sm">Download Report</a>
                            </div>
                        )}
                    </div>
                </Card>
                {/* Live Anomaly Feed */}
                <Card title="Live Anomaly Detection Feed" className="bg-gray-900/50">
                    <div className="h-80 overflow-y-auto pr-2 space-y-3">
                        {[...Array(15)].map((_, i) => (
                            <div key={i} className="flex items-start space-x-3 p-2 bg-gray-800/70 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-sm font-semibold text-white">
                                        {['High-value transfer', 'Unusual Geo-location', 'Rapid Movement of Funds'][i % 3]}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Account ****{1000 + i * 17} | Risk Score: {75 + (i % 25)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </Card>
    );
};

const GeminiInsightsView: React.FC = () => {
    const { linkedAccounts } = useContext(DataContext)!;
    const [query, setQuery] = useState('');
    const [isThinking, setIsThinking] = useState(false);
    const [insight, setInsight] = useState<string | null>(null);

    const handleQuerySubmit = useCallback(() => {
        if (!query.trim()) return;
        setIsThinking(true);
        setInsight(null);
        const thinkingTime = 1500 + Math.random() * 2000;
        setTimeout(() => {
            let generatedInsight = `Based on the query "${query}" and analysis of ${linkedAccounts.length} data sources, a multi-modal projection suggests a 15% increase in discretionary spending potential for the next fiscal quarter. Key indicators include reduced debt servicing costs and a positive shift in investment account momentum.`;
            if (query.toLowerCase().includes('risk')) {
                generatedInsight = `Risk analysis indicates a potential concentration risk in the technology sector, representing 68% of the total investment portfolio. Diversification into consumer staples or healthcare is recommended to mitigate volatility. The system has flagged two transactions from a high-risk jurisdiction for further review.`;
            } else if (query.toLowerCase().includes('save')) {
                generatedInsight = `To optimize savings, the model suggests consolidating the balances from accounts ****${linkedAccounts[0]?.mask || '1234'} and ****${linkedAccounts[1]?.mask || '5678'} into a high-yield savings vehicle. This action could potentially increase annual returns by approximately $${(Math.random() * 500 + 200).toFixed(2)}.`;
            }
            setInsight(generatedInsight);
            setIsThinking(false);
        }, thinkingTime);
    }, [query, linkedAccounts]);

    const proactiveInsights = useMemo(() => [
        { title: "Cash Flow Optimization", text: "Unusually high balance in a low-yield checking account. Consider moving funds to a higher-yield instrument.", severity: "low" },
        { title: "Subscription Anomaly", text: "A duplicate subscription charge for 'StreamFlix' was detected across two different cards.", severity: "medium" },
        { title: "Investment Opportunity", text: "Market volatility in the energy sector presents a potential buying opportunity aligned with your stated risk profile.", severity: "low" },
        { title: "Credit Utilization Alert", text: `Credit card ending in ****${linkedAccounts[2]?.mask || '9012'} has a utilization rate of 85%, which may impact credit score.`, severity: "high" },
    ], [linkedAccounts]);

    return (
        <Card title="Gemini Advanced Insights Engine" className="bg-gray-800/90 border-purple-600/50">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left Panel: Proactive Insights */}
                <div className="lg:col-span-2 space-y-4">
                    <Card title="Proactive Intelligence Feed" className="bg-gray-900/50">
                        <div className="h-[400px] overflow-y-auto pr-2 space-y-3">
                            {proactiveInsights.map((item, index) => (
                                <div key={index} className={`p-3 rounded-lg border-l-4 ${
                                    item.severity === 'high' ? 'border-red-500 bg-red-500/10' :
                                    item.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/10' :
                                    'border-cyan-500 bg-cyan-500/10'
                                }`}>
                                    <p className="font-bold text-white">{item.title}</p>
                                    <p className="text-sm text-gray-300">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Panel: Interactive Query */}
                <div className="lg:col-span-3">
                    <Card title="Natural Language Data Interrogation" className="bg-gray-900/50">
                        <p className="text-gray-400 mb-4 text-sm">Engage with your complete financial dataset using natural language. The Gemini model will synthesize information across all connected accounts to provide a holistic response.</p>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">Your Query:</label>
                            <textarea
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="e.g., 'Analyze my spending for last month and identify risks' or 'Where can I save more money?'"
                                className="w-full p-3 h-24 bg-gray-700 rounded-md border border-gray-600 text-white resize-none focus:ring-purple-500 focus:border-purple-500"
                            />
                        </div>
                        <button onClick={handleQuerySubmit} disabled={isThinking || !query.trim()} className="mt-4 w-full flex items-center justify-center p-3 rounded-lg text-white font-bold transition bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600">
                            {isThinking ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Thinking...</> : <><Sparkles className="w-5 h-5 mr-2" /> Generate Insight</>}
                        </button>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-white mb-2">Generated Insight:</h3>
                            <div className="p-4 min-h-[150px] bg-gray-950 rounded-lg border border-gray-700">
                                {isThinking && <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>}
                                {insight && <p className="text-gray-200 whitespace-pre-wrap">{insight}</p>}
                                {!isThinking && !insight && <p className="text-gray-500 text-center pt-10">Your generated insight will appear here.</p>}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </Card>
    );
};

// --- Main Component ---

const PlaidDashboardView: React.FC = () => {
    const context = useContext(DataContext);
    const [activeModule, setActiveModule] = useState<ActiveViewModule>('HEALTH_STATUS');

    if (!context) {
        throw new Error("PlaidDashboardView must be used within a DataProvider");
    }

    const { linkedAccounts, plaidApiKey, setActiveView } = context;

    const renderModule = () => {
        switch (activeModule) {
            case 'HFT_SIMULATOR': return <HFTStrategyView />;
            case 'RISK_SENTINEL': return <RiskSentinelView />;
            case 'GEMINI_INSIGHTS': return <GeminiInsightsView />;
            // Add other modules here when built
            // case 'ANALYTICS_ENGINE': return <AnalyticsForecastView />;
            // case 'DATA_TOPOLOGY': return <DataTopologyView />;
            case 'HEALTH_STATUS':
            default:
                return <HealthStatusView />;
        }
    };

    if (!plaidApiKey) {
        return (
            <div className="space-y-8 p-6 bg-gray-900 min-h-screen">
                <header className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-widest uppercase">
                        Financial Dashboard: Plaid Integration
                    </h1>
                    <button onClick={() => setActiveView(View.APIIntegration)} className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02]">
                        <Settings className="w-5 h-5 mr-2" /> Configure API Key
                    </button>
                </header>
                <Card title="Configuration Required: Plaid API Key" className="border-red-500/50">
                    <div className="text-center p-8 space-y-6">
                        <AlertTriangle className="w-16 h-16 mx-auto text-red-400 animate-pulse" />
                        <p className="text-xl text-gray-300">
                            System Core Uninitialized. API credentials are required to activate data synchronization and enable dashboard modules.
                        </p>
                        <button onClick={() => setActiveView(View.APIIntegration)} className="w-full md:w-auto px-8 py-3 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xl transition duration-300">
                            Proceed to Configuration
                        </button>
                    </div>
                </Card>
                <div className="text-center text-sm text-gray-500 pt-4">Status: OFFLINE. Awaiting credentials for system handshake.</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-900 font-sans text-white">
            {/* Sidebar Navigation */}
            <nav className="w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
                <div className="mb-8">
                    <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wider">
                        FIN-COMMAND
                    </h1>
                    <p className="text-xs text-gray-500">Plaid Integration Core</p>
                </div>
                <ul className="space-y-2">
                    <ModuleNavItem icon={Activity} label="Health & Status" view="HEALTH_STATUS" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={Cpu} label="HFT Simulator" view="HFT_SIMULATOR" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={ShieldCheck} label="Risk Sentinel" view="RISK_SENTINEL" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={Sparkles} label="Gemini Insights" view="GEMINI_INSIGHTS" activeModule={activeModule} setActiveModule={setActiveModule} />
                    <ModuleNavItem icon={BarChart3} label="Analytics Engine" view="ANALYTICS_ENGINE" activeModule={activeModule} setActiveModule={setActiveModule} disabled />
                    <ModuleNavItem icon={GitBranch} label="Data Topology" view="DATA_TOPOLOGY" activeModule={activeModule} setActiveModule={setActiveModule} disabled />
                </ul>
                <div className="mt-auto">
                    <button onClick={() => setActiveView(View.APIIntegration)} className="w-full flex items-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition duration-300 text-sm">
                        <Settings className="w-4 h-4 mr-2" /> Manage Integration
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {renderModule()}
                <footer className="text-center text-xs text-gray-600 pt-6 mt-6 border-t border-gray-800">
                    Financial Command Center | Version 2.0 | All Systems Operational
                </footer>
            </main>
        </div>
    );
};

const ModuleNavItem: React.FC<{ icon: React.ElementType, label: string, view: ActiveViewModule, activeModule: ActiveViewModule, setActiveModule: (view: ActiveViewModule) => void, disabled?: boolean }> = ({ icon: Icon, label, view, activeModule, setActiveModule, disabled }) => {
    const isActive = activeModule === view;
    return (
        <li>
            <button
                onClick={() => !disabled && setActiveModule(view)}
                disabled={disabled}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition duration-200 ${isActive ? 'bg-cyan-600/20 text-cyan-300' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{label}</span>
                {disabled && <span className="text-xs ml-auto text-gray-500">(Soon)</span>}
            </button>
        </li>
    );
};

const HealthStatusView: React.FC = () => {
    const { linkedAccounts, userProfile } = useContext(DataContext)!;
    const [chatOpen, setChatOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("Hello. I am the Dashboard Assistant. How can I help?");
    const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const healthScore = useMemo(() => calculateHealthScore(linkedAccounts), [linkedAccounts]);
    const itemsInError = useMemo(() => linkedAccounts.filter(acc => Math.random() > 0.95).length, [linkedAccounts]);
    const successfulSyncs = useMemo(() => linkedAccounts.length * 25 + Math.floor(Math.random() * 100), [linkedAccounts]);
    const summary = useMemo(() => generateSummary(healthScore, itemsInError), [healthScore, itemsInError]);

    useEffect(() => {
        // Cleanup interval on component unmount
        return () => {
            if (streamIntervalRef.current) {
                clearInterval(streamIntervalRef.current);
            }
        };
    }, []);

    const handleQuery = useCallback(() => {
        if (!query.trim()) return;

        // Clear any existing stream
        if (streamIntervalRef.current) {
            clearInterval(streamIntervalRef.current);
        }
        
        // System instruction influences the response tone and content
        const systemInstruction = "You are a helpful, slightly formal, AI Dashboard Assistant. You provide concise and data-driven answers.";

        let fullResponse = "";
        const lowerQuery = query.toLowerCase();

        if (lowerQuery.includes("error")) {
            fullResponse = `Analyzing error logs... There are currently ${itemsInError} items flagged with potential errors. It is recommended to run diagnostics on accounts that have not been re-authenticated in the last 90 days for optimal performance.`;
        } else if (lowerQuery.includes("health")) {
            fullResponse = `The current aggregate System Health Score is ${healthScore.toFixed(2)}%. This indicates a high degree of operational stability and data integrity across all connected endpoints.`;
        } else if (lowerQuery.includes("sync")) {
            fullResponse = `Reviewing synchronization telemetry... Total successful data synchronizations in the last 24-hour cycle are within 99.7% of expected parameters. Average data latency is currently 215ms.`;
        } else if (lowerQuery.includes("user")) {
            fullResponse = `Accessing user profile... The profile for ${userProfile?.name || 'N/A'} is associated with ${linkedAccounts.length} active data source connections. All permissions are correctly configured.`;
        } else {
            fullResponse = "I have analyzed the system telemetry. To provide a more detailed analysis, please specify if you're interested in connection health, error rates, or synchronization performance.";
        }

        setResponse("..."); // Indicate thinking
        setQuery(""); // Clear input

        setTimeout(() => { // Simulate initial network latency
            const words = fullResponse.split(' ');
            let currentWordIndex = 0;
            streamIntervalRef.current = setInterval(() => {
                if (currentWordIndex < words.length) {
                    setResponse(words.slice(0, currentWordIndex + 1).join(' '));
                    currentWordIndex++;
                } else {
                    if (streamIntervalRef.current) {
                        clearInterval(streamIntervalRef.current);
                        streamIntervalRef.current = null;
                    }
                }
            }, 50); // Stream one word every 50ms
        }, 300);

    }, [query, itemsInError, healthScore, linkedAccounts.length, userProfile]);

    return (
        <div className="space-y-6">
            <Card title="System Health Status" className="border-l-4 border-cyan-500 bg-gray-800/70">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Brain className="w-10 h-10 text-cyan-400 flex-shrink-0" />
                        <div>
                            <p className="text-lg font-medium text-white">System Score:</p>
                            <p className="text-4xl font-extrabold text-cyan-300">{healthScore.toFixed(2)}%</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-8 max-w-xl">
                        <p className="text-sm italic text-gray-300 border-l-2 border-gray-600 pl-3">
                            <span className="font-bold text-cyan-400">System Note:</span> {summary}
                        </p>
                    </div>
                    <button onClick={() => setChatOpen(!chatOpen)} className={`mt-4 md:mt-0 px-4 py-2 rounded-full text-sm font-semibold transition duration-300 flex items-center ${chatOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white`}>
                        <MessageSquareText className="w-4 h-4 mr-2" /> {chatOpen ? 'Close Assistant' : 'Open Assistant'}
                    </button>
                </div>
            </Card>

            {chatOpen && (
                <Card title="AI Assistant Interface" className="bg-gray-800/90 border-cyan-600/50">
                    <div className="h-64 overflow-y-auto p-3 mb-3 bg-gray-900 rounded-lg border border-gray-700 space-y-3">
                        <div className="flex justify-start">
                            <div className="bg-gray-700 p-3 rounded-lg max-w-[80%] shadow-md">
                                <p className="text-xs font-bold text-cyan-400 mb-1">Assistant</p>
                                <p className="text-sm text-white">{response}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleQuery()} placeholder="Ask about connection stability, errors, or metrics..." className="flex-grow p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500" />
                        <button onClick={handleQuery} disabled={!query.trim()} className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:bg-gray-600 transition duration-200 flex items-center"><Zap className="w-5 h-5" /></button>
                    </div>
                </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Connection Resilience" className="shadow-xl border-b-4 border-green-500"><ShieldCheck className="w-8 h-8 text-green-400 mb-2" /><p className="text-5xl font-extrabold text-white my-1">{healthScore.toFixed(1)}%</p><p className="text-sm text-gray-400">Estimated Stability</p></Card>
                <Card title="Active Errors" className="shadow-xl border-b-4 border-red-500"><AlertTriangle className="w-8 h-8 text-red-400 mb-2" /><p className={`text-5xl font-extrabold my-1 ${itemsInError > 0 ? 'text-red-400' : 'text-white'}`}>{itemsInError}</p><p className="text-sm text-gray-400">Attention Required</p></Card>
                <Card title="Total Syncs (24h)" className="shadow-xl border-b-4 border-cyan-500"><TrendingUp className="w-8 h-8 text-cyan-400 mb-2" /><p className="text-5xl font-extrabold text-white my-1">{successfulSyncs.toLocaleString()}</p><p className="text-sm text-gray-400">Daily Sync Operations</p></Card>
                <Card title="Institutions Monitored" className="shadow-xl border-b-4 border-indigo-500"><Database className="w-8 h-8 text-indigo-400 mb-2" /><p className="text-5xl font-extrabold text-white my-1">{linkedAccounts.length}</p><p className="text-sm text-gray-400">Connected Data Sources</p></Card>
            </div>

            <Card title={`Connected Financial Institutions (${linkedAccounts.length})`} className="bg-gray-800/70">
                {linkedAccounts.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {linkedAccounts.map(account => {
                            const isError = Math.random() > 0.95;
                            const statusColor = isError ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300';
                            return (
                                <div key={account.id} className="p-4 bg-gray-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg hover:bg-gray-700/70 transition duration-200 border border-gray-700">
                                    <div className="flex-grow mb-2 md:mb-0">
                                        <p className="font-bold text-lg text-white">{account.name}</p>
                                        <p className="text-sm text-gray-400">Type: {account.type?.toUpperCase() || 'UNKNOWN'} | ID: {account.id.substring(0, 8)}...{account.mask && <span className="ml-4">Masked: ****{account.mask}</span>}</p>
                                    </div>
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>{isError ? 'Error' : 'Operational'}</span>
                                        <button className="text-cyan-400 hover:text-cyan-300 text-sm">Details &rarr;</button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-800 rounded-lg border border-dashed border-gray-700">
                        <Zap className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-500 text-lg">No active Plaid connections. Please configure in settings.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PlaidDashboardView;