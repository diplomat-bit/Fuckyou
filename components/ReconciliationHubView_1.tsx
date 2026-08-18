import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowRight, Check, X, Search, AlertCircle, Wand2, 
  ShieldCheck, Activity, Database, Zap, MessageSquare, 
  Terminal, BarChart3, Lock, Cpu, Gauge, Layers, 
  History, Settings, Download, Filter, RefreshCcw,
  ChevronRight, Play, Info, AlertTriangle, Eye,
  FileText, Share2, Trash2, CheckCircle2, Fingerprint
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Card from './Card';

/**
 * QUANTUM FINANCIAL - RECONCILIATION NEXUS V4.0
 * 
 * PHILOSOPHY: 
 * - "Golden Ticket" Experience: High-polish, elite performance.
 * - "Test Drive": Interactive, low-pressure, high-feedback.
 * - "Bells and Whistles": AI-driven insights, real-time telemetry, audit persistence.
 * 
 * SECURITY: Multi-factor simulation and fraud monitoring integrated.
 * AUDIT: Every sensitive action is logged to the internal state "Black Box".
 */

// ================================================================================================
// TYPE DEFINITIONS & INTERFACES
// ================================================================================================

interface Transaction {
    id: string;
    date: string;
    amount: number;
    description: string;
    source: 'INTERNAL_LEDGER' | 'BANK_STATEMENT';
    status: 'UNMATCHED' | 'MATCHED' | 'PENDING' | 'FLAGGED';
    currency: string;
    category: string;
    riskScore: number;
    metadata: {
        traceId: string;
        originatingIp?: string;
        mfaVerified: boolean;
        rail: 'ACH' | 'WIRE' | 'SWIFT';
    };
}

interface MatchSuggestion {
    ledgerId: string;
    statementId: string;
    confidence: number;
    reason: string;
    aiModel: string;
}

interface AuditEntry {
    timestamp: string;
    action: string;
    actor: string;
    details: string;
    severity: 'INFO' | 'SECURITY' | 'CRITICAL';
    hash: string; // Simulated blockchain hash for integrity
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

interface TelemetryData {
    cpuLoad: number;
    memoryUsage: number;
    apiLatency: number;
    fraudDetectionActive: boolean;
}

// ================================================================================================
// MOCK DATA GENERATION (THE "ENGINE" FUEL)
// ================================================================================================

const GENERATE_MOCK_LEDGER = (): Transaction[] => [
    { id: 'TX-L-9901', date: '2024-05-10', amount: 125000.00, description: 'Global Logistics - Q2 Settlement', source: 'INTERNAL_LEDGER', status: 'UNMATCHED', currency: 'USD', category: 'Operations', riskScore: 0.02, metadata: { traceId: 'TRC-001', mfaVerified: true, rail: 'WIRE' } },
    { id: 'TX-L-9902', date: '2024-05-11', amount: 4250.50, description: 'Cloud Infrastructure - AWS Monthly', source: 'INTERNAL_LEDGER', status: 'UNMATCHED', currency: 'USD', category: 'Technology', riskScore: 0.05, metadata: { traceId: 'TRC-002', mfaVerified: true, rail: 'ACH' } },
    { id: 'TX-L-9903', date: '2024-05-12', amount: 890000.00, description: 'Strategic Acquisition - Alpha Corp', source: 'INTERNAL_LEDGER', status: 'UNMATCHED', currency: 'USD', category: 'Investment', riskScore: 0.12, metadata: { traceId: 'TRC-003', mfaVerified: true, rail: 'WIRE' } },
    { id: 'TX-L-9904', date: '2024-05-12', amount: 150.00, description: 'Executive Catering - Board Meeting', source: 'INTERNAL_LEDGER', status: 'UNMATCHED', currency: 'USD', category: 'G&A', riskScore: 0.01, metadata: { traceId: 'TRC-004', mfaVerified: false, rail: 'ACH' } },
    { id: 'TX-L-9905', date: '2024-05-13', amount: 55000.00, description: 'Payroll Funding - EMEA Region', source: 'INTERNAL_LEDGER', status: 'UNMATCHED', currency: 'USD', category: 'Payroll', riskScore: 0.03, metadata: { traceId: 'TRC-005', mfaVerified: true, rail: 'SWIFT' } },
    { id: 'TX-L-9906', date: '2024-05-14', amount: 1200.00, description: 'Office Supplies - Staples', source: 'INTERNAL_LEDGER', status: 'UNMATCHED', currency: 'USD', category: 'G&A', riskScore: 0.01, metadata: { traceId: 'TRC-006', mfaVerified: true, rail: 'ACH' } },
    { id: 'TX-L-9907', date: '2024-05-15', amount: 33400.00, description: 'Marketing Campaign - Summer Launch', source: 'INTERNAL_LEDGER', status: 'UNMATCHED', currency: 'USD', category: 'Marketing', riskScore: 0.08, metadata: { traceId: 'TRC-007', mfaVerified: true, rail: 'WIRE' } },
];

const GENERATE_MOCK_STATEMENT = (): Transaction[] => [
    { id: 'TX-S-8801', date: '2024-05-11', amount: 125000.00, description: 'INCOMING WIRE: GLOBAL LOGISTICS', source: 'BANK_STATEMENT', status: 'UNMATCHED', currency: 'USD', category: 'Uncategorized', riskScore: 0.02, metadata: { traceId: 'TRC-S01', mfaVerified: true, rail: 'WIRE' } },
    { id: 'TX-S-8802', date: '2024-05-11', amount: 4250.50, description: 'ACH DEBIT: AMZN MKTP', source: 'BANK_STATEMENT', status: 'UNMATCHED', currency: 'USD', category: 'Uncategorized', riskScore: 0.04, metadata: { traceId: 'TRC-S02', mfaVerified: true, rail: 'ACH' } },
    { id: 'TX-S-8803', date: '2024-05-13', amount: 889985.00, description: 'WIRE OUT: ALPHA CORP - FEE ADJ', source: 'BANK_STATEMENT', status: 'UNMATCHED', currency: 'USD', category: 'Uncategorized', riskScore: 0.15, metadata: { traceId: 'TRC-S03', mfaVerified: true, rail: 'WIRE' } },
    { id: 'TX-S-8804', date: '2024-05-15', amount: 500.00, description: 'UNKNOWN POS DEBIT - NYC', source: 'BANK_STATEMENT', status: 'UNMATCHED', currency: 'USD', category: 'Uncategorized', riskScore: 0.85, metadata: { traceId: 'TRC-S04', mfaVerified: false, rail: 'ACH' } },
    { id: 'TX-S-8805', date: '2024-05-14', amount: 55000.00, description: 'SWIFT: EMEA PAYROLL FUND', source: 'BANK_STATEMENT', status: 'UNMATCHED', currency: 'USD', category: 'Uncategorized', riskScore: 0.03, metadata: { traceId: 'TRC-S05', mfaVerified: true, rail: 'SWIFT' } },
];

// ================================================================================================
// MAIN COMPONENT: RECONCILIATION HUB
// ================================================================================================

const ReconciliationHubView: React.FC = () => {
    // --- State Management ---
    const [ledgerTx, setLedgerTx] = useState<Transaction[]>(GENERATE_MOCK_LEDGER());
    const [statementTx, setStatementTx] = useState<Transaction[]>(GENERATE_MOCK_STATEMENT());
    const [selectedLedger, setSelectedLedger] = useState<string | null>(null);
    const [selectedStatement, setSelectedStatement] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
    const [isAutoMatching, setIsAutoMatching] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { role: 'assistant', content: "Welcome to the Quantum Financial Demo. I am your AI Treasury Assistant. How can I help you kick the tires on our reconciliation engine today?", timestamp: new Date().toLocaleTimeString() }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [activeTab, setActiveTab] = useState<'reconcile' | 'audit' | 'telemetry'>('reconcile');
    const [telemetry, setTelemetry] = useState<TelemetryData>({ cpuLoad: 12, memoryUsage: 45, apiLatency: 24, fraudDetectionActive: true });
    const [showSecurityModal, setShowSecurityModal] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- AI Initialization ---
    // Using the provided pattern for Gemini
    const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");

    // --- Helper: Audit Logger ---
    const logAction = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'INFO') => {
        const newEntry: AuditEntry = {
            timestamp: new Date().toISOString(),
            action,
            details,
            severity,
            hash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        };
        setAuditLogs(prev => [newEntry, ...prev]);
        console.log(`[AUDIT] ${action}: ${details}`);
    }, []);

    // --- Effect: Telemetry Simulation ---
    useEffect(() => {
        const interval = setInterval(() => {
            setTelemetry(prev => ({
                cpuLoad: Math.floor(Math.random() * 20) + 5,
                memoryUsage: 40 + Math.floor(Math.random() * 10),
                apiLatency: 15 + Math.floor(Math.random() * 30),
                fraudDetectionActive: true
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // --- Effect: Scroll Chat ---
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // --- AI Logic: Chat & Interaction ---
    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        const userMsg: ChatMessage = { role: 'user', content: userInput, timestamp: new Date().toLocaleTimeString() };
        setChatHistory(prev => [...prev, userMsg]);
        setUserInput('');
        setIsAiThinking(true);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            // Contextual prompt for the AI
            const prompt = `
                You are the Quantum Financial AI Assistant. 
                The user is currently in the "Reconciliation Hub" of a high-performance business banking demo.
                Philosophy: "Golden Ticket" experience, "Test Drive" the car, "Bells and Whistles".
                Current State: 
                - Unmatched Ledger Items: ${ledgerTx.filter(t => t.status === 'UNMATCHED').length}
                - Unmatched Statement Items: ${statementTx.filter(t => t.status === 'UNMATCHED').length}
                - Security Status: Multi-factor Auth Active, Fraud Monitoring Active.
                
                User said: "${userInput}"
                
                Respond as an elite financial architect. Be professional, secure, and helpful. 
                If they ask to "reconcile everything", tell them to click the "AI Auto-Match" button to see the engine roar.
                Do NOT mention Citibank. Use "The Demo Bank" or "Quantum Financial".
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setChatHistory(prev => [...prev, { 
                role: 'assistant', 
                content: text, 
                timestamp: new Date().toLocaleTimeString() 
            }]);
            logAction('AI_INTERACTION', `User asked: ${userInput.substring(0, 30)}...`, 'INFO');
        } catch (error) {
            setChatHistory(prev => [...prev, { 
                role: 'assistant', 
                content: "I apologize, but my neural link is experiencing high latency. Please try again or use the manual controls.", 
                timestamp: new Date().toLocaleTimeString() 
            }]);
            logAction('AI_ERROR', 'Failed to generate AI response', 'CRITICAL');
        } finally {
            setIsAiThinking(false);
        }
    };

    // --- Logic: AI Auto-Matching (The "Engine Roar") ---
    const runAIMatching = () => {
        setIsAutoMatching(true);
        logAction('AI_AUTO_MATCH_START', 'Initiating heuristic matching engine', 'INFO');
        
        setTimeout(() => {
            const newSuggestions: MatchSuggestion[] = [];
            
            ledgerTx.filter(l => l.status === 'UNMATCHED').forEach(l => {
                statementTx.filter(s => s.status === 'UNMATCHED').forEach(s => {
                    let confidence = 0;
                    let reason = '';

                    // Exact Amount Match
                    if (l.amount === s.amount) {
                        confidence += 0.85;
                        reason = 'Exact currency value parity detected.';
                    } 
                    // Fuzzy Amount Match (e.g., fees deducted)
                    else if (Math.abs(l.amount - s.amount) / l.amount < 0.02) {
                        confidence += 0.65;
                        reason = 'High-probability match with variance (likely wire fees).';
                    }

                    // Description Keyword Match
                    const lDesc = l.description.toLowerCase();
                    const sDesc = s.description.toLowerCase();
                    if (lDesc.split(' ').some(word => word.length > 3 && sDesc.includes(word))) {
                        confidence += 0.1;
                    }

                    if (confidence > 0.6) {
                        newSuggestions.push({
                            ledgerId: l.id,
                            statementId: s.id,
                            confidence: Math.min(confidence, 0.99),
                            reason,
                            aiModel: 'Quantum-Heuristic-v4'
                        });
                    }
                });
            });

            setSuggestions(newSuggestions);
            setIsAutoMatching(false);
            logAction('AI_AUTO_MATCH_COMPLETE', `Found ${newSuggestions.length} potential matches`, 'INFO');
        }, 2000);
    };

    // --- Logic: Manual Matching ---
    const handleManualMatch = () => {
        if (selectedLedger && selectedStatement) {
            const lTx = ledgerTx.find(t => t.id === selectedLedger);
            const sTx = statementTx.find(t => t.id === selectedStatement);

            if (lTx && sTx) {
                setLedgerTx(prev => prev.map(t => t.id === selectedLedger ? { ...t, status: 'MATCHED' } : t));
                setStatementTx(prev => prev.map(t => t.id === selectedStatement ? { ...t, status: 'MATCHED' } : t));
                
                logAction('MANUAL_MATCH', `Linked ${selectedLedger} to ${selectedStatement} (Value: $${lTx.amount})`, 'INFO');
                
                setSelectedLedger(null);
                setSelectedStatement(null);
                setSuggestions(prev => prev.filter(s => s.ledgerId !== selectedLedger && s.statementId !== selectedStatement));
            }
        }
    };

    const handleAutoResolve = (suggestion: MatchSuggestion) => {
        setLedgerTx(prev => prev.map(t => t.id === suggestion.ledgerId ? { ...t, status: 'MATCHED' } : t));
        setStatementTx(prev => prev.map(t => t.id === suggestion.statementId ? { ...t, status: 'MATCHED' } : t));
        setSuggestions(prev => prev.filter(s => s !== suggestion));
        logAction('AI_RESOLVE', `Confirmed AI suggestion: ${suggestion.ledgerId} <-> ${suggestion.statementId}`, 'INFO');
    };

    // ================================================================================================
    // RENDER SUB-COMPONENTS
    // ================================================================================================

    const renderTelemetry = () => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-fadeIn">
            <Card variant="default" padding="sm" className="border-cyan-500/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-tighter">Engine Load</p>
                        <p className="text-2xl font-bold text-cyan-400">{telemetry.cpuLoad}%</p>
                    </div>
                    <Cpu className="text-cyan-500/50" size={24} />
                </div>
                <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${telemetry.cpuLoad}%` }}></div>
                </div>
            </Card>
            <Card variant="default" padding="sm" className="border-purple-500/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-tighter">Neural Memory</p>
                        <p className="text-2xl font-bold text-purple-400">{telemetry.memoryUsage}%</p>
                    </div>
                    <Activity className="text-purple-500/50" size={24} />
                </div>
                <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${telemetry.memoryUsage}%` }}></div>
                </div>
            </Card>
            <Card variant="default" padding="sm" className="border-green-500/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-tighter">API Latency</p>
                        <p className="text-2xl font-bold text-green-400">{telemetry.apiLatency}ms</p>
                    </div>
                    <Zap className="text-green-500/50" size={24} />
                </div>
                <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${(telemetry.apiLatency / 100) * 100}%` }}></div>
                </div>
            </Card>
            <Card variant="default" padding="sm" className="border-red-500/30">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-tighter">Fraud Shield</p>
                        <p className="text-2xl font-bold text-red-400">ACTIVE</p>
                    </div>
                    <ShieldCheck className="text-red-500/50" size={24} />
                </div>
                <div className="flex gap-1 mt-2">
                    {[1,2,3,4,5].map(i => <div key={i} className="h-1 flex-1 bg-red-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>)}
                </div>
            </Card>
        </div>
    );

    const renderAuditTrail = () => (
        <div className="space-y-4 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <History size={20} className="text-cyan-400" /> System Black Box (Audit Persistence)
                </h3>
                <button className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
                    <Download size={14} /> Export Immutable Log
                </button>
            </div>
            <div className="bg-gray-900/80 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-800 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3">Timestamp</th>
                            <th className="px-4 py-3">Action</th>
                            <th className="px-4 py-3">Details</th>
                            <th className="px-4 py-3">Integrity Hash</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {auditLogs.map((log, idx) => (
                            <tr key={idx} className="hover:bg-gray-800/50 transition-colors">
                                <td className="px-4 py-3 font-mono text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 
                                        log.severity === 'SECURITY' ? 'bg-purple-500/20 text-purple-400' : 
                                        'bg-cyan-500/20 text-cyan-400'
                                    }`}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-300">{log.details}</td>
                                <td className="px-4 py-3 font-mono text-[10px] text-gray-600">{log.hash}</td>
                            </tr>
                        ))}
                        {auditLogs.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-10 text-center text-gray-500 italic">No audit entries recorded in this session.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // ================================================================================================
    // MAIN RENDER
    // ================================================================================================

    return (
        <div className="min-h-screen bg-[#0a0c10] text-gray-200 p-4 md:p-8 font-sans selection:bg-cyan-500/30">
            
            {/* Header Section: Elite Branding */}
            <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="bg-cyan-600 p-1.5 rounded-lg shadow-lg shadow-cyan-900/20">
                            <Layers className="text-white" size={24} />
                        </div>
                        <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic">
                            Quantum <span className="text-cyan-500">Financial</span>
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm font-medium flex items-center gap-2">
                        <ShieldCheck size={14} className="text-green-500" /> 
                        Enterprise Reconciliation Nexus • <span className="text-cyan-400/80">Sovereign Demo Environment</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">System Status</span>
                        <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> ALL SYSTEMS NOMINAL
                        </span>
                    </div>
                    <button 
                        onClick={() => setShowSecurityModal(true)}
                        className="p-2 bg-gray-800 border border-gray-700 rounded-full hover:border-cyan-500 transition-all group"
                    >
                        <Lock size={18} className="group-hover:text-cyan-400" />
                    </button>
                    <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-cyan-900/20 flex items-center gap-2">
                        <Play size={14} /> Deploy to Production
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Column: Controls & AI Chat */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* Navigation / Tabs */}
                    <Card variant="default" padding="none" className="overflow-hidden">
                        <div className="flex flex-col">
                            <button 
                                onClick={() => setActiveTab('reconcile')}
                                className={`flex items-center gap-3 px-4 py-4 text-sm font-bold transition-all ${activeTab === 'reconcile' ? 'bg-cyan-600/10 text-cyan-400 border-l-4 border-cyan-500' : 'text-gray-400 hover:bg-gray-800'}`}
                            >
                                <RefreshCcw size={18} /> Reconciliation Hub
                            </button>
                            <button 
                                onClick={() => setActiveTab('audit')}
                                className={`flex items-center gap-3 px-4 py-4 text-sm font-bold transition-all ${activeTab === 'audit' ? 'bg-cyan-600/10 text-cyan-400 border-l-4 border-cyan-500' : 'text-gray-400 hover:bg-gray-800'}`}
                            >
                                <History size={18} /> Audit Persistence
                            </button>
                            <button 
                                onClick={() => setActiveTab('telemetry')}
                                className={`flex items-center gap-3 px-4 py-4 text-sm font-bold transition-all ${activeTab === 'telemetry' ? 'bg-cyan-600/10 text-cyan-400 border-l-4 border-cyan-500' : 'text-gray-400 hover:bg-gray-800'}`}
                            >
                                <Gauge size={18} /> Engine Telemetry
                            </button>
                        </div>
                    </Card>

                    {/* AI Chat Bar (The "Cheat Sheet" Assistant) */}
                    <Card title="Treasury AI" icon={<MessageSquare className="text-cyan-400" size={18} />} className="h-[500px] flex flex-col">
                        <div className="flex-grow overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                            {chatHistory.map((msg, i) => (
                                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-cyan-600 text-white rounded-tr-none' 
                                            : 'bg-gray-800 text-gray-300 border border-gray-700 rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                    </div>
                                    <span className="text-[9px] text-gray-600 mt-1 uppercase">{msg.timestamp}</span>
                                </div>
                            ))}
                            {isAiThinking && (
                                <div className="flex items-center gap-2 text-cyan-500 text-[10px] font-bold animate-pulse">
                                    <Cpu size={12} className="animate-spin" /> QUANTUM CORE THINKING...
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                placeholder="Ask the AI Architect..."
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-cyan-500 transition-all"
                            />
                            <button 
                                onClick={handleSendMessage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400"
                            >
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Main Workspace */}
                <div className="lg:col-span-9 space-y-6">
                    
                    {activeTab === 'telemetry' && renderTelemetry()}
                    {activeTab === 'audit' && renderAuditTrail()}

                    {activeTab === 'reconcile' && (
                        <>
                            {/* Action Bar */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                                <div className="flex items-center gap-4">
                                    <div className="flex -space-x-2">
                                        <div className="w-8 h-8 rounded-full bg-cyan-600 border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold">AI</div>
                                        <div className="w-8 h-8 rounded-full bg-purple-600 border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold">SEC</div>
                                    </div>
                                    <p className="text-sm font-medium text-gray-400">
                                        <span className="text-white font-bold">{ledgerTx.filter(t => t.status === 'UNMATCHED').length}</span> items pending reconciliation
                                    </p>
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button className="flex-1 md:flex-none px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 text-sm font-bold transition-all">
                                        <Filter size={16} /> Advanced Filter
                                    </button>
                                    <button 
                                        onClick={runAIMatching}
                                        disabled={isAutoMatching}
                                        className="flex-1 md:flex-none px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-wider disabled:opacity-50 transition-all shadow-lg shadow-cyan-900/40"
                                    >
                                        {isAutoMatching ? <RefreshCcw size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                        AI Auto-Match
                                    </button>
                                </div>
                            </div>

                            {/* AI Suggestions Panel */}
                            {suggestions.length > 0 && (
                                <div className="p-6 bg-cyan-900/10 border border-cyan-500/30 rounded-2xl animate-fadeIn relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <Cpu size={120} />
                                    </div>
                                    <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                                        <Wand2 size={20} /> Neural Match Suggestions ({suggestions.length})
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {suggestions.map((s, idx) => {
                                            const l = ledgerTx.find(t => t.id === s.ledgerId);
                                            const stmt = statementTx.find(t => t.id === s.statementId);
                                            if (!l || !stmt) return null;
                                            return (
                                                <div key={idx} className="p-4 bg-gray-900/80 rounded-xl border border-gray-700 hover:border-cyan-500 transition-all group relative">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-gray-500 font-mono uppercase">Confidence</span>
                                                            <span className="text-green-400 font-black text-lg">{(s.confidence * 100).toFixed(0)}%</span>
                                                        </div>
                                                        <div className="bg-gray-800 p-1.5 rounded text-[10px] font-mono text-gray-400">
                                                            {s.aiModel}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 mb-4">
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-500">Ledger:</span>
                                                            <span className="text-white font-bold">${l.amount.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex justify-between text-xs">
                                                            <span className="text-gray-500">Statement:</span>
                                                            <span className="text-white font-bold">${stmt.amount.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] text-cyan-300/80 italic mb-4 line-clamp-2">"{s.reason}"</p>
                                                    <button 
                                                        onClick={() => handleAutoResolve(s)}
                                                        className="w-full py-2 bg-cyan-600/20 hover:bg-cyan-600 text-cyan-400 hover:text-white text-xs font-black rounded-lg transition-all border border-cyan-500/30"
                                                    >
                                                        CONFIRM MATCH
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Main Reconciliation Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[700px]">
                                
                                {/* Internal Ledger Side */}
                                <Card 
                                    title="Internal Ledger (ERP)" 
                                    subtitle="Source: SAP/Oracle Integration"
                                    className="flex flex-col h-full border-t-4 border-cyan-500"
                                    headerActions={[
                                        { id: 'sync', icon: <RefreshCcw />, label: 'Sync ERP', onClick: () => logAction('ERP_SYNC', 'Manual sync triggered', 'INFO') }
                                    ]}
                                >
                                    <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                        {ledgerTx.filter(t => t.status === 'UNMATCHED').map(tx => (
                                            <div 
                                                key={tx.id}
                                                onClick={() => setSelectedLedger(tx.id === selectedLedger ? null : tx.id)}
                                                className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                                                    selectedLedger === tx.id 
                                                        ? 'bg-cyan-900/20 border-cyan-500 shadow-lg shadow-cyan-900/20' 
                                                        : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-mono text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{tx.date}</span>
                                                    <span className="font-black text-white text-lg">${tx.amount.toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-300 font-medium truncate mb-2">{tx.description}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] text-gray-600 font-mono">{tx.id}</span>
                                                    <div className="flex gap-1">
                                                        <span className="px-1.5 py-0.5 bg-gray-800 rounded text-[9px] text-gray-400 font-bold uppercase">{tx.metadata.rail}</span>
                                                        {tx.metadata.mfaVerified && <ShieldCheck size={12} className="text-green-500" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {ledgerTx.filter(t => t.status === 'UNMATCHED').length === 0 && (
                                            <div className="text-center py-20 text-gray-500 flex flex-col items-center animate-pulse">
                                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                                </div>
                                                <p className="font-bold text-white">Ledger Reconciled</p>
                                                <p className="text-xs">All internal records matched.</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>

                                {/* Bank Statement Side */}
                                <Card 
                                    title="Bank Statement" 
                                    subtitle="Source: Quantum API Real-time Feed"
                                    className="flex flex-col h-full border-t-4 border-purple-500"
                                    headerActions={[
                                        { id: 'api', icon: <Database />, label: 'API Status', onClick: () => logAction('API_CHECK', 'Bank feed health check', 'INFO') }
                                    ]}
                                >
                                     <div className="flex-grow overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                        {statementTx.filter(t => t.status === 'UNMATCHED').map(tx => (
                                            <div 
                                                key={tx.id}
                                                onClick={() => setSelectedStatement(tx.id === selectedStatement ? null : tx.id)}
                                                className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                                                    selectedStatement === tx.id 
                                                        ? 'bg-purple-900/20 border-purple-500 shadow-lg shadow-purple-900/20' 
                                                        : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                                                }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-mono text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded">{tx.date}</span>
                                                    <span className="font-black text-white text-lg">${tx.amount.toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-300 font-medium truncate mb-2">{tx.description}</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] text-gray-600 font-mono">{tx.id}</span>
                                                    <div className="flex items-center gap-2">
                                                        {tx.riskScore > 0.5 && (
                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/20 text-red-400 rounded text-[9px] font-bold animate-pulse">
                                                                <AlertTriangle size={10} /> HIGH RISK
                                                            </div>
                                                        )}
                                                        <span className="px-1.5 py-0.5 bg-gray-800 rounded text-[9px] text-gray-400 font-bold uppercase">{tx.metadata.rail}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                         {statementTx.filter(t => t.status === 'UNMATCHED').length === 0 && (
                                            <div className="text-center py-20 text-gray-500 flex flex-col items-center animate-pulse">
                                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                                </div>
                                                <p className="font-bold text-white">Statement Reconciled</p>
                                                <p className="text-xs">All bank transactions verified.</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* Manual Match Action Bar (Floating HUD) */}
            <div className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur-xl border border-cyan-500/50 p-6 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.2)] flex items-center gap-8 transition-all duration-500 z-50 ${selectedLedger && selectedStatement ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-90 pointer-events-none'}`}>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Ledger Item</span>
                        <span className="text-cyan-400 font-mono font-bold">{selectedLedger}</span>
                    </div>
                    <div className="h-10 w-px bg-gray-700"></div>
                    <div className="bg-cyan-500/20 p-2 rounded-full">
                        <RefreshCcw className="text-cyan-500 animate-spin-slow" size={24} />
                    </div>
                    <div className="h-10 w-px bg-gray-700"></div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Statement Item</span>
                        <span className="text-purple-400 font-mono font-bold">{selectedStatement}</span>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => { setSelectedLedger(null); setSelectedStatement(null); }} 
                        className="px-6 py-3 rounded-xl hover:bg-gray-800 text-gray-400 text-sm font-bold transition-all"
                    >
                        Abort
                    </button>
                    <button 
                        onClick={handleManualMatch} 
                        className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black shadow-lg shadow-cyan-900/40 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Fingerprint size={18} /> AUTHORIZE MATCH
                    </button>
                </div>
            </div>

            {/* Security Simulation Modal */}
            {showSecurityModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <Card className="max-w-md w-full border-cyan-500/50 shadow-[0_0_100px_rgba(6,182,212,0.1)]" title="Security Protocol V4" icon={<ShieldCheck className="text-cyan-400" />}>
                        <div className="space-y-6 py-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl border border-gray-800">
                                <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center">
                                    <Lock className="text-cyan-500" size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Multi-Factor Authentication</p>
                                    <p className="text-xs text-gray-500">Biometric & Hardware Key Active</p>
                                </div>
                                <div className="ml-auto">
                                    <div className="w-10 h-5 bg-cyan-600 rounded-full relative">
                                        <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs text-gray-400 uppercase font-black">Encryption Telemetry</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                                        <p className="text-[10px] text-gray-500">AES-256-GCM</p>
                                        <p className="text-xs font-bold text-green-400">VERIFIED</p>
                                    </div>
                                    <div className="p-3 bg-gray-900 rounded-lg border border-gray-800">
                                        <p className="text-[10px] text-gray-500">TLS 1.3</p>
                                        <p className="text-xs font-bold text-green-400">ACTIVE</p>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowSecurityModal(false)}
                                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-black transition-all"
                            >
                                RETURN TO HUB
                            </button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Footer: Legal & Versioning */}
            <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 font-mono uppercase tracking-widest">
                <div className="flex items-center gap-4">
                    <span>© 2024 Quantum Financial Group</span>
                    <span className="text-gray-800">|</span>
                    <span>Build: 4.0.11-STABLE</span>
                </div>
                <div className="flex items-center gap-6">
                    <a href="#" className="hover:text-cyan-500 transition-colors">Privacy Protocol</a>
                    <a href="#" className="hover:text-cyan-500 transition-colors">Security Whitepaper</a>
                    <a href="#" className="hover:text-cyan-500 transition-colors">API Documentation</a>
                </div>
            </footer>

            {/* Custom Scrollbar Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
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
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
};

export default ReconciliationHubView;