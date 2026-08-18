import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { 
  DollarSign, Zap, Target, BarChart2, TrendingUp, Briefcase, Cpu, Layers, 
  Plus, X, ArrowRight, Bot, ChevronsRight, FileText, Filter, Settings, 
  ShieldCheck, Heart, MessageSquare, Send, Lock, Eye, Terminal, Activity,
  Globe, Sparkles, Key, Database, AlertCircle, Mic, Play, Pause, Search,
  CheckCircle, AlertTriangle, Server, Code, Wifi
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// ============================================================================
// CONFIGURATION & SECRETS MANAGEMENT
// ============================================================================

// In a real production environment, these would be injected via a secure vault.
// For this "Golden Ticket" demo, we access the environment directly.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "mock-key-for-demo-purposes";
const DEMO_BANK_NAME = "Quantum Financial";
const AI_MODEL_NAME = "gemini-3-flash-preview";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type ViewState = 'dashboard' | 'management' | 'algorithmic' | 'gein' | 'futures' | 'audit' | 'settings';

interface ImpactMetric {
  id: number;
  name: string;
  value: number;
  unit: string;
  change: number;
  geinContribution: number;
  description: string;
}

interface Grant {
  id: string;
  recipient: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Deployed' | 'Reporting' | 'Synergized' | 'Audit_Review';
  date: string;
  predictedSROI: number;
  aiConfidence: number;
  geinImpactVector: number[];
  synergisticPartners: string[];
  riskProfile: {
    execution: number;
    market: number;
    systemic: number;
  };
  auditTrail: string[];
}

interface DAFSummary {
  id: string;
  fundName: string;
  balance: number;
  grantsIssued: number;
  sroiEstimate: number;
  grants: Grant[];
  focusArea: string;
  geinAlignmentScore: number;
  networkedImpact: number;
  owner: string;
  creationDate: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  hash: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
  intent?: string;
}

interface GeinNode {
    id: string;
    label: string;
    type: 'Grant' | 'Organization' | 'Research' | 'DAF' | 'AI_Agent';
    impactScore: number;
    x: number;
    y: number;
    status: 'active' | 'idle' | 'alert';
}

interface GeinEdge {
    source: string;
    target: string;
    strength: number;
    type: 'Funding' | 'Synergy' | 'Dataflow' | 'Control';
    animated: boolean;
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockMetrics = (): ImpactMetric[] => [
  { id: 1, name: 'Total Capital Deployed', value: 14500000, unit: '$', change: 14.5, geinContribution: 0.23, description: 'Aggregate capital flow through Quantum Financial rails.' },
  { id: 2, name: 'Lives Directly Impacted', value: 345000, unit: '', change: 8.2, geinContribution: 0.15, description: 'Verified beneficiaries via biometric proof-of-impact.' },
  { id: 3, name: 'Real-time Blended SROI', value: 4.1, unit: 'x', change: 1.5, geinContribution: 0.45, description: 'Social Return on Investment calculated by Sovereign AI.' },
  { id: 4, name: 'GEIN Synergy Index', value: 89.2, unit: '%', change: 22.7, geinContribution: 1.0, description: 'Network efficiency derived from cross-grant collaboration.' },
];

const generateMockDAFs = (): DAFSummary[] => [
  { 
    id: 'daf-edu-001', 
    fundName: 'Future Education Initiative', 
    balance: 500000, 
    grantsIssued: 150000, 
    sroiEstimate: 4.1, 
    focusArea: 'STEM Education', 
    geinAlignmentScore: 92, 
    networkedImpact: 1.8e6, 
    owner: 'James B. oCallaghan',
    creationDate: '2023-01-15',
    grants: [
      { id: 'g-001', recipient: 'Quantum Leap Learning', amount: 75000, status: 'Synergized', date: '2023-11-15', predictedSROI: 4.5, aiConfidence: 0.98, geinImpactVector: [0.8, 0.2, 0.5], synergisticPartners: ['g-002', 'g-003'], riskProfile: { execution: 0.1, market: 0.05, systemic: 0.2 }, auditTrail: ['Created by User', 'AI Risk Scan Passed', 'Funds Deployed'] },
      { id: 'g-002', recipient: 'CodeCrafters Youth', amount: 50000, status: 'Reporting', date: '2024-01-20', predictedSROI: 4.2, aiConfidence: 0.95, geinImpactVector: [0.7, 0.3, 0.4], synergisticPartners: ['g-001'], riskProfile: { execution: 0.15, market: 0.1, systemic: 0.2 }, auditTrail: ['Created by User', 'Approved by Board'] },
    ]
  },
  { 
    id: 'daf-hlth-001', 
    fundName: 'Global Health Fund 2024', 
    balance: 1200000, 
    grantsIssued: 350000, 
    sroiEstimate: 3.2, 
    focusArea: 'Vaccine Research', 
    geinAlignmentScore: 85, 
    networkedImpact: 4.5e6, 
    owner: 'James B. oCallaghan',
    creationDate: '2023-06-22',
    grants: [
      { id: 'g-003', recipient: 'BioSynth Labs', amount: 200000, status: 'Deployed', date: '2024-02-01', predictedSROI: 3.8, aiConfidence: 0.91, geinImpactVector: [0.2, 0.9, 0.6], synergisticPartners: ['g-001', 'g-004'], riskProfile: { execution: 0.2, market: 0.25, systemic: 0.4 }, auditTrail: ['Auto-generated by AI Agent', 'Manual Override Approval'] },
    ]
  },
];

const initialGeinData: { nodes: GeinNode[], edges: GeinEdge[] } = {
    nodes: [
        { id: 'daf-edu-001', label: 'Future Education', type: 'DAF', impactScore: 92, x: 150, y: 200, status: 'active' },
        { id: 'daf-hlth-001', label: 'Global Health', type: 'DAF', impactScore: 85, x: 150, y: 400, status: 'active' },
        { id: 'g-001', label: 'Quantum Leap', type: 'Grant', impactScore: 88, x: 350, y: 150, status: 'active' },
        { id: 'g-002', label: 'CodeCrafters', type: 'Grant', impactScore: 85, x: 350, y: 250, status: 'idle' },
        { id: 'g-003', label: 'BioSynth Labs', type: 'Grant', impactScore: 91, x: 350, y: 400, status: 'active' },
        { id: 'ai-core', label: 'Sovereign AI Core', type: 'AI_Agent', impactScore: 99, x: 550, y: 300, status: 'active' },
        { id: 'org-who', label: 'World Health Org', type: 'Organization', impactScore: 93, x: 750, y: 400, status: 'idle' },
    ],
    edges: [
        { source: 'daf-edu-001', target: 'g-001', strength: 0.9, type: 'Funding', animated: true },
        { source: 'daf-edu-001', target: 'g-002', strength: 0.8, type: 'Funding', animated: true },
        { source: 'daf-hlth-001', target: 'g-003', strength: 0.9, type: 'Funding', animated: true },
        { source: 'g-001', target: 'ai-core', strength: 0.95, type: 'Dataflow', animated: true },
        { source: 'g-003', target: 'ai-core', strength: 0.95, type: 'Dataflow', animated: true },
        { source: 'ai-core', target: 'org-who', strength: 0.6, type: 'Control', animated: false },
    ]
};

// ============================================================================
// HOOKS & UTILITIES
// ============================================================================

const useAuditLogger = () => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);

    const logAction = useCallback((action: string, details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO') => {
        const newLog: AuditLogEntry = {
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            action,
            user: 'CURRENT_USER', // In a real app, this comes from auth context
            details,
            severity,
            hash: Math.random().toString(36).substr(2, 16) // Mock hash
        };
        setLogs(prev => [newLog, ...prev]);
        console.log(`[AUDIT] ${action}: ${details}`);
    }, []);

    return { logs, logAction };
};

