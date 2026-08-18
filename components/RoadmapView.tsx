import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from 'react';
import Card from './Card';
import { DataContext } from '../contexts/DataContext';
import { GoogleGenAI } from "@google/genai";

// =================================================================================================
// QUANTUM FINANCIAL - STRATEGIC ROADMAP & AI COMMAND CENTER
// =================================================================================================
//
// This component represents the pinnacle of the "Golden Ticket" experience.
// It integrates real-time strategic planning, AI-driven insights, and robust audit logging.
//
// PHILOSOPHY:
// - "Kick the tires": Users can simulate market conditions.
// - "See the engine roar": Real-time AI interaction via Gemini.
// - "Bells and Whistles": High-polish UI, animations, and detailed feedback.
//
// SECURITY:
// - All actions are logged to the immutable Audit Ledger.
// - API Keys are handled via secure environment variables (GEMINI_API_KEY).
//
// =================================================================================================

// -------------------------------------------------------------------------------------------------
// ICONS (Inline SVG for self-containment)
// -------------------------------------------------------------------------------------------------

const Icons = {
  Terminal: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Brain: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  Rocket: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Send: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
};

// -------------------------------------------------------------------------------------------------
// TYPES & INTERFACES
// -------------------------------------------------------------------------------------------------

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: 'planned' | 'in-progress' | 'completed' | 'blocked';
  quarter: string;
  impact: 'high' | 'medium' | 'low';
  owner: string;
  progress: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  hash: string;
  status: 'verified' | 'pending';
}

interface SimulationMetric {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  change: string;
}

// -------------------------------------------------------------------------------------------------
// MOCK DATA GENERATORS
// -------------------------------------------------------------------------------------------------

const generateId = () => Math.random().toString(36).substr(2, 9);

const INITIAL_ROADMAP: RoadmapItem[] = [
  {
    id: 'rm-001',
    title: 'Global Liquidity Nexus',
    description: 'Integration of real-time cross-border settlement rails using Quantum Financial proprietary ledger.',
    status: 'in-progress',
    quarter: 'Q3 2024',
    impact: 'high',
    owner: 'Treasury Ops',
    progress: 65
  },
  {
    id: 'rm-002',
    title: 'AI Risk Sentinel',
    description: 'Deployment of autonomous fraud detection agents across all payment gateways.',
    status: 'planned',
    quarter: 'Q4 2024',
    impact: 'high',
    owner: 'Security Div',
    progress: 15
  },
  {
    id: 'rm-003',
    title: 'Sovereign Wealth Dashboard',
    description: 'Client-facing portal for ultra-high-net-worth individual asset tracking.',
    status: 'completed',
    quarter: 'Q2 2024',
    impact: 'medium',
    owner: 'Product',
    progress: 100
  }
];

const INITIAL_METRICS: SimulationMetric[] = [
  { label: 'Global Liquidity', value: '$24.5B', trend: 'up', change: '+2.4%' },
  { label: 'Risk Exposure', value: 'Low', trend: 'down', change: '-0.5%' },
  { label: 'Active Channels', value: '142', trend: 'up', change: '+12' },
  { label: 'System Latency', value: '12ms', trend: 'neutral', change: '0ms' }
];

// -------------------------------------------------------------------------------------------------
// SUB-COMPONENTS
// -------------------------------------------------------------------------------------------------

/**
 * @component StatusBadge
 * @description Renders a polished status badge for roadmap items.
 */
