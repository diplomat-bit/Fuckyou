import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
    Shield, Fingerprint, Loader2, AlertCircle, CheckCircle2, 
    Bot, Send, Terminal, Activity, Lock, Globe, 
    CreditCard, Building2, FileText, RefreshCw, ChevronRight,
    Search, Eye, AlertTriangle, Database, Server, Zap,
    Cpu, Wifi, Radio, BarChart3, PieChart, X, Minimize2, Maximize2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// ============================================================================
// CONFIGURATION & TYPES
// ============================================================================

const DEMO_BANK_NAME = "Quantum Financial";
const AI_MODEL_NAME = "gemini-2.0-flash-exp"; // Using a fast model for demo responsiveness

export interface SecurityAuditResult {
    riskScore: number;
    fraudProbability: number;
    amlCompliance: 'pass' | 'fail' | 'manual_review';
    sanctionScreening: 'pass' | 'fail';
    quantumSignatureIntegrity: 'verified' | 'unverified';
    recommendations: string[];
    complianceAlerts: string[];
    threatVectorAnalysis: string[];
}

interface AuditLogEntry {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    status: 'success' | 'warning' | 'error';
    hash: string;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'ai' | 'system';
    content: string;
    timestamp: Date;
    isTyping?: boolean;
}

interface PaymentFormData {
    recipientName: string;
    accountNumber: string;
    routingNumber: string;
    amount: string;
    currency: string;
    reference: string;
    paymentRail: 'WIRE' | 'ACH' | 'RTP' | 'SWIFT' | 'BLOCKCHAIN';
}

// ============================================================================
// UTILITIES
// ============================================================================

const generateHash = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const formatCurrency = (amount: string | number, currency = 'USD') => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(isNaN(num) ? 0 : num);
};

// ============================================================================
// AI CONTROLLER
// ============================================================================

class QuantumAIController {
    private client: GoogleGenAI | null = null;
    private apiKey: string | undefined;

    constructor() {
        // Attempt to retrieve API key from environment or local storage for the demo
        this.apiKey = process.env.GEMINI_API_KEY || localStorage.getItem('GEMINI_API_KEY') || undefined;
        if (this.apiKey) {
            this.client = new GoogleGenAI({ apiKey: this.apiKey });
        }
    }

    async generateResponse(history: ChatMessage[], context: any): Promise<string> {
        if (!this.client) {
            return "Quantum AI Core not initialized. Please verify API credentials in the secure vault (Environment Variables).";
        }

        const systemPrompt = `
            You are the Quantum Financial AI Sovereign Architect. 
            You are embedded within a high-frequency, elite business banking terminal.
            Your tone is: Professional, Secure, Concise, and slightly Futuristic.
            
            CONTEXT:
            User is "Test Driving" the platform.
            Current Form Data: ${JSON.stringify(context)}
            
            CAPABILITIES:
            - Analyze payment risk.
            - Suggest financial optimizations.
            - Explain complex banking terms (ACH vs Wire).
            - Draft payment details if asked.
            
            RULES:
            - Never mention "Citibank". Use "Quantum Financial" or "The Demo Bank".
            - Keep responses under 3 sentences unless asked for a report.
            - If the user asks to "fill the form" or "create a payment", output a JSON block at the end of your message like:
              \`\`\`json
              { "action": "FILL_FORM", "data": { "recipientName": "...", "amount": "..." } }
              \`\`\`
        `;

        try {
            const model = this.client.models.getGenerativeModel({ model: AI_MODEL_NAME });
            
            // Convert chat history to Gemini format
            const chatContent = history.map(msg => 
                `${msg.role === 'user' ? 'User' : 'Model'}: ${msg.content}`
            ).join('\n');

            const result = await model.generateContent({
                contents: [
                    { role: 'user', parts: [{ text: systemPrompt }] },
                    { role: 'user', parts: [{ text: chatContent }] }
                ]
            });

            return result.response.text();
        } catch (error) {
            console.error("AI Generation Error:", error);
            return "Secure connection to Neural Core interrupted. Please retry.";
        }
    }
}

const aiController = new QuantumAIController();

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Visualizes the security posture of a transaction or the system state.
 * Enhanced with "Bells and Whistles" animations.
 */
