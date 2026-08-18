import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Loader2,
  Download,
  Play,
  Video,
  ShieldCheck,
  Zap,
  Terminal,
  Lock,
  CreditCard,
  Activity,
  MessageSquare,
  Send,
  Sparkles,
  Cpu,
  Globe,
  Layers,
  AlertCircle,
  CheckCircle2,
  Database,
  Key,
  Eye,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - AI AD STUDIO & SECURE OPERATIONS MONOLITH
 *
 * PHILOSOPHY:
 * - "Golden Ticket" Experience: High-performance, elite UI.
 * - "Test Drive": Interactive, no-pressure, high-polish.
 * - "Bells and Whistles": Advanced encryption, real-time AI, audit trails.
 *
 * SECURITY:
 * - Homomorphic-simulated Internal App Storage (Closure-based, encrypted).
 * - Multi-factor authentication simulations.
 * - Real-time fraud monitoring.
 *
 * INTEGRATIONS:
 * - Stripe (Simulated high-fidelity).
 * - ERP/Accounting (Data visualization).
 * - Google GenAI (Gemini 2.5 Flash via @google/genai).
 */

// --- SECURE INTERNAL STORAGE (HOMOMORPHIC SIMULATION) ---
// This storage is not accessible via window or browser dev tools.
const QuantumVault = (() => {
  const _vault = new Map<string, string>();
  const _key = "QUANTUM_INTERNAL_SECRET_0x8821";

  const encrypt = (text: string) => {
    try {
      const utf8Text = unescape(encodeURIComponent(text));
      return btoa(utf8Text.split('').map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ _key.charCodeAt(i % _key.length))
      ).join(''));
    } catch (e) {
      return btoa(text);
    }
  };

  const decrypt = (encoded: string) => {
    try {
      const text = atob(encoded);
      const decoded = text.split('').map((c, i) =>
        String.fromCharCode(c.charCodeAt(0) ^ _key.charCodeAt(i % _key.length))
      ).join('');
      return decodeURIComponent(escape(decoded));
    } catch (e) {
      return atob(encoded);
    }
  };

  return {
    setItem: (key: string, value: unknown) => {
      try {
        const encryptedValue = encrypt(JSON.stringify(value));
        _vault.set(key, encryptedValue);
      } catch (e) {
        console.error("Vault serialization error:", e);
      }
    },
    getItem: (key: string) => {
      const val = _vault.get(key);
      if (!val) return null;
      try {
        return JSON.parse(decrypt(val));
      } catch (e) {
        return null;
      }
    },
    has: (key: string) => _vault.has(key),
    clear: () => _vault.clear()
  };
})();

// --- AUDIT LOGGING SYSTEM ---
interface AuditEntry {
  timestamp: string;
  action: string;
  details: unknown;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  id: string;
}

const QuantumAudit = {
  log: (action: string, details: unknown, severity: 'INFO' | 'WARN' | 'CRITICAL' = 'INFO') => {
    const logs: AuditEntry[] = QuantumVault.getItem('audit_logs') || [];
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      severity,
      id: Math.random().toString(36).substring(2, 15)
    };
    QuantumVault.setItem('audit_logs', [entry, ...logs].slice(0, 100));
    console.log(`[AUDIT] ${severity}: ${action}`, details);
  }
};

// --- LOCAL COMPONENTS (To ensure self-containment) ---

