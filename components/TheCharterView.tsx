import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import Card from '../Card';

/**
 * @file TheCharterView.tsx
 * @description 
 * This is the "Golden Ticket" experience for Quantum Financial. 
 * A high-performance, elite-tier command center designed for the Sovereign Architect.
 * 
 * PHILOSOPHY:
 * - "Test Drive" the engine of global finance.
 * - "Bells and Whistles" included: AI Strategist, Real-time Audit, Fraud Monitoring, and Payment Rails.
 * - "Cheat Sheet" for business banking: Everything at your fingertips.
 * - NO PRESSURE: This is a simulation of absolute power.
 * 
 * METAPHOR: 
 * Kick the tires. See the engine roar. You are in the driver's seat of a global financial titan.
 * 
 * TECHNICAL STACK:
 * - Generative AI: Google Gemini Integration.
 * - Security: Multi-factor simulation & Fraud heuristics.
 * - Analytics: Real-time data visualization.
 * - Audit: Immutable (in-memory) action logging.
 */

// ================================================================================================
// TYPE DEFINITIONS & INTERFACES
// ================================================================================================

interface AuditEntry {
    id: string;
    timestamp: string;
    action: string;
    details: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    actor: string;
}

interface ChatMessage {
    role: 'user' | 'ai' | 'system';
    content: string;
    timestamp: string;
}

interface PaymentSimulation {
    id: string;
    type: 'Wire' | 'ACH' | 'RTP';
    amount: number;
    recipient: string;
    status: 'Pending' | 'Processing' | 'Completed' | 'Flagged';
    riskScore: number;
}

interface SecurityMetric {
    label: string;
    value: number;
    status: 'secure' | 'warning' | 'alert';
}

// ================================================================================================
// CONSTANTS & MOCK DATA
// ================================================================================================

const INITIAL_CHARTER = `// QUANTUM FINANCIAL SOVEREIGN CHARTER
// VERSION: 4.0.1-ALPHA
// ARCHITECT: JAMES BURVEL O'CALLAGHAN III

1. RISK PARAMETERS:
   - Aggressive pursuit of alpha in emerging markets.
   - Zero-tolerance for ESG ratings below A-.
   - Automated hedging on all cross-border exposures > $10M.

2. LIQUIDITY MANDATE:
   - Maintain $50M in Tier-1 capital at all times.
   - Sweep excess yields into the Quantum Venture Fund every Friday at 16:00 EST.

3. SECURITY PROTOCOLS:
   - Biometric handshake required for all outbound wires > $1M.
   - AI-driven fraud monitoring active 24/7/365.
   - Every transaction must be logged to the Immutable Audit Ledger.

4. PHILOSOPHY:
   - Efficiency is the only morality.
   - Technology is the lever; Capital is the fulcrum.`;

const SYSTEM_PROMPT = `You are the Quantum Financial AI Strategist. 
You are embedded in the "Charter View" of the Quantum Financial Demo.
Your goal is to help the user "test drive" the platform.
You are elite, professional, and high-performance.
You can help write the Charter, simulate payments, and explain security features.
NEVER mention Citibank. Use "Quantum Financial" or "The Demo Bank".
If the user asks to "create" something, simulate the logic and tell them it's done.`;

// ================================================================================================
// SUB-COMPONENTS
// ================================================================================================

/**
 * @component AuditLedger
 * @description Displays the "Black Box" of the application. Every action is recorded here.
 */
