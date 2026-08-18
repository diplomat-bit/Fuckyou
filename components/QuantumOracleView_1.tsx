// components/views/platform/QuantumOracleView.tsx
import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import Card from '../../Card';
import { DataContext } from '../../../context/DataContext';
import { GoogleGenAI } from '@google/genai';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  CartesianGrid, ComposedChart, Scatter
} from 'recharts';

// ============================================================================
// 1. TYPE DEFINITIONS & INTERFACES
// ============================================================================

type Severity = 'low' | 'medium' | 'high' | 'critical';
type MessageRole = 'user' | 'ai' | 'system';
type WidgetType = 'chart' | 'stat' | 'alert' | 'form';

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  metadata?: any;
  isTyping?: boolean;
  widget?: WidgetData;
}

interface WidgetData {
  type: WidgetType;
  title: string;
  data: any;
  config?: any;
}

interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
  hash: string;
  status: 'verified' | 'pending' | 'flagged';
}

interface OracleState {
  ignition: boolean;
  rpm: number;
  turboMode: boolean;
  securityLevel: string;
  engineTemp: number;
}

// ============================================================================
// 2. UTILITIES & HELPERS
// ============================================================================

const generateId = () => Math.random().toString(36).substr(2, 9);

const generateHash = (data: string) => {
  let hash = 0, i, chr;
  if (data.length === 0) return hash.toString(16);
  for (i = 0; i < data.length; i++) {
    chr = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; 
  }
  return "0x" + Math.abs(hash).toString(16).toUpperCase().padStart(16, '0');
};

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

const MOCK_SCENARIOS = [
  { label: "Market Crash Simulation", prompt: "Simulate a 25% drop in global equities over 3 months." },
  { label: "Liquidity Stress Test", prompt: "Run a stress test on my operating cash flow assuming late payments from top 3 clients." },
  { label: "Acquisition Modeling", prompt: "Model the financial impact of acquiring a competitor for $2.5M." },
  { label: "Fraud Detection Scan", prompt: "Scan recent transaction patterns for anomalies using the heuristic engine." }
];

// ============================================================================
// 3. SUB-COMPONENTS (Self-Contained)
// ============================================================================

/**
 * AuditLogTicker: A scrolling ticker of system actions.
 * "AUDIT STORAGE: Every sensitive action must be logged."
 */
const AuditLogTicker: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
  return (
    <div className="bg-black/40 border-t border-gray-800 p-2 font-mono text-xs text-green-500/80 overflow-hidden whitespace-nowrap flex items-center gap-4">
      <span className="text-gray-500 font-bold px-2 border-r border-gray-700">SECURE AUDIT STREAM</span>
      <div className="flex gap-8 animate-marquee">
        {logs.slice(0, 5).map(log => (
          <span key={log.id} className="flex items-center gap-2">
            <span className="text-cyan-500">[{log.timestamp.split('T')[1].split('.')[0]}]</span>
            <span className="text-white">{log.action.toUpperCase()}</span>
            <span className="text-gray-500">HASH:{log.hash.substr(0, 8)}...</span>
            {log.status === 'verified' && <span className="text-green-400">✓ VERIFIED</span>}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

/**
 * EngineStatus: Visualizes the "Engine Roar" metaphor.
 */
const EngineStatus: React.FC<{ state: OracleState }> = ({ state }) => {
  return (
    <div className="grid grid-cols-4 gap-2 mb-4">
      <div className="bg-gray-900/50 p-2 rounded border border-gray-700 flex flex-col items-center justify-center">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Engine Status</span>
        <span className={`text-sm font-bold ${state.ignition ? 'text-green-400' : 'text-gray-500'}`}>
          {state.ignition ? 'ONLINE' : 'STANDBY'}
        </span>
      </div>
      <div className="bg-gray-900/50 p-2 rounded border border-gray-700 flex flex-col items-center justify-center">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Compute Load</span>
        <div className="w-full h-2 bg-gray-800 rounded-full mt-1 overflow-hidden">
          <div 
            className="h-full bg-cyan-500 transition-all duration-300" 
            style={{ width: `${state.rpm / 100}%` }}
          />
        </div>
      </div>
      <div className="bg-gray-900/50 p-2 rounded border border-gray-700 flex flex-col items-center justify-center">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Security Protocol</span>
        <span className="text-sm font-bold text-amber-400">{state.securityLevel}</span>
      </div>
      <div className="bg-gray-900/50 p-2 rounded border border-gray-700 flex flex-col items-center justify-center">
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">Turbo Mode</span>
        <span className={`text-sm font-bold ${state.turboMode ? 'text-purple-400 animate-pulse' : 'text-gray-600'}`}>
          {state.turboMode ? 'ENGAGED' : 'OFF'}
        </span>
      </div>
    </div>
  );
};

/**
 * DynamicChart: Renders different charts based on AI output.
 */
const DynamicChart: React.FC<{ data: any, type: string, colors: string[] }> = ({ data, type, colors }) => {
  if (!data || data.length === 0) return <div className="h-48 flex items-center justify-center text-gray-500">No Data Generated</div>;

  const CommonProps = { width: "100%", height: 300 };
  
  switch (type) {
    case 'area':
      return (
        <ResponsiveContainer {...CommonProps}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }} />
            <Area type="monotone" dataKey="value" stroke={colors[0]} fillOpacity={1} fill="url(#colorVal)" />
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'bar':
      return (
        <ResponsiveContainer {...CommonProps}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }} />
            <Bar dataKey="value" fill={colors[0]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'radar':
      return (
        <ResponsiveContainer {...CommonProps}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="name" stroke="#9CA3AF" />
            <PolarRadiusAxis stroke="#9CA3AF" />
            <Radar name="Metric" dataKey="value" stroke={colors[0]} fill={colors[0]} fillOpacity={0.6} />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }} />
          </RadarChart>
        </ResponsiveContainer>
      );
    default:
      return (
        <ResponsiveContainer {...CommonProps}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }} />
            <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      );
  }
};

