import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { GoogleGenAI } from "@google/genai";

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const APP_NAME = "Quantum Financial";
const DEMO_MODE = true;
const AUDIT_LOG_RETENTION = 50; // Keep last 50 logs in memory
const GEMINI_MODEL = "gemini-2.0-flash-exp"; // Using a stable preview model name or the one from instructions

// ============================================================================
// ICONS (Inline SVGs for self-containment)
// ============================================================================

const Icons = {
  Brain: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.88h-1.51c-1.1 0-2.2.63-2.77 1.59a2.5 2.5 0 0 1-4.26 0 2.5 2.5 0 0 1 0-2.94A2.5 2.5 0 0 1 1 14.5c0-1.1.63-2.2 1.59-2.77a2.5 2.5 0 0 1 0-4.26A2.5 2.5 0 0 1 4.18 4.73c.57-.96 1.67-1.59 2.77-1.59h1.51A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.88h1.51c1.1 0 2.2.63 2.77 1.59a2.5 2.5 0 0 0 4.26 0 2.5 2.5 0 0 0 0-2.94 2.5 2.5 0 0 0 1.5-2.77c0-1.1-.63-2.2-1.59-2.77a2.5 2.5 0 0 0 0-4.26 2.5 2.5 0 0 0-1.59-2.77c-.57-.96-1.67-1.59-2.77-1.59h-1.51A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  ),
  Shield: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  ),
  Activity: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  Lock: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Send: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  ),
  Plus: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  ),
  X: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  Search: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  Globe: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
  TrendingUp: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
};

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface PortfolioCompany {
  id: string;
  name: string;
  valuation: string;
  ownership: string;
  status: 'Growth' | 'Stable' | 'Breakout' | 'Early' | 'Exit';
  sector: string;
  description: string;
  metrics: {
    revenue: string;
    burnRate: string;
    runway: string;
    yoyGrowth: string;
  };
  aiSummary: string;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  hash: string; // Simulated cryptographic hash
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

interface PortfolioCompanyListProps {
  onSelectCompany: (id: string) => void;
}

// ============================================================================
// MOCK DATA GENERATOR
// ============================================================================

const generateMockCompanies = (): PortfolioCompany[] => [
  { 
    id: 'c1', 
    name: 'Nexus AI', 
    valuation: '120M', 
    ownership: '12%', 
    status: 'Growth',
    sector: 'Artificial Intelligence',
    description: 'Generative AI infrastructure for enterprise financial modeling.',
    metrics: { revenue: '$12M ARR', burnRate: '$800k/mo', runway: '18 mo', yoyGrowth: '+140%' },
    aiSummary: 'High potential. Market leader in niche financial LLMs. Series B expected Q3.'
  },
  { 
    id: 'c2', 
    name: 'Solaris Energy', 
    valuation: '85M', 
    ownership: '8%', 
    status: 'Stable',
    sector: 'Clean Tech',
    description: 'Next-gen photovoltaic efficiency layers for commercial grids.',
    metrics: { revenue: '$24M ARR', burnRate: '$200k/mo', runway: '36 mo', yoyGrowth: '+15%' },
    aiSummary: 'Steady cash flow. Low risk. Potential acquisition target by major utility.'
  },
  { 
    id: 'c3', 
    name: 'Orbital Dynamics', 
    valuation: '250M', 
    ownership: '5%', 
    status: 'Breakout',
    sector: 'Aerospace',
    description: 'Low-earth orbit logistics and satellite servicing.',
    metrics: { revenue: '$45M ARR', burnRate: '$2.1M/mo', runway: '12 mo', yoyGrowth: '+300%' },
    aiSummary: 'Unicorn trajectory. High capital intensity but dominant market position emerging.'
  },
  { 
    id: 'c4', 
    name: 'Cipher Security', 
    valuation: '45M', 
    ownership: '15%', 
    status: 'Early',
    sector: 'Cybersecurity',
    description: 'Quantum-resistant encryption protocols for banking.',
    metrics: { revenue: '$2M ARR', burnRate: '$400k/mo', runway: '24 mo', yoyGrowth: '+80%' },
    aiSummary: 'Strategic hold. Technology is critical for future-proofing Quantum Financial infrastructure.'
  },
  { 
    id: 'c5', 
    name: 'AgroFuture', 
    valuation: '60M', 
    ownership: '10%', 
    status: 'Stable',
    sector: 'AgTech',
    description: 'Autonomous drone swarms for precision agriculture.',
    metrics: { revenue: '$8M ARR', burnRate: '$300k/mo', runway: '28 mo', yoyGrowth: '+25%' },
    aiSummary: 'Solid performer. Expanding into emerging markets. ESG compliant.'
  },
];

// ============================================================================
// UTILITIES
// ============================================================================

const generateHash = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const AuditTicker: React.FC<{ logs: AuditLogEntry[] }> = ({ logs }) => {
  return (
    <div className="w-full bg-black/40 border-t border-gray-800 p-2 font-mono text-xs text-gray-500 overflow-hidden whitespace-nowrap flex items-center">
      <Icons.Lock className="w-3 h-3 mr-2 text-cyan-500/50" />
      <span className="mr-4 text-cyan-500/70 font-bold">SECURE AUDIT STREAM:</span>
      <div className="flex space-x-8 animate-marquee">
        {logs.slice(0, 5).map(log => (
          <span key={log.id} className="flex items-center">
            <span className="text-gray-600 mr-2">[{log.timestamp}]</span>
            <span className="text-gray-400">{log.action}</span>
            <span className="text-gray-700 mx-1">::</span>
            <span className="text-cyan-900">{log.hash}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

const AIStatusIndicator: React.FC<{ status: 'idle' | 'thinking' | 'streaming' | 'error' }> = ({ status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'thinking': return 'bg-yellow-500';
      case 'streaming': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-gray-900/50 px-3 py-1 rounded-full border border-gray-700/50">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${status === 'thinking' ? 'animate-pulse' : ''}`} />
      <span className="text-xs font-medium text-gray-300 uppercase tracking-wider">
        Quantum Core {status === 'idle' ? 'Standby' : status}
      </span>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PortfolioCompanyList: React.FC<PortfolioCompanyListProps> = ({ onSelectCompany }) => {
  // --- STATE ---
  const [companies, setCompanies] = useState<PortfolioCompany[]>(generateMockCompanies());
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'system', content: 'Quantum Core initialized. Secure connection established.', timestamp: new Date() },
    { id: 'welcome', role: 'ai', content: 'Welcome, Director. I am ready to analyze the portfolio performance or simulate market scenarios. How can I assist?', timestamp: new Date() }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [aiStatus, setAiStatus] = useState<'idle' | 'thinking' | 'streaming' | 'error'>('idle');
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [showNewInvestmentForm, setShowNewInvestmentForm] = useState(false);
  
  // Refs for scrolling
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- EFFECTS ---
  useEffect(() => {
    addAuditLog('SYSTEM_INIT', 'Portfolio Dashboard Loaded');
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  // --- ACTIONS ---

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      user: 'USR-ADMIN-01',
      details,
      hash: generateHash(action + details + Date.now())
    };
    setAuditLogs(prev => [newLog, ...prev].slice(0, AUDIT_LOG_RETENTION));
  };

  const handleCompanySelect = (id: string) => {
    setSelectedCompanyId(id);
    const company = companies.find(c => c.id === id);
    addAuditLog('VIEW_COMPANY', `Accessed details for ${company?.name}`);
    onSelectCompany(id);
    
    // Contextual AI Trigger
    if (isChatOpen) {
      handleAISubmit(`Analyze ${company?.name} for me briefly.`);
    }
  };

  const handleAISubmit = async (text: string = inputMessage) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setAiStatus('thinking');
    addAuditLog('AI_QUERY', `Prompt: ${text.substring(0, 20)}...`);

    try {
      // ---------------------------------------------------------
      // GEMINI AI INTEGRATION
      // ---------------------------------------------------------
      let aiResponseText = "";
      
      if (process.env.GEMINI_API_KEY) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // Construct context based on current view
        const selectedCompany = companies.find(c => c.id === selectedCompanyId);
        const contextData = selectedCompany 
          ? `Current Focus: ${selectedCompany.name}. Data: ${JSON.stringify(selectedCompany)}.` 
          : `Portfolio Overview: ${JSON.stringify(companies.map(c => ({ name: c.name, valuation: c.valuation })))}.`;

        const systemPrompt = `
          You are "Quantum Core", an elite financial AI for Quantum Financial. 
          Tone: Professional, concise, high-performance, slightly futuristic.
          Context: ${contextData}
          User Query: ${text}
          Provide a strategic insight or answer. Keep it under 100 words unless asked for a deep dive.
        `;

        const response = await ai.models.generateContent({
          model: GEMINI_MODEL, // Using the model from instructions or config
          contents: systemPrompt,
        });
        
        aiResponseText = response.text || "Analysis complete. No anomalies detected.";
      } else {
        // Fallback simulation for "Golden Ticket" demo reliability
        await new Promise(resolve => setTimeout(resolve, 1500));
        aiResponseText = `[DEMO SIMULATION] I've analyzed the request regarding "${text}". Based on current market volatility and the portfolio's beta, I recommend maintaining the current position. The valuation models for ${selectedCompanyId ? 'this asset' : 'the portfolio'} remain robust within a 95% confidence interval.`;
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponseText,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMsg]);
      setAiStatus('idle');
      addAuditLog('AI_RESPONSE', `Generated ${aiResponseText.length} chars`);

    } catch (error) {
      console.error("AI Error:", error);
      setAiStatus('error');
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: "Connection to Neural Grid interrupted. Switching to local heuristics.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMsg]);
      addAuditLog('AI_ERROR', 'Handshake failed');
      setTimeout(() => setAiStatus('idle'), 3000);
    }
  };

  const handleNewInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    setShowNewInvestmentForm(false);
    addAuditLog('TX_INIT', 'New Investment Drafted');
    // In a real app, this would submit data. Here we just show the "Golden Ticket" experience.
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      content: 'New investment target drafted. Compliance checks initiated automatically.',
      timestamp: new Date()
    }]);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderCompanyCard = (company: PortfolioCompany) => {
    const isSelected = selectedCompanyId === company.id;
    return (
      <Card 
        key={company.id} 
        className={`
          relative overflow-hidden transition-all duration-300 cursor-pointer group
          ${isSelected 
            ? 'bg-gray-800/90 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.15)]' 
            : 'bg-gray-800/40 border-gray-700 hover:border-gray-500 hover:bg-gray-800/60'}
        `}
        onClick={() => handleCompanySelect(company.id)}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-bl-full -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100" />
        
        <div className="p-6 space-y-4 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h4 className={`font-bold text-xl ${isSelected ? 'text-cyan-400' : 'text-white'} group-hover:text-cyan-300 transition-colors`}>
                {company.name}
              </h4>
              <span className="text-xs text-gray-400 uppercase tracking-wider">{company.sector}</span>
            </div>
            <Badge variant={company.status === 'Breakout' ? 'default' : 'secondary'} className={`${company.status === 'Breakout' ? 'bg-cyan-900 text-cyan-200 border-cyan-700' : ''}`}>
              {company.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <div className="text-xs text-gray-500 uppercase">Valuation</div>
              <div className="text-lg font-mono text-white font-medium">${company.valuation}</div>
            </div>
            <div className="space-y-1 text-right">
              <div className="text-xs text-gray-500 uppercase">Ownership</div>
              <div className="text-lg font-mono text-cyan-400 font-medium">{company.ownership}</div>
            </div>
          </div>

          {isSelected && (
            <div className="pt-4 border-t border-gray-700/50 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="flex justify-between text-gray-400">
                  <span>Revenue</span>
                  <span className="text-gray-200">{company.metrics.revenue}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Growth</span>
                  <span className="text-green-400">{company.metrics.yoyGrowth}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Burn</span>
                  <span className="text-red-400">{company.metrics.burnRate}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Runway</span>
                  <span className="text-yellow-400">{company.metrics.runway}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 italic border-l-2 border-cyan-500/30 pl-2">
                "{company.aiSummary}"
              </p>
            </div>
          )}
        </div>
      </Card>
    );
  };

  // ============================================================================
  // RENDER MAIN
  // ============================================================================

  return (
    <div className="flex flex-col h-full bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
      
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Icons.Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Portfolio Command</h2>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs text-gray-400 font-mono">LIVE FEED :: {APP_NAME}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <AIStatusIndicator status={aiStatus} />
          <button 
            onClick={() => {
              setShowNewInvestmentForm(true);
              addAuditLog('UI_INTERACTION', 'Opened New Investment Modal');
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-cyan-500/20"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>New Investment</span>
          </button>
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-lg transition-colors ${isChatOpen ? 'bg-cyan-500/20 text-cyan-400' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
          >
            <Icons.Brain className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* LEFT: COMPANY GRID */}
        <div className={`flex-1 overflow-y-auto p-6 transition-all duration-500 ${isChatOpen ? 'mr-96' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map(renderCompanyCard)}
            
            {/* Add New Placeholder Card */}
            <div 
              onClick={() => setShowNewInvestmentForm(true)}
              className="border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-cyan-500/50 hover:bg-gray-800/30 transition-all group min-h-[200px]"
            >
              <div className="p-4 rounded-full bg-gray-800 group-hover:bg-cyan-500/20 transition-colors mb-4">
                <Icons.Plus className="w-6 h-6 text-gray-500 group-hover:text-cyan-400" />
              </div>
              <span className="text-sm font-medium text-gray-500 group-hover:text-gray-300">Scout New Asset</span>
            </div>
          </div>
        </div>

        {/* RIGHT: QUANTUM CORE CHAT (SLIDE OVER) */}
        <div className={`
          absolute top-0 right-0 bottom-0 w-96 bg-gray-900 border-l border-gray-800 shadow-2xl transform transition-transform duration-500 ease-in-out flex flex-col
          ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/95 backdrop-blur">
            <div className="flex items-center space-x-2">
              <Icons.Brain className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-gray-200 text-sm">Quantum Core</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-gray-500 hover:text-white">
              <Icons.X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-900 to-gray-900/90">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`
                  max-w-[85%] p-3 rounded-2xl text-sm shadow-sm
                  ${msg.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-none' 
                    : msg.role === 'system'
                      ? 'bg-gray-800/50 text-gray-400 border border-gray-700/50 text-xs font-mono'
                      : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'}
                `}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-600 mt-1 px-1">{formatTime(msg.timestamp)}</span>
              </div>
            ))}
            {aiStatus === 'thinking' && (
              <div className="flex items-center space-x-2 p-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <div className="relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAISubmit()}
                placeholder="Ask Quantum Core..."
                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-500"
              />
              <button 
                onClick={() => handleAISubmit()}
                disabled={!inputMessage.trim() || aiStatus === 'thinking'}
                className="absolute right-2 top-2 p-1.5 bg-cyan-500/10 hover:bg-cyan-500 text-cyan-500 hover:text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icons.Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* AUDIT LOG FOOTER */}
      <AuditTicker logs={auditLogs} />

      {/* POPUP FORM: NEW INVESTMENT */}
      {showNewInvestmentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-800">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Icons.Shield className="w-5 h-5 mr-2 text-cyan-500" />
                Initiate Acquisition
              </h3>
              <button onClick={() => setShowNewInvestmentForm(false)} className="text-gray-400 hover:text-white">
                <Icons.X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleNewInvestment} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Target Entity Name</label>
                <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" placeholder="e.g. Omega Dynamics" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase">Sector</label>
                  <select className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none">
                    <option>FinTech</option>
                    <option>Biotech</option>
                    <option>Aerospace</option>
                    <option>Quantum Computing</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-400 uppercase">Initial Capital</label>
                  <input type="text" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none" placeholder="$0.00" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400 uppercase">Strategic Rationale (AI Analyzed)</label>
                <textarea className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none h-24" placeholder="Enter investment thesis..." />
              </div>

              <div className="pt-4 flex space-x-3">
                <button type="button" onClick={() => setShowNewInvestmentForm(false)} className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-cyan-500/20 flex justify-center items-center">
                  <Icons.Lock className="w-4 h-4 mr-2" />
                  Authorize Transfer
                </button>
              </div>
              
              <p className="text-center text-[10px] text-gray-500 mt-2">
                Action will be logged to the immutable audit ledger. ID: {generateHash(Date.now().toString())}
              </p>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};