import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { DataContext } from '../context/DataContext';
import { View } from '../types';
import Card from './Card';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

// ================================================================================================
// TYPE DEFINITIONS & AUDIT LOGGING
// ================================================================================================

export type AuditEntry = {
    timestamp: Date;
    action: string;
    actor: 'user' | 'ai' | 'system';
    details: string;
    securityLevel: 'standard' | 'elevated' | 'critical';
};

export type Message = {
    id: string;
    role: 'user' | 'model' | 'system';
    parts: { text: string }[];
    timestamp: Date;
    chartData?: any;
    actionSuggestions?: ActionSuggestion[];
};

export type ActionSuggestion = {
    id: string;
    text: string;
    actionType: 'payment' | 'integration' | 'analytics' | 'security';
};

// ================================================================================================
// CORE COMPONENT
// ================================================================================================

const AIAdvisorView: React.FC<{ previousView: View | null }> = ({ previousView }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isMfaActive, setIsMfaActive] = useState(false);
    
    const chatRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const logAction = useCallback((action: string, actor: 'user' | 'ai' | 'system', details: string, level: AuditEntry['securityLevel'] = 'standard') => {
        const entry: AuditEntry = { timestamp: new Date(), action, actor, details, securityLevel: level };
        setAuditTrail(prev => [...prev, entry]);
    }, []);

    useEffect(() => {
        const apiKey = process.env.API_KEY || '';
        if (apiKey) {
            const ai = new GoogleGenAI({ apiKey });
            chatRef.current = ai.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                systemInstruction: "You are the Quantum Financial AI Advisor. You provide elite, secure, and high-performance business banking insights. You can simulate Wire transfers, ACH collections, and ERP integrations. Always maintain a professional, secure tone. Mention that every action is logged in the secure audit vault."
            }).startChat({
                history: [],
                generationConfig: { maxOutputTokens: 1200 },
            });
            logAction("Session Initialized", "system", "Quantum AI Core connected to secure terminal.", "standard");
        }
    }, [logAction]);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

    const handleSendMessage = async (text: string, isAutoAction = false) => {
        if (!text.trim()) return;
        
        setIsLoading(true);
        const userMsg: Message = { id: Date.now().toString(), role: 'user', parts: [{ text }], timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        
        logAction("User Message", "user", text, isAutoAction ? "elevated" : "standard");

        try {
            let responseText = "";
            let chartData = null;
            let actionSuggestions: ActionSuggestion[] = [];

            if (text.toLowerCase().includes("wire")) {
                responseText = "I have prepared the Wire Transfer protocol. For security, Quantum Financial requires a Multi-Factor Authentication handshake before proceeding with high-value movements.";
                setIsMfaActive(true);
                logAction("Wire Protocol Triggered", "ai", "Awaiting MFA verification for outbound wire.", "critical");
            } else if (text.toLowerCase().includes("health") || text.toLowerCase().includes("summarize")) {
                responseText = "Analyzing your global liquidity position. Your current cash flow is optimized, though I detect a 4% variance in your APAC accounts.";
                chartData = {
                    type: 'line',
                    data: {
                        labels: ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00'],
                        datasets: [{
                            label: 'Liquidity (USD Millions)',
                            data: [42, 45, 44, 48, 52, 51],
                            borderColor: '#06b6d4',
                            backgroundColor: 'rgba(6, 182, 212, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    }
                };
                actionSuggestions = [
                    { id: '1', text: 'Sync with NetSuite', actionType: 'integration' },
                    { id: '2', text: 'Run Fraud Scan', actionType: 'security' }
                ];
            } else if (chatRef.current) {
                const result = await chatRef.current.sendMessage(text);
                responseText = await result.response.text();
            } else {
                responseText = "Quantum Core is currently offline.";
            }

            setMessages(prev => [...prev, { 
                id: Date.now().toString() + "_resp", 
                role: 'model', 
                parts: [{ text: responseText }], 
                timestamp: new Date(),
                chartData,
                actionSuggestions
            }]);
        } catch (e) {
            setMessages(prev => [...prev, { id: 'err', role: 'model', parts: [{ text: "Quantum Core connection interrupted." }], timestamp: new Date() }]);
        } finally { 
            setIsLoading(false); 
        }
    };

    const verifyMfa = () => {
        setIsMfaActive(false);
        logAction("MFA Verified", "system", "Biometric/Token handshake successful.", "critical");
        handleSendMessage("MFA Verified. Proceed with the secure wire transfer authorization.", true);
    };

    const examplePrompts = {
        [View.Dashboard]: ["Summarize my financial health.", "Run a fraud analysis on today's batch.", "Project my EOD liquidity."],
        [View.Transactions]: ["Find wires over $50,000.", "Sync recent ACH with ERP.", "Identify duplicate vendor payments."],
        DEFAULT: ["Initiate a domestic wire.", "Check ERP integration status.", "Show my audit trail summary."]
    };

    const prompts = (previousView && examplePrompts[previousView]) ? examplePrompts[previousView] : examplePrompts.DEFAULT;

    return (
        <div className="h-full flex flex-col bg-slate-950 text-slate-200 font-sans">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tighter uppercase italic">Quantum AI Advisor</h2>
                    <p className="text-cyan-500 text-xs font-mono tracking-widest">SECURE TERMINAL // AUDIT LOGGING ACTIVE</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-grow overflow-hidden">
                <Card className="lg:col-span-3 flex flex-col border-slate-800 bg-slate-900/50 backdrop-blur-xl" padding="none">
                    <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl">
                                    {prompts.map((p, i) => (
                                        <button key={i} onClick={() => handleSendMessage(p)} className="p-4 bg-slate-800/50 hover:bg-cyan-900/20 rounded-xl text-cyan-200 text-xs border border-slate-700 text-left">
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-5 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-700 text-white' : 'bg-slate-800 border border-slate-700'}`}>
                                    <p className="text-sm">{msg.parts[0].text}</p>
                                    {msg.chartData && (
                                        <div className="mt-4 p-4 bg-slate-950 rounded-xl">
                                            <Chart type={msg.chartData.type} data={msg.chartData.data} options={{ responsive: true }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isMfaActive && (
                            <button onClick={verifyMfa} className="w-full py-3 bg-amber-600 rounded-lg text-white font-bold">VERIFY BIOMETRICS</button>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="p-4 border-t border-slate-800">
                        <input 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-sm" 
                            placeholder="Enter command..." 
                        />
                    </form>
                </Card>

                <div className="hidden lg:flex flex-col gap-6">
                    <Card className="flex-grow border-slate-800 bg-slate-900/80" padding="none">
                        <div className="p-4 border-b border-slate-800"><h3 className="text-[10px] font-black text-slate-400 uppercase">Secure Audit Vault</h3></div>
                        <div className="p-4 space-y-4 overflow-y-auto">
                            {auditTrail.slice().reverse().map((entry, idx) => (
                                <div key={idx} className="border-l-2 border-slate-800 pl-3 py-1">
                                    <p className="text-[10px] text-cyan-500">{entry.action}</p>
                                    <p className="text-[9px] text-slate-400">{entry.details}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default AIAdvisorView;