const useSovereignAI = (logAction: (action: string, details: string) => void) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'welcome', sender: 'ai', text: `Welcome to the ${DEMO_BANK_NAME} Business Demo. I am your Sovereign AI Architect. I can help you analyze funds, draft grants, or audit the system. How shall we proceed?`, timestamp: new Date() }
    ]);

    const sendMessage = async (text: string) => {
        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setIsProcessing(true);
        logAction('AI_INTERACTION', `User query: ${text}`);

        try {
            // DIRECT GEMINI INTEGRATION
            // We use the provided snippet logic here
            const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
            
            // Construct a system prompt that enforces the persona
            const systemPrompt = `
                You are the Sovereign AI for ${DEMO_BANK_NAME}, a high-performance financial platform.
                Your tone is Elite, Professional, Secure, and Helpful.
                You are giving a "Test Drive" of the platform.
                Metaphors: "Kick the tires", "See the engine roar".
                Do NOT mention "Citibank".
                If the user asks to create something, confirm you are initiating the secure protocol.
                Current Context: The user is in the Philanthropy Hub.
                User Input: ${text}
            `;

            const response = await ai.models.generateContent({
                model: AI_MODEL_NAME,
                contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            });

            const aiText = response.response.text();
            
            const aiMsg: ChatMessage = { 
                id: (Date.now() + 1).toString(), 
                sender: 'ai', 
                text: aiText, 
                timestamp: new Date() 
            };
            setMessages(prev => [...prev, aiMsg]);
            logAction('AI_RESPONSE', `Generated response length: ${aiText.length}`);

        } catch (error) {
            console.error("AI Error:", error);
            const errorMsg: ChatMessage = { 
                id: (Date.now() + 1).toString(), 
                sender: 'system', 
                text: "Secure handshake with AI Core failed. Switching to local heuristic mode.", 
                timestamp: new Date() 
            };
            setMessages(prev => [...prev, errorMsg]);
            logAction('AI_ERROR', `Failed to connect to Gemini: ${error}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return { messages, sendMessage, isProcessing };
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatCard: React.FC<{ metric: ImpactMetric }> = ({ metric }) => {
  const isPositive = metric.change >= 0;
  return (
    <div className="group relative bg-gray-900/60 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-md overflow-hidden transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-gray-800/80 rounded-lg border border-gray-700 group-hover:border-cyan-500/30 transition-colors">
                {metric.unit === '$' ? <DollarSign className="w-5 h-5 text-cyan-400" /> : 
                 metric.unit === 'x' ? <Zap className="w-5 h-5 text-amber-400" /> :
                 metric.unit === '%' ? <Layers className="w-5 h-5 text-purple-400" /> :
                 <Heart className="w-5 h-5 text-rose-400" />}
            </div>
            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                {Math.abs(metric.change)}%
            </span>
        </div>
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">{metric.name}</h3>
        <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-bold text-white tracking-tight">
                {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}
                {metric.unit !== '$' && <span className="text-lg text-gray-500 ml-1">{metric.unit}</span>}
            </span>
        </div>
        <p className="mt-3 text-xs text-gray-500 line-clamp-2 group-hover:text-gray-400 transition-colors">
            {metric.description}
        </p>
      </div>
    </div>
  );
};

const AuditVaultModal: React.FC<{ isOpen: boolean; onClose: () => void; logs: AuditLogEntry[] }> = ({ isOpen, onClose, logs }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-5xl bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-800 bg-gray-900/95">
                    <div className="flex items-center space-x-3">
                        <ShieldCheck className="w-6 h-6 text-green-500" />
                        <div>
                            <h2 className="text-xl font-bold text-white">Secure Audit Vault</h2>
                            <p className="text-xs text-gray-400 font-mono">IMMUTABLE LEDGER // {DEMO_BANK_NAME} COMPLIANCE</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-800/50 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Timestamp</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Severity</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Details</th>
                                <th className="p-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Hash</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-800/30 transition-colors font-mono text-sm">
                                    <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                            log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                            log.severity === 'WARNING' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-blue-500/20 text-blue-400'
                                        }`}>
                                            {log.severity}
                                        </span>
                                    </td>
                                    <td className="p-4 text-white font-medium">{log.action}</td>
                                    <td className="p-4 text-gray-400 max-w-md truncate" title={log.details}>{log.details}</td>
                                    <td className="p-4 text-gray-600 text-right text-xs">{log.hash}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-800 bg-gray-900/95 flex justify-between items-center text-xs text-gray-500">
                    <span>Total Records: {logs.length}</span>
                    <div className="flex items-center space-x-2">
                        <Lock className="w-3 h-3" />
                        <span>End-to-End Encrypted Storage</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AIChatPanel: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    messages: ChatMessage[]; 
    onSend: (text: string) => void; 
    isProcessing: boolean;
}> = ({ isOpen, onClose, messages, onSend, isProcessing }) => {
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSend(input);
        setInput('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-gray-900 border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse absolute -right-0.5 -bottom-0.5 border border-gray-900"></div>
                        <Bot className="w-8 h-8 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Sovereign AI</h3>
                        <p className="text-[10px] text-cyan-400/80 uppercase tracking-wider">Online // {AI_MODEL_NAME}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50" ref={scrollRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                            msg.sender === 'user' 
                                ? 'bg-cyan-600 text-white rounded-br-none' 
                                : msg.sender === 'system'
                                ? 'bg-red-900/30 text-red-200 border border-red-500/30'
                                : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-700 flex space-x-2 items-center">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 bg-gray-900">
                <div className="relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask Sovereign AI..."
                        className="w-full bg-gray-800 text-white pl-4 pr-12 py-3 rounded-xl border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all placeholder-gray-500 text-sm"
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim() || isProcessing}
                        className="absolute right-2 top-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="mt-2 flex justify-center space-x-4 text-[10px] text-gray-500">
                    <span className="flex items-center"><Lock className="w-3 h-3 mr-1" /> Encrypted</span>
                    <span className="flex items-center"><Database className="w-3 h-3 mr-1" /> Audit Logged</span>
                </div>
            </form>
        </div>
    );
};

const CreateDAFModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: any) => void }> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({ fundName: '', initialDeposit: '', focusArea: '' });
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-800">
                    <h3 className="text-lg font-bold text-white">Establish New Fund</h3>
                    <p className="text-sm text-gray-400">Initiate a new Donor Advised Fund vehicle.</p>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Fund Designation</label>
                        <input 
                            type="text" 
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors"
                            placeholder="e.g. Quantum Future Trust"
                            value={formData.fundName}
                            onChange={e => setFormData({...formData, fundName: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Initial Capital (USD)</label>
                        <input 
                            type="number" 
                            required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors"
                            placeholder="100,000"
                            value={formData.initialDeposit}
                            onChange={e => setFormData({...formData, initialDeposit: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 uppercase mb-1">Strategic Focus</label>
                        <select 
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-colors"
                            value={formData.focusArea}
                            onChange={e => setFormData({...formData, focusArea: e.target.value})}
                        >
                            <option value="">Select Focus Area...</option>
                            <option value="Education">Education & Human Capital</option>
                            <option value="Health">Global Health Security</option>
                            <option value="Climate">Climate & Energy Transition</option>
                            <option value="Tech">Deep Tech & AI Safety</option>
                        </select>
                    </div>
                    <div className="pt-4 flex space-x-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-bold shadow-lg shadow-cyan-500/20">Execute</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PhilanthropyHub: React.FC = () => {
    const [activeView, setActiveView] = useState<ViewState>('dashboard');
    const [metrics, setMetrics] = useState<ImpactMetric[]>(generateMockMetrics());
    const [dafs, setDafs] = useState<DAFSummary[]>(generateMockDAFs());
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isAuditOpen, setIsAuditOpen] = useState(false);
    const [isCreateDAFOpen, setIsCreateDAFOpen] = useState(false);
    
    // Hooks
    const { logs, logAction } = useAuditLogger();
    const { messages, sendMessage, isProcessing } = useSovereignAI(logAction);

    // Effects
    useEffect(() => {
        // Simulate live data updates
        const interval = setInterval(() => {
            setMetrics(prev => prev.map(m => ({
                ...m,
                value: m.unit === '$' ? m.value + Math.floor(Math.random() * 1000) : m.value + (Math.random() * 0.1 - 0.05)
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Handlers
    const handleCreateDAF = (data: any) => {
        logAction('CREATE_DAF', `Initiated creation of fund: ${data.fundName} with initial capital ${data.initialDeposit}`);
        const newDAF: DAFSummary = {
            id: `daf-${Date.now()}`,
            fundName: data.fundName,
            balance: parseFloat(data.initialDeposit),
            grantsIssued: 0,
            sroiEstimate: 0,
            focusArea: data.focusArea,
            geinAlignmentScore: 0,
            networkedImpact: 0,
            owner: 'James B. oCallaghan',
            creationDate: new Date().toISOString(),
            grants: []
        };
        setDafs(prev => [...prev, newDAF]);
        logAction('DAF_CREATED', `Fund ${newDAF.id} successfully registered on ledger.`);
        sendMessage(`I have successfully established the ${data.fundName}. It is now ready for capital deployment. Would you like me to scan for high-impact grant opportunities in ${data.focusArea}?`);
    };

    const renderDashboard = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 p-8 shadow-2xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                    <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                        Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{DEMO_BANK_NAME}</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl leading-relaxed">
                        You are in the driver's seat. This is your <span className="text-white font-semibold">Golden Ticket</span> to the future of philanthropic capital allocation. Kick the tires, explore the engine, and witness the power of Sovereign AI.
                    </p>
                    <div className="mt-6 flex space-x-4">
                        <button onClick={() => setIsChatOpen(true)} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20 flex items-center">
                            <Bot className="w-5 h-5 mr-2" />
                            Ask Sovereign AI
                        </button>
                        <button onClick={() => setActiveView('gein')} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-all border border-gray-600 flex items-center">
                            <Layers className="w-5 h-5 mr-2" />
                            View Network Graph
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map(m => <StatCard key={m.id} metric={m} />)}
            </div>

            {/* Recent Activity / "The Engine" */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-gray-900/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-cyan-400" />
                            Live Capital Flow
                        </h3>
                        <span className="flex items-center text-xs text-green-400">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            System Operational
                        </span>
                    </div>
                    <div className="space-y-4">
                        {dafs.flatMap(d => d.grants).slice(0, 4).map((grant, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:bg-gray-800 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                                        <ArrowRight className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{grant.recipient}</p>
                                        <p className="text-xs text-gray-400">Via {dafs.find(d => d.grants.includes(grant))?.fundName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-mono font-bold">${grant.amount.toLocaleString()}</p>
                                    <p className="text-xs text-green-400">SROI: {grant.predictedSROI}x</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 rounded-2xl p-6 backdrop-blur-sm flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <ShieldCheck className="w-5 h-5 mr-2 text-purple-400" />
                        Security Status
                    </h3>
                    <div className="flex-1 flex flex-col justify-center items-center space-y-6">
                        <div className="relative w-32 h-32">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    className="text-gray-800"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                                <path
                                    className="text-purple-500"
                                    strokeDasharray="100, 100"
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="text-2xl font-bold text-white">100%</span>
                                <span className="text-[10px] text-gray-400 uppercase">Secure</span>
                            </div>
                        </div>
                        <div className="w-full space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Threat Detection</span>
                                <span className="text-green-400">Active</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Audit Logging</span>
                                <span className="text-green-400">Enabled</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">AI Oversight</span>
                                <span className="text-green-400">Online</span>
                            </div>
                        </div>
                        <button onClick={() => setIsAuditOpen(true)} className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs uppercase tracking-wider font-bold rounded-lg transition-colors">
                            Open Audit Vault
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderManagement = () => (
        <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-white">Fund Management</h2>
                    <p className="text-gray-400">Oversee your philanthropic vehicles and capital deployment.</p>
                </div>
                <button onClick={() => setIsCreateDAFOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold flex items-center shadow-lg shadow-cyan-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    New Fund
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {dafs.map(daf => (
                    <div key={daf.id} className="bg-gray-900/60 border border-gray-700 rounded-2xl p-6 hover:border-cyan-500/30 transition-all">
                        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">{daf.fundName}</h3>
                                <div className="flex items-center space-x-4 mt-1">
                                    <span className="text-sm text-gray-400 flex items-center"><Target className="w-3 h-3 mr-1" /> {daf.focusArea}</span>
                                    <span className="text-sm text-gray-400 flex items-center"><Key className="w-3 h-3 mr-1" /> {daf.id}</span>
                                </div>
                            </div>
                            <div className="mt-4 md:mt-0 text-right">
                                <p className="text-sm text-gray-400 uppercase tracking-wider">Available Capital</p>
                                <p className="text-3xl font-bold text-white font-mono">${daf.balance.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="bg-gray-800/50 rounded-xl overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-800 border-b border-gray-700">
                                    <tr>
                                        <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Grant Recipient</th>
                                        <th className="p-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                                        <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-right">Amount</th>
                                        <th className="p-4 text-xs font-semibold text-gray-400 uppercase text-right">AI Confidence</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {daf.grants.length > 0 ? daf.grants.map(grant => (
                                        <tr key={grant.id} className="hover:bg-gray-700/30 transition-colors">
                                            <td className="p-4 text-white font-medium">{grant.recipient}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    grant.status === 'Deployed' ? 'bg-green-500/20 text-green-400' :
                                                    grant.status === 'Synergized' ? 'bg-purple-500/20 text-purple-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                    {grant.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-white font-mono text-right">${grant.amount.toLocaleString()}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                                        <div className="h-full bg-cyan-500" style={{ width: `${grant.aiConfidence * 100}%` }}></div>
                                                    </div>
                                                    <span className="text-xs text-cyan-400">{(grant.aiConfidence * 100).toFixed(0)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500 italic">No grants deployed yet. Ask AI to scout opportunities.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderGEIN = () => (
        <div className="h-[600px] bg-gray-900 border border-gray-700 rounded-2xl relative overflow-hidden animate-in fade-in duration-700">
            <div className="absolute top-4 left-4 z-10">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-cyan-400" />
                    Global Economic Impact Network
                </h2>
                <p className="text-xs text-gray-400">Real-time visualization of capital synergy.</p>
            </div>
            
            {/* Mock Graph Visualization */}
            <svg className="w-full h-full">
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                {/* Edges */}
                {initialGeinData.edges.map((edge, i) => {
                    const source = initialGeinData.nodes.find(n => n.id === edge.source)!;
                    const target = initialGeinData.nodes.find(n => n.id === edge.target)!;
                    return (
                        <g key={i}>
                            <line 
                                x1={source.x} y1={source.y} 
                                x2={target.x} y2={target.y} 
                                stroke={edge.type === 'Funding' ? '#06b6d4' : edge.type === 'Dataflow' ? '#a855f7' : '#64748b'} 
                                strokeWidth={edge.strength * 2}
                                strokeOpacity="0.4"
                            />
                            {edge.animated && (
                                <circle r="2" fill="#fff">
                                    <animateMotion 
                                        dur={`${3 - edge.strength}s`} 
                                        repeatCount="indefinite"
                                        path={`M${source.x},${source.y} L${target.x},${target.y}`}
                                    />
                                </circle>
                            )}
                        </g>
                    );
                })}
                {/* Nodes */}
                {initialGeinData.nodes.map((node, i) => (
                    <g key={i} transform={`translate(${node.x},${node.y})`} className="cursor-pointer hover:opacity-80 transition-opacity">
                        <circle 
                            r={node.type === 'AI_Agent' ? 25 : 15} 
                            fill={node.type === 'DAF' ? '#0e7490' : node.type === 'Grant' ? '#059669' : node.type === 'AI_Agent' ? '#7c3aed' : '#475569'} 
                            stroke="#fff"
                            strokeWidth="2"
                            filter="url(#glow)"
                        />
                        <text y="35" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">{node.label}</text>
                        {node.type === 'AI_Agent' && (
                            <circle r="30" fill="none" stroke="#7c3aed" strokeWidth="1" strokeDasharray="4 4">
                                <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="10s" repeatCount="indefinite"/>
                            </circle>
                        )}
                    </g>
                ))}
            </svg>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0B0C10] text-gray-100 font-sans selection:bg-cyan-500/30">
            {/* Top Navigation */}
            <header className="sticky top-0 z-40 bg-[#0B0C10]/80 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <span className="font-bold text-white text-lg">Q</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">{DEMO_BANK_NAME}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700 uppercase tracking-wider">Business Demo</span>
                    </div>
                    
                    <nav className="hidden md:flex space-x-1">
                        {[
                            { id: 'dashboard', label: 'Command Center', icon: BarChart2 },
                            { id: 'management', label: 'Funds', icon: Briefcase },
                            { id: 'gein', label: 'Network', icon: Globe },
                            { id: 'audit', label: 'Audit', icon: ShieldCheck },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveView(item.id as ViewState)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
                                    activeView === item.id 
                                    ? 'bg-gray-800 text-white shadow-inner' 
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                }`}
                            >
                                <item.icon className="w-4 h-4 mr-2" />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setIsChatOpen(!isChatOpen)}
                            className={`p-2 rounded-full transition-colors relative ${isChatOpen ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                        >
                            <MessageSquare className="w-5 h-5" />
                            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0B0C10]"></span>
                        </button>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-gray-800"></div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeView === 'dashboard' && renderDashboard()}
                {activeView === 'management' && renderManagement()}
                {activeView === 'gein' && renderGEIN()}
                {activeView === 'audit' && (
                    <div className="text-center py-20">
                        <ShieldCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white">Audit Vault Access</h2>
                        <p className="text-gray-400 mb-6">Secure access required to view full immutable ledger.</p>
                        <button onClick={() => setIsAuditOpen(true)} className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-bold">Authenticate & View Logs</button>
                    </div>
                )}
            </main>

            {/* Overlays & Modals */}
            <AIChatPanel 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                messages={messages} 
                onSend={sendMessage}
                isProcessing={isProcessing}
            />

            <AuditVaultModal 
                isOpen={isAuditOpen} 
                onClose={() => setIsAuditOpen(false)} 
                logs={logs} 
            />

            <CreateDAFModal 
                isOpen={isCreateDAFOpen} 
                onClose={() => setIsCreateDAFOpen(false)} 
                onSave={handleCreateDAF} 
            />

            {/* Floating Action Button for Mobile */}
            <div className="fixed bottom-6 right-6 md:hidden z-40">
                <button 
                    onClick={() => setIsChatOpen(true)}
                    className="w-14 h-14 bg-cyan-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-cyan-500 transition-colors"
                >
                    <Bot className="w-7 h-7" />
                </button>
            </div>
        </div>
    );
};

export default PhilanthropyHub;