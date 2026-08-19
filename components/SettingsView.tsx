import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import Card from './Card';
import { 
  User, Shield, Lock, Mail, Link as LinkIcon, Database, Server, Wifi, Terminal, 
  MessageSquare, Send, Activity, FileText, AlertTriangle, CheckCircle, X, 
  Cpu, Zap, Globe, Eye, Key, RefreshCw, Save, Trash2, Play, ChevronRight,
  BarChart3, PieChart, Layers, HardDrive, Radio
} from 'lucide-react';
import { DataContext } from '../context/DataContext';
import { GoogleGenAI } from "@google/genai";

// ============================================================================
// CONSTANTS & NARRATIVE DATA
// ============================================================================

const COMPANY_NAME = "Quantum Financial";
const DEMO_NAME = "Quantum Financial Business Demo";

const MANIFESTO_TEXT = `
Quantum Financial Business Demo: A Comprehensive Guide
Hey guys! Ever wondered about getting a demo for ${COMPANY_NAME}’s business services? You’re in the right place! In this article, we’re diving deep into ${COMPANY_NAME}’s business demo, exploring what it is, why you might want one, and how to make the most of it. Whether you’re a small startup or a growing enterprise, understanding the tools and services available to manage your finances is crucial. ${COMPANY_NAME}, a titan in the financial world, offers a suite of business banking solutions designed to streamline operations, enhance security, and support your growth. Getting a demo is your golden ticket to seeing these powerful features in action before committing. It’s like test-driving a car – you get to kick the tires, see all the bells and whistles, and ensure it’s the perfect fit for your business needs. We’ll cover everything from the initial setup to exploring key functionalities and understanding the benefits that come with partnering with a global financial institution like ${COMPANY_NAME}. So, buckle up, and let’s get this demo journey started!

Why a ${COMPANY_NAME} Business Demo is Your Secret Weapon
So, why should you even bother with a ${COMPANY_NAME} business demo, right? Well, guys, think of it as your ultimate cheat sheet to the world of business banking with ${COMPANY_NAME}. In today’s fast-paced business environment, efficiency and clarity in financial management aren’t just nice-to-haves; they’re absolute must-haves. A demo allows you to virtually walk through the entire platform. You get to see firsthand how easy it is to manage your accounts, process payments, track expenses, and access sophisticated reporting tools. This isn’t just about looking at pretty interfaces; it’s about understanding the real-world application of these tools for your specific business. Are you struggling with international payments? Worried about fraud? Need better insights into your cash flow? A demo lets you ask those specific questions and see how ${COMPANY_NAME}’s solutions can address them. It’s also a fantastic opportunity to get a feel for the user experience. Is the platform intuitive? Can your team easily navigate it? The demo provides a no-pressure environment to explore, interact, and evaluate without any commitment. It’s about empowering yourself with knowledge so you can make an informed decision that aligns with your business goals and operational needs. Plus, you get to see how ${COMPANY_NAME} integrates with other business tools you might already be using, saving you time and preventing data silos. This proactive approach to understanding your financial tools can save you a ton of headaches down the line and ensure you’re leveraging the best resources available to drive your business forward. It’s your chance to see the future of your business finances, laid out before you, in a clear and interactive way.

What to Expect During Your ${COMPANY_NAME} Business Demo
Alright, let’s talk turkey about what actually happens when you sign up for a ${COMPANY_NAME} business demo. Think of this as your backstage pass to ${COMPANY_NAME}’s business banking powerhouse. Typically, your demo will be led by a ${COMPANY_NAME} representative who is knowledgeable about their business services. They’ll usually tailor the session to your specific industry and business size, which is super cool because it means you’re not sitting through a generic presentation. They’ll likely start by getting a feel for your current financial processes and pain points. This is your cue to lay it all out – what’s working, what’s not, and what you’re hoping to achieve. Then, they’ll guide you through the core features of their business banking platform. Expect to see a walkthrough of account management – how to view balances, transaction history, and statements with ease. They’ll showcase payment solutions, whether it’s domestic transfers, international wires, or setting up payroll. If you deal with receivables, they’ll probably demonstrate how you can receive payments efficiently. A big part of modern business banking is security, so be prepared for them to highlight features like multi-factor authentication, fraud monitoring, and secure messaging. You’ll also likely get a peek at their reporting and analytics tools. These are goldmines for understanding your financial health, tracking spending patterns, and forecasting cash flow. Don’t be shy! This is your demo. Ask questions. Lots of them. How does this integrate with my accounting software? What are the fees associated with these services? What kind of support can I expect if I run into an issue? The more you engage, the more valuable the demo will be. They might also touch upon specialized services like treasury management, foreign exchange, or lending options, depending on your business needs. The goal is to give you a comprehensive, yet focused, overview of how ${COMPANY_NAME} can become an integral part of your business’s financial ecosystem. It’s about seeing the technology in action and understanding how it translates into tangible benefits for your daily operations and long-term strategy. Remember, this is a conversation, not just a presentation. Use it to your advantage to gather all the intel you need to make a sound decision.
`;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'AUDIT_LOCKED';
  user: string;
  hash: string; // Simulated cryptographic hash for audit integrity
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
  history: number[];
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-900/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white tracking-wide font-mono">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
        <div className="p-4 border-t border-gray-800 bg-gray-900/50 text-center">
            <p className="text-xs text-gray-500 font-mono">SECURE AUDIT CHANNEL ACTIVE // ENCRYPTION: AES-256</p>
        </div>
      </div>
    </div>
  );
};

const AuditBadge: React.FC = () => (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-900/30 border border-yellow-600/30 text-yellow-500 text-[10px] font-mono uppercase tracking-wider">
        <Lock size={10} />
        Audit Logged
    </div>
);

