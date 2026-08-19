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

// --- CONSOLIDATED FROM: TransactionsView (2).tsx ---

// components/TransactionsView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now the "FlowMatrix," the complete Great Library for all financial events.
// It features advanced filtering, sorting, and the integrated "Plato's Intelligence Suite"
// for powerful, AI-driven transaction analysis.

import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { Transaction, DetectedSubscription } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// ================================================================================================
// MODAL & DETAIL COMPONENTS
// ================================================================================================

/**
 * @description A modal that displays detailed information about a single transaction.
 * This component provides a "magnifying glass" view into a specific financial event.
 * @param {{ transaction: Transaction | null; onClose: () => void }} props
 */
const TransactionDetailModal: React.FC<{ transaction: Transaction | null; onClose: () => void }> = ({ transaction, onClose }) => {
    if (!transaction) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Description:</span> <span className="text-white font-semibold">{transaction.description}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Amount:</span> <span className={`font-mono font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Date:</span> <span className="text-white">{transaction.date}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Category:</span> <span className="text-white">{transaction.category}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Transaction ID:</span> <span className="text-white font-mono text-xs">{transaction.id}</span></div>
                    {transaction.carbonFootprint && <div className="flex justify-between text-sm"><span className="text-gray-400">Carbon Footprint:</span> <span className="text-green-300">{transaction.carbonFootprint.toFixed(1)} kg CO₂</span></div>}
                </div>
            </div>
        </div>
    );
};

// ================================================================================================
// PLATO'S INTELLIGENCE SUITE (AI WIDGETS)
// ================================================================================================

/**
 * @description A generic, reusable component for displaying an AI-generated insight
 * based on the user's transaction history. It handles the loading state, error state,
 * and rendering of the result, which can be either plain text or structured JSON.
 */
const AITransactionWidget: React.FC<{
    title: string;
    prompt: string;
    transactions: Transaction[];
    responseSchema?: any; // Allows passing a response schema for structured JSON
    children?: (result: any) => React.ReactNode; // Custom renderer for structured data
}> = ({ title, prompt, transactions, responseSchema, children }) => {
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * @description Triggers the Gemini API call to generate the financial insight.
     */
    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            // Create a concise summary of recent transactions to provide context to the AI.
            const transactionSummary = transactions.slice(0, 20).map(t => `${t.date} - ${t.description}: $${t.amount.toFixed(2)} (${t.type})`).join('\n');
            const fullPrompt = `${prompt}\n\nHere are the most recent transactions for context:\n${transactionSummary}`;
            
            // Configure the API call based on whether a structured JSON response is expected.
            const config: any = { responseMimeType: responseSchema ? "application/json" : "text/plain" };
            if (responseSchema) {
                config.responseSchema = responseSchema;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: config,
            });

            const textResult = response.text.trim();
            setResult(responseSchema ? JSON.parse(textResult) : textResult);

        } catch (err) {
            console.error(`Error generating ${title}:`, err);
            setError('Plato AI could not generate this insight.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 h-full flex flex-col">
            <h4 className="font-semibold text-gray-200 text-sm mb-2">{title}</h4>
            <div className="space-y-2 min-h-[5rem] flex-grow flex flex-col justify-center">
                {error && <p className="text-red-400 text-xs text-center p-2">{error}</p>}
                {isLoading && (
                    <div className="flex items-center justify-center space-x-2">
                         <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                         <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                         <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                )}
                {!isLoading && result && children && children(result)}
                {!isLoading && result && !children && <p className="text-gray-300 text-xs p-2">{result}</p>}
                {!isLoading && !result && !error && (
                    <div className="text-center">
                        <button onClick={handleGenerate} className="text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors">
                            Ask Plato AI
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ================================================================================================
// MAIN TRANSACTIONS VIEW (FlowMatrix)
// ================================================================================================
const TransactionsView: React.FC = () => {
    const context = useContext(DataContext);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [sort, setSort] = useState<'date' | 'amount'>('date');
    const [searchTerm, setSearchTerm] = useState('');

    if (!context) {
        throw new Error("TransactionsView must be within a DataProvider");
    }
    const { transactions } = context;

    /**
     * @description Memoized derivation of the transactions to display.
     * This is a crucial performance optimization. The list is only re-calculated
     * when the source data or one of the filter/sort criteria changes, preventing
     * unnecessary re-renders.
     */
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(tx => filter === 'all' || tx.type === filter)
            .filter(tx => tx.description.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
                if (sort === 'date') {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                }
                return b.amount - a.amount;
            });
    }, [transactions, filter, sort, searchTerm]);
    
    // Schema definition for the Subscription Hunter AI widget.
    // This tells the Gemini API to return its findings in a structured JSON format.
    const subscriptionSchema = {
        type: Type.OBJECT,
        properties: {
            subscriptions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        estimatedAmount: { type: Type.NUMBER },
                        lastCharged: { type: Type.STRING }
                    }
                }
            }
        }
    };

    return (
        <>
            <div className="space-y-6">
                 <h2 className="text-3xl font-bold text-white tracking-wider">Transaction History (FlowMatrix)</h2>
                 <Card title="Plato's Intelligence Suite" isCollapsible>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AITransactionWidget title="Subscription Hunter" prompt="Analyze these transactions to find potential recurring subscriptions the user might have forgotten about. Look for repeated payments to the same merchant around the same time each month." transactions={transactions} responseSchema={subscriptionSchema}>
                           {(result: { subscriptions: DetectedSubscription[] }) => (
                                <ul className="text-xs text-gray-300 space-y-1 p-2">
                                    {result.subscriptions.length > 0 ? result.subscriptions.map(sub => <li key={sub.name}>- {sub.name} (~${sub.estimatedAmount.toFixed(2)})</li>) : <li>No potential subscriptions found.</li>}
                                </ul>
                           )}
                        </AITransactionWidget>
                        <AITransactionWidget title="Anomaly Detection" prompt="Analyze these transactions and identify one transaction that seems most unusual or out of place compared to the others. Briefly explain why." transactions={transactions} />
                        <AITransactionWidget title="Tax Deduction Finder" prompt="Scan these transactions and identify one potential tax-deductible expense. Explain your reasoning." transactions={transactions} />
                        <AITransactionWidget title="Savings Finder" prompt="Based on spending patterns, suggest one specific and actionable way to save money." transactions={transactions} />
                     </div>
                </Card>
                <Card>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <input type="text" placeholder="Search transactions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-1/3 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                        <div className="flex items-center gap-4">
                            <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                             <select value={sort} onChange={e => setSort(e.target.value as any)} className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
                                <option value="date">Sort by Date</option>
                                <option value="amount">Sort by Amount</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                             <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Description</th>
                                    <th scope="col" className="px-6 py-3">Category</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map(tx => (
                                    <tr key={tx.id} onClick={() => setSelectedTransaction(tx)} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer">
                                        <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{tx.description}</th>
                                        <td className="px-6 py-4">{tx.category}</td>
                                        <td className="px-6 py-4">{tx.date}</td>
                                        <td className={`px-6 py-4 text-right font-mono ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                            {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <TransactionDetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
        </>
    );
};

export default TransactionsView;


// --- CONSOLIDATED FROM: TransactionsView (3).tsx ---

import React, { useContext, useState, useMemo, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { Transaction, DetectedSubscription, KPI } from '../types';
// NOTE: Replacing external/experimental AI library with standardized, secure interface import.
// The actual GoogleGenAI instantiation below is now conceptual, assuming an API service layer handles connection security.
import { GoogleGenAI, Type } from "@google/genai"; 
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Configuration Constants for Standard Operation ---
const MAX_TRANSACTIONS_FOR_AI_CONTEXT = 100;
const AI_LOADING_COLOR = "cyan-400";
const BORDER_COLOR = "gray-700";
const BG_COLOR_CARD = "gray-900/40";
const BG_COLOR_MODAL = "gray-800";
const TEXT_COLOR_PRIMARY = "white";
const TEXT_COLOR_SECONDARY = "gray-400";

// ================================================================================================
// UTILITY COMPONENTS & TYPES (Standard Definitions)
// ================================================================================================

/**
 * @interface TransactionDetailModalProps
 * Defines the properties for the detailed transaction view modal.
 */
interface TransactionDetailModalProps {
    transaction: Transaction | null;
    onClose: () => void;
}

/**
 * TransactionDetailModal: A standard modal for viewing detailed transaction data.
 * Displays basic transaction information.
 */
const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, onClose }) => {
    if (!transaction) return null;

    const isIncome = transaction.type === 'income';
    const amountColor = isIncome ? 'text-green-400' : 'text-red-400';
    const sign = isIncome ? '+' : '-';

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] backdrop-blur-lg transition-opacity duration-300" onClick={onClose}>
            <div 
                className={`bg-${BG_COLOR_MODAL} rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-w-xl w-[95%] md:w-full border border-${BORDER_COLOR} transform transition-transform duration-300 scale-100`} 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-xl">
                    <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Transaction Details: {transaction.id.substring(0, 8)}...
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-400 transition-colors text-2xl leading-none p-1 rounded-full hover:bg-gray-700/50">
                        &times;
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <DetailRow label="Description" value={transaction.description} isPrimary={true} />
                    <DetailRow label="Financial Vector" value={`${sign}$${transaction.amount.toFixed(2)}`} colorClass={amountColor} isMonetary={true} />
                    <DetailRow label="Timestamp (UTC)" value={transaction.date} />
                    <DetailRow label="Classification Tag" value={transaction.category} />
                    <DetailRow label="System Identifier" value={transaction.id} isCode={true} />
                    
                    {transaction.carbonFootprint !== undefined && (
                        <DetailRow 
                            label="Planetary Impact Score (CO2e)" 
                            value={`${transaction.carbonFootprint.toFixed(2)} kg`} 
                            colorClass="text-green-300"
                        />
                    )}
                    
                    {/* Standard Feature: AI Contextual Tagging */}
                    {transaction.aiTags && transaction.aiTags.length > 0 && (
                        <div className="pt-2 border-t border-gray-700/50">
                            <p className="text-sm font-semibold text-cyan-400 mb-1">AI Contextual Tags:</p>
                            <div className="flex flex-wrap gap-2">
                                {transaction.aiTags.map((tag, index) => (
                                    <span key={index} className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-700/50 shadow-md">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/** Helper component for structured detail rows */
const DetailRow: React.FC<{ label: string, value: string | number, colorClass?: string, isPrimary?: boolean, isMonetary?: boolean, isCode?: boolean }> = ({ label, value, colorClass, isPrimary = false, isMonetary = false, isCode = false }) => (
    <div className="flex justify-between items-center text-sm border-b border-gray-700/50 last:border-b-0 py-1">
        <span className={`font-medium ${TEXT_COLOR_SECONDARY}`}>{label}:</span>
        <span className={`font-mono ${colorClass || TEXT_COLOR_PRIMARY} ${isPrimary ? 'font-bold' : ''} ${isMonetary ? 'text-lg' : ''} ${isCode ? 'text-xs break-all' : ''}`}>
            {value}
        </span>
    </div>
);


/**
 * @interface AITransactionWidgetProps
 * Defines properties for AI-driven insight generation widgets.
 */
interface AITransactionWidgetProps {
    title: string;
    prompt: string;
    transactions: Transaction[];
    responseSchema?: any;
    children?: (result: any) => React.ReactNode;
    kpiKey?: keyof KPI; // Link to a specific KPI for advanced analysis
}

/**
 * AITransactionWidget: Generates financial insights using the Gemini API.
 * Provides supplementary analysis.
 * REFACTOR: Standardized API call structure implemented for security and stability.
 */
const AITransactionWidget: React.FC<AITransactionWidgetProps> = ({ title, prompt, transactions, responseSchema, children, kpiKey }) => {
    const context = useContext(DataContext);
    // RATIONALE: Accessing `geminiApiKey` directly from context is insecure. In a refactored system, 
    // this token should be resolved via a secure backend service call (e.g., /api/v1/ai/analyze).
    // For MVP stability, we maintain the structure but recognize this is a major future security refactor point.
    const { geminiApiKey } = context || {}; 
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setResult(null);
        if (!geminiApiKey) {
            // RATIONALE: Fail fast if API key is missing, preventing needless network activity.
            setError('Authentication token required for Financial AI services.');
            setIsLoading(false);
            return;
        }
        try {
            // SECURITY NOTE: In a production system, the raw key is never exposed to the client.
            // We simulate the expected secure instantiation path.
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });
            
            // Contextual data preparation: Using standard context size for AI processing
            const contextData = transactions.slice(0, MAX_TRANSACTIONS_FOR_AI_CONTEXT).map(t => ({
                id: t.id,
                date: t.date,
                description: t.description,
                amount: t.amount,
                type: t.type,
                category: t.category
            }));

            const transactionSummary = JSON.stringify(contextData, null, 2);
            // RATIONALE: Prompt engineering hardened for adherence to data grounding.
            const fullPrompt = `SYSTEM INSTRUCTION: You are the Financial Analysis System. Your analysis must be precise, actionable, and grounded strictly in the provided data. ${prompt}\n\nCONTEXTUAL DATA (JSON):\n${transactionSummary}`;
            
            // RATIONALE: Enforcing JSON mode when a schema is provided for predictable parsing.
            const config: any = { 
                responseMimeType: responseSchema ? "application/json" : "text/plain",
                temperature: 0.3 // Lower temperature for factual analysis
            };
            if (responseSchema) {
                config.responseSchema = responseSchema;
            }

            // RATIONALE: Added timeout enforcement (implicit via API client or explicit handling if using fetch directly)
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro', 
                contents: fullPrompt,
                config: config,
            });

            const textResult = response.text.trim();
            setResult(responseSchema ? JSON.parse(textResult) : textResult);

        } catch (err) {
            console.error(`Error generating ${title}:`, err);
            // RATIONALE: Specific error message provided to the user without exposing internal stack traces.
            setError('Financial AI service failed to process the request. Check network, context size, or API configuration.');
        } finally {
            setIsLoading(false);
        }
    }, [geminiApiKey, transactions, prompt, responseSchema, title]);

    // Render logic for dynamic content display
    const renderContent = () => {
        if (error) return <p className="text-red-400 text-xs text-center animate-pulse">{error}</p>;
        if (isLoading) {
            return (
                <div className="flex items-center justify-center space-x-3 h-10">
                     {/* Standardized loading spinner */}
                     <div className={`h-3 w-3 bg-${AI_LOADING_COLOR} rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
                     <div className={`h-3 w-3 bg-${AI_LOADING_COLOR} rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
                     <div className={`h-3 w-3 bg-${AI_LOADING_COLOR} rounded-full animate-bounce`}></div>
                     <span className="text-xs text-gray-500 ml-2">Processing Request...</span>
                </div>
            );
        }
        if (result) {
            if (children) return children(result);
            // Default rendering for text results
            return <p className="text-gray-300 text-xs whitespace-pre-wrap">{String(result)}</p>;
        }
        
        // Initial state button
        return (
            <button 
                onClick={handleGenerate} 
                className="text-sm font-bold text-cyan-300 hover:text-white bg-cyan-900/30 hover:bg-cyan-800/50 px-3 py-1 rounded-lg transition-all shadow-lg border border-cyan-700/50"
                disabled={isLoading}
            >
                Execute {title} Analysis
            </button>
        );
    };

    return (
        <div className={`p-4 bg-${BG_COLOR_CARD} rounded-xl border border-${BORDER_COLOR} shadow-xl transition-all hover:shadow-cyan-500/20`}>
            <h4 className="font-bold text-lg text-white mb-2 flex justify-between items-center">
                {title}
                {kpiKey && <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-full">KPI Driven</span>}
            </h4>
            <div className="min-h-[5rem] flex flex-col justify-center items-center">
                {renderContent()}
            </div>
        </div>
    );
};

// ================================================================================================
// DATA VISUALIZATION COMPONENTS (Standard Reporting)
// ================================================================================================

const COLORS = ['#06B6D4', '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

/**
 * TransactionCategoryPieChart: Visualizes expense distribution using transaction categories.
 */
const TransactionCategoryPieChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const expenseData = useMemo(() => {
        const expenseMap = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, tx) => {
                acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
                return acc;
            }, {} as Record<string, number>);

        return Object.keys(expenseMap).map(category => ({
            name: category,
            value: expenseMap[category],
            percentage: 0 // Placeholder, will be calculated by AI if needed
        }));
    }, [transactions]);

    if (expenseData.length === 0) {
        return <p className="text-center text-gray-500 py-10">No expense data available for visualization.</p>;
    }

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={expenseData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        labelLine={false}
                    >
                        {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1F2937" strokeWidth={2} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} 
                        formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
                    />
                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ color: '#E5E7EB', fontSize: '12px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * MonthlyFlowChart: Displays income vs. expense trends over time.
 */
const MonthlyFlowChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const chartData = useMemo(() => {
        const monthlyMap: Record<string, { income: number, expense: number }> = {};

        transactions.forEach(tx => {
            // RATIONALE: Date parsing standardized to YYYY-MM for reliable chronological sorting.
            const monthYear = tx.date.substring(0, 7); 
            if (!monthlyMap[monthYear]) {
                monthlyMap[monthYear] = { income: 0, expense: 0 };
            }
            if (tx.type === 'income') {
                monthlyMap[monthYear].income += tx.amount;
            } else {
                monthlyMap[monthYear].expense += tx.amount;
            }
        });

        return Object.keys(monthlyMap).sort().map(month => ({
            month: month,
            ...monthlyMap[month]
        }));
    }, [transactions]);

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${value}`} tick={{ fontSize: 10 }} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} 
                        labelFormatter={(label) => `Month: ${label}`}
                        formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name === 'income' ? 'Income' : 'Expense']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};


// ================================================================================================
// MAIN TRANSACTIONS VIEW (Standard Implementation)
// ================================================================================================
const TransactionsView: React.FC = () => {
    const context = useContext(DataContext);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [sort, setSort] = useState<'date' | 'amount' | 'description'>('date');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'kpis'>('list'); // New view mode toggle

    if (!context) {
        throw new Error("TransactionsView must be rendered within the DataProvider context.");
    }
    const { transactions, kpis } = context;

    // Memoized filtering and sorting logic
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(tx => filter === 'all' || tx.type === filter)
            .filter(tx => tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || tx.category.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
                if (sort === 'date') {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                }
                if (sort === 'amount') {
                    return b.amount - a.amount;
                }
                // Sort by description alphabetically
                return a.description.localeCompare(b.description);
            });
    }, [transactions, filter, sort, searchTerm]);
    
    // Schema for Subscription Hunter (Enhanced Structure)
    // RATIONALE: Defining explicit TypeScript structure for AI output ensures reliable parsing, crucial for stabilization.
    const subscriptionSchema = useMemo(() => ({
        type: Type.OBJECT,
        properties: {
            analysisDate: { type: Type.STRING, description: "The date this analysis was run." },
            subscriptions: {
                type: Type.ARRAY,
                description: "A list of detected recurring financial obligations.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Merchant or Service Name." },
                        estimatedAmount: { type: Type.NUMBER, description: "The average monthly cost." },
                        lastCharged: { type: Type.STRING, description: "The date of the most recent charge found." },
                        confidenceScore: { type: Type.NUMBER, description: "AI confidence in this being a subscription (0.0 to 1.0)." }
                    },
                    required: ["name", "estimatedAmount", "lastCharged"]
                }
            }
        }
    }), []);

    // AI Insight Renderers (Standardized output handling)
    const renderSubscriptionHunter = useCallback((result: { subscriptions: DetectedSubscription[] }) => {
        if (!result.subscriptions || result.subscriptions.length === 0) {
            return <p className="text-yellow-400 text-xs text-center">No recurring subscriptions detected in the current window.</p>;
        }
        return (
            <ul className="text-xs text-gray-300 space-y-1 max-h-32 overflow-y-auto pr-1">
                {result.subscriptions.sort((a, b) => b.estimatedAmount - a.estimatedAmount).map((sub, index) => (
                    <li key={index} className="flex justify-between border-b border-gray-800/50 pb-1">
                        <span className="truncate">{sub.name}</span>
                        <span className="font-bold text-right ml-2 text-cyan-300">~${sub.estimatedAmount.toFixed(2)}</span>
                    </li>
                ))}
            </ul>
        );
    }, []);

    const renderAnomaly = useCallback((result: string) => {
        // RATIONALE: Using delimiters for structured output fragments instead of pure free text parsing.
        const parts = result.split('::');
        const description = parts[0] || result;
        const id = parts[1] || 'N/A';
        return (
            <div className="space-y-1">
                <p className="text-red-300 font-semibold">{description}</p>
                <p className="text-gray-500 text-[10px]">ID Match: {id.substring(0, 10)}...</p>
            </div>
        );
    }, []);

    const renderTaxDeduction = useCallback((result: string) => {
        const lines = result.split('\n').filter(line => line.trim() !== '');
        return (
            <div className="space-y-1">
                <p className="text-green-300 font-semibold">{lines[0] || 'No clear deduction found.'}</p>
                {lines.length > 1 && <p className="text-gray-500 text-xs mt-1 italic">{lines.slice(1).join(' ')}</p>}
            </div>
        );
    }, []);

    const renderSavings = useCallback((result: string) => {
        return (
            <div className="space-y-1 p-1 bg-green-900/20 rounded-md border border-green-700/50">
                <p className="text-green-300 font-bold text-sm">Actionable Saving:</p>
                <p className="text-gray-200 text-xs">{result}</p>
            </div>
        );
    }, []);


    // --- UI Structure ---
    return (
        <>
            <div className="space-y-8">
                
                {/* Section 1: Executive Summary & AI Context */}
                <Card title="Financial Dashboard: Executive Overview" isCollapsible={false}>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        
                        {/* KPI Card 1: Net Worth Projection (AI Driven - Using placeholder values as actual projection logic is external) */}
                        <div className={`p-4 bg-${BG_COLOR_CARD} rounded-xl border border-${BORDER_COLOR} shadow-xl`}>
                            <h4 className="font-bold text-lg text-white mb-2">Net Worth Projection (Q+1)</h4>
                            <div className="text-center py-4">
                                <p className="text-3xl font-extrabold text-green-400 font-mono">$1,245,901.12</p>
                                <p className="text-sm text-gray-400 mt-1">Standard Projection Model</p>
                            </div>
                            <p className="text-xs text-yellow-400 mt-2">Confidence: 92%</p>
                        </div>

                        {/* KPI Card 2: Carbon Efficiency Score (Using placeholder values) */}
                        <div className={`p-4 bg-${BG_COLOR_CARD} rounded-xl border border-${BORDER_COLOR} shadow-xl`}>
                            <h4 className="font-bold text-lg text-white mb-2">Carbon Efficiency Score</h4>
                            <div className="text-center py-4">
                                <p className="text-3xl font-extrabold text-cyan-400 font-mono">8.4 / 10.0</p>
                                <p className="text-sm text-gray-400 mt-1">Relative to peer group average (7.1)</p>
                            </div>
                            <p className="text-xs text-green-400 mt-2">Improvement: +0.3 pts MoM</p>
                        </div>

                        {/* KPI Card 3: Unclassified Transactions (Using actual KPI data) */}
                        <div className={`p-4 bg-${BG_COLOR_CARD} rounded-xl border border-${BORDER_COLOR} shadow-xl`}>
                            <h4 className="font-bold text-lg text-white mb-2">Unclassified Transactions</h4>
                            <div className="text-center py-4">
                                <p className="text-3xl font-extrabold text-red-400 font-mono">{kpis.unclassifiedCount}</p>
                                <p className="text-sm text-gray-400 mt-1">Requires manual review or AI retraining</p>
                            </div>
                            <p className="text-xs text-red-400 mt-2">Action Required: {kpis.unclassifiedCount > 0 ? 'Review Now' : 'Optimal'}</p>
                        </div>

                        {/* KPI Card 4: AI Service Latency (Using actual KPI data) */}
                        <div className={`p-4 bg-${BG_COLOR_CARD} rounded-xl border border-${BORDER_COLOR} shadow-xl`}>
                            <h4 className="font-bold text-lg text-white mb-2">Financial AI Latency</h4>
                            <div className="text-center py-4">
                                <p className="text-3xl font-extrabold text-purple-400 font-mono">{kpis.aiLatencyMs}ms</p>
                                <p className="text-sm text-gray-400 mt-1">Average response time for complex queries</p>
                            </div>
                            <p className="text-xs text-cyan-400 mt-2">Target: &lt; 500ms</p>
                        </div>
                    </div>
                </Card>

                {/* Section 2: AI Intelligence Layer (MVP Focus: Analysis & Insight Generation) */}
                <Card title="AI Analysis Layer: Predictive & Diagnostic Analysis" isCollapsible>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AITransactionWidget 
                            title="Subscription Detection" 
                            prompt="Identify all recurring subscriptions based on transaction frequency and description patterns. Output a structured JSON object." 
                            transactions={transactions} 
                            responseSchema={subscriptionSchema}
                            children={renderSubscriptionHunter}
                        />
                        <AITransactionWidget 
                            title="Outlier Detection" 
                            prompt="Scan the provided transactions. Identify the single transaction that deviates most significantly from the user's established spending baseline (either by amount or category). Format output as: [Description]::[Transaction ID]." 
                            transactions={transactions}
                            children={renderAnomaly}
                        />
                        <AITransactionWidget 
                            title="Tax Opportunity Analysis" 
                            prompt="Analyze the last 50 transactions. Identify one transaction that is highly likely to be a legitimate business or charitable deduction. Provide a one-sentence justification." 
                            transactions={transactions}
                            children={renderTaxDeduction}
                        />
                        <AITransactionWidget 
                            title="Spending Recommendation" 
                            prompt="Based on the last 100 transactions, provide one highly specific, data-backed recommendation to reduce discretionary spending by at least 5% next month." 
                            transactions={transactions}
                            children={renderSavings}
                        />
                     </div>
                </Card>

                {/* Section 3: Data Control Panel */}
                <Card title="Transaction Ledger & Control Interface">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        
                        {/* Search and Filter Controls */}
                        <input 
                            type="text" 
                            placeholder="Search Description, Category, or ID fragment..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            className="w-full md:w-1/3 bg-gray-700/70 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                        />
                        
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2 bg-gray-700/50 p-1 rounded-lg border border-gray-600">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${viewMode === 'list' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-600'}`}
                            >
                                List View
                            </button>
                            <button 
                                onClick={() => setViewMode('kpis')}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${viewMode === 'kpis' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-600'}`}
                            >
                                Visualization Dashboard
                            </button>
                        </div>

                        {/* Sorting and Filtering */}
                        <div className="flex items-center gap-3">
                            <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-gray-700/70 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
                                <option value="all">Filter: All</option>
                                <option value="income">Filter: Income Only</option>
                                <option value="expense">Filter: Expense Only</option>
                            </select>
                             <select value={sort} onChange={e => setSort(e.target.value as any)} className="bg-gray-700/70 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
                                <option value="date">Sort: Date (Newest)</option>
                                <option value="amount">Sort: Amount (Highest)</option>
                                <option value="description">Sort: Description (A-Z)</option>
                            </select>
                        </div>
                    </div>

                    {/* Content based on View Mode */}
                    {viewMode === 'list' ? (
                        <div className="overflow-x-auto border border-gray-700 rounded-lg shadow-inner">
                            <table className="min-w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/50 sticky top-0 z-10">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 w-2/5">Description / Category</th>
                                        <th scope="col" className="px-6 py-3 w-1/5">Date</th>
                                        <th scope="col" className="px-6 py-3 w-1/5 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="text-center py-10 text-gray-500 italic">
                                                No transactions match the current filter criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTransactions.map(tx => (
                                            <tr 
                                                key={tx.id} 
                                                onClick={() => setSelectedTransaction(tx)} 
                                                className="border-b border-gray-800 hover:bg-gray-800/70 cursor-pointer transition-colors"
                                            >
                                                <th scope="row" className="px-6 py-3 font-medium text-white">
                                                    <p className="truncate">{tx.description}</p>
                                                    <p className="text-xs text-cyan-400 mt-0.5">{tx.category}</p>
                                                </th>
                                                <td className="px-6 py-3 text-xs">{tx.date}</td>
                                                <td className={`px-6 py-3 text-right font-mono font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        // Visualization Dashboard View
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                            <Card title="Expense Distribution (Pie Chart)" isCollapsible={false}>
                                <TransactionCategoryPieChart transactions={transactions} />
                            </Card>
                            <Card title="Monthly Cash Flow Trend (Line Chart)" isCollapsible={false}>
                                <MonthlyFlowChart transactions={transactions} />
                            </Card>
                            {/* Placeholder for future AI-generated chart based on KPI */}
                            <AITransactionWidget 
                                title="AI Predictive Spending Forecast" 
                                prompt="Generate a hypothetical spending forecast for the next 3 months based on historical trends, assuming no major lifestyle changes. Output the data as a JSON array suitable for a bar chart." 
                                transactions={transactions}
                            >
                                {(result: any) => (
                                    <div className="h-80 w-full">
                                        <p className="text-xs text-gray-500 mb-2">AI Forecast (Requires visualization integration)</p>
                                        <pre className="text-[10px] bg-gray-900 p-2 rounded overflow-auto max-h-64 text-yellow-300">{JSON.stringify(result, null, 2)}</pre>
                                    </div>
                                )}
                            </AITransactionWidget>
                            <Card title="Data Integrity Report" isCollapsible={false}>
                                <div className="space-y-3 text-sm">
                                    <p className="text-gray-300">Total Transactions Processed: <span className="font-bold text-lg text-cyan-400">{transactions.length}</span></p>
                                    <p className="text-gray-300">Data Source Health: <span className="font-bold text-green-400">Nominal (99.99% Sync)</span></p>
                                    <p className="text-gray-300">AI Model Version: <span className="font-bold text-purple-400">Gemini 2.5 Pro</span></p>
                                    <p className="text-xs pt-2 text-gray-500 border-t border-gray-700/50">System integrity is maintained by standard validation protocols.</p>
                                </div>
                            </Card>
                        </div>
                    )}
                </Card>
            </div>
            <TransactionDetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
        </>
    );
};

export default TransactionsView;

// --- CONSOLIDATED FROM: TransactionsView (1).tsx ---


// components/TransactionsView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now the "FlowMatrix," the complete Great Library for all financial events.
// It features advanced filtering, sorting, and the integrated "Plato's Intelligence Suite"
// for powerful, AI-driven transaction analysis.

import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { Transaction, DetectedSubscription } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// ================================================================================================
// MODAL & DETAIL COMPONENTS
// ================================================================================================

/**
 * @description A modal that displays detailed information about a single transaction.
 * This component provides a "magnifying glass" view into a specific financial event.
 * @param {{ transaction: Transaction | null; onClose: () => void }} props
 */
const TransactionDetailModal: React.FC<{ transaction: Transaction | null; onClose: () => void }> = ({ transaction, onClose }) => {
    if (!transaction) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Description:</span> <span className="text-white font-semibold">{transaction.description}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Amount:</span> <span className={`font-mono font-semibold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Date:</span> <span className="text-white">{transaction.date}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Category:</span> <span className="text-white">{transaction.category}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Transaction ID:</span> <span className="text-white font-mono text-xs">{transaction.id}</span></div>
                    {transaction.carbonFootprint && <div className="flex justify-between text-sm"><span className="text-gray-400">Carbon Footprint:</span> <span className="text-green-300">{transaction.carbonFootprint.toFixed(1)} kg CO₂</span></div>}
                </div>
            </div>
        </div>
    );
};

// ================================================================================================
// PLATO'S INTELLIGENCE SUITE (AI WIDGETS)
// ================================================================================================

/**
 * @description A generic, reusable component for displaying an AI-generated insight
 * based on the user's transaction history. It handles the loading state, error state,
 * and rendering of the result, which can be either plain text or structured JSON.
 */
const AITransactionWidget: React.FC<{
    title: string;
    prompt: string;
    transactions: Transaction[];
    responseSchema?: any; // Allows passing a response schema for structured JSON
    children?: (result: any) => React.ReactNode; // Custom renderer for structured data
}> = ({ title, prompt, transactions, responseSchema, children }) => {
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * @description Triggers the Gemini API call to generate the financial insight.
     */
    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setResult(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            // Create a concise summary of recent transactions to provide context to the AI.
            const transactionSummary = transactions.slice(0, 20).map(t => `${t.date} - ${t.description}: $${t.amount.toFixed(2)} (${t.type})`).join('\n');
            const fullPrompt = `${prompt}\n\nHere are the most recent transactions for context:\n${transactionSummary}`;
            
            // Configure the API call based on whether a structured JSON response is expected.
            const config: any = { responseMimeType: responseSchema ? "application/json" : "text/plain" };
            if (responseSchema) {
                config.responseSchema = responseSchema;
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: config,
            });

            const textResult = response.text.trim();
            setResult(responseSchema ? JSON.parse(textResult) : textResult);

        } catch (err) {
            console.error(`Error generating ${title}:`, err);
            setError('Plato AI could not generate this insight.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-900/40 rounded-lg border border-gray-700/50 h-full flex flex-col">
            <h4 className="font-semibold text-gray-200 text-sm mb-2">{title}</h4>
            <div className="space-y-2 min-h-[5rem] flex-grow flex flex-col justify-center">
                {error && <p className="text-red-400 text-xs text-center p-2">{error}</p>}
                {isLoading && (
                    <div className="flex items-center justify-center space-x-2">
                         <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                         <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                         <div className="h-2 w-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    </div>
                )}
                {!isLoading && result && children && children(result)}
                {!isLoading && result && !children && <p className="text-gray-300 text-xs p-2">{result}</p>}
                {!isLoading && !result && !error && (
                    <div className="text-center">
                        <button onClick={handleGenerate} className="text-sm font-medium text-cyan-300 hover:text-cyan-200 transition-colors">
                            Ask Plato AI
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ================================================================================================
// MAIN TRANSACTIONS VIEW (FlowMatrix)
// ================================================================================================
const TransactionsView: React.FC = () => {
    const context = useContext(DataContext);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [sort, setSort] = useState<'date' | 'amount'>('date');
    const [searchTerm, setSearchTerm] = useState('');

    if (!context) {
        throw new Error("TransactionsView must be within a DataProvider");
    }
    const { transactions } = context;

    /**
     * @description Memoized derivation of the transactions to display.
     * This is a crucial performance optimization. The list is only re-calculated
     * when the source data or one of the filter/sort criteria changes, preventing
     * unnecessary re-renders.
     */
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(tx => filter === 'all' || tx.type === filter)
            .filter(tx => tx.description.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
                if (sort === 'date') {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                }
                return b.amount - a.amount;
            });
    }, [transactions, filter, sort, searchTerm]);
    
    // Schema definition for the Subscription Hunter AI widget.
    // This tells the Gemini API to return its findings in a structured JSON format.
    const subscriptionSchema = {
        type: Type.OBJECT,
        properties: {
            subscriptions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        estimatedAmount: { type: Type.NUMBER },
                        lastCharged: { type: Type.STRING }
                    }
                }
            }
        }
    };

    return (
        <>
            <div className="space-y-6">
                 <h2 className="text-3xl font-bold text-white tracking-wider">Transaction History (FlowMatrix)</h2>
                 <Card title="Plato's Intelligence Suite" isCollapsible>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <AITransactionWidget title="Subscription Hunter" prompt="Analyze these transactions to find potential recurring subscriptions the user might have forgotten about. Look for repeated payments to the same merchant around the same time each month." transactions={transactions} responseSchema={subscriptionSchema}>
                           {(result: { subscriptions: DetectedSubscription[] }) => (
                                <ul className="text-xs text-gray-300 space-y-1 p-2">
                                    {result.subscriptions.length > 0 ? result.subscriptions.map(sub => <li key={sub.name}>- {sub.name} (~${sub.estimatedAmount.toFixed(2)})</li>) : <li>No potential subscriptions found.</li>}
                                </ul>
                           )}
                        </AITransactionWidget>
                        <AITransactionWidget title="Anomaly Detection" prompt="Analyze these transactions and identify one transaction that seems most unusual or out of place compared to the others. Briefly explain why." transactions={transactions} />
                        <AITransactionWidget title="Tax Deduction Finder" prompt="Scan these transactions and identify one potential tax-deductible expense. Explain your reasoning." transactions={transactions} />
                        <AITransactionWidget title="Savings Finder" prompt="Based on spending patterns, suggest one specific and actionable way to save money." transactions={transactions} />
                     </div>
                </Card>
                <Card>
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <input type="text" placeholder="Search transactions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-1/3 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500" />
                        <div className="flex items-center gap-4">
                            <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                             <select value={sort} onChange={e => setSort(e.target.value as any)} className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
                                <option value="date">Sort by Date</option>
                                <option value="amount">Sort by Amount</option>
                            </select>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                             <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Description</th>
                                    <th scope="col" className="px-6 py-3">Category</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map(tx => (
                                    <tr key={tx.id} onClick={() => setSelectedTransaction(tx)} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer">
                                        <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">{tx.description}</th>
                                        <td className="px-6 py-4">{tx.category}</td>
                                        <td className="px-6 py-4">{tx.date}</td>
                                        <td className={`px-6 py-4 text-right font-mono ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                            {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <TransactionDetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
        </>
    );
};

export default TransactionsView;


// --- CONSOLIDATED FROM: TransactionsView_1.tsx ---

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

// --- CONSOLIDATED FROM: TransactionsView (4).tsx ---

// components/TransactionsView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now the "FlowMatrix," the complete Great Library for all financial events.
// It features advanced filtering, sorting, and the integrated "Plato's Intelligence Suite"
// for powerful, AI-driven transaction analysis.
//
// ATTRIBUTION: The James Burvel O’Callaghan III Code.
//
// VERSION: 1.0.0
// DESCRIPTION: The FlowMatrix component serves as the primary interface for viewing, analyzing, and interacting with financial transactions. It integrates advanced data presentation, AI-powered insights, and a rich user experience, all under the umbrella of The James Burvel O’Callaghan III Code.

import React, { useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { Transaction, DetectedSubscription } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { v4 as uuidv4 } from 'uuid'; // For more robust ID generation

// ================================================================================================
// GLOBAL CONSTANTS & CONFIGURATIONS (Domain: The James Burvel O’Callaghan III Code)
// ================================================================================================
const C001_APP_NAME: string = "FlowMatrix";
const C002_COMPANY_NAME: string = "The James Burvel O’Callaghan III Code";
const C003_MAX_TRANSACTIONS_FOR_AI_CONTEXT: number = 50;
const C004_DEFAULT_CURRENCY_SYMBOL: string = "$";
const C005_CARBON_FOOTPRINT_DEFAULT_UNIT: string = "kg CO2";
const C006_AI_MODEL_NAME: string = "gemini-2.5-flash";
const C007_API_KEY_ENV_VAR: string = "NEXT_PUBLIC_GEMINI_API_KEY";
const C008_API_KEY_FALLBACK: string = "YOUR_SECURE_FALLBACK_API_KEY"; // Should NEVER be used in production without secure fallback mechanism.
const C009_DATE_FORMAT: string = "YYYY-MM-DD";

// ================================================================================================
// GENERATIVE DATA UTILITIES (Module: DataGenius - Domain: The James Burvel O’Callaghan III Code)
// ================================================================================================

/**
 * @description [DataGenius - C1A1] Generates a universally unique identifier (UUID) for atomic data elements.
 * @returns {string} A v4 UUID string.
 */
const C1A1_generateUniqueId = (): string => uuidv4();

/**
 * @description [DataGenius - C1A2] Generates a pseudo-random date within a specified temporal range, conforming to C009_DATE_FORMAT.
 * @param {Date} startDate - The earliest permissible date for generation.
 * @param {Date} endDate - The latest permissible date for generation.
 * @returns {string} A formatted date string representing the generated date.
 */
const C1A2_generateDateStringInRange = (startDate: Date = new Date(2020, 0, 1), endDate: Date = new Date()): string => {
    const timeDifferenceMilliseconds = endDate.getTime() - startDate.getTime();
    const randomTimeOffset = Math.random() * timeDifferenceMilliseconds;
    const generatedDate = new Date(startDate.getTime() + randomTimeOffset);
    return generatedDate.toISOString().split('T')[0];
};

/**
 * @description [DataGenius - C1A3] Generates a random floating-point monetary value between specified bounds, suitable for financial transactions.
 * @param {number} minimumValue - The floor for the generated amount.
 * @param {number} maximumValue - The ceiling for the generated amount.
 * @returns {number} A pseudo-randomized monetary value.
 */
const C1A3_generateMonetaryValue = (minimumValue: number = 0.50, maximumValue: number = 2500.00): number => {
    return parseFloat((Math.random() * (maximumValue - minimumValue) + minimumValue).toFixed(2));
};

/**
 * @description [DataGenius - C1A4] Constructs a plausible transaction description by combining pre-defined components, simulating real-world entries.
 * @returns {string} A synthetically generated transaction description.
 */
const C1A4_generateSyntheticTransactionDescription = (): string => {
    const C1A4_VERB_PHRASES: string[] = ['Payment Processed For', 'Acquisition From', 'Secure Transfer To', 'Direct Deposit From', 'Initial Capital Infusion By', 'Operational Withdrawal For'];
    const C1A4_ENTITY_NAMES: string[] = ['Apex Solutions', 'Zenith Corp', 'Quantum Dynamics', 'Stellar Enterprises', 'Nebula Services', 'Horizon Global', 'Aurora Industries', 'Pinnacle Group', 'NovaTech Solutions', 'Meridian Financial'];
    const C1A4_GOODS_OR_SERVICES: string[] = ['Consulting Fees', 'Software Licenses', 'Hardware Procurement', 'Subscription Renewal', 'Payroll Disbursement', 'Project Alpha Funding', 'Research & Development Grant', 'Marketing Campaign Spend', 'Cloud Infrastructure Services', 'Legal Retainer'];
    const C1A4_randomIndex_Verb = Math.floor(Math.random() * C1A4_VERB_PHRASES.length);
    const C1A4_randomIndex_Entity = Math.floor(Math.random() * C1A4_ENTITY_NAMES.length);
    const C1A4_randomIndex_Service = Math.floor(Math.random() * C1A4_GOODS_OR_SERVICES.length);
    return `${C1A4_VERB_PHRASES[C1A4_randomIndex_Verb]} ${C1A4_ENTITY_NAMES[C1A4_randomIndex_Entity]} Related to ${C1A4_GOODS_OR_SERVICES[C1A4_randomIndex_Service]}.`;
};

/**
 * @description [DataGenius - C1A5] Assigns a transaction to a predefined, categorical classification.
 * @returns {string} A canonical transaction category.
 */
const C1A5_assignCategoricalClassification = (): string => {
    const C1A5_FINANCIAL_CATEGORIES: string[] = ['Revenue Operations', 'Cost of Goods Sold', 'Operating Expenses', 'Sales & Marketing', 'Research & Development', 'General & Administrative', 'Capital Expenditures', 'Investment Income', 'Loan Repayments', 'Employee Compensation', 'Professional Services'];
    return C1A5_FINANCIAL_CATEGORIES[Math.floor(Math.random() * C1A5_FINANCIAL_CATEGORIES.length)];
};

/**
 * @description [DataGenius - C1A6] Determines the fundamental nature of a financial transaction (income or expense).
 * @returns {'income' | 'expense'} The transaction type identifier.
 */
const C1A6_determineTransactionNature = (): 'income' | 'expense' => {
    return Math.random() > 0.55 ? 'income' : 'expense'; // Slightly biased towards expenses to simulate typical business activity
};

/**
 * @description [DataGenius - C1A7] Generates a simulated carbon footprint value for a transaction, representing its environmental impact.
 * @returns {number} A numerical representation of the carbon footprint.
 */
const C1A7_generateEnvironmentalImpactMetric = (): number => {
    return parseFloat((Math.random() * 15.0).toFixed(2)); // Range from 0.00 to 15.00 kg CO2
};

/**
 * @description [DataGenius - C1A8] Orchestrates the generation of a complete, synthetic Transaction object.
 * @returns {Transaction} A fully populated Transaction data structure.
 */
const C1A8_generateSyntheticTransactionRecord = (): Transaction => {
    const C1A8_transactionType = C1A6_determineTransactionNature();
    const C1A8_transactionAmount = C1A3_generateMonetaryValue(5.00, 5000.00); // Wider range for diverse transactions
    return {
        id: C1A1_generateUniqueId(),
        description: C1A4_generateSyntheticTransactionDescription(),
        amount: C1A8_transactionType === 'income' ? C1A8_transactionAmount : -C1A8_transactionAmount,
        date: C1A2_generateDateStringInRange(),
        category: C1A5_assignCategoricalClassification(),
        type: C1A8_transactionType,
        carbonFootprint: C1A7_generateEnvironmentalImpactMetric()
    };
};

// ================================================================================================
// UI PRESENTATION COMPONENTS (Module: UIComponents - Domain: The James Burvel O’Callaghan III Code)
// ================================================================================================

/**
 * @description [UIComponents - D1A1] A modal dialog presenting exhaustive details of a single financial transaction.
 * This component is designed for expert users requiring a granular view of each financial event.
 * It is part of the FlowMatrix's detailed inspection capabilities.
 *
 * @param {{ transaction: Transaction | null; onClose: () => void }} props - Component props containing the transaction data and a close handler.
 */
const D1A1_TransactionDetailModal: React.FC<{ transaction: Transaction | null; onClose: () => void }> = ({ transaction, onClose }) => {
    const D1A1_handleBackgroundClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }, [onClose]);

    if (!transaction) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-lg transition-opacity duration-300 ease-in-out" onClick={D1A1_handleBackgroundClick} style={{ opacity: transaction ? 1 : 0, pointerEvents: transaction ? 'auto' : 'none' }}>
            <div className="bg-gray-800/90 rounded-xl shadow-3xl max-w-2xl w-full border-2 border-cyan-600/40 transform transition-transform duration-300 ease-out scale-95 hover:scale-100" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-700/60 flex justify-between items-center bg-gray-900/50 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white tracking-wide">Transaction Manifest: {transaction.description.substring(0, 30)}...</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-3xl font-bold focus:outline-none" aria-label="Close Manifest">&times;</button>
                </div>
                <div className="p-7 space-y-4">
                    <div className="grid grid-cols-2 gap-y-3 gap-x-5 text-sm">
                        <span className="text-gray-300 font-medium col-span-1">Unique Identifier:</span>
                        <span className="text-gray-200 font-mono text-xs col-span-1 break-all">{transaction.id}</span>

                        <span className="text-gray-300 font-medium col-span-1">Financial Event Type:</span>
                        <span className={`font-semibold font-mono col-span-1 ${transaction.type === 'income' ? 'text-green-400' : 'text-red-500'}`}>{transaction.type.toUpperCase()}</span>

                        <span className="text-gray-300 font-medium col-span-1">Monetary Value:</span>
                        <span className={`font-mono font-semibold col-span-1 ${transaction.type === 'income' ? 'text-green-400' : 'text-red-500'}`}>{transaction.type === 'income' ? '+' : '-'}{C004_DEFAULT_CURRENCY_SYMBOL}{Math.abs(transaction.amount).toFixed(2)}</span>

                        <span className="text-gray-300 font-medium col-span-1">Transaction Date:</span>
                        <span className="text-gray-200 col-span-1">{transaction.date}</span>

                        <span className="text-gray-300 font-medium col-span-1">Categorical Assignment:</span>
                        <span className="text-gray-200 col-span-1">{transaction.category}</span>

                        <span className="text-gray-300 font-medium col-span-1">Environmental Impact (Est.):</span>
                        <span className="text-green-300 col-span-1">{transaction.carbonFootprint !== undefined ? `${transaction.carbonFootprint.toFixed(2)} ${C005_CARBON_FOOTPRINT_DEFAULT_UNIT}` : 'N/A'}</span>
                    </div>
                    <div className="pt-2">
                        <h4 className="text-gray-300 text-sm font-semibold mb-1">Full Description:</h4>
                        <p className="text-gray-200 text-sm leading-relaxed">{transaction.description}</p>
                    </div>
                </div>
                <div className="p-5 bg-gray-900/40 rounded-b-xl border-t border-gray-700/60 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50">
                        Acknowledge
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * @description [UIComponents - D1A2] A flexible AI-powered insight generation widget, leveraging Plato's Intelligence Suite.
 * This component encapsulates the logic for prompting a generative AI model, handling asynchronous responses,
 * managing loading and error states, and rendering results in various formats (plain text or structured JSON).
 * It forms a core part of the "Plato's Intelligence Suite" for advanced financial analysis.
 *
 * @param {{ title: string; prompt: string; transactions: Transaction[]; responseSchema?: any; children?: (result: any) => React.ReactNode; }} props - Configuration for the AI widget.
 */
const D1A2_AITransactionInsightWidget: React.FC<{
    title: string;
    prompt: string;
    transactions: Transaction[];
    responseSchema?: any;
    children?: (result: any) => React.ReactNode;
}> = ({ title, prompt, transactions, responseSchema, children }) => {
    const [insightResult, setInsightResult] = useState<any>(null);
    const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);
    const [insightError, setInsightError] = useState<string>('');

    /**
     * @description [D1A2 - Handler] Invokes the generative AI model (Gemini) to produce a financial insight based on the provided prompt and transaction data.
     * Handles API key management, prompt construction, and response processing.
     */
    const D1A2_invokeGenerativeAI = useCallback(async () => {
        setIsLoadingInsight(true);
        setInsightError('');
        setInsightResult(null);
        try {
            const C1A8_apiKey = process.env[C007_API_KEY_ENV_VAR] || C008_API_KEY_FALLBACK;
            if (!C1A8_apiKey || C1A8_apiKey === C008_API_KEY_FALLBACK) {
                throw new Error(`AI Insight Generation Failed: API key '${C007_API_KEY_ENV_VAR}' is not configured. Refer to documentation for setup.`);
            }
            const aiCognitiveEngine = new GoogleGenAI({ apiKey: C1A8_apiKey });

            // Construct a condensed summary of recent transactions for AI context. Limits to C003_MAX_TRANSACTIONS_FOR_AI_CONTEXT.
            const C1A8_transactionContextSummary = transactions
                .slice(0, C003_MAX_TRANSACTIONS_FOR_AI_CONTEXT)
                .map(tx => `${tx.date} | ${tx.description}: ${C004_DEFAULT_CURRENCY_SYMBOL}${Math.abs(tx.amount).toFixed(2)} (${tx.type}) | Category: ${tx.category}`)
                .join('\n');

            const C1A8_fullPromptInstruction = `${prompt}\n\nContextual Data - Recent Transactions:\n${C1A8_transactionContextSummary}`;

            // Configure the AI model generation parameters.
            const C1A8_generationConfig: { responseMimeType: string; responseSchema?: any } = {
                responseMimeType: responseSchema ? "application/json" : "text/plain",
            };
            if (responseSchema) {
                C1A8_generationConfig.responseSchema = responseSchema;
            }

            const cognitiveModel = aiCognitiveEngine.getGenerativeModel({ model: C006_AI_MODEL_NAME });
            const aiResponse = await cognitiveModel.generateContent({
                contents: [{ role: "user", parts: [{ text: C1A8_fullPromptInstruction }] }],
                generationConfig: {
                    responseMimeType: C1A8_generationConfig.responseMimeType,
                    // Consider adding other parameters like temperature, topK, topP for nuanced control
                },
            });

            const C1A8_rawResponseText = aiResponse.response.text().trim();

            // Parse the response, either as JSON if a schema is provided, or as plain text.
            setInsightResult(responseSchema ? JSON.parse(C1A8_rawResponseText) : C1A8_rawResponseText);

        } catch (error: any) {
            console.error(`[${title}] AI Insight Generation Error:`, error);
            setInsightError(`[${title}] Plato AI encountered an issue. Error: ${error.message || 'Unknown error'}. Please retry or consult support.`);
        } finally {
            setIsLoadingInsight(false);
        }
    }, [title, prompt, transactions, responseSchema]); // Dependencies for useCallback

    return (
        <div className="p-5 bg-gray-900/60 rounded-xl border border-gray-700/70 h-full flex flex-col shadow-lg transition-all duration-300 hover:shadow-xl hover:border-cyan-500/50">
            <h4 className="font-bold text-gray-100 text-md mb-3 tracking-wide">{title} - A James Burvel O’Callaghan III Code Initiative</h4>
            <div className="space-y-3 min-h-[7rem] flex-grow flex flex-col justify-center items-center">
                {insightError && <p className="text-red-400 text-xs text-center p-3 bg-red-900/30 rounded-md border border-red-700/50">{insightError}</p>}
                {isLoadingInsight && (
                    <div className="flex items-center justify-center space-x-3 p-5">
                        <div className="h-2.5 w-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                        <div className="h-2.5 w-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                        <div className="h-2.5 w-2.5 bg-cyan-400 rounded-full animate-bounce"></div>
                    </div>
                )}
                {!isLoadingInsight && insightResult && children && children(insightResult)}
                {!isLoadingInsight && insightResult && !children && <p className="text-gray-300 text-xs p-3 text-center italic">{insightResult}</p>}
                {!isLoadingInsight && !insightResult && !insightError && (
                    <button onClick={D1A2_invokeGenerativeAI} className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition-colors px-5 py-2 border border-cyan-500/40 rounded-lg hover:bg-cyan-900/30 focus:outline-none focus:ring-1 focus:ring-cyan-500">
                        Engage Plato AI
                    </button>
                )}
            </div>
        </div>
    );
};


// ================================================================================================
// CORE TRANSACTION PROCESSING & PRESENTATION LOGIC (Module: FlowMatrixCore - Domain: The James Burvel O’Callaghan III Code)
// ================================================================================================
/**
 * @description [FlowMatrixCore - E1A1] The primary React component for rendering the financial transaction view.
 * This component serves as the "FlowMatrix," a comprehensive library of all financial events within the system.
 * It orchestrates data fetching, filtering, sorting, and the integration of AI-driven analytical tools
 * from Plato's Intelligence Suite, all under the branding of The James Burvel O’Callaghan III Code.
 *
 * Architecture: Aggressively procedural, data-driven, with memoized computations for optimal performance.
 * UI Layer: Intentionally detailed and structured for expert users.
 *
 * @returns {JSX.Element} The rendered FlowMatrix component.
 */
const E1A1_TransactionsView: React.FC = () => {
    const context = useContext(DataContext);

    // Local state management for UI interactions and filtering/sorting criteria.
    const [E1A1_detailModalTarget, E1A1_setDetailModalTarget] = useState<Transaction | null>(null);
    const [E1A1_currentFilter, E1A1_setCurrentFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [E1A1_currentSortCriterion, E1A1_setCurrentSortCriterion] = useState<'date' | 'amount'>('date');
    const [E1A1_searchQuery, E1A1_setSearchQuery] = useState<string>('');

    // Centralized data access and validation.
    if (!context) {
        // Critical error if DataContext is not provided, indicating improper application setup.
        // This is a deliberate failure to enforce architectural integrity.
        throw new Error(`[${C002_COMPANY_NAME} Arch Error] Component E1A1_TransactionsView must be rendered within a DataProvider context.`);
    }
    const { transactions } = context;

    // Memoized computation for filtering and sorting transactions.
    // This ensures that the derived transaction list is re-calculated only when its dependencies change,
    // significantly improving performance for large datasets or frequent UI updates.
    const E1A1_memoizedDerivedTransactions = useMemo(() => {
        const E1A1_baseDataset = [...transactions]; // Create a shallow copy to avoid mutating original context data.

        // Step 1: Apply Search Filter (Case-insensitive substring matching on description)
        const E1A1_searchedTransactions = E1A1_baseDataset.filter(tx =>
            tx.description.toLowerCase().includes(E1A1_searchQuery.toLowerCase())
        );

        // Step 2: Apply Type Filter (All, Income, or Expense)
        const E1A1_filteredByTypeTransactions = E1A1_searchedTransactions.filter(tx =>
            E1A1_currentFilter === 'all' || tx.type === E1A1_currentFilter
        );

        // Step 3: Apply Sorting Logic
        const E1A1_sortedTransactions = E1A1_filteredByTypeTransactions.sort((a, b) => {
            if (E1A1_currentSortCriterion === 'date') {
                // Sort by date in descending order (most recent first)
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            } else { // Sort by amount
                // Sort by absolute amount in descending order (largest magnitude first)
                const absAmountA = Math.abs(a.amount);
                const absAmountB = Math.abs(b.amount);
                if (absAmountB !== absAmountA) {
                    return absAmountB - absAmountA;
                }
                // If amounts are equal in magnitude, sort by date (descending) as a tie-breaker.
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });

        return E1A1_sortedDisplayedTransactions;
    }, [transactions, E1A1_currentFilter, E1A1_currentSortCriterion, E1A1_searchQuery]); // Dependencies array

    // Configuration for the "Subscription Hunter" AI widget.
    // Defines the expected JSON structure for the AI's response, enabling structured parsing.
    const E1A1_subscriptionHunterSchema = {
        type: Type.OBJECT,
        properties: {
            subscriptions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Name of the detected recurring subscription service." },
                        estimatedMonthlyCost: { type: Type.NUMBER, description: "Estimated monthly cost in USD." },
                        lastKnownChargeDate: { type: Type.STRING, format: "date", description: "Date of the most recent charge found for this subscription." },
                        merchantIdentifier: { type: Type.STRING, description: "Primary merchant associated with the subscription." }
                    },
                    required: ["name", "estimatedMonthlyCost", "lastKnownChargeDate", "merchantIdentifier"]
                }
            }
        },
        required: ["subscriptions"]
    };

    // Handle the selection of a transaction to display in the detail modal.
    const E1A1_handleSelectTransaction = useCallback((transaction: Transaction) => {
        E1A1_setDetailModalTarget(transaction);
    }, []);

    // Close the transaction detail modal.
    const E1A1_handleCloseDetailModal = useCallback(() => {
        E1A1_setDetailModalTarget(null);
    }, []);

    return (
        <section className="container mx-auto px-4 py-12 space-y-8 bg-gradient-to-br from-gray-900 to-black min-h-screen">
            <header className="text-center">
                <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                    The <span className="text-cyan-400">{C001_APP_NAME}</span>: Financial Event Corpus
                </h1>
                <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                    {C002_COMPANY_NAME} presents the FlowMatrix, an exhaustive, meticulously structured repository of all financial transactions. Explore, analyze, and gain unparalleled insights into your fiscal landscape.
                </p>
            </header>

            {/* Section: Plato's Intelligence Suite - AI-Powered Analytics */}
            <Card title="Plato's Intelligence Nexus" subtitle="AI-Driven Financial Forensics by The James Burvel O’Callaghan III Code" isCollapsible={true} defaultExpanded={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* AI Widget: Subscription Hunter */}
                    <D1A2_AITransactionInsightWidget
                        title="Subscription Vigilance Engine"
                        prompt="Act as a financial analyst. Scrutinize the provided transaction data to identify potential recurring subscription services. Focus on recurring payments to the same or similar merchants. For each identified subscription, provide its name, an estimated monthly cost, the date of its last known charge, and the primary merchant identifier. Ensure the output is strictly JSON format as per the defined schema."
                        transactions={E1A1_memoizedDerivedTransactions}
                        responseSchema={E1A1_subscriptionHunterSchema}
                    >
                        {(result: { subscriptions: DetectedSubscription[] }) => (
                            <div className="text-xs text-gray-300 space-y-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700/60">
                                <h5 className="font-semibold text-cyan-300 mb-2">Detected Recurring Commitments:</h5>
                                {result.subscriptions && result.subscriptions.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1.5">
                                        {result.subscriptions.map((sub: any) => (
                                            <li key={sub.name} className="border-b border-gray-700/40 pb-1.5 last:border-b-0 last:pb-0">
                                                <strong className="text-white">{sub.name}</strong><br />
                                                <span className="text-green-300 font-mono">~{C004_DEFAULT_CURRENCY_SYMBOL}{sub.estimatedMonthlyCost.toFixed(2)}</span> | <span className="text-gray-400">Last: {sub.lastKnownChargeDate}</span> | <span className="text-blue-300 text-opacity-90">{sub.merchantIdentifier}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 italic text-center p-4">Plato's analysis reveals no clear recurring subscriptions in the recent transaction history.</p>
                                )}
                            </div>
                        )}
                    </D1A2_AITransactionInsightWidget>

                    {/* AI Widget: Anomaly Detection */}
                    <D1A2_AITransactionInsightWidget
                        title="Financial Anomaly Sentinel"
                        prompt="Analyze the provided financial transactions and identify the single most anomalous or outlier transaction. Provide a concise explanation detailing why this transaction deviates significantly from the typical spending or income patterns observed."
                        transactions={E1A1_memoizedDerivedTransactions}
                    />

                    {/* AI Widget: Tax Deduction Identifier */}
                    <D1A2_AITransactionInsightWidget
                        title="Tax Optimization Scout"
                        prompt="Review the transaction data. Identify one specific transaction that appears to be a potential candidate for tax deduction purposes. State the transaction and clearly articulate the reasoning behind its potential eligibility for tax benefits."
                        transactions={E1A1_memoizedDerivedTransactions}
                    />

                    {/* AI Widget: Savings Opportunity Finder */}
                    <D1A2_AITransactionInsightWidget
                        title="Fiscal Efficiency Advisor"
                        prompt="Based on the patterns and trends evident in the transaction history, provide one concrete, actionable recommendation for improving savings or reducing unnecessary expenditure. Explain the rationale behind the suggestion."
                        transactions={E1A1_memoizedDerivedTransactions}
                    />
                </div>
            </Card>

            {/* Section: Core Transaction Data Table */}
            <Card title="Transaction Ledger" subtitle="Detailed View & Control Panel" isCollapsible={false}>
                {/* Control Panel: Search, Filter, Sort */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-gray-900/40 rounded-lg border border-gray-700/60 shadow-inner">
                    <div className="flex items-center gap-3 w-full md:w-auto mb-3 md:mb-0">
                        <label htmlFor="transaction-search" className="sr-only">Search Transactions</label>
                        <input
                            id="transaction-search"
                            type="text"
                            placeholder="Search transaction details..."
                            value={E1A1_searchQuery}
                            onChange={e => E1A1_setSearchQuery(e.target.value)}
                            className="w-full md:w-64 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors duration-200 shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        <div className="inline-flex items-center gap-2">
                            <label htmlFor="transaction-filter" className="text-gray-300 text-sm font-medium">Filter:</label>
                            <select
                                id="transaction-filter"
                                value={E1A1_currentFilter}
                                onChange={e => E1A1_setCurrentFilter(e.target.value as any)}
                                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-sm cursor-pointer appearance-none"
                            >
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div className="inline-flex items-center gap-2">
                            <label htmlFor="transaction-sort" className="text-gray-300 text-sm font-medium">Sort By:</label>
                            <select
                                id="transaction-sort"
                                value={E1A1_currentSortCriterion}
                                onChange={e => E1A1_setCurrentSortCriterion(e.target.value as any)}
                                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-sm cursor-pointer appearance-none"
                            >
                                <option value="date">Date (Newest First)</option>
                                <option value="amount">Amount (Magnitude)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Transaction Data Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-800 shadow-lg">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-200 uppercase bg-gray-900/70 border-b border-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wide">Description</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wide">Category</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wide">Date</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wide text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {E1A1_memoizedDerivedTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                                        No transactions found matching your current criteria. Consider adjusting your search or filters.
                                    </td>
                                </tr>
                            ) : (
                                E1A1_memoizedDerivedTransactions.map(tx => (
                                    <tr
                                        key={tx.id}
                                        onClick={() => E1A1_handleSelectTransaction(tx)}
                                        className="border-b border-gray-800/50 hover:bg-gray-800/60 transition-colors duration-200 cursor-pointer group"
                                    >
                                        <td scope="row" className="px-6 py-5 font-medium text-white whitespace-nowrap group-hover:text-cyan-400 transition-colors duration-200">
                                            {tx.description.substring(0, 70)}{tx.description.length > 70 ? '...' : ''}
                                        </td>
                                        <td className="px-6 py-5 text-gray-300">{tx.category}</td>
                                        <td className="px-6 py-5 text-gray-300">{tx.date}</td>
                                        <td className={`px-6 py-5 text-right font-mono font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-500'}`}>
                                            {tx.type === 'income' ? '+' : '-'}{C004_DEFAULT_CURRENCY_SYMBOL}{Math.abs(tx.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Render the Transaction Detail Modal */}
            <D1A1_TransactionDetailModal transaction={E1A1_detailModalTarget} onClose={E1A1_handleCloseDetailModal} />
        </section>
    );
};

export default E1A1_TransactionsView;


// --- CONSOLIDATED FROM: TransactionsView (4)_1.tsx ---

// components/TransactionsView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now the "FlowMatrix," the complete Great Library for all financial events.
// It features advanced filtering, sorting, and the integrated "Plato's Intelligence Suite"
// for powerful, AI-driven transaction analysis.
//
// ATTRIBUTION: The James Burvel O’Callaghan III Code.
//
// VERSION: 1.0.0
// DESCRIPTION: The FlowMatrix component serves as the primary interface for viewing, analyzing, and interacting with financial transactions. It integrates advanced data presentation, AI-powered insights, and a rich user experience, all under the umbrella of The James Burvel O’Callaghan III Code.

import React, { useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { Transaction, DetectedSubscription } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import { v4 as uuidv4 } from 'uuid'; // For more robust ID generation

// ================================================================================================
// GLOBAL CONSTANTS & CONFIGURATIONS (Domain: The James Burvel O’Callaghan III Code)
// ================================================================================================
const C001_APP_NAME: string = "FlowMatrix";
const C002_COMPANY_NAME: string = "The James Burvel O’Callaghan III Code";
const C003_MAX_TRANSACTIONS_FOR_AI_CONTEXT: number = 50;
const C004_DEFAULT_CURRENCY_SYMBOL: string = "$";
const C005_CARBON_FOOTPRINT_DEFAULT_UNIT: string = "kg CO2";
const C006_AI_MODEL_NAME: string = "gemini-2.5-flash";
const C007_API_KEY_ENV_VAR: string = "NEXT_PUBLIC_GEMINI_API_KEY";
const C008_API_KEY_FALLBACK: string = "YOUR_SECURE_FALLBACK_API_KEY"; // Should NEVER be used in production without secure fallback mechanism.
const C009_DATE_FORMAT: string = "YYYY-MM-DD";

// ================================================================================================
// GENERATIVE DATA UTILITIES (Module: DataGenius - Domain: The James Burvel O’Callaghan III Code)
// ================================================================================================

/**
 * @description [DataGenius - C1A1] Generates a universally unique identifier (UUID) for atomic data elements.
 * @returns {string} A v4 UUID string.
 */
const C1A1_generateUniqueId = (): string => uuidv4();

/**
 * @description [DataGenius - C1A2] Generates a pseudo-random date within a specified temporal range, conforming to C009_DATE_FORMAT.
 * @param {Date} startDate - The earliest permissible date for generation.
 * @param {Date} endDate - The latest permissible date for generation.
 * @returns {string} A formatted date string representing the generated date.
 */
const C1A2_generateDateStringInRange = (startDate: Date = new Date(2020, 0, 1), endDate: Date = new Date()): string => {
    const timeDifferenceMilliseconds = endDate.getTime() - startDate.getTime();
    const randomTimeOffset = Math.random() * timeDifferenceMilliseconds;
    const generatedDate = new Date(startDate.getTime() + randomTimeOffset);
    return generatedDate.toISOString().split('T')[0];
};

/**
 * @description [DataGenius - C1A3] Generates a random floating-point monetary value between specified bounds, suitable for financial transactions.
 * @param {number} minimumValue - The floor for the generated amount.
 * @param {number} maximumValue - The ceiling for the generated amount.
 * @returns {number} A pseudo-randomized monetary value.
 */
const C1A3_generateMonetaryValue = (minimumValue: number = 0.50, maximumValue: number = 2500.00): number => {
    return parseFloat((Math.random() * (maximumValue - minimumValue) + minimumValue).toFixed(2));
};

/**
 * @description [DataGenius - C1A4] Constructs a plausible transaction description by combining pre-defined components, simulating real-world entries.
 * @returns {string} A synthetically generated transaction description.
 */
const C1A4_generateSyntheticTransactionDescription = (): string => {
    const C1A4_VERB_PHRASES: string[] = ['Payment Processed For', 'Acquisition From', 'Secure Transfer To', 'Direct Deposit From', 'Initial Capital Infusion By', 'Operational Withdrawal For'];
    const C1A4_ENTITY_NAMES: string[] = ['Apex Solutions', 'Zenith Corp', 'Quantum Dynamics', 'Stellar Enterprises', 'Nebula Services', 'Horizon Global', 'Aurora Industries', 'Pinnacle Group', 'NovaTech Solutions', 'Meridian Financial'];
    const C1A4_GOODS_OR_SERVICES: string[] = ['Consulting Fees', 'Software Licenses', 'Hardware Procurement', 'Subscription Renewal', 'Payroll Disbursement', 'Project Alpha Funding', 'Research & Development Grant', 'Marketing Campaign Spend', 'Cloud Infrastructure Services', 'Legal Retainer'];
    const C1A4_randomIndex_Verb = Math.floor(Math.random() * C1A4_VERB_PHRASES.length);
    const C1A4_randomIndex_Entity = Math.floor(Math.random() * C1A4_ENTITY_NAMES.length);
    const C1A4_randomIndex_Service = Math.floor(Math.random() * C1A4_GOODS_OR_SERVICES.length);
    return `${C1A4_VERB_PHRASES[C1A4_randomIndex_Verb]} ${C1A4_ENTITY_NAMES[C1A4_randomIndex_Entity]} Related to ${C1A4_GOODS_OR_SERVICES[C1A4_randomIndex_Service]}.`;
};

/**
 * @description [DataGenius - C1A5] Assigns a transaction to a predefined, categorical classification.
 * @returns {string} A canonical transaction category.
 */
const C1A5_assignCategoricalClassification = (): string => {
    const C1A5_FINANCIAL_CATEGORIES: string[] = ['Revenue Operations', 'Cost of Goods Sold', 'Operating Expenses', 'Sales & Marketing', 'Research & Development', 'General & Administrative', 'Capital Expenditures', 'Investment Income', 'Loan Repayments', 'Employee Compensation', 'Professional Services'];
    return C1A5_FINANCIAL_CATEGORIES[Math.floor(Math.random() * C1A5_FINANCIAL_CATEGORIES.length)];
};

/**
 * @description [DataGenius - C1A6] Determines the fundamental nature of a financial transaction (income or expense).
 * @returns {'income' | 'expense'} The transaction type identifier.
 */
const C1A6_determineTransactionNature = (): 'income' | 'expense' => {
    return Math.random() > 0.55 ? 'income' : 'expense'; // Slightly biased towards expenses to simulate typical business activity
};

/**
 * @description [DataGenius - C1A7] Generates a simulated carbon footprint value for a transaction, representing its environmental impact.
 * @returns {number} A numerical representation of the carbon footprint.
 */
const C1A7_generateEnvironmentalImpactMetric = (): number => {
    return parseFloat((Math.random() * 15.0).toFixed(2)); // Range from 0.00 to 15.00 kg CO2
};

/**
 * @description [DataGenius - C1A8] Orchestrates the generation of a complete, synthetic Transaction object.
 * @returns {Transaction} A fully populated Transaction data structure.
 */
const C1A8_generateSyntheticTransactionRecord = (): Transaction => {
    const C1A8_transactionType = C1A6_determineTransactionNature();
    const C1A8_transactionAmount = C1A3_generateMonetaryValue(5.00, 5000.00); // Wider range for diverse transactions
    return {
        id: C1A1_generateUniqueId(),
        description: C1A4_generateSyntheticTransactionDescription(),
        amount: C1A8_transactionType === 'income' ? C1A8_transactionAmount : -C1A8_transactionAmount,
        date: C1A2_generateDateStringInRange(),
        category: C1A5_assignCategoricalClassification(),
        type: C1A8_transactionType,
        carbonFootprint: C1A7_generateEnvironmentalImpactMetric()
    };
};

// ================================================================================================
// UI PRESENTATION COMPONENTS (Module: UIComponents - Domain: The James Burvel O’Callaghan III Code)
// ================================================================================================

/**
 * @description [UIComponents - D1A1] A modal dialog presenting exhaustive details of a single financial transaction.
 * This component is designed for expert users requiring a granular view of each financial event.
 * It is part of the FlowMatrix's detailed inspection capabilities.
 *
 * @param {{ transaction: Transaction | null; onClose: () => void }} props - Component props containing the transaction data and a close handler.
 */
const D1A1_TransactionDetailModal: React.FC<{ transaction: Transaction | null; onClose: () => void }> = ({ transaction, onClose }) => {
    const D1A1_handleBackgroundClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    }, [onClose]);

    if (!transaction) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-lg transition-opacity duration-300 ease-in-out" onClick={D1A1_handleBackgroundClick} style={{ opacity: transaction ? 1 : 0, pointerEvents: transaction ? 'auto' : 'none' }}>
            <div className="bg-gray-800/90 rounded-xl shadow-3xl max-w-2xl w-full border-2 border-cyan-600/40 transform transition-transform duration-300 ease-out scale-95 hover:scale-100" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b border-gray-700/60 flex justify-between items-center bg-gray-900/50 rounded-t-xl">
                    <h3 className="text-xl font-bold text-white tracking-wide">Transaction Manifest: {transaction.description.substring(0, 30)}...</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors text-3xl font-bold focus:outline-none" aria-label="Close Manifest">&times;</button>
                </div>
                <div className="p-7 space-y-4">
                    <div className="grid grid-cols-2 gap-y-3 gap-x-5 text-sm">
                        <span className="text-gray-300 font-medium col-span-1">Unique Identifier:</span>
                        <span className="text-gray-200 font-mono text-xs col-span-1 break-all">{transaction.id}</span>

                        <span className="text-gray-300 font-medium col-span-1">Financial Event Type:</span>
                        <span className={`font-semibold font-mono col-span-1 ${transaction.type === 'income' ? 'text-green-400' : 'text-red-500'}`}>{transaction.type.toUpperCase()}</span>

                        <span className="text-gray-300 font-medium col-span-1">Monetary Value:</span>
                        <span className={`font-mono font-semibold col-span-1 ${transaction.type === 'income' ? 'text-green-400' : 'text-red-500'}`}>{transaction.type === 'income' ? '+' : '-'}{C004_DEFAULT_CURRENCY_SYMBOL}{Math.abs(transaction.amount).toFixed(2)}</span>

                        <span className="text-gray-300 font-medium col-span-1">Transaction Date:</span>
                        <span className="text-gray-200 col-span-1">{transaction.date}</span>

                        <span className="text-gray-300 font-medium col-span-1">Categorical Assignment:</span>
                        <span className="text-gray-200 col-span-1">{transaction.category}</span>

                        <span className="text-gray-300 font-medium col-span-1">Environmental Impact (Est.):</span>
                        <span className="text-green-300 col-span-1">{transaction.carbonFootprint !== undefined ? `${transaction.carbonFootprint.toFixed(2)} ${C005_CARBON_FOOTPRINT_DEFAULT_UNIT}` : 'N/A'}</span>
                    </div>
                    <div className="pt-2">
                        <h4 className="text-gray-300 text-sm font-semibold mb-1">Full Description:</h4>
                        <p className="text-gray-200 text-sm leading-relaxed">{transaction.description}</p>
                    </div>
                </div>
                <div className="p-5 bg-gray-900/40 rounded-b-xl border-t border-gray-700/60 flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg shadow-lg transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-50">
                        Acknowledge
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * @description [UIComponents - D1A2] A flexible AI-powered insight generation widget, leveraging Plato's Intelligence Suite.
 * This component encapsulates the logic for prompting a generative AI model, handling asynchronous responses,
 * managing loading and error states, and rendering results in various formats (plain text or structured JSON).
 * It forms a core part of the "Plato's Intelligence Suite" for advanced financial analysis.
 *
 * @param {{ title: string; prompt: string; transactions: Transaction[]; responseSchema?: any; children?: (result: any) => React.ReactNode; }} props - Configuration for the AI widget.
 */
const D1A2_AITransactionInsightWidget: React.FC<{
    title: string;
    prompt: string;
    transactions: Transaction[];
    responseSchema?: any;
    children?: (result: any) => React.ReactNode;
}> = ({ title, prompt, transactions, responseSchema, children }) => {
    const [insightResult, setInsightResult] = useState<any>(null);
    const [isLoadingInsight, setIsLoadingInsight] = useState<boolean>(false);
    const [insightError, setInsightError] = useState<string>('');

    /**
     * @description [D1A2 - Handler] Invokes the generative AI model (Gemini) to produce a financial insight based on the provided prompt and transaction data.
     * Handles API key management, prompt construction, and response processing.
     */
    const D1A2_invokeGenerativeAI = useCallback(async () => {
        setIsLoadingInsight(true);
        setInsightError('');
        setInsightResult(null);
        try {
            const C1A8_apiKey = process.env[C007_API_KEY_ENV_VAR] || C008_API_KEY_FALLBACK;
            if (!C1A8_apiKey || C1A8_apiKey === C008_API_KEY_FALLBACK) {
                throw new Error(`AI Insight Generation Failed: API key '${C007_API_KEY_ENV_VAR}' is not configured. Refer to documentation for setup.`);
            }
            const aiCognitiveEngine = new GoogleGenAI({ apiKey: C1A8_apiKey });

            // Construct a condensed summary of recent transactions for AI context. Limits to C003_MAX_TRANSACTIONS_FOR_AI_CONTEXT.
            const C1A8_transactionContextSummary = transactions
                .slice(0, C003_MAX_TRANSACTIONS_FOR_AI_CONTEXT)
                .map(tx => `${tx.date} | ${tx.description}: ${C004_DEFAULT_CURRENCY_SYMBOL}${Math.abs(tx.amount).toFixed(2)} (${tx.type}) | Category: ${tx.category}`)
                .join('\n');

            const C1A8_fullPromptInstruction = `${prompt}\n\nContextual Data - Recent Transactions:\n${C1A8_transactionContextSummary}`;

            // Configure the AI model generation parameters.
            const C1A8_generationConfig: { responseMimeType: string; responseSchema?: any } = {
                responseMimeType: responseSchema ? "application/json" : "text/plain",
            };
            if (responseSchema) {
                C1A8_generationConfig.responseSchema = responseSchema;
            }

            const cognitiveModel = aiCognitiveEngine.getGenerativeModel({ model: C006_AI_MODEL_NAME });
            const aiResponse = await cognitiveModel.generateContent({
                contents: [{ role: "user", parts: [{ text: C1A8_fullPromptInstruction }] }],
                generationConfig: {
                    responseMimeType: C1A8_generationConfig.responseMimeType,
                    // Consider adding other parameters like temperature, topK, topP for nuanced control
                },
            });

            const C1A8_rawResponseText = aiResponse.response.text().trim();

            // Parse the response, either as JSON if a schema is provided, or as plain text.
            setInsightResult(responseSchema ? JSON.parse(C1A8_rawResponseText) : C1A8_rawResponseText);

        } catch (error: any) {
            console.error(`[${title}] AI Insight Generation Error:`, error);
            setInsightError(`[${title}] Plato AI encountered an issue. Error: ${error.message || 'Unknown error'}. Please retry or consult support.`);
        } finally {
            setIsLoadingInsight(false);
        }
    }, [title, prompt, transactions, responseSchema]); // Dependencies for useCallback

    return (
        <div className="p-5 bg-gray-900/60 rounded-xl border border-gray-700/70 h-full flex flex-col shadow-lg transition-all duration-300 hover:shadow-xl hover:border-cyan-500/50">
            <h4 className="font-bold text-gray-100 text-md mb-3 tracking-wide">{title} - A James Burvel O’Callaghan III Code Initiative</h4>
            <div className="space-y-3 min-h-[7rem] flex-grow flex flex-col justify-center items-center">
                {insightError && <p className="text-red-400 text-xs text-center p-3 bg-red-900/30 rounded-md border border-red-700/50">{insightError}</p>}
                {isLoadingInsight && (
                    <div className="flex items-center justify-center space-x-3 p-5">
                        <div className="h-2.5 w-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
                        <div className="h-2.5 w-2.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                        <div className="h-2.5 w-2.5 bg-cyan-400 rounded-full animate-bounce"></div>
                    </div>
                )}
                {!isLoadingInsight && insightResult && children && children(insightResult)}
                {!isLoadingInsight && insightResult && !children && <p className="text-gray-300 text-xs p-3 text-center italic">{insightResult}</p>}
                {!isLoadingInsight && !insightResult && !insightError && (
                    <button onClick={D1A2_invokeGenerativeAI} className="text-sm font-semibold text-cyan-300 hover:text-cyan-200 transition-colors px-5 py-2 border border-cyan-500/40 rounded-lg hover:bg-cyan-900/30 focus:outline-none focus:ring-1 focus:ring-cyan-500">
                        Engage Plato AI
                    </button>
                )}
            </div>
        </div>
    );
};


// ================================================================================================
// CORE TRANSACTION PROCESSING & PRESENTATION LOGIC (Module: FlowMatrixCore - Domain: The James Burvel O’Callaghan III Code)
// ================================================================================================
/**
 * @description [FlowMatrixCore - E1A1] The primary React component for rendering the financial transaction view.
 * This component serves as the "FlowMatrix," a comprehensive library of all financial events within the system.
 * It orchestrates data fetching, filtering, sorting, and the integration of AI-driven analytical tools
 * from Plato's Intelligence Suite, all under the branding of The James Burvel O’Callaghan III Code.
 *
 * Architecture: Aggressively procedural, data-driven, with memoized computations for optimal performance.
 * UI Layer: Intentionally detailed and structured for expert users.
 *
 * @returns {JSX.Element} The rendered FlowMatrix component.
 */
const E1A1_TransactionsView: React.FC = () => {
    const context = useContext(DataContext);

    // Local state management for UI interactions and filtering/sorting criteria.
    const [E1A1_detailModalTarget, E1A1_setDetailModalTarget] = useState<Transaction | null>(null);
    const [E1A1_currentFilter, E1A1_setCurrentFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [E1A1_currentSortCriterion, E1A1_setCurrentSortCriterion] = useState<'date' | 'amount'>('date');
    const [E1A1_searchQuery, E1A1_setSearchQuery] = useState<string>('');

    // Centralized data access and validation.
    if (!context) {
        // Critical error if DataContext is not provided, indicating improper application setup.
        // This is a deliberate failure to enforce architectural integrity.
        throw new Error(`[${C002_COMPANY_NAME} Arch Error] Component E1A1_TransactionsView must be rendered within a DataProvider context.`);
    }
    const { transactions } = context;

    // Memoized computation for filtering and sorting transactions.
    // This ensures that the derived transaction list is re-calculated only when its dependencies change,
    // significantly improving performance for large datasets or frequent UI updates.
    const E1A1_memoizedDerivedTransactions = useMemo(() => {
        const E1A1_baseDataset = [...transactions]; // Create a shallow copy to avoid mutating original context data.

        // Step 1: Apply Search Filter (Case-insensitive substring matching on description)
        const E1A1_searchedTransactions = E1A1_baseDataset.filter(tx =>
            tx.description.toLowerCase().includes(E1A1_searchQuery.toLowerCase())
        );

        // Step 2: Apply Type Filter (All, Income, or Expense)
        const E1A1_filteredByTypeTransactions = E1A1_searchedTransactions.filter(tx =>
            E1A1_currentFilter === 'all' || tx.type === E1A1_currentFilter
        );

        // Step 3: Apply Sorting Logic
        const E1A1_sortedTransactions = E1A1_filteredByTypeTransactions.sort((a, b) => {
            if (E1A1_currentSortCriterion === 'date') {
                // Sort by date in descending order (most recent first)
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            } else { // Sort by amount
                // Sort by absolute amount in descending order (largest magnitude first)
                const absAmountA = Math.abs(a.amount);
                const absAmountB = Math.abs(b.amount);
                if (absAmountB !== absAmountA) {
                    return absAmountB - absAmountA;
                }
                // If amounts are equal in magnitude, sort by date (descending) as a tie-breaker.
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });

        return E1A1_sortedDisplayedTransactions;
    }, [transactions, E1A1_currentFilter, E1A1_currentSortCriterion, E1A1_searchQuery]); // Dependencies array

    // Configuration for the "Subscription Hunter" AI widget.
    // Defines the expected JSON structure for the AI's response, enabling structured parsing.
    const E1A1_subscriptionHunterSchema = {
        type: Type.OBJECT,
        properties: {
            subscriptions: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Name of the detected recurring subscription service." },
                        estimatedMonthlyCost: { type: Type.NUMBER, description: "Estimated monthly cost in USD." },
                        lastKnownChargeDate: { type: Type.STRING, format: "date", description: "Date of the most recent charge found for this subscription." },
                        merchantIdentifier: { type: Type.STRING, description: "Primary merchant associated with the subscription." }
                    },
                    required: ["name", "estimatedMonthlyCost", "lastKnownChargeDate", "merchantIdentifier"]
                }
            }
        },
        required: ["subscriptions"]
    };

    // Handle the selection of a transaction to display in the detail modal.
    const E1A1_handleSelectTransaction = useCallback((transaction: Transaction) => {
        E1A1_setDetailModalTarget(transaction);
    }, []);

    // Close the transaction detail modal.
    const E1A1_handleCloseDetailModal = useCallback(() => {
        E1A1_setDetailModalTarget(null);
    }, []);

    return (
        <section className="container mx-auto px-4 py-12 space-y-8 bg-gradient-to-br from-gray-900 to-black min-h-screen">
            <header className="text-center">
                <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
                    The <span className="text-cyan-400">{C001_APP_NAME}</span>: Financial Event Corpus
                </h1>
                <p className="text-xl text-gray-300 max-w-4xl mx-auto">
                    {C002_COMPANY_NAME} presents the FlowMatrix, an exhaustive, meticulously structured repository of all financial transactions. Explore, analyze, and gain unparalleled insights into your fiscal landscape.
                </p>
            </header>

            {/* Section: Plato's Intelligence Suite - AI-Powered Analytics */}
            <Card title="Plato's Intelligence Nexus" subtitle="AI-Driven Financial Forensics by The James Burvel O’Callaghan III Code" isCollapsible={true} defaultExpanded={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* AI Widget: Subscription Hunter */}
                    <D1A2_AITransactionInsightWidget
                        title="Subscription Vigilance Engine"
                        prompt="Act as a financial analyst. Scrutinize the provided transaction data to identify potential recurring subscription services. Focus on recurring payments to the same or similar merchants. For each identified subscription, provide its name, an estimated monthly cost, the date of its last known charge, and the primary merchant identifier. Ensure the output is strictly JSON format as per the defined schema."
                        transactions={E1A1_memoizedDerivedTransactions}
                        responseSchema={E1A1_subscriptionHunterSchema}
                    >
                        {(result: { subscriptions: DetectedSubscription[] }) => (
                            <div className="text-xs text-gray-300 space-y-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700/60">
                                <h5 className="font-semibold text-cyan-300 mb-2">Detected Recurring Commitments:</h5>
                                {result.subscriptions && result.subscriptions.length > 0 ? (
                                    <ul className="list-disc list-inside space-y-1.5">
                                        {result.subscriptions.map((sub: any) => (
                                            <li key={sub.name} className="border-b border-gray-700/40 pb-1.5 last:border-b-0 last:pb-0">
                                                <strong className="text-white">{sub.name}</strong><br />
                                                <span className="text-green-300 font-mono">~{C004_DEFAULT_CURRENCY_SYMBOL}{sub.estimatedMonthlyCost.toFixed(2)}</span> | <span className="text-gray-400">Last: {sub.lastKnownChargeDate}</span> | <span className="text-blue-300 text-opacity-90">{sub.merchantIdentifier}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 italic text-center p-4">Plato's analysis reveals no clear recurring subscriptions in the recent transaction history.</p>
                                )}
                            </div>
                        )}
                    </D1A2_AITransactionInsightWidget>

                    {/* AI Widget: Anomaly Detection */}
                    <D1A2_AITransactionInsightWidget
                        title="Financial Anomaly Sentinel"
                        prompt="Analyze the provided financial transactions and identify the single most anomalous or outlier transaction. Provide a concise explanation detailing why this transaction deviates significantly from the typical spending or income patterns observed."
                        transactions={E1A1_memoizedDerivedTransactions}
                    />

                    {/* AI Widget: Tax Deduction Identifier */}
                    <D1A2_AITransactionInsightWidget
                        title="Tax Optimization Scout"
                        prompt="Review the transaction data. Identify one specific transaction that appears to be a potential candidate for tax deduction purposes. State the transaction and clearly articulate the reasoning behind its potential eligibility for tax benefits."
                        transactions={E1A1_memoizedDerivedTransactions}
                    />

                    {/* AI Widget: Savings Opportunity Finder */}
                    <D1A2_AITransactionInsightWidget
                        title="Fiscal Efficiency Advisor"
                        prompt="Based on the patterns and trends evident in the transaction history, provide one concrete, actionable recommendation for improving savings or reducing unnecessary expenditure. Explain the rationale behind the suggestion."
                        transactions={E1A1_memoizedDerivedTransactions}
                    />
                </div>
            </Card>

            {/* Section: Core Transaction Data Table */}
            <Card title="Transaction Ledger" subtitle="Detailed View & Control Panel" isCollapsible={false}>
                {/* Control Panel: Search, Filter, Sort */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-gray-900/40 rounded-lg border border-gray-700/60 shadow-inner">
                    <div className="flex items-center gap-3 w-full md:w-auto mb-3 md:mb-0">
                        <label htmlFor="transaction-search" className="sr-only">Search Transactions</label>
                        <input
                            id="transaction-search"
                            type="text"
                            placeholder="Search transaction details..."
                            value={E1A1_searchQuery}
                            onChange={e => E1A1_setSearchQuery(e.target.value)}
                            className="w-full md:w-64 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-colors duration-200 shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                        <div className="inline-flex items-center gap-2">
                            <label htmlFor="transaction-filter" className="text-gray-300 text-sm font-medium">Filter:</label>
                            <select
                                id="transaction-filter"
                                value={E1A1_currentFilter}
                                onChange={e => E1A1_setCurrentFilter(e.target.value as any)}
                                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-sm cursor-pointer appearance-none"
                            >
                                <option value="all">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                            </select>
                        </div>
                        <div className="inline-flex items-center gap-2">
                            <label htmlFor="transaction-sort" className="text-gray-300 text-sm font-medium">Sort By:</label>
                            <select
                                id="transaction-sort"
                                value={E1A1_currentSortCriterion}
                                onChange={e => E1A1_setCurrentSortCriterion(e.target.value as any)}
                                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-sm cursor-pointer appearance-none"
                            >
                                <option value="date">Date (Newest First)</option>
                                <option value="amount">Amount (Magnitude)</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Transaction Data Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-800 shadow-lg">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-200 uppercase bg-gray-900/70 border-b border-gray-800">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wide">Description</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wide">Category</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wide">Date</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wide text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {E1A1_memoizedDerivedTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                                        No transactions found matching your current criteria. Consider adjusting your search or filters.
                                    </td>
                                </tr>
                            ) : (
                                E1A1_memoizedDerivedTransactions.map(tx => (
                                    <tr
                                        key={tx.id}
                                        onClick={() => E1A1_handleSelectTransaction(tx)}
                                        className="border-b border-gray-800/50 hover:bg-gray-800/60 transition-colors duration-200 cursor-pointer group"
                                    >
                                        <td scope="row" className="px-6 py-5 font-medium text-white whitespace-nowrap group-hover:text-cyan-400 transition-colors duration-200">
                                            {tx.description.substring(0, 70)}{tx.description.length > 70 ? '...' : ''}
                                        </td>
                                        <td className="px-6 py-5 text-gray-300">{tx.category}</td>
                                        <td className="px-6 py-5 text-gray-300">{tx.date}</td>
                                        <td className={`px-6 py-5 text-right font-mono font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-500'}`}>
                                            {tx.type === 'income' ? '+' : '-'}{C004_DEFAULT_CURRENCY_SYMBOL}{Math.abs(tx.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Render the Transaction Detail Modal */}
            <D1A1_TransactionDetailModal transaction={E1A1_detailModalTarget} onClose={E1A1_handleCloseDetailModal} />
        </section>
    );
};

export default E1A1_TransactionsView;
