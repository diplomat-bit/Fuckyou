// components/TransactionsView.tsx
/**
 * @file TransactionsView.tsx
 * @version 4.0.0 "The Sovereign Monolith"
 * @description 
 * This is the "Golden Ticket" experience for Quantum Financial. 
 * A high-performance, elite-grade financial command center designed for the 0.1%.
 * 
 * PHILOSOPHY:
 * - "Test Drive" the engine of global finance.
 * - "Bells and Whistles" in every interaction.
 * - "Cheat Sheet" for complex treasury operations.
 * - "No Pressure" environment to kick the tires and see the engine roar.
 * 
 * TECHNICAL CAPABILITIES:
 * - Robust Payment & Collection (Wire, ACH, Quantum-Rail).
 * - Non-negotiable Security (MFA Simulations, Real-time Fraud Heuristics).
 * - Deep Analytics (Visualizing the flow of capital).
 * - ERP Integration Bridge (SAP, Oracle, NetSuite simulations).
 * - Immutable Audit Storage (Every sensitive action is logged).
 * - Sovereign AI Integration (Gemini-3-Flash-Preview powered).
 * 
 * @author Quantum Financial Engineering
 * @security-level ARCHITECT_LEVEL
 */

import React, { useContext, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { 
    Transaction, 
    DetectedSubscription, 
    AuditLogEntry, 
    PaymentOrder, 
    View,
    Notification
} from '../types';

// ================================================================================================
// CONSTANTS & CONFIGURATION
// ================================================================================================

const INSTITUTION_NAME = "Quantum Financial";
const SYSTEM_VERSION = "v4.0.0-ALPHA-SOVEREIGN";

// ================================================================================================
// TYPES & INTERFACES (The Blueprint)
// ================================================================================================

interface QuantumAuditEntry extends AuditLogEntry {
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    metadata?: Record<string, any>;
    ipAddress: string;
    userAgent: string;
}

interface AICommandResponse {
    action: 'DRAFT_PAYMENT' | 'FLAG_TRANSACTION' | 'GENERATE_REPORT' | 'UPDATE_SECURITY' | 'CHAT_ONLY';
    message: string;
    payload?: any;
    confidence: number;
}

interface FraudHeuristic {
    id: string;
    name: string;
    status: 'ACTIVE' | 'LEARNING' | 'TRIPPED';
    riskScore: number;
    lastTriggered?: string;
}

// ================================================================================================
// SUB-COMPONENTS (The Engine Parts)
// ================================================================================================

/**
 * @description A high-fidelity simulation of a Multi-Factor Authentication challenge.
 * Part of the "Security is Non-Negotiable" requirement.
 */
const MFASimulator: React.FC<{ onVerified: () => void; onCancel: () => void }> = ({ onVerified, onCancel }) => {
    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        if (value && index < 5) {
            const nextInput = document.getElementById(`mfa-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleVerify = async () => {
        setIsVerifying(true);
        await new Promise(r => setTimeout(r, 1200)); // Simulate network latency
        setIsVerifying(false);
        onVerified();
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
            <div className="bg-gray-900 border border-cyan-500/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-4">
                        <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white">Biometric Handshake</h3>
                    <p className="text-gray-400 mt-2">Enter the 6-digit secure token from your Quantum Authenticator.</p>
                </div>
                <div className="flex justify-between gap-2 mb-8">
                    {code.map((digit, i) => (
                        <input
                            key={i}
                            id={`mfa-${i}`}
                            type="text"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(i, e.target.value)}
                            className="w-12 h-14 bg-gray-800 border border-gray-700 rounded-lg text-center text-2xl font-bold text-cyan-400 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                        />
                    ))}
                </div>
                <div className="space-y-3">
                    <button
                        onClick={handleVerify}
                        disabled={isVerifying || code.some(d => !d)}
                        className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/20"
                    >
                        {isVerifying ? 'Synchronizing...' : 'Verify Identity'}
                    </button>
                    <button onClick={onCancel} className="w-full py-3 text-gray-500 hover:text-gray-300 font-medium transition-colors">
                        Cancel Transaction
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * @description The "Black Box" of the application. Logs every sensitive action.
 */
const AuditTrailViewer: React.FC<{ logs: QuantumAuditEntry[] }> = ({ logs }) => {
    return (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {logs.length === 0 && <div className="text-center py-10 text-gray-500 italic">No sensitive actions recorded in this session.</div>}
            {logs.map((log) => (
                <div key={log.id} className="p-3 bg-gray-900/50 border-l-2 border-cyan-500 rounded-r-lg flex items-start justify-between group hover:bg-gray-800/50 transition-colors">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                log.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                'bg-cyan-500/20 text-cyan-400'
                            }`}>
                                {log.severity}
                            </span>
                            <span className="text-sm font-semibold text-gray-200">{log.action}</span>
                        </div>
                        <p className="text-xs text-gray-400">{log.targetResource}</p>
                        <div className="flex items-center gap-3 text-[10px] text-gray-500">
                            <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span>IP: {log.ipAddress}</span>
                        </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-cyan-500 hover:text-cyan-400 text-[10px] font-bold uppercase tracking-tighter">Details</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// ================================================================================================
// MAIN COMPONENT: THE SOVEREIGN MONOLITH
// ================================================================================================

const TransactionsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("TransactionsView must be within a DataProvider");

    const { transactions, addTransaction, showNotification } = context;

    // --- STATE: UI & NAVIGATION ---
    const [activeTab, setActiveTab] = useState<'LEDGER' | 'PAYMENTS' | 'SECURITY' | 'ANALYTICS' | 'INTEGRATION'>('LEDGER');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
    const [isMFAOpen, setIsMFAOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<() => void>(() => {});

    // --- STATE: AUDIT & LOGGING ---
    const [auditLogs, setAuditLogs] = useState<QuantumAuditEntry[]>([]);

    // --- STATE: AI CHAT ---
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; content: string }[]>([
        { role: 'ai', content: "Welcome to the Quantum Command Center. I am your Sovereign AI Strategist. How shall we deploy capital today?" }
    ]);
    const [isAILoading, setIsAILoading] = useState(false);

    // --- STATE: PAYMENT ENGINE ---
    const [paymentForm, setPaymentForm] = useState({
        recipient: '',
        amount: '',
        type: 'WIRE' as 'WIRE' | 'ACH' | 'QUANTUM',
        reference: '',
        urgency: 'STANDARD' as 'STANDARD' | 'PRIORITY' | 'INSTANT'
    });

    // --- REFS ---
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- HELPERS: AUDIT LOGGING ---
    const logAction = useCallback((action: string, resource: string, severity: QuantumAuditEntry['severity'] = 'LOW', metadata?: any) => {
        const newEntry: QuantumAuditEntry = {
            id: `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            timestamp: new Date().toISOString(),
            userId: 'USR-77-X-ALPHA',
            action,
            targetResource: resource,
            success: true,
            severity,
            ipAddress: '192.168.1.104',
            userAgent: navigator.userAgent,
            metadata
        };
        setAuditLogs(prev => [newEntry, ...prev]);
    }, []);

    // --- HELPERS: AI CORE ---
    const executeAICommand = async (input: string) => {
        if (!input.trim()) return;
        
        const userMsg = { role: 'user' as const, content: input };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAILoading(true);

        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: input }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const responseText = data.response;

            setChatHistory(prev => [...prev, { role: 'ai', content: responseText }]);
            
            // Logic to "Create the shit it needs"
            if (responseText.toLowerCase().includes("draft") && responseText.toLowerCase().includes("payment")) {
                // Simulated parsing of AI intent
                setPaymentForm(prev => ({
                    ...prev,
                    recipient: "AI Suggested Recipient",
                    amount: "1000000",
                    reference: "Strategic Capital Deployment"
                }));
                setActiveTab('PAYMENTS');
                showNotification("AI has prepared a draft payment for your review.", "info");
                logAction("AI_DRAFT_PAYMENT", "Payment Engine", "MEDIUM");
            }

        } catch (error) {
            console.error("AI Core Failure:", error);
            setChatHistory(prev => [...prev, { role: 'ai', content: "My neural link is currently experiencing interference. Please proceed with manual overrides." }]);
        } finally {
            setIsAILoading(false);
        }
    };

    // --- HELPERS: PAYMENT EXECUTION ---
    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Security Check
        setPendingAction(() => () => {
            const newTx: Transaction = {
                id: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                type: 'expense',
                category: 'Treasury Transfer',
                description: `${paymentForm.type} to ${paymentForm.recipient}`,
                amount: parseFloat(paymentForm.amount),
                date: new Date().toISOString().split('T')[0],
                currency: 'USD',
                metadata: { urgency: paymentForm.urgency, ref: paymentForm.reference }
            };
            
            addTransaction(newTx);
            logAction("EXECUTE_PAYMENT", `Payment of $${paymentForm.amount} to ${paymentForm.recipient}`, "HIGH", paymentForm);
            showNotification(`Capital deployed successfully via ${paymentForm.type} rail.`, "success");
            
            setPaymentForm({ recipient: '', amount: '', type: 'WIRE', reference: '', urgency: 'STANDARD' });
            setActiveTab('LEDGER');
        });
        
        setIsMFAOpen(true);
    };

    // --- MEMOIZED DATA ---
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(tx => {
                const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    tx.category.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesType = filterType === 'ALL' || 
                                  (filterType === 'INCOME' && tx.type === 'income') || 
                                  (filterType === 'EXPENSE' && tx.type === 'expense');
                return matchesSearch && matchesType;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, searchTerm, filterType]);

    // --- EFFECTS ---
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // ================================================================================================
    // RENDER LOGIC
    // ================================================================================================

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-gray-100 p-4 md:p-8 font-sans selection:bg-cyan-500/30">
            {/* MFA OVERLAY */}
            {isMFAOpen && (
                <MFASimulator 
                    onVerified={() => {
                        setIsMFAOpen(false);
                        pendingAction();
                    }} 
                    onCancel={() => setIsMFAOpen(false)} 
                />
            )}

            {/* HEADER SECTION: THE GOLDEN TICKET */}
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
                            Quantum <span className="text-cyan-500">Financial</span>
                        </h1>
                    </div>
                    <p className="text-gray-500 font-medium tracking-widest uppercase text-[10px]">
                        Sovereign Command Center // {SYSTEM_VERSION} // Secure Node: Alpha-7
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Engine Status: Roaring</span>
                    </div>
                    <div className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center gap-3">
                        <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Golden Ticket Active</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: NAVIGATION & AI COMMAND */}
                <div className="lg:col-span-3 space-y-6">
                    <Card padding="none" className="overflow-hidden border-gray-800">
                        <nav className="flex flex-col">
                            {[
                                { id: 'LEDGER', label: 'Global Ledger', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
                                { id: 'PAYMENTS', label: 'Payment Engine', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                                { id: 'SECURITY', label: 'Security Vault', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                                { id: 'ANALYTICS', label: 'Flow Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                                { id: 'INTEGRATION', label: 'ERP Bridge', icon: 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-2m-6 0l-4-4m0 0l4-4m-4 4h12' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id as any);
                                        logAction("NAVIGATE", item.label);
                                    }}
                                    className={`flex items-center gap-4 px-6 py-4 text-sm font-bold transition-all border-l-4 ${
                                        activeTab === item.id 
                                        ? 'bg-cyan-500/10 border-cyan-500 text-white' 
                                        : 'border-transparent text-gray-500 hover:bg-gray-800/50 hover:text-gray-300'
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                                    </svg>
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </Card>

                    {/* SOVEREIGN AI CHAT BAR */}
                    <Card title="Sovereign AI Strategist" subtitle="Neural Command Interface" className="border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
                        <div className="flex flex-col h-[400px]">
                            <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                                            msg.role === 'user' 
                                            ? 'bg-cyan-600 text-white rounded-tr-none' 
                                            : 'bg-gray-800 text-gray-300 border border-gray-700 rounded-tl-none'
                                        }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                ))}
                                {isAILoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700">
                                            <div className="flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && executeAICommand(chatInput)}
                                    placeholder="Deploy capital..."
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all pr-12"
                                />
                                <button 
                                    onClick={() => executeAICommand(chatInput)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="lg:col-span-9 space-y-8">
                    
                    {/* TAB: GLOBAL LEDGER */}
                    {activeTab === 'LEDGER' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                                <div className="relative w-full md:w-96">
                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search the FlowMatrix..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="flex items-center gap-2 bg-gray-900/50 p-1 rounded-xl border border-gray-800">
                                    {['ALL', 'INCOME', 'EXPENSE'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setFilterType(type as any)}
                                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                                filterType === type ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/20' : 'text-gray-500 hover:text-gray-300'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <Card padding="none" className="border-gray-800 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-900/80 border-b border-gray-800">
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Timestamp</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Entity / Description</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Quantum Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800/50">
                                            {filteredTransactions.map((tx) => (
                                                <tr key={tx.id} className="group hover:bg-cyan-500/[0.02] transition-colors cursor-pointer">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="text-xs font-mono text-gray-500">{tx.date}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">{tx.description}</span>
                                                            <span className="text-[10px] text-gray-600 font-mono uppercase">{tx.id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-[10px] font-bold uppercase tracking-tighter">
                                                            {tx.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`text-sm font-black font-mono ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                                            {tx.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('en-US', { style: 'currency', currency: tx.currency || 'USD' }).format(tx.amount)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* TAB: PAYMENT ENGINE */}
                    {activeTab === 'PAYMENTS' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card title="Capital Deployment" subtitle="Wire, ACH, & Quantum Rails">
                                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Recipient Entity</label>
                                        <input
                                            required
                                            type="text"
                                            value={paymentForm.recipient}
                                            onChange={(e) => setPaymentForm({...paymentForm, recipient: e.target.value})}
                                            placeholder="e.g. Global Logistics Corp"
                                            className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Amount (USD)</label>
                                            <input
                                                required
                                                type="number"
                                                value={paymentForm.amount}
                                                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                                                placeholder="0.00"
                                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Rail Type</label>
                                            <select
                                                value={paymentForm.type}
                                                onChange={(e) => setPaymentForm({...paymentForm, type: e.target.value as any})}
                                                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                                            >
                                                <option value="WIRE">SWIFT Wire</option>
                                                <option value="ACH">Next-Day ACH</option>
                                                <option value="QUANTUM">Quantum Instant</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Urgency Level</label>
                                        <div className="flex gap-2">
                                            {['STANDARD', 'PRIORITY', 'INSTANT'].map((u) => (
                                                <button
                                                    key={u}
                                                    type="button"
                                                    onClick={() => setPaymentForm({...paymentForm, urgency: u as any})}
                                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                        paymentForm.urgency === u 
                                                        ? 'bg-cyan-600 border-cyan-500 text-white' 
                                                        : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'
                                                    }`}
                                                >
                                                    {u}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-cyan-900/20 transition-all active:scale-[0.98]"
                                        >
                                            Authorize Deployment
                                        </button>
                                    </div>
                                </form>
                            </Card>

                            <div className="space-y-6">
                                <Card title="Audit Storage" subtitle="Session Immutable Logs">
                                    <AuditTrailViewer logs={auditLogs} />
                                </Card>
                                <Card title="Integration Bridge" subtitle="ERP Sync Status">
                                    <div className="space-y-4">
                                        {[
                                            { name: 'SAP S/4HANA', status: 'CONNECTED', latency: '12ms' },
                                            { name: 'Oracle NetSuite', status: 'SYNCING', latency: '45ms' },
                                            { name: 'Microsoft Dynamics', status: 'STANDBY', latency: '-' },
                                        ].map((erp) => (
                                            <div key={erp.name} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${erp.status === 'CONNECTED' ? 'bg-green-500' : erp.status === 'SYNCING' ? 'bg-cyan-500 animate-pulse' : 'bg-gray-600'}`}></div>
                                                    <span className="text-xs font-bold text-gray-300">{erp.name}</span>
                                                </div>
                                                <span className="text-[10px] font-mono text-gray-500">{erp.latency}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* TAB: SECURITY VAULT */}
                    {activeTab === 'SECURITY' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card isMetric title="Risk Score" subtitle="Real-time Heuristics">
                                    <div className="text-5xl font-black text-green-400 tracking-tighter">0.02</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase mt-2">Ultra-Low Risk Profile</div>
                                </Card>
                                <Card isMetric title="Active Threats" subtitle="Global Perimeter">
                                    <div className="text-5xl font-black text-white tracking-tighter">0</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase mt-2">Perimeter Secure</div>
                                </Card>
                                <Card isMetric title="MFA Status" subtitle="Biometric Sync">
                                    <div className="text-5xl font-black text-cyan-400 tracking-tighter">100%</div>
                                    <div className="text-[10px] font-bold text-gray-500 uppercase mt-2">Hardware Keys Enforced</div>
                                </Card>
                            </div>

                            <Card title="Fraud Monitoring Engine" subtitle="Neural Pattern Recognition">
                                <div className="space-y-4">
                                    {[
                                        { id: 'H-1', name: 'Velocity Check', status: 'ACTIVE', risk: 0, desc: 'Monitoring transaction frequency across global nodes.' },
                                        { id: 'H-2', name: 'Geospatial Anomaly', status: 'ACTIVE', risk: 2, desc: 'Detecting impossible travel between login events.' },
                                        { id: 'H-3', name: 'Behavioral Biometrics', status: 'LEARNING', risk: 0, desc: 'Analyzing keystroke dynamics and mouse movement.' },
                                        { id: 'H-4', name: 'Large Exposure Audit', status: 'ACTIVE', risk: 0, desc: 'Flagging transfers exceeding 15% of liquid reserves.' },
                                    ].map((h) => (
                                        <div key={h.id} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-200">{h.name}</span>
                                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${h.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                                        {h.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 max-w-md">{h.desc}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-gray-400">Risk Impact</div>
                                                <div className="text-lg font-black text-white">+{h.risk}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* TAB: FLOW ANALYTICS */}
                    {activeTab === 'ANALYTICS' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card title="Capital Flow Visualization" subtitle="The Engine Roar">
                                <div className="h-[400px] flex items-end justify-between gap-2 px-4">
                                    {Array.from({ length: 24 }).map((_, i) => {
                                        const height = Math.floor(Math.random() * 80) + 20;
                                        return (
                                            <div key={i} className="flex-1 group relative">
                                                <div 
                                                    style={{ height: `${height}%` }} 
                                                    className="w-full bg-gradient-to-t from-cyan-600/20 to-cyan-500 rounded-t-sm transition-all duration-500 group-hover:from-cyan-500 group-hover:to-blue-400"
                                                ></div>
                                                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-mono text-gray-600">
                                                    {i}:00
                                                </div>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                                    ${(height * 1.2).toFixed(1)}M Flow
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card title="Liquidity Distribution" subtitle="Asset Class Allocation">
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Cash & Equivalents', value: 45, color: 'bg-cyan-500' },
                                            { label: 'Fixed Income', value: 30, color: 'bg-blue-500' },
                                            { label: 'Strategic Equity', value: 15, color: 'bg-indigo-500' },
                                            { label: 'Digital Assets', value: 10, color: 'bg-purple-500' },
                                        ].map((item) => (
                                            <div key={item.label} className="space-y-1">
                                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                                                    <span className="text-gray-400">{item.label}</span>
                                                    <span className="text-white">{item.value}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                                    <div style={{ width: `${item.value}%` }} className={`h-full ${item.color}`}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                                <Card title="Global SSI Hub" subtitle="Standard Settlement Instructions">
                                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl italic text-xs text-cyan-300 leading-relaxed">
                                        "Quantum Financial maintains a global network of 400+ correspondent banks. Your SSIs are automatically synchronized across all major clearing houses including CHIPS, Fedwire, and TARGET2."
                                    </div>
                                    <button className="mt-4 w-full py-2 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                                        Download Global SSI Directory
                                    </button>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* TAB: ERP INTEGRATION */}
                    {activeTab === 'INTEGRATION' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card title="ERP Bridge Configuration" subtitle="Seamless Data Orchestration">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                    <div className="space-y-6">
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Connect your core business systems directly to the Quantum Financial ledger. 
                                            Eliminate manual reconciliation and data silos with our high-frequency API bridge.
                                        </p>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                                                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                                                    <span className="text-xl font-black text-white">S</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">SAP S/4HANA</div>
                                                    <div className="text-[10px] text-green-400 font-bold uppercase">Active Connection</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl opacity-50 grayscale">
                                                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                                                    <span className="text-xl font-black text-white">N</span>
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">NetSuite</div>
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Not Configured</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 font-mono text-[10px]">
                                        <div className="text-cyan-500">// Quantum Bridge API v4.0</div>
                                        <div className="text-gray-500">POST /v1/ledger/sync HTTP/1.1</div>
                                        <div className="text-gray-500">Host: api.quantum.financial</div>
                                        <div className="text-gray-500">Authorization: Bearer [REDACTED]</div>
                                        <div className="text-gray-300 mt-4">
                                            {`{
  "sync_mode": "REAL_TIME",
  "entities": ["TX_LEDGER", "PAYMENT_ORDERS"],
  "reconciliation": {
    "auto_match": true,
    "tolerance": 0.01
  }
}`}
                                        </div>
                                        <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-lg transition-colors mt-4">
                                            Test Connection
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>

            {/* FOOTER: THE VISION */}
            <footer className="mt-20 pt-10 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
                <div className="text-[10px] font-bold text-gray-600 uppercase tracking-[0.3em]">
                    Â© 2024 Quantum Financial Group // All Rights Reserved
                </div>
                <div className="flex gap-8">
                    <button className="text-[10px] font-bold text-gray-600 hover:text-cyan-500 uppercase tracking-widest transition-colors">Terms of Sovereignty</button>
                    <button className="text-[10px] font-bold text-gray-600 hover:text-cyan-500 uppercase tracking-widest transition-colors">Privacy Protocol</button>
                    <button className="text-[10px] font-bold text-gray-600 hover:text-cyan-500 uppercase tracking-widest transition-colors">Security Disclosure</button>
                </div>
            </footer>
        </div>
    );
};

export default TransactionsView;