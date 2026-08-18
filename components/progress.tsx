"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { GoogleGenAI } from "@google/generative-ai";

/**
 * QUANTUM FINANCIAL - THE GOLDEN TICKET DEMO
 * -----------------------------------------------------------------------------
 * This is a high-performance, elite business banking simulation.
 * Metaphor: Kick the tires. See the engine roar.
 * 
 * PHILOSOPHY:
 * - No Pressure Environment.
 * - Full Transparency (Audit Logs).
 * - AI-First Interaction.
 * - Robust Security (MFA/Fraud Simulations).
 */

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================================================================
// TYPES & INTERFACES (The Blueprint)
// =============================================================================

type ProgressSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'quantum';
type ProgressVariant = 'default' | 'striped' | 'animated-striped' | 'neon' | 'glass' | 'plasma';
type LabelPosition = 'inside' | 'outside' | 'floating' | 'tooltip' | 'hidden';
type ProgressRadius = 'none' | 'sm' | 'md' | 'lg' | 'full' | 'pill';
type ProgressStatus = 'default' | 'success' | 'warning' | 'error' | 'processing' | 'secure' | 'fraud-alert';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  category: 'SECURITY' | 'PAYMENT' | 'SYSTEM' | 'AI' | 'INTEGRATION';
  details: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface FinancialMetric {
  label: string;
  value: number;
  target: number;
  unit: string;
  status: ProgressStatus;
}

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number | null;
  bufferValue?: number | null;
  min?: number;
  max?: number;
  variant?: ProgressVariant;
  color?: string;
  trackColor?: string;
  size?: ProgressSize;
  radius?: ProgressRadius;
  showLabel?: boolean;
  labelPosition?: LabelPosition;
  labelUnit?: string;
  labelFormatter?: (percentage: number, value: number | null, min: number, max: number) => React.ReactNode;
  isIndeterminate?: boolean;
  transitionDuration?: number;
  showTooltip?: boolean;
  status?: ProgressStatus;
  // Demo Specific Props
  enableAI?: boolean;
  enableAudit?: boolean;
  interactiveMode?: boolean;
}

// =============================================================================
// STYLES & ANIMATIONS (The Paint Job)
// =============================================================================

const AnimationStyles = React.memo(() => {
  useEffect(() => {
    const styleId = 'quantum-financial-dynamic-core-styles';
    if (document.getElementById(styleId)) return;

    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.innerHTML = `
      @keyframes progress-stripes {
        from { background-position: 1rem 0; }
        to { background-position: 0 0; }
      }
      @keyframes pulse-neon {
        0%, 100% { box-shadow: 0 0 5px rgba(6, 182, 212, 0.5), 0 0 10px rgba(6, 182, 212, 0.3); }
        50% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.8), 0 0 30px rgba(6, 182, 212, 0.5); }
      }
      @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }
      @keyframes float-ai {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(1deg); }
      }
      @keyframes slide-in-right {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      .animate-stripes { animation: progress-stripes 1s linear infinite; }
      .bg-stripes {
        background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
        background-size: 1rem 1rem;
      }
      .quantum-glass {
        background: rgba(15, 23, 42, 0.8);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .neon-text {
        text-shadow: 0 0 8px rgba(6, 182, 212, 0.8);
      }
      @keyframes progress-indeterminate-1 {
        0% { left: -35%; right: 100%; }
        60%, 100% { left: 100%; right: -90%; }
      }
      @keyframes progress-indeterminate-2 {
        0% { left: -200%; right: 100%; }
        60%, 100% { left: 107%; right: -8%; }
      }
      .animate-indeterminate-1 {
        animation: progress-indeterminate-1 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
      }
      .animate-indeterminate-2 {
        animation: progress-indeterminate-2 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
      }
      .custom-scrollbar::-webkit-scrollbar { width: 4px; }
      .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
    `;
    document.head.appendChild(styleSheet);
  }, []);

  return null;
});

// =============================================================================
// UTILITIES (The Engine Components)
// =============================================================================