export const SecurityAuditDisplay: React.FC<{ auditResult: SecurityAuditResult | null }> = ({ auditResult }) => {
    const [scanLine, setScanLine] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setScanLine(prev => (prev + 1) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    if (!auditResult) return (
        <div className="relative p-6 bg-gray-900/80 rounded-xl border border-gray-800 overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div 
                className="absolute left-0 right-0 h-[2px] bg-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.8)] z-10"
                style={{ top: `${scanLine}%` }}
            />
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
                <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
                <p className="text-xs text-cyan-400 font-mono uppercase tracking-widest animate-pulse">
                    Initializing Quantum Security Protocols...
                </p>
            </div>
        </div>
    );

    const getScoreColor = (score: number) => {
        if (score < 20) return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30';
        if (score < 50) return 'text-yellow-400 border-yellow-500/30 bg-yellow-950/30';
        return 'text-red-400 border-red-500/30 bg-red-950/30';
    };

    return (
        <div className="relative p-5 bg-slate-900/90 border border-slate-700/50 rounded-xl space-y-4 backdrop-blur-md shadow-2xl overflow-hidden">
            {/* Background Tech Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" 
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '20px 20px' }}>
            </div>

            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-cyan-400" />
                    <span className="text-xs text-cyan-100 font-bold uppercase tracking-widest">Security Audit Log</span>
                </div>
                <div className={`px-3 py-1 rounded-full border text-xs font-black font-mono ${getScoreColor(auditResult.riskScore)}`}>
                    RISK SCORE: {auditResult.riskScore}/100
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase mb-1">AML Compliance</div>
                    <div className={`text-sm font-bold flex items-center gap-2 ${auditResult.amlCompliance === 'pass' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {auditResult.amlCompliance === 'pass' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {auditResult.amlCompliance.toUpperCase()}
                    </div>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <div className="text-[10px] text-slate-400 uppercase mb-1">Quantum Sig</div>
                    <div className={`text-sm font-bold flex items-center gap-2 ${auditResult.quantumSignatureIntegrity === 'verified' ? 'text-cyan-400' : 'text-amber-400'}`}>
                        <Fingerprint size={14} />
                        {auditResult.quantumSignatureIntegrity.toUpperCase()}
                    </div>
                </div>
            </div>

            {/* AI Analysis Stream */}
            <div className="space-y-2">
                <div className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-2">
                    <Bot size={12} /> AI Threat Analysis
                </div>
                <div className="bg-black/40 rounded-lg p-3 font-mono text-[10px] text-slate-300 space-y-1 border border-slate-800 max-h-32 overflow-y-auto custom-scrollbar">
                    {auditResult.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-2 animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                            <span className="text-cyan-500">root@quantum:~$</span>
                            <span>{rec}</span>
                        </div>
                    ))}
                    {auditResult.threatVectorAnalysis.map((threat, i) => (
                        <div key={`t-${i}`} className="flex gap-2 text-amber-400/80 animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${(i + 2) * 100}ms` }}>
                            <span className="text-amber-500">WARN:</span>
                            <span>{threat}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

/**
 * High-fidelity biometric simulation.
 */
export const BiometricModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    amount: string;
    recipient: string;
    paymentMethod: string;
    securityContext: string;
}> = ({ isOpen, onClose, onSuccess, amount, recipient }) => {
    const [state, setState] = useState<'idle' | 'scanning' | 'verifying' | 'success'>('idle');
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (state === 'scanning' && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;
            
            let animationFrame: number;
            const draw = () => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fillRect(0, 0, 300, 300);
                ctx.strokeStyle = '#06b6d4';
                ctx.lineWidth = 2;
                
                ctx.beginPath();
                for(let i = 0; i < 5; i++) {
                    const x = Math.random() * 300;
                    const y = Math.random() * 300;
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + Math.random() * 20 - 10, y + Math.random() * 20 - 10);
                }
                ctx.stroke();
                animationFrame = requestAnimationFrame(draw);
            };
            draw();
            return () => cancelAnimationFrame(animationFrame);
        }
    }, [state]);

    if (!isOpen) return null;

    const handleScan = () => {
        setState('scanning');
        setTimeout(() => setState('verifying'), 2000);
        setTimeout(() => {
            setState('success');
            setTimeout(onSuccess, 1500);
        }, 4000);
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center backdrop-blur-xl">
            <div className="relative bg-gray-900 border border-cyan-500/30 rounded-[2rem] p-12 max-w-md w-full text-center shadow-[0_0_100px_rgba(6,182,212,0.15)] overflow-hidden">
                
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

                {state === 'idle' && (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-300">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping"></div>
                            <div className="relative bg-gray-800 rounded-full w-full h-full flex items-center justify-center border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                                <Fingerprint size={48} className="text-cyan-400" />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">Identity Protocol</h3>
                            <p className="text-sm text-gray-400">
                                Authorizing transfer of <span className="text-cyan-400 font-mono font-bold">${amount}</span>
                                <br/>to <span className="text-white font-bold">{recipient}</span>
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button 
                                onClick={handleScan} 
                                className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-cyan-900/50 flex items-center justify-center gap-2"
                            >
                                <Fingerprint size={20} />
                                INITIATE SCAN
                            </button>
                            <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-300 uppercase font-bold tracking-widest transition-colors">
                                Abort Sequence
                            </button>
                        </div>
                    </div>
                )}

                {(state === 'scanning' || state === 'verifying') && (
                    <div className="py-8 space-y-8 relative">
                        <canvas ref={canvasRef} width={300} height={300} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-30 pointer-events-none" />
                        <div className="relative z-10">
                            <Loader2 size={64} className="text-cyan-400 animate-spin mx-auto" />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <h4 className="text-xl font-bold text-white animate-pulse">
                                {state === 'scanning' ? 'BIOMETRIC ACQUISITION' : 'QUANTUM VERIFICATION'}
                            </h4>
                            <p className="text-xs font-mono text-cyan-500/80 uppercase tracking-[0.3em]">
                                {state === 'scanning' ? 'Reading Neural Hash...' : 'Decrypting Secure Enclave...'}
                            </p>
                        </div>
                        <div className="h-1 w-48 bg-gray-800 mx-auto rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500 animate-progress-indeterminate"></div>
                        </div>
                    </div>
                )}

                {state === 'success' && (
                    <div className="py-8 space-y-6 animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                            <CheckCircle2 size={48} className="text-green-400" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Access Granted</h3>
                            <p className="text-sm text-gray-400">Transaction signed with Key ID: <span className="font-mono text-green-400">0x{generateHash().substring(0,8)}</span></p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * The "Monolith of Fun" - A comprehensive Payment & AI Command Center.
 */
export const QuantumPaymentTerminal: React.FC = () => {
    // State
    const [activeTab, setActiveTab] = useState<'form' | 'ai' | 'audit'>('form');
    const [formData, setFormData] = useState<PaymentFormData>({
        recipientName: '',
        accountNumber: '',
        routingNumber: '',
        amount: '',
        currency: 'USD',
        reference: '',
        paymentRail: 'WIRE'
    });
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: '1', role: 'system', content: 'Quantum Financial AI Core Online. Secure Channel Established.', timestamp: new Date() },
        { id: '2', role: 'ai', content: 'Greetings. I am your Sovereign Financial Architect. How can I assist with your capital allocation today?', timestamp: new Date() }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [securityAudit, setSecurityAudit] = useState<SecurityAuditResult | null>(null);
    const [showBiometrics, setShowBiometrics] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const chatEndRef = useRef<HTMLDivElement>(null);

    // Effects
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    // Handlers
    const addAuditLog = (action: string, status: 'success' | 'warning' | 'error' = 'success') => {
        const newLog: AuditLogEntry = {
            id: generateHash(),
            timestamp: new Date().toISOString(),
            action,
            actor: 'USR-ADMIN-01',
            status,
            hash: generateHash()
        };
        setAuditLogs(prev => [newLog, ...prev]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Simulate real-time audit on change
        if (Math.random() > 0.7) {
            addAuditLog(`FIELD_UPDATE: ${name}`, 'success');
        }
    };

    const runSecurityScan = () => {
        setSecurityAudit(null);
        setTimeout(() => {
            const score = Math.floor(Math.random() * 30); // Low score is good in risk? No, usually high score is good or bad depending on scale. Let's say 0-100 Risk Score (Low is good).
            // Actually let's make it a "Safety Score" or "Risk Score". Let's stick to Risk Score (Low = Good).
            const risk = Math.floor(Math.random() * 20); 
            
            setSecurityAudit({
                riskScore: risk,
                fraudProbability: Math.random() * 5,
                amlCompliance: 'pass',
                sanctionScreening: 'pass',
                quantumSignatureIntegrity: 'verified',
                recommendations: [
                    'Beneficiary bank is within trusted network.',
                    'Transaction amount within daily velocity limits.',
                    'Geo-IP matches historical patterns.'
                ],
                complianceAlerts: [],
                threatVectorAnalysis: ['No active threats detected on this rail.']
            });
            addAuditLog('SECURITY_SCAN_COMPLETED', 'success');
        }, 1500);
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.recipientName || !formData.amount) {
            addAuditLog('PAYMENT_VALIDATION_FAILED', 'error');
            return;
        }
        setShowBiometrics(true);
        addAuditLog('BIOMETRIC_CHALLENGE_INITIATED', 'warning');
    };

    const handleBiometricSuccess = () => {
        setShowBiometrics(false);
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            addAuditLog(`PAYMENT_EXECUTED: ${formData.amount} ${formData.currency} to ${formData.recipientName}`, 'success');
            // Reset form or show success state
            setFormData(prev => ({ ...prev, amount: '', reference: '' }));
            // AI Comment
            const aiMsg: ChatMessage = {
                id: generateHash(),
                role: 'ai',
                content: `Transaction of ${formatCurrency(formData.amount, formData.currency)} successfully executed via ${formData.paymentRail}. Blockchain proof: 0x${generateHash()}`,
                timestamp: new Date()
            };
            setChatHistory(prev => [...prev, aiMsg]);
        }, 2000);
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = {
            id: generateHash(),
            role: 'user',
            content: chatInput,
            timestamp: new Date()
        };

        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsProcessingAI(true);
        addAuditLog('AI_QUERY_INITIATED', 'success');

        // AI Logic
        const responseText = await aiController.generateResponse(chatHistory.concat(userMsg), formData);
        
        // Check for "Action Commands" in the AI response (JSON block)
        let cleanText = responseText;
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
        
        if (jsonMatch) {
            try {
                const command = JSON.parse(jsonMatch[1]);
                if (command.action === 'FILL_FORM' && command.data) {
                    setFormData(prev => ({ ...prev, ...command.data }));
                    addAuditLog('AI_AUTOPILOT_ACTION', 'warning');
                    cleanText = responseText.replace(jsonMatch[0], '').trim(); // Remove JSON from chat
                }
            } catch (e) {
                console.error("Failed to parse AI command", e);
            }
        }

        const aiMsg: ChatMessage = {
            id: generateHash(),
            role: 'ai',
            content: cleanText || "Command executed.",
            timestamp: new Date()
        };

        setChatHistory(prev => [...prev, aiMsg]);
        setIsProcessingAI(false);
    };

    // Render Helpers
    const TabButton = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 ${
                activeTab === id 
                ? 'border-cyan-500 text-cyan-400 bg-cyan-950/20' 
                : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
        >
            <Icon size={16} />
            {label}
        </button>
    );

    return (
        <div className="w-full max-w-6xl mx-auto bg-[#0B0F17] min-h-[800px] text-gray-100 font-sans selection:bg-cyan-500/30">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-[#0B0F17]/95 backdrop-blur sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-900/20">
                        <Globe className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-white">{DEMO_BANK_NAME}</h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] text-gray-400 uppercase tracking-widest">System Operational</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-900 rounded-full border border-gray-800">
                        <Lock size={12} className="text-cyan-500" />
                        <span className="text-xs text-gray-400 font-mono">TLS 1.3 ENCRYPTED</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">JB</span>
                    </div>
                </div>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-[calc(100vh-80px)] min-h-[700px]">
                
                {/* Left Panel: Navigation & Context */}
                <div className="lg:col-span-3 border-r border-gray-800 bg-[#0D111C] p-4 flex flex-col gap-6">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">Modules</p>
                        <nav className="space-y-1">
                            {['Payments', 'Liquidity', 'FX Trading', 'Supply Chain', 'Admin'].map((item) => (
                                <button key={item} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${item === 'Payments' ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                                    {item}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex-1">
                        <SecurityAuditDisplay auditResult={securityAudit} />
                    </div>

                    <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-2 mb-3">
                            <Database size={14} className="text-purple-400" />
                            <span className="text-xs font-bold text-gray-300 uppercase">Data Storage</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] text-gray-500">
                                <span>Audit Logs</span>
                                <span>{auditLogs.length} Records</span>
                            </div>
                            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <div className="bg-purple-500 h-full w-3/4"></div>
                            </div>
                            <p className="text-[10px] text-gray-600 italic mt-2">
                                Immutable ledger active. All actions are cryptographically signed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Center Panel: Workspace */}
                <div className="lg:col-span-6 bg-[#0B0F17] flex flex-col relative overflow-hidden">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-800 bg-[#0B0F17]/50 backdrop-blur z-10">
                        <TabButton id="form" icon={CreditCard} label="Payment Wire" />
                        <TabButton id="audit" icon={Activity} label="Live Ledger" />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
                        {activeTab === 'form' && (
                            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-light text-white">Initiate Transfer</h2>
                                    <p className="text-sm text-gray-400">Configure domestic or international wire parameters.</p>
                                </div>

                                <form onSubmit={handlePaymentSubmit} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Payment Rail</label>
                                            <select 
                                                name="paymentRail"
                                                value={formData.paymentRail}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                            >
                                                <option value="WIRE">FedWire (Real-time)</option>
                                                <option value="ACH">ACH (Same Day)</option>
                                                <option value="SWIFT">SWIFT gpi</option>
                                                <option value="BLOCKCHAIN">Quantum Ledger (Internal)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Currency</label>
                                            <select 
                                                name="currency"
                                                value={formData.currency}
                                                onChange={handleInputChange}
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                            >
                                                <option value="USD">USD - US Dollar</option>
                                                <option value="EUR">EUR - Euro</option>
                                                <option value="GBP">GBP - British Pound</option>
                                                <option value="JPY">JPY - Japanese Yen</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Beneficiary Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
                                            <input 
                                                type="text"
                                                name="recipientName"
                                                value={formData.recipientName}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Acme Corp International"
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-12 pr-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Account Number</label>
                                            <input 
                                                type="text"
                                                name="accountNumber"
                                                value={formData.accountNumber}
                                                onChange={handleInputChange}
                                                placeholder="0000000000"
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all font-mono"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Routing / SWIFT</label>
                                            <input 
                                                type="text"
                                                name="routingNumber"
                                                value={formData.routingNumber}
                                                onChange={handleInputChange}
                                                placeholder="XXXXXXXXX"
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 text-gray-400 font-bold">$</span>
                                            <input 
                                                type="number"
                                                name="amount"
                                                value={formData.amount}
                                                onChange={handleInputChange}
                                                placeholder="0.00"
                                                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white text-lg font-bold focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-4">
                                        <button 
                                            type="button"
                                            onClick={runSecurityScan}
                                            className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-gray-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-gray-700"
                                        >
                                            <Search size={18} />
                                            PRE-FLIGHT CHECK
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-[2] py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                            EXECUTE WIRE
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {activeTab === 'audit' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-light text-white">Immutable Audit Ledger</h3>
                                    <button className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                                        <RefreshCw size={12} /> REFRESH CHAIN
                                    </button>
                                </div>
                                <div className="space-y-2 font-mono text-xs">
                                    {auditLogs.length === 0 && (
                                        <div className="text-center py-20 text-gray-600">No activity recorded in current session.</div>
                                    )}
                                    {auditLogs.map((log) => (
                                        <div key={log.id} className="flex items-center gap-4 p-3 bg-gray-900/50 border border-gray-800 rounded hover:bg-gray-800 transition-colors group">
                                            <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-green-500' : log.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                                            <div className="text-gray-500 w-32">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                            <div className="flex-1 text-gray-300 font-bold">{log.action}</div>
                                            <div className="text-gray-600 hidden group-hover:block">HASH: {log.hash.substring(0, 12)}...</div>
                                            <div className="text-gray-500">{log.actor}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel: AI Copilot */}
                <div className="lg:col-span-3 border-l border-gray-800 bg-[#0D111C] flex flex-col">
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gradient-to-r from-cyan-950/30 to-transparent">
                        <div className="flex items-center gap-2">
                            <Bot className="text-cyan-400 w-5 h-5" />
                            <span className="font-bold text-sm text-white">Quantum Pilot</span>
                        </div>
                        <div className="px-2 py-0.5 bg-cyan-900/30 border border-cyan-500/30 rounded text-[10px] text-cyan-400 font-mono">
                            V 2.0.4
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-90">
                        {chatHistory.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                    msg.role === 'user' 
                                    ? 'bg-cyan-600 text-white rounded-br-none' 
                                    : msg.role === 'system'
                                    ? 'bg-gray-800/50 text-gray-400 text-xs font-mono border border-gray-700'
                                    : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                                }`}>
                                    {msg.content}
                                    <div className={`text-[10px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-cyan-100' : 'text-gray-500'}`}>
                                        {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isProcessingAI && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 p-3 rounded-2xl rounded-bl-none border border-gray-700 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="p-4 border-t border-gray-800 bg-[#0D111C]">
                        <form onSubmit={handleChatSubmit} className="relative">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ask Quantum AI..."
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all"
                            />
                            <button 
                                type="submit"
                                disabled={!chatInput.trim() || isProcessingAI}
                                className="absolute right-2 top-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:bg-gray-700"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </form>
                        <div className="mt-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {['Analyze Risk', 'Draft Wire', 'Explain Fees'].map(suggestion => (
                                <button 
                                    key={suggestion}
                                    onClick={() => setChatInput(suggestion)}
                                    className="whitespace-nowrap px-2 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded text-[10px] text-gray-400 transition-colors"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <BiometricModal 
                isOpen={showBiometrics}
                onClose={() => setShowBiometrics(false)}
                onSuccess={handleBiometricSuccess}
                amount={formData.amount}
                recipient={formData.recipientName}
                paymentMethod={formData.paymentRail}
                securityContext="HIGH_VALUE_TRANSFER"
            />
        </div>
    );
};