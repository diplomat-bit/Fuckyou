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