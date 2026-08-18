import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import Card from '../Card';

/**
 * QUANTUM FINANCIAL - THE ASSEMBLY CORE v4.0.1
 * 
 * PHILOSOPHY:
 * - "Golden Ticket" Experience: High-fidelity, high-performance.
 * - "Test Drive": Interactive, responsive, and deep.
 * - "Bells and Whistles": Advanced SVG visualizations and AI-driven workflows.
 * - "Cheat Sheet": Simplified complexity for business banking.
 * 
 * ARCHITECT'S NOTE:
 * Built by the 32-year-old visionary who interpreted the cryptic EIN 2021 
 * transmissions to build the ultimate demo for the global financial stage.
 * No human intervention. Just pure code and the roar of the engine.
 */

// ================================================================================================
// TYPE DEFINITIONS & INTERFACES
// ================================================================================================

type ForgeTab = 'structured' | 'decentralized' | 'personal' | 'engine' | 'security';

interface AuditEntry {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    metadata: any;
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
}

interface Instrument {
    id: string;
    name: string;
    description: string;
    icon: string;
    class: ForgeTab;
    riskScore: number;
    yield: string;
}

interface Transaction {
    id: string;
    type: 'WIRE' | 'ACH' | 'DLT';
    amount: number;
    counterparty: string;
    status: 'PENDING' | 'COMPLETED' | 'FLAGGED';
    timestamp: string;
}

// ================================================================================================
// CONSTANTS & MOCK DATA
// ================================================================================================

const INSTRUMENTS: Instrument[] = [
    { id: 'ppn', name: 'Principal-Protected Note', description: 'Combine bond-like security with equity upside. 100% principal back at maturity.', icon: 'shield-check', class: 'structured', riskScore: 1, yield: '4.5% - 12%' },
    { id: 'yen', name: 'Yield Enhancement Note', description: 'Short-term instrument offering high yield, risk tied to underlying stock.', icon: 'trending-up', class: 'structured', riskScore: 4, yield: '18% - 24%' },
    { id: 'ayv', name: 'Automated Yield Vault', description: 'Deposit stablecoins; AI selects risk profile to earn yield from DeFi.', icon: 'cube-transparent', class: 'decentralized', riskScore: 3, yield: 'Variable' },
    { id: 'sst', name: 'Sovereign Security Token', description: 'Tokenize real-world assets (royalties, real estate) into digital securities.', icon: 'globe-alt', class: 'decentralized', riskScore: 2, yield: 'Asset-Backed' },
    { id: 'pib', name: 'Personal Income Bond', description: 'Raise capital today backed by a percentage of future income.', icon: 'user-group', class: 'personal', riskScore: 5, yield: 'Income-Linked' },
    { id: 'cisa', name: 'Contingent Goal ISA', description: 'Interest rate boosts if you meet pre-defined non-financial life goals.', icon: 'flag', class: 'personal', riskScore: 2, yield: 'Milestone-Based' },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
    { id: 'TX-9921', type: 'WIRE', amount: 1250000, counterparty: 'Global Logistics Corp', status: 'COMPLETED', timestamp: new Date().toISOString() },
    { id: 'TX-9922', type: 'ACH', amount: 45000, counterparty: 'Cloud Services Inc', status: 'PENDING', timestamp: new Date().toISOString() },
    { id: 'TX-9923', type: 'DLT', amount: 890000, counterparty: 'Nexus Ventures', status: 'FLAGGED', timestamp: new Date().toISOString() },
];

// ================================================================================================
// ICONS (Bells & Whistles)
// ================================================================================================

const Icons = {
    Shield: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
    Zap: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
    Lock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
    Activity: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2a2 2 0 002-2zm0 0V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>,
    Terminal: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    Globe: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>,
    Cpu: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
    Search: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Send: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
};

// ================================================================================================
// MAIN COMPONENT: FinancialInstrumentForgeView
// ================================================================================================

