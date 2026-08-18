import React, { useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/generai";
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { 
  Transaction, 
  View, 
  Notification, 
  AuditLogEntry, 
  SecurityScoreMetric,
  ThreatAlert
} from '../../../types';

/**
 * ================================================================================================
 * QUANTUM FINANCIAL - THE NEXUS CORE (v4.0.0-PROD)
 * ================================================================================================
 * 
 * PHILOSOPHY:
 * - This is the "Golden Ticket" experience.
 * - A "Test Drive" of the world's most advanced financial engine.
 * - High-performance, secure, and elite.
 * - Integrated AI (Quantum Weaver) for real-time strategic orchestration.
 * 
 * TECHNICAL ARCHITECTURE:
 * - D3.js Force-Directed Graph for relationship mapping.
 * - Google Gemini Pro integration for autonomous financial reasoning.
 * - Real-time Audit Logging for every sensitive interaction.
 * - Multi-vector Security Monitoring.
 * - Robust Payment & Collection simulation (Wire/ACH).
 * 
 * @author Sovereign AI Architect
 * @version 4.0.0
 * ================================================================================================
 */

// --- D3 GLOBAL DECLARATION ---
declare const d3: any;

// --- TYPES & INTERFACES ---

interface NexusNode {
  id: string;
  label: string;
  type: 'account' | 'entity' | 'transaction' | 'risk' | 'integration';
  value: number;
  color: string;
  details?: any;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface NexusLink {
  source: string | NexusNode;
  target: string | NexusNode;
  relationship: string;
  value: number;
}

interface NexusGraphData {
  nodes: NexusNode[];
  links: NexusLink[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  action?: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
  metadata: any;
}

// --- CONSTANTS & MOCK DATA ---

const NEXUS_COLORS = {
  account: '#22d3ee', // Cyan
  entity: '#818cf8',  // Indigo
  transaction: '#34d399', // Emerald
  risk: '#fb7185',    // Rose
  integration: '#fbbf24' // Amber
};

const INITIAL_NODES: NexusNode[] = [
  { id: 'qf-core', label: 'Quantum Core', type: 'account', value: 25, color: NEXUS_COLORS.account },
  { id: 'global-treasury', label: 'Global Treasury', type: 'entity', value: 20, color: NEXUS_COLORS.entity },
  { id: 'erp-sap', label: 'SAP Integration', type: 'integration', value: 15, color: NEXUS_COLORS.integration },
  { id: 'wire-out-001', label: 'Pending Wire: $2.4M', type: 'transaction', value: 12, color: NEXUS_COLORS.transaction },
  { id: 'risk-vector-alpha', label: 'Anomaly Detected', type: 'risk', value: 18, color: NEXUS_COLORS.risk },
];

const INITIAL_LINKS: NexusLink[] = [
  { source: 'qf-core', target: 'global-treasury', relationship: 'MASTER_LINK', value: 5 },
  { source: 'qf-core', target: 'erp-sap', relationship: 'DATA_SYNC', value: 3 },
  { source: 'global-treasury', target: 'wire-out-001', relationship: 'AUTHORIZING', value: 2 },
  { source: 'wire-out-001', target: 'risk-vector-alpha', relationship: 'FLAGGED_BY', value: 4 },
];

// --- MAIN COMPONENT ---

const TheNexusView: React.FC = () => {
  const context = useContext(DataContext);
  
  // State Management
  const [graphData, setGraphData] = useState<NexusGraphData>({ nodes: INITIAL_NODES, links: INITIAL_LINKS });
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: "Welcome to the Quantum Financial Nexus. I am your AI Strategist. How can I help you test drive the engine today?", timestamp: new Date() }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'WIRE' | 'ACH'>('WIRE');
  const [securityMetrics, setSecurityMetrics] = useState<SecurityScoreMetric[]>([
    { metricName: 'Encryption Strength', currentValue: 'AES-256-GCM' },
    { metricName: 'Threat Level', currentValue: 'Low' },
    { metricName: 'MFA Status', currentValue: 'Active' }
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- UTILITIES ---

  const logAction = useCallback((action: string, metadata: any = {}, status: AuditEntry['status'] = 'SUCCESS') => {
    const entry: AuditEntry = {
      id: `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      action,
      actor: 'SYSTEM_USER_DEMO',
      status,
      metadata
    };
    setAuditLogs(prev => [entry, ...prev].slice(0, 50));
    
    // Also push to context if available
    if (context?.broadcastEvent) {
      context.broadcastEvent('AUDIT_LOG_CREATED', entry);
    }
  }, [context]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // --- AI LOGIC ---

  const handleAiCommand = async (input: string) => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setUserInput('');
    setIsAiThinking(true);
    logAction('AI_QUERY_INITIATED', { query: input });

    try {
      // Initialize Gemini with the secret key
      const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `
        You are the "Quantum Weaver", the elite AI strategist for Quantum Financial (a global bank).
        The user is "test driving" our business banking platform. 
        
        CONTEXT:
        - Current View: The Nexus (Relationship Mapping).
        - Capabilities: Wire Transfers, ACH, Fraud Monitoring, ERP Integration, Audit Storage.
        - Tone: Professional, Secure, High-Performance.
        - Rule: Never mention "Citibank". Use "Quantum Financial".
        
        USER QUERY: "${input}"
        
        INSTRUCTIONS:
        1. If the user wants to send money, suggest initiating a WIRE or ACH.
        2. If the user asks about security, explain our multi-factor and fraud monitoring.
        3. If the user wants to see the "engine roar", describe our high-frequency ledger.
        4. You can trigger UI actions by including a command in brackets like [ACTION:WIRE] or [ACTION:ACH] or [ACTION:SECURITY].
        
        Respond as an elite financial advisor.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      let action: string | undefined;
      if (text.includes('[ACTION:WIRE]')) {
        setPaymentType('WIRE');
        setShowPaymentModal(true);
        action = 'OPEN_WIRE_MODAL';
      } else if (text.includes('[ACTION:ACH]')) {
        setPaymentType('ACH');
        setShowPaymentModal(true);
        action = 'OPEN_ACH_MODAL';
      }

      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: text.replace(/\[ACTION:.*\]/g, ''), 
        timestamp: new Date(),
        action
      };

      setChatHistory(prev => [...prev, aiMsg]);
      logAction('AI_RESPONSE_RECEIVED', { actionTriggered: action || 'NONE' });

    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: "I apologize, but my neural link is experiencing high latency. Please try again or contact the Quantum Support Desk.", 
        timestamp: new Date() 
      }]);
      logAction('AI_ERROR', { error: String(error) }, 'CRITICAL');
    } finally {
      setIsAiThinking(false);
    }
  };

  // --- UI HANDLERS ---

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const amount = formData.get('amount');
    const recipient = formData.get('recipient');

    logAction(`PAYMENT_INITIATED`, { type: paymentType, amount, recipient });
    
    // Add to graph
    const newId = `tx-${Date.now()}`;
    const newNode: NexusNode = {
      id: newId,
      label: `${paymentType}: $${amount}`,
      type: 'transaction',
      value: 15,
      color: NEXUS_COLORS.transaction
    };

    setGraphData(prev => ({
      nodes: [...prev.nodes, newNode],
      links: [...prev.links, { source: 'qf-core', target: newId, relationship: 'SETTLEMENT', value: 3 }]
    }));

    setShowPaymentModal(false);
    context?.showNotification?.(`Successfully initiated ${paymentType} of $${amount} to ${recipient}`, 'success');
  };

  if (!context) return <div className="p-20 text-white text-center">Initializing Quantum Core...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-gray-100 p-6 font-sans selection:bg-cyan-500/30">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-indigo-500">
            THE NEXUS
          </h1>
          <p className="text-gray-500 mt-1 uppercase tracking-widest text-xs font-bold">
            Quantum Financial // Strategic Relationship Engine
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-gray-400">SYSTEM_STATUS: OPTIMAL</span>
          </div>
          <button 
            onClick={() => {
                logAction('MANUAL_REFRESH');
                context.showNotification('Synchronizing global ledgers...', 'info');
            }}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors border border-transparent hover:border-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* LEFT: THE GRAPH (The Engine) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Card 
            title="Relationship Topology" 
            subtitle="Real-time visualization of capital flow and entity dependencies."
            className="h-[600px] relative group"
          >
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                {Object.entries(NEXUS_COLORS).map(([key, color]) => (
                    <div key={key} className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded border border-gray-800">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[10px] uppercase text-gray-500">{key}</span>
                    </div>
                ))}
            </div>
            <NexusGraph data={graphData} onNodeClick={(node) => logAction('NODE_INSPECTED', { node: node.label })} />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Security Posture" padding="sm">
                <div className="space-y-3">
                    {securityMetrics.map(m => (
                        <div key={m.metricName} className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">{m.metricName}</span>
                            <span className="text-xs font-mono text-cyan-400">{m.currentValue}</span>
                        </div>
                    ))}
                    <div className="pt-2 border-t border-gray-800">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-gray-600 uppercase">Integrity Score</span>
                            <span className="text-[10px] text-green-500">99.9%</span>
                        </div>
                        <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[99.9%]" />
                        </div>
                    </div>
                </div>
            </Card>
            <Card title="ERP Connectivity" padding="sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-500/10 rounded flex items-center justify-center">
                            <span className="text-blue-500 font-bold text-xs">SAP</span>
                        </div>
                        <span className="text-sm font-medium">SAP S/4HANA</span>
                    </div>
                    <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded">ACTIVE</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                    Bi-directional synchronization active. Last ledger reconciliation: 4 minutes ago.
                </p>
            </Card>
            <Card title="Global SSI Hub" padding="sm">
                <div className="space-y-2">
                    <div className="p-2 bg-gray-900/80 rounded border border-gray-800 flex justify-between items-center">
                        <span className="text-[10px] text-gray-400">Standard Settlement Instructions</span>
                        <span className="text-[10px] text-cyan-500 font-mono">v2.4</span>
                    </div>
                    <button 
                        onClick={() => logAction('SSI_EXPORT_INITIATED')}
                        className="w-full py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-500 text-[10px] font-bold uppercase tracking-widest rounded transition-colors"
                    >
                        Export Instructions
                    </button>
                </div>
            </Card>
          </div>
        </div>

        {/* RIGHT: AI CHAT & AUDIT (The Interface) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          {/* AI CHAT PANEL */}
          <Card 
            title="Quantum Weaver AI" 
            subtitle="Autonomous Strategic Advisor"
            className="flex-1 flex flex-col h-[500px]"
            padding="none"
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600 text-white rounded-tr-none' 
                      : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                  }`}>
                    {msg.content}
                    <div className={`text-[10px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 border-t border-gray-800 bg-gray-900/30">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleAiCommand(userInput); }}
                className="relative"
              >
                <input 
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask the Weaver... (e.g. 'Send a wire')"
                  className="w-full bg-gray-950 border border-gray-800 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"
                />
                <button 
                  type="submit"
                  disabled={isAiThinking || !userInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:bg-cyan-500/10 rounded-lg disabled:opacity-30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </form>
            </div>
          </Card>

          {/* AUDIT LOG PANEL */}
          <Card 
            title="Audit Storage" 
            subtitle="Immutable event ledger"
            className="h-[300px]"
            padding="none"
          >
            <div className="overflow-y-auto h-full p-2 space-y-1 font-mono text-[10px]">
              {auditLogs.length === 0 && (
                <div className="h-full flex items-center justify-center text-gray-600 italic">
                  No events recorded in current session.
                </div>
              )}
              {auditLogs.map(log => (
                <div key={log.id} className="p-2 border-b border-gray-900 flex items-start gap-3 hover:bg-white/5 transition-colors">
                  <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    log.status === 'CRITICAL' ? 'bg-red-500' : log.status === 'WARNING' ? 'bg-amber-500' : 'bg-cyan-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-bold truncate">{log.action}</span>
                      <span className="text-gray-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-gray-500 truncate">ID: {log.id} // ACTOR: {log.actor}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* PAYMENT MODAL (The Test Drive Form) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f0f12] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-900 to-black">
              <div>
                <h3 className="text-xl font-bold text-white">Initiate {paymentType}</h3>
                <p className="text-xs text-gray-500">Quantum Financial Secure Transfer</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Recipient Name</label>
                <input 
                  name="recipient"
                  required
                  type="text" 
                  placeholder="e.g. Global Logistics Corp"
                  className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Account Number</label>
                  <input 
                    required
                    type="text" 
                    placeholder="**** 4242"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Routing / SWIFT</label>
                  <input 
                    required
                    type="text" 
                    placeholder="QFUS33XX"
                    className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1">Amount (USD)</label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input 
                      name="amount"
                      required
                      type="number" 
                      placeholder="0.00"
                      className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-500"
                    />
                </div>
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-[0.98]"
                >
                  Authorize & Execute
                </button>
                <p className="text-[10px] text-center text-gray-600 mt-3">
                  By clicking authorize, you agree to the Quantum Financial Terms of Service. 
                  Transaction will be logged in the immutable audit ledger.
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * NEXUS GRAPH COMPONENT
 * Uses D3.js to render a force-directed graph of financial relationships.
 */
const NexusGraph: React.FC<{ data: NexusGraphData; onNodeClick?: (node: NexusNode) => void }> = ({ data, onNodeClick }) => {
  const ref = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<NexusNode | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = ref.current.parentElement?.clientWidth || 800;
    const height = 550;

    svg.attr('viewBox', [0, 0, width, height]);

    // Define gradients for nodes
    const defs = svg.append("defs");
    data.nodes.forEach(n => {
        const grad = defs.append("radialGradient")
            .attr("id", `grad-${n.id}`)
            .attr("cx", "30%")
            .attr("cy", "30%")
            .attr("r", "50%");
        
        grad.append("stop").attr("offset", "0%").attr("stop-color", n.color).attr("stop-opacity", 1);
        grad.append("stop").attr("offset", "100%").attr("stop-color", "#000").attr("stop-opacity", 0.8);
    });

    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(180))
      .force("charge", d3.forceManyBody().strength(-600))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50))
      .on("tick", ticked);

    const link = svg.append("g")
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke", "#1f2937")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d: any) => Math.sqrt(d.value) * 2)
      .attr("stroke-dasharray", (d: any) => d.relationship === 'DATA_SYNC' ? "5,5" : "0");

    const node = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .join("g")
      .attr("class", "cursor-pointer")
      .call(drag(simulation))
      .on("click", (event: any, d: any) => {
        setSelectedNode(d);
        onNodeClick?.(d);
      });

    node.append("circle")
      .attr("r", (d: any) => d.value + 5)
      .attr("fill", (d: any) => `url(#grad-${d.id})`)
      .attr("stroke", (d: any) => d.color)
      .attr("stroke-width", 2)
      .attr("class", "transition-all duration-300 hover:stroke-white");

    node.append("text")
      .attr("dy", (d: any) => d.value + 20)
      .attr("text-anchor", "middle")
      .text((d: any) => d.label)
      .attr("fill", "#9ca3af")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("class", "pointer-events-none uppercase tracking-tighter");

    function ticked() {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    }

    function drag(simulation: any) {
      function dragstarted(event: any) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event: any) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event: any) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
    }

  }, [data, onNodeClick]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      <svg ref={ref} className="w-full h-full"></svg>
      
      {/* NODE INSPECTOR OVERLAY */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-64 bg-black/80 backdrop-blur-md border border-gray-800 p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-bold text-white uppercase tracking-tight">{selectedNode.label}</h4>
            <button onClick={() => setSelectedNode(null)} className="text-gray-500 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
                <span className="text-gray-500 uppercase">Type</span>
                <span className="text-cyan-400 font-mono">{selectedNode.type}</span>
            </div>
            <div className="flex justify-between text-[10px]">
                <span className="text-gray-500 uppercase">Node ID</span>
                <span className="text-gray-300 font-mono">{selectedNode.id}</span>
            </div>
            <div className="pt-2 border-t border-gray-800">
                <p className="text-[10px] text-gray-400 leading-tight italic">
                    This entity is currently synchronized with the Quantum Core via high-frequency DLT.
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TheNexusView;