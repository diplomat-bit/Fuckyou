import React, { useState, useContext, useEffect, useRef } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { 
    Activity, ShieldCheck, UserCheck, Eye, Search, 
    ArrowRight, Lock, Database, Globe, Cpu, MessageSquare, 
    Zap, Terminal, X, Send, Loader2, Server, Radio, AlertCircle,
    CheckCircle2, FileText, BarChart3, Play, Pause, RefreshCw,
    CreditCard, Building2, Key
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ChatMessage {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    timestamp: Date;
}

interface AuditEntry {
    id: string;
    action: string;
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
    timestamp: string;
    details: string;
}

const PlaidMainDashboard: React.FC = () => {
    const { 
        plaidProducts, deductCredits, showNotification, 
        geminiApiKey, userProfile, broadcastEvent 
    } = useContext(DataContext)!;

    // State
    const [activeTab, setActiveTab] = useState<'overview' | 'network' | 'verification'>('overview');
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: 'init', role: 'ai', content: 'Greetings, Architect. I am the Quantum Financial AI Core. Ready to analyze banking data streams.', timestamp: new Date() }
    ]);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [verificationStep, setVerificationStep] = useState(0);
    
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // Helper to add audit log
    const logAction = (action: string, status: 'SUCCESS' | 'PENDING' | 'FAILED', details: string) => {
        const entry: AuditEntry = {
            id: Math.random().toString(36).substr(2, 9),
            action,
            status,
            timestamp: new Date().toLocaleTimeString(),
            details
        };
        setAuditLog(prev => [entry, ...prev]);
        broadcastEvent('AUDIT_LOG', entry);
    };

    // AI Interaction Logic
    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: chatInput,
            timestamp: new Date()
        };

        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAiThinking(true);

        try {
            // Using the requested GoogleGenAI implementation
            // Note: In a real app, we'd use the key from context or env. 
            // The instruction said "use the secrets manager varaibless from GEMINI_API_KEY"
            const apiKey = geminiApiKey || process.env.GEMINI_API_KEY || '';
            
            if (!apiKey) {
                throw new Error("API Key missing. Please configure GEMINI_API_KEY.");
            }

            const ai = new GoogleGenAI({ apiKey });
            
            // Contextualizing the AI
            const systemContext = `
                You are the AI engine for Quantum Financial (formerly a global bank demo). 
                You are helpful, professional, and elite.
                Current User: ${userProfile.name}.
                Role: ${userProfile.title}.
                Context: Business Banking Demo.
                Do NOT mention "Citibank". Use "Quantum Financial".
            `;

            const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); 

            const result = await model.generateContent({
                contents: [
                    { role: 'user', parts: [{ text: systemContext + "\n\nUser Query: " + userMsg.content }] }
                ]
            });

            const responseText = result.response.text();

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: responseText,
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, aiMsg]);
            logAction('AI_INTERACTION', 'SUCCESS', 'Generated response for user query');

        } catch (error: any) {
            console.error("AI Error:", error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'system',
                content: `Error: ${error.message || "Neural link severed."}`,
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, errorMsg]);
            logAction('AI_INTERACTION', 'FAILED', error.message);
        } finally {
            setIsAiThinking(false);
        }
    };

    // Verification Simulation
    const runVerification = () => {
        setShowVerificationModal(true);
        setVerificationStep(0);
        logAction('IDV_INITIATED', 'PENDING', 'User initiated Identity Verification');
        
        // Simulate steps
        setTimeout(() => setVerificationStep(1), 1500);
        setTimeout(() => setVerificationStep(2), 3000);
        setTimeout(() => {
            setVerificationStep(3);
            logAction('IDV_COMPLETE', 'SUCCESS', 'Identity Verified: High Confidence');
            showNotification('Identity Verification Complete', 'success');
        }, 4500);
    };

    return (
        <div className="h-full flex flex-col space-y-6 p-2 animate-in fade-in duration-500 overflow-y-auto custom-scrollbar">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-200 uppercase italic tracking-tighter">
                        Quantum Financial <span className="text-white not-italic text-2xl font-light">| Nexus</span>
                    </h1>
                    <p className="text-blue-400/60 text-xs font-mono mt-2 tracking-[0.3em] uppercase">
                        Global Banking Demo Environment // v4.2.0-RC
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-gray-900/50 border border-gray-700 px-4 py-2 rounded-lg flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">System Optimal</span>
                    </div>
                    <button 
                        onClick={() => logAction('SYSTEM_CHECK', 'SUCCESS', 'Manual system diagnostic run')}
                        className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg transition-colors"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
                
                {/* Left Column: Controls & Status */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    
                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card variant="interactive" className="group" onClick={() => setActiveTab('overview')}>
                            <div className="flex flex-col items-center text-center space-y-3 p-2">
                                <div className="p-3 bg-blue-500/10 rounded-full text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                                    <Activity size={24} />
                                </div>
                                <h3 className="font-bold text-gray-200">Live Monitoring</h3>
                                <p className="text-xs text-gray-500">Real-time transaction flow analysis</p>
                            </div>
                        </Card>
                        <Card variant="interactive" className="group" onClick={runVerification}>
                            <div className="flex flex-col items-center text-center space-y-3 p-2">
                                <div className="p-3 bg-purple-500/10 rounded-full text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                    <UserCheck size={24} />
                                </div>
                                <h3 className="font-bold text-gray-200">Identity Verify</h3>
                                <p className="text-xs text-gray-500">KYC/AML Compliance Check</p>
                            </div>
                        </Card>
                        <Card variant="interactive" className="group" onClick={() => setActiveTab('network')}>
                            <div className="flex flex-col items-center text-center space-y-3 p-2">
                                <div className="p-3 bg-amber-500/10 rounded-full text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                    <Globe size={24} />
                                </div>
                                <h3 className="font-bold text-gray-200">Global Mesh</h3>
                                <p className="text-xs text-gray-500">Cross-border payment rails</p>
                            </div>
                        </Card>
                    </div>

                    {/* Main Display Area */}
                    <Card className="flex-1 min-h-[400px] relative overflow-hidden border-blue-500/20">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                        
                        {activeTab === 'overview' && (
                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        <Database className="text-blue-400" /> Data Ingress Streams
                                    </h3>
                                    <span className="text-xs font-mono text-gray-500">UPDATED: {new Date().toLocaleTimeString()}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {plaidProducts.map((product, idx) => (
                                        <div key={product} className="bg-gray-900/80 border border-gray-700 p-4 rounded-xl flex items-center justify-between hover:border-blue-500/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-12 rounded-full ${['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-amber-500'][idx % 4]}`}></div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-200 uppercase">{product}</div>
                                                    <div className="text-[10px] text-gray-500 font-mono">LATENCY: {10 + Math.floor(Math.random() * 40)}ms</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-bold text-green-400">ACTIVE</div>
                                                <div className="text-[10px] text-gray-600">99.99% UPTIME</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 p-6 bg-blue-900/10 border border-blue-500/20 rounded-xl">
                                    <h4 className="text-sm font-bold text-blue-300 mb-2 uppercase tracking-wider">System Notification</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Quantum Financial's demo environment is currently operating at peak efficiency. 
                                        All payment rails (ACH, Wire, RTP) are active. Fraud monitoring heuristics are engaged.
                                        This is a simulated environment for demonstration purposes.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'network' && (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 relative z-10">
                                <div className="w-64 h-64 relative">
                                    <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
                                    <div className="absolute inset-4 border-4 border-purple-500/20 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Globe size={64} className="text-blue-400" />
                                    </div>
                                    {/* Orbiting nodes */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 p-2 rounded-lg text-[10px] text-gray-300">SWIFT</div>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-gray-900 border border-gray-700 p-2 rounded-lg text-[10px] text-gray-300">ACH</div>
                                    <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 p-2 rounded-lg text-[10px] text-gray-300">RTP</div>
                                    <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-gray-700 p-2 rounded-lg text-[10px] text-gray-300">FEDWIRE</div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Global Liquidity Map</h3>
                                    <p className="text-sm text-gray-500 mt-2">Visualizing real-time capital flows across 42 jurisdictions.</p>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Audit Log Section */}
                    <Card title="Secure Audit Storage" className="max-h-60 overflow-hidden flex flex-col">
                        <div className="overflow-y-auto custom-scrollbar flex-1 space-y-2 pr-2">
                            {auditLog.length === 0 && (
                                <div className="text-center text-gray-600 text-sm py-4 italic">No actions recorded in this session.</div>
                            )}
                            {auditLog.map(entry => (
                                <div key={entry.id} className="flex items-start gap-3 p-2 border-b border-gray-800/50 last:border-0 text-xs font-mono">
                                    <div className={`mt-1 w-2 h-2 rounded-full ${
                                        entry.status === 'SUCCESS' ? 'bg-green-500' : 
                                        entry.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
                                    }`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <span className="font-bold text-gray-300">{entry.action}</span>
                                            <span className="text-gray-600">{entry.timestamp}</span>
                                        </div>
                                        <div className="text-gray-500 mt-0.5">{entry.details}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Right Column: AI Chat */}
                <div className="lg:col-span-4 flex flex-col h-full min-h-[600px]">
                    <Card className="flex-1 flex flex-col h-full border-blue-500/30 shadow-blue-900/20" padding="none">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                                    <Cpu size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Quantum AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                        <span className="text-[10px] text-blue-300 font-mono uppercase">Online // Gemini-3</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setChatHistory([])}
                                className="text-gray-500 hover:text-white transition-colors"
                                title="Clear Chat"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-950/30 custom-scrollbar">
                            {chatHistory.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : msg.role === 'system'
                                            ? 'bg-red-900/20 text-red-300 border border-red-500/20'
                                            : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                    }`}>
                                        {msg.content}
                                        <div className={`text-[10px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isAiThinking && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-800 rounded-2xl rounded-tl-none p-4 border border-gray-700 flex items-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-blue-400" />
                                        <span className="text-xs text-gray-400 animate-pulse">Processing neural request...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Ask about your finances..."
                                    className="w-full bg-gray-950 border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                    disabled={isAiThinking}
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={!chatInput.trim() || isAiThinking}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                            <div className="mt-2 flex justify-center gap-2">
                                <span className="text-[10px] text-gray-600 font-mono">SECURE ENCLAVE ACTIVE</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Verification Modal (Pop Up Form) */}
            {showVerificationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient"></div>
                        
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <ShieldCheck className="text-blue-400" /> Identity Verification
                            </h3>
                            <button onClick={() => setShowVerificationModal(false)} className="text-gray-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Step 1: Scanning */}
                            <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                                verificationStep >= 0 ? 'bg-blue-900/20 border-blue-500/30' : 'bg-gray-800/50 border-gray-700'
                            }`}>
                                <div className="relative">
                                    <Search size={24} className={verificationStep === 0 ? 'text-blue-400 animate-pulse' : 'text-gray-500'} />
                                    {verificationStep > 0 && <CheckCircle2 size={16} className="absolute -bottom-1 -right-1 text-green-400 bg-gray-900 rounded-full" />}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-200">Database Scan</div>
                                    <div className="text-xs text-gray-500">Cross-referencing global watchlists</div>
                                </div>
                            </div>

                            {/* Step 2: Biometrics */}
                            <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                                verificationStep >= 1 ? 'bg-purple-900/20 border-purple-500/30' : 'bg-gray-800/50 border-gray-700'
                            }`}>
                                <div className="relative">
                                    <UserCheck size={24} className={verificationStep === 1 ? 'text-purple-400 animate-pulse' : 'text-gray-500'} />
                                    {verificationStep > 1 && <CheckCircle2 size={16} className="absolute -bottom-1 -right-1 text-green-400 bg-gray-900 rounded-full" />}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-200">Biometric Analysis</div>
                                    <div className="text-xs text-gray-500">Verifying liveness and document authenticity</div>
                                </div>
                            </div>

                            {/* Step 3: Risk Assessment */}
                            <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                                verificationStep >= 2 ? 'bg-amber-900/20 border-amber-500/30' : 'bg-gray-800/50 border-gray-700'
                            }`}>
                                <div className="relative">
                                    <Activity size={24} className={verificationStep === 2 ? 'text-amber-400 animate-pulse' : 'text-gray-500'} />
                                    {verificationStep > 2 && <CheckCircle2 size={16} className="absolute -bottom-1 -right-1 text-green-400 bg-gray-900 rounded-full" />}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-200">Risk Scoring</div>
                                    <div className="text-xs text-gray-500">Calculating fraud probability vectors</div>
                                </div>
                            </div>

                            {verificationStep === 3 && (
                                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center animate-in zoom-in duration-300">
                                    <div className="text-green-400 font-bold text-lg mb-1">Verification Successful</div>
                                    <p className="text-xs text-gray-400">Entity cleared for Level 3 access.</p>
                                    <button 
                                        onClick={() => setShowVerificationModal(false)}
                                        className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-colors"
                                    >
                                        Close & Continue
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaidMainDashboard;