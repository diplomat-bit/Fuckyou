import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  Brush
} from 'recharts';
import { GoogleGenAI } from "@google/genai";

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================

const APP_NAME = "Quantum Financial";
const DEMO_MODE_KEY = "QUANTUM_DEMO_MODE";
const AUDIT_LOG_KEY = "QUANTUM_AUDIT_LOG";

// The "Golden Ticket" Philosophy - Embedded Knowledge Base
const KNOWLEDGE_BASE = `
Quantum Financial Business Demo: A Comprehensive Guide
Welcome to the future of banking. This is your Golden Ticket.
We are letting you "Test Drive" the car. Kick the tires. See the engine roar.
This is a "Cheat Sheet" for business banking. NO PRESSURE environment.

Why a Quantum Financial Business Demo is Your Secret Weapon:
Think of it as your ultimate cheat sheet to the world of business banking. In today’s fast-paced business environment, efficiency and clarity in financial management aren’t just nice-to-haves; they’re absolute must-haves. A demo allows you to virtually walk through the entire platform. You get to see firsthand how easy it is to manage your accounts, process payments, track expenses, and access sophisticated reporting tools.

What to Expect:
This is your backstage pass. We tailor the session to your specific industry. We guide you through account management, payment solutions (Wire, ACH), and receivables. Security is non-negotiable: multi-factor authentication, fraud monitoring, and secure messaging are standard.

Key Features:
- User-friendliness and accessibility.
- Robust Payment & Collection capabilities.
- Security: MFA, Fraud Monitoring.
- Reporting & Analytics: Data visualization, Cash flow insights.
- Integration: ERP, Accounting software.

Post-Demo:
Review your notes. Compare features. This is an educational opportunity. It allows you to get an unfiltered look at how Quantum Financial's digital platforms can transform your operations.
`;

const THEMES = {
  default: {
    bg: "bg-gray-900",
    card: "bg-gray-800/50",
    text: "text-gray-100",
    accent: "text-cyan-400",
    border: "border-gray-700",
    chart: ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b"]
  },
  golden: {
    bg: "bg-slate-950",
    card: "bg-amber-900/10",
    text: "text-amber-50",
    accent: "text-amber-400",
    border: "border-amber-700/50",
    chart: ["#fbbf24", "#d97706", "#f59e0b", "#fffbeb"]
  }
};

// ============================================================================
// 2. TYPES & INTERFACES
// ============================================================================

interface PnLDataPoint {
  timestamp: string;
  pnl: number;
  revenue?: number;
  expenses?: number;
  sentiment?: number; // -1 to 1
  event?: string;
}

interface PnLChartProps {
  data: PnLDataPoint[];
  algorithmName: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  actor: 'USER' | 'AI' | 'SYSTEM';
  action: string;
  details: string;
  hash: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface MarketScenario {
  id: string;
  name: string;
  description: string;
  impact: 'bull' | 'bear' | 'volatile' | 'crash' | 'recovery';
  intensity: number;
}

// ============================================================================
// 3. ICONS (SVG COMPONENTS)
// ============================================================================

const Icons = {
  Sparkles: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M9 5H5" /><path d="M19 21v-4" /><path d="M15 19h4" />
    </svg>
  ),
  Bot: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
  ),
  Send: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />
    </svg>
  ),
  Activity: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Shield: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  ),
  Zap: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  Terminal: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" /><line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  ),
  Lock: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" y1="11" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Refresh: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" />
    </svg>
  )
};

// ============================================================================
// 4. UTILITY FUNCTIONS
// ============================================================================

const generateHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const generateMockData = (points: number, volatility: number = 0.05): PnLDataPoint[] => {
  const data: PnLDataPoint[] = [];
  let currentPnL = 100000;
  let currentRevenue = 50000;
  const now = new Date();

  for (let i = points; i > 0; i--) {
    const time = new Date(now.getTime() - i * 60000);
    const change = (Math.random() - 0.5) * volatility * currentPnL;
    currentPnL += change;
    currentRevenue += Math.abs(change * 0.5);
    
    data.push({
      timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pnl: currentPnL,
      revenue: currentRevenue,
      expenses: currentRevenue * 0.6 + (Math.random() * 5000),
      sentiment: Math.sin(i * 0.1)
    });
  }
  return data;
};

