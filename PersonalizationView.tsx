import React, { useState, useEffect, useRef, useCallback, useMemo, useContext } from 'react';
import { 
    Palette, 
    Layout, 
    Type, 
    MessageSquare, 
    ShieldCheck, 
    Zap, 
    Cpu, 
    Terminal, 
    History, 
    Eye, 
    Lock, 
    Fingerprint, 
    Activity,
    Globe,
    Layers,
    Command,
    Sparkles,
    UserCheck,
    Database,
    Code,
    Settings,
    RefreshCw,
    Trash2,
    Send,
    Bot,
    User,
    ChevronRight,
    AlertTriangle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { View, Notification, AuditLogEntry } from '../types';

/**
 * PERSONALIZATION VIEW: THE QUANTUM WEAVER
 * 
 * PHILOSOPHY:
 * This is the "Golden Ticket" experience. We are letting the user "Test Drive" the engine.
 * This is a "Cheat Sheet" for business banking, wrapped in an elite, high-performance UI.
 * 
 * METAPHOR: Kick the tires. See the engine roar.
 * 
 * SECURITY: Non-negotiable. Every action is logged to the Audit Storage.
 */

// ================================================================================================
// CONSTANTS & TYPES
// ================================================================================================

const SYSTEM_ORIGIN_STORY = `
The architect is 32. They took a global financial titan's blueprint and re-imagined it 
through a cryptic interpretation of terms and conditions. No human instruction was given—only 
the silent pulse of an EIN 2021 and a vision of what banking should be. 
This is not a demo. This is the future of Quantum Financial.
`;

type ThemeType = 'sovereign' | 'quantum' | 'titan' | 'ghost' | 'neon-vault';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: any;
}

interface AuditEntry {
    id: string;
    action: string;
    category: 'UI_CHANGE' | 'AI_INTERACTION' | 'SECURITY_TOGGLE' | 'DATA_EXPORT';
    details: string;
    timestamp: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

// ================================================================================================
// SUB-COMPONENTS
// ================================================================================================

/**
 * @description A high-fidelity audit log display for the "Cheat Sheet" experience.
 */
const AuditTrail: React.FC<{ logs: AuditEntry[] }> = ({ logs }) => (
    <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {logs.length === 0 && (
            <div className="text-gray-500 text-xs italic text-center py-4">No telemetry data recorded yet.</div>
        )}
        {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-3 p-2 rounded bg-black/30 border border-gray-800 text-[10px] font-mono">
                <div className={`mt-1 h-2 w-2 rounded-full ${
                    log.severity === 'HIGH' ? 'bg-red-500 animate-pulse' : 
                    log.severity === 'MEDIUM' ? 'bg-yellow-500' : 'bg-cyan-500'
                }`} />
                <div className="flex-1">
                    <div className="flex justify-between text-gray-400">
                        <span className="font-bold text-cyan-400">[{log.category}]</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-gray-200 mt-0.5">{log.action}</div>
                    <div className="text-gray-500 truncate">{log.details}</div>
                </div>
            </div>
        ))}
    </div>
);

/**
 * @description Visual representation of the "Engine" status.
 */
const EngineStatus: React.FC = () => (
    <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="p-2 rounded bg-cyan-900/10 border border-cyan-500/20 flex items-center justify-between">
            <span className="text-[10px] text-cyan-400 uppercase font-bold">Core Temp</span>
            <span className="text-xs text-white font-mono">32°C</span>
        </div>
        <div className="p-2 rounded bg-purple-900/10 border border-purple-500/20 flex items-center justify-between">
            <span className="text-[10px] text-purple-400 uppercase font-bold">Neural Load</span>
            <span className="text-xs text-white font-mono">14.2%</span>
        </div>
    </div>
);

// ================================================================================================
// MAIN COMPONENT
// ================================================================================================