const AuditLedger: React.FC<{ logs: AuditEntry[] }> = ({ logs }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div className="bg-black/40 border border-gray-800 rounded-lg p-4 font-mono text-xs h-64 overflow-y-auto" ref={scrollRef}>
            <div className="flex items-center justify-between mb-2 border-b border-gray-800 pb-2">
                <span className="text-cyan-500 font-bold">SYSTEM_AUDIT_LOG</span>
                <span className="text-gray-500">SECURE_ENCRYPTED_FEED</span>
            </div>
            {logs.map((log) => (
                <div key={log.id} className="mb-1 flex gap-2">
                    <span className="text-gray-600">[{log.timestamp}]</span>
                    <span className={`font-bold ${
                        log.severity === 'critical' ? 'text-red-500' : 
                        log.severity === 'high' ? 'text-orange-500' : 
                        log.severity === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                        {log.action.toUpperCase()}
                    </span>
                    <span className="text-gray-400">{log.details}</span>
                    <span className="text-gray-700 ml-auto">@{log.actor}</span>
                </div>
            ))}
            {logs.length === 0 && <div className="text-gray-600 italic">Waiting for system events...</div>}
        </div>
    );
};

/**
 * @component SecurityVault
 * @description Visualizes the security posture of the institution.
 */
const SecurityVault: React.FC<{ metrics: SecurityMetric[] }> = ({ metrics }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metrics.map((m, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-700 p-4 rounded-lg">
                    <div className="text-xs text-gray-500 uppercase mb-1">{m.label}</div>
                    <div className="flex items-end justify-between">
                        <div className="text-2xl font-bold text-white">{m.value}%</div>
                        <div className={`h-2 w-2 rounded-full animate-pulse ${
                            m.status === 'secure' ? 'bg-green-500' : 
                            m.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                    </div>
                    <div className="w-full bg-gray-800 h-1 mt-2 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-1000 ${
                                m.status === 'secure' ? 'bg-green-500' : 
                                m.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} 
                            style={{ width: `${m.value}%` }} 
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

// ================================================================================================
// MAIN COMPONENT: THE CHARTER VIEW
// ================================================================================================

const TheCharterView: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [charterText, setCharterText] = useState(INITIAL_CHARTER);
    const [isMandateGranted, setIsMandateGranted] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { role: 'system', content: 'Quantum AI Strategist Online. How shall we optimize your empire today?', timestamp: new Date().toLocaleTimeString() }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [payments, setPayments] = useState<PaymentSimulation[]>([]);
    const [engineStatus, setEngineStatus] = useState<'IDLE' | 'RUNNING' | 'OVERDRIVE'>('IDLE');
    
    // --- REFS ---
    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- HELPERS ---
    const logAction = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'low') => {
        const newEntry: AuditEntry = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            action,
            details,
            severity,
            actor: 'SYSTEM_ARCHITECT'
        };
        setAuditLogs(prev => [...prev, newEntry]);
    }, []);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    // --- AI LOGIC ---
    const handleAiChat = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!userInput.trim()) return;

        const userMsg = userInput;
        setUserInput('');
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date().toLocaleTimeString() }]);
        setIsAiLoading(true);
        logAction('AI_QUERY', `User asked: "${userMsg.substring(0, 30)}..."`, 'low');

        try {
            // Using the provided GEMINI_API_KEY from the environment
            const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                ${SYSTEM_PROMPT}
                Current Charter: ${charterText}
                User Message: ${userMsg}
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setChatHistory(prev => [...prev, { role: 'ai', content: text, timestamp: new Date().toLocaleTimeString() }]);
            logAction('AI_RESPONSE', 'Strategist provided guidance.', 'low');

            // Logic to "create the shit it needs" - if AI suggests a payment or charter change
            if (text.toLowerCase().includes('simulating payment') || text.toLowerCase().includes('wire')) {
                simulatePayment('Wire', 500000, 'Global Logistics Corp');
            }
            if (text.toLowerCase().includes('updating charter') || text.toLowerCase().includes('added to your charter')) {
                setCharterText(prev => prev + `\n\n// AI ADDENDUM (${new Date().toLocaleDateString()})\n${text.split('\n')[0]}`);
                logAction('CHARTER_MODIFIED', 'AI suggested amendment integrated.', 'medium');
            }

        } catch (error) {
            console.error("AI Error:", error);
            setChatHistory(prev => [...prev, { role: 'ai', content: "I apologize, Architect. My neural link is experiencing interference. Please check your API configuration.", timestamp: new Date().toLocaleTimeString() }]);
            logAction('AI_ERROR', 'Neural link failure.', 'high');
        } finally {
            setIsAiLoading(false);
        }
    };

    // --- BUSINESS LOGIC SIMULATIONS ---
    const simulatePayment = (type: PaymentSimulation['type'], amount: number, recipient: string) => {
        const newPayment: PaymentSimulation = {
            id: `TX-${Math.random().toString(36).toUpperCase().substr(2, 6)}`,
            type,
            amount,
            recipient,
            status: 'Processing',
            riskScore: Math.floor(Math.random() * 15) // Low risk for demo
        };
        setPayments(prev => [newPayment, ...prev]);
        logAction('PAYMENT_INITIATED', `${type} of $${amount.toLocaleString()} to ${recipient}`, 'medium');

        setTimeout(() => {
            setPayments(prev => prev.map(p => p.id === newPayment.id ? { ...p, status: 'Completed' } : p));
            logAction('PAYMENT_COMPLETED', `Transaction ${newPayment.id} settled.`, 'low');
        }, 3000);
    };

    const handleGrantMandate = () => {
        setIsMandateGranted(true);
        setEngineStatus('RUNNING');
        logAction('MANDATE_GRANTED', 'Sovereign Architect signed the Charter.', 'critical');
        
        // Simulate some initial "engine roar"
        setTimeout(() => {
            simulatePayment('ACH', 125000, 'Cloud Infrastructure Services');
            simulatePayment('Wire', 2400000, 'Quantum Real Estate Holdings');
        }, 1000);
    };

    const handleCharterChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCharterText(e.target.value);
        // Throttled logging would be better, but for demo we log on change
        if (Math.random() > 0.9) logAction('CHARTER_DRAFTING', 'Architect is refining the Constitution.', 'low');
    };

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-[#0a0a0c] text-gray-200 p-4 md:p-8 space-y-8 font-sans selection:bg-cyan-500/30">
            
            {/* HEADER SECTION */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">QUANTUM</span>
                        <span className="text-gray-500 font-light">FINANCIAL</span>
                    </h1>
                    <p className="text-gray-400 mt-1 font-mono text-sm tracking-widest uppercase">Sovereign Command & Control Center</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <div className="text-xs text-gray-500 uppercase">System Status</div>
                        <div className="text-green-500 font-bold flex items-center gap-2 justify-end">
                            <span className="h-2 w-2 bg-green-500 rounded-full animate-ping" />
                            ALL SYSTEMS NOMINAL
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            setEngineStatus('OVERDRIVE');
                            logAction('ENGINE_OVERDRIVE', 'Architect engaged maximum performance mode.', 'high');
                        }}
                        className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-md text-xs font-bold transition-all"
                    >
                        KICK THE TIRES
                    </button>
                </div>
            </header>

            {/* TOP ROW: SECURITY & ANALYTICS */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Security Vault & Fraud Heuristics
                    </h2>
                    <span className="text-xs text-gray-500 font-mono">ENCRYPTION: AES-256-GCM</span>
                </div>
                <SecurityVault metrics={[
                    { label: 'Neural Fraud Shield', value: 99.8, status: 'secure' },
                    { label: 'MFA Compliance', value: 100, status: 'secure' },
                    { label: 'Network Latency', value: 12, status: 'secure' }
                ]} />
            </section>

            {/* MAIN GRID: CHARTER & AI STRATEGIST */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT: THE CHARTER (6 COLS) */}
                <div className="lg:col-span-7 space-y-6">
                    <Card 
                        title="The Financial Constitution" 
                        subtitle="Define your philosophy. Inscribe your mandate."
                        className="h-full border-cyan-900/20"
                    >
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <textarea
                                value={charterText}
                                onChange={handleCharterChange}
                                className="relative w-full h-[500px] bg-[#0d0d0f] border border-gray-800 rounded-lg p-6 text-cyan-50 font-mono text-sm focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all leading-relaxed"
                                placeholder="Inscribe your principles here..."
                            />
                        </div>
                        <div className="mt-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase">Last Modified</span>
                                    <span className="text-xs text-gray-300 font-mono">2024-10-24 14:22:01</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase">Integrity Hash</span>
                                    <span className="text-xs text-gray-300 font-mono">0x88F...2A1</span>
                                </div>
                            </div>
                            <button
                                onClick={handleGrantMandate}
                                disabled={isMandateGranted}
                                className={`px-8 py-3 rounded-lg font-bold text-sm transition-all flex items-center gap-3 ${
                                    isMandateGranted 
                                    ? 'bg-green-500/20 text-green-500 border border-green-500/50 cursor-default' 
                                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                                }`}
                            >
                                {isMandateGranted ? (
                                    <><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> MANDATE GRANTED</>
                                ) : (
                                    'SIGN & GRANT MANDATE'
                                )}
                            </button>
                        </div>
                        {isMandateGranted && (
                            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-xs text-center animate-pulse">
                                Quantum Financial is now operating under your Charter. Engine status: {engineStatus}.
                            </div>
                        )}
                    </Card>
                </div>

                {/* RIGHT: AI STRATEGIST & PAYMENTS (5 COLS) */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* AI CHAT */}
                    <Card title="AI Strategist" subtitle="Neural-linked financial intelligence.">
                        <div className="flex flex-col h-[400px]">
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-cyan-600 text-white rounded-br-none' 
                                            : msg.role === 'system'
                                            ? 'bg-gray-800 text-gray-400 italic border border-gray-700'
                                            : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                                        }`}>
                                            {msg.content}
                                            <div className="text-[10px] mt-1 opacity-50 text-right">{msg.timestamp}</div>
                                        </div>
                                    </div>
                                ))}
                                {isAiLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-gray-800 p-3 rounded-lg flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>
                            <form onSubmit={handleAiChat} className="mt-4 flex gap-2">
                                <input 
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="Ask the Strategist..."
                                    className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-4 py-2 text-sm focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                                <button 
                                    type="submit"
                                    disabled={isAiLoading}
                                    className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-md transition-colors disabled:opacity-50"
                                >
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            </form>
                        </div>
                    </Card>

                    {/* ENGINE ROOM: PAYMENTS */}
                    <Card title="Engine Room" subtitle="Real-time payment rails (Wire, ACH, RTP).">
                        <div className="space-y-3">
                            {payments.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed border-gray-800 rounded-lg">
                                    <p className="text-gray-600 text-sm italic">No active transmissions.</p>
                                    <button 
                                        onClick={() => simulatePayment('Wire', 1000000, 'Global Acquisitions LLC')}
                                        className="mt-2 text-xs text-cyan-500 hover:underline"
                                    >
                                        Initialize Test Transmission
                                    </button>
                                </div>
                            ) : (
                                payments.map(p => (
                                    <div key={p.id} className="bg-gray-900/80 border border-gray-800 p-3 rounded-md flex items-center justify-between group hover:border-cyan-500/30 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded bg-gray-800 ${p.status === 'Completed' ? 'text-green-500' : 'text-cyan-500'}`}>
                                                {p.type === 'Wire' ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white">{p.recipient}</div>
                                                <div className="text-[10px] text-gray-500">{p.id} • {p.type}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold text-white">${p.amount.toLocaleString()}</div>
                                            <div className={`text-[10px] font-bold ${p.status === 'Completed' ? 'text-green-500' : 'text-yellow-500 animate-pulse'}`}>
                                                {p.status.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* BOTTOM ROW: AUDIT LOG (THE BLACK BOX) */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Immutable Audit Storage
                    </h2>
                    <div className="flex gap-4 text-[10px] text-gray-500 font-mono">
                        <span>STORAGE: DISTRIBUTED_LEDGER</span>
                        <span>RETENTION: INDEFINITE</span>
                    </div>
                </div>
                <AuditLedger logs={auditLogs} />
            </section>

            {/* FOOTER: INTEGRATION STATUS */}
            <footer className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-gray-400 uppercase tracking-widest">ERP: CONNECTED</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-gray-400 uppercase tracking-widest">SWIFT: ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-400 uppercase tracking-widest">AI_CORE: SYNCED</span>
                    </div>
                </div>
                <div className="text-[10px] text-gray-600 font-mono">
                    © 2024 QUANTUM FINANCIAL DEMO • NO REAL ASSETS AT RISK • TEST DRIVE MODE
                </div>
            </footer>

            {/* CUSTOM SCROLLBAR STYLES */}
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
                    background: #374151;
                }
            `}} />
        </div>
    );
};

export default TheCharterView;