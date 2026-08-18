import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { GoogleGenAI } from "@google/genai";
import Card from './Card';
import { DataContext } from '../contexts/DataContext';

// ================================================================================================
// TYPES & INTERFACES
// ================================================================================================

interface LogEntry {
    id: string;
    timestamp: string;
    action: string;
    user: string;
    status: 'SUCCESS' | 'WARNING' | 'ERROR' | 'PENDING';
    hash: string;
}

interface PaymentRequest {
    id: string;
    recipient: string;
    amount: number;
    currency: string;
    rail: 'WIRE' | 'ACH' | 'RTP' | 'SWIFT' | 'BLOCKCHAIN';
    reference: string;
    scheduledDate: string;
}

interface AiMessage {
    id: string;
    sender: 'USER' | 'QUANTUM_CORE';
    text: string;
    timestamp: Date;
    intent?: string;
}

interface SystemMetric {
    label: string;
    value: string | number;
    trend: 'up' | 'down' | 'stable';
    color: string;
}

// ================================================================================================
// INTERNAL COMPONENTS
// ================================================================================================

/**
 * A reusable modal component for "Pop up forms" as requested.
 * Implements a backdrop blur and centered content.
 */
const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}> = ({ isOpen, onClose, title, children, actions }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/70 backdrop-blur-sm p-4 md:p-0 transition-all duration-300">
            <div className="relative w-full max-w-2xl max-h-full rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl transform transition-all scale-100">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-700/50 rounded-t-2xl bg-gray-800/50">
                    <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 bg-transparent hover:bg-gray-700 hover:text-white rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center transition-colors"
                    >
                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                {/* Body */}
                <div className="p-6 space-y-6 text-gray-300">
                    {children}
                </div>
                {/* Footer */}
                {actions && (
                    <div className="flex items-center justify-end p-6 space-x-3 border-t border-gray-700/50 rounded-b-2xl bg-gray-800/30">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * A specialized input field with a label and optional icon.
 */
const InputField: React.FC<{
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    type?: string;
    placeholder?: string;
    options?: string[];
    icon?: React.ReactNode;
}> = ({ label, value, onChange, type = "text", placeholder, options, icon }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-400 uppercase tracking-wider">{label}</label>
        <div className="relative">
            {icon && (
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                    {icon}
                </div>
            )}
            {options ? (
                <select
                    value={value}
                    onChange={onChange}
                    className={`bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 ${icon ? 'pl-10' : ''} transition-all`}
                >
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    className={`bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 ${icon ? 'pl-10' : ''} transition-all placeholder-gray-600`}
                    placeholder={placeholder}
                />
            )}
        </div>
    </div>
);

/**
 * Status Badge Component
 */
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    let colorClass = 'bg-gray-700 text-gray-300';
    if (status === 'SUCCESS' || status === 'Operational') colorClass = 'bg-green-900/50 text-green-300 border border-green-700/50';
    if (status === 'WARNING' || status === 'Degraded') colorClass = 'bg-yellow-900/50 text-yellow-300 border border-yellow-700/50';
    if (status === 'ERROR' || status === 'Outage') colorClass = 'bg-red-900/50 text-red-300 border border-red-700/50';
    if (status === 'PENDING') colorClass = 'bg-blue-900/50 text-blue-300 border border-blue-700/50';

    return (
        <span className={`${colorClass} text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'SUCCESS' ? 'bg-green-400' : status === 'ERROR' ? 'bg-red-400' : 'bg-gray-400'} animate-pulse`}></span>
            {status}
        </span>
    );
};

// ================================================================================================
// MAIN COMPONENT: ORCHESTRATION VIEW
// ================================================================================================

const OrchestrationView: React.FC = () => {
    // --- Context & State ---
    const { 
        user, 
        geminiApiKey, 
        askSovereignAI, 
        showNotification,
        apiStatus
    } = useContext(DataContext) || {};

    // Local State for UI
    const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'PAYMENTS' | 'INTEGRATIONS' | 'SECURITY'>('DASHBOARD');
    const [isTestDriveMode, setIsTestDriveMode] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [auditLog, setAuditLog] = useState<LogEntry[]>([]);
    
    // AI Chat State
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<AiMessage[]>([
        { id: 'init', sender: 'QUANTUM_CORE', text: 'Quantum Core initialized. Systems nominal. Ready for instructions.', timestamp: new Date() }
    ]);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Payment Form State
    const [paymentForm, setPaymentForm] = useState<PaymentRequest>({
        id: '',
        recipient: '',
        amount: 0,
        currency: 'USD',
        rail: 'WIRE',
        reference: '',
        scheduledDate: new Date().toISOString().split('T')[0]
    });

    // Simulation State
    const [systemLoad, setSystemLoad] = useState(12);
    const [networkLatency, setNetworkLatency] = useState(24);
    const [activeThreats, setActiveThreats] = useState(0);

    // --- Effects ---

    // Scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // Simulate System Metrics ("Engine Roar")
    useEffect(() => {
        const interval = setInterval(() => {
            setSystemLoad(prev => Math.min(100, Math.max(5, prev + (Math.random() - 0.5) * 10)));
            setNetworkLatency(prev => Math.max(5, prev + (Math.random() - 0.5) * 5));
            if (Math.random() > 0.95) {
                addAuditLog('SYSTEM_HEARTBEAT', 'Routine diagnostic check completed.', 'SUCCESS');
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // --- Helpers ---

    const addAuditLog = (action: string, details: string, status: LogEntry['status'] = 'SUCCESS') => {
        const newEntry: LogEntry = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            action: `${action}: ${details}`,
            user: user?.name || 'SYSTEM',
            status,
            hash: '0x' + Math.random().toString(16).substr(2, 32) // Simulated hash
        };
        setAuditLog(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50
    };

    const handleTestDriveToggle = () => {
        const newState = !isTestDriveMode;
        setIsTestDriveMode(newState);
        if (newState) {
            addAuditLog('TEST_DRIVE_INIT', 'User initiated Test Drive Mode. Simulation protocols active.', 'WARNING');
            showNotification?.('Test Drive Mode Engaged. Dummy data populated.', 'success');
            // Auto-fill payment form
            setPaymentForm({
                id: 'TD-8821',
                recipient: 'Quantum Global Logistics LLC',
                amount: 1250000.00,
                currency: 'USD',
                rail: 'WIRE',
                reference: 'Q3 Supply Chain Settlement',
                scheduledDate: new Date().toISOString().split('T')[0]
            });
        } else {
            addAuditLog('TEST_DRIVE_END', 'Test Drive Mode deactivated.', 'SUCCESS');
        }
    };

    // --- AI Integration ---

    const handleAiSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg: AiMessage = {
            id: Date.now().toString(),
            sender: 'USER',
            text: chatInput,
            timestamp: new Date()
        };

        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAiThinking(true);
        addAuditLog('AI_INTERACTION', `User query: "${userMsg.text}"`, 'PENDING');

        try {
            let responseText = '';
            
            // Attempt to use GoogleGenAI directly if key is available, as per instructions
            const apiKey = geminiApiKey || process.env.GEMINI_API_KEY;
            
            if (apiKey) {
                const ai = new GoogleGenAI({ apiKey });
                // Using the specific model requested
                const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); 
                
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: `You are Quantum Core, the AI engine for Quantum Financial. 
                    Context: The user is in the Orchestration View. 
                    User Query: ${userMsg.text}
                    Keep response professional, concise, and related to banking/finance.` }] }]
                });
                
                responseText = result.response.text();
            } else if (askSovereignAI) {
                // Fallback to context method
                responseText = await askSovereignAI(userMsg.text, "gemini-1.5-flash");
            } else {
                // Fallback simulation
                await new Promise(r => setTimeout(r, 1500));
                responseText = "I'm currently operating in offline mode. Please verify your API credentials to unlock full cognitive capabilities.";
            }

            const aiMsg: AiMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'QUANTUM_CORE',
                text: responseText,
                timestamp: new Date()
            };

            setChatHistory(prev => [...prev, aiMsg]);
            addAuditLog('AI_RESPONSE', 'Response generated and delivered.', 'SUCCESS');

        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg: AiMessage = {
                id: (Date.now() + 1).toString(),
                sender: 'QUANTUM_CORE',
                text: "Err: Neural link unstable. Please check API configuration.",
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, errorMsg]);
            addAuditLog('AI_ERROR', 'Failed to generate response.', 'ERROR');
        } finally {
            setIsAiThinking(false);
        }
    };

    // --- Payment Logic ---

    const handlePaymentSubmit = async () => {
        addAuditLog('PAYMENT_INIT', `Initiating ${paymentForm.rail} transfer of ${paymentForm.amount} ${paymentForm.currency} to ${paymentForm.recipient}`, 'PENDING');
        
        // Simulate processing
        await new Promise(r => setTimeout(r, 2000));
        
        // AI Fraud Check Simulation
        const fraudScore = Math.random();
        if (fraudScore > 0.9) {
            addAuditLog('FRAUD_ALERT', 'AI detected anomalous pattern. Transaction flagged for review.', 'ERROR');
            showNotification?.('Transaction flagged by Quantum Sentinel.', 'error');
            return;
        }

        addAuditLog('PAYMENT_SUCCESS', `Transaction ${Math.random().toString(36).substr(2, 9).toUpperCase()} cleared successfully.`, 'SUCCESS');
        showNotification?.('Payment successfully orchestrated.', 'success');
        setShowPaymentModal(false);
    };

    // ================================================================================================
    // RENDER METHODS
    // ================================================================================================

    const renderDashboard = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {/* Metric Cards */}
            <Card title="Global Liquidity Position" variant="interactive" className="col-span-2">
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <p className="text-gray-400 text-sm">Total Consolidated Assets</p>
                        <h2 className="text-4xl font-bold text-white tracking-tight">$2,450,000,000.00</h2>
                    </div>
                    <div className="text-right">
                        <span className="text-green-400 font-bold flex items-center justify-end">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                            +4.2%
                        </span>
                        <p className="text-gray-500 text-xs">vs last 24h</p>
                    </div>
                </div>
                {/* Abstract Chart Visualization */}
                <div className="h-32 w-full bg-gray-800/50 rounded-lg overflow-hidden relative flex items-end gap-1 p-2">
                    {[...Array(40)].map((_, i) => (
                        <div 
                            key={i} 
                            className="flex-1 bg-cyan-500/20 hover:bg-cyan-400 transition-all duration-300 rounded-t-sm"
                            style={{ height: `${30 + Math.random() * 70}%` }}
                        ></div>
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                </div>
            </Card>

            <Card title="System Health" variant="outline">
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Quantum Core Load</span>
                            <span className="text-cyan-400">{systemLoad.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-cyan-500 h-2 rounded-full transition-all duration-500" style={{ width: `${systemLoad}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Network Latency</span>
                            <span className="text-green-400">{networkLatency.toFixed(0)}ms</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(networkLatency / 100) * 100}%` }}></div>
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Threat Level</span>
                            <span className="text-gray-400">DEFCON 5</span>
                        </div>
                        <div className="flex gap-1">
                            {[1,2,3,4,5].map(n => (
                                <div key={n} className={`h-2 flex-1 rounded-full ${n === 5 ? 'bg-green-500' : 'bg-gray-700'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            {/* Quick Actions */}
            <Card title="Orchestration Controls" className="col-span-1 md:col-span-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button 
                        onClick={() => { setShowPaymentModal(true); addAuditLog('UI_INTERACTION', 'Opened Payment Modal', 'SUCCESS'); }}
                        className="p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-cyan-500 rounded-xl transition-all group text-left"
                    >
                        <div className="w-10 h-10 rounded-full bg-cyan-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h4 className="font-semibold text-white">New Wire</h4>
                        <p className="text-xs text-gray-400 mt-1">Domestic & Intl.</p>
                    </button>

                    <button className="p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-purple-500 rounded-xl transition-all group text-left">
                        <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <h4 className="font-semibold text-white">Generate Report</h4>
                        <p className="text-xs text-gray-400 mt-1">AI-Enhanced Analytics</p>
                    </button>

                    <button className="p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-green-500 rounded-xl transition-all group text-left">
                        <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                        <h4 className="font-semibold text-white">Approve Batch</h4>
                        <p className="text-xs text-gray-400 mt-1">3 Pending Approvals</p>
                    </button>

                    <button className="p-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-red-500 rounded-xl transition-all group text-left">
                        <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <h4 className="font-semibold text-white">Security Audit</h4>
                        <p className="text-xs text-gray-400 mt-1">View Access Logs</p>
                    </button>
                </div>
            </Card>
        </div>
    );

    const renderSecurity = () => (
        <div className="space-y-6 animate-fadeIn">
            <Card title="Quantum Sentinel Status" variant="outline">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col items-center justify-center p-6 bg-gray-800/30 rounded-xl border border-gray-700">
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="8" />
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#10b981" strokeWidth="8" strokeDasharray="283" strokeDashoffset="20" className="animate-[spin_3s_linear_infinite]" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-white">98%</span>
                                <span className="text-xs text-gray-400 uppercase tracking-widest">Secure</span>
                            </div>
                        </div>
                        <p className="mt-4 text-gray-400 text-center">Real-time threat monitoring active across all nodes.</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">Active Protocols</h4>
                        {[
                            { name: 'Multi-Factor Authentication', status: 'Active', color: 'text-green-400' },
                            { name: 'Biometric Verification', status: 'Active', color: 'text-green-400' },
                            { name: 'Geo-Fencing', status: 'Active', color: 'text-green-400' },
                            { name: 'AI Fraud Detection', status: 'Learning', color: 'text-yellow-400' },
                            { name: 'Quantum Encryption', status: 'Active', color: 'text-green-400' },
                        ].map((protocol, idx) => (
                            <div key={idx} className="flex justify-between items-center">
                                <span className="text-gray-300">{protocol.name}</span>
                                <span className={`text-sm font-mono ${protocol.color}`}>{protocol.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
    );

    // ================================================================================================
    // MAIN RENDER
    // ================================================================================================

    return (
        <div className="flex flex-col h-full space-y-6 p-2">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-800/40 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-md">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">Quantum Financial</span> Orchestrator
                    </h1>
                    <p className="text-gray-400 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        System Operational | v4.2.0-ALPHA
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 rounded-lg border border-gray-700">
                        <span className="text-xs text-gray-500 uppercase">Test Drive Mode</span>
                        <button 
                            onClick={handleTestDriveToggle}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${isTestDriveMode ? 'bg-cyan-600' : 'bg-gray-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isTestDriveMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5">
                        <div className="h-full w-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                            <img src={user?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Quantum"} alt="User" className="h-full w-full object-cover" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                
                {/* Left Navigation / Status */}
                <div className="lg:col-span-1 space-y-6">
                    <Card variant="default" padding="none" className="overflow-hidden">
                        <div className="p-4 bg-gray-800/50 border-b border-gray-700">
                            <h3 className="font-semibold text-gray-200">Navigation</h3>
                        </div>
                        <div className="p-2">
                            {[
                                { id: 'DASHBOARD', label: 'Mission Control', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
                                { id: 'PAYMENTS', label: 'Payments & Wires', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                                { id: 'INTEGRATIONS', label: 'ERP Integrations', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
                                { id: 'SECURITY', label: 'Security Sentinel', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${activeTab === item.id ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-800/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path></svg>
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </Card>

                    {/* Audit Log Mini View */}
                    <Card title="Audit Ledger" variant="ghost" className="max-h-[400px] flex flex-col">
                        <div className="overflow-y-auto space-y-3 pr-2 custom-scrollbar flex-1">
                            {auditLog.map((log) => (
                                <div key={log.id} className="text-xs p-2 rounded bg-gray-900/50 border border-gray-800">
                                    <div className="flex justify-between text-gray-500 mb-1">
                                        <span>{log.timestamp.split('T')[1].split('.')[0]}</span>
                                        <span className={log.status === 'SUCCESS' ? 'text-green-500' : log.status === 'ERROR' ? 'text-red-500' : 'text-yellow-500'}>{log.status}</span>
                                    </div>
                                    <div className="text-gray-300 font-mono">{log.action}</div>
                                    <div className="text-gray-600 mt-1 truncate">{log.hash}</div>
                                </div>
                            ))}
                            {auditLog.length === 0 && <div className="text-gray-500 text-center py-4">No activity recorded.</div>}
                        </div>
                    </Card>
                </div>

                {/* Center Stage */}
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'DASHBOARD' && renderDashboard()}
                    {activeTab === 'SECURITY' && renderSecurity()}
                    {activeTab === 'PAYMENTS' && (
                        <Card title="Payment Orchestration" variant="default">
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                </div>
                                <h3 className="text-xl font-semibold text-white">No Active Payment Batches</h3>
                                <p className="text-gray-400 mt-2 mb-6">Initiate a new transfer or import a batch file to begin.</p>
                                <button 
                                    onClick={() => setShowPaymentModal(true)}
                                    className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-cyan-500/20"
                                >
                                    Create New Payment
                                </button>
                            </div>
                        </Card>
                    )}
                    {activeTab === 'INTEGRATIONS' && (
                        <Card title="ERP & API Status" variant="default">
                            <div className="space-y-4">
                                {apiStatus?.map((api, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${api.status === 'Operational' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className="font-medium text-white">{api.provider}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-gray-400">{api.responseTime}ms</span>
                                            <StatusBadge status={api.status} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Panel: AI & Tools */}
                <div className="lg:col-span-1 flex flex-col h-[600px] lg:h-auto">
                    <Card title="Quantum Core AI" variant="interactive" className="flex-1 flex flex-col min-h-0" padding="none">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-900/30">
                            {chatHistory.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 ${
                                        msg.sender === 'USER' 
                                            ? 'bg-cyan-600 text-white rounded-br-none' 
                                            : 'bg-gray-700 text-gray-200 rounded-bl-none'
                                    }`}>
                                        <p className="text-sm">{msg.text}</p>
                                        <span className="text-[10px] opacity-50 mt-1 block">
                                            {msg.timestamp.toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {isAiThinking && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-700 rounded-2xl rounded-bl-none p-3 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
                            <form onSubmit={handleAiSubmit} className="relative">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask Quantum Core..."
                                    className="w-full bg-gray-900 border border-gray-600 text-white rounded-xl pl-4 pr-12 py-3 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                />
                                <button 
                                    type="submit"
                                    disabled={!chatInput.trim() || isAiThinking}
                                    className="absolute right-2 top-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                </button>
                            </form>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Payment Modal (PO up form) */}
            <Modal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                title="Initiate Secure Transfer"
                actions={
                    <>
                        <button 
                            onClick={() => setShowPaymentModal(false)}
                            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handlePaymentSubmit}
                            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-medium shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105"
                        >
                            Authorize Transfer
                        </button>
                    </>
                }
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg flex items-start gap-3 mb-4">
                            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <div>
                                <h4 className="text-sm font-semibold text-blue-300">AI Risk Assessment Active</h4>
                                <p className="text-xs text-blue-200/70">Quantum Sentinel is monitoring this transaction for fraud patterns in real-time.</p>
                            </div>
                        </div>
                    </div>

                    <InputField 
                        label="Recipient Name" 
                        value={paymentForm.recipient} 
                        onChange={(e) => setPaymentForm({...paymentForm, recipient: e.target.value})}
                        placeholder="e.g. Acme Corp International"
                        icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>}
                    />
                    
                    <InputField 
                        label="Payment Rail" 
                        value={paymentForm.rail} 
                        onChange={(e) => setPaymentForm({...paymentForm, rail: e.target.value as any})}
                        options={['WIRE', 'ACH', 'RTP', 'SWIFT', 'BLOCKCHAIN']}
                    />

                    <InputField 
                        label="Amount" 
                        type="number"
                        value={paymentForm.amount} 
                        onChange={(e) => setPaymentForm({...paymentForm, amount: parseFloat(e.target.value)})}
                        icon={<span className="text-gray-400 font-bold">$</span>}
                    />

                    <InputField 
                        label="Currency" 
                        value={paymentForm.currency} 
                        onChange={(e) => setPaymentForm({...paymentForm, currency: e.target.value})}
                        options={['USD', 'EUR', 'GBP', 'JPY', 'SGD']}
                    />

                    <div className="col-span-2">
                        <InputField 
                            label="Reference / Memo" 
                            value={paymentForm.reference} 
                            onChange={(e) => setPaymentForm({...paymentForm, reference: e.target.value})}
                            placeholder="Invoice # or Deal Reference"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default OrchestrationView;