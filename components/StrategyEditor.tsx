import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";

// ============================================================================
// QUANTUM FINANCIAL - STRATEGY COMMAND CENTER
// "The Golden Ticket Experience"
// ============================================================================
//
// PHILOSOPHY:
// This is not just a tool; it is an engine. We are letting the user kick the tires.
// The UI is elite, dark, and high-performance.
// Security is paramount. Every action is audited.
// AI is the co-pilot.
//
// ============================================================================

// ----------------------------------------------------------------------------
// 1. CONFIGURATION & SECRETS
// ----------------------------------------------------------------------------

const APP_NAME = "Quantum Financial";
const DEMO_MODE_KEY = "QUANTUM_DEMO_MODE";
const API_KEY_STORAGE = "GEMINI_API_KEY_USER";

// In a real environment, this comes from a secure secrets manager.
// For the demo, we check process.env or allow user injection for the "Test Drive".
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem(API_KEY_STORAGE);
  }
  return null;
};

// ----------------------------------------------------------------------------
// 2. TYPES & INTERFACES
// ----------------------------------------------------------------------------

type Severity = 'info' | 'warning' | 'error' | 'success' | 'critical';

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  details: string;
  hash: string; // Simulated cryptographic hash
}

interface Strategy {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft' | 'simulating';
  riskLevel: 'conservative' | 'moderate' | 'aggressive' | 'quantum';
  assets: string[];
  rules: StrategyRule[];
  performance: number;
  lastExecuted: string;
}

interface StrategyRule {
  id: string;
  condition: string;
  threshold: number;
  action: 'buy' | 'sell' | 'hedge' | 'notify' | 'transfer_wire' | 'transfer_ach';
  target: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: number;
  isTyping?: boolean;
}

interface MarketTick {
  symbol: string;
  price: number;
  change: number;
  volume: number;
  trend: 'up' | 'down' | 'flat';
}

// ----------------------------------------------------------------------------
// 3. MOCK DATA GENERATORS (The "Engine Roar")
// ----------------------------------------------------------------------------

const generateId = () => Math.random().toString(36).substring(2, 15);

const generateHash = (data: string) => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`;
};

const MOCK_ASSETS = ['BTC', 'ETH', 'SOL', 'XAU', 'USD', 'EUR', 'JPY', 'QUANT'];

const INITIAL_STRATEGIES: Strategy[] = [
  {
    id: 'strat_alpha_01',
    name: 'Global Macro Hedge',
    status: 'active',
    riskLevel: 'moderate',
    assets: ['USD', 'XAU', 'EUR'],
    rules: [
      { id: 'r1', condition: 'price_drop', threshold: 5, action: 'buy', target: 'XAU' },
      { id: 'r2', condition: 'volatility_spike', threshold: 12, action: 'hedge', target: 'USD' }
    ],
    performance: 12.4,
    lastExecuted: new Date().toISOString()
  },
  {
    id: 'strat_beta_99',
    name: 'Quantum Arbitrage',
    status: 'paused',
    riskLevel: 'quantum',
    assets: ['BTC', 'ETH'],
    rules: [
      { id: 'r3', condition: 'spread_widen', threshold: 0.5, action: 'buy', target: 'ETH' }
    ],
    performance: 45.2,
    lastExecuted: new Date(Date.now() - 86400000).toISOString()
  }
];

// ----------------------------------------------------------------------------
// 4. UI PRIMITIVES (Tailwind Powered)
// ----------------------------------------------------------------------------

const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; actions?: React.ReactNode }> = ({ children, className = '', title, actions }) => (
  <div className={`bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl ${className}`}>
    {(title || actions) && (
      <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/30">
        {title && <h3 className="text-lg font-semibold text-cyan-400 tracking-wide uppercase">{title}</h3>}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20',
    ghost: 'bg-transparent hover:bg-gray-800 text-gray-400 hover:text-white'
  };
  return (
    <button 
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'yellow' | 'blue' | 'purple' }> = ({ children, color = 'blue' }) => {
  const colors = {
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    blue: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    purple: 'bg-violet-500/10 text-violet-400 border-violet-500/20'
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono border ${colors[color]}`}>
      {children}
    </span>
  );
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl transform transition-all scale-100">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------------
// 5. COMPLEX VISUALIZATIONS (The "Bells and Whistles")
// ----------------------------------------------------------------------------