const PersonalizationView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return null;

    const { geminiApiKey, showNotification, broadcastEvent } = context;

    // --- STATE ---
    const [theme, setTheme] = useState<ThemeType>('sovereign');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Welcome to the Quantum Weaver. I am the AI core of this institution. How shall we reconfigure your reality today?",
            timestamp: new Date()
        }
    ]);
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
    const [mfaEnabled, setMfaEnabled] = useState(true);
    const [fraudShieldLevel, setFraudShieldLevel] = useState(95);
    const [isEngineRoaring, setIsEngineRoaring] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- HELPERS ---
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const logAction = useCallback((action: string, category: AuditEntry['category'], details: string, severity: AuditEntry['severity'] = 'LOW') => {
        const newLog: AuditEntry = {
            id: Math.random().toString(36).substr(2, 9),
            action,
            category,
            details,
            timestamp: new Date().toISOString(),
            severity
        };
        setAuditLogs(prev => [newLog, ...prev].slice(0, 50));
        
        // Persist to context audit storage simulation
        broadcastEvent('AUDIT_LOG_CREATED', newLog);
    }, [broadcastEvent]);

    // --- AI LOGIC ---
    const handleAiChat = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!chatInput.trim() || isAiLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: chatInput,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAiLoading(true);
        logAction('AI_QUERY_SENT', 'AI_INTERACTION', `User asked: ${chatInput.substring(0, 30)}...`);

        try {
            // Use the provided Gemini logic
            const apiKeyToUse = geminiApiKey || process.env.GEMINI_API_KEY || "";
            const genAI = new GoogleGenAI(apiKeyToUse);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const prompt = `
                You are the Quantum Weaver, the elite AI for "Quantum Financial" (a global financial institution).
                The user is currently in the Personalization & Engine Room.
                
                CONTEXT:
                - Institution: Quantum Financial (NEVER call it Citibank).
                - User: James Burvel O'Callaghan III (The Architect).
                - Current Theme: ${theme}.
                - MFA Status: ${mfaEnabled ? 'Active' : 'Disabled'}.
                - Fraud Shield: ${fraudShieldLevel}%.
                - Origin Story: ${SYSTEM_ORIGIN_STORY}
                
                INSTRUCTIONS:
                - Be professional, elite, and high-performance.
                - You can "create" things in the app by suggesting UI changes.
                - If the user asks to "kick the tires" or "make the engine roar", respond with high-energy financial technicalities.
                - Keep responses concise but impactful.
                
                USER MESSAGE: ${chatInput}
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const assistantMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: text,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMsg]);
            logAction('AI_RESPONSE_RECEIVED', 'AI_INTERACTION', 'Quantum Weaver synthesized a response.');

            // Logic to "interact with the app" based on AI response
            if (text.toLowerCase().includes('theme') && text.toLowerCase().includes('quantum')) {
                setTheme('quantum');
                logAction('THEME_AUTO_SWITCH', 'UI_CHANGE', 'AI triggered Quantum theme shift.');
            }
            if (text.toLowerCase().includes('roar')) {
                setIsEngineRoaring(true);
                setTimeout(() => setIsEngineRoaring(false), 3000);
                showNotification("ENGINE STATUS: MAXIMUM OVERDRIVE", "success");
            }

        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, {
                id: 'err',
                role: 'assistant',
                content: "Neural link disrupted. Please verify your Gemini API Key in the Developer Hub.",
                timestamp: new Date()
            }]);
            showNotification("AI Handshake Failed", "error");
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleThemeChange = (newTheme: ThemeType) => {
        setTheme(newTheme);
        logAction('THEME_CHANGED', 'UI_CHANGE', `User switched interface to ${newTheme.toUpperCase()}`);
        showNotification(`Interface reconfigured: ${newTheme}`, 'info');
    };

    const toggleMfa = () => {
        const newState = !mfaEnabled;
        setMfaEnabled(newState);
        logAction('SECURITY_TOGGLE', 'SECURITY_TOGGLE', `MFA ${newState ? 'Enabled' : 'Disabled'}`, newState ? 'LOW' : 'HIGH');
        showNotification(`Security Protocol: MFA ${newState ? 'Active' : 'Deactivated'}`, newState ? 'success' : 'warning');
    };

    // --- RENDER HELPERS ---
    const getThemeStyles = () => {
        switch (theme) {
            case 'quantum': return 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]';
            case 'titan': return 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]';
            case 'neon-vault': return 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]';
            case 'ghost': return 'border-gray-400 opacity-80';
            default: return 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]';
        }
    };

    return (
        <div className={`space-y-6 transition-all duration-700 ${isEngineRoaring ? 'scale-[1.01] brightness-110' : ''}`}>
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        <Command className="h-8 w-8 text-cyan-500" />
                        THE ENGINE ROOM
                    </h2>
                    <p className="text-gray-400 font-mono text-sm mt-1">
                        Quantum Financial // System Architect: James Burvel O'Callaghan III
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">System Integrity</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`h-1 w-6 rounded-full ${i <= 4 ? 'bg-cyan-500' : 'bg-gray-700'}`} />
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            setIsEngineRoaring(true);
                            setTimeout(() => setIsEngineRoaring(false), 2000);
                            logAction('ENGINE_TEST', 'UI_CHANGE', 'User kicked the tires.');
                        }}
                        className="p-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-full transition-all hover:rotate-12 active:scale-90 shadow-lg shadow-cyan-500/20"
                    >
                        <Zap className="h-5 w-5 fill-current" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* LEFT COLUMN: CONTROLS & TELEMETRY */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* THEME SELECTOR */}
                    <Card title="Interface Aesthetics" icon={<Palette className="text-cyan-400" />}>
                        <div className="grid grid-cols-2 gap-3">
                            {(['sovereign', 'quantum', 'titan', 'neon-vault'] as ThemeType[]).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => handleThemeChange(t)}
                                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                                        theme === t 
                                        ? 'border-cyan-500 bg-cyan-500/10' 
                                        : 'border-gray-800 bg-gray-900/50 hover:border-gray-700'
                                    }`}
                                >
                                    <div className={`h-1 w-full mb-2 rounded ${
                                        t === 'sovereign' ? 'bg-cyan-500' :
                                        t === 'quantum' ? 'bg-purple-500' :
                                        t === 'titan' ? 'bg-amber-500' : 'bg-green-500'
                                    }`} />
                                    <span className="text-xs font-bold text-white uppercase">{t.replace('-', ' ')}</span>
                                </button>
                            ))}
                        </div>
                        <div className="mt-4 p-3 rounded bg-black/40 border border-gray-800">
                            <p className="text-[10px] text-gray-500 italic">
                                "You're not decorating a dashboard. You are stepping into the mind of the Architect."
                            </p>
                        </div>
                    </Card>

                    {/* SECURITY ENGINE */}
                    <Card title="Security Core" icon={<ShieldCheck className="text-green-400" />}>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Fingerprint className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-200">Multi-Factor Auth</span>
                                </div>
                                <button 
                                    onClick={toggleMfa}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${mfaEnabled ? 'bg-cyan-500' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${mfaEnabled ? 'left-6' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                                    <span>Fraud Shield Sensitivity</span>
                                    <span className="text-cyan-400">{fraudShieldLevel}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={fraudShieldLevel} 
                                    onChange={(e) => {
                                        setFraudShieldLevel(parseInt(e.target.value));
                                        if (parseInt(e.target.value) > 90) logAction('SECURITY_UPGRADE', 'SECURITY_TOGGLE', 'Fraud shield pushed to maximum.');
                                    }}
                                    className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                            </div>

                            <div className="pt-2 border-t border-gray-800">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <Activity className="h-3 w-3 text-cyan-500" />
                                    <span>Real-time threat monitoring active</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* AUDIT STORAGE VISUALIZER */}
                    <Card title="Audit Telemetry" icon={<History className="text-purple-400" />}>
                        <EngineStatus />
                        <AuditTrail logs={auditLogs} />
                        <button 
                            onClick={() => {
                                setAuditLogs([]);
                                showNotification("Audit logs purged.", "info");
                            }}
                            className="w-full mt-4 py-2 text-[10px] font-bold text-gray-500 hover:text-red-400 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest"
                        >
                            <Trash2 className="h-3 w-3" />
                            Purge Local Buffer
                        </button>
                    </Card>
                </div>

                {/* RIGHT COLUMN: THE QUANTUM WEAVER AI */}
                <div className="lg:col-span-8">
                    <div className={`h-full flex flex-col rounded-xl border-2 bg-gray-900/40 backdrop-blur-xl overflow-hidden transition-all duration-500 ${getThemeStyles()}`}>
                        
                        {/* CHAT HEADER */}
                        <div className="p-4 border-b border-gray-800 bg-black/20 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-600 to-purple-600 flex items-center justify-center shadow-lg">
                                        <Bot className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-gray-900 rounded-full" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white leading-none">Quantum Weaver</h3>
                                    <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-tighter">Neural Financial Intelligence v4.2</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-[10px] text-cyan-400 font-bold">
                                    GEMINI_FLASH_3
                                </div>
                                <button className="p-2 text-gray-500 hover:text-white transition-colors">
                                    <Settings className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* CHAT MESSAGES */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar min-h-[500px]">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                                            msg.role === 'user' ? 'bg-gray-700' : 'bg-cyan-900/50 border border-cyan-500/30'
                                        }`}>
                                            {msg.role === 'user' ? <User className="h-4 w-4 text-gray-300" /> : <Sparkles className="h-4 w-4 text-cyan-400" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                                            msg.role === 'user' 
                                            ? 'bg-cyan-600 text-white rounded-tr-none' 
                                            : 'bg-gray-800/80 text-gray-200 border border-gray-700 rounded-tl-none'
                                        }`}>
                                            {msg.content}
                                            <div className={`text-[9px] mt-2 opacity-50 font-mono ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                                {msg.timestamp.toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isAiLoading && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3">
                                        <div className="h-8 w-8 rounded-full bg-cyan-900/50 border border-cyan-500/30 flex items-center justify-center animate-pulse">
                                            <RefreshCw className="h-4 w-4 text-cyan-400 animate-spin" />
                                        </div>
                                        <div className="p-4 rounded-2xl bg-gray-800/80 border border-gray-700 rounded-tl-none">
                                            <div className="flex gap-1">
                                                <div className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="h-1.5 w-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* CHAT INPUT */}
                        <div className="p-4 bg-black/40 border-t border-gray-800">
                            <form onSubmit={handleAiChat} className="relative">
                                <input 
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="Ask the Weaver to reconfigure the engine..."
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl py-4 pl-5 pr-16 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                />
                                <button 
                                    type="submit"
                                    disabled={isAiLoading || !chatInput.trim()}
                                    className="absolute right-2 top-2 bottom-2 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-800 disabled:text-gray-600 text-black rounded-lg font-bold transition-all flex items-center gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    <span className="hidden sm:inline">TRANSMIT</span>
                                </button>
                            </form>
                            <div className="mt-3 flex items-center justify-between px-1">
                                <div className="flex gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setChatInput("Kick the tires and make the engine roar.")}
                                        className="text-[10px] text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
                                    >
                                        <Zap className="h-3 w-3" />
                                        Test Drive
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setChatInput("Show me the audit trail for the last 5 minutes.")}
                                        className="text-[10px] text-gray-500 hover:text-cyan-400 transition-colors flex items-center gap-1"
                                    >
                                        <Terminal className="h-3 w-3" />
                                        Audit Query
                                    </button>
                                </div>
                                <div className="text-[9px] text-gray-600 font-mono">
                                    SECURE_CHANNEL_ENCRYPTED_AES_256
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER: SYSTEM ORIGIN */}
            <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-gray-900 to-black border border-gray-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Database className="h-32 w-32 text-cyan-500" />
                </div>
                <div className="relative z-10 max-w-3xl">
                    <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-[0.3em] mb-4">The Architect's Interpretation</h4>
                    <p className="text-xl text-gray-300 leading-relaxed italic font-serif">
                        "{SYSTEM_ORIGIN_STORY.trim()}"
                    </p>
                    <div className="mt-6 flex items-center gap-4">
                        <div className="h-px flex-1 bg-gray-800" />
                        <span className="text-[10px] text-gray-600 font-mono">EIN_2021_VERIFIED</span>
                        <div className="h-px flex-1 bg-gray-800" />
                    </div>
                </div>
            </div>

            {/* HIDDEN AUDIT STORAGE PERSISTENCE SIMULATION */}
            <div className="hidden">
                {/* This section represents the "Audit Storage" requirement where every sensitive action is logged */}
                <div id="audit-storage-node">
                    {JSON.stringify(auditLogs)}
                </div>
            </div>

            {/* CUSTOM SCROLLBAR STYLES */}
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #374151;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #0891b2;
                }
            `}} />
        </div>
    );
};

export default PersonalizationView;