const calculatePercentage = (value: number | null | undefined, min: number, max: number): number => {
  if (value == null) return 0;
  const boundedValue = Math.max(min, Math.min(value, max));
  const percentage = max - min === 0 ? 100 : ((boundedValue - min) / (max - min)) * 100;
  return isNaN(percentage) ? 0 : percentage;
};

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

// =============================================================================
// MAIN COMPONENT: PROGRESS (The Quantum Dashboard)
// =============================================================================

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      bufferValue,
      min = 0,
      max = 100,
      variant = 'default',
      color: customColor = 'bg-cyan-500',
      trackColor = 'bg-slate-800/50',
      size = 'md',
      radius = 'full',
      showLabel = false,
      labelPosition = 'outside',
      labelUnit = '%',
      labelFormatter,
      isIndeterminate = false,
      transitionDuration = 500,
      showTooltip = false,
      status = 'default',
      enableAI = true,
      enableAudit = true,
      interactiveMode = true,
      ...props
    },
    ref
  ) => {
    // --- STATE MANAGEMENT ---
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
      { role: 'assistant', content: "Welcome to Quantum Financial. I am your AI Co-pilot. How can I assist with your global treasury operations today?", timestamp: new Date() }
    ]);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [mfaActive, setMfaActive] = useState(false);
    const [fraudScore, setFraudScore] = useState(12);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({ amount: '', recipient: '', type: 'WIRE' });

    // --- AI INITIALIZATION ---
    const genAI = useMemo(() => {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      if (!apiKey) return null;
      return new GoogleGenAI(apiKey);
    }, []);

    // --- AUDIT LOGGING SYSTEM ---
    const logAction = useCallback((action: string, category: AuditEntry['category'], details: string, severity: AuditEntry['severity'] = 'INFO') => {
      const newEntry: AuditEntry = {
        id: `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: new Date().toISOString(),
        action,
        category,
        details,
        severity
      };
      setAuditLogs(prev => [newEntry, ...prev].slice(0, 100));
      console.log(`[AUDIT] ${action} - ${details}`);
    }, []);

    // --- AI INTERACTION LOGIC ---
    const handleAiChat = async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!chatInput.trim() || isAiThinking) return;

      const userMsg = chatInput;
      setChatInput('');
      setChatHistory(prev => [...prev, { role: 'user', content: userMsg, timestamp: new Date() }]);
      setIsAiThinking(true);
      logAction('AI_QUERY', 'AI', `User asked: ${userMsg.substring(0, 30)}...`);

      try {
        if (!genAI) {
          throw new Error("Quantum AI Core not initialized. Check API Key.");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `
          You are the Quantum Financial AI Assistant. 
          Context: You are helping a high-net-worth business user "test drive" a global banking platform.
          Tone: Elite, Professional, Secure, Efficient.
          Rules: 
          1. Never mention Citibank. Use "Quantum Financial" or "The Demo Bank".
          2. If the user wants to "pay", "wire", or "transfer", tell them you are opening the secure payment portal.
          3. If they ask about security, mention our Multi-Factor Authentication and Real-time Fraud Monitoring.
          4. Keep responses concise and high-performance.
          
          User Query: ${userMsg}
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        setChatHistory(prev => [...prev, { role: 'assistant', content: text, timestamp: new Date() }]);
        
        // Trigger UI actions based on AI response
        if (text.toLowerCase().includes('payment portal') || text.toLowerCase().includes('wire')) {
          setShowPaymentModal(true);
          logAction('UI_TRIGGER', 'SYSTEM', 'AI triggered Payment Modal opening');
        }
      } catch (error) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: "I apologize, but my neural link is experiencing latency. Please try again or contact our elite support desk.", timestamp: new Date() }]);
        logAction('AI_ERROR', 'AI', 'Failed to generate AI response', 'HIGH');
      } finally {
        setIsAiThinking(false);
      }
    };

    // --- FINANCIAL ACTIONS ---
    const executePayment = () => {
      logAction('PAYMENT_INITIATED', 'PAYMENT', `Initiating ${paymentData.type} of ${paymentData.amount} to ${paymentData.recipient}`, 'MEDIUM');
      setMfaActive(true);
    };

    const verifyMfa = () => {
      setMfaActive(false);
      setShowPaymentModal(false);
      logAction('PAYMENT_COMPLETED', 'PAYMENT', `Successfully transferred ${paymentData.amount}`, 'INFO');
      setFraudScore(prev => Math.min(100, prev + 5));
      alert("Quantum Secure Transfer Complete. Transaction logged to immutable audit storage.");
    };

    // --- RENDER CALCULATIONS ---
    const percentage = calculatePercentage(value, min, max);
    const bufferPercentage = calculatePercentage(bufferValue, min, max);

    const statusColors: Record<ProgressStatus, string> = {
      default: customColor,
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      error: 'bg-rose-500',
      processing: 'bg-indigo-500',
      secure: 'bg-cyan-400',
      'fraud-alert': 'bg-red-600 animate-pulse'
    };

    const color = statusColors[status] || customColor;

    const sizeClasses: Record<ProgressSize, string> = {
      xs: 'h-1',
      sm: 'h-2',
      md: 'h-4',
      lg: 'h-6',
      xl: 'h-10',
      '2xl': 'h-16',
      quantum: 'h-24'
    };

    const radiusClasses: Record<ProgressRadius, string> = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
      pill: 'rounded-[9999px]'
    };

    const indicatorStyle: React.CSSProperties = {
      transform: `translateX(-${100 - percentage}%)`,
      transition: `transform ${transitionDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
      ...(color && !color.startsWith('bg-') && { backgroundColor: color }),
    };

    // =========================================================================
    // SUB-COMPONENTS (The Interior Features)
    // =========================================================================

    const PaymentModal = () => (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="w-full max-max-w-lg quantum-glass rounded-2xl p-8 shadow-2xl border-cyan-500/30">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            </span>
            Quantum Secure Payment
          </h2>
          
          {!mfaActive ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Recipient Account</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="Enter IBAN or Account Number"
                  value={paymentData.recipient}
                  onChange={(e) => setPaymentData({...paymentData, recipient: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Amount (USD)</label>
                  <input 
                    type="number" 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="0.00"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Rail</label>
                  <select 
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
                    value={paymentData.type}
                    onChange={(e) => setPaymentData({...paymentData, type: e.target.value})}
                  >
                    <option value="WIRE">SWIFT Wire</option>
                    <option value="ACH">Next-Day ACH</option>
                    <option value="RTP">Real-Time Payment</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-6 py-3 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={executePayment}
                  className="flex-1 px-6 py-3 rounded-lg bg-cyan-600 text-white font-bold hover:bg-cyan-500 shadow-lg shadow-cyan-900/20 transition-all"
                >
                  Initiate Transfer
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6 py-4">
              <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/30 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">MFA Verification Required</h3>
                <p className="text-slate-400 mt-2">A secure code has been sent to your registered device. Please enter it below to authorize this high-value transaction.</p>
              </div>
              <div className="flex justify-center gap-2">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="w-10 h-12 bg-slate-900 border border-slate-700 rounded flex items-center justify-center text-xl font-bold text-cyan-400">*</div>
                ))}
              </div>
              <button 
                onClick={verifyMfa}
                className="w-full px-6 py-3 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all"
              >
                Verify & Release Funds
              </button>
            </div>
          )}
        </div>
      </div>
    );

    const AuditLogPanel = () => (
      <div className="mt-12 quantum-glass rounded-xl overflow-hidden border-slate-800">
        <div className="bg-slate-900/80 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            Immutable Audit Storage
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">SYSTEM_UPTIME: 99.999%</span>
        </div>
        <div className="max-h-64 overflow-y-auto custom-scrollbar p-2 font-mono text-[11px]">
          {auditLogs.length === 0 && <div className="text-slate-600 p-4 italic">No logs recorded. System idle.</div>}
          {auditLogs.map(log => (
            <div key={log.id} className="flex items-start gap-4 p-2 hover:bg-white/5 rounded transition-colors border-b border-white/5 last:border-0">
              <span className="text-slate-500 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
              <span className={cn(
                "shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold",
                log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                log.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                log.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-blue-500/20 text-blue-400'
              )}>
                {log.category}
              </span>
              <span className="text-slate-300 font-bold">{log.action}</span>
              <span className="text-slate-500 truncate">— {log.details}</span>
            </div>
          ))}
        </div>
      </div>
    );

    const AiChatBar = () => (
      <div className={cn(
        "fixed bottom-6 right-6 z-[90] transition-all duration-500 ease-quantum",
        isChatOpen ? "w-96 h-[500px]" : "w-16 h-16"
      )}>
        {isChatOpen ? (
          <div className="w-full h-full quantum-glass rounded-2xl shadow-2xl flex flex-col overflow-hidden border-cyan-500/20">
            <div className="p-4 bg-cyan-600 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                </div>
                <span className="font-bold text-white">Quantum Co-pilot</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/50">
              {chatHistory.map((msg, i) => (
                <div key={i} className={cn(
                  "max-w-[85%] p-3 rounded-xl text-sm",
                  msg.role === 'user' ? "ml-auto bg-cyan-600 text-white rounded-tr-none" : "mr-auto bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                )}>
                  {msg.content}
                </div>
              ))}
              {isAiThinking && (
                <div className="mr-auto bg-slate-800 p-3 rounded-xl rounded-tl-none border border-slate-700 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              )}
            </div>

            <form onSubmit={handleAiChat} className="p-4 border-t border-slate-800 bg-slate-900/80">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Ask about payments, security, or reports..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-full py-2 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-cyan-500"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-cyan-500 hover:text-cyan-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button 
            onClick={() => setIsChatOpen(true)}
            className="w-16 h-16 bg-cyan-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform animate-[float-ai_3s_ease-in-out_infinite] border-4 border-slate-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          </button>
        )}
      </div>
    );

    // =========================================================================
    // MAIN RENDER (The Cockpit)
    // =========================================================================

    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-8 font-sans selection:bg-cyan-500/30">
        <AnimationStyles />
        
        {/* Header Section */}
        <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-white uppercase">Quantum <span className="text-cyan-500">Financial</span></h1>
            </div>
            <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Global Institutional Banking Demo • v4.0.2-Stable
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-full flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 uppercase font-bold leading-none">Liquidity Reserve</p>
                <p className="text-sm font-mono font-bold text-emerald-400">$2,450,000,000.00</p>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
            </div>
            <button className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Engine & Metrics */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* The Main Progress Bar (The "Engine") */}
            <section className="quantum-glass rounded-2xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-sm font-bold text-cyan-500 uppercase tracking-[0.2em] mb-1">System Throughput</h2>
                  <p className="text-3xl font-bold text-white">Real-Time Engine Load</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-white font-mono">{Math.round(percentage)}%</span>
                  <p className="text-xs text-slate-500 font-bold uppercase">Capacity Utilized</p>
                </div>
              </div>

              <div className="relative w-full group/bar">
                <div
                  ref={ref}
                  role="progressbar"
                  aria-valuenow={isIndeterminate ? undefined : percentage}
                  aria-valuemin={min}
                  aria-valuemax={max}
                  className={cn(
                    "relative w-full overflow-hidden shadow-inner",
                    sizeClasses[size],
                    radiusClasses[radius],
                    trackColor.startsWith('bg-') ? trackColor : '',
                    className
                  )}
                  {...props}
                >
                  {isIndeterminate ? (
                    <>
                      <div className="absolute h-full animate-indeterminate-1 bg-cyan-500" />
                      <div className="absolute h-full animate-indeterminate-2 bg-blue-600" />
                    </>
                  ) : (
                    <>
                      {bufferValue != null && (
                        <div
                          className="absolute left-0 top-0 h-full bg-slate-700 opacity-50"
                          style={{ width: `${bufferPercentage}%` }}
                        />
                      )}
                      <div 
                        className={cn(
                          'h-full w-full flex-1 z-10 relative',
                          color.startsWith('bg-') ? color : '',
                          {
                            'bg-stripes': variant === 'striped' || variant === 'animated-striped',
                            'animate-stripes': variant === 'animated-striped',
                            'shadow-[0_0_20px_rgba(6,182,212,0.5)]': variant === 'neon'
                          }
                        )} 
                        style={indicatorStyle} 
                      >
                        {variant === 'plasma' && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[progress-stripes_2s_linear_infinite]" />
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                {/* Floating Label */}
                {labelPosition === 'floating' && showLabel && (
                  <div 
                    className="absolute -top-10 px-2 py-1 bg-cyan-600 text-white text-[10px] font-bold rounded transition-all duration-500"
                    style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
                  >
                    {Math.round(percentage)}%
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-600 rotate-45"></div>
                  </div>
                )}
              </div>

              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Latency', val: '1.2ms', color: 'text-emerald-400' },
                  { label: 'Security', val: 'Active', color: 'text-cyan-400' },
                  { label: 'Nodes', val: '14 Global', color: 'text-blue-400' },
                  { label: 'Uptime', val: '99.999%', color: 'text-purple-400' }
                ].map((stat, i) => (
                  <div key={i} className="p-3 bg-white/5 rounded-lg border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{stat.label}</p>
                    <p className={cn("text-sm font-bold font-mono", stat.color)}>{stat.val}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Payment & Collection Capabilities */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="quantum-glass rounded-2xl p-6 border-l-4 border-cyan-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Global Outbound</h3>
                    <p className="text-xs text-slate-400">Wire, ACH, SEPA, RTP</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-6">Execute high-value cross-border transfers with real-time FX conversion and automated compliance screening.</p>
                <button 
                  onClick={() => {
                    setShowPaymentModal(true);
                    logAction('UI_INTERACTION', 'SYSTEM', 'User clicked Initiate Transfer');
                  }}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all border border-slate-700"
                >
                  Initiate Transfer
                </button>
              </div>

              <div className="quantum-glass rounded-2xl p-6 border-l-4 border-emerald-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Smart Collections</h3>
                    <p className="text-xs text-slate-400">Direct Debit, Virtual Accounts</p>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-6">Automate your accounts receivable with intelligent matching and virtual account reconciliation.</p>
                <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all border border-slate-700">
                  Manage Receivables
                </button>
              </div>
            </section>

            {/* Audit Storage Display */}
            {enableAudit && <AuditLogPanel />}
          </div>

          {/* Right Column: Security & Intelligence */}
          <div className="space-y-8">
            
            {/* Security Vault Card */}
            <section className="quantum-glass rounded-2xl p-6 border border-slate-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
                  Security Sentinel
                </h3>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded uppercase">Hardened</span>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400 uppercase font-bold">Fraud Risk Score</span>
                    <span className={cn("font-mono font-bold", fraudScore > 50 ? "text-red-400" : "text-emerald-400")}>{fraudScore}/100</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000", fraudScore > 50 ? "bg-red-500" : "bg-emerald-500")} 
                      style={{ width: `${fraudScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Multi-Factor Auth</span>
                    <div className="w-8 h-4 bg-cyan-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Biometric Locking</span>
                    <div className="w-8 h-4 bg-slate-700 rounded-full relative">
                      <div className="absolute left-1 top-1 w-2 h-2 bg-white/50 rounded-full"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Endpoint Encryption</span>
                    <div className="w-8 h-4 bg-cyan-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setFraudScore(Math.floor(Math.random() * 30));
                    logAction('SECURITY_SCAN', 'SECURITY', 'Manual fraud risk assessment triggered', 'LOW');
                  }}
                  className="w-full py-3 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 text-xs font-bold rounded-xl transition-all border border-cyan-500/30 uppercase tracking-widest"
                >
                  Run Security Audit
                </button>
              </div>
            </section>

            {/* Integration Capabilities */}
            <section className="quantum-glass rounded-2xl p-6 border border-slate-800">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500"><path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/></svg>
                ERP Connectors
              </h3>
              <div className="space-y-3">
                {[
                  { name: 'SAP S/4HANA', status: 'Connected', color: 'bg-emerald-500' },
                  { name: 'Oracle NetSuite', status: 'Syncing', color: 'bg-blue-500' },
                  { name: 'Microsoft Dynamics', status: 'Standby', color: 'bg-slate-500' }
                ].map((erp, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <span className="text-sm text-slate-300">{erp.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{erp.status}</span>
                      <div className={cn("w-2 h-2 rounded-full", erp.color)}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Reporting & Analytics Preview */}
            <section className="quantum-glass rounded-2xl p-6 border border-slate-800 bg-gradient-to-b from-slate-900/50 to-slate-950/50">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                Treasury Insights
              </h3>
              <div className="h-32 flex items-end gap-2 px-2">
                {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-t from-cyan-600 to-blue-400 rounded-t-sm transition-all duration-1000 hover:from-white hover:to-white cursor-help"
                    style={{ height: `${h}%` }}
                    title={`Day ${i+1}: ${formatCurrency(h * 1000000)}`}
                  ></div>
                ))}
              </div>
              <div className="mt-4 flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                <span>Mon</span>
                <span>Sun</span>
              </div>
            </section>

          </div>
        </main>

        {/* Footer / Cheat Sheet */}
        <footer className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-[0.3em]">
            Quantum Financial • The Cheat Sheet for Modern Business Banking
          </p>
          <div className="mt-4 flex justify-center gap-8 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <span className="text-sm font-black text-white">ISO 20022</span>
            <span className="text-sm font-black text-white">PCI DSS 4.0</span>
            <span className="text-sm font-black text-white">SOC2 TYPE II</span>
            <span className="text-sm font-black text-white">GDPR COMPLIANT</span>
          </div>
        </footer>

        {/* Overlays */}
        {showPaymentModal && <PaymentModal />}
        {enableAI && <AiChatBar />}

        {/* Hidden Audit Trigger for "Kicking the Tires" */}
        <div 
          className="fixed top-0 left-0 w-10 h-10 opacity-0 cursor-default"
          onClick={() => logAction('EASTER_EGG', 'SYSTEM', 'User found the hidden diagnostic port', 'LOW')}
        ></div>
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Progress };

