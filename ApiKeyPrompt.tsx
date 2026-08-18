import React, { useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - THE GOLDEN TICKET BUSINESS DEMO
 * --------------------------------------------------
 * Philosophy: Elite, Professional, High-Performance, Secure.
 * Metaphor: Kick the tires. See the engine roar.
 * Security: Homomorphic Encryption Simulation, Internal App Storage.
 * AI: Quantum Assistant powered by Gemini-3-Flash.
 */

// --- TYPES & INTERFACES ---

interface AuditEntry {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    severity: 'INFO' | 'WARN' | 'CRITICAL';
    details: string;
    encryptedHash: string;
}

interface QuantumState {
    isEngineStarted: boolean;
    fuelLevel: number;
    securityClearance: 'NONE' | 'LEVEL_1' | 'LEVEL_2' | 'OMNIPOTENT';
    activeIntegrations: string[];
    vaultLocked: boolean;
}

interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

// --- CRYPTOGRAPHIC VAULT (HOMOMORPHIC SIMULATION) ---
/**
 * This vault uses a closure-based storage mechanism that is inaccessible 
 * from the global window object or browser dev tools.
 * It simulates Homomorphic Encryption by allowing operations on 
 * encrypted values without exposing the underlying raw data.
 */
const createQuantumVault = () => {
    const _storage = new WeakMap<object, any>();
    const _key = { id: 'quantum-root-key' };
    
    // Internal state
    let _balance = 125000000.42; // $125M starting liquidity
    
    return {
        encryptAndStore: (key: string, value: any) => {
            const encrypted = btoa(JSON.stringify({ data: value, ts: Date.now() }));
            _storage.set(_key, { ...(_storage.get(_key) || {}), [key]: encrypted });
        },
        getEncrypted: (key: string) => {
            const data = _storage.get(_key);
            return data ? data[key] : null;
        },
        // Homomorphic Addition Simulation: Add to balance without decrypting the whole state
        homomorphicAdd: (amount: number) => {
            _balance += amount;
            return `ENC_BAL_${Math.random().toString(36).substring(7)}`;
        },
        getBalance: () => _balance, // Only accessible via this secure interface
    };
};

const vault = createQuantumVault();

// --- AI ENGINE ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// --- COMPONENTS ---

const ApiKeyPrompt: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("Must be used within DataProvider");

    const { generateApiKey, error } = context;

    // --- STATE ---
    const [isGenerating, setIsGenerating] = useState(false);
    const [showStripeModal, setShowStripeModal] = useState(false);
    const [showAuditLog, setShowAuditLog] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState("");
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [engineStatus, setEngineStatus] = useState<QuantumState>({
        isEngineStarted: false,
        fuelLevel: 100,
        securityClearance: 'NONE',
        activeIntegrations: ['ERP_CORE', 'SWIFT_GATEWAY'],
        vaultLocked: true
    });

    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- AUDIT LOGGING ---
    const logAction = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'INFO') => {
        const newEntry: AuditEntry = {
            id: `LOG-${Math.random().toString(36).toUpperCase().substring(2, 10)}`,
            timestamp: new Date().toISOString(),
            action,
            actor: "SYSTEM_ADMIN",
            severity,
            details,
            encryptedHash: btoa(Math.random().toString())
        };
        setAuditLogs(prev => [newEntry, ...prev].slice(0, 100));
        vault.encryptAndStore(newEntry.id, newEntry);
    }, []);

    // --- AI INTERACTION ---
    const handleAiChat = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!userInput.trim()) return;

        const userMsg: ChatMessage = { role: 'user', content: userInput, timestamp: new Date() };
        setChatHistory(prev => [...prev, userMsg]);
        setUserInput("");
        setIsAiThinking(true);

        logAction("AI_QUERY", `User asked: ${userInput.substring(0, 50)}...`);

        try {
            const model = genAI.models.get("gemini-3-flash-preview");
            const prompt = `
                You are the Quantum Financial AI Concierge. 
                Context: This is a high-performance business banking demo for elite clients.
                Tone: Professional, Secure, High-Performance.
                Metaphor: We are test-driving a financial supercar.
                Capabilities: You can simulate ACH transfers, Wires, Fraud Monitoring, and ERP integrations.
                Current User Query: ${userInput}
                
                Instructions: 
                1. If the user wants to "start the engine", tell them to click the Generate API Key button.
                2. If they ask about security, explain our Homomorphic Encryption and Multi-factor simulations.
                3. If they want to see "the engine roar", describe our real-time global liquidity processing.
                4. DO NOT mention Citibank. Use "Quantum Financial" or "The Demo Bank".
                5. Keep it concise but impressive.
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            setChatHistory(prev => [...prev, { role: 'assistant', content: text, timestamp: new Date() }]);
        } catch (err) {
            setChatHistory(prev => [...prev, { role: 'assistant', content: "I apologize, but the Quantum Neural Link is experiencing high latency. Please proceed with the manual ignition sequence.", timestamp: new Date() }]);
        } finally {
            setIsAiThinking(false);
        }
    };

    // --- ACTIONS ---
    const handleGenerate = async () => {
        setIsGenerating(true);
        logAction("IGNITION_SEQUENCE", "User initiated API Key generation", "INFO");
        
        // Simulate engine warm up
        setTimeout(async () => {
            await generateApiKey();
            setEngineStatus(prev => ({ ...prev, isEngineStarted: true, securityClearance: 'LEVEL_1' }));
            logAction("ACCESS_GRANTED", "Secure API Key generated and stored in Quantum Vault", "CRITICAL");
        }, 1500);
    };

    const simulateStripePayment = () => {
        setShowStripeModal(true);
        logAction("STRIPE_INIT", "User opened Stripe payment gateway simulation", "INFO");
    };

    const processStripePayment = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setShowStripeModal(false);
            vault.homomorphicAdd(50000); // Add $50k to balance
            logAction("PAYMENT_SUCCESS", "Stripe transaction processed: +$50,000.00", "CRITICAL");
            alert("Payment Successful! Funds added to Quantum Liquidity Pool.");
        }, 2000);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    // --- UI COMPONENTS ---

    const Sidebar = () => (
        <div className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse" />
                    <h2 className="text-xl font-bold text-white tracking-tight">QUANTUM AI</h2>
                </div>
                <p className="text-xs text-gray-500 uppercase tracking-widest">Concierge Service</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {chatHistory.length === 0 && (
                    <div className="text-gray-600 text-sm italic p-4 border border-dashed border-gray-800 rounded-lg">
                        "Welcome to the cockpit. I am your Quantum Assistant. How shall we navigate your capital today?"
                    </div>
                )}
                {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[90%] p-3 rounded-xl text-sm ${
                            msg.role === 'user' 
                            ? 'bg-cyan-600 text-white rounded-tr-none' 
                            : 'bg-gray-800 text-gray-300 rounded-tl-none border border-gray-700'
                        }`}>
                            {msg.content}
                        </div>
                        <span className="text-[10px] text-gray-600 mt-1">
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                ))}
                {isAiThinking && (
                    <div className="flex gap-1 p-2">
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleAiChat} className="p-4 border-t border-gray-800 bg-gray-950">
                <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Ask Quantum AI..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
                />
            </form>
        </div>
    );

    const AuditPanel = () => (
        <div className="fixed bottom-6 right-6 w-96 max-h-[500px] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl flex flex-col overflow-hidden z-50">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    IMMUTABLE AUDIT LOG
                </h3>
                <button onClick={() => setShowAuditLog(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-[10px]">
                {auditLogs.map(log => (
                    <div key={log.id} className="p-2 border-b border-gray-800 hover:bg-gray-800 transition-colors">
                        <div className="flex justify-between mb-1">
                            <span className={log.severity === 'CRITICAL' ? 'text-red-400' : 'text-cyan-500'}>[{log.action}]</span>
                            <span className="text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-gray-400">{log.details}</div>
                        <div className="text-[8px] text-gray-700 truncate mt-1">HASH: {log.encryptedHash}</div>
                    </div>
                ))}
            </div>
        </div>
    );

    const StripeModal = () => (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
                <div className="bg-gray-50 p-6 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold">S</div>
                        <span className="font-bold text-gray-800">Stripe Checkout</span>
                    </div>
                    <button onClick={() => setShowStripeModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="p-8">
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Amount to Inject</label>
                        <div className="text-4xl font-bold text-gray-900">$50,000.00</div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Card Details</label>
                            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 text-gray-400 flex justify-between items-center">
                                <span>4242 4242 4242 4242</span>
                                <span className="text-xs">MM/YY CVC</span>
                            </div>
                        </div>
                        <button 
                            onClick={processStripePayment}
                            disabled={isGenerating}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isGenerating ? 'Processing...' : 'Pay $50,000.00'}
                        </button>
                    </div>
                    <p className="mt-6 text-center text-xs text-gray-400">
                        Securely processed by Stripe. Quantum Financial uses end-to-end encryption.
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-950 z-50 flex overflow-hidden font-sans text-gray-200">
            {/* LEFT SIDEBAR: AI CONCIERGE */}
            <Sidebar />

            {/* MAIN CONTENT: THE COCKPIT */}
            <div className="flex-1 flex flex-col relative">
                {/* TOP NAV */}
                <div className="h-16 border-b border-gray-800 flex items-center justify-between px-8 bg-gray-900/50 backdrop-blur-md">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <span className="text-white font-black text-xl">Q</span>
                            </div>
                            <span className="text-lg font-bold tracking-tighter text-white">QUANTUM FINANCIAL</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <span className="text-cyan-500 border-b-2 border-cyan-500 pb-5 mt-5">Ignition</span>
                            <span className="hover:text-white cursor-not-allowed transition-colors">Liquidity</span>
                            <span className="hover:text-white cursor-not-allowed transition-colors">Treasury</span>
                            <span className="hover:text-white cursor-not-allowed transition-colors">Security</span>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">System Status</span>
                            <span className="text-xs text-green-400 font-mono">OPTIMAL // 0.4ms LATENCY</span>
                        </div>
                        <button 
                            onClick={() => setShowAuditLog(!showAuditLog)}
                            className="p-2 hover:bg-gray-800 rounded-full transition-colors relative"
                        >
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {auditLogs.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-cyan-500 rounded-full animate-ping" />}
                        </button>
                    </div>
                </div>

                {/* HERO SECTION */}
                <div className="flex-1 flex items-center justify-center p-12 relative overflow-hidden">
                    {/* Background Decorative Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-6xl font-black text-white leading-tight tracking-tighter mb-4">
                                    TEST DRIVE THE <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">FUTURE OF CAPITAL.</span>
                                </h1>
                                <p className="text-xl text-gray-400 leading-relaxed">
                                    Welcome to the Golden Ticket experience. Kick the tires of our global liquidity engine, 
                                    explore homomorphic security, and see why the world's largest institutions trust 
                                    Quantum Financial.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-900/80 border border-gray-800 rounded-xl backdrop-blur-sm">
                                    <div className="text-cyan-500 font-bold text-2xl mb-1">$125M+</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Demo Liquidity</div>
                                </div>
                                <div className="p-4 bg-gray-900/80 border border-gray-800 rounded-xl backdrop-blur-sm">
                                    <div className="text-green-400 font-bold text-2xl mb-1">256-BIT</div>
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-widest">Quantum Vault</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="flex-1 py-5 bg-white hover:bg-cyan-50 text-gray-950 font-black rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 shadow-xl shadow-white/10"
                                >
                                    {isGenerating ? (
                                         <svg className="animate-spin h-6 w-6 text-gray-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            START ENGINE
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={simulateStripePayment}
                                    className="flex-1 py-5 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl border border-gray-700 transition-all flex items-center justify-center gap-3"
                                >
                                    <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M13.976 9.15c-2.172-.102-2.505-1.065-2.483-1.64.025-.67.663-1.13 1.691-1.13 1.204 0 2.59.31 3.631.852L17.47 4.27A10.75 10.75 0 0 0 13.217 3c-2.825 0-4.793 1.457-4.841 3.89-.052 2.629 2.251 3.508 4.662 3.627 2.23.107 2.637 1.224 2.613 1.817-.034.81-.738 1.268-1.809 1.268-1.59 0-3.111-.471-4.181-1.063L8.95 15.535c1.22.591 2.995 1.056 4.716 1.056 2.979 0 4.954-1.456 5.007-3.913.056-2.71-2.229-3.423-4.697-3.528z"/></svg>
                                    INJECT CAPITAL
                                </button>
                            </div>
                            {error && <p className="text-red-400 text-sm font-mono bg-red-400/10 p-3 rounded-lg border border-red-400/20">ERROR: {error}</p>}
                        </div>

                        {/* VISUAL ENGINE PREVIEW */}
                        <div className="hidden lg:block relative">
                            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex justify-between items-start mb-12">
                                    <div>
                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Engine Load</div>
                                        <div className="text-3xl font-mono text-white">0.00%</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Vault Status</div>
                                        <div className="text-sm font-bold text-orange-400 flex items-center gap-2">
                                            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                                            LOCKED
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { label: 'Global ACH Network', val: 98 },
                                        { label: 'SWIFT Connectivity', val: 100 },
                                        { label: 'Fraud Detection AI', val: 45 },
                                        { label: 'ERP Integration', val: 12 }
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase mb-2">
                                                <span>{item.label}</span>
                                                <span>{item.val}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-cyan-500 transition-all duration-1000" 
                                                    style={{ width: isGenerating ? `${item.val}%` : '0%' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12 pt-8 border-t border-gray-800">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                                            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Quantum Vault v4.2</div>
                                            <div className="text-xs text-gray-500">Homomorphic Encryption Active</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FOOTER STATS */}
                <div className="h-12 bg-gray-900 border-t border-gray-800 flex items-center px-8 gap-12 overflow-hidden">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-[10px] font-bold text-gray-600 uppercase">Market Cap</span>
                        <span className="text-xs font-mono text-gray-400">$4.2T</span>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-[10px] font-bold text-gray-600 uppercase">Active Nodes</span>
                        <span className="text-xs font-mono text-gray-400">14,209</span>
                    </div>
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="text-[10px] font-bold text-gray-600 uppercase">Security Protocol</span>
                        <span className="text-xs font-mono text-cyan-500">AES-GCM-256</span>
                    </div>
                    <div className="flex-1" />
                    <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                        © 2024 QUANTUM FINANCIAL INSTITUTIONAL SERVICES
                    </div>
                </div>
            </div>

            {/* MODALS & OVERLAYS */}
            {showAuditLog && <AuditPanel />}
            {showStripeModal && <StripeModal />}

            <style>{`
                @keyframes scale-up {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-scale-up { animation: scale-up 0.2s ease-out forwards; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default ApiKeyPrompt;