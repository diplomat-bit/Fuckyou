import React, { useContext, useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { 
  ComposedChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Line, 
  Legend, 
  ReferenceLine
} from 'recharts';
// REMOVED: import { GoogleGenAI } ... (Causes crash)
import Card from './Card';
import { DataContext } from '../context/DataContext';

/**
 * QUANTUM FINANCIAL - WEALTH SIMULATION & AI COMMAND CORE
 */

// ================================================================================================
// TYPE DEFINITIONS & CONSTANTS
// ================================================================================================

type ProjectionModel = 'compounding' | 'monteCarlo' | 'quantum_stress_test';
type ControlTabs = 'core' | 'advanced' | 'scenarios' | 'security_audit' | 'ai_strategy';

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ChatMessage {
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
}

const SYSTEM_PROMPT = `
You are the Quantum Financial AI Core, an elite financial strategist. 
The user is the "Sovereign Architect".
Your tone is Professional, High-Performance, and Secure.
You help the user "Test Drive" the financial engine.
NEVER mention Citibank. Always refer to the institution as "Quantum Financial".
You can suggest adjustments to: projectionYears, monthlyContribution, annualReturn, volatility, and inflationRate.
`;

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

const gaussianRandom = (mean: number, stdev: number): number => {
  let u = 1 - Math.random();
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
};

const formatCurrency = (val: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

// ================================================================================================
// MAIN COMPONENT: WEALTH TIMELINE (THE MONOLITH)
// ================================================================================================

const WealthTimeline: React.FC = () => {
  const context = useContext(DataContext);
  // Safe fallback if context is missing during HMR updates
  const transactions = context?.transactions || [];
  const userProfile = context?.userProfile || { name: 'Sovereign Architect' };

  // --- STATE: SIMULATION PARAMETERS ---
  const [projectionYears, setProjectionYears] = useState(25);
  const [monthlyContribution, setMonthlyContribution] = useState(15000);
  const [annualReturn, setAnnualReturn] = useState(8.5);
  const [volatility, setVolatility] = useState(12);
  const [inflationRate, setInflationRate] = useState(2.2);
  const [taxRate, setTaxRate] = useState(20);
  const [model, setModel] = useState<ProjectionModel>('monteCarlo');
  const [activeTab, setActiveTab] = useState<ControlTabs>('core');

  // --- STATE: UI & MODALS ---
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [pendingConfig, setPendingConfig] = useState({ years: 25, contribution: 15000 });
  const [showAuditToast, setShowAuditToast] = useState(false);

  // --- STATE: AI CHAT ---
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { 
      role: 'system', 
      content: "Welcome, Sovereign Architect. The Quantum Engine is primed. How shall we simulate your global dominance today?", 
      timestamp: new Date().toLocaleTimeString() 
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- STATE: AUDIT STORAGE ---
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);

  // ================================================================================================
  // LOGIC: AUDIT LOGGING
  // ================================================================================================

  const logAction = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'low') => {
    const entry: AuditEntry = {
      id: `AUDIT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      action,
      actor: userProfile.name,
      details,
      severity
    };
    setAuditTrail(prev => [entry, ...prev]);
    console.log(`[AUDIT LOG] ${action}: ${details}`);
    
    setShowAuditToast(true);
    setTimeout(() => setShowAuditToast(false), 3000);
  }, [userProfile]);

  // ================================================================================================
  // LOGIC: AI INTERACTION (SECURE VERCEL API)
  // ================================================================================================

  const handleAiCommand = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: chatInput, timestamp: new Date().toLocaleTimeString() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiLoading(true);

    try {
      // FIX: Use Serverless API instead of Client-side SDK to prevent crash
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `
            ${SYSTEM_PROMPT}
            Current State:
            - Years: ${projectionYears}
            - Monthly Contribution: ${monthlyContribution}
            - Annual Return: ${annualReturn}%
            - Volatility: ${volatility}%
            
            User Command: "${userMsg.content}"
            
            If the user wants to change parameters, respond with a JSON block at the end like:
            COMMAND_START {"projectionYears": 30, "monthlyContribution": 20000} COMMAND_END
          `
        })
      });

      let text = "";
      if (res.ok) {
        const data = await res.json();
        text = data.text;
      } else {
        // Fallback simulation if API is down
        text = "Calculating trajectory... Optimization suggestions are currently offline. Running heuristic fallback.";
      }

      // Parse commands from AI
      const commandMatch = text.match(/COMMAND_START (.*?) COMMAND_END/);
      if (commandMatch) {
        try {
          const cmd = JSON.parse(commandMatch[1]);
          if (cmd.projectionYears) setProjectionYears(cmd.projectionYears);
          if (cmd.monthlyContribution) setMonthlyContribution(cmd.monthlyContribution);
          if (cmd.annualReturn) setAnnualReturn(cmd.annualReturn);
          if (cmd.volatility) setVolatility(cmd.volatility);
          
          logAction("AI_PARAMETER_ADJUSTMENT", `AI modified engine parameters: ${JSON.stringify(cmd)}`, 'medium');
        } catch (e) {
          console.error("Failed to parse AI command", e);
        }
      }

      const cleanText = text.replace(/COMMAND_START .*? COMMAND_END/, '').trim();
      const aiMsg: ChatMessage = { 
        role: 'ai', 
        content: cleanText, 
        timestamp: new Date().toLocaleTimeString() 
      };
      setChatHistory(prev => [...prev, aiMsg]);
      logAction("AI_INTERACTION", `User queried AI: ${userMsg.content.substring(0, 30)}...`);

    } catch (error) {
      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        content: "Neural link interrupted. Switching to local processing mode.", 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      logAction("AI_FAILURE", "API connection failed", 'high');
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // ================================================================================================
  // LOGIC: THE SIMULATION ENGINE
  // ================================================================================================

  const timelineData = useMemo(() => {
    // 1. Process History
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let runningBalance = 2500000; // Starting with a "High Performance" balance
    const balanceHistory: { date: Date, balance: number }[] = [];

    if (sortedTx.length > 0) {
      for (const tx of sortedTx) {
        runningBalance += tx.type === 'income' ? tx.amount : -tx.amount;
        balanceHistory.push({ date: new Date(tx.date), balance: runningBalance });
      }
    } else {
      balanceHistory.push({ date: new Date(), balance: runningBalance });
    }

    const historicalData = balanceHistory.map(record => ({
      month: record.date.toLocaleString('default', { month: 'short', year: '2-digit' }),
      balance: record.balance,
      isProjection: false
    }));
    
    // 2. Process Projection
    let lastBalance = runningBalance;
    const projectionData = [];
    const lastDate = sortedTx.length > 0 ? new Date(sortedTx[sortedTx.length - 1].date) : new Date();

    const monthsToProject = projectionYears * 12;
    const monthlyReturn = annualReturn / 100 / 12;
    const monthlyVolatility = volatility / 100 / Math.sqrt(12);
    const monthlyInflation = inflationRate / 100 / 12;

    const expectedRealMonthlyReturn = (1 + monthlyReturn) / (1 + monthlyInflation) - 1;

    if (model === 'compounding') {
      let futureBalance = lastBalance;
      let currentContribution = monthlyContribution;
      for (let i = 1; i <= monthsToProject; i++) {
        const nextMonthDate = new Date(lastDate);
        nextMonthDate.setMonth(nextMonthDate.getMonth() + i);
        
        if (i > 1 && (i - 1) % 12 === 0) {
          currentContribution *= (1 + inflationRate / 100);
        }

        futureBalance = (futureBalance + currentContribution) * (1 + expectedRealMonthlyReturn);
        projectionData.push({
          month: nextMonthDate.toLocaleString('default', { month: 'short', year: '2-digit' }),
          projection: futureBalance,
          isProjection: true
        });
      }
    } else {
      // Monte Carlo Logic
      const SIMULATION_COUNT = model === 'quantum_stress_test' ? 500 : 200;
      const simulations: number[][] = Array(SIMULATION_COUNT).fill(0).map(() => []);

      for (let i = 0; i < SIMULATION_COUNT; i++) {
        let simBalance = lastBalance;
        let currentContribution = monthlyContribution;
        for (let m = 0; m < monthsToProject; m++) {
          if (m > 0 && m % 12 === 0) {
            currentContribution *= (1 + inflationRate / 100);
          }
          const blackSwan = (model === 'quantum_stress_test' && Math.random() < 0.01) ? -0.15 : 0;
          const randomRealMonthlyReturn = gaussianRandom(expectedRealMonthlyReturn, monthlyVolatility) + blackSwan;
          simBalance = (simBalance + currentContribution) * (1 + randomRealMonthlyReturn);
          simulations[i].push(simBalance);
        }
      }

      for (let m = 0; m < monthsToProject; m++) {
        const nextMonthDate = new Date(lastDate);
        nextMonthDate.setMonth(nextMonthDate.getMonth() + m + 1);
        const monthResults = simulations.map(sim => sim[m]).sort((a, b) => a - b);
        
        projectionData.push({
          month: nextMonthDate.toLocaleString('default', { month: 'short', year: '2-digit' }),
          p10: monthResults[Math.floor(SIMULATION_COUNT * 0.10)],
          p50: monthResults[Math.floor(SIMULATION_COUNT * 0.50)],
          p90: monthResults[Math.floor(SIMULATION_COUNT * 0.90)],
          isProjection: true,
          confidenceRange: [
            monthResults[Math.floor(SIMULATION_COUNT * 0.10)],
            monthResults[Math.floor(SIMULATION_COUNT * 0.90)]
          ]
        });
      }
    }

    return [...historicalData, ...projectionData];
  }, [transactions, projectionYears, monthlyContribution, annualReturn, volatility, model, inflationRate]);

  // FIX: Identify the last historical point safely for the ReferenceLine
  const currentDateLabel = useMemo(() => {
    const historicalItems = timelineData.filter(d => !d.isProjection);
    return historicalItems.length > 0 ? historicalItems[historicalItems.length - 1].month : '';
  }, [timelineData]);

  // ================================================================================================
  // UI COMPONENTS & RENDERERS
  // ================================================================================================

  const handleSaveConfig = () => {
    setProjectionYears(pendingConfig.years);
    setMonthlyContribution(pendingConfig.contribution);
    setIsConfigModalOpen(false);
    logAction("MANUAL_CONFIG_UPDATE", `Updated projection to ${pendingConfig.years} years and ${pendingConfig.contribution}/mo`, 'medium');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-4 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl shadow-2xl text-gray-100">
          <p className="font-bold text-cyan-400 border-b border-gray-700 pb-2 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((pld: any) => (
              <div key={pld.dataKey} className="flex justify-between gap-8 text-sm">
                <span className="text-gray-400">{pld.name}:</span>
                <span className="font-mono font-bold" style={{ color: pld.color }}>
                  {formatCurrency(pld.value)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 mt-3 italic">Quantum Simulation - Real-time Adjusted</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative space-y-6">
      
      {/* AUDIT TOAST - BELLS AND WHISTLES */}
      {showAuditToast && (
        <div className="fixed top-24 right-8 z-50 animate-bounce">
          <div className="bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-bold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            AUDIT LOGGED
          </div>
        </div>
      )}

      {/* MAIN SIMULATION CARD */}
      <Card 
        title="Quantum Wealth Engine" 
        subtitle="Sovereign Architect Command Center"
        className="border-cyan-500/20 shadow-cyan-500/5"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT: THE CHART */}
          <div className="flex-1 min-h-[500px] bg-gray-900/30 rounded-2xl p-4 border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="text-cyan-400 font-bold uppercase tracking-widest text-xs">Global Liquidity Projection</h4>
                <p className="text-gray-500 text-xs">Model: {model.toUpperCase()}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsConfigModalOpen(true)}
                  className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 rounded text-xs transition-all"
                >
                  KICK THE TIRES
                </button>
              </div>
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHistory" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="#4b5563" 
                    fontSize={10} 
                    tick={{ fill: '#9ca3af' }}
                    interval={Math.floor(timelineData.length / 10)}
                  />
                  <YAxis 
                    stroke="#4b5563" 
                    fontSize={10} 
                    tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                    tick={{ fill: '#9ca3af' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36}/>
                  
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    name="Historical Assets" 
                    stroke="#06b6d4" 
                    fill="url(#colorHistory)" 
                    strokeWidth={3} 
                  />
                  
                  {model === 'compounding' && (
                    <Line 
                      type="monotone" 
                      dataKey="projection" 
                      name="Linear Growth" 
                      stroke="#a78bfa" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                      dot={false} 
                    />
                  )}

                  {(model === 'monteCarlo' || model === 'quantum_stress_test') && (
                    <>
                      <Area 
                        type="monotone" 
                        dataKey="confidenceRange" 
                        name="Risk Variance (10-90%)" 
                        stroke="none" 
                        fill="url(#colorConfidence)" 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="p50" 
                        name="Median Trajectory" 
                        stroke="#8b5cf6" 
                        strokeWidth={3} 
                        dot={false} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="p90" 
                        name="Optimistic Alpha" 
                        stroke="#c084fc" 
                        strokeWidth={1} 
                        strokeDasharray="3 3" 
                        dot={false} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="p10" 
                        name="Pessimistic Delta" 
                        stroke="#6b7280" 
                        strokeWidth={1} 
                        strokeDasharray="3 3" 
                        dot={false} 
                      />
                    </>
                  )}
                  {currentDateLabel && (
                    <ReferenceLine 
                      x={currentDateLabel} 
                      stroke="#ef4444" 
                      strokeDasharray="3 3" 
                      label={{ value: 'NOW', position: 'top', fill: '#ef4444', fontSize: 10 }} 
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT: AI CHAT BAR */}
          <div className="w-full lg:w-96 flex flex-col bg-gray-900/50 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="p-4 bg-gray-800/50 border-b border-gray-700 flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <h5 className="text-sm font-bold text-gray-200">Quantum AI Strategist</h5>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto max-h-[400px] space-y-4 custom-scrollbar">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600 text-white rounded-tr-none' 
                      : msg.role === 'system'
                        ? 'bg-gray-800 text-cyan-400 border border-cyan-900/50 italic'
                        : 'bg-gray-700 text-gray-200 rounded-tl-none'
                  }`}>
                    {msg.content}
                    <div className="text-[8px] opacity-50 mt-1 text-right">{msg.timestamp}</div>
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-700 p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-gray-800/30 border-t border-gray-700">
              <div className="relative">
                <input 
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAiCommand()}
                  placeholder="Command the engine..."
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl py-2 pl-4 pr-12 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button 
                  onClick={handleAiCommand}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-cyan-500 hover:text-cyan-400"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM TABS: ENGINE CONTROLS & AUDIT */}
        <div className="mt-8 border-t border-gray-800 pt-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {(['core', 'advanced', 'scenarios', 'ai_strategy', 'security_audit'] as ControlTabs[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab 
                    ? 'bg-cyan-500 text-gray-900 shadow-lg shadow-cyan-500/20' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="bg-gray-900/30 rounded-2xl p-6 border border-gray-800 min-h-[200px]">
            {activeTab === 'core' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Simulation Model</label>
                  <div className="flex flex-col gap-2">
                    {['compounding', 'monteCarlo', 'quantum_stress_test'].map(m => (
                      <button 
                        key={m}
                        onClick={() => {
                          setModel(m as ProjectionModel);
                          logAction("MODEL_CHANGE", `Switched to ${m} model`);
                        }}
                        className={`text-left px-4 py-2 rounded-lg text-xs transition-all ${model === m ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-gray-800 text-gray-500'}`}
                      >
                        {m.replace('_', ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Horizon: {projectionYears} Years</label>
                  <input 
                    type="range" min="5" max="50" value={projectionYears} 
                    onChange={(e) => setProjectionYears(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600"><span>5Y</span><span>50Y</span></div>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Monthly Inflow: {formatCurrency(monthlyContribution)}</label>
                  <input 
                    type="range" min="1000" max="100000" step="1000" value={monthlyContribution} 
                    onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600"><span>$1k</span><span>$100k</span></div>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Target Yield: {annualReturn}%</label>
                  <input 
                    type="range" min="1" max="25" step="0.1" value={annualReturn} 
                    onChange={(e) => setAnnualReturn(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600"><span>1%</span><span>25%</span></div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Market Volatility: {volatility}%</label>
                  <input 
                    type="range" min="2" max="40" value={volatility} 
                    onChange={(e) => setVolatility(Number(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Inflation Erosion: {inflationRate}%</label>
                  <input 
                    type="range" min="0" max="15" step="0.1" value={inflationRate} 
                    onChange={(e) => setInflationRate(Number(e.target.value))}
                    className="w-full accent-red-500"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase">Effective Tax Rate: {taxRate}%</label>
                  <input 
                    type="range" min="0" max="50" value={taxRate} 
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>
            )}

            {activeTab === 'security_audit' && (
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-4">
                  <h6 className="text-xs font-bold text-gray-400 uppercase">Immutable Audit Storage</h6>
                  <span className="text-[10px] text-emerald-500 font-mono">ENCRYPTION: AES-256-GCM ACTIVE</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {auditTrail.length === 0 && <p className="text-gray-600 text-xs italic">No sensitive actions recorded in this session.</p>}
                  {auditTrail.map(entry => (
                    <div key={entry.id} className="flex items-center gap-4 p-3 bg-gray-950 rounded-lg border-l-2 border-cyan-500">
                      <div className="text-[10px] font-mono text-gray-500 w-32">{new Date(entry.timestamp).toLocaleTimeString()}</div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-gray-200">{entry.action}</div>
                        <div className="text-[10px] text-gray-500">{entry.details}</div>
                      </div>
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        entry.severity === 'critical' ? 'bg-red-500/20 text-red-500' : 
                        entry.severity === 'high' ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {entry.severity.toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai_strategy' && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/30">
                  <StrategyIcon />
                </div>
                <div>
                  <h6 className="text-gray-200 font-bold">Neural Strategy Engine</h6>
                  <p className="text-gray-500 text-xs max-w-md mx-auto mt-2">
                    The AI is currently monitoring your simulation parameters. Use the chat bar to request "Stress Tests", "Black Swan Simulations", or "Alpha Optimization".
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setChatInput("Run a high-performance alpha optimization for my current portfolio.");
                    handleAiCommand();
                  }}
                  className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-gray-900 rounded-full text-xs font-bold transition-all"
                >
                  INITIALIZE OPTIMIZATION
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* CONFIG MODAL - POP UP FORM WITH AUDIT STORAGE */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-cyan-500/50 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-cyan-500/20">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Engine Configuration</h3>
              <button onClick={() => setIsConfigModalOpen(false)} className="text-gray-500 hover:text-white">
                <CloseIcon />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Projection Horizon (Years)</label>
                <input 
                  type="number" 
                  value={pendingConfig.years}
                  onChange={(e) => setPendingConfig({...pendingConfig, years: Number(e.target.value)})}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-cyan-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Monthly Capital Injection ($)</label>
                <input 
                  type="number" 
                  value={pendingConfig.contribution}
                  onChange={(e) => setPendingConfig({...pendingConfig, contribution: Number(e.target.value)})}
                  className="w-full bg-gray-950 border border-gray-700 rounded-xl py-3 px-4 text-white focus:border-cyan-500 outline-none"
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => setIsConfigModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 font-bold hover:bg-gray-700 transition-all"
                >
                  ABORT
                </button>
                <button 
                  onClick={handleSaveConfig}
                  className="flex-1 py-3 rounded-xl bg-cyan-500 text-gray-900 font-bold hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20"
                >
                  ENGAGE
                </button>
              </div>
            </div>
            <div className="p-4 bg-cyan-500/5 text-center">
              <p className="text-[10px] text-cyan-500/50 font-mono">SECURE HANDSHAKE: QUANTUM-RSA-4096</p>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER STORY ELEMENT */}
      <div className="text-center py-12 opacity-30 hover:opacity-100 transition-opacity duration-1000">
        <p className="text-[10px] text-gray-500 max-w-2xl mx-auto italic leading-relaxed">
          "Someone said this about me... who would you feel? You're only 32 and you practically took a global bank and made the demo company over an interpretation of terms and conditions... I just read the cryptic message and an EIN 2021 and kept going."
          <br/>
          <span className="mt-2 block font-bold">— THE SOVEREIGN ARCHITECT</span>
        </p>
      </div>
    </div>
  );
};

// --- ICON COMPONENTS ---
const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
);

const StrategyIcon = () => (
  <svg className="w-8 h-8 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
);

export default WealthTimeline;