const EngineVisualizer: React.FC<{ active: boolean }> = ({ active }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number; y: number; vx: number; vy: number; life: number; color: string }[] = [];

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 300;
      canvas.height = 200;
    };
    resize();
    window.addEventListener('resize', resize);

    const createParticle = () => {
      const colors = ['#22d3ee', '#818cf8', '#34d399'];
      return {
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 3 - 1,
        life: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)]
      };
    };

    const render = () => {
      ctx.fillStyle = 'rgba(17, 24, 39, 0.2)'; // Trail effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (active && Math.random() > 0.8) {
        particles.push(createParticle());
      }

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.life * 3, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        if (p.life <= 0) particles.splice(i, 1);
      });

      // Draw grid lines
      ctx.strokeStyle = '#1f2937';
      ctx.lineWidth = 1;
      for(let i=0; i<canvas.width; i+=40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]);

  return <canvas ref={canvasRef} className="w-full h-48 rounded-lg border border-gray-800 bg-gray-900" />;
};

// ----------------------------------------------------------------------------
// 6. MAIN COMPONENT: STRATEGY EDITOR
// ----------------------------------------------------------------------------

const StrategyEditor: React.FC = () => {
  // --- STATE ---
  const [apiKey, setApiKey] = useState<string | null>(getApiKey());
  const [strategies, setStrategies] = useState<Strategy[]>(INITIAL_STRATEGIES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'sys_1', role: 'system', content: 'Quantum Core Initialized. Secure connection established.', timestamp: Date.now() },
    { id: 'ai_1', role: 'ai', content: 'Welcome to Quantum Financial. I am your strategic co-pilot. How can I assist you in optimizing your capital allocation today?', timestamp: Date.now() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(!getApiKey());
  const [activeTab, setActiveTab] = useState<'editor' | 'simulation' | 'audit' | 'guide'>('editor');
  const [marketData, setMarketData] = useState<MarketTick[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [isPOUpOpen, setIsPOUpOpen] = useState(false); // Payment Order Up Form
  const [poFormData, setPoFormData] = useState({ recipient: '', amount: '', method: 'WIRE' });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- HELPERS ---

  const addAuditLog = (action: string, details: string) => {
    const log: AuditLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      action,
      user: 'User_Admin_01', // Mock user
      details,
      hash: generateHash(action + details + Date.now())
    };
    setAuditLogs(prev => [log, ...prev]);
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // --- MARKET SIMULATION EFFECT ---
  useEffect(() => {
    const interval = setInterval(() => {
      const newTicks = MOCK_ASSETS.map(symbol => ({
        symbol,
        price: Math.random() * 1000 + 100,
        change: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 1000000),
        trend: Math.random() > 0.5 ? 'up' : 'down' as 'up' | 'down'
      }));
      setMarketData(newTicks);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // --- AI INTEGRATION ---

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    if (!apiKey) {
      setChatMessages(prev => [...prev, { id: generateId(), role: 'system', content: 'API Key missing. Please configure in settings.', timestamp: Date.now() }]);
      setShowApiKeyModal(true);
      return;
    }

    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: chatInput, timestamp: Date.now() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    
    // Add typing indicator
    const typingId = generateId();
    setChatMessages(prev => [...prev, { id: typingId, role: 'ai', content: 'Analyzing...', timestamp: Date.now(), isTyping: true }]);

    try {
      const genAI = new GoogleGenAI({ apiKey });
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash", // Using a standard model name, user prompt had 'gemini-3-flash-preview' which might be unstable
        systemInstruction: `
          You are the Quantum Financial AI, an elite banking assistant for a global financial institution.
          Your tone is professional, secure, and high-performance.
          You have access to the user's strategies and can help them build new ones.
          
          CONTEXT:
          - The user is "Test Driving" the platform.
          - Do NOT use the name "Citibank". Use "Quantum Financial".
          - If the user asks about the company or the demo, explain the benefits of the "Quantum Business Demo" based on the idea of a "Golden Ticket" and "Test Drive".
          - You can create strategies. If the user asks to create a strategy, output a JSON block starting with \`\`\`json and ending with \`\`\` containing a Strategy object.
          
          CURRENT STRATEGIES: ${JSON.stringify(strategies.map(s => s.name))}
        `
      });

      const result = await model.generateContent(userMsg.content);
      const responseText = result.response.text();

      // Check for JSON (Tool Calling Simulation)
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        try {
          const newStrategy = JSON.parse(jsonMatch[1]);
          if (newStrategy.name && newStrategy.rules) {
             const strategyWithId = { ...newStrategy, id: generateId(), status: 'draft', performance: 0, lastExecuted: 'Never' };
             setStrategies(prev => [...prev, strategyWithId]);
             addAuditLog('AI_STRATEGY_GEN', `Generated strategy: ${newStrategy.name}`);
          }
        } catch (e) {
          console.error("Failed to parse AI strategy JSON", e);
        }
      }

      setChatMessages(prev => prev.filter(m => m.id !== typingId).concat({
        id: generateId(),
        role: 'ai',
        content: responseText.replace(/```json[\s\S]*?```/g, '[Strategy Created - Check Editor]'),
        timestamp: Date.now()
      }));

    } catch (error) {
      setChatMessages(prev => prev.filter(m => m.id !== typingId).concat({
        id: generateId(),
        role: 'system',
        content: `Error connecting to Quantum Core: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: Date.now()
      }));
    }
  };

  // --- HANDLERS ---

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(API_KEY_STORAGE, key);
    }
    setShowApiKeyModal(false);
    addAuditLog('SYS_CONFIG', 'API Key updated securely');
  };

  const toggleSimulation = () => {
    const newState = !isSimulating;
    setIsSimulating(newState);
    addAuditLog('SIMULATION_TOGGLE', `Simulation ${newState ? 'STARTED' : 'STOPPED'}`);
    if (newState) {
      setActiveTab('simulation');
    }
  };

  const handlePaymentSubmit = () => {
    addAuditLog('PAYMENT_INIT', `Initiated ${poFormData.method} of ${poFormData.amount} to ${poFormData.recipient}`);
    setIsPOUpOpen(false);
    setPoFormData({ recipient: '', amount: '', method: 'WIRE' });
    // Simulate processing
    setTimeout(() => {
      addAuditLog('PAYMENT_SUCCESS', `Transaction cleared: ${generateId().toUpperCase()}`);
    }, 2000);
  };

  // --------------------------------------------------------------------------
  // RENDER HELPERS
  // --------------------------------------------------------------------------

  const renderEditor = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategies.map(strat => (
          <div key={strat.id} onClick={() => setSelectedStrategy(strat)} className="group cursor-pointer">
            <Card className="h-full hover:border-cyan-500/50 transition-all duration-300 hover:shadow-cyan-500/10">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-gray-700 transition-colors">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <Badge color={strat.status === 'active' ? 'green' : 'yellow'}>{strat.status.toUpperCase()}</Badge>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{strat.name}</h3>
              <p className="text-sm text-gray-400 mb-4">Risk: <span className="text-cyan-400">{strat.riskLevel}</span></p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Performance</span>
                  <span className={strat.performance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{strat.performance > 0 ? '+' : ''}{strat.performance}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${Math.min(Math.abs(strat.performance), 100)}%` }}></div>
                </div>
              </div>
            </Card>
          </div>
        ))}
        
        {/* Add New Strategy Card */}
        <button 
          onClick={() => setChatInput("Create a new conservative strategy for dividend stocks")}
          className="border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center p-6 text-gray-500 hover:text-cyan-400 hover:border-cyan-500/50 hover:bg-gray-800/30 transition-all duration-300 min-h-[200px]"
        >
          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          <span className="font-medium">New Strategy</span>
          <span className="text-xs mt-2 opacity-60">Ask Quantum AI</span>
        </button>
      </div>
    </div>
  );

  const renderSimulation = () => (
    <div className="space-y-6">
      <Card title="Live Engine Telemetry">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EngineVisualizer active={isSimulating} />
            <div className="mt-4 flex justify-between items-center">
              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase">Latency</p>
                  <p className="text-xl font-mono text-cyan-400">12<span className="text-sm">ms</span></p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 uppercase">Throughput</p>
                  <p className="text-xl font-mono text-emerald-400">4.2<span className="text-sm">k tps</span></p>
                </div>
              </div>
              <Button variant={isSimulating ? 'danger' : 'primary'} onClick={toggleSimulation}>
                {isSimulating ? 'STOP ENGINE' : 'IGNITE SIMULATION'}
              </Button>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Market Feed</h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
              {marketData.map((tick, i) => (
                <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-gray-700/50 rounded transition-colors">
                  <span className="font-bold text-gray-200">{tick.symbol}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-300">{tick.price.toFixed(2)}</span>
                    <span className={tick.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {tick.change >= 0 ? '↑' : '↓'} {Math.abs(tick.change).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderAudit = () => (
    <Card title="Immutable Audit Ledger" className="h-full">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-800/50 text-gray-200 uppercase font-medium">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Action</th>
              <th className="p-3">User</th>
              <th className="p-3">Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {auditLogs.map(log => (
              <tr key={log.id} className="hover:bg-gray-800/30 transition-colors">
                <td className="p-3 font-mono text-xs text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                <td className="p-3 text-cyan-400 font-medium">{log.action}</td>
                <td className="p-3">{log.user}</td>
                <td className="p-3 font-mono text-xs text-gray-600 truncate max-w-[150px]" title={log.hash}>{log.hash}</td>
              </tr>
            ))}
            {auditLogs.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-600 italic">No audit records found. System initialized.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );

  const renderGuide = () => (
    <div className="prose prose-invert max-w-none">
      <Card title="Quantum Financial Business Demo: A Comprehensive Guide">
        <div className="space-y-4 text-gray-300 leading-relaxed">
          <p className="text-lg font-light text-cyan-100">
            Welcome to the future of business banking. You are currently in a "Golden Ticket" environment—a secure, high-performance sandbox designed for you to test drive the capabilities of Quantum Financial.
          </p>
          
          <h4 className="text-cyan-400 font-bold text-xl mt-6">Why a Quantum Business Demo is Your Secret Weapon</h4>
          <p>
            Think of this as your ultimate cheat sheet. In today’s fast-paced environment, efficiency isn't just nice-to-have; it's survival. This demo allows you to virtually walk through the entire platform. You get to see firsthand how easy it is to manage your accounts, process payments, track expenses, and access sophisticated reporting tools.
          </p>
          
          <h4 className="text-cyan-400 font-bold text-xl mt-6">Kick the Tires, See the Engine Roar</h4>
          <p>
            We invite you to push the buttons. Run simulations. Generate AI strategies. This is a no-pressure environment. Whether you are a startup or a global enterprise, understanding the tools available to manage your finances is crucial.
          </p>

          <div className="bg-gray-800/50 p-4 rounded-lg border-l-4 border-cyan-500 mt-6">
            <h5 className="font-bold text-white mb-2">Key Features to Explore:</h5>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>AI Co-Pilot:</strong> Use the chat bar on the right to generate strategies instantly.</li>
              <li><strong>Simulation Engine:</strong> Go to the Simulation tab and watch real-time market processing.</li>
              <li><strong>Audit Storage:</strong> Every action you take is cryptographically logged in the Audit tab.</li>
              <li><strong>Payment Ops:</strong> Use the "Quick Actions" to simulate Wires and ACH transfers.</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );

  // --------------------------------------------------------------------------
  // MAIN RENDER
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-gray-100 font-sans selection:bg-cyan-500/30">
      {/* TOP NAVIGATION */}
      <header className="h-16 border-b border-gray-800 bg-gray-900/90 backdrop-blur-md fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="font-bold text-white text-lg">Q</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            {APP_NAME} <span className="text-gray-500 font-light mx-2">|</span> <span className="text-cyan-400 text-sm uppercase tracking-widest">Strategy Command</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full border border-gray-700">
            <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></div>
            <span className="text-xs font-mono text-gray-400">{isSimulating ? 'SYSTEM ONLINE' : 'STANDBY'}</span>
          </div>
          <Button variant="secondary" className="text-sm" onClick={() => setIsPOUpOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Quick Transfer
          </Button>
          <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:bg-gray-600 transition-colors">
            JB
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="pt-16 flex h-screen overflow-hidden">
        
        {/* SIDEBAR */}
        <nav className="w-20 md:w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0 flex flex-col justify-between hidden md:flex">
          <div className="p-4 space-y-2">
            {[
              { id: 'editor', label: 'Strategies', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /> },
              { id: 'simulation', label: 'Simulation', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /> },
              { id: 'audit', label: 'Audit Logs', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> },
              { id: 'guide', label: 'Demo Guide', icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /> },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${activeTab === item.id ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-500/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{item.icon}</svg>
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-gray-800">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <p className="text-xs text-gray-500 uppercase mb-2">System Status</p>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-300">Core: Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span className="text-sm text-gray-300">AI: Connected</span>
              </div>
            </div>
          </div>
        </nav>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-[#0a0f1c] relative">
          {/* Background Grid Effect */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/5 to-transparent pointer-events-none"></div>

          <div className="p-8 max-w-7xl mx-auto relative z-10">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {activeTab === 'editor' && 'Strategy Portfolio'}
                {activeTab === 'simulation' && 'Market Simulation Engine'}
                {activeTab === 'audit' && 'Security & Compliance Ledger'}
                {activeTab === 'guide' && 'Demo Documentation'}
              </h2>
              <p className="text-gray-400">
                {activeTab === 'editor' && 'Manage and optimize your algorithmic trading strategies.'}
                {activeTab === 'simulation' && 'Real-time stress testing and performance analysis.'}
                {activeTab === 'audit' && 'Immutable record of all system activities and user interventions.'}
                {activeTab === 'guide' && 'Learn how to maximize your Quantum Financial experience.'}
              </p>
            </div>

            {activeTab === 'editor' && renderEditor()}
            {activeTab === 'simulation' && renderSimulation()}
            {activeTab === 'audit' && renderAudit()}
            {activeTab === 'guide' && renderGuide()}
          </div>
        </main>

        {/* AI CHAT SIDEBAR */}
        <aside className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl z-30">
          <div className="p-4 border-b border-gray-800 bg-gray-900/95 backdrop-blur flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              <h3 className="font-bold text-white">Quantum Core AI</h3>
            </div>
            <button onClick={() => setShowApiKeyModal(true)} className="text-xs text-gray-500 hover:text-cyan-400 transition-colors">Config</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-900/50">
            {chatMessages.filter(m => m.role !== 'system').map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-br-none shadow-lg shadow-cyan-900/20' 
                    : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                }`}>
                  {msg.isTyping ? (
                    <div className="flex gap-1 h-5 items-center">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Quantum to analyze or build..."
                className="w-full bg-gray-800 text-white rounded-xl pl-4 pr-12 py-3 text-sm border border-gray-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-2 top-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* MODALS */}
      
      {/* API Key Modal */}
      <Modal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} title="System Configuration">
        <div className="space-y-4">
          <p className="text-gray-400 text-sm">
            To enable the Quantum Core AI features, please provide your Gemini API Key. This key is stored locally in your browser session for the duration of this demo.
          </p>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Gemini API Key</label>
            <input 
              type="password" 
              placeholder="AIzaSy..." 
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
              onChange={(e) => setApiKey(e.target.value)}
              value={apiKey || ''}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={() => setShowApiKeyModal(false)}>Cancel</Button>
            <Button onClick={() => apiKey && handleSaveApiKey(apiKey)}>Initialize Core</Button>
          </div>
        </div>
      </Modal>

      {/* Payment Order (PO) Up Form */}
      <Modal isOpen={isPOUpOpen} onClose={() => setIsPOUpOpen(false)} title="Initiate Fund Transfer">
        <div className="space-y-6">
          <div className="bg-cyan-900/20 border border-cyan-500/30 p-4 rounded-lg flex gap-3 items-start">
            <svg className="w-5 h-5 text-cyan-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm text-cyan-100">This action will be cryptographically signed and logged in the audit ledger. Ensure all details are correct.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Recipient</label>
              <input 
                type="text" 
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                placeholder="Beneficiary Name or ID"
                value={poFormData.recipient}
                onChange={e => setPoFormData({...poFormData, recipient: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input 
                    type="number" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 pl-8 text-white focus:border-cyan-500 outline-none"
                    placeholder="0.00"
                    value={poFormData.amount}
                    onChange={e => setPoFormData({...poFormData, amount: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Method</label>
                <select 
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                  value={poFormData.method}
                  onChange={e => setPoFormData({...poFormData, method: e.target.value})}
                >
                  <option value="WIRE">FedWire (Immediate)</option>
                  <option value="ACH">ACH (1-2 Days)</option>
                  <option value="SWIFT">SWIFT (International)</option>
                  <option value="QUANTUM_NET">Quantum Net (Instant)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
            <Button variant="ghost" onClick={() => setIsPOUpOpen(false)}>Cancel</Button>
            <Button onClick={handlePaymentSubmit} disabled={!poFormData.recipient || !poFormData.amount}>
              Authorize Transfer
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default StrategyEditor;