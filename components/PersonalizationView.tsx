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

// --- CONSOLIDATED FROM: PersonalizationView_1.tsx ---

// components/views/personal/PersonalizationView.tsx
import React, { useContext, useState } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { IllusionType } from '../../../types';
import { GoogleGenAI } from '@google/genai';

const PersonalizationView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("PersonalizationView must be within a DataProvider.");

    const { customBackgroundUrl, setCustomBackgroundUrl, activeIllusion, setActiveIllusion } = context;

    const [imageUrl, setImageUrl] = useState('');
    const [aiPrompt, setAiPrompt] = useState('An isolated lighthouse on a stormy sea, digital painting');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    
    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: aiPrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
            });
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const generatedUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            setCustomBackgroundUrl(generatedUrl);
        } catch (err) {
            setError('Could not generate image. The model may have safety concerns with your prompt.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Personalization</h2>
            <Card title="Dynamic Visuals">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                        <h4 className="font-semibold text-white">Aurora Illusion</h4>
                        <p className="text-sm text-gray-400">A dynamic, flowing gradient inspired by the northern lights.</p>
                    </div>
                    <input type="radio" name="theme" className="radio radio-primary" checked={activeIllusion === 'aurora'} onChange={() => setActiveIllusion('aurora')} />
                </div>
                 <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg mt-2">
                    <div><h4 className="font-semibold text-white">None</h4><p className="text-sm text-gray-400">Default dark theme.</p></div>
                    <input type="radio" name="theme" className="radio radio-primary" checked={activeIllusion === 'none'} onChange={() => setActiveIllusion('none')} />
                </div>
            </Card>
            
            <Card title="AI Background Generator">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <p className="text-gray-400 mb-4">Describe the background you want, and our AI will create it for you.</p>
                        <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className="w-full h-24 bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                        <button onClick={handleGenerate} disabled={isGenerating} className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50">{isGenerating ? 'Generating...' : 'Generate & Set Background'}</button>
                        {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                    </div>
                    <div className="h-48 rounded-lg bg-gray-900/50 flex items-center justify-center">
                        {isGenerating ? <p className="text-cyan-300">Generating...</p> : <p className="text-gray-500">Preview will appear here</p>}
                    </div>
                </div>
            </Card>

            <Card title="Custom Background Image">
                <p className="text-gray-400 mb-4">Or, paste an image URL for a static background.</p>
                <div className="flex gap-2">
                    <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <button onClick={() => setCustomBackgroundUrl(imageUrl)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Set Image</button>
                </div>
            </Card>
        </div>
    );
};

export default PersonalizationView;


// --- CONSOLIDATED FROM: PersonalizationView (2).tsx ---

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';

// =================================================================================
// REFACTORING NOTE (MVP SCOPING & SECURITY):
// The original component attempted to manage 200+ server-side API keys via a frontend form.
// This is a critical security flaw. In a stable, production-ready system:
// 1. Secrets must be stored in secure vaults (AWS Secrets Manager, Vault) and injected at runtime.
// 2. The client should never handle the full set of server configuration secrets.
//
// For the MVP (Focused on Unified Financial Dashboard/Treasury Automation), we drastically
// restrict configuration exposed via the UI to the minimal required server-side secrets
// (Plaid for aggregation, Stripe for billing, OpenAI for transaction intelligence).
// All other 200+ providers have been removed/archived, as they are not MVP critical
// and should be configured via environment or secret manager, not the UI.
// =================================================================================
interface ApiKeysState {
  // === Financial Aggregation (Core MVP) ===
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;

  // === Core Payment Infrastructure ===
  STRIPE_SECRET_KEY: string;

  // === AI Intelligence ===
  OPENAI_API_KEY: string;
  
  [key: string]: string; // Index signature maintained for dynamic access utility
}


const PersonalizationView: React.FC = () => {
  // Initialize only the necessary MVP keys
  const [keys, setKeys] = useState<ApiKeysState>(() => ({
    PLAID_CLIENT_ID: '',
    PLAID_SECRET: '',
    STRIPE_SECRET_KEY: '',
    OPENAI_API_KEY: '',
  } as ApiKeysState));
  
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Removed activeTab state as categorization is no longer required with scoped keys.

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // NOTE: In a secure production system, this POST request must be authenticated,
    // authorized (Admin role required), and use HTTPS to update server secrets.
    setStatusMessage('Saving critical keys securely to backend...');
    
    // Filter out empty keys before sending, though backend validation is crucial.
    const definedKeys = Object.entries(keys).reduce((acc, [key, value]) => {
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Partial<ApiKeysState>);
    
    try {
      // Endpoint maintained for continuity, backend is expected to handle secure storage (e.g., Vault injection).
      const response = await axios.post('http://localhost:4000/api/save-keys', definedKeys);
      setStatusMessage(response.data.message);
    } catch (error) {
       if (axios.isAxiosError(error) && error.response) {
        setStatusMessage(`Error (${error.response.status}): ${error.response.data.message || 'Could not save keys.'}`);
      } else {
        setStatusMessage('Error: Could not save keys. Please check backend server.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        // Server secrets must be handled as password type
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label} (required for MVP functionality)`}
      />
    </div>
  );

  const renderMvpConfig = () => (
    <>
      <div className="form-section">
        <h2>Core Financial Aggregation (Plaid)</h2>
        <p className="section-description">Required for Multi-bank aggregation and transaction retrieval.</p>
        {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
        {renderInput('PLAID_SECRET', 'Plaid Secret Key')}
      </div>

      <div className="form-section">
        <h2>Payments and Billing (Stripe)</h2>
        <p className="section-description">Used for core subscription and payment processing.</p>
        {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key')}
      </div>

      <div className="form-section">
        <h2>AI Services (OpenAI/Gemini)</h2>
        <p className="section-description">Required for Transaction Intelligence and Smart Alert generation.</p>
        {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
      </div>
    </>
  );

  return (
    <div className="settings-container">
      <h1>MVP System Configuration Console</h1>
      <p className="subtitle">
        Configure the minimal required server-side credentials for the MVP financial platform. 
        <span className="warning-text"> These sensitive keys must be secured via production secrets management tools (e.g., AWS Secrets Manager, Vault) upon deployment.</span>
      </p>

      {/* Tabs removed as the component scope is now focused */}
      
      <form onSubmit={handleSubmit} className="settings-form">
        {renderMvpConfig()}
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default PersonalizationView;

// --- CONSOLIDATED FROM: PersonalizationView (4).tsx ---


import React, { useState, useCallback } from 'react';
import Card from './Card';
import { Palette, Layout, Type, BrainCircuit, Zap, Cpu, SlidersHorizontal, Network, BarChartBig, Clock, GitBranch } from 'lucide-react';
// Load canonical prompt at runtime (preferred)
import fs from 'fs';
import path from 'path';
const systemPrompt = fs.readFileSync(path.join(__dirname, '../prompts/idgafai_embedding.txt'), 'utf8');

interface ToggleSwitchProps {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, enabled, onToggle }) => (
    <div 
        onClick={onToggle}
        className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 cursor-pointer transition-colors"
    >
        <div>
            <h4 className="font-semibold text-white">{label}</h4>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${enabled ? 'bg-cyan-500' : 'bg-gray-600'}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${enabled ? 'translate-x-6' : ''}`} />
        </div>
    </div>
);

interface FormFieldProps {
    label: string;
    children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-bold text-gray-300 mb-2 tracking-wide">{label}</label>
        {children}
    </div>
);

const PersonalizationView: React.FC = () => {
    const [theme, setTheme] = useState('sovereign');
    const [layoutMode, setLayoutMode] = useState('dynamic');
    const [typography, setTypography] = useState({ font: 'Geist Mono', density: 'compact', kerning: 'normal', glyphStyle: 'technical' });
    const [modules, setModules] = useState({
        cognitiveSync: true,
        hftStream: true,
        predictiveEngine: false,
        chronospatialNav: true,
        psychohistory: false,
        threatDetector: true,
    });
    const [hftConfig, setHftConfig] = useState({
        dataFeed: 'AURORA_HELIX',
        latencyTarget: 2,
        riskModel: 'volatility-adaptive-v3',
        orderFlowAlgo: 'iceberg-pov',
        executionVenue: 'Dark Pool Epsilon',
        marketImpactModel: 'Propagator Model',
    });
    const [networkConfig, setNetworkConfig] = useState({
        protocol: 'QUIC',
        multipath: true,
        encryption: 'AES-256-GCM',
        pacing: 'BBR',
    });
    const [geinConfig, setGeinConfig] = useState({
        enabled: true,
        entityResolution: 'stochastic-resonance',
        causalChainDepth: 8,
        anomalyDetectionThreshold: 0.97,
        semanticWeaving: true,
        dataSonification: false,
        vectorQuantization: 'dynamic-subspace',
    });

    const handleModuleToggle = useCallback((moduleKey: keyof typeof modules) => {
        setModules(prev => ({ ...prev, [moduleKey]: !prev[moduleKey] }));
    }, []);

    const handleFormChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => 
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value, type } = e.target;
            
            let finalValue: string | number | boolean;
            if (type === 'checkbox') {
                finalValue = (e.target as HTMLInputElement).checked;
            } else if (type === 'number' || type === 'range') {
                finalValue = parseFloat(value);
            } else {
                finalValue = value;
            }
            
            setter(prev => ({
                ...prev,
                [name]: finalValue,
            }));
        };

    const handleTypographyChange = handleFormChange(setTypography);
    const handleHftConfigChange = handleFormChange(setHftConfig);
    const handleNetworkConfigChange = handleFormChange(setNetworkConfig);
    const handleGeinConfigChange = handleFormChange(setGeinConfig);

    return (
        <div className="space-y-8 pb-12">
            <h2 className="text-3xl font-bold text-white tracking-wider">Personalization</h2>
            <p className="text-gray-400 max-w-3xl border-l-4 border-cyan-500 pl-4 py-2 bg-gray-800/50 rounded-r">
               {systemPrompt}
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <Card title="Aesthetic Resonance" icon={<Palette className="w-5 h-5 text-cyan-400" />}>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-400 mb-4">Select the foundational visual language. This choice attunes the interface to your cognitive frequency.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button onClick={() => setTheme('sovereign')} className={`p-4 rounded-lg border-2 transition-all ${theme === 'sovereign' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                    <div className="h-20 bg-gradient-to-br from-gray-900 to-black rounded mb-3 border border-gray-700 flex items-center justify-center"><span className="text-cyan-400 font-bold text-lg">SOV</span></div>
                                    <h3 className="font-bold text-white">Sovereign Dark</h3>
                                    <p className="text-xs text-gray-400 mt-1">Pure, unfiltered signal.</p>
                                </button>
                                <button onClick={() => setTheme('quantum')} className={`p-4 rounded-lg border-2 transition-all ${theme === 'quantum' ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                    <div className="h-20 bg-gradient-to-br from-indigo-900 to-purple-900 rounded mb-3 border border-indigo-700 flex items-center justify-center"><span className="text-purple-300 font-bold text-lg">QTM</span></div>
                                    <h3 className="font-bold text-white">Quantum Flux</h3>
                                    <p className="text-xs text-gray-400 mt-1">For probability waves.</p>
                                </button>
                                <button onClick={() => setTheme('biometric')} className={`p-4 rounded-lg border-2 transition-all ${theme === 'biometric' ? 'border-red-500 bg-red-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                    <div className="h-20 bg-gradient-to-br from-red-900 via-black to-red-800 rounded mb-3 border border-red-700 flex items-center justify-center"><span className="text-red-300 font-bold text-lg">BIO</span></div>
                                    <h3 className="font-bold text-white">Biometric Sync</h3>
                                    <p className="text-xs text-gray-400 mt-1">Responds to your vitals.</p>
                                </button>
                                <button onClick={() => setTheme('legacy')} className={`p-4 rounded-lg border-2 transition-all ${theme === 'legacy' ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                    <div className="h-20 bg-gray-100 rounded mb-3 border border-gray-300 flex items-center justify-center opacity-50"><span className="text-gray-800 font-bold text-lg">LGCY</span></div>
                                    <h3 className="font-bold text-white">Legacy (Disabled)</h3>
                                    <p className="text-xs text-gray-500 mt-1">The old world is dead.</p>
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card title="Information Glyphs" icon={<Type className="w-5 h-5 text-cyan-400" />}>
                        <p className="text-sm text-gray-400 mb-6">Calibrate the symbolic representation of data. Every character is a vessel of meaning.</p>
                        <div className="space-y-6">
                            <FormField label="Primary Font Face">
                                <select name="font" value={typography.font} onChange={handleTypographyChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option>Geist Mono</option>
                                    <option>Operator Mono</option>
                                    <option>Fira Code</option>
                                    <option>System Default</option>
                                </select>
                            </FormField>
                            <FormField label="Data Density">
                                <select name="density" value={typography.density} onChange={handleTypographyChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="compact">Compact</option>
                                    <option value="comfortable">Comfortable</option>
                                    <option value="sparse">Sparse</option>
                                </select>
                            </FormField>
                            <FormField label="Character Kerning">
                                <select name="kerning" value={typography.kerning} onChange={handleTypographyChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="normal">Normal</option>
                                    <option value="tight">Tight</option>
                                    <option value="wide">Wide</option>
                                </select>
                            </FormField>
                            <FormField label="Glyph Style">
                                <select name="glyphStyle" value={typography.glyphStyle} onChange={handleTypographyChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="technical">Technical</option>
                                    <option value="standard">Standard</option>
                                    <option value="calligraphic">Calligraphic</option>
                                </select>
                            </FormField>
                        </div>
                    </Card>

                    <Card title="High-Frequency Trading Subsystem" icon={<Zap className="w-5 h-5 text-red-400" />}>
                        <p className="text-sm text-gray-400 mb-6">Configure the parameters for sub-millisecond market operations. Precision is absolute.</p>
                        <div className="space-y-6">
                            <FormField label="Primary Data Feed">
                                <select name="dataFeed" value={hftConfig.dataFeed} onChange={handleHftConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500">
                                    <option>AURORA_HELIX</option>
                                    <option>NASDAQ_ITCH</option>
                                    <option>LMAX_DIGITAL</option>
                                    <option>EBS_ULTRA</option>
                                </select>
                            </FormField>
                            <FormField label="Latency Target (ms)">
                                <input type="number" name="latencyTarget" value={hftConfig.latencyTarget} onChange={handleHftConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500" />
                            </FormField>
                            <FormField label="Risk Model">
                                <select name="riskModel" value={hftConfig.riskModel} onChange={handleHftConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500">
                                    <option>volatility-adaptive-v3</option>
                                    <option>static-threshold</option>
                                    <option>neural-net-predictive</option>
                                </select>
                            </FormField>
                             <FormField label="Order Flow Algorithm">
                                <select name="orderFlowAlgo" value={hftConfig.orderFlowAlgo} onChange={handleHftConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500">
                                    <option>iceberg-pov</option>
                                    <option>twap-aggressive</option>
                                    <option>liquidity-seeking-v2</option>
                                </select>
                            </FormField>
                            <FormField label="Execution Venue">
                                <select name="executionVenue" value={hftConfig.executionVenue} onChange={handleHftConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500">
                                    <option>Dark Pool Epsilon</option>
                                    <option>IEX</option>
                                    <option>Kraken Futures</option>
                                    <option>Direct-to-Exchange</option>
                                </select>
                            </FormField>
                            <FormField label="Market Impact Model">
                                <select name="marketImpactModel" value={hftConfig.marketImpactModel} onChange={handleHftConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500">
                                    <option>Propagator Model</option>
                                    <option>Almgren-Chriss</option>
                                    <option>Power Law</option>
                                </select>
                            </FormField>
                        </div>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card title="Spatial Architecture" icon={<Layout className="w-5 h-5 text-cyan-400" />}>
                        <p className="text-sm text-gray-400 mb-4">Define the structural logic of the interface. Choose how information unfolds in your operational space.</p>
                        <div className="flex flex-col space-y-3">
                            <button onClick={() => setLayoutMode('dynamic')} className={`text-left p-4 rounded-lg border-2 transition-all ${layoutMode === 'dynamic' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                <h3 className="font-bold text-white flex items-center"><SlidersHorizontal className="w-4 h-4 mr-2"/>Dynamic Fluid</h3>
                                <p className="text-xs text-gray-400 mt-1 pl-6">Context-aware modules that adapt in real-time.</p>
                            </button>
                            <button onClick={() => setLayoutMode('grid')} className={`text-left p-4 rounded-lg border-2 transition-all ${layoutMode === 'grid' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                <h3 className="font-bold text-white flex items-center"><BarChartBig className="w-4 h-4 mr-2"/>Structured Grid</h3>
                                <p className="text-xs text-gray-400 mt-1 pl-6">A deterministic, high-density information matrix.</p>
                            </button>
                            <button onClick={() => setLayoutMode('focused')} className={`text-left p-4 rounded-lg border-2 transition-all ${layoutMode === 'focused' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                <h3 className="font-bold text-white flex items-center"><Clock className="w-4 h-4 mr-2"/>Temporal Focus</h3>
                                <p className="text-xs text-gray-400 mt-1 pl-6">Prioritizes time-series data and event horizons.</p>
                            </button>
                            <button onClick={() => setLayoutMode('orbital')} className={`text-left p-4 rounded-lg border-2 transition-all ${layoutMode === 'orbital' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                <h3 className="font-bold text-white flex items-center"><Network className="w-4 h-4 mr-2"/>Orbital Swarm</h3>
                                <p className="text-xs text-gray-400 mt-1 pl-6">Data entities in gravitational relationship orbits.</p>
                            </button>
                        </div>
                    </Card>

                    <Card title="Global Entity Interaction Network (GEIN)" icon={<GitBranch className="w-5 h-5 text-yellow-400" />}>
                        <p className="text-sm text-gray-400 mb-6">Tune the core fabric of reality perception. GEIN models the interaction of all resolved entities across all data layers.</p>
                        <div className="space-y-4">
                            <ToggleSwitch 
                                label="Enable GEIN Core" 
                                description="Activates the global entity tracking and interaction simulation." 
                                enabled={geinConfig.enabled} 
                                onToggle={() => setGeinConfig(p => ({...p, enabled: !p.enabled}))} 
                            />
                            <FormField label="Entity Resolution Heuristics">
                                <select name="entityResolution" value={geinConfig.entityResolution} onChange={handleGeinConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-yellow-500 focus:border-yellow-500">
                                    <option>stochastic-resonance</option>
                                    <option>markov-chain-monte-carlo</option>
                                    <option>bayesian-inference-grid</option>
                                    <option>quantum-annealing</option>
                                </select>
                            </FormField>
                            <FormField label={`Causal Chain Analysis Depth: ${geinConfig.causalChainDepth}`}>
                                <input 
                                    type="range" 
                                    name="causalChainDepth" 
                                    min="1" 
                                    max="16" 
                                    value={geinConfig.causalChainDepth} 
                                    onChange={handleGeinConfigChange} 
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" 
                                />
                            </FormField>
                            <FormField label={`Pre-cognitive Anomaly Detection Threshold: ${geinConfig.anomalyDetectionThreshold}`}>
                                <input 
                                    type="range" 
                                    name="anomalyDetectionThreshold" 
                                    min="0.8" 
                                    max="1.0" 
                                    step="0.01"
                                    value={geinConfig.anomalyDetectionThreshold} 
                                    onChange={handleGeinConfigChange} 
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" 
                                />
                            </FormField>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                                <label htmlFor="semanticWeaving" className="font-semibold text-white">Semantic Field Weaving</label>
                                <input id="semanticWeaving" name="semanticWeaving" type="checkbox" checked={geinConfig.semanticWeaving} onChange={handleGeinConfigChange} className="h-5 w-5 rounded bg-gray-900 border-gray-600 text-yellow-500 focus:ring-yellow-600" />
                            </div>
                        </div>
                    </Card>

                    <Card title="Cognitive Modules" icon={<BrainCircuit className="w-5 h-5 text-cyan-400" />}>
                        <p className="text-sm text-gray-400 mb-4">Activate or deactivate core cognitive subsystems. Each module is a self-contained reality-processing unit.</p>
                        <div className="space-y-4">
                            <ToggleSwitch label="Cognitive Sync" description="Aligns UI refresh rate with user's neural alpha waves." enabled={modules.cognitiveSync} onToggle={() => handleModuleToggle('cognitiveSync')} />
                            <ToggleSwitch label="HFT Data Stream" description="Enables real-time, tick-by-tick market data visualization." enabled={modules.hftStream} onToggle={() => handleModuleToggle('hftStream')} />
                            <ToggleSwitch label="Predictive Analytics Engine" description="Renders probabilistic future states based on current vectors." enabled={modules.predictiveEngine} onToggle={() => handleModuleToggle('predictiveEngine')} />
                            <ToggleSwitch label="Chronospatial Navigator" description="Unlocks the 4D data visualization and time-scrubbing module." enabled={modules.chronospatialNav} onToggle={() => handleModuleToggle('chronospatialNav')} />
                            <ToggleSwitch label="Psychohistorical Projection" description="Models large-scale social and economic trends." enabled={modules.psychohistory} onToggle={() => handleModuleToggle('psychohistory')} />
                            <ToggleSwitch label="Subconscious Threat Detector" description="Monitors for patterns below the threshold of conscious perception." enabled={modules.threatDetector} onToggle={() => handleModuleToggle('threatDetector')} />
                        </div>
                    </Card>

                    <Card title="System Core & Network Protocol" icon={<Cpu className="w-5 h-5 text-cyan-400" />}>
                        <p className="text-sm text-gray-400 mb-6">Fine-tune the underlying data transport layer and encryption protocols. For advanced users only.</p>
                        <div className="space-y-6">
                            <FormField label="Transport Protocol">
                                <select name="protocol" value={networkConfig.protocol} onChange={handleNetworkConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option>QUIC</option>
                                    <option>WebTransport</option>
                                    <option>TCP (Legacy)</option>
                                </select>
                            </FormField>
                            <FormField label="Encryption Suite">
                                <select name="encryption" value={networkConfig.encryption} onChange={handleNetworkConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option>AES-256-GCM</option>
                                    <option>ChaCha20-Poly1305</option>
                                    <option>None (Unsecured)</option>
                                </select>
                            </FormField>
                            <FormField label="Packet Pacing Algorithm">
                                <select name="pacing" value={networkConfig.pacing} onChange={handleNetworkConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option>BBR</option>
                                    <option>FQ-CoDel</option>
                                    <option>None (Aggressive)</option>
                                </select>
                            </FormField>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                                <label htmlFor="multipath" className="font-semibold text-white">Enable Multipath TCP</label>
                                <input id="multipath" name="multipath" type="checkbox" checked={networkConfig.multipath} onChange={handleNetworkConfigChange} className="h-5 w-5 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PersonalizationView;


// --- CONSOLIDATED FROM: PersonalizationView (4)_1.tsx ---


import React, { useState, useCallback } from 'react';
import Card from './Card';
import { Palette, Layout, Type, BrainCircuit, Zap, Cpu, SlidersHorizontal, Network, BarChartBig, Clock, GitBranch } from 'lucide-react';
// Load canonical prompt at runtime (preferred)
import fs from 'fs';
import path from 'path';
const systemPrompt = fs.readFileSync(path.join(__dirname, '../prompts/idgafai_embedding.txt'), 'utf8');

interface ToggleSwitchProps {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, enabled, onToggle }) => (
    <div 
        onClick={onToggle}
        className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 cursor-pointer transition-colors"
    >
        <div>
            <h4 className="font-semibold text-white">{label}</h4>
            <p className="text-sm text-gray-400">{description}</p>
        </div>
        <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${enabled ? 'bg-cyan-500' : 'bg-gray-600'}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${enabled ? 'translate-x-6' : ''}`} />
        </div>
    </div>
);

interface FormFieldProps {
    label: string;
    children: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, children }) => (
    <div>
        <label className="block text-sm font-bold text-gray-300 mb-2 tracking-wide">{label}</label>
        {children}
    </div>
);

const PersonalizationView: React.FC = () => {
    const [theme, setTheme] = useState('sovereign');
    const [layoutMode, setLayoutMode] = useState('dynamic');
    const [typography, setTypography] = useState({ font: 'Geist Mono', density: 'compact', kerning: 'normal', glyphStyle: 'technical' });
    const [modules, setModules] = useState({
        cognitiveSync: true,
        hftStream: true,
        predictiveEngine: false,
        chronospatialNav: true,
        psychohistory: false,
        threatDetector: true,
    });
    const [hftConfig, setHftConfig] = useState({
        dataFeed: 'AURORA_HELIX',
        latencyTarget: 2,
        riskModel: 'volatility-adaptive-v3',
        orderFlowAlgo: 'iceberg-pov',
        executionVenue: 'Dark Pool Epsilon',
        marketImpactModel: 'Propagator Model',
    });
    const [networkConfig, setNetworkConfig] = useState({
        protocol: 'QUIC',
        multipath: true,
        encryption: 'AES-256-GCM',
        pacing: 'BBR',
    });
    const [geinConfig, setGeinConfig] = useState({
        enabled: true,
        entityResolution: 'stochastic-resonance',
        causalChainDepth: 8,
        anomalyDetectionThreshold: 0.97,
        semanticWeaving: true,
        dataSonification: false,
        vectorQuantization: 'dynamic-subspace',
    });

    const handleModuleToggle = useCallback((moduleKey: keyof typeof modules) => {
        setModules(prev => ({ ...prev, [moduleKey]: !prev[moduleKey] }));
    }, []);

    const handleFormChange = <T,>(setter: React.Dispatch<React.SetStateAction<T>>) => 
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value, type } = e.target;
            
            let finalValue: string | number | boolean;
            if (type === 'checkbox') {
                finalValue = (e.target as HTMLInputElement).checked;
            } else if (type === 'number' || type === 'range') {
                finalValue = parseFloat(value);
            } else {
                finalValue = value;
            }
            
            setter(prev => ({
                ...prev,
                [name]: finalValue,
            }));
        };

    const handleTypographyChange = handleFormChange(setTypography);
    const handleHftConfigChange = handleFormChange(setHftConfig);
    const handleNetworkConfigChange = handleFormChange(setNetworkConfig);
    const handleGeinConfigChange = handleFormChange(setGeinConfig);

    return (
        <div className="space-y-8 pb-12">
            <h2 className="text-3xl font-bold text-white tracking-wider">Personalization</h2>
            <p className="text-gray-400 max-w-3xl border-l-4 border-cyan-500 pl-4 py-2 bg-gray-800/50 rounded-r">
               {systemPrompt}
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <Card title="Aesthetic Resonance" icon={<Palette className="w-5 h-5 text-cyan-400" />}>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-400 mb-4">Select the foundational visual language. This choice attunes the interface to your cognitive frequency.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button onClick={() => setTheme('sovereign')} className={`p-4 rounded-lg border-2 transition-all ${theme === 'sovereign' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                    <div className="h-20 bg-gradient-to-br from-gray-900 to-black rounded mb-3 border border-gray-700 flex items-center justify-center"><span className="text-cyan-400 font-bold text-lg">SOV</span></div>
                                    <h3 className="font-bold text-white">Sovereign Dark</h3>
                                    <p className="text-xs text-gray-400 mt-1">Pure, unfiltered signal.</p>
                                </button>
                                <button onClick={() => setTheme('quantum')} className={`p-4 rounded-lg border-2 transition-all ${theme === 'quantum' ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                    <div className="h-20 bg-gradient-to-br from-indigo-900 to-purple-900 rounded mb-3 border border-indigo-700 flex items-center justify-center"><span className="text-purple-300 font-bold text-lg">QTM</span></div>
                                    <h3 className="font-bold text-white">Quantum Flux</h3>
                                    <p className="text-xs text-gray-400 mt-1">For probability waves.</p>
                                </button>
                                <button onClick={() => setTheme('biometric')} className={`p-4 rounded-lg border-2 transition-all ${theme === 'biometric' ? 'border-red-500 bg-red-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                    <div className="h-20 bg-gradient-to-br from-red-900 via-black to-red-800 rounded mb-3 border border-red-700 flex items-center justify-center"><span className="text-red-300 font-bold text-lg">BIO</span></div>
                                    <h3 className="font-bold text-white">Biometric Sync</h3>
                                    <p className="text-xs text-gray-400 mt-1">Responds to your vitals.</p>
                                </button>
                                <button onClick={() => setTheme('legacy')} className={`p-4 rounded-lg border-2 transition-all ${theme === 'legacy' ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                    <div className="h-20 bg-gray-100 rounded mb-3 border border-gray-300 flex items-center justify-center opacity-50"><span className="text-gray-800 font-bold text-lg">LGCY</span></div>
                                    <h3 className="font-bold text-white">Legacy (Disabled)</h3>
                                    <p className="text-xs text-gray-500 mt-1">The old world is dead.</p>
                                </button>
                            </div>
                        </div>
                    </Card>

                    <Card title="Information Glyphs" icon={<Type className="w-5 h-5 text-cyan-400" />}>
                        <p className="text-sm text-gray-400 mb-6">Calibrate the symbolic representation of data. Every character is a vessel of meaning.</p>
                        <div className="space-y-6">
                            <FormField label="Primary Font Face">
                                <select name="font" value={typography.font} onChange={handleTypographyChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option>Geist Mono</option>
                                    <option>Operator Mono</option>
                                    <option>Fira Code</option>
                                    <option>System Default</option>
                                </select>
                            </FormField>
                            <FormField label="Data Density">
                                <select name="density" value={typography.density} onChange={handleTypographyChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="compact">Compact</option>
                                    <option value="comfortable">Comfortable</option>
                                    <option value="sparse">Sparse</option>
                                </select>
                            </FormField>
                            <FormField label="Character Kerning">
                                <select name="kerning" value={typography.kerning} onChange={handleTypographyChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="normal">Normal</option>
                                    <option value="tight">Tight</option>
                                    <option value="wide">Wide</option>
                                </select>
                            </FormField>
                            <FormField label="Glyph Style">
                                <select name="glyphStyle" value={typography.glyphStyle} onChange={handleTypographyChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option value="technical">Technical</option>
                                    <option value="standard">Standard</option>
                                    <option value="calligraphic">Calligraphic</option>
                                </select>
                            </FormField>
                        </div>
                    </Card>

                    <Card title="High-Frequency Trading Subsystem" icon={<Zap className="w-5 h-5 text-red-400" />}>
                        <p className="text-sm text-gray-400 mb-6">Configure the parameters for sub-millisecond market operations. Precision is absolute.</p>
                        <div className="space-y-6">
                            <FormField label="Primary Data Feed">
                                <select name="dataFeed" value={hftConfig.dataFeed} onChange={handleHftConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500">
                                    <option>AURORA_HELIX</option>
                                    <option>NASDAQ_ITCH</option>
                                    <option>LMAX_DIGITAL</option>
                                    <option>EBS_ULTRA</option>
                                </select>
                            </FormField>
                            <FormField label="Latency Target (ms)">
                                <input type="number" name="latencyTarget" value={hftConfig.latencyTarget} onChange={handleHftConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500" />
                            </FormField>
                            <FormField label="Risk Model">
                                <select name="riskModel" value={hftConfig.riskModel} onChange={handleHftConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500">
                                    <option>volatility-adaptive-v3</option>
                                    <option>static-threshold</option>
                                    <option>neural-net-predictive</option>
                                </select>
                            </FormField>
                             <FormField label="Order Flow Algorithm">
                                <select name="orderFlowAlgo" value={hftConfig.orderFlowAlgo} onChange={handleHftConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500">
                                    <option>iceberg-pov</option>
                                    <option>twap-aggressive</option>
                                    <option>liquidity-seeking-v2</option>
                                </select>
                            </FormField>
                            <FormField label="Execution Venue">
                                <select name="executionVenue" value={hftConfig.executionVenue} onChange={handleHftConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500">
                                    <option>Dark Pool Epsilon</option>
                                    <option>IEX</option>
                                    <option>Kraken Futures</option>
                                    <option>Direct-to-Exchange</option>
                                </select>
                            </FormField>
                            <FormField label="Market Impact Model">
                                <select name="marketImpactModel" value={hftConfig.marketImpactModel} onChange={handleHftConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-red-500 focus:border-red-500">
                                    <option>Propagator Model</option>
                                    <option>Almgren-Chriss</option>
                                    <option>Power Law</option>
                                </select>
                            </FormField>
                        </div>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card title="Spatial Architecture" icon={<Layout className="w-5 h-5 text-cyan-400" />}>
                        <p className="text-sm text-gray-400 mb-4">Define the structural logic of the interface. Choose how information unfolds in your operational space.</p>
                        <div className="flex flex-col space-y-3">
                            <button onClick={() => setLayoutMode('dynamic')} className={`text-left p-4 rounded-lg border-2 transition-all ${layoutMode === 'dynamic' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                <h3 className="font-bold text-white flex items-center"><SlidersHorizontal className="w-4 h-4 mr-2"/>Dynamic Fluid</h3>
                                <p className="text-xs text-gray-400 mt-1 pl-6">Context-aware modules that adapt in real-time.</p>
                            </button>
                            <button onClick={() => setLayoutMode('grid')} className={`text-left p-4 rounded-lg border-2 transition-all ${layoutMode === 'grid' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                <h3 className="font-bold text-white flex items-center"><BarChartBig className="w-4 h-4 mr-2"/>Structured Grid</h3>
                                <p className="text-xs text-gray-400 mt-1 pl-6">A deterministic, high-density information matrix.</p>
                            </button>
                            <button onClick={() => setLayoutMode('focused')} className={`text-left p-4 rounded-lg border-2 transition-all ${layoutMode === 'focused' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                <h3 className="font-bold text-white flex items-center"><Clock className="w-4 h-4 mr-2"/>Temporal Focus</h3>
                                <p className="text-xs text-gray-400 mt-1 pl-6">Prioritizes time-series data and event horizons.</p>
                            </button>
                            <button onClick={() => setLayoutMode('orbital')} className={`text-left p-4 rounded-lg border-2 transition-all ${layoutMode === 'orbital' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
                                <h3 className="font-bold text-white flex items-center"><Network className="w-4 h-4 mr-2"/>Orbital Swarm</h3>
                                <p className="text-xs text-gray-400 mt-1 pl-6">Data entities in gravitational relationship orbits.</p>
                            </button>
                        </div>
                    </Card>

                    <Card title="Global Entity Interaction Network (GEIN)" icon={<GitBranch className="w-5 h-5 text-yellow-400" />}>
                        <p className="text-sm text-gray-400 mb-6">Tune the core fabric of reality perception. GEIN models the interaction of all resolved entities across all data layers.</p>
                        <div className="space-y-4">
                            <ToggleSwitch 
                                label="Enable GEIN Core" 
                                description="Activates the global entity tracking and interaction simulation." 
                                enabled={geinConfig.enabled} 
                                onToggle={() => setGeinConfig(p => ({...p, enabled: !p.enabled}))} 
                            />
                            <FormField label="Entity Resolution Heuristics">
                                <select name="entityResolution" value={geinConfig.entityResolution} onChange={handleGeinConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-yellow-500 focus:border-yellow-500">
                                    <option>stochastic-resonance</option>
                                    <option>markov-chain-monte-carlo</option>
                                    <option>bayesian-inference-grid</option>
                                    <option>quantum-annealing</option>
                                </select>
                            </FormField>
                            <FormField label={`Causal Chain Analysis Depth: ${geinConfig.causalChainDepth}`}>
                                <input 
                                    type="range" 
                                    name="causalChainDepth" 
                                    min="1" 
                                    max="16" 
                                    value={geinConfig.causalChainDepth} 
                                    onChange={handleGeinConfigChange} 
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" 
                                />
                            </FormField>
                            <FormField label={`Pre-cognitive Anomaly Detection Threshold: ${geinConfig.anomalyDetectionThreshold}`}>
                                <input 
                                    type="range" 
                                    name="anomalyDetectionThreshold" 
                                    min="0.8" 
                                    max="1.0" 
                                    step="0.01"
                                    value={geinConfig.anomalyDetectionThreshold} 
                                    onChange={handleGeinConfigChange} 
                                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" 
                                />
                            </FormField>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                                <label htmlFor="semanticWeaving" className="font-semibold text-white">Semantic Field Weaving</label>
                                <input id="semanticWeaving" name="semanticWeaving" type="checkbox" checked={geinConfig.semanticWeaving} onChange={handleGeinConfigChange} className="h-5 w-5 rounded bg-gray-900 border-gray-600 text-yellow-500 focus:ring-yellow-600" />
                            </div>
                        </div>
                    </Card>

                    <Card title="Cognitive Modules" icon={<BrainCircuit className="w-5 h-5 text-cyan-400" />}>
                        <p className="text-sm text-gray-400 mb-4">Activate or deactivate core cognitive subsystems. Each module is a self-contained reality-processing unit.</p>
                        <div className="space-y-4">
                            <ToggleSwitch label="Cognitive Sync" description="Aligns UI refresh rate with user's neural alpha waves." enabled={modules.cognitiveSync} onToggle={() => handleModuleToggle('cognitiveSync')} />
                            <ToggleSwitch label="HFT Data Stream" description="Enables real-time, tick-by-tick market data visualization." enabled={modules.hftStream} onToggle={() => handleModuleToggle('hftStream')} />
                            <ToggleSwitch label="Predictive Analytics Engine" description="Renders probabilistic future states based on current vectors." enabled={modules.predictiveEngine} onToggle={() => handleModuleToggle('predictiveEngine')} />
                            <ToggleSwitch label="Chronospatial Navigator" description="Unlocks the 4D data visualization and time-scrubbing module." enabled={modules.chronospatialNav} onToggle={() => handleModuleToggle('chronospatialNav')} />
                            <ToggleSwitch label="Psychohistorical Projection" description="Models large-scale social and economic trends." enabled={modules.psychohistory} onToggle={() => handleModuleToggle('psychohistory')} />
                            <ToggleSwitch label="Subconscious Threat Detector" description="Monitors for patterns below the threshold of conscious perception." enabled={modules.threatDetector} onToggle={() => handleModuleToggle('threatDetector')} />
                        </div>
                    </Card>

                    <Card title="System Core & Network Protocol" icon={<Cpu className="w-5 h-5 text-cyan-400" />}>
                        <p className="text-sm text-gray-400 mb-6">Fine-tune the underlying data transport layer and encryption protocols. For advanced users only.</p>
                        <div className="space-y-6">
                            <FormField label="Transport Protocol">
                                <select name="protocol" value={networkConfig.protocol} onChange={handleNetworkConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option>QUIC</option>
                                    <option>WebTransport</option>
                                    <option>TCP (Legacy)</option>
                                </select>
                            </FormField>
                            <FormField label="Encryption Suite">
                                <select name="encryption" value={networkConfig.encryption} onChange={handleNetworkConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option>AES-256-GCM</option>
                                    <option>ChaCha20-Poly1305</option>
                                    <option>None (Unsecured)</option>
                                </select>
                            </FormField>
                            <FormField label="Packet Pacing Algorithm">
                                <select name="pacing" value={networkConfig.pacing} onChange={handleNetworkConfigChange} className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500">
                                    <option>BBR</option>
                                    <option>FQ-CoDel</option>
                                    <option>None (Aggressive)</option>
                                </select>
                            </FormField>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                                <label htmlFor="multipath" className="font-semibold text-white">Enable Multipath TCP</label>
                                <input id="multipath" name="multipath" type="checkbox" checked={networkConfig.multipath} onChange={handleNetworkConfigChange} className="h-5 w-5 rounded bg-gray-900 border-gray-600 text-cyan-500 focus:ring-cyan-600" />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PersonalizationView;


// --- CONSOLIDATED FROM: PersonalizationView (3).tsx ---

import React, { useState } from 'react';
import Card from './Card';
import { Palette, Layout, Type } from 'lucide-react';

const PersonalizationView: React.FC = () => {
    const [theme, setTheme] = useState('sovereign');

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Personalization</h2>
            
            <Card title="The Interface of Will">
                <div className="space-y-6">
                    <p className="text-gray-300 italic border-l-4 border-cyan-500 pl-4 py-2 bg-gray-800/50 rounded-r">
                        "You click on 'Personalization' and think you're choosing a theme. Cute. You're not decorating a dashboard. You are stepping into the mind of James Burvel O'Callaghan III." â€” idgafai
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <button 
                            onClick={() => setTheme('sovereign')}
                            className={`p-4 rounded-lg border-2 transition-all ${theme === 'sovereign' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
                        >
                            <div className="h-20 bg-gradient-to-br from-gray-900 to-black rounded mb-3 border border-gray-700 flex items-center justify-center">
                                <span className="text-cyan-400 font-bold">SOV</span>
                            </div>
                            <h3 className="font-bold text-white">Sovereign Dark</h3>
                            <p className="text-xs text-gray-400 mt-1">The default state. Pure, unfiltered signal.</p>
                        </button>

                        <button 
                             onClick={() => setTheme('quantum')}
                             className={`p-4 rounded-lg border-2 transition-all ${theme === 'quantum' ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
                        >
                            <div className="h-20 bg-gradient-to-br from-indigo-900 to-purple-900 rounded mb-3 border border-indigo-700 flex items-center justify-center">
                                <span className="text-purple-300 font-bold">QTM</span>
                            </div>
                            <h3 className="font-bold text-white">Quantum Flux</h3>
                            <p className="text-xs text-gray-400 mt-1">For those who see the probability waves.</p>
                        </button>

                        <button 
                             onClick={() => setTheme('legacy')}
                             className={`p-4 rounded-lg border-2 transition-all ${theme === 'legacy' ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
                        >
                             <div className="h-20 bg-gray-100 rounded mb-3 border border-gray-300 flex items-center justify-center opacity-50">
                                <span className="text-gray-800 font-bold">LGCY</span>
                            </div>
                            <h3 className="font-bold text-white">Legacy (Disabled)</h3>
                            <p className="text-xs text-gray-500 mt-1">We don't go back. The old world is dead.</p>
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PersonalizationView;

// --- CONSOLIDATED FROM: PersonalizationView (1).tsx ---

import React, { useState } from 'react';
import Card from './Card';
import { Palette, Layout, Type } from 'lucide-react';

const PersonalizationView: React.FC = () => {
    const [theme, setTheme] = useState('sovereign');

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Personalization</h2>
            
            <Card title="The Interface of Will">
                <div className="space-y-6">
                    <p className="text-gray-300 italic border-l-4 border-cyan-500 pl-4 py-2 bg-gray-800/50 rounded-r">
                        "You click on 'Personalization' and think you're choosing a theme. Cute. You're not decorating a dashboard. You are stepping into the mind of James Burvel O'Callaghan III." — idgafai
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <button 
                            onClick={() => setTheme('sovereign')}
                            className={`p-4 rounded-lg border-2 transition-all ${theme === 'sovereign' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
                        >
                            <div className="h-20 bg-gradient-to-br from-gray-900 to-black rounded mb-3 border border-gray-700 flex items-center justify-center">
                                <span className="text-cyan-400 font-bold">SOV</span>
                            </div>
                            <h3 className="font-bold text-white">Sovereign Dark</h3>
                            <p className="text-xs text-gray-400 mt-1">The default state. Pure, unfiltered signal.</p>
                        </button>

                        <button 
                             onClick={() => setTheme('quantum')}
                             className={`p-4 rounded-lg border-2 transition-all ${theme === 'quantum' ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
                        >
                            <div className="h-20 bg-gradient-to-br from-indigo-900 to-purple-900 rounded mb-3 border border-indigo-700 flex items-center justify-center">
                                <span className="text-purple-300 font-bold">QTM</span>
                            </div>
                            <h3 className="font-bold text-white">Quantum Flux</h3>
                            <p className="text-xs text-gray-400 mt-1">For those who see the probability waves.</p>
                        </button>

                        <button 
                             onClick={() => setTheme('legacy')}
                             className={`p-4 rounded-lg border-2 transition-all ${theme === 'legacy' ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
                        >
                             <div className="h-20 bg-gray-100 rounded mb-3 border border-gray-300 flex items-center justify-center opacity-50">
                                <span className="text-gray-800 font-bold">LGCY</span>
                            </div>
                            <h3 className="font-bold text-white">Legacy (Disabled)</h3>
                            <p className="text-xs text-gray-500 mt-1">We don't go back. The old world is dead.</p>
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PersonalizationView;

// --- CONSOLIDATED FROM: PersonalizationView (1)_1.tsx ---

import React, { useState } from 'react';
import Card from './Card';
import { Palette, Layout, Type } from 'lucide-react';

const PersonalizationView: React.FC = () => {
    const [theme, setTheme] = useState('sovereign');

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Personalization</h2>
            
            <Card title="The Interface of Will">
                <div className="space-y-6">
                    <p className="text-gray-300 italic border-l-4 border-cyan-500 pl-4 py-2 bg-gray-800/50 rounded-r">
                        "You click on 'Personalization' and think you're choosing a theme. Cute. You're not decorating a dashboard. You are stepping into the mind of James Burvel O'Callaghan III." — idgafai
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <button 
                            onClick={() => setTheme('sovereign')}
                            className={`p-4 rounded-lg border-2 transition-all ${theme === 'sovereign' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
                        >
                            <div className="h-20 bg-gradient-to-br from-gray-900 to-black rounded mb-3 border border-gray-700 flex items-center justify-center">
                                <span className="text-cyan-400 font-bold">SOV</span>
                            </div>
                            <h3 className="font-bold text-white">Sovereign Dark</h3>
                            <p className="text-xs text-gray-400 mt-1">The default state. Pure, unfiltered signal.</p>
                        </button>

                        <button 
                             onClick={() => setTheme('quantum')}
                             className={`p-4 rounded-lg border-2 transition-all ${theme === 'quantum' ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
                        >
                            <div className="h-20 bg-gradient-to-br from-indigo-900 to-purple-900 rounded mb-3 border border-indigo-700 flex items-center justify-center">
                                <span className="text-purple-300 font-bold">QTM</span>
                            </div>
                            <h3 className="font-bold text-white">Quantum Flux</h3>
                            <p className="text-xs text-gray-400 mt-1">For those who see the probability waves.</p>
                        </button>

                        <button 
                             onClick={() => setTheme('legacy')}
                             className={`p-4 rounded-lg border-2 transition-all ${theme === 'legacy' ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
                        >
                             <div className="h-20 bg-gray-100 rounded mb-3 border border-gray-300 flex items-center justify-center opacity-50">
                                <span className="text-gray-800 font-bold">LGCY</span>
                            </div>
                            <h3 className="font-bold text-white">Legacy (Disabled)</h3>
                            <p className="text-xs text-gray-500 mt-1">We don't go back. The old world is dead.</p>
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PersonalizationView;

// --- CONSOLIDATED FROM: ./views/personal/PersonalizationView.tsx ---

// components/views/personal/PersonalizationView.tsx
import React, { useContext, useState } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { IllusionType } from '../../../types';
import { GoogleGenAI } from '@google/genai';

const PersonalizationView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("PersonalizationView must be within a DataProvider.");

    const { customBackgroundUrl, setCustomBackgroundUrl, activeIllusion, setActiveIllusion } = context;

    const [imageUrl, setImageUrl] = useState('');
    const [aiPrompt, setAiPrompt] = useState('An isolated lighthouse on a stormy sea, digital painting');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    
    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: aiPrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
            });
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const generatedUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            setCustomBackgroundUrl(generatedUrl);
        } catch (err) {
            setError('Could not generate image. The model may have safety concerns with your prompt.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Personalization</h2>
            <Card title="Dynamic Visuals">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                        <h4 className="font-semibold text-white">Aurora Illusion</h4>
                        <p className="text-sm text-gray-400">A dynamic, flowing gradient inspired by the northern lights.</p>
                    </div>
                    <input type="radio" name="theme" className="radio radio-primary" checked={activeIllusion === 'aurora'} onChange={() => setActiveIllusion('aurora')} />
                </div>
                 <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg mt-2">
                    <div><h4 className="font-semibold text-white">None</h4><p className="text-sm text-gray-400">Default dark theme.</p></div>
                    <input type="radio" name="theme" className="radio radio-primary" checked={activeIllusion === 'none'} onChange={() => setActiveIllusion('none')} />
                </div>
            </Card>
            
            <Card title="AI Background Generator">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <p className="text-gray-400 mb-4">Describe the background you want, and our AI will create it for you.</p>
                        <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className="w-full h-24 bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                        <button onClick={handleGenerate} disabled={isGenerating} className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50">{isGenerating ? 'Generating...' : 'Generate & Set Background'}</button>
                        {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                    </div>
                    <div className="h-48 rounded-lg bg-gray-900/50 flex items-center justify-center">
                        {isGenerating ? <p className="text-cyan-300">Generating...</p> : <p className="text-gray-500">Preview will appear here</p>}
                    </div>
                </div>
            </Card>

            <Card title="Custom Background Image">
                <p className="text-gray-400 mb-4">Or, paste an image URL for a static background.</p>
                <div className="flex gap-2">
                    <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <button onClick={() => setCustomBackgroundUrl(imageUrl)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Set Image</button>
                </div>
            </Card>
        </div>
    );
};

export default PersonalizationView;


// --- CONSOLIDATED FROM: ./components/PersonalizationView (2).tsx ---



// --- CONSOLIDATED FROM: PersonalizationView (2)_1.tsx ---

import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';

// =================================================================================
// REFACTORING NOTE (MVP SCOPING & SECURITY):
// The original component attempted to manage 200+ server-side API keys via a frontend form.
// This is a critical security flaw. In a stable, production-ready system:
// 1. Secrets must be stored in secure vaults (AWS Secrets Manager, Vault) and injected at runtime.
// 2. The client should never handle the full set of server configuration secrets.
//
// For the MVP (Focused on Unified Financial Dashboard/Treasury Automation), we drastically
// restrict configuration exposed via the UI to the minimal required server-side secrets
// (Plaid for aggregation, Stripe for billing, OpenAI for transaction intelligence).
// All other 200+ providers have been removed/archived, as they are not MVP critical
// and should be configured via environment or secret manager, not the UI.
// =================================================================================
interface ApiKeysState {
  // === Financial Aggregation (Core MVP) ===
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;

  // === Core Payment Infrastructure ===
  STRIPE_SECRET_KEY: string;

  // === AI Intelligence ===
  OPENAI_API_KEY: string;
  
  [key: string]: string; // Index signature maintained for dynamic access utility
}


const PersonalizationView: React.FC = () => {
  // Initialize only the necessary MVP keys
  const [keys, setKeys] = useState<ApiKeysState>(() => ({
    PLAID_CLIENT_ID: '',
    PLAID_SECRET: '',
    STRIPE_SECRET_KEY: '',
    OPENAI_API_KEY: '',
  } as ApiKeysState));
  
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Removed activeTab state as categorization is no longer required with scoped keys.

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // NOTE: In a secure production system, this POST request must be authenticated,
    // authorized (Admin role required), and use HTTPS to update server secrets.
    setStatusMessage('Saving critical keys securely to backend...');
    
    // Filter out empty keys before sending, though backend validation is crucial.
    const definedKeys = Object.entries(keys).reduce((acc, [key, value]) => {
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Partial<ApiKeysState>);
    
    try {
      // Endpoint maintained for continuity, backend is expected to handle secure storage (e.g., Vault injection).
      const response = await axios.post('http://localhost:4000/api/save-keys', definedKeys);
      setStatusMessage(response.data.message);
    } catch (error) {
       if (axios.isAxiosError(error) && error.response) {
        setStatusMessage(`Error (${error.response.status}): ${error.response.data.message || 'Could not save keys.'}`);
      } else {
        setStatusMessage('Error: Could not save keys. Please check backend server.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName}>{label}</label>
      <input
        // Server secrets must be handled as password type
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label} (required for MVP functionality)`}
      />
    </div>
  );

  const renderMvpConfig = () => (
    <>
      <div className="form-section">
        <h2>Core Financial Aggregation (Plaid)</h2>
        <p className="section-description">Required for Multi-bank aggregation and transaction retrieval.</p>
        {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
        {renderInput('PLAID_SECRET', 'Plaid Secret Key')}
      </div>

      <div className="form-section">
        <h2>Payments and Billing (Stripe)</h2>
        <p className="section-description">Used for core subscription and payment processing.</p>
        {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key')}
      </div>

      <div className="form-section">
        <h2>AI Services (OpenAI/Gemini)</h2>
        <p className="section-description">Required for Transaction Intelligence and Smart Alert generation.</p>
        {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
      </div>
    </>
  );

  return (
    <div className="settings-container">
      <h1>MVP System Configuration Console</h1>
      <p className="subtitle">
        Configure the minimal required server-side credentials for the MVP financial platform. 
        <span className="warning-text"> These sensitive keys must be secured via production secrets management tools (e.g., AWS Secrets Manager, Vault) upon deployment.</span>
      </p>

      {/* Tabs removed as the component scope is now focused */}
      
      <form onSubmit={handleSubmit} className="settings-form">
        {renderMvpConfig()}
        
        <div className="form-footer">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
          {statusMessage && <p className="status-message">{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};

export default PersonalizationView;

// --- CONSOLIDATED FROM: ./components/PersonalizationView (3).tsx ---



// --- CONSOLIDATED FROM: PersonalizationView (3)_1.tsx ---

import React, { useState } from 'react';
import Card from './Card';
import { Palette, Layout, Type } from 'lucide-react';

const PersonalizationView: React.FC = () => {
    const [theme, setTheme] = useState('sovereign');

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Personalization</h2>
            
            <Card title="The Interface of Will">
                <div className="space-y-6">
                    <p className="text-gray-300 italic border-l-4 border-cyan-500 pl-4 py-2 bg-gray-800/50 rounded-r">
                        "You click on 'Personalization' and think you're choosing a theme. Cute. You're not decorating a dashboard. You are stepping into the mind of James Burvel O'Callaghan III." â€” idgafai
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <button 
                            onClick={() => setTheme('sovereign')}
                            className={`p-4 rounded-lg border-2 transition-all ${theme === 'sovereign' ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
                        >
                            <div className="h-20 bg-gradient-to-br from-gray-900 to-black rounded mb-3 border border-gray-700 flex items-center justify-center">
                                <span className="text-cyan-400 font-bold">SOV</span>
                            </div>
                            <h3 className="font-bold text-white">Sovereign Dark</h3>
                            <p className="text-xs text-gray-400 mt-1">The default state. Pure, unfiltered signal.</p>
                        </button>

                        <button 
                             onClick={() => setTheme('quantum')}
                             className={`p-4 rounded-lg border-2 transition-all ${theme === 'quantum' ? 'border-purple-500 bg-purple-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
                        >
                            <div className="h-20 bg-gradient-to-br from-indigo-900 to-purple-900 rounded mb-3 border border-indigo-700 flex items-center justify-center">
                                <span className="text-purple-300 font-bold">QTM</span>
                            </div>
                            <h3 className="font-bold text-white">Quantum Flux</h3>
                            <p className="text-xs text-gray-400 mt-1">For those who see the probability waves.</p>
                        </button>

                        <button 
                             onClick={() => setTheme('legacy')}
                             className={`p-4 rounded-lg border-2 transition-all ${theme === 'legacy' ? 'border-green-500 bg-green-900/20' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}
                        >
                             <div className="h-20 bg-gray-100 rounded mb-3 border border-gray-300 flex items-center justify-center opacity-50">
                                <span className="text-gray-800 font-bold">LGCY</span>
                            </div>
                            <h3 className="font-bold text-white">Legacy (Disabled)</h3>
                            <p className="text-xs text-gray-500 mt-1">We don't go back. The old world is dead.</p>
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default PersonalizationView;

// --- CONSOLIDATED FROM: ./components/views/personal/PersonalizationView.tsx ---

// components/views/personal/PersonalizationView.tsx
import React, { useContext, useState } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { IllusionType } from '../../../types';
import { GoogleGenAI } from '@google/genai';

const PersonalizationView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("PersonalizationView must be within a DataProvider.");

    const { customBackgroundUrl, setCustomBackgroundUrl, activeIllusion, setActiveIllusion } = context;

    const [imageUrl, setImageUrl] = useState('');
    const [aiPrompt, setAiPrompt] = useState('An isolated lighthouse on a stormy sea, digital painting');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    
    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: aiPrompt,
                config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
            });
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const generatedUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            setCustomBackgroundUrl(generatedUrl);
        } catch (err) {
            setError('Could not generate image. The model may have safety concerns with your prompt.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Personalization</h2>
            <Card title="Dynamic Visuals">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div>
                        <h4 className="font-semibold text-white">Aurora Illusion</h4>
                        <p className="text-sm text-gray-400">A dynamic, flowing gradient inspired by the northern lights.</p>
                    </div>
                    <input type="radio" name="theme" className="radio radio-primary" checked={activeIllusion === 'aurora'} onChange={() => setActiveIllusion('aurora')} />
                </div>
                 <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg mt-2">
                    <div><h4 className="font-semibold text-white">None</h4><p className="text-sm text-gray-400">Default dark theme.</p></div>
                    <input type="radio" name="theme" className="radio radio-primary" checked={activeIllusion === 'none'} onChange={() => setActiveIllusion('none')} />
                </div>
            </Card>
            
            <Card title="AI Background Generator">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div>
                        <p className="text-gray-400 mb-4">Describe the background you want, and our AI will create it for you.</p>
                        <textarea value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className="w-full h-24 bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                        <button onClick={handleGenerate} disabled={isGenerating} className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50">{isGenerating ? 'Generating...' : 'Generate & Set Background'}</button>
                        {error && <p className="text-red-400 mt-2 text-center">{error}</p>}
                    </div>
                    <div className="h-48 rounded-lg bg-gray-900/50 flex items-center justify-center">
                        {isGenerating ? <p className="text-cyan-300">Generating...</p> : <p className="text-gray-500">Preview will appear here</p>}
                    </div>
                </div>
            </Card>

            <Card title="Custom Background Image">
                <p className="text-gray-400 mb-4">Or, paste an image URL for a static background.</p>
                <div className="flex gap-2">
                    <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <button onClick={() => setCustomBackgroundUrl(imageUrl)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Set Image</button>
                </div>
            </Card>
        </div>
    );
};

export default PersonalizationView;