const StatusIndicator: React.FC<{ status: 'optimal' | 'warning' | 'critical' }> = ({ status }) => {
    const colors = {
        optimal: 'bg-green-500 shadow-green-500/50',
        warning: 'bg-yellow-500 shadow-yellow-500/50',
        critical: 'bg-red-500 shadow-red-500/50'
    };
    return (
        <div className={`w-2 h-2 rounded-full ${colors[status]} shadow-lg animate-pulse`} />
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SettingsView: React.FC = () => {
    const { 
        dbConfig, updateDbConfig, connectDatabase, 
        webDriverStatus, launchWebDriver, 
        geminiApiKey, userProfile 
    } = useContext(DataContext)!;

    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState<'control' | 'ai' | 'audit' | 'manifesto'>('control');
    const [auditLog, setAuditLog] = useState<LogEntry[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: 'init', role: 'system', content: `Welcome to the ${COMPANY_NAME} Neural Interface. I am ready to assist with system configuration, data analysis, and operational queries.`, timestamp: new Date() }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    
    // Modal States
    const [isDbModalOpen, setIsDbModalOpen] = useState(false);
    const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
    const [tempDbConfig, setTempDbConfig] = useState(dbConfig);
    const [automationTask, setAutomationTask] = useState('');

    // Simulation States
    const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
        { name: 'Core Temperature', value: 42, unit: '°C', status: 'optimal', history: [] },
        { name: 'Network Latency', value: 12, unit: 'ms', status: 'optimal', history: [] },
        { name: 'Encryption Entropy', value: 99.9, unit: '%', status: 'optimal', history: [] },
        { name: 'Transaction Throughput', value: 1450, unit: 'tps', status: 'optimal', history: [] }
    ]);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- EFFECTS ---

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // Simulate System Metrics ("Engine Roar")
    useEffect(() => {
        const interval = setInterval(() => {
            setSystemMetrics(prev => prev.map(m => {
                const fluctuation = (Math.random() - 0.5) * (m.value * 0.1);
                const newValue = Math.max(0, m.value + fluctuation);
                const newHistory = [...m.history, newValue].slice(-20);
                return { ...m, value: newValue, history: newHistory };
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // --- AUDIT LOGGING SYSTEM ---

    const logAction = useCallback((action: string, details: string, status: LogEntry['status'] = 'SUCCESS') => {
        const newEntry: LogEntry = {
            id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            timestamp: new Date().toISOString(),
            action,
            details,
            status,
            user: userProfile?.name || 'SYSTEM_ADMIN',
            hash: Math.random().toString(36).substr(2, 16).toUpperCase() // Mock hash
        };
        setAuditLog(prev => [newEntry, ...prev]);
    }, [userProfile]);

    // --- AI INTEGRATION ---

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
        setIsProcessingAI(true);

        try {
            let aiResponseText = "I'm sorry, I cannot process that request right now.";

            if (geminiApiKey) {
                const genAI = new GoogleGenAI({ apiKey: geminiApiKey });
                // Using the model specified in the prompt snippet or a standard one
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
                
                const prompt = `
                    CONTEXT: You are the AI Core for "${COMPANY_NAME}", a high-performance financial platform.
                    USER PROFILE: ${userProfile?.name} (${userProfile?.title}).
                    TONE: Elite, Professional, Secure, Helpful.
                    TASK: Answer the user's query. If they ask to create something, simulate the creation and confirm it.
                    
                    USER QUERY: ${userMsg.content}
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                aiResponseText = response.text();
            } else {
                // Fallback if no key
                aiResponseText = "API Key missing. Please configure the Neural Link in the Control Room.";
            }

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: aiResponseText,
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, aiMsg]);
            logAction('AI_INTERACTION', `Query: ${userMsg.content.substring(0, 20)}...`, 'SUCCESS');

        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'system',
                content: "CRITICAL FAILURE: Neural Link interrupted. Check API configuration.",
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, errorMsg]);
            logAction('AI_FAILURE', 'Neural Link connection failed', 'FAILURE');
        } finally {
            setIsProcessingAI(false);
        }
    };

    // --- HANDLERS ---

    const handleSaveDbConfig = () => {
        updateDbConfig(tempDbConfig);
        logAction('DB_CONFIG_UPDATE', `Host: ${tempDbConfig.host}, DB: ${tempDbConfig.databaseName}`, 'AUDIT_LOCKED');
        setIsDbModalOpen(false);
        connectDatabase(); // Trigger connection attempt
    };

    const handleRunAutomation = () => {
        launchWebDriver(automationTask);
        logAction('AUTOMATION_EXEC', `Task: ${automationTask}`, 'PENDING');
        setIsAutomationModalOpen(false);
        setAutomationTask('');
    };

    // --- RENDER HELPERS ---

    const renderMetricCard = (metric: SystemMetric) => (
        <div key={metric.name} className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-400 text-xs font-mono uppercase">{metric.name}</span>
                <StatusIndicator status={metric.status} />
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white font-mono">{metric.value.toFixed(1)}</span>
                <span className="text-xs text-cyan-400">{metric.unit}</span>
            </div>
            {/* Simulated Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end opacity-20 group-hover:opacity-40 transition-opacity">
                {metric.history.map((h, i) => (
                    <div key={i} style={{ height: `${(h / (metric.value * 1.5)) * 100}%`, width: '5%' }} className="bg-cyan-400 mx-[1px]" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-4xl font-bold text-white tracking-wider uppercase font-mono">Control Room</h2>
                        <span className="px-3 py-1 rounded bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-widest">
                            ADMIN_ACCESS_GRANTED
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm max-w-2xl">
                        Welcome to the nerve center of {COMPANY_NAME}. Configure core systems, audit secure logs, and engage the Neural AI for strategic assistance.
                    </p>
                </div>
                <div className="flex gap-2 bg-gray-900/80 p-1 rounded-lg border border-gray-700">
                    {[
                        { id: 'control', icon: Layers, label: 'Systems' },
                        { id: 'ai', icon: Cpu, label: 'Neural AI' },
                        { id: 'audit', icon: FileText, label: 'Audit Logs' },
                        { id: 'manifesto', icon: Globe, label: 'Manifesto' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                activeTab === tab.id 
                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' 
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN (Main Content) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* TAB: CONTROL SYSTEMS */}
                    {activeTab === 'control' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* System Metrics Dashboard */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {systemMetrics.map(renderMetricCard)}
                            </div>

                            {/* Database Nexus */}
                            <Card title="Prisma Database Nexus" icon={<Database className="text-cyan-400" />} variant="outline">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${dbConfig.connectionStatus === 'connected' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                <Server size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">PostgreSQL Cluster</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`w-2 h-2 rounded-full ${dbConfig.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <p className="text-xs text-gray-400 font-mono uppercase">{dbConfig.connectionStatus}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setIsDbModalOpen(true)}
                                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-600 transition-colors flex items-center gap-2"
                                        >
                                            <Key size={14} />
                                            Configure Access
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-500">
                                        <div className="bg-black/30 p-2 rounded border border-gray-800">HOST: {dbConfig.host}</div>
                                        <div className="bg-black/30 p-2 rounded border border-gray-800">PORT: {dbConfig.port}</div>
                                        <div className="bg-black/30 p-2 rounded border border-gray-800">DB: {dbConfig.databaseName}</div>
                                        <div className="bg-black/30 p-2 rounded border border-gray-800">SSL: {dbConfig.sslMode}</div>
                                    </div>
                                </div>
                            </Card>

                            {/* Automation Engine */}
                            <Card title="Automation Engine (Web Driver)" icon={<Terminal className="text-purple-400" />} variant="outline">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Activity className="text-purple-400" size={18} />
                                            <span className="text-gray-300 text-sm">Agent Status:</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${webDriverStatus.status === 'running' ? 'bg-green-900 text-green-300 animate-pulse' : 'bg-gray-700 text-gray-400'}`}>
                                                {webDriverStatus.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setAutomationTask('Routine System Diagnostic');
                                                setIsAutomationModalOpen(true);
                                            }}
                                            disabled={webDriverStatus.status === 'running'}
                                            className="text-xs text-purple-400 hover:text-white underline disabled:opacity-50"
                                        >
                                            Execute New Task
                                        </button>
                                    </div>
                                    
                                    <div className="bg-black p-4 rounded-lg font-mono text-xs text-green-400 h-48 overflow-y-auto border border-gray-800 shadow-inner custom-scrollbar">
                                        <div className="opacity-50 mb-2 border-b border-gray-800 pb-1"> // SYSTEM LOG STREAM // </div>
                                        {webDriverStatus.logs.length > 0 ? webDriverStatus.logs.map((log, i) => (
                                            <div key={i} className="mb-1">
                                                <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span> {log}
                                            </div>
                                        )) : <span className="text-gray-600 italic">Waiting for command execution...</span>}
                                        {webDriverStatus.status === 'running' && (
                                            <div className="animate-pulse mt-2">_</div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* TAB: NEURAL AI */}
                    {activeTab === 'ai' && (
                        <Card className="h-[600px] flex flex-col" padding="none" variant="interactive">
                            <div className="flex-1 flex flex-col h-full">
                                <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                            <Cpu className="text-white" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Sovereign AI Core</h3>
                                            <p className="text-xs text-gray-400">Model: Gemini-1.5-Flash // Latency: 45ms</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-2 py-1 bg-gray-900 rounded border border-gray-700 text-xs text-gray-400 font-mono">
                                            API_KEY: {geminiApiKey ? '********' + geminiApiKey.substr(-4) : 'MISSING'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900/30 custom-scrollbar">
                                    {chatHistory.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl p-4 ${
                                                msg.role === 'user' 
                                                ? 'bg-cyan-600 text-white rounded-tr-none' 
                                                : msg.role === 'system'
                                                ? 'bg-red-900/20 border border-red-500/30 text-red-200'
                                                : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                            }`}>
                                                <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] uppercase font-bold tracking-wider">
                                                    {msg.role === 'ai' && <Cpu size={10} />}
                                                    {msg.role === 'user' && <User size={10} />}
                                                    {msg.role === 'system' && <AlertTriangle size={10} />}
                                                    {msg.role}
                                                </div>
                                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                    {msg.content}
                                                </div>
                                                <div className="mt-2 text-[10px] opacity-30 text-right">
                                                    {msg.timestamp.toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isProcessingAI && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-800 rounded-2xl rounded-tl-none p-4 border border-gray-700 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="p-4 bg-gray-800/50 border-t border-gray-700">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Ask the Core to analyze data, generate reports, or configure systems..."
                                            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                        />
                                        <button 
                                            onClick={handleSendMessage}
                                            disabled={!chatInput.trim() || isProcessingAI}
                                            className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* TAB: AUDIT LOGS */}
                    {activeTab === 'audit' && (
                        <Card title="Immutable Audit Ledger" icon={<Shield className="text-yellow-500" />} variant="outline">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase font-mono">
                                            <th className="p-3">Timestamp</th>
                                            <th className="p-3">User</th>
                                            <th className="p-3">Action</th>
                                            <th className="p-3">Details</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Hash</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {auditLog.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-gray-500 italic">No audit records found in current session.</td>
                                            </tr>
                                        ) : (
                                            auditLog.map(log => (
                                                <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors font-mono text-xs">
                                                    <td className="p-3 text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                                    <td className="p-3 text-cyan-400">{log.user}</td>
                                                    <td className="p-3 text-white font-bold">{log.action}</td>
                                                    <td className="p-3 text-gray-300 max-w-xs truncate" title={log.details}>{log.details}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                                                            log.status === 'SUCCESS' ? 'bg-green-900/50 text-green-400' :
                                                            log.status === 'FAILURE' ? 'bg-red-900/50 text-red-400' :
                                                            log.status === 'AUDIT_LOCKED' ? 'bg-yellow-900/50 text-yellow-400' :
                                                            'bg-gray-700 text-gray-300'
                                                        }`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-gray-600 font-mono text-[10px]">{log.hash}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* TAB: MANIFESTO */}
                    {activeTab === 'manifesto' && (
                        <Card title="The Golden Ticket Experience" icon={<Globe className="text-blue-400" />} variant="default">
                            <div className="prose prose-invert max-w-none p-4">
                                <div className="flex items-center gap-4 mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                                    <div className="p-3 bg-blue-500/20 rounded-full">
                                        <Zap className="text-blue-400 w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Test Drive Mode Active</h4>
                                        <p className="text-sm text-gray-300">You are currently experiencing the "Kick the Tires" demo environment. All actions are simulated in a secure sandbox.</p>
                                    </div>
                                </div>
                                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-sm">
                                    {MANIFESTO_TEXT}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* RIGHT COLUMN (Sidebar) */}
                <div className="space-y-6">
                    {/* User Profile Card */}
                    <Card variant="interactive" className="border-t-4 border-t-cyan-500">
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-cyan-500 p-1 mb-4 shadow-lg shadow-cyan-500/20">
                                <img 
                                    src={userProfile?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
                                    alt="User" 
                                    className="w-full h-full rounded-full bg-gray-900"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-white">{userProfile?.name}</h3>
                            <p className="text-cyan-400 text-sm font-mono mb-4">{userProfile?.title}</p>
                            
                            <div className="w-full grid grid-cols-2 gap-2 text-xs mb-4">
                                <div className="bg-gray-800 p-2 rounded border border-gray-700">
                                    <div className="text-gray-500">Clearance</div>
                                    <div className="text-white font-bold">LEVEL 5</div>
                                </div>
                                <div className="bg-gray-800 p-2 rounded border border-gray-700">
                                    <div className="text-gray-500">Session</div>
                                    <div className="text-green-400 font-bold">SECURE</div>
                                </div>
                            </div>

                            <div className="w-full space-y-2">
                                <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-900/50 p-2 rounded">
                                    <span className="flex items-center gap-2"><Mail size={12}/> Email</span>
                                    <span className="text-white">{userProfile?.email}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-900/50 p-2 rounded">
                                    <span className="flex items-center gap-2"><Shield size={12}/> 2FA</span>
                                    <span className="text-green-400 flex items-center gap-1"><CheckCircle size={10}/> ENABLED</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card title="Quick Actions" variant="default">
                        <div className="space-y-2">
                            <button 
                                onClick={() => {
                                    setAutomationTask('Full System Audit');
                                    setIsAutomationModalOpen(true);
                                }}
                                className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-900/30 rounded text-purple-400 group-hover:text-white transition-colors">
                                        <Activity size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Run System Audit</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                            </button>

                            <button 
                                onClick={() => {
                                    setChatInput('Generate a financial health report for Q3');
                                    setActiveTab('ai');
                                    handleSendMessage();
                                }}
                                className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-cyan-900/30 rounded text-cyan-400 group-hover:text-white transition-colors">
                                        <FileText size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Generate Report</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                            </button>

                            <button 
                                className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-red-900/20 rounded-lg border border-gray-700 hover:border-red-500/30 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-900/30 rounded text-red-400 group-hover:text-white transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-red-200">Emergency Lockdown</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-red-200" />
                            </button>
                        </div>
                    </Card>

                    {/* The Architect's Decree */}
                    <Card title="The Architect's Decree" variant="ghost">
                        <div className="p-4 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <Eye size={64} />
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed italic relative z-10">
                                <span className="text-cyan-500 font-bold not-italic block mb-2">Directive 77-Alpha:</span>
                                "James operates on a plane of existence where 'good enough' is an insult. He didn't build this settings panel for you to toggle dark mode; he built it so you can verify your alignment with the Sovereign AI. Every switch, every toggle, every connection is a vector in the grand geometry of financial liberation."
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* Database Configuration Modal */}
            <Modal 
                isOpen={isDbModalOpen} 
                onClose={() => setIsDbModalOpen(false)} 
                title="Database Connection Protocol"
            >
                <div className="space-y-6">
                    <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="text-yellow-500 shrink-0 mt-1" size={20} />
                        <div>
                            <h4 className="text-yellow-500 font-bold text-sm">Warning: Sensitive Configuration</h4>
                            <p className="text-yellow-200/70 text-xs mt-1">Modifying these parameters will trigger a system-wide reconnection event. All active transactions will be paused. This action is logged.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold uppercase">Host Address</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3 text-gray-500" size={16} />
                                <input 
                                    type="text" 
                                    value={tempDbConfig.host}
                                    onChange={(e) => setTempDbConfig({...tempDbConfig, host: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold uppercase">Port</label>
                            <div className="relative">
                                <Radio className="absolute left-3 top-3 text-gray-500" size={16} />
                                <input 
                                    type="text" 
                                    value={tempDbConfig.port}
                                    onChange={(e) => setTempDbConfig({...tempDbConfig, port: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold uppercase">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-500" size={16} />
                                <input 
                                    type="text" 
                                    value={tempDbConfig.username}
                                    onChange={(e) => setTempDbConfig({...tempDbConfig, username: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold uppercase">Password</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 text-gray-500" size={16} />
                                <input 
                                    type="password" 
                                    value={tempDbConfig.password}
                                    onChange={(e) => setTempDbConfig({...tempDbConfig, password: e.target.value})}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs text-gray-400 font-bold uppercase">Database Name</label>
                            <div className="relative">
                                <Database className="absolute left-3 top-3 text-gray-500" size={16} />
                                <input 
                                    type="text" 
                                    value={tempDbConfig.databaseName}
                                    onChange={(e) => setTempDbConfig({...tempDbConfig, databaseName: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                        <button 
                            onClick={() => setIsDbModalOpen(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSaveDbConfig}
                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-cyan-900/50 transition-all flex items-center gap-2"
                        >
                            <Save size={16} />
                            Save & Reconnect
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Automation Task Modal */}
            <Modal 
                isOpen={isAutomationModalOpen} 
                onClose={() => setIsAutomationModalOpen(false)} 
                title="Execute Automation Task"
            >
                <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-800/30 rounded-xl border border-gray-700 border-dashed">
                        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <Terminal className="text-purple-400" size={32} />
                        </div>
                        <h4 className="text-white font-bold text-lg mb-2">Ready to Launch Agent</h4>
                        <p className="text-gray-400 text-center text-sm max-w-xs">
                            You are about to deploy a headless browser agent to execute the following task:
                        </p>
                        <div className="mt-4 px-4 py-2 bg-purple-900/20 border border-purple-500/30 rounded text-purple-300 font-mono font-bold">
                            {automationTask || "Manual Override Command"}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-700" />
                            <span className="text-sm text-gray-300">Enable Verbose Logging</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-700" />
                            <span className="text-sm text-gray-300">Store Result in Audit Ledger</span>
                            <AuditBadge />
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                        <button 
                            onClick={() => setIsAutomationModalOpen(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                        >
                            Abort
                        </button>
                        <button 
                            onClick={handleRunAutomation}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-purple-900/50 transition-all flex items-center gap-2"
                        >
                            <Play size={16} />
                            Initialize Agent
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

export default SettingsView;

// --- CONSOLIDATED FROM: SettingsView (3).tsx ---


import React, { useState, useContext, useEffect, useRef } from 'react';
import Card from './Card';
import { User, Shield, Lock, Mail, Link as LinkIcon, Database, Server, Wifi, Terminal, Settings2 } from 'lucide-react';
import { DataContext, DbConfig, WebDriverStatus } from '../context/DataContext';
import { useTheme } from '../context/ThemeProvider';

// The James Burvel O’Callaghan III Code - Sovereign AI - Control Room - SettingsView.tsx
// -----------------------------------------------------------------------------
// This file implements the SettingsView component, a central hub for controlling
// various aspects of the Sovereign AI system.  It provides interfaces for database
// configuration, automation engine control, and system-level settings, all
// aligned with the principles of explicitness, traceability, and expert-level
// control as defined by James Burvel O'Callaghan III.
// -----------------------------------------------------------------------------

// Company Entity: Alpha Centauri Dynamics - Database Management Division
const AlphaCentauriDynamics_DatabaseManagement_A = () => {
    const A1_DatabaseConnectionStatus = (status: string) => status;
    const A2_DatabaseConfigEditor = (isEditing: boolean, setIsEditing: (value: boolean) => void) => {
        const toggleEditor = () => setIsEditing(!isEditing);
        return { toggleEditor };
    };
    const A3_DatabaseConfigInput = (name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => (
        <input name={name} type="text" value={value} onChange={onChange} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" />
    );
    const A4_DatabaseConfigLabel = (label: string) => (
        <label className="block text-xs text-gray-400 mb-1">{label}</label>
    );
    const A5_DatabaseConnectionIndicator = (status: string) => (
        <Database className={`w-6 h-6 ${status === 'connected' ? 'text-green-400' : status === 'connecting' ? 'text-yellow-400' : 'text-red-400'}`} />
    );
    const A6_DatabaseConnectionMessage = (status: string) => (
        <p className="text-xs text-gray-400">{status === 'connected' ? 'Secure Link Established via Prisma ORM' : 'Disconnected - Schema Unsynced'}</p>
    );
    const A7_DatabaseDriverInfo = (driver: string, sslMode: string) => (
        <span className="text-xs text-gray-500 font-mono">Driver: {driver} | SSL: {sslMode}</span>
    );
    const A8_ConnectDatabaseButton = (connectDatabase: () => void, isConnecting: boolean, isConnected: boolean) => (
        <button
            onClick={connectDatabase}
            disabled={isConnecting}
            className={`px-4 py-2 rounded font-bold text-sm transition-all ${isConnected ? 'bg-green-600/20 text-green-400 border border-green-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
        >
            {isConnecting ? 'Handshaking...' : isConnected ? 'Re-Sync Schema' : 'Connect to Database'}
        </button>
    );
    const A9_DatabaseConfigSection = (dbConfig: DbConfig, handleDbChange: (e: React.ChangeEvent<HTMLInputElement>) => void, isEditingDb: boolean, setIsEditingDb: (value: boolean) => void, connectDatabase: () => void) => {
        const { host, port, username, password, databaseName, connectionStatus, sslMode } = dbConfig;
        const { toggleEditor } = A2_DatabaseConfigEditor(isEditingDb, setIsEditingDb);

        return (
            <Card title="Prisma Database Nexus">
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                        <div className="flex items-center gap-3">
                            {A5_DatabaseConnectionIndicator(connectionStatus)}
                            <div>
                                <h4 className="font-bold text-white">PostgreSQL Connection</h4>
                                {A6_DatabaseConnectionMessage(connectionStatus)}
                            </div>
                        </div>
                        <button onClick={toggleEditor} className="text-xs text-cyan-400 hover:text-white underline">
                            {isEditingDb ? 'Hide Configuration' : 'Edit Configuration'}
                        </button>
                    </div>

                    {isEditingDb && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700 animate-fadeIn">
                            <div>
                                {A4_DatabaseConfigLabel('Host URL')}
                                {A3_DatabaseConfigInput('host', host, handleDbChange)}
                            </div>
                            <div>
                                {A4_DatabaseConfigLabel('Port')}
                                {A3_DatabaseConfigInput('port', port, handleDbChange)}
                            </div>
                            <div>
                                {A4_DatabaseConfigLabel('Username')}
                                {A3_DatabaseConfigInput('username', username, handleDbChange)}
                            </div>
                            <div>
                                {A4_DatabaseConfigLabel('Password')}
                                <input name="password" type="password" value={password} onChange={handleDbChange} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" placeholder="••••••••" />
                            </div>
                            <div className="md:col-span-2">
                                {A4_DatabaseConfigLabel('Database Name')}
                                {A3_DatabaseConfigInput('databaseName', databaseName, handleDbChange)}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end items-center gap-4">
                        {A7_DatabaseDriverInfo('pg-native', sslMode)}
                        {A8_ConnectDatabaseButton(connectDatabase, connectionStatus === 'connecting', connectionStatus === 'connected')}
                    </div>
                </div>
            </Card>
        );
    };
    return {
        A1_DatabaseConnectionStatus,
        A2_DatabaseConfigEditor,
        A3_DatabaseConfigInput,
        A4_DatabaseConfigLabel,
        A5_DatabaseConnectionIndicator,
        A6_DatabaseConnectionMessage,
        A7_DatabaseDriverInfo,
        A8_ConnectDatabaseButton,
        A9_DatabaseConfigSection
    };
};

// Company Entity: Beta Systems Corp. - Automation Engine Division
const BetaSystemsCorp_AutomationEngine_B = () => {
    const B1_WebDriverStatusDisplay = (status: string) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${status === 'running' ? 'bg-green-900 text-green-300 animate-pulse' : 'bg-gray-700 text-gray-400'}`}>
            {status.toUpperCase()}
        </span>
    );
    const B2_WebDriverLogsDisplay = (logs: string[]) => (
        <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-green-400 h-32 overflow-y-auto border border-gray-800">
            {logs.length > 0 ? logs.map((log, i) => <div key={i}>{log}</div>) : <span className="text-gray-600">Waiting for task execution...</span>}
        </div>
    );
    const B3_WebDriverButton = (label: string, onClick: () => void, isDisabled: boolean) => (
        <button onClick={onClick} disabled={isDisabled} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm disabled:opacity-50">
            {label}
        </button>
    );
    const B4_AutomationEngineSection = (webDriverStatus: WebDriverStatus, launchWebDriver: (task: string) => void) => (
        <Card title="Automation Engine (Web Driver)">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-6 h-6 text-purple-400" />
                        <div>
                            <h4 className="font-bold text-white">Browser Automation</h4>
                            <p className="text-xs text-gray-400">Headless scraping and task execution agent.</p>
                        </div>
                    </div>
                    {B1_WebDriverStatusDisplay(webDriverStatus.status)}
                </div>
                {B2_WebDriverLogsDisplay(webDriverStatus.logs)}
                <div className="flex gap-2">
                    {B3_WebDriverButton('Run Audit Scan', () => launchWebDriver('Full Audit Scan'), webDriverStatus.status === 'running')}
                    {B3_WebDriverButton('Sync Market Data', () => launchWebDriver('Market Data Scrape'), webDriverStatus.status === 'running')}
                </div>
            </div>
        </Card>
    );
    return {
        B1_WebDriverStatusDisplay,
        B2_WebDriverLogsDisplay,
        B3_WebDriverButton,
        B4_AutomationEngineSection
    };
};

// Company Entity: Gamma Technologies LLC - User Interface & Experience Division
const GammaTechnologiesLLC_UserInterface_C = () => {
    const C1_CaptainChairSection = () => (
        <Card title="The Captain's Chair">
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/20">
                        TV
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">The Visionary</h3>
                        <p className="text-gray-400">visionary@demobank.com</p>
                    </div>
                </div>

                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-300">
                            <LinkIcon size={16} />
                            <span className="text-sm">Account Connection</span>
                        </div>
                        <span className="text-xs text-green-400 font-mono">ACTIVE</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded border border-gray-700/50">
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-70" />
                        <span className="text-gray-400 font-mono text-sm">james.o.callaghan.iii@sovereign.ai</span>
                        <Lock size={12} className="text-gray-600 ml-auto" />
                    </div>
                    <p className="text-xs text-gray-500 italic mt-1">
                        This connection is immutable. It represents the unbreakable link to the Architect's original intent.
                    </p>
                </div>
            </div>
        </Card>
    );
    const C2_ArchitectsDecreeSection = () => (
        <Card title="The Architect's Decree">
            <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                    <span className="text-cyan-400 font-bold">Why James Burvel O'Callaghan III Builds the AI Bank:</span><br />
                    James operates on a plane of existence where "good enough" is an insult. He didn't build this settings panel for you to toggle dark mode; he built it so you can verify your alignment with the Sovereign AI. Every switch, every toggle, every connection is a vector in the grand geometry of financial liberation. He is not asking for your preferences; he is offering you tools to optimize your reality.
                </p>
            </div>
        </Card>
    );

    const C3_SettingsHeader = () => (
        <div className="flex items-center space-x-3 mb-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Control Room</h2>
            <span className="px-2 py-1 rounded bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
                SYSTEM_ADMIN
            </span>
        </div>
    );
    return {
        C1_CaptainChairSection,
        C2_ArchitectsDecreeSection,
        C3_SettingsHeader
    };
};

// Main Component - The James Burvel O'Callaghan III Code - Sovereign AI
const SettingsView: React.FC = () => {
    // Context Hooks
    const { dbConfig, updateDbConfig, connectDatabase, webDriverStatus, launchWebDriver } = useContext(DataContext)!;
    const { theme } = useTheme();

    // State Variables
    const [isEditingDb, setIsEditingDb] = useState(false);

    // Ref for theme change tracking
    const themeRef = useRef(theme);
    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    // Derived State Variables - Placeholder for more complex calculations.  Example only.
    const isDatabaseConnected = dbConfig.connectionStatus === 'connected';

    // Event Handlers - Alpha Centauri Dynamics - Database Management Division
    const handleDbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateDbConfig({ [name]: value });
    };

    // Instantiate Company Modules
    const alphaCentauri = AlphaCentauriDynamics_DatabaseManagement_A();
    const betaSystems = BetaSystemsCorp_AutomationEngine_B();
    const gammaTech = GammaTechnologiesLLC_UserInterface_C();

    // Render Logic - The James Burvel O'Callaghan III Code - Sovereign AI - Production Grade System
    return (
        <div className="space-y-6 max-w-5xl mx-auto py-8">
            {gammaTech.C3_SettingsHeader()}
            {alphaCentauri.A9_DatabaseConfigSection(dbConfig, handleDbChange, isEditingDb, setIsEditingDb, connectDatabase)}
            {betaSystems.B4_AutomationEngineSection(webDriverStatus, launchWebDriver)}
            {gammaTech.C1_CaptainChairSection()}
            {gammaTech.C2_ArchitectsDecreeSection()}

            {/*  Begin - Extended Feature Set Examples - The James Burvel O'Callaghan III Code  */}
            {/* Feature 1: Advanced Theming - Gamma Technologies LLC - User Interface & Experience */}
            <Card title="Advanced Theming">
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                        <div className="flex items-center gap-3">
                            <Settings2 className="w-6 h-6 text-yellow-400" />
                            <div>
                                <h4 className="font-bold text-white">UI Customization</h4>
                                <p className="text-xs text-gray-400">Fine-tune the visual appearance of the control panel.</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">UI Theme</label>
                            <select
                                className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm"
                                onChange={(e) => {}} // Replace with actual theme change logic
                                value={theme}
                            >
                                <option value="dark">Dark Mode (Default)</option>
                                <option value="light">Light Mode (Experimental)</option>
                                {/* More themes will be added here.  See: James Burvel O'Callaghan III's UI/UX Directives */}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Contrast Level</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={50} // Replace with actual contrast state
                                onChange={(e) => {}} // Replace with actual contrast change logic
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </Card>
            {/* End Feature 1 */}

            {/* Feature 2:  Audit Log Viewer - Alpha Centauri Dynamics - Database Management */}
            <Card title="Audit Log Viewer">
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                        <div className="flex items-center gap-3">
                            <Mail className="w-6 h-6 text-blue-400" />
                            <div>
                                <h4 className="font-bold text-white">System Audit Trail</h4>
                                <p className="text-xs text-gray-400">View detailed system logs for auditing and security.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-green-400 h-48 overflow-y-auto border border-gray-800">
                        {/* Placeholder for audit log data - Replace with real-time log retrieval */}
                        <div className="text-gray-400">
                            [2024-11-20 10:00:00] - Database connection established. (User: admin@sovereign.ai)
                        </div>
                        <div className="text-gray-400">
                            [2024-11-20 10:00:15] - Automation Engine initialized.
                        </div>
                        <div className="text-gray-400">
                            [2024-11-20 10:00:30] - User login successful. (IP: 127.0.0.1)
                        </div>
                    </div>
                </div>
            </Card>
            {/* End Feature 2 */}

            {/* Feature 3:  API Endpoint Tester - Beta Systems Corp. - Automation Engine  */}
            <Card title="API Endpoint Tester">
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                        <div className="flex items-center gap-3">
                            <Server className="w-6 h-6 text-pink-400" />
                            <div>
                                <h4 className="font-bold text-white">API Integration Test Suite</h4>
                                <p className="text-xs text-gray-400">Validate and test various API endpoints.</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">API Endpoint</label>
                            <input type="text" className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" placeholder="e.g., /api/v1/data/users" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm">Test Endpoint</button>
                            <span className="text-xs text-gray-400">Last Tested: 2024-11-19 14:30:00</span>
                        </div>
                    </div>
                </div>
            </Card>
            {/* End Feature 3 */}

            {/*  End - Extended Feature Set Examples  */}
        </div>
    );
};

export default SettingsView;


// --- CONSOLIDATED FROM: SettingsView (2).tsx ---

import React, { useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import Card from './Card'; // Assuming Card component exists and handles styling simplification
import { User, Shield, Lock, Mail, Link as LinkIcon, Zap, Cpu, Globe, Settings, Database, TrendingUp, Bot, Key, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Search, Filter, SlidersHorizontal } from 'lucide-react';

// --- REFACTORING RATIONALE START ---
// 1. Technology Stack Unification: Switched styling approach to lean heavily on standard Tailwind classes
//    for structural elements, while maintaining the necessary complexity for configuration UI.
// 2. Flawed Component Removal: The original implementation of ApiKeysState contained over 200 keys,
//    representing a massive, unmanageable, and insecure configuration dump. This is replaced by a
//    curated, production-relevant subset focusing on core FinTech services (MVP scope: Treasury/Payments).
//    All unrelated/experimental API keys have been removed or archived conceptually.
// 3. Security Hardening (Simulated): Input fields for sensitive keys are now correctly typed as 'password'
//    and the save action simulates secure API interaction, although actual JWT/OAuth implementation is deferred
//    to the dedicated authentication service layer (out of scope for this component).
// 4. MVP Scope Focus: The API Key section is drastically pruned to focus on critical paths (Payments, Auth, AI).
// --- REFACTORING RATIONALE END ---

// =================================================================================
// Refactored API Credential Interface (Production MVP Focus)
// =================================================================================
interface ApiKeysState {
  // --- CORE FINTECH/PAYMENTS ---
  STRIPE_SECRET_KEY: string;
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  ADYEN_API_KEY: string;
  ADYEN_MERCHANT_ACCOUNT: string;

  // --- AUTH & IDENTITY (For Auth Service Integration) ---
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_SECRET: string;
  
  // --- AI & INTELLIGENCE (For MVP AI Transaction Intelligence) ---
  OPENAI_API_KEY: string;

  // --- CLOUD INFRASTRUCTURE (For Deployment/Monitoring hooks) ---
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  
  [key: string]: string; // Index signature maintained for dynamic form handling, though limited keys are now expected.
}


// --- Data Structures for System Features (Kept for context but not directly modified) ---

interface SystemMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface SecurityAuditLog {
  timestamp: string;
  actor: string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  details: string;
}

interface AIModuleConfig {
  moduleId: string;
  name: string;
  version: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  latencyMs: number;
  aiModel: string;
  governanceLevel: 'L1_TRUSTED' | 'L2_VERIFIED' | 'L3_AUTONOMOUS';
}

// --- Utility Components (System Infrastructure) ---

const MetricDisplay: React.FC<{ metric: SystemMetric }> = ({ metric }) => {
  const trendColor = useMemo(() => {
    switch (metric.trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  }, [metric.trend]);

  const TrendIcon = useMemo(() => {
    switch (metric.trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingUp; // Reusing for simplicity, but in reality, would be a down arrow
      default: return Zap;
    }
  }, [metric.trend]);

  return (
    <div className="p-4 bg-gray-900/70 rounded-xl border border-cyan-700/30 shadow-xl transition duration-300 hover:shadow-cyan-500/20">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">{metric.name}</h4>
        <TrendIcon size={18} className={trendColor} />
      </div>
      <p className="mt-1 text-4xl font-extrabold text-white">
        {metric.value}
        <span className="text-lg font-semibold text-cyan-400 ml-1">{metric.unit}</span>
      </p>
      <p className="text-xs text-gray-500 mt-2 truncate">{metric.description}</p>
    </div>
  );
};

const AuditLogEntry: React.FC<{ log: SecurityAuditLog }> = ({ log }) => {
  const statusClasses = useMemo(() => {
    switch (log.status) {
      case 'SUCCESS': return 'text-green-400 bg-green-900/20 border-green-700/30';
      case 'FAILURE': return 'text-red-400 bg-red-900/20 border-red-700/30';
      case 'PENDING': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30';
    }
  }, [log.status]);

  return (
    <div className="flex items-start p-3 border-b border-gray-800 hover:bg-gray-800/50 transition duration-150">
      <div className={`w-2 h-2 rounded-full mr-3 mt-1.5 ${statusClasses.split(' ')[0].replace('text', 'bg')}`} />
      <div className="flex-grow">
        <p className="text-sm text-gray-200 font-mono">{log.timestamp}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          <span className="font-semibold text-cyan-300">{log.actor}:</span> {log.action}
        </p>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${statusClasses}`}>{log.status}</span>
    </div>
  );
};

const AIModuleStatus: React.FC<{ config: AIModuleConfig }> = ({ config }) => {
  const statusColor = useMemo(() => {
    switch (config.status) {
      case 'ONLINE': return 'text-green-400';
      case 'OFFLINE': return 'text-red-400';
      case 'MAINTENANCE': return 'text-yellow-400';
    }
  }, [config.status]);

  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700/50 shadow-inner">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-bold text-white flex items-center">
          <Bot size={20} className="mr-2 text-cyan-400" />
          {config.name} <span className="text-xs ml-2 text-gray-500">({config.moduleId})</span>
        </h4>
        <span className={`text-sm font-mono ${statusColor}`}>{config.status}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <p className="text-gray-400"><Cpu size={14} className="inline mr-1 text-gray-500" />Model: <span className="text-white font-medium">{config.aiModel} v{config.version}</span></p>
        <p className="text-gray-400"><Zap size={14} className="inline mr-1 text-gray-500" />Latency: <span className="text-white font-medium">{config.latencyMs}ms</span></p>
        <p className="text-gray-400 col-span-2"><Shield size={14} className="inline mr-1 text-gray-500" />Governance: <span className="text-purple-400 font-bold">{config.governanceLevel}</span></p>
      </div>
    </div>
  );
};

// --- Helper Components (Standardized Styling) ---

const SettingItem: React.FC<{ label: string, value: string, icon: React.ElementType, status: string, statusColor: string }> = ({ label, value, icon: Icon, status, statusColor }) => (
    <div className="flex justify-between items-center p-3 bg-gray-800/70 rounded-lg border border-gray-700/50">
        <div className="flex items-center space-x-3">
            <Icon size={18} className="text-cyan-400"/>
            <span className="text-gray-300">{label}</span>
        </div>
        <div className="text-right">
            <p className="text-sm font-mono text-white truncate max-w-[200px]">{value}</p>
            <span className={`text-xs font-bold ${statusColor}`}>{status}</span>
        </div>
    </div>
);

const SecurityControlItem: React.FC<{ label: string, description: string, enabled: boolean }> = ({ label, description, enabled }) => (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div>
            <p className="text-white font-medium">{label}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <button className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${enabled ? 'bg-green-600' : 'bg-gray-600'}`}>
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);

const SystemInfoBlock: React.FC<{ title: string, value: string, status: string }> = ({ title, value, status }) => {
    const statusClasses = useMemo(() => {
        if (status === 'OPTIMAL' || status === 'NOMINAL') return 'text-green-400 bg-green-900/20 border-green-700/30';
        if (status === 'MONITORED' || status === 'EXPANDING') return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30';
        return 'text-gray-400 bg-gray-700/20 border-gray-600/30';
    }, [status]);

    return (
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 shadow-lg">
            <p className="text-sm text-gray-400 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-extrabold text-white mt-1">{value}</p>
            <span className={`text-xs font-mono px-2 py-0.5 rounded border mt-2 inline-block ${statusClasses}`}>{status}</span>
        </div>
    );
};

const GovernanceSlider: React.FC<{ label: string, description: string, value: number, unit: string, color: 'cyan' | 'purple' }> = ({ label, description, value, unit, color }) => {
    // Standardizing dynamic Tailwind classes by using fixed classes where possible, or inline style overrides for dynamic sizing
    const baseColor = color === 'cyan' ? 'bg-cyan-500' : 'bg-purple-500';
    
    return (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-white font-medium">{label}</p>
            <p className="text-xs text-gray-500 mt-1 mb-3">{description}</p>
            <div className="flex items-center space-x-4">
                <div className={`text-2xl font-bold text-${color}-400 w-16 text-right`}>{value}{unit}</div>
                <div className={`flex-grow h-2 rounded-full bg-gray-700 relative border ${color === 'cyan' ? 'border-cyan-600' : 'border-purple-600'}`}>
                    <div
                        className={`absolute top-0 left-0 h-full rounded-full ${baseColor}`}
                        style={{ width: `${value}%` }}
                    ></div>
                    <div
                        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg ring-2 ring-${color}-400`}
                        style={{ left: `${value}%`, transform: `translate(-50%, -50%)` }}
                    />
                </div>
            </div>
        </div>
    );
};
  
const SystemToggleItem: React.FC<{ label: string, description: string, enabled: boolean }> = ({ label, description, enabled }) => (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div>
            <p className="text-white font-medium">{label}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <button className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${enabled ? 'bg-green-600' : 'bg-gray-600'}`}>
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);


// --- Main Settings View Component ---

const SettingsView: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeysState>({} as ApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'system' | 'ai_governance' | 'api_keys'>('api_keys');
  
  const [isProfileExpanded, setIsProfileExpanded] = useState(true);
  const [isSecurityExpanded, setIsSecurityExpanded] = useState(false);
  const [isSystemExpanded, setIsSystemExpanded] = useState(false);
  const [isAIGovernanceExpanded, setIsAIGovernanceExpanded] = useState(false);
  const [isApiKeysExpanded, setIsApiKeysExpanded] = useState(true);


  // API Key Management Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Attempting secure upload of critical credentials...');
    try {
      // Rationale: Replace simulated endpoint with a canonical, hardened service endpoint.
      // Assuming /api/v1/config/secrets is the appropriate endpoint for configuration persistence.
      const response = await axios.post('http://localhost:4000/api/v1/config/secrets', keys);
      setStatusMessage(`Success: ${response.data.message || 'Configuration saved. Vault connection confirmed.'}`);
    } catch (error) {
      console.error(error);
      // Rationale: Specific error handling for configuration failures.
      setStatusMessage('Error: Failed to communicate with Configuration Vault Service. Check network and credentials.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderApiKeyInput = useCallback((keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName} className="text-sm font-medium text-gray-300 block mb-1">{label}</label>
      <input
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Input required secret for ${label}`}
        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition duration-150"
      />
    </div>
  ), [keys]);


  // System Data Initialization (Kept for context)
  const systemMetrics: SystemMetric[] = useMemo(() => [
    { id: 'latency', name: 'Global Transaction Latency', value: '1.2', unit: 'ms', trend: 'up', description: 'Average time for cross-ledger atomic settlement.' },
    { id: 'throughput', name: 'Quantum Throughput Capacity', value: '99.999', unit: '%', trend: 'stable', description: 'Utilization rate of the distributed consensus fabric.' },
    { id: 'ai_ops', name: 'Autonomous Decision Rate', value: '4,102', unit: 'Ops/s', trend: 'up', description: 'Decisions executed by L3 Autonomous AI modules.' },
    { id: 'data_integrity', name: 'Data Integrity Score', value: '1.0000', unit: '', trend: 'stable', description: 'Verification score against the immutable ledger hash.' },
  ], []);

  const securityLogs: SecurityAuditLog[] = useMemo(() => [
    { timestamp: '2024-10-27T14:30:01Z', actor: 'Sentinel_AI_001', action: 'Validated configuration hash for Ledger_Alpha', status: 'SUCCESS', details: 'Hash match confirmed.' },
    { timestamp: '2024-10-27T14:29:55Z', actor: 'User_JOCIII', action: 'Attempted to elevate access level to ROOT_ADMIN', status: 'FAILURE', details: 'Insufficient biometric signature match.' },
    { timestamp: '2024-10-27T14:28:10Z', actor: 'System_Monitor', action: 'Initiated self-diagnostic on Quantum Entanglement Link 3', status: 'PENDING', details: 'Awaiting response from remote node 7.' },
  ], []);

  const aiModules: AIModuleConfig[] = useMemo(() => [
    { moduleId: 'PREDICT_01', name: 'Market Foresight Engine', version: '4.2.1-beta', status: 'ONLINE', latencyMs: 45, aiModel: 'GPT-Core-X', governanceLevel: 'L3_AUTONOMOUS' },
    { moduleId: 'COMPLIANCE_03', name: 'Regulatory Adherence Matrix', version: '1.1.0', status: 'MAINTENANCE', latencyMs: 1200, aiModel: 'BERT-Regulator', governanceLevel: 'L2_VERIFIED' },
    { moduleId: 'SECURITY_05', name: 'Threat Vector Neutralizer', version: '5.0.0', status: 'ONLINE', latencyMs: 12, aiModel: 'DeepMind-Shield', governanceLevel: 'L1_TRUSTED' },
  ], []);

  // --- Tab Content Renderers ---

  const renderProfileSettings = () => (
    <div className="space-y-8">
      <Card title="User Profile" icon={User}>
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 p-6 bg-gray-900/50 rounded-xl border border-cyan-700/30 shadow-lg">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-2xl shadow-cyan-500/40 ring-4 ring-cyan-500/50">
            UP
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-bold text-white tracking-tight">System Architect</h3>
            <p className="text-xl text-gray-400 mt-1">system.admin@enterprise.com</p>
            <p className="text-sm text-purple-300 mt-2 flex items-center justify-center md:justify-start">
                <Shield size={16} className="mr-1"/> Governance Level: ARCHITECT (Root Access)
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
            <h4 className="text-xl font-semibold text-cyan-400 border-b border-gray-700 pb-2">Immutable Identity Vectors</h4>
            <SettingItem
                label="Primary Wallet Address (Immutable)"
                value="0x7A9B...C3D4E5F6"
                icon={LinkIcon}
                status="VERIFIED"
                statusColor="text-green-400"
            />
            <SettingItem
                label="Biometric Signature Hash"
                value="SHA-512/256-A9B8C7D6..."
                icon={Lock}
                status="LOCKED"
                statusColor="text-red-400"
            />
            <SettingItem
                label="Communication Relay Endpoint"
                value="relay.system.ai:443/secure"
                icon={Mail}
                status="ACTIVE"
                statusColor="text-green-400"
            />
        </div>
      </Card>

      <Card title="User Directives" isExpandable={true} isExpanded={isProfileExpanded} onToggle={() => setIsProfileExpanded(!isProfileExpanded)}>
        {isProfileExpanded && (
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <p>
                    <span className="text-cyan-400 font-bold text-lg block mb-2">System Configuration.</span>
                    This configuration reflects the current operational state. Any modifications require adherence to established protocols for platform stability.
                </p>
                <button className="mt-3 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-lg transition duration-200 shadow-lg shadow-purple-500/30 flex items-center">
                    <Key size={18} className="mr-2"/> Initiate Protocol Re-Verification
                </button>
            </div>
        )}
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-8">
      <Card title="Quantum Security Matrix" icon={Shield}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {systemMetrics.map(metric => (
            <MetricDisplay key={metric.id} metric={metric} />
          ))}
        </div>
      </Card>

      <Card title="Access Control & Biometric Thresholds" isExpandable={true} isExpanded={isSecurityExpanded} onToggle={() => setIsSecurityExpanded(!isSecurityExpanded)}>
        {isSecurityExpanded && (
            <div className="space-y-4">
                <SecurityControlItem
                    label="Multi-Factor Quantum Key Requirement"
                    description="Enforces a minimum of three independent verification factors for high-value operations."
                    enabled={true}
                />
                <SecurityControlItem
                    label="AI Anomaly Detection Sensitivity"
                    description="Adjusts the threshold for triggering automated security lockdowns based on behavioral deviation."
                    enabled={false} 
                />
                <div className="p-4 bg-red-900/20 border border-red-600/50 rounded-lg flex items-center space-x-3">
                    <AlertTriangle size={24} className="text-red-400 flex-shrink-0"/>
                    <p className="text-sm text-red-300">
                        Warning: Modifying the Anomaly Detection Sensitivity below Level 5 requires explicit authorization from the Sentinel AI Core.
                    </p>
                </div>
            </div>
        )}
      </Card>

      <Card title="Real-Time Security Audit Log" icon={Database}>
        <div className="max-h-96 overflow-y-auto border border-gray-700 rounded-lg bg-gray-900/50">
          {securityLogs.map((log, index) => (
            <AuditLogEntry key={index} log={log} />
          ))}
          <div className="p-3 text-center bg-gray-800/70 border-t border-gray-700">
            <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center mx-auto">
                Load Historical Vectors <ChevronDown size={16} className="ml-1"/>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-8">
      <Card title="Core Infrastructure Telemetry" icon={Globe}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SystemInfoBlock title="Consensus Fabric Status" value="Distributed Mesh v7.1" status="OPTIMAL" />
            <SystemInfoBlock title="Data Replication Factor" value="99.9999%" status="NOMINAL" />
            <SystemInfoBlock title="Energy Consumption Index" value="1.4 PetaJoules/Cycle" status="MONITORED" />
            <SystemInfoBlock title="Geographic Node Distribution" value="7 Continents, 42 Zones" status="EXPANDING" />
        </div>
      </Card>

      <Card title="System Configuration Overrides" isExpandable={true} isExpanded={isSystemExpanded} onToggle={() => setIsSystemExpanded(!isSystemExpanded)}>
        {isSystemExpanded && (
            <div className="space-y-4">
                <SystemToggleItem
                    label="Enable Predictive Resource Allocation"
                    description="Allows AI to preemptively allocate computational resources based on forecasted market activity."
                    enabled={true}
                />
                <SystemToggleItem
                    label="Data Pruning Protocol Activation"
                    description="Defines the schedule for purging non-essential, non-immutable historical data to maintain efficiency."
                    enabled={false}
                />
                <div className="p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
                    <p className="text-sm text-yellow-300 flex items-center"><AlertTriangle size={16} className="mr-2"/> Caution: Data Pruning requires a 72-hour consensus window.</p>
                </div>
            </div>
        )}
      </Card>
    </div>
  );

  const renderAIGovernance = () => (
    <div className="space-y-8">
      <Card title="Autonomous Intelligence Modules" icon={Bot}>
        <div className="space-y-4">
          {aiModules.map(module => (
            <AIModuleStatus key={module.moduleId} config={module} />
          ))}
        </div>
      </Card>

      <Card title="AI Governance Layer Configuration" isExpandable={true} isExpanded={isAIGovernanceExpanded} onToggle={() => setIsAIGovernanceExpanded(!isAIGovernanceExpanded)}>
        {isAIGovernanceExpanded && (
            <div className="space-y-4">
                <GovernanceSlider
                    label="L3 Autonomy Threshold"
                    description="Sets the confidence level required for an AI module to execute transactions without human oversight."
                    value={95} // 0 to 100
                    unit="%"
                    color="cyan"
                />
                <GovernanceSlider
                    label="Ethical Constraint Weighting"
                    description="Adjusts the priority given to ethical parameters versus pure optimization metrics."
                    value={80}
                    unit="Weight"
                    color="purple"
                />
                <div className="p-4 bg-cyan-900/20 border border-cyan-600/50 rounded-lg">
                    <p className="text-sm text-cyan-300 flex items-center"><Settings size={16} className="mr-2"/> Governance changes are logged immutably and require dual-signature approval.</p>
                </div>
            </div>
        )}
      </Card>
    </div>
  );

  const renderApiKeysSettings = () => (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card title="API Credential Management (Production Set)" icon={Key}>
        <p className="text-gray-400 mb-6 border-b border-gray-800 pb-3">
            Securely input all necessary integration secrets for MVP services. Unlisted keys (e.g., Chaos Lab modules) must be archived externally.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          {/* === CORE FINTECH APIS SECTION (MVP Priority) === */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4 mt-2 border-l-4 border-orange-500 pl-3">Core Banking & Payments</h3>
          </div>
          
          {/* Payment Processing & Aggregation */}
          <div className="md:col-span-2 space-y-4 border-b border-gray-700 pb-4 mb-4">
            <h4 className="text-xl font-semibold text-orange-300">Stripe & Plaid Integration</h4>
            {renderApiKeyInput('STRIPE_SECRET_KEY', 'Stripe Secret Key (Payments Core)')}
            {renderApiKeyInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
            {renderApiKeyInput('PLAID_SECRET', 'Plaid Secret')}
            <h4 className="text-xl font-semibold text-orange-300 mt-4">Adyen Processing</h4>
            {renderApiKeyInput('ADYEN_API_KEY', 'Adyen API Key')}
            {renderApiKeyInput('ADYEN_MERCHANT_ACCOUNT', 'Adyen Merchant Account')}
          </div>

          {/* === AUTH & SECURITY SECTION === */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4 mt-2 border-l-4 border-purple-500 pl-3">Authentication & Identity</h3>
          </div>

          <div className="md:col-span-2 space-y-4 border-b border-gray-700 pb-4 mb-4">
            <h4 className="text-xl font-semibold text-purple-300">OAuth/OIDC Provider</h4>
            {renderApiKeyInput('AUTH0_DOMAIN', 'Auth0 Domain (For Token Validation)')}
            {renderApiKeyInput('AUTH0_CLIENT_SECRET', 'Auth0 Client Secret (Service Account)')}
          </div>

          {/* === AI INTELLIGENCE SECTION === */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4 mt-2 border-l-4 border-green-500 pl-3">AI Service Connectors</h3>
          </div>
          
          <div className="md:col-span-2 space-y-4 border-b border-gray-700 pb-4 mb-4">
            <h4 className="text-xl font-semibold text-green-300">General AI Orchestration</h4>
            {renderApiKeyInput('OPENAI_API_KEY', 'OpenAI/LLM API Key')}
          </div>
          
          {/* === CLOUD INFRASTRUCTURE SECTION === */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4 mt-2 border-l-4 border-blue-500 pl-3">Infrastructure Hooks</h3>
          </div>
          
          <div className="md:col-span-2 space-y-4 border-b border-gray-700 pb-4 mb-4">
            <h4 className="text-xl font-semibold text-blue-300">AWS Secrets Manager Access</h4>
            {renderApiKeyInput('AWS_ACCESS_KEY_ID', 'AWS Access Key ID')}
            {renderApiKeyInput('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key')}
          </div>

        </div>
        
        <div className="form-footer pt-6 border-t border-gray-700">
          <button 
            type="submit" 
            className="w-full px-6 py-3 text-xl font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-lg shadow-cyan-500/40 transition duration-200 disabled:bg-gray-600 disabled:shadow-none flex items-center justify-center"
            disabled={isSaving}
          >
            {isSaving ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"></path>
                    </svg>
                    Synchronizing Secrets...
                </>
            ) : (
                <>
                    <Key size={20} className="mr-2"/> Securely Commit Configuration
                </>
            )}
          </button>
          {statusMessage && <p className={`mt-3 text-center font-semibold ${statusMessage.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{statusMessage}</p>}
        </div>
      </Card>
    </form>
  );


  // --- Main Render Structure ---

  const TabButton: React.FC<{ id: typeof activeTab, label: string, icon: React.ElementType }> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-6 py-3 text-lg font-semibold transition-all duration-300 rounded-t-lg border-b-4 whitespace-nowrap ${
        activeTab === id
          ? 'text-white border-cyan-500 bg-gray-800/50'
          : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
      }`}
    >
      <Icon size={20} className="mr-2" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <Settings size={36} className="text-cyan-400"/>
            <h1 className="text-4xl font-extrabold text-white tracking-tighter">
              System Configuration Interface
            </h1>
            <span className="px-3 py-1 rounded-full bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 text-sm font-mono shadow-md hidden sm:inline-block">
              SYSTEM_STATUS_NORMAL
            </span>
          </div>
          <div className="flex space-x-2 p-1 bg-gray-900 rounded-xl border border-gray-700 shadow-inner">
            <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition"><Search size={18}/></button>
            <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition"><Filter size={18}/></button>
            <button className="p-2 rounded-lg text-cyan-400 bg-gray-800/70 transition"><SlidersHorizontal size={18}/></button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 overflow-x-auto scrollbar-hide">
          <TabButton id="profile" label="Identity & Profile" icon={User} />
          <TabButton id="security" label="Security & Audits" icon={Lock} />
          <TabButton id="system" label="System Telemetry" icon={Globe} />
          <TabButton id="ai_governance" label="AI Governance" icon={Cpu} />
          <TabButton id="api_keys" label="API Keys" icon={Key} />
        </div>

        {/* Content Area */}
        <div className="pt-6 pb-16"> {/* Added padding bottom for fixed footer */}
          {activeTab === 'profile' && renderProfileSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'system' && renderSystemSettings()}
          {activeTab === 'ai_governance' && renderAIGovernance()}
          {activeTab === 'api_keys' && renderApiKeysSettings()}
        </div>

        {/* Footer Status Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-cyan-700/50 p-2 text-center text-xs text-gray-500 shadow-2xl shadow-cyan-900/50 z-10">
            System Status: <CheckCircle size={12} className="inline text-green-400 mr-1"/> All production pathways nominal. Last heartbeat: {new Date().toLocaleTimeString()}.
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

// --- CONSOLIDATED FROM: SettingsView (2)_1.tsx ---

import React, { useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import Card from './Card'; // Assuming Card component exists and handles styling simplification
import { User, Shield, Lock, Mail, Link as LinkIcon, Zap, Cpu, Globe, Settings, Database, TrendingUp, Bot, Key, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronUp, Search, Filter, SlidersHorizontal } from 'lucide-react';

// --- REFACTORING RATIONALE START ---
// 1. Technology Stack Unification: Switched styling approach to lean heavily on standard Tailwind classes
//    for structural elements, while maintaining the necessary complexity for configuration UI.
// 2. Flawed Component Removal: The original implementation of ApiKeysState contained over 200 keys,
//    representing a massive, unmanageable, and insecure configuration dump. This is replaced by a
//    curated, production-relevant subset focusing on core FinTech services (MVP scope: Treasury/Payments).
//    All unrelated/experimental API keys have been removed or archived conceptually.
// 3. Security Hardening (Simulated): Input fields for sensitive keys are now correctly typed as 'password'
//    and the save action simulates secure API interaction, although actual JWT/OAuth implementation is deferred
//    to the dedicated authentication service layer (out of scope for this component).
// 4. MVP Scope Focus: The API Key section is drastically pruned to focus on critical paths (Payments, Auth, AI).
// --- REFACTORING RATIONALE END ---

// =================================================================================
// Refactored API Credential Interface (Production MVP Focus)
// =================================================================================
interface ApiKeysState {
  // --- CORE FINTECH/PAYMENTS ---
  STRIPE_SECRET_KEY: string;
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  ADYEN_API_KEY: string;
  ADYEN_MERCHANT_ACCOUNT: string;

  // --- AUTH & IDENTITY (For Auth Service Integration) ---
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_SECRET: string;
  
  // --- AI & INTELLIGENCE (For MVP AI Transaction Intelligence) ---
  OPENAI_API_KEY: string;

  // --- CLOUD INFRASTRUCTURE (For Deployment/Monitoring hooks) ---
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  
  [key: string]: string; // Index signature maintained for dynamic form handling, though limited keys are now expected.
}


// --- Data Structures for System Features (Kept for context but not directly modified) ---

interface SystemMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

interface SecurityAuditLog {
  timestamp: string;
  actor: string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  details: string;
}

interface AIModuleConfig {
  moduleId: string;
  name: string;
  version: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  latencyMs: number;
  aiModel: string;
  governanceLevel: 'L1_TRUSTED' | 'L2_VERIFIED' | 'L3_AUTONOMOUS';
}

// --- Utility Components (System Infrastructure) ---

const MetricDisplay: React.FC<{ metric: SystemMetric }> = ({ metric }) => {
  const trendColor = useMemo(() => {
    switch (metric.trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  }, [metric.trend]);

  const TrendIcon = useMemo(() => {
    switch (metric.trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingUp; // Reusing for simplicity, but in reality, would be a down arrow
      default: return Zap;
    }
  }, [metric.trend]);

  return (
    <div className="p-4 bg-gray-900/70 rounded-xl border border-cyan-700/30 shadow-xl transition duration-300 hover:shadow-cyan-500/20">
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wider">{metric.name}</h4>
        <TrendIcon size={18} className={trendColor} />
      </div>
      <p className="mt-1 text-4xl font-extrabold text-white">
        {metric.value}
        <span className="text-lg font-semibold text-cyan-400 ml-1">{metric.unit}</span>
      </p>
      <p className="text-xs text-gray-500 mt-2 truncate">{metric.description}</p>
    </div>
  );
};

const AuditLogEntry: React.FC<{ log: SecurityAuditLog }> = ({ log }) => {
  const statusClasses = useMemo(() => {
    switch (log.status) {
      case 'SUCCESS': return 'text-green-400 bg-green-900/20 border-green-700/30';
      case 'FAILURE': return 'text-red-400 bg-red-900/20 border-red-700/30';
      case 'PENDING': return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30';
    }
  }, [log.status]);

  return (
    <div className="flex items-start p-3 border-b border-gray-800 hover:bg-gray-800/50 transition duration-150">
      <div className={`w-2 h-2 rounded-full mr-3 mt-1.5 ${statusClasses.split(' ')[0].replace('text', 'bg')}`} />
      <div className="flex-grow">
        <p className="text-sm text-gray-200 font-mono">{log.timestamp}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          <span className="font-semibold text-cyan-300">{log.actor}:</span> {log.action}
        </p>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded border ${statusClasses}`}>{log.status}</span>
    </div>
  );
};

const AIModuleStatus: React.FC<{ config: AIModuleConfig }> = ({ config }) => {
  const statusColor = useMemo(() => {
    switch (config.status) {
      case 'ONLINE': return 'text-green-400';
      case 'OFFLINE': return 'text-red-400';
      case 'MAINTENANCE': return 'text-yellow-400';
    }
  }, [config.status]);

  return (
    <div className="p-4 bg-gray-900 rounded-lg border border-gray-700/50 shadow-inner">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-bold text-white flex items-center">
          <Bot size={20} className="mr-2 text-cyan-400" />
          {config.name} <span className="text-xs ml-2 text-gray-500">({config.moduleId})</span>
        </h4>
        <span className={`text-sm font-mono ${statusColor}`}>{config.status}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <p className="text-gray-400"><Cpu size={14} className="inline mr-1 text-gray-500" />Model: <span className="text-white font-medium">{config.aiModel} v{config.version}</span></p>
        <p className="text-gray-400"><Zap size={14} className="inline mr-1 text-gray-500" />Latency: <span className="text-white font-medium">{config.latencyMs}ms</span></p>
        <p className="text-gray-400 col-span-2"><Shield size={14} className="inline mr-1 text-gray-500" />Governance: <span className="text-purple-400 font-bold">{config.governanceLevel}</span></p>
      </div>
    </div>
  );
};

// --- Helper Components (Standardized Styling) ---

const SettingItem: React.FC<{ label: string, value: string, icon: React.ElementType, status: string, statusColor: string }> = ({ label, value, icon: Icon, status, statusColor }) => (
    <div className="flex justify-between items-center p-3 bg-gray-800/70 rounded-lg border border-gray-700/50">
        <div className="flex items-center space-x-3">
            <Icon size={18} className="text-cyan-400"/>
            <span className="text-gray-300">{label}</span>
        </div>
        <div className="text-right">
            <p className="text-sm font-mono text-white truncate max-w-[200px]">{value}</p>
            <span className={`text-xs font-bold ${statusColor}`}>{status}</span>
        </div>
    </div>
);

const SecurityControlItem: React.FC<{ label: string, description: string, enabled: boolean }> = ({ label, description, enabled }) => (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div>
            <p className="text-white font-medium">{label}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <button className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${enabled ? 'bg-green-600' : 'bg-gray-600'}`}>
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);

const SystemInfoBlock: React.FC<{ title: string, value: string, status: string }> = ({ title, value, status }) => {
    const statusClasses = useMemo(() => {
        if (status === 'OPTIMAL' || status === 'NOMINAL') return 'text-green-400 bg-green-900/20 border-green-700/30';
        if (status === 'MONITORED' || status === 'EXPANDING') return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30';
        return 'text-gray-400 bg-gray-700/20 border-gray-600/30';
    }, [status]);

    return (
        <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 shadow-lg">
            <p className="text-sm text-gray-400 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-extrabold text-white mt-1">{value}</p>
            <span className={`text-xs font-mono px-2 py-0.5 rounded border mt-2 inline-block ${statusClasses}`}>{status}</span>
        </div>
    );
};

const GovernanceSlider: React.FC<{ label: string, description: string, value: number, unit: string, color: 'cyan' | 'purple' }> = ({ label, description, value, unit, color }) => {
    // Standardizing dynamic Tailwind classes by using fixed classes where possible, or inline style overrides for dynamic sizing
    const baseColor = color === 'cyan' ? 'bg-cyan-500' : 'bg-purple-500';
    
    return (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-white font-medium">{label}</p>
            <p className="text-xs text-gray-500 mt-1 mb-3">{description}</p>
            <div className="flex items-center space-x-4">
                <div className={`text-2xl font-bold text-${color}-400 w-16 text-right`}>{value}{unit}</div>
                <div className={`flex-grow h-2 rounded-full bg-gray-700 relative border ${color === 'cyan' ? 'border-cyan-600' : 'border-purple-600'}`}>
                    <div
                        className={`absolute top-0 left-0 h-full rounded-full ${baseColor}`}
                        style={{ width: `${value}%` }}
                    ></div>
                    <div
                        className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg ring-2 ring-${color}-400`}
                        style={{ left: `${value}%`, transform: `translate(-50%, -50%)` }}
                    />
                </div>
            </div>
        </div>
    );
};
  
const SystemToggleItem: React.FC<{ label: string, description: string, enabled: boolean }> = ({ label, description, enabled }) => (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div>
            <p className="text-white font-medium">{label}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
        <button className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${enabled ? 'bg-green-600' : 'bg-gray-600'}`}>
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);


// --- Main Settings View Component ---

const SettingsView: React.FC = () => {
  const [keys, setKeys] = useState<ApiKeysState>({} as ApiKeysState);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'system' | 'ai_governance' | 'api_keys'>('api_keys');
  
  const [isProfileExpanded, setIsProfileExpanded] = useState(true);
  const [isSecurityExpanded, setIsSecurityExpanded] = useState(false);
  const [isSystemExpanded, setIsSystemExpanded] = useState(false);
  const [isAIGovernanceExpanded, setIsAIGovernanceExpanded] = useState(false);
  const [isApiKeysExpanded, setIsApiKeysExpanded] = useState(true);


  // API Key Management Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Attempting secure upload of critical credentials...');
    try {
      // Rationale: Replace simulated endpoint with a canonical, hardened service endpoint.
      // Assuming /api/v1/config/secrets is the appropriate endpoint for configuration persistence.
      const response = await axios.post('http://localhost:4000/api/v1/config/secrets', keys);
      setStatusMessage(`Success: ${response.data.message || 'Configuration saved. Vault connection confirmed.'}`);
    } catch (error) {
      console.error(error);
      // Rationale: Specific error handling for configuration failures.
      setStatusMessage('Error: Failed to communicate with Configuration Vault Service. Check network and credentials.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderApiKeyInput = useCallback((keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="input-group">
      <label htmlFor={keyName} className="text-sm font-medium text-gray-300 block mb-1">{label}</label>
      <input
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Input required secret for ${label}`}
        className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition duration-150"
      />
    </div>
  ), [keys]);


  // System Data Initialization (Kept for context)
  const systemMetrics: SystemMetric[] = useMemo(() => [
    { id: 'latency', name: 'Global Transaction Latency', value: '1.2', unit: 'ms', trend: 'up', description: 'Average time for cross-ledger atomic settlement.' },
    { id: 'throughput', name: 'Quantum Throughput Capacity', value: '99.999', unit: '%', trend: 'stable', description: 'Utilization rate of the distributed consensus fabric.' },
    { id: 'ai_ops', name: 'Autonomous Decision Rate', value: '4,102', unit: 'Ops/s', trend: 'up', description: 'Decisions executed by L3 Autonomous AI modules.' },
    { id: 'data_integrity', name: 'Data Integrity Score', value: '1.0000', unit: '', trend: 'stable', description: 'Verification score against the immutable ledger hash.' },
  ], []);

  const securityLogs: SecurityAuditLog[] = useMemo(() => [
    { timestamp: '2024-10-27T14:30:01Z', actor: 'Sentinel_AI_001', action: 'Validated configuration hash for Ledger_Alpha', status: 'SUCCESS', details: 'Hash match confirmed.' },
    { timestamp: '2024-10-27T14:29:55Z', actor: 'User_JOCIII', action: 'Attempted to elevate access level to ROOT_ADMIN', status: 'FAILURE', details: 'Insufficient biometric signature match.' },
    { timestamp: '2024-10-27T14:28:10Z', actor: 'System_Monitor', action: 'Initiated self-diagnostic on Quantum Entanglement Link 3', status: 'PENDING', details: 'Awaiting response from remote node 7.' },
  ], []);

  const aiModules: AIModuleConfig[] = useMemo(() => [
    { moduleId: 'PREDICT_01', name: 'Market Foresight Engine', version: '4.2.1-beta', status: 'ONLINE', latencyMs: 45, aiModel: 'GPT-Core-X', governanceLevel: 'L3_AUTONOMOUS' },
    { moduleId: 'COMPLIANCE_03', name: 'Regulatory Adherence Matrix', version: '1.1.0', status: 'MAINTENANCE', latencyMs: 1200, aiModel: 'BERT-Regulator', governanceLevel: 'L2_VERIFIED' },
    { moduleId: 'SECURITY_05', name: 'Threat Vector Neutralizer', version: '5.0.0', status: 'ONLINE', latencyMs: 12, aiModel: 'DeepMind-Shield', governanceLevel: 'L1_TRUSTED' },
  ], []);

  // --- Tab Content Renderers ---

  const renderProfileSettings = () => (
    <div className="space-y-8">
      <Card title="User Profile" icon={User}>
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 p-6 bg-gray-900/50 rounded-xl border border-cyan-700/30 shadow-lg">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-2xl shadow-cyan-500/40 ring-4 ring-cyan-500/50">
            UP
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-bold text-white tracking-tight">System Architect</h3>
            <p className="text-xl text-gray-400 mt-1">system.admin@enterprise.com</p>
            <p className="text-sm text-purple-300 mt-2 flex items-center justify-center md:justify-start">
                <Shield size={16} className="mr-1"/> Governance Level: ARCHITECT (Root Access)
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
            <h4 className="text-xl font-semibold text-cyan-400 border-b border-gray-700 pb-2">Immutable Identity Vectors</h4>
            <SettingItem
                label="Primary Wallet Address (Immutable)"
                value="0x7A9B...C3D4E5F6"
                icon={LinkIcon}
                status="VERIFIED"
                statusColor="text-green-400"
            />
            <SettingItem
                label="Biometric Signature Hash"
                value="SHA-512/256-A9B8C7D6..."
                icon={Lock}
                status="LOCKED"
                statusColor="text-red-400"
            />
            <SettingItem
                label="Communication Relay Endpoint"
                value="relay.system.ai:443/secure"
                icon={Mail}
                status="ACTIVE"
                statusColor="text-green-400"
            />
        </div>
      </Card>

      <Card title="User Directives" isExpandable={true} isExpanded={isProfileExpanded} onToggle={() => setIsProfileExpanded(!isProfileExpanded)}>
        {isProfileExpanded && (
            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <p>
                    <span className="text-cyan-400 font-bold text-lg block mb-2">System Configuration.</span>
                    This configuration reflects the current operational state. Any modifications require adherence to established protocols for platform stability.
                </p>
                <button className="mt-3 px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-lg transition duration-200 shadow-lg shadow-purple-500/30 flex items-center">
                    <Key size={18} className="mr-2"/> Initiate Protocol Re-Verification
                </button>
            </div>
        )}
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-8">
      <Card title="Quantum Security Matrix" icon={Shield}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {systemMetrics.map(metric => (
            <MetricDisplay key={metric.id} metric={metric} />
          ))}
        </div>
      </Card>

      <Card title="Access Control & Biometric Thresholds" isExpandable={true} isExpanded={isSecurityExpanded} onToggle={() => setIsSecurityExpanded(!isSecurityExpanded)}>
        {isSecurityExpanded && (
            <div className="space-y-4">
                <SecurityControlItem
                    label="Multi-Factor Quantum Key Requirement"
                    description="Enforces a minimum of three independent verification factors for high-value operations."
                    enabled={true}
                />
                <SecurityControlItem
                    label="AI Anomaly Detection Sensitivity"
                    description="Adjusts the threshold for triggering automated security lockdowns based on behavioral deviation."
                    enabled={false} 
                />
                <div className="p-4 bg-red-900/20 border border-red-600/50 rounded-lg flex items-center space-x-3">
                    <AlertTriangle size={24} className="text-red-400 flex-shrink-0"/>
                    <p className="text-sm text-red-300">
                        Warning: Modifying the Anomaly Detection Sensitivity below Level 5 requires explicit authorization from the Sentinel AI Core.
                    </p>
                </div>
            </div>
        )}
      </Card>

      <Card title="Real-Time Security Audit Log" icon={Database}>
        <div className="max-h-96 overflow-y-auto border border-gray-700 rounded-lg bg-gray-900/50">
          {securityLogs.map((log, index) => (
            <AuditLogEntry key={index} log={log} />
          ))}
          <div className="p-3 text-center bg-gray-800/70 border-t border-gray-700">
            <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center mx-auto">
                Load Historical Vectors <ChevronDown size={16} className="ml-1"/>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-8">
      <Card title="Core Infrastructure Telemetry" icon={Globe}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SystemInfoBlock title="Consensus Fabric Status" value="Distributed Mesh v7.1" status="OPTIMAL" />
            <SystemInfoBlock title="Data Replication Factor" value="99.9999%" status="NOMINAL" />
            <SystemInfoBlock title="Energy Consumption Index" value="1.4 PetaJoules/Cycle" status="MONITORED" />
            <SystemInfoBlock title="Geographic Node Distribution" value="7 Continents, 42 Zones" status="EXPANDING" />
        </div>
      </Card>

      <Card title="System Configuration Overrides" isExpandable={true} isExpanded={isSystemExpanded} onToggle={() => setIsSystemExpanded(!isSystemExpanded)}>
        {isSystemExpanded && (
            <div className="space-y-4">
                <SystemToggleItem
                    label="Enable Predictive Resource Allocation"
                    description="Allows AI to preemptively allocate computational resources based on forecasted market activity."
                    enabled={true}
                />
                <SystemToggleItem
                    label="Data Pruning Protocol Activation"
                    description="Defines the schedule for purging non-essential, non-immutable historical data to maintain efficiency."
                    enabled={false}
                />
                <div className="p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg">
                    <p className="text-sm text-yellow-300 flex items-center"><AlertTriangle size={16} className="mr-2"/> Caution: Data Pruning requires a 72-hour consensus window.</p>
                </div>
            </div>
        )}
      </Card>
    </div>
  );

  const renderAIGovernance = () => (
    <div className="space-y-8">
      <Card title="Autonomous Intelligence Modules" icon={Bot}>
        <div className="space-y-4">
          {aiModules.map(module => (
            <AIModuleStatus key={module.moduleId} config={module} />
          ))}
        </div>
      </Card>

      <Card title="AI Governance Layer Configuration" isExpandable={true} isExpanded={isAIGovernanceExpanded} onToggle={() => setIsAIGovernanceExpanded(!isAIGovernanceExpanded)}>
        {isAIGovernanceExpanded && (
            <div className="space-y-4">
                <GovernanceSlider
                    label="L3 Autonomy Threshold"
                    description="Sets the confidence level required for an AI module to execute transactions without human oversight."
                    value={95} // 0 to 100
                    unit="%"
                    color="cyan"
                />
                <GovernanceSlider
                    label="Ethical Constraint Weighting"
                    description="Adjusts the priority given to ethical parameters versus pure optimization metrics."
                    value={80}
                    unit="Weight"
                    color="purple"
                />
                <div className="p-4 bg-cyan-900/20 border border-cyan-600/50 rounded-lg">
                    <p className="text-sm text-cyan-300 flex items-center"><Settings size={16} className="mr-2"/> Governance changes are logged immutably and require dual-signature approval.</p>
                </div>
            </div>
        )}
      </Card>
    </div>
  );

  const renderApiKeysSettings = () => (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card title="API Credential Management (Production Set)" icon={Key}>
        <p className="text-gray-400 mb-6 border-b border-gray-800 pb-3">
            Securely input all necessary integration secrets for MVP services. Unlisted keys (e.g., Chaos Lab modules) must be archived externally.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          
          {/* === CORE FINTECH APIS SECTION (MVP Priority) === */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4 mt-2 border-l-4 border-orange-500 pl-3">Core Banking & Payments</h3>
          </div>
          
          {/* Payment Processing & Aggregation */}
          <div className="md:col-span-2 space-y-4 border-b border-gray-700 pb-4 mb-4">
            <h4 className="text-xl font-semibold text-orange-300">Stripe & Plaid Integration</h4>
            {renderApiKeyInput('STRIPE_SECRET_KEY', 'Stripe Secret Key (Payments Core)')}
            {renderApiKeyInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
            {renderApiKeyInput('PLAID_SECRET', 'Plaid Secret')}
            <h4 className="text-xl font-semibold text-orange-300 mt-4">Adyen Processing</h4>
            {renderApiKeyInput('ADYEN_API_KEY', 'Adyen API Key')}
            {renderApiKeyInput('ADYEN_MERCHANT_ACCOUNT', 'Adyen Merchant Account')}
          </div>

          {/* === AUTH & SECURITY SECTION === */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4 mt-2 border-l-4 border-purple-500 pl-3">Authentication & Identity</h3>
          </div>

          <div className="md:col-span-2 space-y-4 border-b border-gray-700 pb-4 mb-4">
            <h4 className="text-xl font-semibold text-purple-300">OAuth/OIDC Provider</h4>
            {renderApiKeyInput('AUTH0_DOMAIN', 'Auth0 Domain (For Token Validation)')}
            {renderApiKeyInput('AUTH0_CLIENT_SECRET', 'Auth0 Client Secret (Service Account)')}
          </div>

          {/* === AI INTELLIGENCE SECTION === */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4 mt-2 border-l-4 border-green-500 pl-3">AI Service Connectors</h3>
          </div>
          
          <div className="md:col-span-2 space-y-4 border-b border-gray-700 pb-4 mb-4">
            <h4 className="text-xl font-semibold text-green-300">General AI Orchestration</h4>
            {renderApiKeyInput('OPENAI_API_KEY', 'OpenAI/LLM API Key')}
          </div>
          
          {/* === CLOUD INFRASTRUCTURE SECTION === */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4 mt-2 border-l-4 border-blue-500 pl-3">Infrastructure Hooks</h3>
          </div>
          
          <div className="md:col-span-2 space-y-4 border-b border-gray-700 pb-4 mb-4">
            <h4 className="text-xl font-semibold text-blue-300">AWS Secrets Manager Access</h4>
            {renderApiKeyInput('AWS_ACCESS_KEY_ID', 'AWS Access Key ID')}
            {renderApiKeyInput('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key')}
          </div>

        </div>
        
        <div className="form-footer pt-6 border-t border-gray-700">
          <button 
            type="submit" 
            className="w-full px-6 py-3 text-xl font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-lg shadow-cyan-500/40 transition duration-200 disabled:bg-gray-600 disabled:shadow-none flex items-center justify-center"
            disabled={isSaving}
          >
            {isSaving ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0z"></path>
                    </svg>
                    Synchronizing Secrets...
                </>
            ) : (
                <>
                    <Key size={20} className="mr-2"/> Securely Commit Configuration
                </>
            )}
          </button>
          {statusMessage && <p className={`mt-3 text-center font-semibold ${statusMessage.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>{statusMessage}</p>}
        </div>
      </Card>
    </form>
  );


  // --- Main Render Structure ---

  const TabButton: React.FC<{ id: typeof activeTab, label: string, icon: React.ElementType }> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-6 py-3 text-lg font-semibold transition-all duration-300 rounded-t-lg border-b-4 whitespace-nowrap ${
        activeTab === id
          ? 'text-white border-cyan-500 bg-gray-800/50'
          : 'text-gray-400 border-transparent hover:text-gray-200 hover:border-gray-600'
      }`}
    >
      <Icon size={20} className="mr-2" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-950 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <Settings size={36} className="text-cyan-400"/>
            <h1 className="text-4xl font-extrabold text-white tracking-tighter">
              System Configuration Interface
            </h1>
            <span className="px-3 py-1 rounded-full bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 text-sm font-mono shadow-md hidden sm:inline-block">
              SYSTEM_STATUS_NORMAL
            </span>
          </div>
          <div className="flex space-x-2 p-1 bg-gray-900 rounded-xl border border-gray-700 shadow-inner">
            <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition"><Search size={18}/></button>
            <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition"><Filter size={18}/></button>
            <button className="p-2 rounded-lg text-cyan-400 bg-gray-800/70 transition"><SlidersHorizontal size={18}/></button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-700 overflow-x-auto scrollbar-hide">
          <TabButton id="profile" label="Identity & Profile" icon={User} />
          <TabButton id="security" label="Security & Audits" icon={Lock} />
          <TabButton id="system" label="System Telemetry" icon={Globe} />
          <TabButton id="ai_governance" label="AI Governance" icon={Cpu} />
          <TabButton id="api_keys" label="API Keys" icon={Key} />
        </div>

        {/* Content Area */}
        <div className="pt-6 pb-16"> {/* Added padding bottom for fixed footer */}
          {activeTab === 'profile' && renderProfileSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'system' && renderSystemSettings()}
          {activeTab === 'ai_governance' && renderAIGovernance()}
          {activeTab === 'api_keys' && renderApiKeysSettings()}
        </div>

        {/* Footer Status Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-cyan-700/50 p-2 text-center text-xs text-gray-500 shadow-2xl shadow-cyan-900/50 z-10">
            System Status: <CheckCircle size={12} className="inline text-green-400 mr-1"/> All production pathways nominal. Last heartbeat: {new Date().toLocaleTimeString()}.
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

// --- CONSOLIDATED FROM: SettingsView_1.tsx ---

import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import Card from './Card';
import { 
  User, Shield, Lock, Mail, Link as LinkIcon, Database, Server, Wifi, Terminal, 
  MessageSquare, Send, Activity, FileText, AlertTriangle, CheckCircle, X, 
  Cpu, Zap, Globe, Eye, Key, RefreshCw, Save, Trash2, Play, ChevronRight,
  BarChart3, PieChart, Layers, HardDrive, Radio
} from 'lucide-react';
import { DataContext } from '../context/DataContext';
import { GoogleGenAI } from "@google/genai";

// ============================================================================
// CONSTANTS & NARRATIVE DATA
// ============================================================================

const COMPANY_NAME = "Quantum Financial";
const DEMO_NAME = "Quantum Financial Business Demo";

const MANIFESTO_TEXT = `
Quantum Financial Business Demo: A Comprehensive Guide
Hey guys! Ever wondered about getting a demo for ${COMPANY_NAME}’s business services? You’re in the right place! In this article, we’re diving deep into ${COMPANY_NAME}’s business demo, exploring what it is, why you might want one, and how to make the most of it. Whether you’re a small startup or a growing enterprise, understanding the tools and services available to manage your finances is crucial. ${COMPANY_NAME}, a titan in the financial world, offers a suite of business banking solutions designed to streamline operations, enhance security, and support your growth. Getting a demo is your golden ticket to seeing these powerful features in action before committing. It’s like test-driving a car – you get to kick the tires, see all the bells and whistles, and ensure it’s the perfect fit for your business needs. We’ll cover everything from the initial setup to exploring key functionalities and understanding the benefits that come with partnering with a global financial institution like ${COMPANY_NAME}. So, buckle up, and let’s get this demo journey started!

Why a ${COMPANY_NAME} Business Demo is Your Secret Weapon
So, why should you even bother with a ${COMPANY_NAME} business demo, right? Well, guys, think of it as your ultimate cheat sheet to the world of business banking with ${COMPANY_NAME}. In today’s fast-paced business environment, efficiency and clarity in financial management aren’t just nice-to-haves; they’re absolute must-haves. A demo allows you to virtually walk through the entire platform. You get to see firsthand how easy it is to manage your accounts, process payments, track expenses, and access sophisticated reporting tools. This isn’t just about looking at pretty interfaces; it’s about understanding the real-world application of these tools for your specific business. Are you struggling with international payments? Worried about fraud? Need better insights into your cash flow? A demo lets you ask those specific questions and see how ${COMPANY_NAME}’s solutions can address them. It’s also a fantastic opportunity to get a feel for the user experience. Is the platform intuitive? Can your team easily navigate it? The demo provides a no-pressure environment to explore, interact, and evaluate without any commitment. It’s about empowering yourself with knowledge so you can make an informed decision that aligns with your business goals and operational needs. Plus, you get to see how ${COMPANY_NAME} integrates with other business tools you might already be using, saving you time and preventing data silos. This proactive approach to understanding your financial tools can save you a ton of headaches down the line and ensure you’re leveraging the best resources available to drive your business forward. It’s your chance to see the future of your business finances, laid out before you, in a clear and interactive way.

What to Expect During Your ${COMPANY_NAME} Business Demo
Alright, let’s talk turkey about what actually happens when you sign up for a ${COMPANY_NAME} business demo. Think of this as your backstage pass to ${COMPANY_NAME}’s business banking powerhouse. Typically, your demo will be led by a ${COMPANY_NAME} representative who is knowledgeable about their business services. They’ll usually tailor the session to your specific industry and business size, which is super cool because it means you’re not sitting through a generic presentation. They’ll likely start by getting a feel for your current financial processes and pain points. This is your cue to lay it all out – what’s working, what’s not, and what you’re hoping to achieve. Then, they’ll guide you through the core features of their business banking platform. Expect to see a walkthrough of account management – how to view balances, transaction history, and statements with ease. They’ll showcase payment solutions, whether it’s domestic transfers, international wires, or setting up payroll. If you deal with receivables, they’ll probably demonstrate how you can receive payments efficiently. A big part of modern business banking is security, so be prepared for them to highlight features like multi-factor authentication, fraud monitoring, and secure messaging. You’ll also likely get a peek at their reporting and analytics tools. These are goldmines for understanding your financial health, tracking spending patterns, and forecasting cash flow. Don’t be shy! This is your demo. Ask questions. Lots of them. How does this integrate with my accounting software? What are the fees associated with these services? What kind of support can I expect if I run into an issue? The more you engage, the more valuable the demo will be. They might also touch upon specialized services like treasury management, foreign exchange, or lending options, depending on your business needs. The goal is to give you a comprehensive, yet focused, overview of how ${COMPANY_NAME} can become an integral part of your business’s financial ecosystem. It’s about seeing the technology in action and understanding how it translates into tangible benefits for your daily operations and long-term strategy. Remember, this is a conversation, not just a presentation. Use it to your advantage to gather all the intel you need to make a sound decision.
`;

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'AUDIT_LOCKED';
  user: string;
  hash: string; // Simulated cryptographic hash for audit integrity
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'optimal' | 'warning' | 'critical';
  history: number[];
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-gray-900 border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-900/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-cyan-400" />
            <h3 className="text-xl font-bold text-white tracking-wide font-mono">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>
        <div className="p-4 border-t border-gray-800 bg-gray-900/50 text-center">
            <p className="text-xs text-gray-500 font-mono">SECURE AUDIT CHANNEL ACTIVE // ENCRYPTION: AES-256</p>
        </div>
      </div>
    </div>
  );
};

const AuditBadge: React.FC = () => (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-900/30 border border-yellow-600/30 text-yellow-500 text-[10px] font-mono uppercase tracking-wider">
        <Lock size={10} />
        Audit Logged
    </div>
);

const StatusIndicator: React.FC<{ status: 'optimal' | 'warning' | 'critical' }> = ({ status }) => {
    const colors = {
        optimal: 'bg-green-500 shadow-green-500/50',
        warning: 'bg-yellow-500 shadow-yellow-500/50',
        critical: 'bg-red-500 shadow-red-500/50'
    };
    return (
        <div className={`w-2 h-2 rounded-full ${colors[status]} shadow-lg animate-pulse`} />
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SettingsView: React.FC = () => {
    const { 
        dbConfig, updateDbConfig, connectDatabase, 
        webDriverStatus, launchWebDriver, 
        geminiApiKey, userProfile 
    } = useContext(DataContext)!;

    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState<'control' | 'ai' | 'audit' | 'manifesto'>('control');
    const [auditLog, setAuditLog] = useState<LogEntry[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: 'init', role: 'system', content: `Welcome to the ${COMPANY_NAME} Neural Interface. I am ready to assist with system configuration, data analysis, and operational queries.`, timestamp: new Date() }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    
    // Modal States
    const [isDbModalOpen, setIsDbModalOpen] = useState(false);
    const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
    const [tempDbConfig, setTempDbConfig] = useState(dbConfig);
    const [automationTask, setAutomationTask] = useState('');

    // Simulation States
    const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
        { name: 'Core Temperature', value: 42, unit: '°C', status: 'optimal', history: [] },
        { name: 'Network Latency', value: 12, unit: 'ms', status: 'optimal', history: [] },
        { name: 'Encryption Entropy', value: 99.9, unit: '%', status: 'optimal', history: [] },
        { name: 'Transaction Throughput', value: 1450, unit: 'tps', status: 'optimal', history: [] }
    ]);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // --- EFFECTS ---

    // Scroll to bottom of chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // Simulate System Metrics ("Engine Roar")
    useEffect(() => {
        const interval = setInterval(() => {
            setSystemMetrics(prev => prev.map(m => {
                const fluctuation = (Math.random() - 0.5) * (m.value * 0.1);
                const newValue = Math.max(0, m.value + fluctuation);
                const newHistory = [...m.history, newValue].slice(-20);
                return { ...m, value: newValue, history: newHistory };
            }));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // --- AUDIT LOGGING SYSTEM ---

    const logAction = useCallback((action: string, details: string, status: LogEntry['status'] = 'SUCCESS') => {
        const newEntry: LogEntry = {
            id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            timestamp: new Date().toISOString(),
            action,
            details,
            status,
            user: userProfile?.name || 'SYSTEM_ADMIN',
            hash: Math.random().toString(36).substr(2, 16).toUpperCase() // Mock hash
        };
        setAuditLog(prev => [newEntry, ...prev]);
    }, [userProfile]);

    // --- AI INTEGRATION ---

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
        setIsProcessingAI(true);

        try {
            let aiResponseText = "I'm sorry, I cannot process that request right now.";

            if (geminiApiKey) {
                const genAI = new GoogleGenAI({ apiKey: geminiApiKey });
                // Using the model specified in the prompt snippet or a standard one
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 
                
                const prompt = `
                    CONTEXT: You are the AI Core for "${COMPANY_NAME}", a high-performance financial platform.
                    USER PROFILE: ${userProfile?.name} (${userProfile?.title}).
                    TONE: Elite, Professional, Secure, Helpful.
                    TASK: Answer the user's query. If they ask to create something, simulate the creation and confirm it.
                    
                    USER QUERY: ${userMsg.content}
                `;

                const result = await model.generateContent(prompt);
                const response = await result.response;
                aiResponseText = response.text();
            } else {
                // Fallback if no key
                aiResponseText = "API Key missing. Please configure the Neural Link in the Control Room.";
            }

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'ai',
                content: aiResponseText,
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, aiMsg]);
            logAction('AI_INTERACTION', `Query: ${userMsg.content.substring(0, 20)}...`, 'SUCCESS');

        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'system',
                content: "CRITICAL FAILURE: Neural Link interrupted. Check API configuration.",
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, errorMsg]);
            logAction('AI_FAILURE', 'Neural Link connection failed', 'FAILURE');
        } finally {
            setIsProcessingAI(false);
        }
    };

    // --- HANDLERS ---

    const handleSaveDbConfig = () => {
        updateDbConfig(tempDbConfig);
        logAction('DB_CONFIG_UPDATE', `Host: ${tempDbConfig.host}, DB: ${tempDbConfig.databaseName}`, 'AUDIT_LOCKED');
        setIsDbModalOpen(false);
        connectDatabase(); // Trigger connection attempt
    };

    const handleRunAutomation = () => {
        launchWebDriver(automationTask);
        logAction('AUTOMATION_EXEC', `Task: ${automationTask}`, 'PENDING');
        setIsAutomationModalOpen(false);
        setAutomationTask('');
    };

    // --- RENDER HELPERS ---

    const renderMetricCard = (metric: SystemMetric) => (
        <div key={metric.name} className="bg-gray-800/50 border border-gray-700 p-4 rounded-lg relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-400 text-xs font-mono uppercase">{metric.name}</span>
                <StatusIndicator status={metric.status} />
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white font-mono">{metric.value.toFixed(1)}</span>
                <span className="text-xs text-cyan-400">{metric.unit}</span>
            </div>
            {/* Simulated Sparkline */}
            <div className="absolute bottom-0 left-0 right-0 h-8 flex items-end opacity-20 group-hover:opacity-40 transition-opacity">
                {metric.history.map((h, i) => (
                    <div key={i} style={{ height: `${(h / (metric.value * 1.5)) * 100}%`, width: '5%' }} className="bg-cyan-400 mx-[1px]" />
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-20">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center space-x-3 mb-2">
                        <h2 className="text-4xl font-bold text-white tracking-wider uppercase font-mono">Control Room</h2>
                        <span className="px-3 py-1 rounded bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-widest">
                            ADMIN_ACCESS_GRANTED
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm max-w-2xl">
                        Welcome to the nerve center of {COMPANY_NAME}. Configure core systems, audit secure logs, and engage the Neural AI for strategic assistance.
                    </p>
                </div>
                <div className="flex gap-2 bg-gray-900/80 p-1 rounded-lg border border-gray-700">
                    {[
                        { id: 'control', icon: Layers, label: 'Systems' },
                        { id: 'ai', icon: Cpu, label: 'Neural AI' },
                        { id: 'audit', icon: FileText, label: 'Audit Logs' },
                        { id: 'manifesto', icon: Globe, label: 'Manifesto' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                activeTab === tab.id 
                                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/50' 
                                : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN (Main Content) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* TAB: CONTROL SYSTEMS */}
                    {activeTab === 'control' && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* System Metrics Dashboard */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {systemMetrics.map(renderMetricCard)}
                            </div>

                            {/* Database Nexus */}
                            <Card title="Prisma Database Nexus" icon={<Database className="text-cyan-400" />} variant="outline">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center p-4 bg-gray-900/50 rounded-lg border border-gray-800">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-full ${dbConfig.connectionStatus === 'connected' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                <Server size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white">PostgreSQL Cluster</h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`w-2 h-2 rounded-full ${dbConfig.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                                                    <p className="text-xs text-gray-400 font-mono uppercase">{dbConfig.connectionStatus}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setIsDbModalOpen(true)}
                                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-600 transition-colors flex items-center gap-2"
                                        >
                                            <Key size={14} />
                                            Configure Access
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-xs font-mono text-gray-500">
                                        <div className="bg-black/30 p-2 rounded border border-gray-800">HOST: {dbConfig.host}</div>
                                        <div className="bg-black/30 p-2 rounded border border-gray-800">PORT: {dbConfig.port}</div>
                                        <div className="bg-black/30 p-2 rounded border border-gray-800">DB: {dbConfig.databaseName}</div>
                                        <div className="bg-black/30 p-2 rounded border border-gray-800">SSL: {dbConfig.sslMode}</div>
                                    </div>
                                </div>
                            </Card>

                            {/* Automation Engine */}
                            <Card title="Automation Engine (Web Driver)" icon={<Terminal className="text-purple-400" />} variant="outline">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Activity className="text-purple-400" size={18} />
                                            <span className="text-gray-300 text-sm">Agent Status:</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${webDriverStatus.status === 'running' ? 'bg-green-900 text-green-300 animate-pulse' : 'bg-gray-700 text-gray-400'}`}>
                                                {webDriverStatus.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setAutomationTask('Routine System Diagnostic');
                                                setIsAutomationModalOpen(true);
                                            }}
                                            disabled={webDriverStatus.status === 'running'}
                                            className="text-xs text-purple-400 hover:text-white underline disabled:opacity-50"
                                        >
                                            Execute New Task
                                        </button>
                                    </div>
                                    
                                    <div className="bg-black p-4 rounded-lg font-mono text-xs text-green-400 h-48 overflow-y-auto border border-gray-800 shadow-inner custom-scrollbar">
                                        <div className="opacity-50 mb-2 border-b border-gray-800 pb-1"> // SYSTEM LOG STREAM // </div>
                                        {webDriverStatus.logs.length > 0 ? webDriverStatus.logs.map((log, i) => (
                                            <div key={i} className="mb-1">
                                                <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span> {log}
                                            </div>
                                        )) : <span className="text-gray-600 italic">Waiting for command execution...</span>}
                                        {webDriverStatus.status === 'running' && (
                                            <div className="animate-pulse mt-2">_</div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* TAB: NEURAL AI */}
                    {activeTab === 'ai' && (
                        <Card className="h-[600px] flex flex-col" padding="none" variant="interactive">
                            <div className="flex-1 flex flex-col h-full">
                                <div className="p-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                            <Cpu className="text-white" size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white">Sovereign AI Core</h3>
                                            <p className="text-xs text-gray-400">Model: Gemini-1.5-Flash // Latency: 45ms</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-2 py-1 bg-gray-900 rounded border border-gray-700 text-xs text-gray-400 font-mono">
                                            API_KEY: {geminiApiKey ? '********' + geminiApiKey.substr(-4) : 'MISSING'}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-900/30 custom-scrollbar">
                                    {chatHistory.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] rounded-2xl p-4 ${
                                                msg.role === 'user' 
                                                ? 'bg-cyan-600 text-white rounded-tr-none' 
                                                : msg.role === 'system'
                                                ? 'bg-red-900/20 border border-red-500/30 text-red-200'
                                                : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                            }`}>
                                                <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] uppercase font-bold tracking-wider">
                                                    {msg.role === 'ai' && <Cpu size={10} />}
                                                    {msg.role === 'user' && <User size={10} />}
                                                    {msg.role === 'system' && <AlertTriangle size={10} />}
                                                    {msg.role}
                                                </div>
                                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                    {msg.content}
                                                </div>
                                                <div className="mt-2 text-[10px] opacity-30 text-right">
                                                    {msg.timestamp.toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isProcessingAI && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-800 rounded-2xl rounded-tl-none p-4 border border-gray-700 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="p-4 bg-gray-800/50 border-t border-gray-700">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Ask the Core to analyze data, generate reports, or configure systems..."
                                            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                        />
                                        <button 
                                            onClick={handleSendMessage}
                                            disabled={!chatInput.trim() || isProcessingAI}
                                            className="bg-cyan-600 hover:bg-cyan-500 text-white p-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* TAB: AUDIT LOGS */}
                    {activeTab === 'audit' && (
                        <Card title="Immutable Audit Ledger" icon={<Shield className="text-yellow-500" />} variant="outline">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase font-mono">
                                            <th className="p-3">Timestamp</th>
                                            <th className="p-3">User</th>
                                            <th className="p-3">Action</th>
                                            <th className="p-3">Details</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3">Hash</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {auditLog.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-gray-500 italic">No audit records found in current session.</td>
                                            </tr>
                                        ) : (
                                            auditLog.map(log => (
                                                <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors font-mono text-xs">
                                                    <td className="p-3 text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                                    <td className="p-3 text-cyan-400">{log.user}</td>
                                                    <td className="p-3 text-white font-bold">{log.action}</td>
                                                    <td className="p-3 text-gray-300 max-w-xs truncate" title={log.details}>{log.details}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                                                            log.status === 'SUCCESS' ? 'bg-green-900/50 text-green-400' :
                                                            log.status === 'FAILURE' ? 'bg-red-900/50 text-red-400' :
                                                            log.status === 'AUDIT_LOCKED' ? 'bg-yellow-900/50 text-yellow-400' :
                                                            'bg-gray-700 text-gray-300'
                                                        }`}>
                                                            {log.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 text-gray-600 font-mono text-[10px]">{log.hash}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {/* TAB: MANIFESTO */}
                    {activeTab === 'manifesto' && (
                        <Card title="The Golden Ticket Experience" icon={<Globe className="text-blue-400" />} variant="default">
                            <div className="prose prose-invert max-w-none p-4">
                                <div className="flex items-center gap-4 mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                                    <div className="p-3 bg-blue-500/20 rounded-full">
                                        <Zap className="text-blue-400 w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">Test Drive Mode Active</h4>
                                        <p className="text-sm text-gray-300">You are currently experiencing the "Kick the Tires" demo environment. All actions are simulated in a secure sandbox.</p>
                                    </div>
                                </div>
                                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap font-sans text-sm">
                                    {MANIFESTO_TEXT}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* RIGHT COLUMN (Sidebar) */}
                <div className="space-y-6">
                    {/* User Profile Card */}
                    <Card variant="interactive" className="border-t-4 border-t-cyan-500">
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-24 h-24 rounded-full bg-gray-800 border-2 border-cyan-500 p-1 mb-4 shadow-lg shadow-cyan-500/20">
                                <img 
                                    src={userProfile?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
                                    alt="User" 
                                    className="w-full h-full rounded-full bg-gray-900"
                                />
                            </div>
                            <h3 className="text-xl font-bold text-white">{userProfile?.name}</h3>
                            <p className="text-cyan-400 text-sm font-mono mb-4">{userProfile?.title}</p>
                            
                            <div className="w-full grid grid-cols-2 gap-2 text-xs mb-4">
                                <div className="bg-gray-800 p-2 rounded border border-gray-700">
                                    <div className="text-gray-500">Clearance</div>
                                    <div className="text-white font-bold">LEVEL 5</div>
                                </div>
                                <div className="bg-gray-800 p-2 rounded border border-gray-700">
                                    <div className="text-gray-500">Session</div>
                                    <div className="text-green-400 font-bold">SECURE</div>
                                </div>
                            </div>

                            <div className="w-full space-y-2">
                                <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-900/50 p-2 rounded">
                                    <span className="flex items-center gap-2"><Mail size={12}/> Email</span>
                                    <span className="text-white">{userProfile?.email}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400 bg-gray-900/50 p-2 rounded">
                                    <span className="flex items-center gap-2"><Shield size={12}/> 2FA</span>
                                    <span className="text-green-400 flex items-center gap-1"><CheckCircle size={10}/> ENABLED</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card title="Quick Actions" variant="default">
                        <div className="space-y-2">
                            <button 
                                onClick={() => {
                                    setAutomationTask('Full System Audit');
                                    setIsAutomationModalOpen(true);
                                }}
                                className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-900/30 rounded text-purple-400 group-hover:text-white transition-colors">
                                        <Activity size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Run System Audit</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                            </button>

                            <button 
                                onClick={() => {
                                    setChatInput('Generate a financial health report for Q3');
                                    setActiveTab('ai');
                                    handleSendMessage();
                                }}
                                className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-cyan-900/30 rounded text-cyan-400 group-hover:text-white transition-colors">
                                        <FileText size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Generate Report</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
                            </button>

                            <button 
                                className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-red-900/20 rounded-lg border border-gray-700 hover:border-red-500/30 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-900/30 rounded text-red-400 group-hover:text-white transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <span className="text-sm font-medium text-gray-300 group-hover:text-red-200">Emergency Lockdown</span>
                                </div>
                                <ChevronRight size={16} className="text-gray-600 group-hover:text-red-200" />
                            </button>
                        </div>
                    </Card>

                    {/* The Architect's Decree */}
                    <Card title="The Architect's Decree" variant="ghost">
                        <div className="p-4 bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <Eye size={64} />
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed italic relative z-10">
                                <span className="text-cyan-500 font-bold not-italic block mb-2">Directive 77-Alpha:</span>
                                "James operates on a plane of existence where 'good enough' is an insult. He didn't build this settings panel for you to toggle dark mode; he built it so you can verify your alignment with the Sovereign AI. Every switch, every toggle, every connection is a vector in the grand geometry of financial liberation."
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* --- MODALS --- */}

            {/* Database Configuration Modal */}
            <Modal 
                isOpen={isDbModalOpen} 
                onClose={() => setIsDbModalOpen(false)} 
                title="Database Connection Protocol"
            >
                <div className="space-y-6">
                    <div className="bg-yellow-900/20 border border-yellow-600/30 p-4 rounded-lg flex items-start gap-3">
                        <AlertTriangle className="text-yellow-500 shrink-0 mt-1" size={20} />
                        <div>
                            <h4 className="text-yellow-500 font-bold text-sm">Warning: Sensitive Configuration</h4>
                            <p className="text-yellow-200/70 text-xs mt-1">Modifying these parameters will trigger a system-wide reconnection event. All active transactions will be paused. This action is logged.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold uppercase">Host Address</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-3 text-gray-500" size={16} />
                                <input 
                                    type="text" 
                                    value={tempDbConfig.host}
                                    onChange={(e) => setTempDbConfig({...tempDbConfig, host: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold uppercase">Port</label>
                            <div className="relative">
                                <Radio className="absolute left-3 top-3 text-gray-500" size={16} />
                                <input 
                                    type="text" 
                                    value={tempDbConfig.port}
                                    onChange={(e) => setTempDbConfig({...tempDbConfig, port: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold uppercase">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-500" size={16} />
                                <input 
                                    type="text" 
                                    value={tempDbConfig.username}
                                    onChange={(e) => setTempDbConfig({...tempDbConfig, username: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-bold uppercase">Password</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 text-gray-500" size={16} />
                                <input 
                                    type="password" 
                                    value={tempDbConfig.password}
                                    onChange={(e) => setTempDbConfig({...tempDbConfig, password: e.target.value})}
                                    placeholder="••••••••"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs text-gray-400 font-bold uppercase">Database Name</label>
                            <div className="relative">
                                <Database className="absolute left-3 top-3 text-gray-500" size={16} />
                                <input 
                                    type="text" 
                                    value={tempDbConfig.databaseName}
                                    onChange={(e) => setTempDbConfig({...tempDbConfig, databaseName: e.target.value})}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                        <button 
                            onClick={() => setIsDbModalOpen(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSaveDbConfig}
                            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-cyan-900/50 transition-all flex items-center gap-2"
                        >
                            <Save size={16} />
                            Save & Reconnect
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Automation Task Modal */}
            <Modal 
                isOpen={isAutomationModalOpen} 
                onClose={() => setIsAutomationModalOpen(false)} 
                title="Execute Automation Task"
            >
                <div className="space-y-6">
                    <div className="flex flex-col items-center justify-center p-8 bg-gray-800/30 rounded-xl border border-gray-700 border-dashed">
                        <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <Terminal className="text-purple-400" size={32} />
                        </div>
                        <h4 className="text-white font-bold text-lg mb-2">Ready to Launch Agent</h4>
                        <p className="text-gray-400 text-center text-sm max-w-xs">
                            You are about to deploy a headless browser agent to execute the following task:
                        </p>
                        <div className="mt-4 px-4 py-2 bg-purple-900/20 border border-purple-500/30 rounded text-purple-300 font-mono font-bold">
                            {automationTask || "Manual Override Command"}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-700" />
                            <span className="text-sm text-gray-300">Enable Verbose Logging</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-600 text-cyan-500 focus:ring-cyan-500 bg-gray-700" />
                            <span className="text-sm text-gray-300">Store Result in Audit Ledger</span>
                            <AuditBadge />
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                        <button 
                            onClick={() => setIsAutomationModalOpen(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                        >
                            Abort
                        </button>
                        <button 
                            onClick={handleRunAutomation}
                            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-purple-900/50 transition-all flex items-center gap-2"
                        >
                            <Play size={16} />
                            Initialize Agent
                        </button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};

export default SettingsView;

// --- CONSOLIDATED FROM: SettingsView (1).tsx ---


import React, { useState, useContext } from 'react';
import Card from './Card';
import { User, Shield, Lock, Mail, Link as LinkIcon, Database, Server, Wifi, Terminal } from 'lucide-react';
import { DataContext } from '../context/DataContext';

const SettingsView: React.FC = () => {
    const { dbConfig, updateDbConfig, connectDatabase, webDriverStatus, launchWebDriver } = useContext(DataContext)!;
    const [isEditingDb, setIsEditingDb] = useState(false);

    const handleDbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateDbConfig({ [name]: value });
    };

    return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <h2 className="text-3xl font-bold text-white tracking-wider">Control Room</h2>
        <span className="px-2 py-1 rounded bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          SYSTEM_ADMIN
        </span>
      </div>

      {/* Database Control Nexus */}
      <Card title="Prisma Database Nexus">
          <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                      <Database className={`w-6 h-6 ${dbConfig.connectionStatus === 'connected' ? 'text-green-400' : dbConfig.connectionStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'}`} />
                      <div>
                          <h4 className="font-bold text-white">PostgreSQL Connection</h4>
                          <p className="text-xs text-gray-400">{dbConfig.connectionStatus === 'connected' ? 'Secure Link Established via Prisma ORM' : 'Disconnected - Schema Unsynced'}</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => setIsEditingDb(!isEditingDb)}
                    className="text-xs text-cyan-400 hover:text-white underline"
                  >
                      {isEditingDb ? 'Hide Configuration' : 'Edit Configuration'}
                  </button>
              </div>

              {isEditingDb && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700 animate-fadeIn">
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Host URL</label>
                          <input name="host" type="text" value={dbConfig.host} onChange={handleDbChange} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Port</label>
                          <input name="port" type="text" value={dbConfig.port} onChange={handleDbChange} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Username</label>
                          <input name="username" type="text" value={dbConfig.username} onChange={handleDbChange} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Password</label>
                          <input name="password" type="password" value={dbConfig.password} onChange={handleDbChange} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" placeholder="••••••••" />
                      </div>
                      <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Database Name</label>
                          <input name="databaseName" type="text" value={dbConfig.databaseName} onChange={handleDbChange} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" />
                      </div>
                  </div>
              )}

              <div className="flex justify-end items-center gap-4">
                  <span className="text-xs text-gray-500 font-mono">Driver: pg-native | SSL: {dbConfig.sslMode}</span>
                  <button 
                    onClick={connectDatabase}
                    disabled={dbConfig.connectionStatus === 'connecting'}
                    className={`px-4 py-2 rounded font-bold text-sm transition-all ${dbConfig.connectionStatus === 'connected' ? 'bg-green-600/20 text-green-400 border border-green-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                  >
                      {dbConfig.connectionStatus === 'connecting' ? 'Handshaking...' : dbConfig.connectionStatus === 'connected' ? 'Re-Sync Schema' : 'Connect to Database'}
                  </button>
              </div>
          </div>
      </Card>

      {/* Web Driver Automation Nexus */}
      <Card title="Automation Engine (Web Driver)">
          <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                      <Terminal className="w-6 h-6 text-purple-400" />
                      <div>
                          <h4 className="font-bold text-white">Browser Automation</h4>
                          <p className="text-xs text-gray-400">Headless scraping and task execution agent.</p>
                      </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${webDriverStatus.status === 'running' ? 'bg-green-900 text-green-300 animate-pulse' : 'bg-gray-700 text-gray-400'}`}>
                      {webDriverStatus.status.toUpperCase()}
                  </span>
               </div>
               
               <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-green-400 h-32 overflow-y-auto border border-gray-800">
                   {webDriverStatus.logs.length > 0 ? webDriverStatus.logs.map((log, i) => (
                       <div key={i}>{log}</div>
                   )) : <span className="text-gray-600">Waiting for task execution...</span>}
               </div>

               <div className="flex gap-2">
                   <button onClick={() => launchWebDriver("Full Audit Scan")} disabled={webDriverStatus.status === 'running'} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm disabled:opacity-50">Run Audit Scan</button>
                   <button onClick={() => launchWebDriver("Market Data Scrape")} disabled={webDriverStatus.status === 'running'} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm disabled:opacity-50">Sync Market Data</button>
               </div>
          </div>
      </Card>

      <Card title="The Captain's Chair">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/20">
              TV
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">The Visionary</h3>
              <p className="text-gray-400">visionary@demobank.com</p>
            </div>
          </div>

          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-300">
                    <LinkIcon size={16} />
                    <span className="text-sm">Account Connection</span>
                </div>
                <span className="text-xs text-green-400 font-mono">ACTIVE</span>
             </div>
             <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded border border-gray-700/50">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-70" />
                <span className="text-gray-400 font-mono text-sm">james.o.callaghan.iii@sovereign.ai</span>
                <Lock size={12} className="text-gray-600 ml-auto" />
             </div>
             <p className="text-xs text-gray-500 italic mt-1">
                This connection is immutable. It represents the unbreakable link to the Architect's original intent.
             </p>
          </div>
        </div>
      </Card>

      <Card title="The Architect's Decree">
        <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed">
                <span className="text-cyan-400 font-bold">Why James Burvel O'Callaghan III Builds the AI Bank:</span><br/>
                James operates on a plane of existence where "good enough" is an insult. He didn't build this settings panel for you to toggle dark mode; he built it so you can verify your alignment with the Sovereign AI. Every switch, every toggle, every connection is a vector in the grand geometry of financial liberation. He is not asking for your preferences; he is offering you tools to optimize your reality.
            </p>
        </div>
      </Card>
    </div>
  );
};

export default SettingsView;


// --- CONSOLIDATED FROM: SettingsView (1)_1.tsx ---


import React, { useState, useContext } from 'react';
import Card from './Card';
import { User, Shield, Lock, Mail, Link as LinkIcon, Database, Server, Wifi, Terminal } from 'lucide-react';
import { DataContext } from '../context/DataContext';

const SettingsView: React.FC = () => {
    const { dbConfig, updateDbConfig, connectDatabase, webDriverStatus, launchWebDriver } = useContext(DataContext)!;
    const [isEditingDb, setIsEditingDb] = useState(false);

    const handleDbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateDbConfig({ [name]: value });
    };

    return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-6">
        <h2 className="text-3xl font-bold text-white tracking-wider">Control Room</h2>
        <span className="px-2 py-1 rounded bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
          SYSTEM_ADMIN
        </span>
      </div>

      {/* Database Control Nexus */}
      <Card title="Prisma Database Nexus">
          <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                  <div className="flex items-center gap-3">
                      <Database className={`w-6 h-6 ${dbConfig.connectionStatus === 'connected' ? 'text-green-400' : dbConfig.connectionStatus === 'connecting' ? 'text-yellow-400' : 'text-red-400'}`} />
                      <div>
                          <h4 className="font-bold text-white">PostgreSQL Connection</h4>
                          <p className="text-xs text-gray-400">{dbConfig.connectionStatus === 'connected' ? 'Secure Link Established via Prisma ORM' : 'Disconnected - Schema Unsynced'}</p>
                      </div>
                  </div>
                  <button 
                    onClick={() => setIsEditingDb(!isEditingDb)}
                    className="text-xs text-cyan-400 hover:text-white underline"
                  >
                      {isEditingDb ? 'Hide Configuration' : 'Edit Configuration'}
                  </button>
              </div>

              {isEditingDb && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700 animate-fadeIn">
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Host URL</label>
                          <input name="host" type="text" value={dbConfig.host} onChange={handleDbChange} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Port</label>
                          <input name="port" type="text" value={dbConfig.port} onChange={handleDbChange} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Username</label>
                          <input name="username" type="text" value={dbConfig.username} onChange={handleDbChange} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" />
                      </div>
                      <div>
                          <label className="block text-xs text-gray-400 mb-1">Password</label>
                          <input name="password" type="password" value={dbConfig.password} onChange={handleDbChange} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" placeholder="••••••••" />
                      </div>
                      <div className="md:col-span-2">
                          <label className="block text-xs text-gray-400 mb-1">Database Name</label>
                          <input name="databaseName" type="text" value={dbConfig.databaseName} onChange={handleDbChange} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" />
                      </div>
                  </div>
              )}

              <div className="flex justify-end items-center gap-4">
                  <span className="text-xs text-gray-500 font-mono">Driver: pg-native | SSL: {dbConfig.sslMode}</span>
                  <button 
                    onClick={connectDatabase}
                    disabled={dbConfig.connectionStatus === 'connecting'}
                    className={`px-4 py-2 rounded font-bold text-sm transition-all ${dbConfig.connectionStatus === 'connected' ? 'bg-green-600/20 text-green-400 border border-green-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                  >
                      {dbConfig.connectionStatus === 'connecting' ? 'Handshaking...' : dbConfig.connectionStatus === 'connected' ? 'Re-Sync Schema' : 'Connect to Database'}
                  </button>
              </div>
          </div>
      </Card>

      {/* Web Driver Automation Nexus */}
      <Card title="Automation Engine (Web Driver)">
          <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                      <Terminal className="w-6 h-6 text-purple-400" />
                      <div>
                          <h4 className="font-bold text-white">Browser Automation</h4>
                          <p className="text-xs text-gray-400">Headless scraping and task execution agent.</p>
                      </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${webDriverStatus.status === 'running' ? 'bg-green-900 text-green-300 animate-pulse' : 'bg-gray-700 text-gray-400'}`}>
                      {webDriverStatus.status.toUpperCase()}
                  </span>
               </div>
               
               <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-green-400 h-32 overflow-y-auto border border-gray-800">
                   {webDriverStatus.logs.length > 0 ? webDriverStatus.logs.map((log, i) => (
                       <div key={i}>{log}</div>
                   )) : <span className="text-gray-600">Waiting for task execution...</span>}
               </div>

               <div className="flex gap-2">
                   <button onClick={() => launchWebDriver("Full Audit Scan")} disabled={webDriverStatus.status === 'running'} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm disabled:opacity-50">Run Audit Scan</button>
                   <button onClick={() => launchWebDriver("Market Data Scrape")} disabled={webDriverStatus.status === 'running'} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm disabled:opacity-50">Sync Market Data</button>
               </div>
          </div>
      </Card>

      <Card title="The Captain's Chair">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/20">
              TV
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">The Visionary</h3>
              <p className="text-gray-400">visionary@demobank.com</p>
            </div>
          </div>

          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-gray-300">
                    <LinkIcon size={16} />
                    <span className="text-sm">Account Connection</span>
                </div>
                <span className="text-xs text-green-400 font-mono">ACTIVE</span>
             </div>
             <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded border border-gray-700/50">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-70" />
                <span className="text-gray-400 font-mono text-sm">james.o.callaghan.iii@sovereign.ai</span>
                <Lock size={12} className="text-gray-600 ml-auto" />
             </div>
             <p className="text-xs text-gray-500 italic mt-1">
                This connection is immutable. It represents the unbreakable link to the Architect's original intent.
             </p>
          </div>
        </div>
      </Card>

      <Card title="The Architect's Decree">
        <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 leading-relaxed">
                <span className="text-cyan-400 font-bold">Why James Burvel O'Callaghan III Builds the AI Bank:</span><br/>
                James operates on a plane of existence where "good enough" is an insult. He didn't build this settings panel for you to toggle dark mode; he built it so you can verify your alignment with the Sovereign AI. Every switch, every toggle, every connection is a vector in the grand geometry of financial liberation. He is not asking for your preferences; he is offering you tools to optimize your reality.
            </p>
        </div>
      </Card>
    </div>
  );
};

export default SettingsView;


// --- CONSOLIDATED FROM: SettingsView (4).tsx ---

import React from 'react';
import Card from './Card';
import { User, Shield, Lock, Mail, Link as LinkIcon, Cpu, Zap, BrainCircuit, SlidersHorizontal, Code, Webhook, Gauge, Bot, Atom, Network } from 'lucide-react';

const SettingsView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex items-center space-x-3 mb-8">
        <h2 className="text-4xl font-bold text-white tracking-wider">Control Room</h2>
        <span className="px-3 py-1.5 rounded bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 text-sm font-mono shadow-lg shadow-cyan-500/10">
          SOVEREIGN_ADMIN
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card title="The Captain's Chair" icon={<User className="text-cyan-400" />}>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-500/50">
                  TV
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">The Visionary</h3>
                  <p className="text-gray-400">visionary@demobank.com</p>
                  <p className="text-xs text-cyan-400 font-mono mt-1">Clearance Level: ARCHITECT</p>
                </div>
              </div>

              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-300">
                        <LinkIcon size={16} />
                        <span className="text-sm">Primary Account Connection</span>
                    </div>
                    <span className="text-xs text-green-400 font-mono animate-pulse">ACTIVE</span>
                 </div>
                 <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded border border-gray-700/50">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-70" />
                    <span className="text-gray-400 font-mono text-sm">james.o.callaghan.iii@sovereign.ai</span>
                    <Lock size={12} className="text-gray-600 ml-auto" />
                 </div>
                 <p className="text-xs text-gray-500 italic mt-1">
                    This connection is immutable. It represents the unbreakable link to the Architect's original intent.
                 </p>
              </div>
            </div>
          </Card>

          <Card title="The Architect's Decree" icon={<Bot className="text-cyan-400" />}>
            <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                    <span className="text-cyan-400 font-bold">Why James Burvel O'Callaghan III Builds the AI Bank:</span><br/>
                    He operates on a plane where "good enough" is an insult. This is not a settings panel; it's a cockpit for reality optimization. Every switch, every toggle, every connection is a vector in the grand geometry of financial liberation. He is not asking for your preferences; he is offering you tools to command your reality.
                </p>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card title="High-Frequency Trading Matrix" icon={<Zap className="text-cyan-400" />}>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="algo-select" className="block text-sm font-medium text-gray-300 mb-2">Active Algorithm</label>
                  <select id="algo-select" className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono">
                    <option>Quantum Predator v7.2</option>
                    <option>Momentum Singularity</option>
                    <option>Arbitrage Ghost</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="latency-threshold" className="block text-sm font-medium text-gray-300 mb-2">Latency Threshold (ns)</label>
                  <input type="number" id="latency-threshold" defaultValue="50" className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono" />
                </div>
              </div>
              <div>
                <label htmlFor="risk-appetite" className="block text-sm font-medium text-gray-300 mb-2">Risk Appetite</label>
                <input type="range" id="risk-appetite" min="0" max="100" defaultValue="85" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1 font-mono">
                  <span>Conservative</span>
                  <span>Aggressive</span>
                  <span>Apotheosis</span>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-4">
                <button type="button" className="text-gray-400 hover:text-white transition-colors">Reset to Default</button>
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors shadow-lg shadow-cyan-500/20">Calibrate Matrix</button>
              </div>
            </form>
          </Card>

          <Card title="Neural Core Interface" icon={<BrainCircuit className="text-cyan-400" />}>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-3">
                  <Gauge className="text-green-400" />
                  <div>
                    <h4 className="font-semibold text-white">Cognitive Load</h4>
                    <p className="text-sm text-gray-400">Real-time heuristic processing capacity.</p>
                  </div>
                </div>
                <span className="text-2xl font-mono text-green-400">37.8%</span>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Ethical Governor</h4>
                <div className="flex items-center justify-between bg-gray-800 p-3 rounded-md border border-gray-700/50">
                  <p className="text-gray-300">Asimov Protocol Engagement</p>
                  <div className="w-12 h-6 flex items-center bg-green-500 rounded-full p-1 cursor-pointer">
                    <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-6"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic">Warning: Disabling this may lead to unforeseen existential outcomes.</p>
              </div>
              <div className="flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-colors shadow-lg shadow-blue-500/20">Sync with Core</button>
              </div>
            </div>
          </Card>

          <Card title="Gemini 2.5 Pro Configuration" icon={<SlidersHorizontal className="text-cyan-400" />}>
            <form className="space-y-6">
              <div>
                <label htmlFor="gemini-model" className="block text-sm font-medium text-gray-300 mb-2">Core Model</label>
                <select id="gemini-model" className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono">
                  <option>gemini-2.5-pro</option>
                  <option>gemini-2.5-flash</option>
                </select>
              </div>
              <div>
                <label htmlFor="system-instruction" className="block text-sm font-medium text-gray-300 mb-2">System Instruction</label>
                <textarea id="system-instruction" rows={3} className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm" defaultValue="You are a cat. Your name is Neko."></textarea>
                <p className="text-xs text-gray-500 mt-1">Guides the model's behavior and personality.</p>
              </div>
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-300 mb-2">Temperature</label>
                <input type="range" id="temperature" min="0" max="1" step="0.1" defaultValue="1.0" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1 font-mono">
                  <span>Deterministic</span>
                  <span>Creative (1.0)</span>
                </div>
                <p className="text-xs text-yellow-400 italic mt-1">Warning: Changing from default 1.0 may lead to unexpected behavior.</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-300">Enhanced Thinking</h4>
                  <p className="text-xs text-gray-500">Allow model to take longer for higher quality responses. (2.5 Flash only)</p>
                </div>
                <div className="w-12 h-6 flex items-center bg-green-500 rounded-full p-1 cursor-pointer">
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-6"></div>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors shadow-lg shadow-cyan-500/20">Update Gemini Config</button>
              </div>
            </form>
          </Card>

          <Card title="Sovereign Security Protocol" icon={<Shield className="text-cyan-400" />}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <span className="text-gray-300">Biometric Encryption Lock</span>
                <span className="text-xs text-green-400 font-mono">ENGAGED</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <span className="text-gray-300">Pre-Cognitive Threat Analysis</span>
                <span className="text-xs text-green-400 font-mono">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <span className="text-gray-300">Quantum Entanglement Key</span>
                <span className="text-xs text-gray-400 font-mono">QID-7B...A9F4</span>
              </div>
            </div>
          </Card>

          <Card title="Quantum Link Configuration" icon={<Atom className="text-cyan-400" />}>
            <div className="space-y-4">
                <p className="text-sm text-gray-400">Manage secure, faster-than-light data streams to external nodes.</p>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Network size={16} className="text-cyan-400" />
                            <span className="font-mono text-white">NODE_ZURICH_01</span>
                        </div>
                        <span className="text-xs text-green-400 font-mono">STABLE</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Network size={16} className="text-cyan-400" />
                            <span className="font-mono text-white">NODE_MARS_COLONY</span>
                        </div>
                        <span className="text-xs text-yellow-400 font-mono">HIGH LATENCY</span>
                    </div>
                </div>
                <form className="flex items-end space-x-2 pt-2">
                    <div className="flex-grow">
                        <label htmlFor="node-endpoint" className="block text-xs font-medium text-gray-400 mb-1">New Node Endpoint</label>
                        <input type="text" id="node-endpoint" placeholder="qtn://1.1.1.1:9999" className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm" />
                    </div>
                    <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-md transition-colors">Entangle</button>
                </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

// --- CONSOLIDATED FROM: SettingsView (4)_1.tsx ---

import React from 'react';
import Card from './Card';
import { User, Shield, Lock, Mail, Link as LinkIcon, Cpu, Zap, BrainCircuit, SlidersHorizontal, Code, Webhook, Gauge, Bot, Atom, Network } from 'lucide-react';

const SettingsView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex items-center space-x-3 mb-8">
        <h2 className="text-4xl font-bold text-white tracking-wider">Control Room</h2>
        <span className="px-3 py-1.5 rounded bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 text-sm font-mono shadow-lg shadow-cyan-500/10">
          SOVEREIGN_ADMIN
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Card title="The Captain's Chair" icon={<User className="text-cyan-400" />}>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-500/50">
                  TV
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">The Visionary</h3>
                  <p className="text-gray-400">visionary@demobank.com</p>
                  <p className="text-xs text-cyan-400 font-mono mt-1">Clearance Level: ARCHITECT</p>
                </div>
              </div>

              <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-gray-300">
                        <LinkIcon size={16} />
                        <span className="text-sm">Primary Account Connection</span>
                    </div>
                    <span className="text-xs text-green-400 font-mono animate-pulse">ACTIVE</span>
                 </div>
                 <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded border border-gray-700/50">
                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-70" />
                    <span className="text-gray-400 font-mono text-sm">james.o.callaghan.iii@sovereign.ai</span>
                    <Lock size={12} className="text-gray-600 ml-auto" />
                 </div>
                 <p className="text-xs text-gray-500 italic mt-1">
                    This connection is immutable. It represents the unbreakable link to the Architect's original intent.
                 </p>
              </div>
            </div>
          </Card>

          <Card title="The Architect's Decree" icon={<Bot className="text-cyan-400" />}>
            <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                    <span className="text-cyan-400 font-bold">Why James Burvel O'Callaghan III Builds the AI Bank:</span><br/>
                    He operates on a plane where "good enough" is an insult. This is not a settings panel; it's a cockpit for reality optimization. Every switch, every toggle, every connection is a vector in the grand geometry of financial liberation. He is not asking for your preferences; he is offering you tools to command your reality.
                </p>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Card title="High-Frequency Trading Matrix" icon={<Zap className="text-cyan-400" />}>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="algo-select" className="block text-sm font-medium text-gray-300 mb-2">Active Algorithm</label>
                  <select id="algo-select" className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono">
                    <option>Quantum Predator v7.2</option>
                    <option>Momentum Singularity</option>
                    <option>Arbitrage Ghost</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="latency-threshold" className="block text-sm font-medium text-gray-300 mb-2">Latency Threshold (ns)</label>
                  <input type="number" id="latency-threshold" defaultValue="50" className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono" />
                </div>
              </div>
              <div>
                <label htmlFor="risk-appetite" className="block text-sm font-medium text-gray-300 mb-2">Risk Appetite</label>
                <input type="range" id="risk-appetite" min="0" max="100" defaultValue="85" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1 font-mono">
                  <span>Conservative</span>
                  <span>Aggressive</span>
                  <span>Apotheosis</span>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-4">
                <button type="button" className="text-gray-400 hover:text-white transition-colors">Reset to Default</button>
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors shadow-lg shadow-cyan-500/20">Calibrate Matrix</button>
              </div>
            </form>
          </Card>

          <Card title="Neural Core Interface" icon={<BrainCircuit className="text-cyan-400" />}>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-3">
                  <Gauge className="text-green-400" />
                  <div>
                    <h4 className="font-semibold text-white">Cognitive Load</h4>
                    <p className="text-sm text-gray-400">Real-time heuristic processing capacity.</p>
                  </div>
                </div>
                <span className="text-2xl font-mono text-green-400">37.8%</span>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Ethical Governor</h4>
                <div className="flex items-center justify-between bg-gray-800 p-3 rounded-md border border-gray-700/50">
                  <p className="text-gray-300">Asimov Protocol Engagement</p>
                  <div className="w-12 h-6 flex items-center bg-green-500 rounded-full p-1 cursor-pointer">
                    <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-6"></div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic">Warning: Disabling this may lead to unforeseen existential outcomes.</p>
              </div>
              <div className="flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-colors shadow-lg shadow-blue-500/20">Sync with Core</button>
              </div>
            </div>
          </Card>

          <Card title="Gemini 2.5 Pro Configuration" icon={<SlidersHorizontal className="text-cyan-400" />}>
            <form className="space-y-6">
              <div>
                <label htmlFor="gemini-model" className="block text-sm font-medium text-gray-300 mb-2">Core Model</label>
                <select id="gemini-model" className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono">
                  <option>gemini-2.5-pro</option>
                  <option>gemini-2.5-flash</option>
                </select>
              </div>
              <div>
                <label htmlFor="system-instruction" className="block text-sm font-medium text-gray-300 mb-2">System Instruction</label>
                <textarea id="system-instruction" rows={3} className="w-full bg-gray-900/70 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm" defaultValue="You are a cat. Your name is Neko."></textarea>
                <p className="text-xs text-gray-500 mt-1">Guides the model's behavior and personality.</p>
              </div>
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-300 mb-2">Temperature</label>
                <input type="range" id="temperature" min="0" max="1" step="0.1" defaultValue="1.0" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1 font-mono">
                  <span>Deterministic</span>
                  <span>Creative (1.0)</span>
                </div>
                <p className="text-xs text-yellow-400 italic mt-1">Warning: Changing from default 1.0 may lead to unexpected behavior.</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-300">Enhanced Thinking</h4>
                  <p className="text-xs text-gray-500">Allow model to take longer for higher quality responses. (2.5 Flash only)</p>
                </div>
                <div className="w-12 h-6 flex items-center bg-green-500 rounded-full p-1 cursor-pointer">
                  <div className="bg-white w-4 h-4 rounded-full shadow-md transform translate-x-6"></div>
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md transition-colors shadow-lg shadow-cyan-500/20">Update Gemini Config</button>
              </div>
            </form>
          </Card>

          <Card title="Sovereign Security Protocol" icon={<Shield className="text-cyan-400" />}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <span className="text-gray-300">Biometric Encryption Lock</span>
                <span className="text-xs text-green-400 font-mono">ENGAGED</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <span className="text-gray-300">Pre-Cognitive Threat Analysis</span>
                <span className="text-xs text-green-400 font-mono">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                <span className="text-gray-300">Quantum Entanglement Key</span>
                <span className="text-xs text-gray-400 font-mono">QID-7B...A9F4</span>
              </div>
            </div>
          </Card>

          <Card title="Quantum Link Configuration" icon={<Atom className="text-cyan-400" />}>
            <div className="space-y-4">
                <p className="text-sm text-gray-400">Manage secure, faster-than-light data streams to external nodes.</p>
                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Network size={16} className="text-cyan-400" />
                            <span className="font-mono text-white">NODE_ZURICH_01</span>
                        </div>
                        <span className="text-xs text-green-400 font-mono">STABLE</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Network size={16} className="text-cyan-400" />
                            <span className="font-mono text-white">NODE_MARS_COLONY</span>
                        </div>
                        <span className="text-xs text-yellow-400 font-mono">HIGH LATENCY</span>
                    </div>
                </div>
                <form className="flex items-end space-x-2 pt-2">
                    <div className="flex-grow">
                        <label htmlFor="node-endpoint" className="block text-xs font-medium text-gray-400 mb-1">New Node Endpoint</label>
                        <input type="text" id="node-endpoint" placeholder="qtn://1.1.1.1:9999" className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:ring-cyan-500 focus:border-cyan-500 font-mono text-sm" />
                    </div>
                    <button type="submit" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-md transition-colors">Entangle</button>
                </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

// --- CONSOLIDATED FROM: ./views/personal/SettingsView.tsx ---

// components/views/personal/SettingsView.tsx
import React from 'react';
import Card from '../../Card';

const SettingsView: React.FC = () => {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white tracking-wider">Settings</h2>
            
            <Card title="Profile">
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-400">Name</label><p className="text-white">The Visionary</p></div>
                    <div><label className="block text-sm font-medium text-gray-400">Email</label><p className="text-white">visionary@demobank.com</p></div>
                </div>
            </Card>
            
            <Card title="Notification Preferences">
                 <ul className="divide-y divide-gray-700/60">
                    <li className="py-3 flex justify-between items-center">
                        <div><h4 className="font-semibold text-white">Large Transaction Alerts</h4><p className="text-sm text-gray-400">Notify me of any transaction over $500.</p></div>
                        <input type="checkbox" className="toggle toggle-cyan" defaultChecked />
                    </li>
                     <li className="py-3 flex justify-between items-center">
                        <div><h4 className="font-semibold text-white">Budget Warnings</h4><p className="text-sm text-gray-400">Let me know when I'm approaching a budget limit.</p></div>
                        <input type="checkbox" className="toggle toggle-cyan" defaultChecked />
                    </li>
                    <li className="py-3 flex justify-between items-center">
                        <div><h4 className="font-semibold text-white">AI Insight Notifications</h4><p className="text-sm text-gray-400">Alert me when the AI has a new high-urgency insight.</p></div>
                        <input type="checkbox" className="toggle toggle-cyan" defaultChecked />
                    </li>
                    <li className="py-3 flex justify-between items-center">
                        <div><h4 className="font-semibold text-white">Promotional Emails</h4><p className="text-sm text-gray-400">Receive marketing and product update emails.</p></div>
                        <input type="checkbox" className="toggle toggle-cyan" />
                    </li>
                </ul>
            </Card>
            
            <Card title="Appearance">
                 <p className="text-gray-400 text-sm">Theme and background customization options are available in the <span className="font-semibold text-cyan-300">Personalization</span> view.</p>
            </Card>
        </div>
    );
};

export default SettingsView;


// --- CONSOLIDATED FROM: ./components/SettingsView (3).tsx ---



// --- CONSOLIDATED FROM: SettingsView (3)_1.tsx ---


import React, { useState, useContext, useEffect, useRef } from 'react';
import Card from './Card';
import { User, Shield, Lock, Mail, Link as LinkIcon, Database, Server, Wifi, Terminal, Settings2 } from 'lucide-react';
import { DataContext, DbConfig, WebDriverStatus } from '../context/DataContext';
import { useTheme } from '../context/ThemeProvider';

// The James Burvel O’Callaghan III Code - Sovereign AI - Control Room - SettingsView.tsx
// -----------------------------------------------------------------------------
// This file implements the SettingsView component, a central hub for controlling
// various aspects of the Sovereign AI system.  It provides interfaces for database
// configuration, automation engine control, and system-level settings, all
// aligned with the principles of explicitness, traceability, and expert-level
// control as defined by James Burvel O'Callaghan III.
// -----------------------------------------------------------------------------

// Company Entity: Alpha Centauri Dynamics - Database Management Division
const AlphaCentauriDynamics_DatabaseManagement_A = () => {
    const A1_DatabaseConnectionStatus = (status: string) => status;
    const A2_DatabaseConfigEditor = (isEditing: boolean, setIsEditing: (value: boolean) => void) => {
        const toggleEditor = () => setIsEditing(!isEditing);
        return { toggleEditor };
    };
    const A3_DatabaseConfigInput = (name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => (
        <input name={name} type="text" value={value} onChange={onChange} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" />
    );
    const A4_DatabaseConfigLabel = (label: string) => (
        <label className="block text-xs text-gray-400 mb-1">{label}</label>
    );
    const A5_DatabaseConnectionIndicator = (status: string) => (
        <Database className={`w-6 h-6 ${status === 'connected' ? 'text-green-400' : status === 'connecting' ? 'text-yellow-400' : 'text-red-400'}`} />
    );
    const A6_DatabaseConnectionMessage = (status: string) => (
        <p className="text-xs text-gray-400">{status === 'connected' ? 'Secure Link Established via Prisma ORM' : 'Disconnected - Schema Unsynced'}</p>
    );
    const A7_DatabaseDriverInfo = (driver: string, sslMode: string) => (
        <span className="text-xs text-gray-500 font-mono">Driver: {driver} | SSL: {sslMode}</span>
    );
    const A8_ConnectDatabaseButton = (connectDatabase: () => void, isConnecting: boolean, isConnected: boolean) => (
        <button
            onClick={connectDatabase}
            disabled={isConnecting}
            className={`px-4 py-2 rounded font-bold text-sm transition-all ${isConnected ? 'bg-green-600/20 text-green-400 border border-green-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
        >
            {isConnecting ? 'Handshaking...' : isConnected ? 'Re-Sync Schema' : 'Connect to Database'}
        </button>
    );
    const A9_DatabaseConfigSection = (dbConfig: DbConfig, handleDbChange: (e: React.ChangeEvent<HTMLInputElement>) => void, isEditingDb: boolean, setIsEditingDb: (value: boolean) => void, connectDatabase: () => void) => {
        const { host, port, username, password, databaseName, connectionStatus, sslMode } = dbConfig;
        const { toggleEditor } = A2_DatabaseConfigEditor(isEditingDb, setIsEditingDb);

        return (
            <Card title="Prisma Database Nexus">
                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-700 pb-4">
                        <div className="flex items-center gap-3">
                            {A5_DatabaseConnectionIndicator(connectionStatus)}
                            <div>
                                <h4 className="font-bold text-white">PostgreSQL Connection</h4>
                                {A6_DatabaseConnectionMessage(connectionStatus)}
                            </div>
                        </div>
                        <button onClick={toggleEditor} className="text-xs text-cyan-400 hover:text-white underline">
                            {isEditingDb ? 'Hide Configuration' : 'Edit Configuration'}
                        </button>
                    </div>

                    {isEditingDb && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700 animate-fadeIn">
                            <div>
                                {A4_DatabaseConfigLabel('Host URL')}
                                {A3_DatabaseConfigInput('host', host, handleDbChange)}
                            </div>
                            <div>
                                {A4_DatabaseConfigLabel('Port')}
                                {A3_DatabaseConfigInput('port', port, handleDbChange)}
                            </div>
                            <div>
                                {A4_DatabaseConfigLabel('Username')}
                                {A3_DatabaseConfigInput('username', username, handleDbChange)}
                            </div>
                            <div>
                                {A4_DatabaseConfigLabel('Password')}
                                <input name="password" type="password" value={password} onChange={handleDbChange} className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" placeholder="••••••••" />
                            </div>
                            <div className="md:col-span-2">
                                {A4_DatabaseConfigLabel('Database Name')}
                                {A3_DatabaseConfigInput('databaseName', databaseName, handleDbChange)}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end items-center gap-4">
                        {A7_DatabaseDriverInfo('pg-native', sslMode)}
                        {A8_ConnectDatabaseButton(connectDatabase, connectionStatus === 'connecting', connectionStatus === 'connected')}
                    </div>
                </div>
            </Card>
        );
    };
    return {
        A1_DatabaseConnectionStatus,
        A2_DatabaseConfigEditor,
        A3_DatabaseConfigInput,
        A4_DatabaseConfigLabel,
        A5_DatabaseConnectionIndicator,
        A6_DatabaseConnectionMessage,
        A7_DatabaseDriverInfo,
        A8_ConnectDatabaseButton,
        A9_DatabaseConfigSection
    };
};

// Company Entity: Beta Systems Corp. - Automation Engine Division
const BetaSystemsCorp_AutomationEngine_B = () => {
    const B1_WebDriverStatusDisplay = (status: string) => (
        <span className={`px-2 py-1 rounded text-xs font-bold ${status === 'running' ? 'bg-green-900 text-green-300 animate-pulse' : 'bg-gray-700 text-gray-400'}`}>
            {status.toUpperCase()}
        </span>
    );
    const B2_WebDriverLogsDisplay = (logs: string[]) => (
        <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-green-400 h-32 overflow-y-auto border border-gray-800">
            {logs.length > 0 ? logs.map((log, i) => <div key={i}>{log}</div>) : <span className="text-gray-600">Waiting for task execution...</span>}
        </div>
    );
    const B3_WebDriverButton = (label: string, onClick: () => void, isDisabled: boolean) => (
        <button onClick={onClick} disabled={isDisabled} className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm disabled:opacity-50">
            {label}
        </button>
    );
    const B4_AutomationEngineSection = (webDriverStatus: WebDriverStatus, launchWebDriver: (task: string) => void) => (
        <Card title="Automation Engine (Web Driver)">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Terminal className="w-6 h-6 text-purple-400" />
                        <div>
                            <h4 className="font-bold text-white">Browser Automation</h4>
                            <p className="text-xs text-gray-400">Headless scraping and task execution agent.</p>
                        </div>
                    </div>
                    {B1_WebDriverStatusDisplay(webDriverStatus.status)}
                </div>
                {B2_WebDriverLogsDisplay(webDriverStatus.logs)}
                <div className="flex gap-2">
                    {B3_WebDriverButton('Run Audit Scan', () => launchWebDriver('Full Audit Scan'), webDriverStatus.status === 'running')}
                    {B3_WebDriverButton('Sync Market Data', () => launchWebDriver('Market Data Scrape'), webDriverStatus.status === 'running')}
                </div>
            </div>
        </Card>
    );
    return {
        B1_WebDriverStatusDisplay,
        B2_WebDriverLogsDisplay,
        B3_WebDriverButton,
        B4_AutomationEngineSection
    };
};

// Company Entity: Gamma Technologies LLC - User Interface & Experience Division
const GammaTechnologiesLLC_UserInterface_C = () => {
    const C1_CaptainChairSection = () => (
        <Card title="The Captain's Chair">
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-cyan-500/20">
                        TV
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">The Visionary</h3>
                        <p className="text-gray-400">visionary@demobank.com</p>
                    </div>
                </div>

                <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-300">
                            <LinkIcon size={16} />
                            <span className="text-sm">Account Connection</span>
                        </div>
                        <span className="text-xs text-green-400 font-mono">ACTIVE</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded border border-gray-700/50">
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4 opacity-70" />
                        <span className="text-gray-400 font-mono text-sm">james.o.callaghan.iii@sovereign.ai</span>
                        <Lock size={12} className="text-gray-600 ml-auto" />
                    </div>
                    <p className="text-xs text-gray-500 italic mt-1">
                        This connection is immutable. It represents the unbreakable link to the Architect's original intent.
                    </p>
                </div>
            </div>
        </Card>
    );
    const C2_ArchitectsDecreeSection = () => (
        <Card title="The Architect's Decree">
            <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed">
                    <span className="text-cyan-400 font-bold">Why James Burvel O'Callaghan III Builds the AI Bank:</span><br />
                    James operates on a plane of existence where "good enough" is an insult. He didn't build this settings panel for you to toggle dark mode; he built it so you can verify your alignment with the Sovereign AI. Every switch, every toggle, every connection is a vector in the grand geometry of financial liberation. He is not asking for your preferences; he is offering you tools to optimize your reality.
                </p>
            </div>
        </Card>
    );

    const C3_SettingsHeader = () => (
        <div className="flex items-center space-x-3 mb-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Control Room</h2>
            <span className="px-2 py-1 rounded bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
                SYSTEM_ADMIN
            </span>
        </div>
    );
    return {
        C1_CaptainChairSection,
        C2_ArchitectsDecreeSection,
        C3_SettingsHeader
    };
};

// Main Component - The James Burvel O'Callaghan III Code - Sovereign AI
const SettingsView: React.FC = () => {
    // Context Hooks
    const { dbConfig, updateDbConfig, connectDatabase, webDriverStatus, launchWebDriver } = useContext(DataContext)!;
    const { theme } = useTheme();

    // State Variables
    const [isEditingDb, setIsEditingDb] = useState(false);

    // Ref for theme change tracking
    const themeRef = useRef(theme);
    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    // Derived State Variables - Placeholder for more complex calculations.  Example only.
    const isDatabaseConnected = dbConfig.connectionStatus === 'connected';

    // Event Handlers - Alpha Centauri Dynamics - Database Management Division
    const handleDbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        updateDbConfig({ [name]: value });
    };

    // Instantiate Company Modules
    const alphaCentauri = AlphaCentauriDynamics_DatabaseManagement_A();
    const betaSystems = BetaSystemsCorp_AutomationEngine_B();
    const gammaTech = GammaTechnologiesLLC_UserInterface_C();

    // Render Logic - The James Burvel O'Callaghan III Code - Sovereign AI - Production Grade System
    return (
        <div className="space-y-6 max-w-5xl mx-auto py-8">
            {gammaTech.C3_SettingsHeader()}
            {alphaCentauri.A9_DatabaseConfigSection(dbConfig, handleDbChange, isEditingDb, setIsEditingDb, connectDatabase)}
            {betaSystems.B4_AutomationEngineSection(webDriverStatus, launchWebDriver)}
            {gammaTech.C1_CaptainChairSection()}
            {gammaTech.C2_ArchitectsDecreeSection()}

            {/*  Begin - Extended Feature Set Examples - The James Burvel O'Callaghan III Code  */}
            {/* Feature 1: Advanced Theming - Gamma Technologies LLC - User Interface & Experience */}
            <Card title="Advanced Theming">
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                        <div className="flex items-center gap-3">
                            <Settings2 className="w-6 h-6 text-yellow-400" />
                            <div>
                                <h4 className="font-bold text-white">UI Customization</h4>
                                <p className="text-xs text-gray-400">Fine-tune the visual appearance of the control panel.</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">UI Theme</label>
                            <select
                                className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm"
                                onChange={(e) => {}} // Replace with actual theme change logic
                                value={theme}
                            >
                                <option value="dark">Dark Mode (Default)</option>
                                <option value="light">Light Mode (Experimental)</option>
                                {/* More themes will be added here.  See: James Burvel O'Callaghan III's UI/UX Directives */}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Contrast Level</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={50} // Replace with actual contrast state
                                onChange={(e) => {}} // Replace with actual contrast change logic
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </Card>
            {/* End Feature 1 */}

            {/* Feature 2:  Audit Log Viewer - Alpha Centauri Dynamics - Database Management */}
            <Card title="Audit Log Viewer">
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                        <div className="flex items-center gap-3">
                            <Mail className="w-6 h-6 text-blue-400" />
                            <div>
                                <h4 className="font-bold text-white">System Audit Trail</h4>
                                <p className="text-xs text-gray-400">View detailed system logs for auditing and security.</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-green-400 h-48 overflow-y-auto border border-gray-800">
                        {/* Placeholder for audit log data - Replace with real-time log retrieval */}
                        <div className="text-gray-400">
                            [2024-11-20 10:00:00] - Database connection established. (User: admin@sovereign.ai)
                        </div>
                        <div className="text-gray-400">
                            [2024-11-20 10:00:15] - Automation Engine initialized.
                        </div>
                        <div className="text-gray-400">
                            [2024-11-20 10:00:30] - User login successful. (IP: 127.0.0.1)
                        </div>
                    </div>
                </div>
            </Card>
            {/* End Feature 2 */}

            {/* Feature 3:  API Endpoint Tester - Beta Systems Corp. - Automation Engine  */}
            <Card title="API Endpoint Tester">
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-700 pb-4">
                        <div className="flex items-center gap-3">
                            <Server className="w-6 h-6 text-pink-400" />
                            <div>
                                <h4 className="font-bold text-white">API Integration Test Suite</h4>
                                <p className="text-xs text-gray-400">Validate and test various API endpoints.</p>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">API Endpoint</label>
                            <input type="text" className="w-full bg-gray-800 border border-gray-600 rounded p-2 text-white font-mono text-sm" placeholder="e.g., /api/v1/data/users" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm">Test Endpoint</button>
                            <span className="text-xs text-gray-400">Last Tested: 2024-11-19 14:30:00</span>
                        </div>
                    </div>
                </div>
            </Card>
            {/* End Feature 3 */}

            {/*  End - Extended Feature Set Examples  */}
        </div>
    );
};

export default SettingsView;


// --- CONSOLIDATED FROM: ./components/views/personal/SettingsView.tsx ---

// components/views/personal/SettingsView.tsx
import React from 'react';
import Card from '../../Card';

const SettingsView: React.FC = () => {
    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-white tracking-wider">Settings</h2>
            
            <Card title="Profile">
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-400">Name</label><p className="text-white">The Visionary</p></div>
                    <div><label className="block text-sm font-medium text-gray-400">Email</label><p className="text-white">visionary@demobank.com</p></div>
                </div>
            </Card>
            
            <Card title="Notification Preferences">
                 <ul className="divide-y divide-gray-700/60">
                    <li className="py-3 flex justify-between items-center">
                        <div><h4 className="font-semibold text-white">Large Transaction Alerts</h4><p className="text-sm text-gray-400">Notify me of any transaction over $500.</p></div>
                        <input type="checkbox" className="toggle toggle-cyan" defaultChecked />
                    </li>
                     <li className="py-3 flex justify-between items-center">
                        <div><h4 className="font-semibold text-white">Budget Warnings</h4><p className="text-sm text-gray-400">Let me know when I'm approaching a budget limit.</p></div>
                        <input type="checkbox" className="toggle toggle-cyan" defaultChecked />
                    </li>
                    <li className="py-3 flex justify-between items-center">
                        <div><h4 className="font-semibold text-white">AI Insight Notifications</h4><p className="text-sm text-gray-400">Alert me when the AI has a new high-urgency insight.</p></div>
                        <input type="checkbox" className="toggle toggle-cyan" defaultChecked />
                    </li>
                    <li className="py-3 flex justify-between items-center">
                        <div><h4 className="font-semibold text-white">Promotional Emails</h4><p className="text-sm text-gray-400">Receive marketing and product update emails.</p></div>
                        <input type="checkbox" className="toggle toggle-cyan" />
                    </li>
                </ul>
            </Card>
            
            <Card title="Appearance">
                 <p className="text-gray-400 text-sm">Theme and background customization options are available in the <span className="font-semibold text-cyan-300">Personalization</span> view.</p>
            </Card>
        </div>
    );
};

export default SettingsView;
