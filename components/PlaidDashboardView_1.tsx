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