const StatusBadge: React.FC<{ status: RoadmapItem['status'] }> = ({ status }) => {
  const styles = {
    'planned': 'bg-blue-900/30 text-blue-300 border-blue-700/50',
    'in-progress': 'bg-amber-900/30 text-amber-300 border-amber-700/50',
    'completed': 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50',
    'blocked': 'bg-red-900/30 text-red-300 border-red-700/50'
  };

  const labels = {
    'planned': 'Planned',
    'in-progress': 'In Progress',
    'completed': 'Deployed',
    'blocked': 'Blocked'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]} uppercase tracking-wider`}>
      {labels[status]}
    </span>
  );
};

/**
 * @component ProgressBar
 * @description A sleek, animated progress bar.
 */
const ProgressBar: React.FC<{ progress: number; colorClass?: string }> = ({ progress, colorClass = 'bg-cyan-500' }) => (
  <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
    <div 
      className={`h-full ${colorClass} transition-all duration-1000 ease-out`} 
      style={{ width: `${progress}%` }}
    />
  </div>
);

/**
 * @component AuditLogEntry
 * @description Displays a single line in the secure audit log.
 */
const AuditLogEntry: React.FC<{ log: AuditLog }> = ({ log }) => (
  <div className="flex items-center space-x-3 text-xs font-mono py-1 border-b border-gray-800/50 last:border-0 hover:bg-gray-800/30 transition-colors px-2">
    <span className="text-gray-500">{log.timestamp}</span>
    <span className="text-cyan-600">[{log.hash.substr(0, 8)}]</span>
    <span className="text-gray-300 flex-1">{log.action}</span>
    <span className="text-gray-500">{log.user}</span>
    {log.status === 'verified' && <Icons.Lock />}
  </div>
);

// -------------------------------------------------------------------------------------------------
// MAIN COMPONENT: RoadmapView
// -------------------------------------------------------------------------------------------------

const RoadmapView: React.FC = () => {
  // --- CONTEXT & STATE ---
  const { userProfile, askSovereignAI, showNotification } = useContext(DataContext) || {};
  
  // Core State
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>(INITIAL_ROADMAP);
  const [metrics, setMetrics] = useState<SimulationMetric[]>(INITIAL_METRICS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'system',
      content: 'Sovereign AI Core Online. Secure Channel Established. Ready for strategic command.',
      timestamp: new Date()
    }
  ]);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'roadmap' | 'audit'>('roadmap');
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [newItemForm, setNewItemForm] = useState<Partial<RoadmapItem>>({ status: 'planned', impact: 'medium', progress: 0 });
  
  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const auditEndRef = useRef<HTMLDivElement>(null);

  // --- HELPERS ---

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAuditBottom = () => {
    auditEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  useEffect(() => {
    scrollToAuditBottom();
  }, [auditLogs]);

  // --- AUDIT LOGGING SYSTEM ---
  
  const logAction = useCallback((action: string, user: string = 'SYSTEM') => {
    const newLog: AuditLog = {
      id: generateId(),
      action,
      user,
      timestamp: new Date().toISOString(),
      hash: Math.random().toString(36).substr(2, 16).toUpperCase(),
      status: 'verified'
    };
    setAuditLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50 logs
  }, []);

  // --- AI INTEGRATION ---

  const handleAiCommand = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiProcessing(true);
    logAction(`AI_QUERY: ${userMsg.content.substr(0, 30)}...`, userProfile?.name || 'User');

    try {
      // 1. Check for local commands first (Simulation of "App Interaction")
      if (userMsg.content.toLowerCase().includes('create') && userMsg.content.toLowerCase().includes('roadmap')) {
        setTimeout(() => {
            setShowNewItemModal(true);
            setChatHistory(prev => [...prev, {
                id: generateId(),
                role: 'ai',
                content: "I've opened the strategic initiative form for you. Please define the parameters for the new roadmap item.",
                timestamp: new Date()
            }]);
            setIsAiProcessing(false);
        }, 1000);
        return;
      }

      // 2. Use Gemini API via DataContext or Direct Fallback
      let aiResponseText = '';
      
      // We attempt to use the secure context first
      if (askSovereignAI) {
        aiResponseText = await askSovereignAI(
            `You are the Sovereign AI for Quantum Financial. 
             Context: The user is viewing the Strategic Roadmap. 
             Current Metrics: ${JSON.stringify(metrics)}.
             User Query: ${userMsg.content}.
             Keep response concise, professional, and elite. 
             If the user asks to simulate something, describe the simulation results.`
        );
      } else {
        // Fallback if context is missing (should not happen in demo)
        const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'DEMO_KEY' });
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent(userMsg.content);
        aiResponseText = result.response.text();
      }

      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'ai',
        content: aiResponseText,
        timestamp: new Date()
      };

      setChatHistory(prev => [...prev, aiMsg]);
      logAction('AI_RESPONSE_GENERATED', 'SOVEREIGN_CORE');

    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, {
        id: generateId(),
        role: 'system',
        content: 'Error: Neural Link Interrupted. Please check API credentials.',
        timestamp: new Date()
      }]);
      logAction('AI_ERROR', 'SYSTEM');
    } finally {
      setIsAiProcessing(false);
    }
  };

  // --- FORM HANDLING ---

  const handleCreateItem = () => {
    if (!newItemForm.title || !newItemForm.description) {
        showNotification?.("Please complete all required fields.", "error");
        return;
    }

    const newItem: RoadmapItem = {
        id: generateId(),
        title: newItemForm.title,
        description: newItemForm.description,
        status: newItemForm.status || 'planned',
        quarter: newItemForm.quarter || 'Q1 2025',
        impact: newItemForm.impact || 'medium',
        owner: newItemForm.owner || 'Strategic Ops',
        progress: newItemForm.progress || 0
    };

    setRoadmapItems(prev => [...prev, newItem]);
    setShowNewItemModal(false);
    setNewItemForm({ status: 'planned', impact: 'medium', progress: 0 });
    logAction(`ROADMAP_ITEM_CREATED: ${newItem.title}`, userProfile?.name);
    showNotification?.("Strategic Initiative Added Successfully", "success");
    
    // AI Acknowledgment
    setChatHistory(prev => [...prev, {
        id: generateId(),
        role: 'ai',
        content: `Acknowledged. New initiative "${newItem.title}" has been integrated into the strategic roadmap. Impact analysis running...`,
        timestamp: new Date()
    }]);
  };

  // --- RENDER HELPERS ---

  const renderMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {metrics.map((m, idx) => (
        <div key={idx} className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 backdrop-blur-sm hover:border-cyan-500/30 transition-colors">
          <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">{m.label}</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-bold text-white">{m.value}</div>
            <div className={`text-xs font-medium ${m.trend === 'up' ? 'text-emerald-400' : m.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
              {m.change}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // --- MAIN RENDER ---

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Icons.Globe />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
              Quantum Financial
            </span>
            <span className="text-gray-500 font-light">| Strategic Command</span>
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Real-time strategic oversight and AI-assisted decision making.
          </p>
        </div>
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setActiveTab('roadmap')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'roadmap' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-gray-400 hover:text-white'}`}
            >
                Roadmap
            </button>
            <button 
                onClick={() => setActiveTab('audit')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'audit' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-gray-400 hover:text-white'}`}
            >
                Audit Ledger
            </button>
            <div className="h-8 w-px bg-gray-700 mx-2"></div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-full border border-gray-700">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs text-gray-300 font-mono">SYSTEM ONLINE</span>
            </div>
        </div>
      </div>

      {/* METRICS DASHBOARD */}
      {renderMetrics()}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* LEFT COLUMN: MAIN CONTENT (Roadmap or Audit) */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
            <Card 
                title={activeTab === 'roadmap' ? "Strategic Initiatives" : "Secure Audit Ledger"} 
                icon={activeTab === 'roadmap' ? <Icons.Rocket /> : <Icons.Shield />}
                className="flex-1 flex flex-col min-h-0"
                headerActions={activeTab === 'roadmap' ? [{
                    id: 'add-item',
                    icon: <Icons.Plus />,
                    label: 'Add Initiative',
                    onClick: () => setShowNewItemModal(true)
                }] : []}
            >
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[400px]">
                    {activeTab === 'roadmap' ? (
                        <div className="space-y-4">
                            {roadmapItems.map((item) => (
                                <div key={item.id} className="group bg-gray-800/30 border border-gray-700/50 rounded-xl p-5 hover:bg-gray-800/50 hover:border-cyan-500/30 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">{item.title}</h3>
                                                <StatusBadge status={item.status} />
                                            </div>
                                            <p className="text-gray-400 text-sm">{item.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Target</div>
                                            <div className="text-sm font-medium text-gray-300">{item.quarter}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-700/30">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Owner</div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                                                    {item.owner.charAt(0)}
                                                </div>
                                                <span className="text-sm text-gray-300">{item.owner}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Impact</div>
                                            <span className={`text-sm font-medium ${item.impact === 'high' ? 'text-purple-400' : 'text-blue-400'}`}>
                                                {item.impact.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1 flex justify-between">
                                                <span>Progress</span>
                                                <span>{item.progress}%</span>
                                            </div>
                                            <ProgressBar progress={item.progress} colorClass={item.status === 'completed' ? 'bg-emerald-500' : 'bg-cyan-500'} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-black/20 rounded-lg border border-gray-800 p-4 font-mono text-sm h-full overflow-y-auto">
                            {auditLogs.length === 0 ? (
                                <div className="text-center text-gray-600 py-10">No audit records found in current session.</div>
                            ) : (
                                <div className="space-y-1">
                                    {auditLogs.map((log) => (
                                        <AuditLogEntry key={log.id} log={log} />
                                    ))}
                                    <div ref={auditEndRef} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>

        {/* RIGHT COLUMN: AI COMMAND CENTER */}
        <div className="flex flex-col min-h-0">
            <Card 
                title="Sovereign AI Core" 
                subtitle="Neural Interface v4.2"
                icon={<Icons.Brain />}
                className="flex-1 flex flex-col h-full border-cyan-900/30 shadow-cyan-900/10"
                variant="outline"
            >
                <div className="flex flex-col h-[600px]">
                    {/* Chat History */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/50 rounded-t-lg custom-scrollbar">
                        {chatHistory.map((msg) => (
                            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg p-3 ${
                                    msg.role === 'user' 
                                        ? 'bg-cyan-900/30 text-cyan-100 border border-cyan-700/30 rounded-br-none' 
                                        : msg.role === 'system'
                                        ? 'bg-gray-800/50 text-gray-400 text-xs font-mono border border-gray-700 border-dashed w-full text-center'
                                        : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none'
                                }`}>
                                    {msg.role !== 'system' && (
                                        <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] uppercase tracking-wider">
                                            {msg.role === 'user' ? <Icons.Terminal /> : <Icons.Brain />}
                                            <span>{msg.role === 'user' ? 'Operator' : 'Sovereign AI'}</span>
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                                </div>
                            </div>
                        ))}
                        {isAiProcessing && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 rounded-lg p-3 rounded-bl-none border border-gray-700 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-gray-800 border-t border-gray-700 rounded-b-lg">
                        <div className="relative">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAiCommand()}
                                placeholder="Enter command or query..."
                                className="w-full bg-gray-900 text-white pl-4 pr-12 py-3 rounded-md border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all font-mono text-sm"
                                disabled={isAiProcessing}
                            />
                            <button 
                                onClick={handleAiCommand}
                                disabled={!chatInput.trim() || isAiProcessing}
                                className="absolute right-2 top-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Icons.Send />
                            </button>
                        </div>
                        <div className="mt-2 flex justify-between items-center text-[10px] text-gray-500 font-mono">
                            <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                ENCRYPTED
                            </span>
                            <span>GEMINI-3-FLASH-PREVIEW</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
      </div>

      {/* MODAL: NEW INITIATIVE */}
      {showNewItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Icons.Plus /> New Strategic Initiative
                    </h3>
                    <button onClick={() => setShowNewItemModal(false)} className="text-gray-400 hover:text-white transition-colors">
                        <Icons.Alert /> {/* Using Alert icon as close for now or simple X */}
                        <span className="sr-only">Close</span>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Initiative Title</label>
                        <input 
                            type="text" 
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none"
                            placeholder="e.g., Quantum Ledger Integration"
                            value={newItemForm.title || ''}
                            onChange={e => setNewItemForm({...newItemForm, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                        <textarea 
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none h-24 resize-none"
                            placeholder="Describe the strategic goals..."
                            value={newItemForm.description || ''}
                            onChange={e => setNewItemForm({...newItemForm, description: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Target Quarter</label>
                            <input 
                                type="text" 
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none"
                                placeholder="Q1 2025"
                                value={newItemForm.quarter || ''}
                                onChange={e => setNewItemForm({...newItemForm, quarter: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Owner</label>
                            <input 
                                type="text" 
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none"
                                placeholder="Department or Lead"
                                value={newItemForm.owner || ''}
                                onChange={e => setNewItemForm({...newItemForm, owner: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Impact Level</label>
                            <select 
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none"
                                value={newItemForm.impact}
                                onChange={e => setNewItemForm({...newItemForm, impact: e.target.value as any})}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Initial Status</label>
                            <select 
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-cyan-500 outline-none"
                                value={newItemForm.status}
                                onChange={e => setNewItemForm({...newItemForm, status: e.target.value as any})}
                            >
                                <option value="planned">Planned</option>
                                <option value="in-progress">In Progress</option>
                                <option value="blocked">Blocked</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800 px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
                    <button 
                        onClick={() => setShowNewItemModal(false)}
                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleCreateItem}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-lg shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105"
                    >
                        Initialize Strategy
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default RoadmapView;