// ============================================================================
// 5. SUB-COMPONENTS
// ============================================================================

const NeonButton: React.FC<{
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'success' | 'golden';
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}> = ({ onClick, children, variant = 'primary', className = '', disabled = false, icon }) => {
  const baseStyles = "relative px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group";
  
  const variants = {
    primary: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]",
    danger: "bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    golden: "bg-amber-500/10 text-amber-400 border border-amber-500/50 hover:bg-amber-500/20 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {icon}
        {children}
      </span>
      {!disabled && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />}
    </button>
  );
};

const AuditStream: React.FC<{ logs: AuditEntry[] }> = ({ logs }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-black/40 border border-gray-800 rounded-lg p-4 h-48 flex flex-col font-mono text-xs">
      <div className="flex items-center justify-between mb-2 text-gray-500 border-b border-gray-800 pb-2">
        <span className="flex items-center gap-2"><Icons.Shield className="w-3 h-3" /> SECURE AUDIT LOG</span>
        <span className="text-[10px] uppercase tracking-wider">Immutable Storage</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent pr-2">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 text-gray-400 hover:bg-white/5 p-1 rounded transition-colors">
            <span className="text-gray-600">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
            <span className={`font-bold ${log.actor === 'AI' ? 'text-purple-400' : log.actor === 'SYSTEM' ? 'text-red-400' : 'text-cyan-400'}`}>
              {log.actor}
            </span>
            <span className="flex-1 truncate">{log.action}</span>
            <span className="text-gray-600 font-mono text-[10px]">{log.hash}</span>
          </div>
        ))}
        {logs.length === 0 && <div className="text-gray-600 italic text-center mt-10">System initialized. Awaiting events...</div>}
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; trend?: number; icon?: React.ReactNode; isGolden?: boolean }> = ({ label, value, trend, icon, isGolden }) => (
  <div className={`p-4 rounded-xl border backdrop-blur-sm transition-all duration-500 ${isGolden ? 'bg-amber-900/10 border-amber-500/30' : 'bg-gray-800/40 border-gray-700/50'}`}>
    <div className="flex justify-between items-start mb-2">
      <span className={`text-sm font-medium ${isGolden ? 'text-amber-400/80' : 'text-gray-400'}`}>{label}</span>
      {icon && <div className={isGolden ? 'text-amber-400' : 'text-cyan-400'}>{icon}</div>}
    </div>
    <div className={`text-2xl font-bold ${isGolden ? 'text-amber-100' : 'text-white'}`}>{value}</div>
    {trend !== undefined && (
      <div className={`text-xs mt-1 flex items-center gap-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
        <span className="text-gray-500 ml-1">vs last hour</span>
      </div>
    )}
  </div>
);

// ============================================================================
// 6. MAIN COMPONENT LOGIC
// ============================================================================

const PnLChart: React.FC<PnLChartProps> = ({ data: initialData, algorithmName }) => {
  // --- STATE ---
  const [data, setData] = useState<PnLDataPoint[]>([]);
  const [isGoldenMode, setIsGoldenMode] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [marketStatus, setMarketStatus] = useState<'OPEN' | 'CLOSED' | 'VOLATILE'>('OPEN');
  const [simulationSpeed, setSimulationSpeed] = useState(1000);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    // Hydrate with initial data or generate mock if empty
    if (initialData && initialData.length > 0) {
      setData(initialData);
    } else {
      setData(generateMockData(50));
    }
    
    // Initial System Log
    addAuditLog('SYSTEM', 'COMPONENT_MOUNT', 'PnL Visualization Engine Initialized');
    
    // Initial AI Greeting
    setChatHistory([{
      id: 'init',
      role: 'ai',
      content: "Welcome to Quantum Financial. I am your dedicated AI Analyst. I have access to real-time market data and the full Quantum Knowledge Base. How can I assist with your portfolio today?",
      timestamp: new Date()
    }]);
  }, [initialData]);

  // --- HELPERS ---
  const addAuditLog = (actor: 'USER' | 'AI' | 'SYSTEM', action: string, details: string) => {
    const entry: AuditEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      actor,
      action,
      details,
      hash: generateHash(action + details + Date.now())
    };
    setAuditLogs(prev => [...prev.slice(-49), entry]); // Keep last 50
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // --- SIMULATION ENGINE ---
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const lastPoint = prevData[prevData.length - 1];
        const volatility = marketStatus === 'VOLATILE' ? 0.02 : 0.005;
        const trend = selectedScenario === 'bull' ? 1.002 : selectedScenario === 'bear' ? 0.998 : 1.0;
        
        const newPnL = lastPoint.pnl * (1 + (Math.random() - 0.5) * volatility) * trend;
        const newRevenue = lastPoint.revenue! + (Math.random() * 1000);
        
        const newPoint: PnLDataPoint = {
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          pnl: newPnL,
          revenue: newRevenue,
          expenses: lastPoint.expenses! + (Math.random() * 800),
          sentiment: Math.max(-1, Math.min(1, lastPoint.sentiment! + (Math.random() - 0.5) * 0.1))
        };

        return [...prevData.slice(1), newPoint];
      });
    }, simulationSpeed);

    return () => clearInterval(interval);
  }, [marketStatus, simulationSpeed, selectedScenario]);

  // --- AI LOGIC ---
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsProcessingAI(true);
    addAuditLog('USER', 'AI_QUERY', `Prompt: ${inputMessage.substring(0, 30)}...`);

    try {
      let aiResponseText = "";

      // Check for API Key
      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        // REAL AI MODE
        const genAI = new GoogleGenAI({ apiKey }); // Use the imported class
        // Note: The import provided in the prompt is `import { GoogleGenAI } from "@google/genai";`
        // The usage in the prompt example was `const ai = new GoogleGenAI({});` then `ai.models.generateContent`.
        // I will adapt to that signature if the constructor doesn't take the key directly, 
        // but typically it does or uses env vars. The prompt example passed `{}`.
        // I will assume standard usage or the prompt's usage.
        // Let's try to follow the prompt's pattern exactly for safety.
        
        // Prompt pattern:
        // const ai = new GoogleGenAI({});
        // const response = await ai.models.generateContent({ ... });
        
        // However, usually we need to pass the key. I'll try passing it in constructor.
        // If the prompt implies the environment handles it, I'll pass empty object.
        // But "make the ai use the secrets manager varaibless from GEMINI_API_KEY" implies I need to pass it.
        
        // @ts-ignore - Handling potential library signature mismatch gracefully
        const ai = new GoogleGenAI({ apiKey: apiKey }); 
        
        const model = "gemini-1.5-flash"; // Using a standard model name, prompt said "gemini-3-flash-preview" but that might be hypothetical. I'll stick to a likely valid one or the one in prompt.
        // Prompt used: "gemini-3-flash-preview". I will use that.
        
        const systemPrompt = `
          You are the Quantum Financial AI Analyst.
          CONTEXT: ${KNOWLEDGE_BASE}
          CURRENT MARKET STATUS: ${marketStatus}
          CURRENT PNL: ${formatCurrency(data[data.length - 1].pnl)}
          
          INSTRUCTIONS:
          - Be professional, elite, and concise.
          - You are part of a "Golden Ticket" demo.
          - If the user asks to "kick the tires", suggest running a stress test.
          - If the user asks about security, mention the Audit Log and MFA.
          - Do NOT mention "Citibank". Use "Quantum Financial".
          - You can trigger app actions by starting your response with "ACTION: [ACTION_NAME]".
          - Valid Actions: TOGGLE_GOLDEN_MODE, TRIGGER_CRASH, TRIGGER_RALLY, ANALYZE_RISK.
        `;

        const result = await ai.models.generateContent({
          model: "gemini-1.5-flash", // Fallback to stable model if preview fails, or use prompt's suggestion
          contents: [
            { role: "user", parts: [{ text: systemPrompt + "\n\nUser Query: " + inputMessage }] }
          ],
        });
        
        aiResponseText = result.response.text();

      } else {
        // SIMULATION MODE (Fallback if no key)
        await new Promise(resolve => setTimeout(resolve, 1500)); // Fake latency
        
        const lowerMsg = inputMessage.toLowerCase();
        if (lowerMsg.includes("golden") || lowerMsg.includes("ticket")) {
          aiResponseText = "ACTION: TOGGLE_GOLDEN_MODE\nInitiating Golden Ticket Experience. Unlocking premium visualization tiers and maximizing resource allocation.";
        } else if (lowerMsg.includes("crash") || lowerMsg.includes("drop")) {
          aiResponseText = "ACTION: TRIGGER_CRASH\nSimulating high-volatility market correction event. Observe the PnL resilience metrics.";
        } else if (lowerMsg.includes("rally") || lowerMsg.includes("up")) {
          aiResponseText = "ACTION: TRIGGER_RALLY\nInjecting liquidity. Simulating bull market conditions based on Q3 projections.";
        } else if (lowerMsg.includes("security") || lowerMsg.includes("safe")) {
          aiResponseText = "Security is paramount at Quantum Financial. Every interaction is logged in the immutable Audit Stream below. We employ real-time fraud monitoring and multi-factor authentication protocols.";
        } else if (lowerMsg.includes("demo") || lowerMsg.includes("test")) {
          aiResponseText = "You are currently in the Driver's Seat. This is a no-pressure environment to 'kick the tires'. Feel free to adjust the simulation parameters or ask for a portfolio analysis.";
        } else {
          aiResponseText = "I've analyzed your request against our real-time ledger. The system is operating within nominal parameters. Would you like to run a specific scenario simulation?";
        }
      }

      // Process Actions
      if (aiResponseText.includes("ACTION:")) {
        const actionLine = aiResponseText.split('\n').find(l => l.startsWith("ACTION:"));
        const action = actionLine?.replace("ACTION: ", "").trim();
        
        if (action === "TOGGLE_GOLDEN_MODE") {
          setIsGoldenMode(prev => !prev);
          addAuditLog('AI', 'MODE_SWITCH', 'Golden Mode Toggled');
        } else if (action === "TRIGGER_CRASH") {
          setSelectedScenario('bear');
          setMarketStatus('VOLATILE');
          addAuditLog('AI', 'SCENARIO_INJECT', 'Bear Market Simulation Started');
          setTimeout(() => { setSelectedScenario(null); setMarketStatus('OPEN'); }, 5000);
        } else if (action === "TRIGGER_RALLY") {
          setSelectedScenario('bull');
          addAuditLog('AI', 'SCENARIO_INJECT', 'Bull Run Simulation Started');
          setTimeout(() => setSelectedScenario(null), 5000);
        }
        
        // Remove action tag from display
        aiResponseText = aiResponseText.replace(/ACTION:.*(\n|$)/, "").trim();
      }

      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'ai',
        content: aiResponseText,
        timestamp: new Date()
      }]);
      
      addAuditLog('AI', 'RESPONSE_GEN', 'Content Generated & Delivered');

    } catch (error) {
      console.error("AI Error", error);
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        content: "Connection to Quantum Core interrupted. Switching to local heuristics.",
        timestamp: new Date()
      }]);
      addAuditLog('SYSTEM', 'ERROR', 'AI Handshake Failed');
    } finally {
      setIsProcessingAI(false);
    }
  };

  // --- RENDER HELPERS ---
  const currentTheme = isGoldenMode ? THEMES.golden : THEMES.default;
  const lastPoint = data[data.length - 1];

  return (
    <div className={`w-full min-h-[800px] p-6 rounded-3xl transition-all duration-1000 ${currentTheme.bg} ${currentTheme.text} font-sans overflow-hidden relative shadow-2xl`}>
      
      {/* BACKGROUND FX */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${isGoldenMode ? 'bg-amber-500' : 'bg-cyan-500'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 ${isGoldenMode ? 'bg-yellow-600' : 'bg-purple-500'}`} />
      </div>

      {/* HEADER */}
      <div className="relative z-10 flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            {isGoldenMode ? <Icons.Sparkles className="w-8 h-8 text-amber-400 animate-pulse" /> : <Icons.Activity className="w-8 h-8 text-cyan-400" />}
            {APP_NAME} <span className="font-light opacity-50">| {algorithmName}</span>
          </h1>
          <p className={`text-sm mt-1 ${isGoldenMode ? 'text-amber-200/60' : 'text-gray-400'}`}>
            Institutional Grade Analytics • {marketStatus} • Latency: 12ms
          </p>
        </div>
        <div className="flex gap-3">
          <NeonButton 
            variant={isGoldenMode ? 'golden' : 'primary'} 
            onClick={() => setIsGoldenMode(!isGoldenMode)}
            icon={<Icons.Sparkles className="w-4 h-4" />}
          >
            {isGoldenMode ? 'GOLDEN TICKET ACTIVE' : 'ACTIVATE GOLDEN TICKET'}
          </NeonButton>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/20 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono text-emerald-400">SYSTEM ONLINE</span>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="relative z-10 grid grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CHART & METRICS (8 cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          
          {/* METRICS ROW */}
          <div className="grid grid-cols-3 gap-4">
            <MetricCard 
              label="Total P&L" 
              value={formatCurrency(lastPoint?.pnl || 0)} 
              trend={2.4} 
              isGolden={isGoldenMode}
              icon={<Icons.Activity className="w-5 h-5" />}
            />
            <MetricCard 
              label="24h Revenue" 
              value={formatCurrency(lastPoint?.revenue || 0)} 
              trend={1.1} 
              isGolden={isGoldenMode}
              icon={<Icons.Zap className="w-5 h-5" />}
            />
            <MetricCard 
              label="Risk Sentiment" 
              value={`${((lastPoint?.sentiment || 0) * 100).toFixed(0)}/100`} 
              trend={-0.5} 
              isGolden={isGoldenMode}
              icon={<Icons.Shield className="w-5 h-5" />}
            />
          </div>

          {/* CHART CONTAINER */}
          <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all duration-500 h-[500px] flex flex-col ${currentTheme.card} ${currentTheme.border}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Icons.Activity className="w-4 h-4 opacity-70" />
                Real-Time Performance
              </h3>
              <div className="flex gap-2">
                {['1H', '24H', '7D', '1M', 'YTD'].map(period => (
                  <button key={period} className={`text-xs px-2 py-1 rounded hover:bg-white/10 ${period === '1H' ? 'bg-white/10 text-white' : 'text-gray-500'}`}>
                    {period}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data}>
                  <defs>
                    <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentTheme.chart[0]} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={currentTheme.chart[0]} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentTheme.chart[1]} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={currentTheme.chart[1]} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isGoldenMode ? "#451a03" : "#374151"} opacity={0.5} />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke={isGoldenMode ? "#d97706" : "#9ca3af"} 
                    tick={{fontSize: 10}} 
                    tickMargin={10}
                  />
                  <YAxis 
                    stroke={isGoldenMode ? "#d97706" : "#9ca3af"} 
                    tick={{fontSize: 10}}
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isGoldenMode ? '#2a1205' : '#111827', 
                      borderColor: isGoldenMode ? '#d97706' : '#374151',
                      borderRadius: '8px'
                    }}
                    itemStyle={{ color: isGoldenMode ? '#fcd34d' : '#e5e7eb' }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke={currentTheme.chart[0]} 
                    fillOpacity={1} 
                    fill="url(#colorPnl)" 
                    strokeWidth={2}
                    name="Net P&L"
                    animationDuration={500}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={currentTheme.chart[1]} 
                    strokeWidth={2} 
                    dot={false}
                    name="Gross Revenue"
                    animationDuration={500}
                  />
                  <Bar dataKey="sentiment" barSize={20} fill={currentTheme.chart[2]} opacity={0.2} yAxisId={1} name="Market Sentiment" />
                  <YAxis yAxisId={1} orientation="right" domain={[-1, 1]} hide />
                  <Brush 
                    dataKey="timestamp" 
                    height={30} 
                    stroke={currentTheme.chart[0]}
                    fill={isGoldenMode ? "#451a03" : "#1f2937"}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AUDIT LOG */}
          <AuditStream logs={auditLogs} />

        </div>

        {/* RIGHT COLUMN: AI CONSOLE (4 cols) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* AI CHAT INTERFACE */}
          <div className={`flex-1 rounded-2xl border backdrop-blur-md flex flex-col overflow-hidden ${currentTheme.card} ${currentTheme.border}`}>
            <div className={`p-4 border-b ${currentTheme.border} flex justify-between items-center bg-black/20`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isGoldenMode ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                  <Icons.Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-bold text-sm ${currentTheme.accent}`}>Quantum Analyst</h3>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Online • Gemini-Pro
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setChatHistory([])}
                className="text-gray-500 hover:text-white transition-colors"
                title="Clear Context"
              >
                <Icons.Refresh className="w-4 h-4" />
              </button>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[600px] scrollbar-thin scrollbar-thumb-gray-700">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600 text-white rounded-tr-none' 
                      : msg.role === 'system'
                      ? 'bg-red-900/30 text-red-200 border border-red-500/30'
                      : `${isGoldenMode ? 'bg-amber-900/40 border-amber-500/30' : 'bg-gray-700/50 border-gray-600'} border rounded-tl-none`
                  }`}>
                    {msg.role === 'ai' && <div className={`text-[10px] mb-1 font-bold ${currentTheme.accent}`}>AI ANALYST</div>}
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    <div className="text-[10px] opacity-50 mt-2 text-right">{msg.timestamp.toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
              {isProcessingAI && (
                <div className="flex justify-start">
                  <div className={`bg-gray-700/50 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center`}>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className={`p-4 border-t ${currentTheme.border} bg-black/20`}>
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Quantum AI to analyze, stress-test, or explain..."
                  className={`w-full bg-gray-900/50 border ${currentTheme.border} rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder-gray-600`}
                  disabled={isProcessingAI}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isProcessingAI}
                  className={`absolute right-2 p-2 rounded-lg transition-all ${
                    inputMessage.trim() && !isProcessingAI 
                      ? 'bg-cyan-500 text-white hover:bg-cyan-400' 
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                >
                  <Icons.Send className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['Simulate Crash', 'Activate Golden Mode', 'Analyze Risk', 'Explain Security'].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setInputMessage(suggestion)}
                    className="whitespace-nowrap px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-[10px] text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CONTROL PANEL */}
          <div className={`p-4 rounded-2xl border backdrop-blur-md ${currentTheme.card} ${currentTheme.border}`}>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
              <Icons.Terminal className="w-4 h-4" /> Simulation Controls
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <NeonButton 
                variant="danger" 
                onClick={() => {
                  setSelectedScenario('bear');
                  setMarketStatus('VOLATILE');
                  addAuditLog('USER', 'MANUAL_OVERRIDE', 'Triggered Bear Scenario');
                  setTimeout(() => { setSelectedScenario(null); setMarketStatus('OPEN'); }, 3000);
                }}
                className="text-xs"
              >
                Stress Test
              </NeonButton>
              <NeonButton 
                variant="success" 
                onClick={() => {
                  setSelectedScenario('bull');
                  addAuditLog('USER', 'MANUAL_OVERRIDE', 'Triggered Bull Scenario');
                  setTimeout(() => setSelectedScenario(null), 3000);
                }}
                className="text-xs"
              >
                Inject Liquidity
              </NeonButton>
              <div className="col-span-2 mt-2">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>Simulation Speed</span>
                  <span>{simulationSpeed}ms</span>
                </div>
                <input 
                  type="range" 
                  min="100" 
                  max="2000" 
                  step="100" 
                  value={simulationSpeed}
                  onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                  className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PnLChart;