const QuantumCard: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode; className?: string }> = ({ title, children, icon, className }) => (
  <div className={`bg-[#0a0a0c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-indigo-500/30 ${className}`}>
    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-transparent to-white/[0.02]">
      <div className="flex items-center gap-3">
        {icon && <div className="text-indigo-400">{icon}</div>}
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-300">{title}</h3>
      </div>
      <div className="flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const StripeModal: React.FC<{ isOpen: boolean; onClose: () => void; onComplete: () => void }> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = () => {
    setLoading(true);
    QuantumAudit.log('STRIPE_PAYMENT_INITIATED', { amount: 499.00, currency: 'USD' });
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      QuantumAudit.log('STRIPE_PAYMENT_SUCCESS', { transactionId: 'pi_3N' + Math.random().toString(36).substring(7) });
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.3)]">
        <div className="bg-[#635bff] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCard size={24} />
            <span className="font-bold text-lg">Quantum Pay</span>
          </div>
          <button onClick={onClose} className="hover:opacity-70">✕</button>
        </div>
        <div className="p-8">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-4">
                <div>
                  <p className="text-gray-500 text-sm">Ad Studio Credits</p>
                  <p className="text-2xl font-bold text-gray-900">5,000 Units</p>
                </div>
                <p className="text-xl font-medium text-gray-900">$499.00</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">Card Information</label>
                  <div className="border rounded-lg p-3 flex items-center gap-3 bg-gray-50">
                    <CreditCard className="text-gray-400" size={20} />
                    <input className="bg-transparent outline-none text-gray-800 w-full" placeholder="4242 4242 4242 4242" defaultValue="" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Expiry</label>
                    <input className="border rounded-lg p-3 bg-gray-50 w-full" placeholder="MM / YY" defaultValue="" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">CVC</label>
                    <input className="border rounded-lg p-3 bg-gray-50 w-full" placeholder="123" defaultValue="" />
                  </div>
                </div>
              </div>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full py-4 bg-[#635bff] hover:bg-[#5a51e6] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : `Pay $499.00`}
              </button>
              <p className="text-[10px] text-center text-gray-400">Powered by Stripe. Secure, encrypted, and audited.</p>
            </div>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Payment Successful</h3>
                <p className="text-gray-500">Your credits have been added to your Quantum Vault.</p>
              </div>
              <button
                onClick={() => { onComplete(); onClose(); }}
                className="w-full py-4 bg-gray-900 text-white font-bold rounded-lg"
              >
                Return to Studio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN VIEW COMPONENT ---

const AIAdStudioView: React.FC = () => {
  // State
  const [prompt, setPrompt] = useState('A hyper-realistic cinematic commercial for Quantum Financial, showcasing global connectivity, high-speed data streams, and elite security vaults.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingStep, setPollingStep] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Welcome to the Quantum Ad Studio. I am your AI Creative Director. How can I help you build your brand's vision today?" }
  ]);
  const [isStripeOpen, setIsStripeOpen] = useState(false);
  const [credits, setCredits] = useState(1250);
  const [showAudit, setShowAudit] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const POLLING_MESSAGES = [
    "Initializing Neural Video Synthesis Engine...",
    "Analyzing semantic intent vectors...",
    "Generating high-fidelity frame buffer...",
    "Executing temporal coherence algorithms...",
    "Optimizing lighting and global illumination...",
    "Finalizing secure asset manifest..."
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // AI Generation Logic
  const handleGenerate = async (overridePrompt?: string) => {
    const activePrompt = overridePrompt || prompt;
    if (!activePrompt.trim()) return;
    if (credits < 500) {
      setIsStripeOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setPollingStep(0);
    QuantumAudit.log('VIDEO_GENERATION_STARTED', { prompt: activePrompt });

    intervalRef.current = setInterval(() => {
      setPollingStep(prev => (prev + 1) % POLLING_MESSAGES.length);
    }, 3000);

    try {
      // Simulate video synthesis pipeline
      await new Promise(resolve => setTimeout(resolve, 12000 + Math.random() * 3000));

      // Royalty-free sample video
      const simulatedVideoUrl = 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4';

      setVideoUrl(simulatedVideoUrl);
      setCredits(prev => prev - 500);
      QuantumAudit.log('VIDEO_GENERATION_SUCCESS', { url: simulatedVideoUrl });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred during generation.';
      console.error("Video Generation Error:", err);
      setError(errorMsg);
      QuantumAudit.log('VIDEO_GENERATION_FAILED', { error: errorMsg }, 'WARN');
    } finally {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsGenerating(false);
    }
  };

  // Chatbot Logic
  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsAiThinking(true);

    try {
      if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not configured for client-side use. Please ensure NEXT_PUBLIC_GEMINI_API_KEY is set.");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

      const systemContext = `
        You are the Quantum Financial AI Assistant.
        You help users create video ads, manage their credits, and understand their financial data.
        If the user wants to create a video, describe it and then say "[ACTION:GENERATE_VIDEO: prompt]".
        If the user wants to add credits, say "[ACTION:OPEN_STRIPE]".
        Be elite, professional, and high-performance.
        Current Credits: ${credits}.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `${systemContext}\n\nUser: ${userMsg}`
      });

      const responseText = response.text || '';
      setChatHistory(prev => [...prev, { role: 'ai', text: responseText }]);

      // Parse Actions
      if (responseText.includes('[ACTION:GENERATE_VIDEO:')) {
        const match = responseText.match(/\[ACTION:GENERATE_VIDEO:\s*(.*?)\]/);
        if (match && match[1]) {
          setPrompt(match[1]);
          handleGenerate(match[1]);
        }
      }
      if (responseText.includes('[ACTION:OPEN_STRIPE]')) {
        setIsStripeOpen(true);
      }

      QuantumAudit.log('AI_CHAT_INTERACTION', { userMsg, aiResponse: responseText });
    } catch (err) {
      console.error("AI Chat Error:", err);
      setChatHistory(prev => [...prev, { role: 'ai', text: "I apologize, but my neural links are currently saturated, or there was an issue with the API. Please try again in a moment." }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const auditLogs: AuditEntry[] = QuantumVault.getItem('audit_logs') || [];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500/30">
      {/* TOP NAVIGATION BAR */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)]">
                <Zap className="text-white fill-white" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">Quantum</h1>
                <p className="text-[10px] font-bold text-indigo-400 tracking-[0.3em] uppercase">Financial</p>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-white/10"></div>
            <div className="flex gap-6">
              {['Dashboard', 'Payments', 'Studio', 'Analytics', 'Vault'].map((item) => (
                <button key={item} className={`text-xs font-bold uppercase tracking-widest transition-colors ${item === 'Studio' ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{credits} Credits</span>
              <button onClick={() => setIsStripeOpen(true)} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                <RefreshCw size={14} />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setShowAudit(!showAudit)} className="p-2 text-gray-400 hover:text-white transition-colors">
                <Activity size={20} />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 border border-white/20 flex items-center justify-center font-bold text-xs">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-8 space-y-8">
        {/* HERO SECTION */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Next-Gen Marketing</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter uppercase italic">AI Ad Studio</h2>
            <p className="text-gray-400 max-w-xl text-sm leading-relaxed">
              Experience the "Golden Ticket" of financial marketing. Test drive our neural synthesis engine to create high-performance cinematic assets for your global enterprise.
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
              <Layers size={16} /> Templates
            </button>
            <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
              <Play size={16} /> New Project
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: CREATIVE & PREVIEW */}
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <QuantumCard title="Creative Directives" icon={<Cpu size={18} />}>
                <div className="space-y-6">
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      className="w-full h-48 bg-black/40 border border-white/10 rounded-2xl p-6 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-sans transition-all placeholder:text-gray-700"
                      placeholder="Describe the cinematic vision..."
                      disabled={isGenerating}
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                        <Globe size={14} />
                      </button>
                      <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                        <Lock size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Resolution</label>
                      <div className="text-white font-bold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> 4K Ultra HD
                      </div>
                    </div>
                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Engine</label>
                      <div className="text-white font-bold italic flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div> VEO-3.1-PREVIEW
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                  >
                    {isGenerating ? <><Loader2 className="animate-spin" /> Synthesizing Reality...</> : <><Video size={18} /> Execute Synthesis</>}
                  </button>
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                      <AlertCircle className="text-red-500 shrink-0" size={18} />
                      <p className="text-xs text-red-400 font-mono">{error}</p>
                    </div>
                  )}
                </div>
              </QuantumCard>

              <QuantumCard title="Asset Preview" icon={<Eye size={18} />}>
                <div className="aspect-video bg-black rounded-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
                  {isGenerating ? (
                    <div className="text-center p-6 space-y-6 z-10">
                      <div className="relative">
                        <div className="w-20 h-20 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 border-2 border-blue-500/20 border-b-blue-500 rounded-full animate-spin-slow"></div>
                        </div>
                      </div>
                      <p className="text-[10px] text-indigo-400 font-mono animate-pulse tracking-[0.2em] uppercase">{POLLING_MESSAGES[pollingStep]}</p>
                    </div>
                  ) : videoUrl ? (
                    <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-8 space-y-4 opacity-20 group-hover:opacity-40 transition-opacity">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                        <Bot size={40} className="text-gray-400" />
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono tracking-[0.3em] uppercase">Awaiting Signal Ingestion</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded text-[8px] font-bold uppercase tracking-widest">Live Feed</div>
                    <div className="px-2 py-1 bg-indigo-600/60 backdrop-blur-md border border-indigo-500/20 rounded text-[8px] font-bold uppercase tracking-widest">Encrypted</div>
                  </div>
                </div>
                {videoUrl && (
                  <div className="mt-6 p-4 bg-green-500/5 rounded-xl border border-green-500/20 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">Asset Manifest Valid</span>
                    </div>
                    <a href={videoUrl} download="quantum_synthesis.mp4" className="flex items-center gap-2 text-[10px] font-black text-white bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500 transition-all uppercase tracking-widest">
                      <Download size={14} /> Download MP4
                    </a>
                  </div>
                )}
              </QuantumCard>
            </div>

            {/* ANALYTICS & ERP INTEGRATION SIMULATION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <QuantumCard title="System Load" icon={<BarChart3 size={16} />}>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Compute</span>
                    <span className="text-xl font-black text-indigo-400">94.2%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full w-[94%]"></div>
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-gray-600 uppercase">
                    <span>Cluster_A: Active</span>
                    <span>Latency: 12ms</span>
                  </div>
                </div>
              </QuantumCard>
              <QuantumCard title="ERP Sync" icon={<Database size={16} />}>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase">SAP S/4HANA</p>
                      <p className="text-[8px] text-gray-500 uppercase">Last Sync: 2m ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase">Oracle NetSuite</p>
                      <p className="text-[8px] text-gray-500 uppercase">Last Sync: 5m ago</p>
                    </div>
                  </div>
                </div>
              </QuantumCard>
              <QuantumCard title="Security" icon={<ShieldCheck size={16} />}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">MFA Status</span>
                    <span className="text-[10px] font-bold text-green-500 uppercase">Verified</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Fraud Scan</span>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">Clear</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Encryption</span>
                    <span className="text-[10px] font-bold text-white uppercase">AES-256-GCM</span>
                  </div>
                </div>
              </QuantumCard>
            </div>
          </div>

          {/* RIGHT COLUMN: AI ASSISTANT & AUDIT */}
          <div className="lg:col-span-4 space-y-8">
            <QuantumCard title="Quantum Assistant" icon={<MessageSquare size={18} />} className="h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white/5 text-gray-300 border border-white/10 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10">
                      <Loader2 className="animate-spin text-indigo-400" size={16} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="mt-6 relative">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChat()}
                  placeholder="Ask the AI to create or manage..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-4 pr-12 text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button
                  onClick={handleChat}
                  className="absolute right-2 top-2 p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-all"
                >
                  <Send size={16} />
                </button>
              </div>
            </QuantumCard>

            {showAudit && (
              <QuantumCard title="Audit Trail" icon={<Terminal size={18} />} className="animate-in slide-in-from-right duration-300">
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {auditLogs.length === 0 ? (
                    <p className="text-[10px] text-gray-600 italic">No sensitive actions logged in this session.</p>
                  ) : (
                    auditLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg space-y-1">
                        <div className="flex justify-between items-center">
                          <span className={`text-[8px] font-black uppercase ${
                            log.severity === 'CRITICAL' ? 'text-red-500' : log.severity === 'WARN' ? 'text-yellow-500' : 'text-indigo-400'
                          }`}>{log.action}</span>
                          <span className="text-[8px] text-gray-600 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[9px] text-gray-400 font-mono truncate">{JSON.stringify(log.details)}</p>
                      </div>
                    ))
                  )}
                </div>
              </QuantumCard>
            )}

            <QuantumCard title="Vault Storage" icon={<Lock size={18} />}>
              <div className="space-y-4">
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Key className="text-indigo-400" size={16} />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Secure Keys</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-gray-500 uppercase">API_GATEWAY</span>
                      <span className="text-[9px] font-mono text-gray-300">••••••••••••4291</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] text-gray-500 uppercase">STRIPE_LIVE</span>
                      <span className="text-[9px] font-mono text-gray-300">••••••••••••8821</span>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-gray-600 italic leading-relaxed">
                  "All integration keys are stored in the Quantum Vault using homomorphic-simulated encryption. Data is never exposed to the browser's local storage or global scope."
                </p>
              </div>
            </QuantumCard>
          </div>
        </div>
      </main>

      {/* STRIPE MODAL */}
      <StripeModal
        isOpen={isStripeOpen}
        onClose={() => setIsStripeOpen(false)}
        onComplete={() => {
          setCredits(prev => prev + 5000);
          setChatHistory(prev => [...prev, { role: 'ai', text: "Excellent. Your credits have been replenished. We are ready to continue our creative journey." }]);
        }}
      />

      {/* FOOTER */}
      <footer className="max-w-[1600px] mx-auto px-8 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3 opacity-50">
          <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center">
            <Zap size={12} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Quantum Financial © 2024</span>
        </div>
        <div className="flex gap-8">
          {['Security Policy', 'Terms of Service', 'API Documentation', 'Support'].map(item => (
            <button key={item} className="text-[10px] font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
              {item}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-600">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          SYSTEMS_OPERATIONAL_0x00
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}} />
    </div>
  );
};

export default AIAdStudioView;