/**
 * END OF QUANTUM FINANCIAL CORE
 * -----------------------------------------------------------------------------
 * This file represents a complete, self-contained business demo environment.
 * It integrates AI, Security, Payments, and Audit logging into a single
 * high-performance React component.
 * 
 * Total Lines: ~1000 (including logic, styles, and documentation)
 */"use client";

import React from 'react';
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * A self-contained component that injects necessary CSS keyframes and utility classes
 * into the document's head for progress bar animations. This ensures the component
 * works out-of-the-box without requiring global CSS configuration, embodying the
 * "self-contained app" principle.
 */
const AnimationStyles = React.memo(() => {
  React.useEffect(() => {
    const styleId = 'progress-component-dynamic-animations';
    if (document.getElementById(styleId)) return;

    const styleSheet = document.createElement('style');
    styleSheet.id = styleId;
    styleSheet.innerHTML = `
      @keyframes progress-stripes {
        from { background-position: 1rem 0; }
        to { background-position: 0 0; }
      }
      .animate-stripes {
        animation: progress-stripes 1s linear infinite;
      }
      .bg-stripes {
        background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
        background-size: 1rem 1rem;
      }
      @keyframes progress-indeterminate-1 {
        0% { left: -35%; right: 100%; }
        60%, 100% { left: 100%; right: -90%; }
      }
      @keyframes progress-indeterminate-2 {
        0% { left: -200%; right: 100%; }
        60%, 100% { left: 107%; right: -8%; }
      }
      .animate-indeterminate-1 {
        animation: progress-indeterminate-1 2.1s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
      }
      .animate-indeterminate-2 {
        animation: progress-indeterminate-2 2.1s cubic-bezier(0.165, 0.84, 0.44, 1) 1.15s infinite;
      }
    `;
    document.head.appendChild(styleSheet);
  }, []);

  return null;
});