/**
 * ActionFormModal: A "Pop up form" for creating resources.
 */
const ActionFormModal: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: any) => void; 
  config: any 
}> = ({ isOpen, onClose, onSubmit, config }) => {
  const [formData, setFormData] = useState<any>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-cyan-500/50 rounded-xl w-full max-w-md shadow-2xl shadow-cyan-500/20 animate-fade-in-up">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-2 h-6 bg-cyan-500 rounded-full"></span>
            {config.title || 'Resource Creation'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {config.fields?.map((field: any) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-300 mb-1">{field.label}</label>
              {field.type === 'select' ? (
                <select 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                >
                  {field.options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input 
                  type={field.type || 'text'}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder={field.placeholder}
                  onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                  required={field.required}
                />
              )}
            </div>
          ))}
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-bold shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-[1.02]">
              Execute
            </button>
          </div>
        </form>
        <div className="p-3 bg-gray-950 rounded-b-xl border-t border-gray-800 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            Action will be logged to immutable audit trail.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. MAIN COMPONENT: QUANTUM ORACLE VIEW
// ============================================================================

const QuantumOracleView: React.FC = () => {
  const context = useContext(DataContext);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: 'init', 
      role: 'ai', 
      content: "Welcome to the Quantum Financial Oracle. I am your dedicated AI strategist. I can simulate market conditions, analyze your portfolio risk, or help you structure new financial instruments. How shall we proceed?", 
      timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [engineState, setEngineState] = useState<OracleState>({
    ignition: true,
    rpm: 1200,
    turboMode: false,
    securityLevel: 'QUANTUM-ENCRYPTED',
    engineTemp: 45
  });
  const [activeModal, setActiveModal] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Engine Idle Animation
  useEffect(() => {
    const interval = setInterval(() => {
      setEngineState(prev => ({
        ...prev,
        rpm: prev.ignition ? (prev.turboMode ? 4500 + Math.random() * 500 : 1200 + Math.random() * 100) : 0,
        engineTemp: prev.turboMode ? 85 : 45
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- AUDIT LOGGING ---
  const logAction = useCallback((action: string, details: string) => {
    const newLog: AuditLog = {
      id: generateId(),
      action,
      user: context?.userProfile?.name || 'Unknown User',
      timestamp: new Date().toISOString(),
      details,
      hash: generateHash(action + details + Date.now()),
      status: 'verified'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, [context?.userProfile?.name]);

  // --- AI INTERACTION ---
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);
    setEngineState(prev => ({ ...prev, rpm: prev.turboMode ? 8000 : 3500 })); // Rev engine

    logAction('USER_QUERY', `Prompt: ${input.substring(0, 50)}...`);

    try {
      // 1. Check for API Key
      const apiKey = context?.geminiApiKey || process.env.GEMINI_API_KEY;
      
      let aiResponseText = "";
      let widgetData: WidgetData | undefined = undefined;

      if (!apiKey) {
        // Fallback Simulation Mode if no key
        await new Promise(r => setTimeout(r, 1500));
        aiResponseText = "I'm currently running in 'Demo Mode' as the Neural Link (API Key) is not connected. I can still simulate this request for you.";
        
        // Simple keyword matching for demo
        if (input.toLowerCase().includes('simulate') || input.toLowerCase().includes('crash')) {
          widgetData = {
            type: 'chart',
            title: 'Projected Portfolio Impact',
            data: [
              { name: 'Month 1', value: 100 }, { name: 'Month 2', value: 85 }, { name: 'Month 3', value: 72 },
              { name: 'Month 4', value: 68 }, { name: 'Month 5', value: 75 }, { name: 'Month 6', value: 82 }
            ],
            config: { type: 'area', color: '#EF4444' }
          };
        } else if (input.toLowerCase().includes('create') || input.toLowerCase().includes('budget')) {
           setActiveModal({
             title: 'Create Strategic Budget',
             fields: [
               { name: 'category', label: 'Budget Category', placeholder: 'e.g., R&D', required: true },
               { name: 'amount', label: 'Allocation Limit ($)', type: 'number', required: true },
               { name: 'period', label: 'Fiscal Period', type: 'select', options: ['Q1', 'Q2', 'Q3', 'Q4'] }
             ]
           });
           aiResponseText = "I've prepared the secure provisioning form for your new budget allocation. Please authorize the parameters.";
        }

      } else {
        // 2. Real AI Call
        const ai = new GoogleGenAI({ apiKey });

        const systemPrompt = `
          You are the Quantum Financial Oracle for "The Demo Bank" (Quantum Financial).
          You are an elite, professional financial AI.
          Your goal is to help the user "Test Drive" the banking platform.
          
          If the user asks to visualize data, return a JSON object in your response wrapped in \`\`\`json\`\`\` blocks with this structure:
          {
            "type": "chart",
            "chartType": "area" | "bar" | "line" | "radar",
            "title": "Chart Title",
            "data": [{"name": "Label", "value": 123}, ...],
            "color": "#HexColor"
          }

          If the user asks to CREATE something (like a budget, a goal, a transfer), return a JSON object for a FORM:
          {
            "type": "form",
            "title": "Form Title",
            "fields": [
              {"name": "fieldName", "label": "Label", "type": "text"|"number"|"select", "options": []}
            ]
          }

          Keep your text response concise, professional, and encouraging. Use metaphors like "engine", "velocity", "trajectory".
        `;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: input,
          config: {
            systemInstruction: systemPrompt
          }
        });
        
        const text = response.text;

        // Parse for JSON blocks
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[1]);
            aiResponseText = text.replace(/```json\n[\s\S]*?\n```/, '').trim();
            
            if (parsed.type === 'chart') {
              widgetData = {
                type: 'chart',
                title: parsed.title,
                data: parsed.data,
                config: { type: parsed.chartType, color: parsed.color || '#06b6d4' }
              };
            } else if (parsed.type === 'form') {
              setActiveModal(parsed);
              // Don't set widgetData, just open modal
            }
          } catch (e) {
            console.error("Failed to parse AI JSON", e);
            aiResponseText = text; // Fallback
          }
        } else {
          aiResponseText = text;
        }
      }

      const aiMsg: ChatMessage = {
        id: generateId(),
        role: 'ai',
        content: aiResponseText,
        timestamp: Date.now(),
        widget: widgetData
      };

      setMessages(prev => [...prev, aiMsg]);
      logAction('AI_RESPONSE', `Generated ${aiResponseText.length} chars`);

    } catch (error: any) {
      console.error("AI Error", error);
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'system',
        content: `Connection Interrupted: ${error.message}. Please check your Neural Link (API Key).`,
        timestamp: Date.now()
      }]);
      logAction('ERROR', error.message);
    } finally {
      setIsProcessing(false);
      setEngineState(prev => ({ ...prev, rpm: prev.turboMode ? 4500 : 1200 })); // Idle
    }
  };

  const handleFormSubmit = (data: any) => {
    logAction('EXECUTE_TRANSACTION', JSON.stringify(data));
    setMessages(prev => [...prev, {
      id: generateId(),
      role: 'system',
      content: `✓ Action Executed Successfully. Resource created with ID: ${generateId().toUpperCase()}. Audit hash generated.`,
      timestamp: Date.now()
    }]);
    context?.showNotification('Transaction executed successfully on the ledger.', 'success');
  };

  const toggleTurbo = () => {
    setEngineState(prev => ({ ...prev, turboMode: !prev.turboMode }));
    context?.showNotification(engineState.turboMode ? "Turbo Mode Disengaged. Returning to cruise velocity." : "Turbo Mode Engaged. Processing power maximized.", 'info');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] gap-4">
      {/* HEADER & ENGINE STATUS */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
            <span className="text-cyan-500 text-4xl">⬢</span> Quantum Oracle
          </h1>
          <p className="text-gray-400 text-sm mt-1">Advanced Financial Simulation & Execution Engine</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={toggleTurbo}
            className={`px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${engineState.turboMode ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
          >
            {engineState.turboMode ? '⚡ Turbo Active' : '⚡ Turbo Off'}
          </button>
        </div>
      </div>

      <EngineStatus state={engineState} />

      {/* MAIN COCKPIT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        
        {/* LEFT: CHAT INTERFACE */}
        <div className="lg:col-span-1 flex flex-col bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-gray-800 bg-gray-950/50 flex justify-between items-center">
            <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Live Feed</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-gray-500">Connected</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] p-3 rounded-xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-cyan-900/30 text-cyan-100 border border-cyan-700/50 rounded-tr-none' 
                    : msg.role === 'system'
                    ? 'bg-green-900/20 text-green-400 border border-green-800/50 font-mono text-xs'
                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-gray-600 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-center gap-2 text-gray-500 text-xs p-2">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                </div>
                Processing Neural Request...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-gray-950 border-t border-gray-800">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask the Oracle (e.g., 'Simulate a recession', 'Create budget')..."
                className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-4 pr-12 py-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all shadow-inner"
                disabled={isProcessing}
              />
              <button 
                onClick={handleSendMessage}
                disabled={isProcessing || !input.trim()}
                className="absolute right-2 top-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {MOCK_SCENARIOS.map((scenario, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(scenario.prompt)}
                  className="whitespace-nowrap px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-xs text-gray-400 hover:text-white transition-colors"
                >
                  {scenario.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: VISUALIZATION & DATA */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-2">
          
          {/* Active Widget Display */}
          {messages.filter(m => m.widget).reverse().slice(0, 1).map((msg) => (
            <Card key={msg.id} title={msg.widget?.title} variant="interactive" className="animate-fade-in-up">
              <div className="h-[350px] w-full p-2">
                <DynamicChart 
                  data={msg.widget?.data} 
                  type={msg.widget?.config?.type || 'line'} 
                  colors={[msg.widget?.config?.color || '#06b6d4']} 
                />
              </div>
              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <h4 className="text-sm font-semibold text-gray-300 mb-1">AI Analysis</h4>
                <p className="text-sm text-gray-400 leading-relaxed">
                  The simulation indicates a high probability of success based on current market vectors. 
                  Liquidity remains within safe thresholds (&gt;{formatCurrency(50000)}) throughout the projected period.
                </p>
              </div>
            </Card>
          ))}

          {/* If no widget, show default dashboard */}
          {messages.filter(m => m.widget).length === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card title="System Health" variant="default">
                <div className="flex items-center justify-center h-40">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="60" stroke="#1f2937" strokeWidth="8" fill="none" />
                      <circle cx="64" cy="64" r="60" stroke="#06b6d4" strokeWidth="8" fill="none" strokeDasharray="377" strokeDashoffset="40" className="animate-[dash_1.5s_ease-in-out]" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">98%</span>
                      <span className="text-xs text-gray-500 uppercase">Optimal</span>
                    </div>
                  </div>
                </div>
              </Card>
              <Card title="Threat Monitor" variant="default">
                <div className="h-40 flex items-end justify-between gap-2 px-4">
                  {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
                    <div key={i} className="w-full bg-gray-800 rounded-t-sm relative group">
                      <div 
                        className="absolute bottom-0 left-0 right-0 bg-red-500/50 group-hover:bg-red-500 transition-all duration-500" 
                        style={{ height: `${h}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-center text-xs text-gray-500">Real-time Vector Analysis</div>
              </Card>
            </div>
          )}

          {/* Audit Log Panel */}
          <Card title="Immutable Audit Ledger" variant="outline" className="flex-1 min-h-[200px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-800/50 text-gray-200 uppercase text-xs">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Hash</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {auditLogs.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-gray-600 italic">No actions recorded in this session.</td></tr>
                  ) : (
                    auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="p-3 font-mono text-xs text-cyan-500">{log.timestamp.split('T')[1].split('.')[0]}</td>
                        <td className="p-3 font-medium text-white">{log.action}</td>
                        <td className="p-3">{log.user}</td>
                        <td className="p-3 font-mono text-xs text-gray-500">{log.hash.substr(0, 10)}...</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded-full bg-green-900/30 text-green-400 text-xs border border-green-800">
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* FOOTER TICKER */}
      <AuditLogTicker logs={auditLogs} />

      {/* MODALS */}
      <ActionFormModal 
        isOpen={!!activeModal} 
        onClose={() => setActiveModal(null)} 
        onSubmit={handleFormSubmit}
        config={activeModal || {}} 
      />

      {/* STYLES */}
      <style>{`
        @keyframes dash {
          from { stroke-dashoffset: 377; }
          to { stroke-dashoffset: 40; }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default QuantumOracleView;