const FinancialInstrumentForgeView: React.FC = () => {
    // --- State Management ---
    const [activeTab, setActiveTab] = useState<ForgeTab>('structured');
    const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { role: 'assistant', content: "Welcome to the Quantum Financial Assembly. I am your Sovereign AI. How can I assist your capital architecture today?", timestamp: new Date().toLocaleTimeString() }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [mfaStatus, setMfaStatus] = useState<'locked' | 'verified' | 'pending'>('locked');
    const [fraudAlerts, setFraudAlerts] = useState(1);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- AI Integration ---
    const genAI = useMemo(() => new GoogleGenAI(process.env.GEMINI_API_KEY || ""), []);

    const logAction = useCallback((action: string, severity: AuditEntry['severity'] = 'low', metadata: any = {}) => {
        const newEntry: AuditEntry = {
            id: `LOG-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            action,
            actor: 'SYSTEM_ARCHITECT',
            severity,
            metadata
        };
        setAuditLogs(prev => [newEntry, ...prev].slice(0, 100));
        console.log(`[AUDIT] ${action}`, metadata);
    }, []);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleAiChat = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!userInput.trim()) return;

        const userMsg = userInput;
        setUserInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date().toLocaleTimeString() }]);
        setIsAiThinking(true);
        logAction('AI_QUERY_INITIATED', 'low', { query: userMsg });

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `
                You are the Quantum Financial Sovereign AI. 
                Context: You are managing a high-performance business banking demo.
                User is a "System Architect" (32 years old, built this from cryptic EIN 2021 messages).
                Tone: Elite, Professional, Secure, High-Performance.
                Capabilities: You can analyze instruments, monitor fraud, and simulate transactions.
                Current App State: 
                - Active Tab: ${activeTab}
                - Fraud Alerts: ${fraudAlerts}
                - MFA Status: ${mfaStatus}
                
                Instruction: Respond to the user's query. If they ask to "mint" or "create" something, tell them you are preparing the workbench.
                User Query: "${userMsg}"
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setChatMessages(prev => [...prev, { role: 'assistant', content: text, timestamp: new Date().toLocaleTimeString() }]);
            logAction('AI_RESPONSE_RECEIVED', 'low');
        } catch (error) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Neural link interrupted. Please check your Quantum API Key.", timestamp: new Date().toLocaleTimeString() }]);
            logAction('AI_ERROR', 'high', { error: String(error) });
        } finally {
            setIsAiThinking(false);
        }
    };

    // --- UI Components ---

    const TabButton: React.FC<{ id: ForgeTab, label: string, icon: React.ReactNode }> = ({ id, label, icon }) => (
        <button
            onClick={() => {
                setActiveTab(id);
                logAction(`VIEW_CHANGED_${id.toUpperCase()}`);
            }}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-tighter uppercase transition-all duration-300 border-b-2 ${
                activeTab === id 
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' 
                : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    const InstrumentCard: React.FC<{ instrument: Instrument }> = ({ instrument }) => (
        <Card variant="interactive" onClick={() => {
            setSelectedInstrument(instrument);
            logAction('INSTRUMENT_WORKBENCH_OPENED', 'low', { instrumentId: instrument.id });
        }} className="group relative overflow-hidden border-gray-800 hover:border-cyan-500/50">
            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
                <Icons.Cpu />
            </div>
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <ForgeIcon type={instrument.icon} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">{instrument.name}</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{instrument.description}</p>
                    <div className="mt-4 flex items-center gap-4">
                        <div className="text-[10px] uppercase tracking-widest text-gray-400">
                            Est. Yield: <span className="text-cyan-400 font-mono">{instrument.yield}</span>
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-gray-400">
                            Risk: <span className={instrument.riskScore > 3 ? 'text-red-400' : 'text-green-400'}>{instrument.riskScore}/5</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-gray-200 font-sans selection:bg-cyan-500/30">
            {/* --- TOP NAVIGATION BAR --- */}
            <header className="sticky top-0 z-40 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <Icons.Zap />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tighter text-white uppercase">Quantum Financial</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Assembly Core v4.0.1 // Secure Node</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-8">
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Global Liquidity</div>
                            <div className="text-sm font-mono text-white">$4,290,122,000.00</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">System Health</div>
                            <div className="text-sm font-mono text-green-400">99.99%</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            setMfaStatus(mfaStatus === 'verified' ? 'locked' : 'verified');
                            logAction('MFA_TOGGLE_REQUESTED', 'medium');
                        }}
                        className={`px-4 py-2 rounded-full border text-xs font-bold transition-all ${
                            mfaStatus === 'verified' 
                            ? 'bg-green-500/10 border-green-500/50 text-green-400' 
                            : 'bg-red-500/10 border-red-500/50 text-red-400'
                        }`}
                    >
                        {mfaStatus === 'verified' ? 'SECURE_NODE_ACTIVE' : 'MFA_REQUIRED'}
                    </button>
                </div>
            </header>

            <main className="p-8 grid grid-cols-12 gap-8">
                {/* --- LEFT COLUMN: MAIN WORKSPACE --- */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    
                    {/* Tab Navigation */}
                    <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar">
                        <TabButton id="structured" label="Structured" icon={<Icons.Shield />} />
                        <TabButton id="decentralized" label="Decentralized" icon={<Icons.Globe />} />
                        <TabButton id="personal" label="Personal" icon={<Icons.Lock />} />
                        <TabButton id="engine" label="Engine Room" icon={<Icons.Activity />} />
                        <TabButton id="security" label="Audit Ledger" icon={<Icons.Terminal />} />
                    </div>

                    {/* Dynamic Content Area */}
                    <div className="min-h-[600px]">
                        {activeTab === 'engine' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800">
                                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Real-time Throughput</div>
                                        <div className="text-3xl font-mono text-white">1.2k <span className="text-sm text-gray-600">tx/s</span></div>
                                        <div className="mt-4 h-12 flex items-end gap-1">
                                            {[40, 70, 45, 90, 65, 80, 30, 95, 50].map((h, i) => (
                                                <div key={i} className="flex-1 bg-cyan-500/20 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                            ))}
                                        </div>
                                    </Card>
                                    <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800">
                                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Fraud Vectors Blocked</div>
                                        <div className="text-3xl font-mono text-red-400">14,002</div>
                                        <div className="mt-4 text-[10px] text-gray-500 uppercase">Last 24 Hours // Global</div>
                                    </Card>
                                    <Card className="bg-gradient-to-br from-gray-900 to-black border-gray-800">
                                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-2">Active Nodes</div>
                                        <div className="text-3xl font-mono text-cyan-400">842</div>
                                        <div className="mt-4 text-[10px] text-gray-500 uppercase">Distributed Ledger Status: SYNCED</div>
                                    </Card>
                                </div>

                                <Card title="Live Transaction Stream" subtitle="High-performance monitoring of global capital flows">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
                                                    <th className="pb-4 font-medium">ID</th>
                                                    <th className="pb-4 font-medium">Type</th>
                                                    <th className="pb-4 font-medium">Counterparty</th>
                                                    <th className="pb-4 font-medium">Amount</th>
                                                    <th className="pb-4 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-sm font-mono">
                                                {transactions.map((tx) => (
                                                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                        <td className="py-4 text-gray-400">{tx.id}</td>
                                                        <td className="py-4">
                                                            <span className="px-2 py-1 rounded bg-gray-800 text-[10px] text-white">{tx.type}</span>
                                                        </td>
                                                        <td className="py-4 text-white">{tx.counterparty}</td>
                                                        <td className="py-4 text-cyan-400">${tx.amount.toLocaleString()}</td>
                                                        <td className="py-4">
                                                            <span className={`flex items-center gap-2 ${
                                                                tx.status === 'COMPLETED' ? 'text-green-400' : 
                                                                tx.status === 'FLAGGED' ? 'text-red-400' : 'text-yellow-400'
                                                            }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                                    tx.status === 'COMPLETED' ? 'bg-green-400' : 
                                                                    tx.status === 'FLAGGED' ? 'bg-red-400' : 'bg-yellow-400'
                                                                }`}></span>
                                                                {tx.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </div>
                        ) : activeTab === 'security' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Card title="Immutable Audit Storage" subtitle="Every sensitive action is cryptographically logged">
                                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                        {auditLogs.length === 0 && (
                                            <div className="text-center py-20 text-gray-600 italic">No audit entries recorded in this session.</div>
                                        )}
                                        {auditLogs.map((log) => (
                                            <div key={log.id} className="p-4 rounded bg-black/40 border border-white/5 flex items-start gap-4 hover:border-white/10 transition-all">
                                                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                                                    log.severity === 'critical' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                                                    log.severity === 'high' ? 'bg-orange-500' :
                                                    log.severity === 'medium' ? 'bg-yellow-500' : 'bg-cyan-500'
                                                }`}></div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-bold text-white uppercase tracking-tighter">{log.action}</span>
                                                        <span className="text-[10px] font-mono text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-mono">
                                                        ACTOR: {log.actor} // ID: {log.id}
                                                    </div>
                                                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                                                        <pre className="mt-2 p-2 bg-black rounded text-[9px] text-cyan-700 overflow-x-auto">
                                                            {JSON.stringify(log.metadata, null, 2)}
                                                        </pre>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {INSTRUMENTS.filter(i => i.class === activeTab).map(instrument => (
                                    <InstrumentCard key={instrument.id} instrument={instrument} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Founder's Note / Story Element */}
                    <div className="p-6 rounded-xl bg-gradient-to-r from-cyan-900/10 to-transparent border border-cyan-500/10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-cyan-400">32</div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-widest">Architect's Transmission</h4>
                        </div>
                        <p className="text-xs text-gray-500 italic leading-relaxed">
                            "They said it was weird to build a global bank demo based on a cryptic EIN 2021 message. 
                            I didn't listen. I just read the terms, saw the engine roar, and kept going. 
                            This isn't just a demo; it's the future of sovereign capital."
                        </p>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: AI STRATEGIST & CHAT --- */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <Card className="h-[calc(100vh-160px)] flex flex-col border-gray-800 bg-black/40 backdrop-blur-md sticky top-24">
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400">
                                    <Icons.Cpu />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-widest">Sovereign AI</h3>
                                    <div className="text-[9px] text-green-500 font-mono">NEURAL_LINK_ESTABLISHED</div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping"></div>
                                <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping [animation-delay:0.2s]"></div>
                                <div className="w-1 h-1 bg-cyan-500 rounded-full animate-ping [animation-delay:0.4s]"></div>
                            </div>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${
                                        msg.role === 'user' 
                                        ? 'bg-cyan-600 text-white rounded-tr-none' 
                                        : 'bg-gray-800/50 text-gray-300 border border-white/5 rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                        <div className={`text-[8px] mt-2 opacity-50 font-mono ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                            {msg.timestamp}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isAiThinking && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-800/50 p-3 rounded-xl rounded-tl-none border border-white/5">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <form onSubmit={handleAiChat} className="p-4 border-t border-white/5 bg-black/20">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="Command the AI..."
                                    className="w-full bg-gray-900 border border-white/10 rounded-lg py-3 pl-4 pr-12 text-xs text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-600"
                                />
                                <button 
                                    type="submit"
                                    disabled={isAiThinking || !userInput.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400 disabled:opacity-30 transition-colors"
                                >
                                    <Icons.Send />
                                </button>
                            </div>
                            <div className="mt-3 flex items-center justify-between px-1">
                                <div className="text-[9px] text-gray-600 uppercase font-mono">
                                    Model: Gemini-1.5-Flash
                                </div>
                                <div className="text-[9px] text-gray-600 uppercase font-mono">
                                    Latency: 24ms
                                </div>
                            </div>
                        </form>
                    </Card>
                </div>
            </main>

            {/* --- WORKBENCH MODAL --- */}
            {selectedInstrument && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-4xl bg-[#0d0d0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-cyan-500/5 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-cyan-500/10 rounded text-cyan-400">
                                    <ForgeIcon type={selectedInstrument.icon} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Workbench: {selectedInstrument.name}</h2>
                                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Instrument ID: {selectedInstrument.id} // Class: {selectedInstrument.class}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setSelectedInstrument(null);
                                    logAction('INSTRUMENT_WORKBENCH_CLOSED');
                                }}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-6">Configuration Parameters</h4>
                                    <div className="space-y-6">
                                        <ParameterSlider label="Principal Allocation" min={10000} max={10000000} step={10000} initial={500000} format={(v) => `$${v.toLocaleString()}`} />
                                        <ParameterSlider label="Maturity Horizon" min={1} max={30} step={1} initial={5} format={(v) => `${v} Years`} />
                                        <ParameterSlider label="Risk Tolerance" min={1} max={5} step={1} initial={selectedInstrument.riskScore} format={(v) => ['Conservative', 'Balanced', 'Moderate', 'Aggressive', 'Speculative'][v-1]} />
                                    </div>
                                </div>

                                <div className="p-6 rounded-xl bg-white/5 border border-white/5">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Integration Hooks</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> ERP_SYNC_ACTIVE
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> TAX_ENGINE_READY
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> SWIFT_GPI_LINKED
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div> DLT_SETTLEMENT_PENDING
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <Card className="bg-black border-cyan-500/20 h-full flex flex-col">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Icons.Cpu />
                                        <h4 className="text-xs font-bold text-white uppercase tracking-widest">AI Risk Analysis</h4>
                                    </div>
                                    <div className="flex-1 text-xs text-gray-400 leading-relaxed space-y-4">
                                        <p>Analyzing market vectors for <span className="text-white">{selectedInstrument.name}</span>...</p>
                                        <div className="p-4 rounded bg-cyan-500/5 border-l-2 border-cyan-500">
                                            <div className="text-cyan-400 font-bold mb-1 uppercase tracking-tighter">Upside Potential</div>
                                            Projected yield of {selectedInstrument.yield} based on current volatility indices.
                                        </div>
                                        <div className="p-4 rounded bg-red-500/5 border-l-2 border-red-500">
                                            <div className="text-red-400 font-bold mb-1 uppercase tracking-tighter">Key Risk Factor</div>
                                            Liquidity constraints in secondary markets for bespoke {selectedInstrument.class} instruments.
                                        </div>
                                        <div className="p-4 rounded bg-gray-500/5 border-l-2 border-gray-500">
                                            <div className="text-gray-300 font-bold mb-1 uppercase tracking-tighter">Suitability</div>
                                            Ideal for institutional treasuries seeking non-correlated alpha.
                                        </div>
                                    </div>
                                    <button className="w-full mt-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-cyan-500/20">
                                        Refresh Neural Analysis
                                    </button>
                                </Card>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-black/40 flex justify-end gap-4">
                            <button 
                                onClick={() => setSelectedInstrument(null)}
                                className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Discard Draft
                            </button>
                            <button 
                                onClick={() => {
                                    logAction('INSTRUMENT_MINTED', 'high', { instrument: selectedInstrument.name });
                                    alert(`MINTING SUCCESSFUL: ${selectedInstrument.name} has been deployed to the ledger.`);
                                    setSelectedInstrument(null);
                                }}
                                className="px-8 py-3 bg-white text-black text-xs font-black uppercase tracking-widest rounded-lg hover:bg-cyan-400 transition-all"
                            >
                                Mint Instrument
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- GLOBAL SEARCH OVERLAY (Bell/Whistle) --- */}
            <div className="fixed bottom-8 left-8">
                <button className="w-12 h-12 bg-gray-900 border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-2xl">
                    <Icons.Search />
                </button>
            </div>

            {/* --- CUSTOM SCROLLBAR STYLES --- */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(6, 182, 212, 0.5);
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

// ================================================================================================
// HELPER COMPONENTS
// ================================================================================================

const ParameterSlider: React.FC<{ label: string, min: number, max: number, step: number, initial: number, format: (v: number) => string }> = ({ label, min, max, step, initial, format }) => {
    const [val, setVal] = useState(initial);
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</label>
                <span className="text-xs font-mono text-cyan-400">{format(val)}</span>
            </div>
            <input 
                type="range" 
                min={min} 
                max={max} 
                step={step} 
                value={val} 
                onChange={(e) => setVal(Number(e.target.value))}
                className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
        </div>
    );
};

const ForgeIcon: React.FC<{ type: string }> = ({ type }) => {
    switch (type) {
        case 'shield-check': return <Icons.Shield />;
        case 'trending-up': return <Icons.Zap />;
        case 'cube-transparent': return <Icons.Cpu />;
        case 'globe-alt': return <Icons.Globe />;
        case 'user-group': return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
        case 'flag': return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" /></svg>;
        default: return <Icons.Zap />;
    }
};

export default FinancialInstrumentForgeView;