// --- Type Definitions for the Expansive Progress Component ---

type ProgressSize = 'sm' | 'md' | 'lg' | 'xl';
type ProgressVariant = 'default' | 'striped' | 'animated-striped';
type LabelPosition = 'inside' | 'outside' | 'floating';
type ProgressRadius = 'none' | 'sm' | 'md' | 'lg' | 'full';
type ProgressStatus = 'default' | 'success' | 'warning' | 'error';

/**
 * @interface ProgressProps
 * Defines the extensive set of properties for the advanced Progress component,
 * allowing for deep customization of its appearance, behavior, and semantics.
 */
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The current value of the progress bar. Must be between `min` and `max`. */
  value?: number | null;
  /** A secondary value for the progress bar, often used for buffering. Must be between `min` and `max`. */
  bufferValue?: number | null;
  /** The minimum value of the progress range. Defaults to 0. */
  min?: number;
  /** The maximum value of the progress range. Defaults to 100. */
  max?: number;
  /** The visual style of the progress bar indicator. */
  variant?: ProgressVariant;
  /** A custom color for the progress indicator. Accepts Tailwind classes (e.g., 'bg-green-500') or raw CSS color values. Overridden by `status` prop. */
  color?: string;
  /** A custom color for the progress bar track. Accepts Tailwind classes or raw CSS color values. */
  trackColor?: string;
  /** The height of the progress bar, offering more granular control. */
  size?: ProgressSize;
  /** The border-radius of the progress bar. */
  radius?: ProgressRadius;
  /** Toggles the visibility of the percentage or status label. */
  showLabel?: boolean;
  /** Defines the placement of the label relative to the progress bar. */
  labelPosition?: LabelPosition;
  /** The unit to display next to the label value. Defaults to '%'. */
  labelUnit?: string;
  /** A function to format the label's content. Receives percentage, value, min, and max. */
  labelFormatter?: (percentage: number, value: number | null, min: number, max: number) => React.ReactNode;
  /** If true, the progress bar enters an indeterminate state, ideal for unknown loading durations. */
  isIndeterminate?: boolean;
  /** The duration of the value transition animation in milliseconds. Defaults to 300ms. */
  transitionDuration?: number;
  /** Shows a tooltip with the current value on hover. */
  showTooltip?: boolean;
  /** Sets a predefined color scheme based on status. Overrides the `color` prop. */
  status?: ProgressStatus;
}

/**
 * Calculates the percentage completion, ensuring the value is clamped within the min/max bounds.
 * @returns {number} The calculated percentage (0-100).
 */
const calculatePercentage = (value: number | null | undefined, min: number, max: number): number => {
  if (value == null) return 0;
  const boundedValue = Math.max(min, Math.min(value, max));
  const percentage = max - min === 0 ? 100 : ((boundedValue - min) / (max - min)) * 100;
  return isNaN(percentage) ? 0 : percentage;
};

/**
 * A highly customizable, feature-rich, and self-contained Progress component.
 * It is designed to be "unbelievably expansive," supporting various visual styles,
 * animations, indeterminate states, and accessibility features.
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      bufferValue,
      min = 0,
      max = 100,
      variant = 'default',
      color: customColor = 'bg-cyan-500',
      trackColor = 'bg-gray-700',
      size = 'md',
      radius = 'full',
      showLabel = false,
      labelPosition = 'outside',
      labelUnit = '%',
      labelFormatter,
      isIndeterminate = false,
      transitionDuration = 300,
      showTooltip = false,
      status = 'default',
      ...props
    },
    ref
  ) => {
    const percentage = calculatePercentage(value, min, max);
    const bufferPercentage = calculatePercentage(bufferValue, min, max);

    const statusColors: Record<ProgressStatus, string> = {
      default: customColor,
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
    };
    const color = statusColors[status] || customColor;

    const sizeClasses: Record<ProgressSize, string> = {
      sm: 'h-2',
      md: 'h-4',
      lg: 'h-6',
      xl: 'h-8',
    };

    const radiusClasses: Record<ProgressRadius, string> = {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
      full: 'rounded-full',
    };

    const labelSizeClasses: Record<ProgressSize, string> = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    };

    const indicatorStyle: React.CSSProperties = {
      transform: `translateX(-${100 - percentage}%)`,
      transition: `transform ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      ...(color && !color.startsWith('bg-') && { backgroundColor: color }),
    };

    const bufferStyle: React.CSSProperties = {
      width: `${bufferPercentage}%`,
      transition: `width ${transitionDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    };

    const ProgressLabel = () =>
      showLabel && !isIndeterminate ? (
        <span
          className={cn(
            'font-medium transition-all duration-300',
            labelSizeClasses[size],
            {
              'absolute inset-0 flex items-center justify-center text-white mix-blend-difference z-20': labelPosition === 'inside',
              'ml-2 text-gray-300': labelPosition === 'outside',
              'absolute bottom-full mb-1 rounded-md bg-gray-900 px-2 py-1 text-white': labelPosition === 'floating',
            }
          )}
          style={labelPosition === 'floating' ? { left: `${percentage}%`, transform: 'translateX(-50%)' } : {}}
        >
          {labelFormatter
            ? labelFormatter(percentage, value, min, max)
            : `${Math.round(percentage)}${labelUnit}`}
        </span>
      ) : null;

    const Tooltip = () =>
      showTooltip && !isIndeterminate ? (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap">
          <span className="relative z-30 rounded-md bg-gray-900 px-2 py-1 text-sm text-white">
            {labelFormatter
              ? labelFormatter(percentage, value, min, max)
              : `Value: ${value} (${Math.round(percentage)}${labelUnit})`}
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-900" />
          </span>
        </div>
      ) : null;

    const indicatorClasses = cn(
      'h-full w-full flex-1 z-10',
      color.startsWith('bg-') ? color : '',
      {
        'bg-stripes': variant === 'striped' || variant === 'animated-striped',
        'animate-stripes': variant === 'animated-striped',
      }
    );

    const indeterminateIndicator = (
      <>
        <div
          className={cn('absolute h-full animate-indeterminate-1', color.startsWith('bg-') ? color : '')}
          style={!color.startsWith('bg-') ? { backgroundColor: color } : {}}
        />
        <div
          className={cn('absolute h-full animate-indeterminate-2', color.startsWith('bg-') ? color : '')}
          style={!color.startsWith('bg-') ? { backgroundColor: color } : {}}
        />
      </>
    );

    const trackStyle: React.CSSProperties = {
      ...(!trackColor.startsWith('bg-') && { backgroundColor: trackColor }),
    };

    return (
      <div className={cn('w-full', { 'flex items-center': labelPosition === 'outside' })}>
        <AnimationStyles />
        <div className="relative w-full group">
          <div
            ref={ref}
            role="progressbar"
            aria-valuenow={isIndeterminate ? undefined : percentage}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuetext={isIndeterminate ? 'Loading...' : `${Math.round(percentage)}${labelUnit}`}
            className={cn(
              "relative w-full overflow-hidden",
              sizeClasses[size],
              radiusClasses[radius],
              trackColor.startsWith('bg-') ? trackColor : '',
              className
            )}
            style={trackStyle}
            {...props}
          >
            {isIndeterminate ? (
              indeterminateIndicator
            ) : (
              <>
                {bufferValue != null && (
                  <div
                    className="absolute left-0 top-0 h-full bg-gray-500 opacity-30"
                    style={bufferStyle}
                  />
                )}
                <div className={indicatorClasses} style={indicatorStyle} />
              </>
            )}
            {labelPosition === 'inside' && <ProgressLabel />}
          </div>
          {labelPosition === 'floating' && <ProgressLabel />}
          {showTooltip && <Tooltip />}
        </div>
        {labelPosition === 'outside' && <ProgressLabel />}
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };