

import React, { useState, useCallback, useMemo } from 'react';
import { 
  RefreshCw, Play, Save, History, Code, Settings, TrendingUp, DollarSign, X, User, LogOut,
  Plus, Search, Filter, ChevronDown, ChevronUp, BrainCircuit, Bot, SlidersHorizontal,
  LayoutDashboard, Repeat, Send, Target, Trophy, Heart, Briefcase, Link, Zap, Lock,
  Atom, Users, Megaphone, CreditCard, Handshake, Activity, Phone, Shield, Sparkles, Eye,
  Globe, Key, Receipt, Rocket, PieChart, Palette, Building, Wheat, Scale, Crown, FileText,
  Server, Network, GitBranch, HardDrive, Cpu, Database, Cloud, Terminal, BookOpen,
  BarChart2, CheckSquare, Calendar, MessageSquare, LifeBuoy
} from 'lucide-react';
import { Badge } from './badge'; // Fixed import case to match file name

// --- Expanded Data Models ---

interface SystemMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  aiPrediction: number;
  subMetrics?: { label: string; value: string }[];
}

interface AIInsight {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'market' | 'system' | 'security' | 'optimization' | 'regulatory';
  message: string;
  confidence: number;
  actionable: boolean;
  relatedEntityId?: string;
}

interface AlgorithmParameter {
  name: string;
  type: 'number' | 'string' | 'boolean';
  value: any;
  range?: [number, number];
  description: string;
}

interface Algorithm {
  id: string;
  name: string;
  description: string;
  tags: string[];
  code: string; // Can be JSON for No-Code or raw script
  language: 'nocode' | 'python' | 'rust';
  status: 'draft' | 'backtesting' | 'live' | 'error' | 'optimizing' | 'archived';
  version: number;
  lastModified: string;
  author: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  aiScore: number; // 0-100, AI's confidence in the algo's viability
  parameters: AlgorithmParameter[];
  deploymentTarget: 'cloud-cluster-a' | 'edge-node-tokyo' | 'quantum-fabric-1';
  performanceMetrics?: {
    pnl: number;
    return: number;
    sharpe: number;
    sortino: number;
    alpha: number;
    beta: number;
    volatility: number;
    winRate: number;
    maxDrawdown: number;
  };
  // "GEIN" implementation
  geinFactor: number;
  interactionMatrix: number[][];
  dataPointSensitivity: Record<string, number>;
  layerMetrics: Record<string, { gein: number; activation: number }>;
  executionPriority: 'low' | 'normal' | 'high' | 'critical' | 'quantum';
  computeProfile: 'cpu-bound' | 'memory-bound' | 'io-bound' | 'gpu-accelerated';
  dataSources: string[];
  dependencies: { name: string; version: string }[];
  permissions: string[];
  ownerTeam: string;
  isAudited: boolean;
  auditHistory: { date: string; auditor: string; result: 'pass' | 'fail' }[];
}

interface BacktestResult {
  runId: string;
  algorithmId: string;
  algorithmVersion: number;
  startDate: string;
  endDate:string;
  initialCapital: number;
  finalCapital: number;
  equityCurve: { date: string; value: number; aiForecast: number }[];
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    trades: number;
    profitFactor: number;
    expectancy: number;
    avgTradeReturn: number;
  };
  parametersSnapshot: AlgorithmParameter[];
  aiAnalysis: string;
  tradeLog: { timestamp: string; type: 'buy' | 'sell'; asset: string; quantity: number; price: number; pnl: number }[];
}

interface UserProfile {
  id: string;
  name: string;
  role: 'Administrator' | 'Trader' | 'Quant' | 'Observer';
  clearanceLevel: number;
  email: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto' | 'matrix';
    notifications: 'all' | 'critical' | 'none';
    aiAssistanceLevel: 'minimal' | 'standard' | 'proactive';
    defaultView: string;
  };
  apiKeys: { service: string; key: string; lastUsed: string }[];
  security: {
    twoFactorEnabled: boolean;
    lastLogin: string;
    loginHistory: { timestamp: string; ip: string; status: 'success' | 'failed' }[];
  };
  stats: {
    loginCount: number;
    actionsPerformed: number;
    uptime: string;
    pnlContribution: number;
  };
}

// --- Data Utilities & Mocks ---

const generateTimeSeries = (points: number, startValue: number, volatility: number) => {
  const data = [];
  let currentValue = startValue;
  const now = new Date();
  for (let i = 0; i < points; i++) {
    const date = new Date(now.getTime() - (points - i) * 86400000).toISOString().split('T')[0];
    const change = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + change);
    data.push({
      date,
      value: currentValue,
      aiForecast: currentValue * (1 + (Math.random() - 0.5) * 0.02)
    });
  }
  return data;
};

const mockInsights: AIInsight[] = [
  { id: 'ins-1', timestamp: '2023-10-27 09:15:00', severity: 'high', category: 'market', message: 'Detected arbitrage opportunity in FOREX/CRYPTO bridge.', confidence: 0.98, actionable: true, relatedEntityId: 'algo-3' },
  { id: 'ins-2', timestamp: '2023-10-27 09:30:00', severity: 'medium', category: 'optimization', message: 'Algorithm "Alpha-1" logic can be compressed by 15%. Suggest refactor.', confidence: 0.85, actionable: true, relatedEntityId: 'algo-1' },
  { id: 'ins-3', timestamp: '2023-10-27 10:00:00', severity: 'low', category: 'system', message: 'Global latency reduced by 4ms via AI routing.', confidence: 0.99, actionable: false },
  { id: 'ins-4', timestamp: '2023-10-27 10:45:00', severity: 'critical', category: 'security', message: 'Anomalous login attempt blocked by Neural Firewall.', confidence: 0.99, actionable: false },
  { id: 'ins-5', timestamp: '2023-10-27 11:00:00', severity: 'medium', category: 'regulatory', message: 'New SEC filing detected for AAPL. Potential volatility increase.', confidence: 0.92, actionable: true },
];

const initialAlgorithms: Algorithm[] = [
  { 
    id: 'algo-1', 
    name: 'Quantum Momentum Scalper v4', 
    description: 'High-frequency scalping strategy utilizing quantum-inspired principles for momentum prediction.',
    tags: ['HFT', 'Scalping', 'Momentum', 'Quantum'],
    code: '{"nodes":["Input: L2 Market Data Stream", "Filter: Volatility > 1.5", "AI Model: Quantum Trend Predictor", "Logic: If confidence > 0.95", "Action: Buy/Sell 100 units"]}', 
    language: 'nocode',
    status: 'live', 
    version: 4,
    lastModified: '2023-10-26',
    author: 'System Admin',
    riskLevel: 'high',
    aiScore: 94,
    parameters: [
      { name: 'Volatility Threshold', type: 'number', value: 1.5, range: [0.5, 5], description: 'Minimum volatility to activate trading.' },
      { name: 'Trade Size', type: 'number', value: 100, range: [10, 1000], description: 'Number of units per trade.' }
    ],
    deploymentTarget: 'cloud-cluster-a',
    performanceMetrics: { pnl: 125000, return: 45.2, sharpe: 2.1, sortino: 2.8, alpha: 0.15, beta: 0.8, volatility: 12.5, winRate: 68, maxDrawdown: -8.2 },
    geinFactor: 0.98,
    interactionMatrix: [[1, 0.2, -0.1], [0.2, 1, 0.5], [-0.1, 0.5, 1]],
    dataPointSensitivity: { 'L2.bid_price': 0.8, 'L2.ask_price': 0.8, 'volatility': 0.9 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.95 }, 'quantum_core': { gein: 0.99, activation: 0.98 }, 'output': { gein: 1.0, activation: 0.96 } },
    executionPriority: 'quantum',
    computeProfile: 'gpu-accelerated',
    dataSources: ['L2 Market Data Stream', 'Global News Feed API'],
    dependencies: [{ name: 'quantum-tensor-lib', version: '2.5.1' }],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'Quantum Core Team',
    isAudited: true,
    auditHistory: [{ date: '2023-09-15', auditor: 'Internal Security', result: 'pass' }]
  },
  { 
    id: 'algo-2', 
    name: 'Mean Reversion HFT (Neural)', 
    description: 'Neural network-based strategy that capitalizes on short-term mean reversion in liquid assets.',
    tags: ['HFT', 'Mean Reversion', 'AI', 'Market Making'],
    code: '{"nodes":["Input: Order Book Depth", "AI: Sentiment Analysis (News Feeds)", "Logic: Spread > 0.02% AND Reversion Signal", "Action: Market Make (Bid/Ask)"]}', 
    language: 'nocode',
    status: 'backtesting', 
    version: 12,
    lastModified: '2023-10-27',
    author: 'AI Architect',
    riskLevel: 'medium',
    aiScore: 88,
    parameters: [
      { name: 'Spread Threshold', type: 'number', value: 0.02, range: [0.01, 0.1], description: 'Minimum bid-ask spread to engage.' },
      { name: 'Sentiment Weight', type: 'number', value: 0.3, range: [0, 1], description: 'Influence of news sentiment on trade logic.' }
    ],
    deploymentTarget: 'edge-node-tokyo',
    performanceMetrics: { pnl: 45000, return: 12.5, sharpe: 1.8, sortino: 1.9, alpha: 0.05, beta: 0.2, volatility: 4.2, winRate: 55, maxDrawdown: -4.1 },
    geinFactor: 0.85,
    interactionMatrix: [[1, 0.7], [0.7, 1]],
    dataPointSensitivity: { 'spread': 0.9, 'sentiment': 0.6 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.9 }, 'neural_net': { gein: 0.8, activation: 0.92 }, 'output': { gein: 1.0, activation: 0.88 } },
    executionPriority: 'high',
    computeProfile: 'cpu-bound',
    dataSources: ['Order Book Depth', 'News Feeds'],
    dependencies: [{ name: 'sentiment-analyzer', version: '4.2.0' }],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'AI Research',
    isAudited: true,
    auditHistory: [{ date: '2023-08-20', auditor: 'External Audit Co.', result: 'pass' }]
  },
  { 
    id: 'algo-3', 
    name: 'Global Macro Arbitrage', 
    description: 'Long-term strategy identifying and exploiting price discrepancies between correlated global assets.',
    tags: ['Macro', 'Arbitrage', 'Global', 'Low-Risk'],
    code: '{"nodes":["Input: Global Indices (S&P, FTSE, NIKKEI)", "Input: Forex Rates (USD, EUR, JPY)", "Logic: Correlation Divergence > 2-sigma", "Action: Hedge Pair Trade"]}', 
    language: 'nocode',
    status: 'draft', 
    version: 1,
    lastModified: '2023-10-27',
    author: 'User',
    riskLevel: 'low',
    aiScore: 72,
    parameters: [
      { name: 'Correlation Window', type: 'number', value: 90, range: [30, 365], description: 'Lookback period for correlation calculation (days).' },
      { name: 'Sigma Threshold', type: 'number', value: 2, range: [1, 3], description: 'Standard deviation for divergence signal.' }
    ],
    deploymentTarget: 'quantum-fabric-1',
    geinFactor: 0.7,
    interactionMatrix: [[1, 0.85, 0.7], [0.85, 1, 0.75], [0.7, 0.75, 1]],
    dataPointSensitivity: { 'correlation_divergence': 0.95 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.99 }, 'logic': { gein: 0.9, activation: 0.9 }, 'output': { gein: 1.0, activation: 0.92 } },
    executionPriority: 'normal',
    computeProfile: 'memory-bound',
    dataSources: ['Global Indices API', 'Forex Rates API'],
    dependencies: [],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'Macro Analysis Desk',
    isAudited: false,
    auditHistory: []
  },
];

const mockUserProfile: UserProfile = {
  id: 'u-001',
  name: 'Trader',
  role: 'Administrator',
  clearanceLevel: 5,
  email: 'admin@local',
  preferences: { theme: 'dark', notifications: 'all', aiAssistanceLevel: 'proactive', defaultView: 'Executive Dashboard' },
  apiKeys: [{ service: 'Binance', key: 'bin_..._xyz', lastUsed: '2023-10-27 10:30:00' }],
  security: {
    twoFactorEnabled: true,
    lastLogin: '2023-10-27 09:00:00',
    loginHistory: [{ timestamp: '2023-10-27 09:00:00', ip: '127.0.0.1', status: 'success' }]
  },
  stats: { loginCount: 1420, actionsPerformed: 54300, uptime: '99.99%', pnlContribution: 170000 }
};

// --- Expanded UI Components ---

const Button = ({ icon: Icon, children, onClick, variant = 'primary', disabled = false, className = '', size = 'md' }: any) => {
  const baseClasses = "flex items-center justify-center space-x-2 rounded-lg text-sm transition duration-200 ease-in-out font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";
  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  let colorClasses = "";

  switch (variant) {
    case 'primary': colorClasses = "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"; break;
    case 'secondary': colorClasses = "bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600 focus:ring-indigo-500 disabled:bg-gray-800 disabled:text-gray-500"; break;
    case 'danger': colorClasses = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400"; break;
    case 'success': colorClasses = "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400"; break;
    case 'ghost': colorClasses = "bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white disabled:text-gray-600 shadow-none"; break;
  }

  return (
    <button className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${colorClasses} ${className}`} onClick={onClick} disabled={disabled}>
      {Icon && <Icon className="w-4 h-4" />}
      {children && <span>{children}</span>}
    </button>
  );
};

const Card = ({ title, subtitle, children, className = '', actions = null, noPadding = false }: any) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-xl border border-gray-700 flex flex-col ${className}`}>
    {(title || actions) && (
      <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/30 rounded-t-xl">
        <div>
          <h3 className="text-lg font-bold text-gray-100">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
    )}
    <div className={`${noPadding ? '' : 'p-6'} flex-grow overflow-auto custom-scrollbar`}>
      {children}
    </div>
  </div>
);

// Use the imported Badge component
const StatusBadge = ({ color, children }: { color: string, children: React.ReactNode }) => {
    let variant: "default" | "secondary" | "destructive" | "outline" | "live" = "default";
    if (color === 'green') variant = "default"; 
    if (color === 'yellow') variant = "secondary";
    if (color === 'gray') variant = "outline";
    
    return <Badge variant={variant}>{children}</Badge>;
};

const ProgressBar = ({ value, max = 100, color = 'indigo', label }: any) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      {label && <span className="text-xs font-medium text-gray-300">{label}</span>}
      <span className="text-xs font-medium text-gray-400">{Math.round((value / max) * 100)}%</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <div className={`bg-gradient-to-r from-${color}-500 to-${color}-400 h-2.5 rounded-full transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

const Input = ({ label, type = 'text', value, onChange, placeholder, name }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
    </div>
);

const Select = ({ label, value, onChange, children, name }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
            {children}
        </select>
    </div>
);

const Tabs = ({ tabs, activeTab, setActiveTab }: { tabs: string[], activeTab: string, setActiveTab: (tab: string) => void }) => (
    <div className="border-b border-gray-700 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
            <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${
                            tab === activeTab
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    </div>
);

// --- Dashboard Widgets & Views ---

const AIStatusMonitor = () => {
  const stats = [
    { label: 'Quantum Core Load', value: 78, color: 'indigo' },
    { label: 'Global Latency', value: 8, max: 50, color: 'green' },
    { label: 'Predictive Accuracy', value: 98.2, color: 'purple' },
    { label: 'Neural Firewall Threat', value: 2, color: 'red' },
  ];

  return (
    <Card title="AI System Status" subtitle="Real-time Quantum Core Monitoring">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <ProgressBar key={idx} label={stat.label} value={stat.value} max={stat.max || 100} color={stat.color} />
        ))}
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Active AI Processes</h4>
        <div className="space-y-2 text-sm font-mono">
          {['Market Sentiment Analysis [PID: 2000]', 'Risk Vector Calculation [PID: 2015]', 'Liquidity Optimization [PID: 2030]', 'User Behavior Modeling [PID: 2045]', 'Regulatory Compliance Scan [PID: 2060]'].map((proc, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-700">
              <span className="flex items-center text-cyan-400"><Cpu className="w-4 h-4 mr-2 text-cyan-500"/>{proc}</span>
              <span className="text-gray-500">OK</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const GlobalMarketPulse = () => {
  const markets = [
    { name: 'S&P 500', price: '4,120.50', change: '+0.45%', sentiment: 'Bullish', volatility: 'Low' },
    { name: 'BTC/USD', price: '64,230.00', change: '+2.10%', sentiment: 'Very Bullish', volatility: 'High' },
    { name: 'EUR/USD', price: '1.0850', change: '-0.12%', sentiment: 'Neutral', volatility: 'Low' },
    { name: 'Gold', price: '1,980.20', change: '+0.80%', sentiment: 'Bullish', volatility: 'Medium' },
    { name: 'Crude Oil', price: '78.40', change: '-1.20%', sentiment: 'Bearish', volatility: 'Medium' },
    { name: '10Y Treasury', price: '4.50%', change: '+0.02%', sentiment: 'Neutral', volatility: 'Low' },
  ];

  return (
    <Card title="Global Market Pulse" subtitle="AI-Driven Sentiment & Pricing" noPadding>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Asset</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">AI Sentiment</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Volatility</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/30 divide-y divide-gray-700">
            {markets.map((m) => (
              <tr key={m.name} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{m.name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-300 font-mono">{m.price}</td>
                <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-bold ${m.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{m.change}</td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <Badge variant={m.sentiment.includes('Bullish') ? 'default' : m.sentiment.includes('Bearish') ? 'destructive' : 'secondary'}>{m.sentiment}</Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <Badge variant={m.volatility === 'High' ? 'destructive' : m.volatility === 'Medium' ? 'secondary' : 'outline'}>{m.volatility}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const NoCodeEditor = ({ algorithm, onUpdateCode }: { algorithm: Algorithm, onUpdateCode: (code: string) => void }) => {
  const [blocks, setBlocks] = useState<string[]>(() => {
    try { return JSON.parse(algorithm.code).nodes || []; } catch { return []; }
  });

  const handleAddBlock = (type: string) => {
    const newBlock = `${type}: ${type === 'AI' ? 'Neural Optimization' : 'New Logic Node'}`;
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    onUpdateCode(JSON.stringify({ nodes: newBlocks }));
  };

  const handleOptimize = () => {
    const optimized = blocks.map(b => b.includes('AI') ? b : `${b} (Optimized)`);
    setBlocks(optimized);
    onUpdateCode(JSON.stringify({ nodes: optimized }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700">
      <div className="p-3 border-b border-gray-700 bg-gray-800/50 rounded-t-lg flex flex-wrap gap-2">
        <Button icon={Database} onClick={() => handleAddBlock('Input')} variant="secondary" size="sm">Input</Button>
        <Button icon={TrendingUp} onClick={() => handleAddBlock('Indicator')} variant="secondary" size="sm">Indicator</Button>
        <Button icon={SlidersHorizontal} onClick={() => handleAddBlock('Logic')} variant="secondary" size="sm">Logic</Button>
        <Button icon={DollarSign} onClick={() => handleAddBlock('Action')} variant="secondary" size="sm">Action</Button>
        <div className="flex-grow"></div>
        <Button icon={Bot} onClick={handleOptimize} variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700">AI Auto-Optimize</Button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-3 custom-scrollbar">
        {blocks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Code className="w-12 h-12 mb-2 opacity-20" />
            <p>Use the toolbar to build your strategy.</p>
          </div>
        )}
        {blocks.map((block, index) => (
          <div key={index} className="group relative bg-gray-800 border border-indigo-900/50 p-4 rounded-lg shadow-sm hover:shadow-indigo-500/20 hover:shadow-lg transition-all flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-full absolute left-0 top-0 bottom-0 rounded-l-lg ${block.startsWith('Input') ? 'bg-blue-500' : block.startsWith('Action') ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
              <span className="font-mono text-sm text-gray-300 ml-2">{block}</span>
            </div>
            <X className="w-4 h-4 text-gray-600 cursor-pointer hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
              const newBlocks = blocks.filter((_, i) => i !== index);
              setBlocks(newBlocks);
              onUpdateCode(JSON.stringify({ nodes: newBlocks }));
            }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const AlgorithmParametersForm = ({ algorithm, onUpdate }: { algorithm: Algorithm, onUpdate: (params: AlgorithmParameter[]) => void }) => {
    const [params, setParams] = useState(algorithm.parameters);

    const handleChange = (index: number, value: any) => {
        const newParams = [...params];
        newParams[index].value = value;
        setParams(newParams);
    };

    const handleSave = () => {
        onUpdate(params);
    };

    return (
        <div className="p-6 space-y-6">
            {params.map((param, index) => (
                <div key={param.name}>
                    <label className="block text-sm font-medium text-gray-300">{param.name}</label>
                    <p className="text-xs text-gray-500 mb-2">{param.description}</p>
                    {param.type === 'number' && (
                        <input
                            type="number"
                            value={param.value}
                            onChange={(e) => handleChange(index, parseFloat(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                        />
                    )}
                    {/* Add other types like boolean, string etc. */}
                </div>
            ))}
            <div className="pt-4 border-t border-gray-700">
                <Button icon={Save} onClick={handleSave} variant="primary">Save Parameters</Button>
            </div>
        </div>
    );
};

const Backtester = ({ algorithm }: { algorithm: Algorithm }) => {
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [isBacktesting, setIsBacktesting] = useState(false);

  const handleRun = useCallback(() => {
    setIsBacktesting(true);
    setTimeout(() => {
      const newResult: BacktestResult = {
        runId: `bt-${Date.now()}`,
        algorithmId: algorithm.id,
        algorithmVersion: algorithm.version,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        initialCapital: 100000,
        finalCapital: 100000 * (1 + (Math.random() * 40 + 10) / 100),
        equityCurve: generateTimeSeries(50, 100000, 0.05),
        metrics: {
          totalReturn: parseFloat((Math.random() * 40 + 10).toFixed(2)),
          sharpeRatio: parseFloat((Math.random() * 2 + 1).toFixed(2)),
          maxDrawdown: parseFloat((-Math.random() * 15).toFixed(2)),
          trades: Math.floor(Math.random() * 500 + 100),
          profitFactor: parseFloat((Math.random() * 1 + 1.2).toFixed(2)),
          expectancy: parseFloat((Math.random() * 0.5).toFixed(2)),
          avgTradeReturn: parseFloat((Math.random() * 0.2).toFixed(2)),
        },
        parametersSnapshot: algorithm.parameters,
        aiAnalysis: "Strategy exhibits strong momentum characteristics but may be overfitted to Q2 volatility. Suggest increasing stop-loss buffer by 0.5% and testing against 2022 data.",
        tradeLog: []
      };
      setResults([newResult, ...results]);
      setIsBacktesting(false);
    }, 1500);
  }, [algorithm, results]);

  const latest = results[0];

  return (
    <Card title="Simulation & Deployment" subtitle="Hyper-Realistic Backtesting Engine">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
             <Button icon={Play} onClick={handleRun} disabled={isBacktesting} variant="primary" className="w-full" size="lg">
               {isBacktesting ? 'Running Simulation...' : 'Run Hyper-Simulation'}
             </Button>
          </div>
        </div>

        {latest && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-indigo-900/50 p-4 rounded-lg border border-indigo-700">
              <h4 className="font-bold text-indigo-300 flex items-center mb-2">
                <Bot className="w-4 h-4 mr-2" /> AI Analysis & Recommendations
              </h4>
              <p className="text-sm text-indigo-200 leading-relaxed">{latest.aiAnalysis}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Return', value: `+${latest.metrics.totalReturn}%`, color: 'text-green-400' },
                { label: 'Sharpe Ratio', value: latest.metrics.sharpeRatio, color: 'text-blue-400' },
                { label: 'Max Drawdown', value: `${latest.metrics.maxDrawdown}%`, color: 'text-red-400' },
                { label: 'Profit Factor', value: latest.metrics.profitFactor, color: 'text-purple-400' },
              ].map(m => (
                <div key={m.label} className="bg-gray-900/50 p-3 rounded border border-gray-700 shadow-sm">
                  <div className="text-xs text-gray-400 uppercase">{m.label}</div>
                  <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                </div>
              ))}
            </div>
            
            <div className="h-32 bg-gray-900/50 rounded border border-gray-700 flex items-end justify-between px-2 pb-2 overflow-hidden">
               {latest.equityCurve.map((pt, i) => (
                 <div key={i} className="w-1 bg-indigo-500 hover:bg-indigo-400 transition-colors" style={{ height: `${(pt.value / 150000) * 100}%` }} title={`Date: ${pt.date}, Val: ${pt.value.toFixed(2)}`}></div>
               ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const AlgoList = ({ algorithms, selectedAlgo, onSelect, onCreate }: any) => (
  <Card title="Strategy Portfolio" subtitle="Managed Algorithms" actions={<Button icon={Plus} onClick={onCreate} variant="secondary" size="sm">New</Button>} className="h-full" noPadding>
    <div className="p-4 border-b border-gray-700">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search strategies..." className="w-full bg-gray-900 border border-gray-600 rounded-md pl-9 pr-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
    </div>
    <div className="space-y-3 p-4 overflow-y-auto custom-scrollbar">
      {(algorithms as Algorithm[]).map((algo: Algorithm) => (
        <div
          key={algo.id}
          onClick={() => onSelect(algo)}
          className={`p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${selectedAlgo?.id === algo.id ? 'bg-indigo-900/50 border-indigo-500 shadow-lg shadow-indigo-900/50' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600'}`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-100">{algo.name}</h4>
            <Badge variant={algo.status === 'live' ? 'live' : algo.status === 'backtesting' ? 'secondary' : 'outline'}>{algo.status.toUpperCase()}</Badge>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>v{algo.version} &bull; {algo.author}</span>
            <span className="flex items-center text-indigo-400 font-semibold"><Bot className="w-3 h-3 mr-1" /> AI Score: {algo.aiScore}</span>
          </div>
          {algo.performanceMetrics && (
            <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-3 gap-2 text-xs">
              <div><span className="text-gray-500 block">Return</span><span className="font-medium text-green-400">+{algo.performanceMetrics.return}%</span></div>
              <div><span className="text-gray-500 block">Sharpe</span><span className="font-medium text-gray-300">{algo.performanceMetrics.sharpe}</span></div>
              <div><span className="text-gray-500 block">Win Rate</span><span className="font-medium text-gray-300">{algo.performanceMetrics.winRate}%</span></div>
            </div>
          )}
        </div>
      ))}
    </div>
  </Card>
);

// --- Navigation & Layout ---

const NAV_ITEMS = [
    { name: 'Executive Dashboard', icon: LayoutDashboard, category: 'Core' },
    { name: 'Algo-Trading Lab', icon: Code, category: 'Core', current: true },
    { name: 'Quantum Weaver AI', icon: BrainCircuit, category: 'Core' },
    { name: 'AI Financial Advisor', icon: Bot, category: 'Core' },
    { name: 'Advanced Charting', icon: BarChart2, category: 'Core' },
    { name: 'Market Scanner', icon: Search, category: 'Core' },
    { name: 'Gemini Thinking Console', icon: Sparkles, category: 'Gemini 2.5' },
    { name: 'Multimodal Input Analysis', icon: Eye, category: 'Gemini 2.5' },
    { name: 'Streaming Response Monitor', icon: Zap, category: 'Gemini 2.5' },
    { name: 'System Instruction Editor', icon: Terminal, category: 'Gemini 2.5' },
    { name: 'Chat History Explorer', icon: MessageSquare, category: 'Gemini 2.5' },
    { name: 'Global Transactions', icon: History, category: 'Treasury' },
    { name: 'Liquidity Transfer', icon: Send, category: 'Treasury' },
    { name: 'Budgetary Control', icon: Target, category: 'Treasury' },
    { name: 'Corporate Treasury', icon: Globe, category: 'Treasury' },
    { name: 'Modern Treasury API', icon: Key, category: 'Treasury' },
    { name: 'Strategic Goals', icon: Trophy, category: 'Strategy' },
    { name: 'Credit Health Monitor', icon: Heart, category: 'Strategy' },
    { name: 'Investment Portfolio', icon: Briefcase, category: 'Strategy' },
    { name: 'Venture Capital', icon: Rocket, category: 'Strategy' },
    { name: 'Private Equity', icon: Briefcase, category: 'Strategy' },
    { name: 'Mutual Fund Screener', icon: Filter, category: 'Strategy' },
    { name: 'ETF Hub', icon: PieChart, category: 'Strategy' },
    { name: 'Robo-Advisor Config', icon: Bot, category: 'Strategy' },
    { name: 'Web3 & Crypto Bridge', icon: Link, category: 'Markets' },
    { name: 'Forex Arbitrage Arena', icon: Scale, category: 'Markets' },
    { name: 'Commodities Exchange', icon: Wheat, category: 'Markets' },
    { name: 'Real Estate Empire', icon: Building, category: 'Markets' },
    { name: 'Art & NFT Vault', icon: Palette, category: 'Markets' },
    { name: 'Derivatives Desk', icon: PieChart, category: 'Markets' },
    { name: 'Options Chain', icon: Link, category: 'Markets' },
    { name: 'Futures Contracts', icon: FileText, category: 'Markets' },
    { name: 'Bond Analytics', icon: Scale, category: 'Markets' },
    { name: 'Dark Pool Routing', icon: Network, category: 'Markets' },
    { name: 'Exotic Derivatives', icon: Sparkles, category: 'Markets' },
    { name: 'Carbon Credit Trading', icon: Wheat, category: 'Markets' },
    { name: 'Tax Optimization AI', icon: Receipt, category: 'Finance' },
    { name: 'Legacy Planning', icon: BookOpen, category: 'Finance' },
    { name: 'Wealth Management', icon: Crown, category: 'Finance' },
    { name: 'Billing & Invoicing', icon: CreditCard, category: 'Finance' },
    { name: 'Expense Management', icon: Receipt, category: 'Finance' },
    { name: 'Capital Call Management', icon: Phone, category: 'Finance' },
    { name: 'Card Issuance (Marqeta)', icon: CreditCard, category: 'Integrations' },
    { name: 'Data Aggregation (Plaid)', icon: Link, category: 'Integrations' },
    { name: 'Payment Rails (Stripe)', icon: Zap, category: 'Integrations' },
    { name: 'Open Banking API', icon: Link, category: 'Integrations' },
    { name: 'Identity (SSO)', icon: Lock, category: 'Platform' },
    { name: 'Agent Marketplace', icon: Users, category: 'Platform' },
    { name: 'Ad Studio AI', icon: Megaphone, category: 'Platform' },
    { name: 'Card Customization', icon: CreditCard, category: 'Platform' },
    { name: 'DAO Governance', icon: Handshake, category: 'Platform' },
    { name: 'API Key Management', icon: Key, category: 'Platform' },
    { name: 'Webhook Subscriptions', icon: Send, category: 'Platform' },
    { name: 'System Status', icon: Activity, category: 'System' },
    { name: 'Security Center', icon: Shield, category: 'System' },
    { name: 'System Manifesto', icon: Eye, category: 'System' },
    { name: 'Audit Logs', icon: History, category: 'System' },
    { name: 'Disaster Recovery', icon: Server, category: 'System' },
    { name: 'Concierge', icon: Phone, category: 'Support' },
    { name: 'Philanthropy', icon: Heart, category: 'Support' },
    { name: 'Personalization', icon: Sparkles, category: 'Support' },
    { name: 'Knowledge Base', icon: BookOpen, category: 'Support' },
    { name: 'Live Chat Support', icon: MessageSquare, category: 'Support' },
    { name: 'Feature Requests', icon: Megaphone, category: 'Support' },
    { name: 'Risk Dashboard', icon: Shield, category: 'Risk Management' },
    { name: 'VaR Simulation', icon: BarChart2, category: 'Risk Management' },
    { name: 'Stress Testing', icon: Activity, category: 'Risk Management' },
    { name: 'Counterparty Risk', icon: Users, category: 'Risk Management' },
    { name: 'Credit Default Swaps', icon: FileText, category: 'Risk Management' },
    { name: 'Liquidity Risk', icon: LifeBuoy, category: 'Risk Management' },
    { name: 'Operational Risk', icon: SlidersHorizontal, category: 'Risk Management' },
    { name: 'Geopolitical Risk Map', icon: Globe, category: 'Risk Management' },
    { name: 'Model Risk Governance', icon: BrainCircuit, category: 'Risk Management' },
    { name: 'Compliance Hub', icon: CheckSquare, category: 'Compliance' },
    { name: 'Regulatory Reporting', icon: FileText, category: 'Compliance' },
    { name: 'Audit Trail', icon: History, category: 'Compliance' },
    { name: 'AML Monitoring', icon: Eye, category: 'Compliance' },
    { name: 'Trade Surveillance', icon: Search, category: 'Compliance' },
    { name: 'Policy Management', icon: BookOpen, category: 'Compliance' },
    { name: 'SEC Rule 15c3-5', icon: CheckSquare, category: 'Compliance' },
    { name: 'MiFID II Reporting', icon: FileText, category: 'Compliance' },
    { name: 'Data Lake Explorer', icon: Database, category: 'Data Science' },
    { name: 'Jupyter Notebooks', icon: BookOpen, category: 'Data Science' },
    { name: 'Model Training', icon: Cpu, category: 'Data Science' },
    { name: 'Feature Store', icon: HardDrive, category: 'Data Science' },
    { name: 'Data Visualization Lab', icon: BarChart2, category: 'Data Science' },
    { name: 'ETL Pipelines', icon: Repeat, category: 'Data Science' },
    { name: 'Alternative Data Hub', icon: HardDrive, category: 'Data Science' },
    { name: 'Cloud Infrastructure', icon: Cloud, category: 'Infrastructure' },
    { name: 'Network Topology', icon: Network, category: 'Infrastructure' },
    { name: 'Server Fleet Management', icon: Server, category: 'Infrastructure' },
    { name: 'CI/CD Pipelines', icon: GitBranch, category: 'Infrastructure' },
    { name: 'Terminal Access', icon: Terminal, category: 'Infrastructure' },
    { name: 'Quantum Fabric Status', icon: Atom, category: 'Infrastructure' },
    { name: 'Kubernetes Cluster', icon: Cloud, category: 'Infrastructure' },
    { name: 'Quarterly Reports', icon: PieChart, category: 'Reporting' },
    { name: 'Performance Attribution', icon: Trophy, category: 'Reporting' },
    { name: 'Client Statements', icon: Receipt, category: 'Reporting' },
    { name: 'P&L Analytics', icon: TrendingUp, category: 'Reporting' },
    { name: 'AUM Tracker', icon: DollarSign, category: 'Reporting' },
    { name: 'Investor Relations Portal', icon: Users, category: 'Client Relations' },
    { name: 'CRM Integration', icon: Handshake, category: 'Client Relations' },
    { name: 'Support Tickets', icon: LifeBuoy, category: 'Client Relations' },
    { name: 'Onboarding Wizard', icon: User, category: 'Client Relations' },
    { name: 'Global News Feed', icon: Globe, category: 'Market Intel' },
    { name: 'SEC Filings', icon: FileText, category: 'Market Intel' },
    { name: 'Social Media Sentiment', icon: Megaphone, category: 'Market Intel' },
    { name: 'Economic Calendar', icon: Calendar, category: 'Market Intel' },
    { name: 'Insider Trading Monitor', icon: Eye, category: 'Market Intel' },
    { name: 'Back Office Operations', icon: Briefcase, category: 'Operations' },
    { name: 'Settlements & Clearing', icon: CheckSquare, category: 'Operations' },
    { name: 'Corporate Actions', icon: Megaphone, 'category': 'Operations' },
    { name: 'Reconciliation Engine', icon: Repeat, category: 'Operations' },
    { name: 'Multi-Factor Auth', icon: Lock, category: 'Security' },
    { name: 'Intrusion Detection', icon: Shield, category: 'Security' },
    { name: 'Penetration Testing', icon: Target, category: 'Security' },
    { name: 'Bug Bounty Program', icon: Trophy, category: 'Security' },
];

const AppSidebar = ({ onNavigate, activeView }: any) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const groupedNavItems = useMemo(() => NAV_ITEMS.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, typeof NAV_ITEMS>), []);

    return (
        <div className={`h-full bg-gray-900 text-white flex flex-col transition-all duration-300 shadow-2xl z-20 ${isCollapsed ? 'w-20' : 'w-72'}`}>
            <div className="p-5 flex items-center justify-between border-b border-gray-800 bg-gray-900 h-16">
                {!isCollapsed && (
                  <div>
                    <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tighter">QUANTUM OS</h1>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase">High Frequency Trading</p>
                  </div>
                )}
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors" onClick={() => onNavigate("Profile")}>
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-gray-700">TR</div>
                    {!isCollapsed && (
                      <div className="overflow-hidden"><p className="text-sm font-bold text-gray-200 truncate">Trader</p><p className="text-xs text-green-400 flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span> Online</p></div>
                    )}
                </div>
            </div>

            <nav className="flex-grow overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {Object.entries(groupedNavItems).map(([category, items]: [string, typeof NAV_ITEMS]) => (
                    <div key={category}>
                        {!isCollapsed && <h3 className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{category}</h3>}
                        {items.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.name === activeView;
                            return (
                                <a key={item.name} href="#" onClick={(e) => { e.preventDefault(); onNavigate(item.name); }}
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                >
                                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                                    <span className={`ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{item.name}</span>
                                </a>
                            );
                        })}
                    </div>
                ))}
            </nav>
            
            <div className="p-4 border-t border-gray-800 bg-gray-900 text-xs text-gray-600 text-center">
              {!isCollapsed && "v12.8.1-Quantum | Secure Connection"}
            </div>
        </div>
    );
}

// --- Placeholder & Special Views ---

const AlgoTradingLab: React.FC = () => {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>(initialAlgorithms);
  const [selectedAlgo, setSelectedAlgo] = useState<Algorithm | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'editor' | 'backtest' | 'params'>('list');

  const handleSelectAlgo = (algo: Algorithm) => {
    setSelectedAlgo(algo);
    setViewMode('editor');
  };

  const handleCreateAlgo = () => {
    const newAlgo: Algorithm = {
      id: `algo-${Date.now()}`,
      name: 'New Strategy',
      description: 'Draft strategy',
      tags: ['Draft'],
      code: '{"nodes":[]}',
      language: 'nocode',
      status: 'draft',
      version: 1,
      lastModified: new Date().toISOString().split('T')[0],
      author: 'User',
      riskLevel: 'low',
      aiScore: 50,
      parameters: [],
      deploymentTarget: 'cloud-cluster-a',
      geinFactor: 0.5,
      interactionMatrix: [],
      dataPointSensitivity: {},
      layerMetrics: {},
      executionPriority: 'normal',
      computeProfile: 'cpu-bound',
      dataSources: [],
      dependencies: [],
      permissions: [],
      ownerTeam: 'User',
      isAudited: false,
      auditHistory: []
    };
    setAlgorithms([...algorithms, newAlgo]);
    setSelectedAlgo(newAlgo);
    setViewMode('editor');
  };

  const updateAlgoCode = (code: string) => {
    if (selectedAlgo) {
      const updated = { ...selectedAlgo, code, lastModified: new Date().toISOString().split('T')[0] };
      setAlgorithms(algorithms.map(a => a.id === selectedAlgo.id ? updated : a));
      setSelectedAlgo(updated);
    }
  };

  const updateAlgoParams = (params: AlgorithmParameter[]) => {
    if (selectedAlgo) {
      const updated = { ...selectedAlgo, parameters: params, lastModified: new Date().toISOString().split('T')[0] };
      setAlgorithms(algorithms.map(a => a.id === selectedAlgo.id ? updated : a));
      setSelectedAlgo(updated);
    }
  };

  return (
    <div className="flex h-full space-x-6 p-6 bg-gray-900 min-h-screen text-white">
      <div className="w-1/4 min-w-[300px]">
        <AlgoList 
            algorithms={algorithms} 
            selectedAlgo={selectedAlgo} 
            onSelect={handleSelectAlgo} 
            onCreate={handleCreateAlgo}
        />
      </div>
      <div className="flex-grow flex flex-col space-y-6">
        {selectedAlgo ? (
          <Card title={selectedAlgo.name} subtitle={`${selectedAlgo.language.toUpperCase()} | v${selectedAlgo.version}`} 
            actions={
              <>
                <Button variant={viewMode === 'editor' ? 'primary' : 'ghost'} onClick={() => setViewMode('editor')} size="sm">Editor</Button>
                <Button variant={viewMode === 'params' ? 'primary' : 'ghost'} onClick={() => setViewMode('params')} size="sm">Params</Button>
                <Button variant={viewMode === 'backtest' ? 'primary' : 'ghost'} onClick={() => setViewMode('backtest')} size="sm">Simulate</Button>
              </>
            }
          >
            <div className="h-[600px]">
              {viewMode === 'editor' && <NoCodeEditor algorithm={selectedAlgo} onUpdateCode={updateAlgoCode} />}
              {viewMode === 'params' && <AlgorithmParametersForm algorithm={selectedAlgo} onUpdate={updateAlgoParams} />}
              {viewMode === 'backtest' && <Backtester algorithm={selectedAlgo} />}
            </div>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Code className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h2 className="text-2xl font-bold mb-2">Select a Strategy</h2>
              <p>Choose an algorithm from the list or create a new one to begin.</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-6">
             <AIStatusMonitor />
             <div className="col-span-2">
                <GlobalMarketPulse />
             </div>
        </div>
      </div>
    </div>
  );
};

export default AlgoTradingLab;


// --- CONSOLIDATED FROM: AlgoTradingLab (4).tsx ---

import React, { useState, useCallback, useMemo } from 'react';
import { 
  RefreshCw, Play, Save, History, Code, Settings, TrendingUp, DollarSign, X, User, LogOut,
  Plus, Search, Filter, ChevronDown, ChevronUp, BrainCircuit, Bot, SlidersHorizontal,
  LayoutDashboard, Repeat, Send, Target, Trophy, Heart, Briefcase, Link, Zap, Lock,
  Atom, Users, Megaphone, CreditCard, Handshake, Activity, Phone, Shield, Sparkles, Eye,
  Globe, Key, Receipt, Rocket, PieChart, Palette, Building, Wheat, Scale, Crown, FileText,
  Server, Network, GitBranch, HardDrive, Cpu, Database, Cloud, Terminal, BookOpen,
  BarChart2, CheckSquare, Calendar, MessageSquare, LifeBuoy
} from 'lucide-react';

// --- Expanded Data Models ---

interface SystemMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  aiPrediction: number;
  subMetrics?: { label: string; value: string }[];
}

interface AIInsight {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'market' | 'system' | 'security' | 'optimization' | 'regulatory';
  message: string;
  confidence: number;
  actionable: boolean;
  relatedEntityId?: string;
}

interface AlgorithmParameter {
  name: string;
  type: 'number' | 'string' | 'boolean';
  value: any;
  range?: [number, number];
  description: string;
}

interface Algorithm {
  id: string;
  name: string;
  description: string;
  tags: string[];
  code: string; // Can be JSON for No-Code or raw script
  language: 'nocode' | 'python' | 'rust';
  status: 'draft' | 'backtesting' | 'live' | 'error' | 'optimizing' | 'archived';
  version: number;
  lastModified: string;
  author: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  aiScore: number; // 0-100, AI's confidence in the algo's viability
  parameters: AlgorithmParameter[];
  deploymentTarget: 'cloud-cluster-a' | 'edge-node-tokyo' | 'quantum-fabric-1';
  performanceMetrics?: {
    pnl: number;
    return: number;
    sharpe: number;
    sortino: number;
    alpha: number;
    beta: number;
    volatility: number;
    winRate: number;
    maxDrawdown: number;
  };
  // "GEIN" implementation
  geinFactor: number;
  interactionMatrix: number[][];
  dataPointSensitivity: Record<string, number>;
  layerMetrics: Record<string, { gein: number; activation: number }>;
  executionPriority: 'low' | 'normal' | 'high' | 'critical' | 'quantum';
  computeProfile: 'cpu-bound' | 'memory-bound' | 'io-bound' | 'gpu-accelerated';
  dataSources: string[];
  dependencies: { name: string; version: string }[];
  permissions: string[];
  ownerTeam: string;
  isAudited: boolean;
  auditHistory: { date: string; auditor: string; result: 'pass' | 'fail' }[];
}

interface BacktestResult {
  runId: string;
  algorithmId: string;
  algorithmVersion: number;
  startDate: string;
  endDate:string;
  initialCapital: number;
  finalCapital: number;
  equityCurve: { date: string; value: number; aiForecast: number }[];
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    trades: number;
    profitFactor: number;
    expectancy: number;
    avgTradeReturn: number;
  };
  parametersSnapshot: AlgorithmParameter[];
  aiAnalysis: string;
  tradeLog: { timestamp: string; type: 'buy' | 'sell'; asset: string; quantity: number; price: number; pnl: number }[];
}

interface UserProfile {
  id: string;
  name: string;
  role: 'Administrator' | 'Trader' | 'Quant' | 'Observer';
  clearanceLevel: number;
  email: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto' | 'matrix';
    notifications: 'all' | 'critical' | 'none';
    aiAssistanceLevel: 'minimal' | 'standard' | 'proactive';
    defaultView: string;
  };
  apiKeys: { service: string; key: string; lastUsed: string }[];
  security: {
    twoFactorEnabled: boolean;
    lastLogin: string;
    loginHistory: { timestamp: string; ip: string; status: 'success' | 'failed' }[];
  };
  stats: {
    loginCount: number;
    actionsPerformed: number;
    uptime: string;
    pnlContribution: number;
  };
}

// --- Data Utilities & Mocks ---

const generateTimeSeries = (points: number, startValue: number, volatility: number) => {
  const data = [];
  let currentValue = startValue;
  const now = new Date();
  for (let i = 0; i < points; i++) {
    const date = new Date(now.getTime() - (points - i) * 86400000).toISOString().split('T')[0];
    const change = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + change);
    data.push({
      date,
      value: currentValue,
      aiForecast: currentValue * (1 + (Math.random() - 0.5) * 0.02)
    });
  }
  return data;
};

const mockInsights: AIInsight[] = [
  { id: 'ins-1', timestamp: '2023-10-27 09:15:00', severity: 'high', category: 'market', message: 'Detected arbitrage opportunity in FOREX/CRYPTO bridge.', confidence: 0.98, actionable: true, relatedEntityId: 'algo-3' },
  { id: 'ins-2', timestamp: '2023-10-27 09:30:00', severity: 'medium', category: 'optimization', message: 'Algorithm "Alpha-1" logic can be compressed by 15%. Suggest refactor.', confidence: 0.85, actionable: true, relatedEntityId: 'algo-1' },
  { id: 'ins-3', timestamp: '2023-10-27 10:00:00', severity: 'low', category: 'system', message: 'Global latency reduced by 4ms via AI routing.', confidence: 0.99, actionable: false },
  { id: 'ins-4', timestamp: '2023-10-27 10:45:00', severity: 'critical', category: 'security', message: 'Anomalous login attempt blocked by Neural Firewall.', confidence: 0.99, actionable: false },
  { id: 'ins-5', timestamp: '2023-10-27 11:00:00', severity: 'medium', category: 'regulatory', message: 'New SEC filing detected for AAPL. Potential volatility increase.', confidence: 0.92, actionable: true },
];

const initialAlgorithms: Algorithm[] = [
  { 
    id: 'algo-1', 
    name: 'Quantum Momentum Scalper v4', 
    description: 'High-frequency scalping strategy utilizing quantum-inspired principles for momentum prediction.',
    tags: ['HFT', 'Scalping', 'Momentum', 'Quantum'],
    code: '{"nodes":["Input: L2 Market Data Stream", "Filter: Volatility > 1.5", "AI Model: Quantum Trend Predictor", "Logic: If confidence > 0.95", "Action: Buy/Sell 100 units"]}', 
    language: 'nocode',
    status: 'live', 
    version: 4,
    lastModified: '2023-10-26',
    author: 'System Admin',
    riskLevel: 'high',
    aiScore: 94,
    parameters: [
      { name: 'Volatility Threshold', type: 'number', value: 1.5, range: [0.5, 5], description: 'Minimum volatility to activate trading.' },
      { name: 'Trade Size', type: 'number', value: 100, range: [10, 1000], description: 'Number of units per trade.' }
    ],
    deploymentTarget: 'cloud-cluster-a',
    performanceMetrics: { pnl: 125000, return: 45.2, sharpe: 2.1, sortino: 2.8, alpha: 0.15, beta: 0.8, volatility: 12.5, winRate: 68, maxDrawdown: -8.2 },
    geinFactor: 0.98,
    interactionMatrix: [[1, 0.2, -0.1], [0.2, 1, 0.5], [-0.1, 0.5, 1]],
    dataPointSensitivity: { 'L2.bid_price': 0.8, 'L2.ask_price': 0.8, 'volatility': 0.9 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.95 }, 'quantum_core': { gein: 0.99, activation: 0.98 }, 'output': { gein: 1.0, activation: 0.96 } },
    executionPriority: 'quantum',
    computeProfile: 'gpu-accelerated',
    dataSources: ['L2 Market Data Stream', 'Global News Feed API'],
    dependencies: [{ name: 'quantum-tensor-lib', version: '2.5.1' }],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'Quantum Core Team',
    isAudited: true,
    auditHistory: [{ date: '2023-09-15', auditor: 'Internal Security', result: 'pass' }]
  },
  { 
    id: 'algo-2', 
    name: 'Mean Reversion HFT (Neural)', 
    description: 'Neural network-based strategy that capitalizes on short-term mean reversion in liquid assets.',
    tags: ['HFT', 'Mean Reversion', 'AI', 'Market Making'],
    code: '{"nodes":["Input: Order Book Depth", "AI: Sentiment Analysis (News Feeds)", "Logic: Spread > 0.02% AND Reversion Signal", "Action: Market Make (Bid/Ask)"]}', 
    language: 'nocode',
    status: 'backtesting', 
    version: 12,
    lastModified: '2023-10-27',
    author: 'AI Architect',
    riskLevel: 'medium',
    aiScore: 88,
    parameters: [
      { name: 'Spread Threshold', type: 'number', value: 0.02, range: [0.01, 0.1], description: 'Minimum bid-ask spread to engage.' },
      { name: 'Sentiment Weight', type: 'number', value: 0.3, range: [0, 1], description: 'Influence of news sentiment on trade logic.' }
    ],
    deploymentTarget: 'edge-node-tokyo',
    performanceMetrics: { pnl: 45000, return: 12.5, sharpe: 1.8, sortino: 1.9, alpha: 0.05, beta: 0.2, volatility: 4.2, winRate: 55, maxDrawdown: -4.1 },
    geinFactor: 0.85,
    interactionMatrix: [[1, 0.7], [0.7, 1]],
    dataPointSensitivity: { 'spread': 0.9, 'sentiment': 0.6 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.9 }, 'neural_net': { gein: 0.8, activation: 0.92 }, 'output': { gein: 1.0, activation: 0.88 } },
    executionPriority: 'high',
    computeProfile: 'cpu-bound',
    dataSources: ['Order Book Depth', 'News Feeds'],
    dependencies: [{ name: 'sentiment-analyzer', version: '4.2.0' }],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'AI Research',
    isAudited: true,
    auditHistory: [{ date: '2023-08-20', auditor: 'External Audit Co.', result: 'pass' }]
  },
  { 
    id: 'algo-3', 
    name: 'Global Macro Arbitrage', 
    description: 'Long-term strategy identifying and exploiting price discrepancies between correlated global assets.',
    tags: ['Macro', 'Arbitrage', 'Global', 'Low-Risk'],
    code: '{"nodes":["Input: Global Indices (S&P, FTSE, NIKKEI)", "Input: Forex Rates (USD, EUR, JPY)", "Logic: Correlation Divergence > 2-sigma", "Action: Hedge Pair Trade"]}', 
    language: 'nocode',
    status: 'draft', 
    version: 1,
    lastModified: '2023-10-27',
    author: 'User',
    riskLevel: 'low',
    aiScore: 72,
    parameters: [
      { name: 'Correlation Window', type: 'number', value: 90, range: [30, 365], description: 'Lookback period for correlation calculation (days).' },
      { name: 'Sigma Threshold', type: 'number', value: 2, range: [1, 3], description: 'Standard deviation for divergence signal.' }
    ],
    deploymentTarget: 'quantum-fabric-1',
    geinFactor: 0.7,
    interactionMatrix: [[1, 0.85, 0.7], [0.85, 1, 0.75], [0.7, 0.75, 1]],
    dataPointSensitivity: { 'correlation_divergence': 0.95 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.99 }, 'logic': { gein: 0.9, activation: 0.9 }, 'output': { gein: 1.0, activation: 0.92 } },
    executionPriority: 'normal',
    computeProfile: 'memory-bound',
    dataSources: ['Global Indices API', 'Forex Rates API'],
    dependencies: [],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'Macro Analysis Desk',
    isAudited: false,
    auditHistory: []
  },
];

const mockUserProfile: UserProfile = {
  id: 'u-001',
  name: 'Trader',
  role: 'Administrator',
  clearanceLevel: 5,
  email: 'admin@local',
  preferences: { theme: 'dark', notifications: 'all', aiAssistanceLevel: 'proactive', defaultView: 'Executive Dashboard' },
  apiKeys: [{ service: 'Binance', key: 'bin_..._xyz', lastUsed: '2023-10-27 10:30:00' }],
  security: {
    twoFactorEnabled: true,
    lastLogin: '2023-10-27 09:00:00',
    loginHistory: [{ timestamp: '2023-10-27 09:00:00', ip: '127.0.0.1', status: 'success' }]
  },
  stats: { loginCount: 1420, actionsPerformed: 54300, uptime: '99.99%', pnlContribution: 170000 }
};

// --- Expanded UI Components ---

const Button = ({ icon: Icon, children, onClick, variant = 'primary', disabled = false, className = '', size = 'md' }: any) => {
  const baseClasses = "flex items-center justify-center space-x-2 rounded-lg text-sm transition duration-200 ease-in-out font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }[size];
  let colorClasses = "";

  switch (variant) {
    case 'primary': colorClasses = "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"; break;
    case 'secondary': colorClasses = "bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600 focus:ring-indigo-500 disabled:bg-gray-800 disabled:text-gray-500"; break;
    case 'danger': colorClasses = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400"; break;
    case 'success': colorClasses = "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400"; break;
    case 'ghost': colorClasses = "bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white disabled:text-gray-600 shadow-none"; break;
  }

  return (
    <button className={`${baseClasses} ${sizeClasses} ${colorClasses} ${className}`} onClick={onClick} disabled={disabled}>
      {Icon && <Icon className="w-4 h-4" />}
      {children && <span>{children}</span>}
    </button>
  );
};

const Card = ({ title, subtitle, children, className = '', actions = null, noPadding = false }: any) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-xl border border-gray-700 flex flex-col ${className}`}>
    {(title || actions) && (
      <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/30 rounded-t-xl">
        <div>
          <h3 className="text-lg font-bold text-gray-100">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
    )}
    <div className={`${noPadding ? '' : 'p-6'} flex-grow overflow-auto custom-scrollbar`}>
      {children}
    </div>
  </div>
);

const Badge = ({ children, color = 'gray', icon: Icon }: { children: React.ReactNode, color?: string, icon?: React.ElementType }) => {
  const colors: any = {
    gray: 'bg-gray-700 text-gray-200', green: 'bg-green-800/50 text-green-300', red: 'bg-red-800/50 text-red-300',
    blue: 'bg-blue-800/50 text-blue-300', yellow: 'bg-yellow-800/50 text-yellow-300', indigo: 'bg-indigo-800/50 text-indigo-300',
    purple: 'bg-purple-800/50 text-purple-300', pink: 'bg-pink-800/50 text-pink-300',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </span>
  );
};

const ProgressBar = ({ value, max = 100, color = 'indigo', label }: any) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      {label && <span className="text-xs font-medium text-gray-300">{label}</span>}
      <span className="text-xs font-medium text-gray-400">{Math.round((value / max) * 100)}%</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <div className={`bg-gradient-to-r from-${color}-500 to-${color}-400 h-2.5 rounded-full transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

const Input = ({ label, type = 'text', value, onChange, placeholder, name }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
    </div>
);

const Select = ({ label, value, onChange, children, name }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
            {children}
        </select>
    </div>
);

const Tabs = ({ tabs, activeTab, setActiveTab }: { tabs: string[], activeTab: string, setActiveTab: (tab: string) => void }) => (
    <div className="border-b border-gray-700 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
            <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${
                            tab === activeTab
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    </div>
);

// --- Dashboard Widgets & Views ---

const AIStatusMonitor = () => {
  const stats = [
    { label: 'Quantum Core Load', value: 78, color: 'indigo' },
    { label: 'Global Latency', value: 8, max: 50, color: 'green' },
    { label: 'Predictive Accuracy', value: 98.2, color: 'purple' },
    { label: 'Neural Firewall Threat', value: 2, color: 'red' },
  ];

  return (
    <Card title="AI System Status" subtitle="Real-time Quantum Core Monitoring">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <ProgressBar key={idx} label={stat.label} value={stat.value} max={stat.max || 100} color={stat.color} />
        ))}
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Active AI Processes</h4>
        <div className="space-y-2 text-sm font-mono">
          {['Market Sentiment Analysis [PID: 2000]', 'Risk Vector Calculation [PID: 2015]', 'Liquidity Optimization [PID: 2030]', 'User Behavior Modeling [PID: 2045]', 'Regulatory Compliance Scan [PID: 2060]'].map((proc, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-700">
              <span className="flex items-center text-cyan-400"><Cpu className="w-4 h-4 mr-2 text-cyan-500"/>{proc}</span>
              <span className="text-gray-500">OK</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const GlobalMarketPulse = () => {
  const markets = [
    { name: 'S&P 500', price: '4,120.50', change: '+0.45%', sentiment: 'Bullish', volatility: 'Low' },
    { name: 'BTC/USD', price: '64,230.00', change: '+2.10%', sentiment: 'Very Bullish', volatility: 'High' },
    { name: 'EUR/USD', price: '1.0850', change: '-0.12%', sentiment: 'Neutral', volatility: 'Low' },
    { name: 'Gold', price: '1,980.20', change: '+0.80%', sentiment: 'Bullish', volatility: 'Medium' },
    { name: 'Crude Oil', price: '78.40', change: '-1.20%', sentiment: 'Bearish', volatility: 'Medium' },
    { name: '10Y Treasury', price: '4.50%', change: '+0.02%', sentiment: 'Neutral', volatility: 'Low' },
  ];

  return (
    <Card title="Global Market Pulse" subtitle="AI-Driven Sentiment & Pricing" noPadding>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Asset</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">AI Sentiment</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Volatility</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/30 divide-y divide-gray-700">
            {markets.map((m) => (
              <tr key={m.name} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{m.name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-300 font-mono">{m.price}</td>
                <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-bold ${m.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{m.change}</td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <Badge color={m.sentiment.includes('Bullish') ? 'green' : m.sentiment.includes('Bearish') ? 'red' : 'gray'}>{m.sentiment}</Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <Badge color={m.volatility === 'High' ? 'red' : m.volatility === 'Medium' ? 'yellow' : 'blue'}>{m.volatility}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const NoCodeEditor = ({ algorithm, onUpdateCode }: { algorithm: Algorithm, onUpdateCode: (code: string) => void }) => {
  const [blocks, setBlocks] = useState<string[]>(() => {
    try { return JSON.parse(algorithm.code).nodes || []; } catch { return []; }
  });

  const handleAddBlock = (type: string) => {
    const newBlock = `${type}: ${type === 'AI' ? 'Neural Optimization' : 'New Logic Node'}`;
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    onUpdateCode(JSON.stringify({ nodes: newBlocks }));
  };

  const handleOptimize = () => {
    const optimized = blocks.map(b => b.includes('AI') ? b : `${b} (Optimized)`);
    setBlocks(optimized);
    onUpdateCode(JSON.stringify({ nodes: optimized }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700">
      <div className="p-3 border-b border-gray-700 bg-gray-800/50 rounded-t-lg flex flex-wrap gap-2">
        <Button icon={Database} onClick={() => handleAddBlock('Input')} variant="secondary" size="sm">Input</Button>
        <Button icon={TrendingUp} onClick={() => handleAddBlock('Indicator')} variant="secondary" size="sm">Indicator</Button>
        <Button icon={SlidersHorizontal} onClick={() => handleAddBlock('Logic')} variant="secondary" size="sm">Logic</Button>
        <Button icon={DollarSign} onClick={() => handleAddBlock('Action')} variant="secondary" size="sm">Action</Button>
        <div className="flex-grow"></div>
        <Button icon={Bot} onClick={handleOptimize} variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700">AI Auto-Optimize</Button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-3 custom-scrollbar">
        {blocks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Code className="w-12 h-12 mb-2 opacity-20" />
            <p>Use the toolbar to build your strategy.</p>
          </div>
        )}
        {blocks.map((block, index) => (
          <div key={index} className="group relative bg-gray-800 border border-indigo-900/50 p-4 rounded-lg shadow-sm hover:shadow-indigo-500/20 hover:shadow-lg transition-all flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-full absolute left-0 top-0 bottom-0 rounded-l-lg ${block.startsWith('Input') ? 'bg-blue-500' : block.startsWith('Action') ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
              <span className="font-mono text-sm text-gray-300 ml-2">{block}</span>
            </div>
            <X className="w-4 h-4 text-gray-600 cursor-pointer hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
              const newBlocks = blocks.filter((_, i) => i !== index);
              setBlocks(newBlocks);
              onUpdateCode(JSON.stringify({ nodes: newBlocks }));
            }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const AlgorithmParametersForm = ({ algorithm, onUpdate }: { algorithm: Algorithm, onUpdate: (params: AlgorithmParameter[]) => void }) => {
    const [params, setParams] = useState(algorithm.parameters);

    const handleChange = (index: number, value: any) => {
        const newParams = [...params];
        newParams[index].value = value;
        setParams(newParams);
    };

    const handleSave = () => {
        onUpdate(params);
    };

    return (
        <div className="p-6 space-y-6">
            {params.map((param, index) => (
                <div key={param.name}>
                    <label className="block text-sm font-medium text-gray-300">{param.name}</label>
                    <p className="text-xs text-gray-500 mb-2">{param.description}</p>
                    {param.type === 'number' && (
                        <input
                            type="number"
                            value={param.value}
                            onChange={(e) => handleChange(index, parseFloat(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                        />
                    )}
                    {/* Add other types like boolean, string etc. */}
                </div>
            ))}
            <div className="pt-4 border-t border-gray-700">
                <Button icon={Save} onClick={handleSave} variant="primary">Save Parameters</Button>
            </div>
        </div>
    );
};

const Backtester = ({ algorithm }: { algorithm: Algorithm }) => {
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [isBacktesting, setIsBacktesting] = useState(false);

  const handleRun = useCallback(() => {
    setIsBacktesting(true);
    setTimeout(() => {
      const newResult: BacktestResult = {
        runId: `bt-${Date.now()}`,
        algorithmId: algorithm.id,
        algorithmVersion: algorithm.version,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        initialCapital: 100000,
        finalCapital: 100000 * (1 + (Math.random() * 40 + 10) / 100),
        equityCurve: generateTimeSeries(50, 100000, 0.05),
        metrics: {
          totalReturn: parseFloat((Math.random() * 40 + 10).toFixed(2)),
          sharpeRatio: parseFloat((Math.random() * 2 + 1).toFixed(2)),
          maxDrawdown: parseFloat((-Math.random() * 15).toFixed(2)),
          trades: Math.floor(Math.random() * 500 + 100),
          profitFactor: parseFloat((Math.random() * 1 + 1.2).toFixed(2)),
          expectancy: parseFloat((Math.random() * 0.5).toFixed(2)),
          avgTradeReturn: parseFloat((Math.random() * 0.2).toFixed(2)),
        },
        parametersSnapshot: algorithm.parameters,
        aiAnalysis: "Strategy exhibits strong momentum characteristics but may be overfitted to Q2 volatility. Suggest increasing stop-loss buffer by 0.5% and testing against 2022 data.",
        tradeLog: []
      };
      setResults([newResult, ...results]);
      setIsBacktesting(false);
    }, 1500);
  }, [algorithm, results]);

  const latest = results[0];

  return (
    <Card title="Simulation & Deployment" subtitle="Hyper-Realistic Backtesting Engine">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
             <Button icon={Play} onClick={handleRun} disabled={isBacktesting} variant="primary" className="w-full" size="lg">
               {isBacktesting ? 'Running Simulation...' : 'Run Hyper-Simulation'}
             </Button>
          </div>
        </div>

        {latest && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-indigo-900/50 p-4 rounded-lg border border-indigo-700">
              <h4 className="font-bold text-indigo-300 flex items-center mb-2">
                <Bot className="w-4 h-4 mr-2" /> AI Analysis & Recommendations
              </h4>
              <p className="text-sm text-indigo-200 leading-relaxed">{latest.aiAnalysis}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Return', value: `+${latest.metrics.totalReturn}%`, color: 'text-green-400' },
                { label: 'Sharpe Ratio', value: latest.metrics.sharpeRatio, color: 'text-blue-400' },
                { label: 'Max Drawdown', value: `${latest.metrics.maxDrawdown}%`, color: 'text-red-400' },
                { label: 'Profit Factor', value: latest.metrics.profitFactor, color: 'text-purple-400' },
              ].map(m => (
                <div key={m.label} className="bg-gray-900/50 p-3 rounded border border-gray-700 shadow-sm">
                  <div className="text-xs text-gray-400 uppercase">{m.label}</div>
                  <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                </div>
              ))}
            </div>
            
            <div className="h-32 bg-gray-900/50 rounded border border-gray-700 flex items-end justify-between px-2 pb-2 overflow-hidden">
               {latest.equityCurve.map((pt, i) => (
                 <div key={i} className="w-1 bg-indigo-500 hover:bg-indigo-400 transition-colors" style={{ height: `${(pt.value / 150000) * 100}%` }} title={`Date: ${pt.date}, Val: ${pt.value.toFixed(2)}`}></div>
               ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const AlgoList = ({ algorithms, selectedAlgo, onSelect, onCreate }: any) => (
  <Card title="Strategy Portfolio" subtitle="Managed Algorithms" actions={<Button icon={Plus} onClick={onCreate} variant="secondary" size="sm">New</Button>} className="h-full" noPadding>
    <div className="p-4 border-b border-gray-700">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search strategies..." className="w-full bg-gray-900 border border-gray-600 rounded-md pl-9 pr-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
    </div>
    <div className="space-y-3 p-4 overflow-y-auto custom-scrollbar">
      {algorithms.map((algo: Algorithm) => (
        <div
          key={algo.id}
          onClick={() => onSelect(algo)}
          className={`p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${selectedAlgo?.id === algo.id ? 'bg-indigo-900/50 border-indigo-500 shadow-lg shadow-indigo-900/50' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600'}`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-100">{algo.name}</h4>
            <Badge color={algo.status === 'live' ? 'green' : algo.status === 'backtesting' ? 'yellow' : 'gray'}>{algo.status.toUpperCase()}</Badge>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>v{algo.version} &bull; {algo.author}</span>
            <span className="flex items-center text-indigo-400 font-semibold"><Bot className="w-3 h-3 mr-1" /> AI Score: {algo.aiScore}</span>
          </div>
          {algo.performanceMetrics && (
            <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-3 gap-2 text-xs">
              <div><span className="text-gray-500 block">Return</span><span className="font-medium text-green-400">+{algo.performanceMetrics.return}%</span></div>
              <div><span className="text-gray-500 block">Sharpe</span><span className="font-medium text-gray-300">{algo.performanceMetrics.sharpe}</span></div>
              <div><span className="text-gray-500 block">Win Rate</span><span className="font-medium text-gray-300">{algo.performanceMetrics.winRate}%</span></div>
            </div>
          )}
        </div>
      ))}
    </div>
  </Card>
);

// --- Navigation & Layout ---

const NAV_ITEMS = [
    { name: 'Executive Dashboard', icon: LayoutDashboard, category: 'Core' },
    { name: 'Algo-Trading Lab', icon: Code, category: 'Core', current: true },
    { name: 'Quantum Weaver AI', icon: BrainCircuit, category: 'Core' },
    { name: 'AI Financial Advisor', icon: Bot, category: 'Core' },
    { name: 'Advanced Charting', icon: BarChart2, category: 'Core' },
    { name: 'Market Scanner', icon: Search, category: 'Core' },
    { name: 'Gemini Thinking Console', icon: Sparkles, category: 'Gemini 2.5' },
    { name: 'Multimodal Input Analysis', icon: Eye, category: 'Gemini 2.5' },
    { name: 'Streaming Response Monitor', icon: Zap, category: 'Gemini 2.5' },
    { name: 'System Instruction Editor', icon: Terminal, category: 'Gemini 2.5' },
    { name: 'Chat History Explorer', icon: MessageSquare, category: 'Gemini 2.5' },
    { name: 'Global Transactions', icon: History, category: 'Treasury' },
    { name: 'Liquidity Transfer', icon: Send, category: 'Treasury' },
    { name: 'Budgetary Control', icon: Target, category: 'Treasury' },
    { name: 'Corporate Treasury', icon: Globe, category: 'Treasury' },
    { name: 'Modern Treasury API', icon: Key, category: 'Treasury' },
    { name: 'Strategic Goals', icon: Trophy, category: 'Strategy' },
    { name: 'Credit Health Monitor', icon: Heart, category: 'Strategy' },
    { name: 'Investment Portfolio', icon: Briefcase, category: 'Strategy' },
    { name: 'Venture Capital', icon: Rocket, category: 'Strategy' },
    { name: 'Private Equity', icon: Briefcase, category: 'Strategy' },
    { name: 'Mutual Fund Screener', icon: Filter, category: 'Strategy' },
    { name: 'ETF Hub', icon: PieChart, category: 'Strategy' },
    { name: 'Robo-Advisor Config', icon: Bot, category: 'Strategy' },
    { name: 'Web3 & Crypto Bridge', icon: Link, category: 'Markets' },
    { name: 'Forex Arbitrage Arena', icon: Scale, category: 'Markets' },
    { name: 'Commodities Exchange', icon: Wheat, category: 'Markets' },
    { name: 'Real Estate Empire', icon: Building, category: 'Markets' },
    { name: 'Art & NFT Vault', icon: Palette, category: 'Markets' },
    { name: 'Derivatives Desk', icon: PieChart, category: 'Markets' },
    { name: 'Options Chain', icon: Link, category: 'Markets' },
    { name: 'Futures Contracts', icon: FileText, category: 'Markets' },
    { name: 'Bond Analytics', icon: Scale, category: 'Markets' },
    { name: 'Dark Pool Routing', icon: Network, category: 'Markets' },
    { name: 'Exotic Derivatives', icon: Sparkles, category: 'Markets' },
    { name: 'Carbon Credit Trading', icon: Wheat, category: 'Markets' },
    { name: 'Tax Optimization AI', icon: Receipt, category: 'Finance' },
    { name: 'Legacy Planning', icon: BookOpen, category: 'Finance' },
    { name: 'Wealth Management', icon: Crown, category: 'Finance' },
    { name: 'Billing & Invoicing', icon: CreditCard, category: 'Finance' },
    { name: 'Expense Management', icon: Receipt, category: 'Finance' },
    { name: 'Capital Call Management', icon: Phone, category: 'Finance' },
    { name: 'Card Issuance (Marqeta)', icon: CreditCard, category: 'Integrations' },
    { name: 'Data Aggregation (Plaid)', icon: Link, category: 'Integrations' },
    { name: 'Payment Rails (Stripe)', icon: Zap, category: 'Integrations' },
    { name: 'Open Banking API', icon: Link, category: 'Integrations' },
    { name: 'Identity (SSO)', icon: Lock, category: 'Platform' },
    { name: 'Agent Marketplace', icon: Users, category: 'Platform' },
    { name: 'Ad Studio AI', icon: Megaphone, category: 'Platform' },
    { name: 'Card Customization', icon: CreditCard, category: 'Platform' },
    { name: 'DAO Governance', icon: Handshake, category: 'Platform' },
    { name: 'API Key Management', icon: Key, category: 'Platform' },
    { name: 'Webhook Subscriptions', icon: Send, category: 'Platform' },
    { name: 'System Status', icon: Activity, category: 'System' },
    { name: 'Security Center', icon: Shield, category: 'System' },
    { name: 'System Manifesto', icon: Eye, category: 'System' },
    { name: 'Audit Logs', icon: History, category: 'System' },
    { name: 'Disaster Recovery', icon: Server, category: 'System' },
    { name: 'Concierge', icon: Phone, category: 'Support' },
    { name: 'Philanthropy', icon: Heart, category: 'Support' },
    { name: 'Personalization', icon: Sparkles, category: 'Support' },
    { name: 'Knowledge Base', icon: BookOpen, category: 'Support' },
    { name: 'Live Chat Support', icon: MessageSquare, category: 'Support' },
    { name: 'Feature Requests', icon: Megaphone, category: 'Support' },
    { name: 'Risk Dashboard', icon: Shield, category: 'Risk Management' },
    { name: 'VaR Simulation', icon: BarChart2, category: 'Risk Management' },
    { name: 'Stress Testing', icon: Activity, category: 'Risk Management' },
    { name: 'Counterparty Risk', icon: Users, category: 'Risk Management' },
    { name: 'Credit Default Swaps', icon: FileText, category: 'Risk Management' },
    { name: 'Liquidity Risk', icon: LifeBuoy, category: 'Risk Management' },
    { name: 'Operational Risk', icon: SlidersHorizontal, category: 'Risk Management' },
    { name: 'Geopolitical Risk Map', icon: Globe, category: 'Risk Management' },
    { name: 'Model Risk Governance', icon: BrainCircuit, category: 'Risk Management' },
    { name: 'Compliance Hub', icon: CheckSquare, category: 'Compliance' },
    { name: 'Regulatory Reporting', icon: FileText, category: 'Compliance' },
    { name: 'Audit Trail', icon: History, category: 'Compliance' },
    { name: 'AML Monitoring', icon: Eye, category: 'Compliance' },
    { name: 'Trade Surveillance', icon: Search, category: 'Compliance' },
    { name: 'Policy Management', icon: BookOpen, category: 'Compliance' },
    { name: 'SEC Rule 15c3-5', icon: CheckSquare, category: 'Compliance' },
    { name: 'MiFID II Reporting', icon: FileText, category: 'Compliance' },
    { name: 'Data Lake Explorer', icon: Database, category: 'Data Science' },
    { name: 'Jupyter Notebooks', icon: BookOpen, category: 'Data Science' },
    { name: 'Model Training', icon: Cpu, category: 'Data Science' },
    { name: 'Feature Store', icon: HardDrive, category: 'Data Science' },
    { name: 'Data Visualization Lab', icon: BarChart2, category: 'Data Science' },
    { name: 'ETL Pipelines', icon: Repeat, category: 'Data Science' },
    { name: 'Alternative Data Hub', icon: HardDrive, category: 'Data Science' },
    { name: 'Cloud Infrastructure', icon: Cloud, category: 'Infrastructure' },
    { name: 'Network Topology', icon: Network, category: 'Infrastructure' },
    { name: 'Server Fleet Management', icon: Server, category: 'Infrastructure' },
    { name: 'CI/CD Pipelines', icon: GitBranch, category: 'Infrastructure' },
    { name: 'Terminal Access', icon: Terminal, category: 'Infrastructure' },
    { name: 'Quantum Fabric Status', icon: Atom, category: 'Infrastructure' },
    { name: 'Kubernetes Cluster', icon: Cloud, category: 'Infrastructure' },
    { name: 'Quarterly Reports', icon: PieChart, category: 'Reporting' },
    { name: 'Performance Attribution', icon: Trophy, category: 'Reporting' },
    { name: 'Client Statements', icon: Receipt, category: 'Reporting' },
    { name: 'P&L Analytics', icon: TrendingUp, category: 'Reporting' },
    { name: 'AUM Tracker', icon: DollarSign, category: 'Reporting' },
    { name: 'Investor Relations Portal', icon: Users, category: 'Client Relations' },
    { name: 'CRM Integration', icon: Handshake, category: 'Client Relations' },
    { name: 'Support Tickets', icon: LifeBuoy, category: 'Client Relations' },
    { name: 'Onboarding Wizard', icon: User, category: 'Client Relations' },
    { name: 'Global News Feed', icon: Globe, category: 'Market Intel' },
    { name: 'SEC Filings', icon: FileText, category: 'Market Intel' },
    { name: 'Social Media Sentiment', icon: Megaphone, category: 'Market Intel' },
    { name: 'Economic Calendar', icon: Calendar, category: 'Market Intel' },
    { name: 'Insider Trading Monitor', icon: Eye, category: 'Market Intel' },
    { name: 'Back Office Operations', icon: Briefcase, category: 'Operations' },
    { name: 'Settlements & Clearing', icon: CheckSquare, category: 'Operations' },
    { name: 'Corporate Actions', icon: Megaphone, 'category': 'Operations' },
    { name: 'Reconciliation Engine', icon: Repeat, category: 'Operations' },
    { name: 'Multi-Factor Auth', icon: Lock, category: 'Security' },
    { name: 'Intrusion Detection', icon: Shield, category: 'Security' },
    { name: 'Penetration Testing', icon: Target, category: 'Security' },
    { name: 'Bug Bounty Program', icon: Trophy, category: 'Security' },
];

const AppSidebar = ({ onNavigate, activeView }: any) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const groupedNavItems = useMemo(() => NAV_ITEMS.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, typeof NAV_ITEMS>), []);

    return (
        <div className={`h-full bg-gray-900 text-white flex flex-col transition-all duration-300 shadow-2xl z-20 ${isCollapsed ? 'w-20' : 'w-72'}`}>
            <div className="p-5 flex items-center justify-between border-b border-gray-800 bg-gray-900 h-16">
                {!isCollapsed && (
                  <div>
                    <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tighter">QUANTUM OS</h1>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase">High Frequency Trading</p>
                  </div>
                )}
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors" onClick={() => onNavigate("Profile")}>
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-gray-700">TR</div>
                    {!isCollapsed && (
                      <div className="overflow-hidden"><p className="text-sm font-bold text-gray-200 truncate">Trader</p><p className="text-xs text-green-400 flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span> Online</p></div>
                    )}
                </div>
            </div>

            <nav className="flex-grow overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {Object.entries(groupedNavItems).map(([category, items]) => (
                    <div key={category}>
                        {!isCollapsed && <h3 className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{category}</h3>}
                        {items.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.name === activeView;
                            return (
                                <a key={item.name} href="#" onClick={(e) => { e.preventDefault(); onNavigate(item.name); }}
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                >
                                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                                    <span className={`ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{item.name}</span>
                                </a>
                            );
                        })}
                    </div>
                ))}
            </nav>
            
            <div className="p-4 border-t border-gray-800 bg-gray-900 text-xs text-gray-600 text-center">
              {!isCollapsed && "v12.8.1-Quantum | Secure Connection"}
            </div>
        </div>
    );
}

// --- Placeholder & Special Views ---

const ModulePlaceholder = ({ viewName, icon: Icon }: { viewName: string, icon: React.ElementType }) => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800/50 rounded-xl shadow-2xl border border-gray-700 p-10 text-center">
        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 border-4 border-gray-700">
            <Icon className="w-12 h-12 text-indigo-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-100 mb-2">{viewName}</h2>
        <p className="text-gray-400 max-w-md mb-8">This module is currently under development. Advanced functionalities will be available soon.</p>
        <Button icon={RefreshCw} onClick={() => {}} variant="secondary">Check for Updates</Button>
    </div>
);

const SystemManifesto = () => (
  <Card title="System Manifesto" subtitle="Core Principles & Architecture" className="h-full overflow-y-auto">
    <div className="prose prose-invert prose-lg max-w-none text-gray-300 p-4">
      <h3 className="text-2xl font-bold text-indigo-400 border-b border-gray-700 pb-2 mb-4">System Overview</h3>
      <p>Quantum OS is a next-generation, AI-native platform for high-frequency algorithmic trading and comprehensive financial asset management. It is designed for unparalleled speed, intelligence, and security.</p>
      <div className="bg-gray-900/50 p-6 rounded-xl border-l-4 border-indigo-500 my-6">
        <h4 className="text-lg font-bold text-indigo-300 mb-2">Core Tenets</h4>
        <ul className="list-disc list-inside space-y-2 text-indigo-200">
          <li><strong>Speed of Light Execution:</strong> Global edge-node deployment ensures sub-millisecond latency.</li>
          <li><strong>Quantum-Inspired AI:</strong> Core logic is driven by proprietary AI models that simulate quantum states for predictive accuracy.</li>
          <li><strong>Total Asset Visibility:</strong> Unified interface for all asset classes, from traditional equities to decentralized finance.</li>
          <li><strong>Fortress-Grade Security:</strong> Proactive threat detection via a Neural Firewall and end-to-end encryption.</li>
        </ul>
      </div>
      <p>Our mission is to redefine the boundaries of financial technology, creating a self-optimizing, intelligent system that anticipates market movements and autonomously manages risk.</p>
    </div>
  </Card>
);

const QuantumWeaverAIView = () => (
    <Card title="Quantum Weaver AI" subtitle="Neural Network & Strategy Entanglement" className="h-full">
        <div className="text-center text-gray-300">
            <BrainCircuit className="w-24 h-24 mx-auto text-purple-400 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold">Visualize & Entangle AI Models</h3>
            <p className="text-gray-400 mt-2">This interface allows for the direct manipulation of neural pathways and the "entanglement" of successful strategies to create hybrid AI models with emergent properties. Feature coming in Q4.</p>
        </div>
    </Card>
);

const GeminiThinkingConsole = () => (
    <Card title="Gemini 2.5 Pro - Thinking Console" subtitle="Live Cognitive Stream" className="h-full flex flex-col" noPadding>
        <div className="flex-grow bg-gray-900/50 p-4 rounded-t-lg border border-gray-700 overflow-y-auto custom-scrollbar font-mono text-sm text-green-400 space-y-2 flex flex-col">
            <div className="flex-grow space-y-2">
                <p>&gt; Initializing Gemini 2.5 Pro model...</p>
                <p>&gt; Thinking enabled by default. Budget: UNLIMITED.</p>
                <p>&gt; System Instruction: You are Quantum OS's core strategic AI. Your name is GEIN (Global Entangled Intelligence Network).</p>
                <p className="text-cyan-400">&gt; [COGNITIVE_STREAM_START]</p>
                <p>&gt; Analyzing market microstructure... detected anomalous volume in dark pools for ticker: $XYZ.</p>
                <p>&gt; Cross-referencing with geopolitical sentiment data... correlation with recent supply chain disruption news found (confidence: 0.89).</p>
                <p>&gt; Simulating impact on 'Quantum Momentum Scalper v4' strategy...</p>
                <p className="text-yellow-400">&gt; [THINKING]... Evaluating 1,337,420 possible outcomes...</p>
                <p className="text-yellow-400">&gt; [THINKING]... Refactoring risk parameters for algo-1 to hedge against predicted volatility spike.</p>
                <p>&gt; Recommendation: Decrease trade size parameter from 100 to 75 for the next 60 minutes.</p>
                <p>&gt; Actionable insight generated. Pushing notification to user 'Trader'.</p>
            </div>
            <p className="animate-pulse flex-shrink-0">&gt; _</p>
        </div>
        <div className="flex-shrink-0 p-4 bg-gray-800/50 rounded-b-lg border-t-0 border border-gray-700">
            <div className="relative">
                <input type="text" placeholder="Send instruction to GEIN..." className="w-full bg-gray-900 border border-gray-600 rounded-md pl-4 pr-12 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                <Button icon={Send} variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2" />
            </div>
        </div>
    </Card>
);

const UserProfileView = () => {
    const [profile, setProfile] = useState(mockUserProfile);
    const [activeTab, setActiveTab] = useState('Preferences');

    return (
        <Card title="User Profile & Settings" subtitle={profile.name} className="h-full flex flex-col">
            <Tabs tabs={['Preferences', 'Security', 'API Keys']} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-grow p-6">
                {activeTab === 'Preferences' && (
                    <div className="space-y-6 max-w-md">
                        <Select label="UI Theme" name="theme" value={profile.preferences.theme} onChange={() => {}}>
                            <option>dark</option><option>light</option><option>matrix</option>
                        </Select>
                        <Select label="Notifications" name="notifications" value={profile.preferences.notifications} onChange={() => {}}>
                            <option>all</option><option>critical</option><option>none</option>
                        </Select>
                        <Select label="AI Assistance Level" name="aiAssistanceLevel" value={profile.preferences.aiAssistanceLevel} onChange={() => {}}>
                            <option>minimal</option><option>standard</option><option>proactive</option>
                        </Select>
                        <Button variant="primary" icon={Save}>Save Preferences</Button>
                    </div>
                )}
                {activeTab === 'Security' && (
                    <div className="space-y-4 text-gray-300">
                        <p>2FA Enabled: <Badge color="green">Yes</Badge></p>
                        <p>Last Login: {profile.security.lastLogin}</p>
                        <Button variant="secondary">View Login History</Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

// --- Main Application Component ---

const algoTabs = [
  'Builder', 'Parameters', 'Deployment', 'Performance', 'Risk Analysis', 'Code', 'Version History', 'Logs', 'AI Insights', 'Optimization', 'Security', 'Dependencies', 'Team Access', 'Alerts', 'Notes',
  'Backtests', 'Live Monitoring', 'Source Code', 'Execution Log', 'Trade Journal', 'Configuration', 'Environment Vars', 'Secrets', 'Permissions', 'Audit Trail', 'Metrics', 'Visualizations', 'Reports',
  'Compliance Checks', 'Stress Tests', 'Monte Carlo', 'What-If Scenarios', 'Data Sources', 'Input Schema', 'Output Schema', 'API Endpoints', 'Webhooks', 'Triggers', 'Scheduling', 'Cost Analysis',
  'Resource Usage', 'CPU Profile', 'Memory Profile', 'Network I/O', 'Disk I/O', 'GPU Usage', 'Quantum Entanglement', 'Neural Links', 'Hyperparameters', 'Feature Importance', 'Model Explainability',
  'Data Lineage', 'Ownership', 'Stakeholders', 'Documentation', 'README', 'Changelog', 'License', 'Support', 'Issues', 'Pull Requests', 'Code Reviews', 'Static Analysis', 'Security Scans',
  'Unit Tests', 'Integration Tests', 'E2E Tests', 'Fuzzing', 'Formal Verification', 'Peer Review', 'Community Forum', 'Live Chat', 'Video Tutorials', 'API Docs', 'SDKs', 'Client Libraries',
  'Sample Code', 'Use Cases', 'Case Studies', 'Whitepapers', 'Benchmarks', 'Leaderboard', 'Competitions', 'Bounties', 'Grants', 'Partnerships', 'Integrations', 'App Store', 'Plugins',
  'Extensions', 'Themes', 'Customization', 'Personalization', 'Settings', 'Preferences', 'Notifications', 'Billing', 'Subscription', 'Invoices', 'Payment History', 'Referrals', 'Affiliates'
];

const AlgoTradingLab: React.FC = () => {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>(initialAlgorithms);
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(initialAlgorithms[0].id);
  const [currentView, setCurrentView] = useState('Algo-Trading Lab');
  const [notifications, setNotifications] = useState<AIInsight[]>(mockInsights);
  const [activeAlgoTab, setActiveAlgoTab] = useState('Builder');

  const selectedAlgorithm = useMemo(() => algorithms.find(a => a.id === selectedAlgoId) || initialAlgorithms[0], [algorithms, selectedAlgoId]);

  const handleUpdateCode = useCallback((code: string) => {
    setAlgorithms(prev => prev.map(a => a.id === selectedAlgoId ? { ...a, code, status: 'draft', lastModified: new Date().toISOString().split('T')[0] } : a));
  }, [selectedAlgoId]);
  
  const handleUpdateParams = useCallback((params: AlgorithmParameter[]) => {
    setAlgorithms(prev => prev.map(a => a.id === selectedAlgoId ? { ...a, parameters: params, status: 'draft', lastModified: new Date().toISOString().split('T')[0] } : a));
  }, [selectedAlgoId]);

  const handleCreate = useCallback(() => {
    const newAlgo: Algorithm = {
      id: `algo-${Date.now()}`,
      name: `New Strategy ${algorithms.length + 1}`,
      description: 'A new, undefined trading strategy.',
      tags: ['new'],
      code: '{"nodes":[]}',
      language: 'nocode',
      status: 'draft',
      version: 1,
      lastModified: new Date().toISOString().split('T')[0],
      author: 'User',
      riskLevel: 'medium',
      aiScore: 50,
      parameters: [],
      deploymentTarget: 'cloud-cluster-a',
      geinFactor: 0.5,
      interactionMatrix: [[1]],
      dataPointSensitivity: {},
      layerMetrics: {},
      executionPriority: 'normal',
      computeProfile: 'cpu-bound',
      dataSources: [],
      dependencies: [],
      permissions: [],
      ownerTeam: 'User',
      isAudited: false,
      auditHistory: []
    };
    setAlgorithms([...algorithms, newAlgo]);
    setSelectedAlgoId(newAlgo.id);
  }, [algorithms]);

  const renderContent = () => {
    const navItem = NAV_ITEMS.find(item => item.name === currentView);
    const icon = navItem ? navItem.icon : LifeBuoy;

    switch (currentView) {
      case 'System Manifesto': return <SystemManifesto />;
      case 'Quantum Weaver AI': return <QuantumWeaverAIView />;
      case 'Gemini Thinking Console': return <GeminiThinkingConsole />;
      case 'Profile': return <UserProfileView />;
      case 'Executive Dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto pb-10 custom-scrollbar">
            <AIStatusMonitor />
            <GlobalMarketPulse />
            <div className="lg:col-span-2">
               <Card title="System-Wide Alerts" subtitle="AI Detected Anomalies & Insights">
                 <div className="space-y-2">
                   {notifications.map(n => (
                     <div key={n.id} className={`p-3 rounded border-l-4 flex justify-between items-center ${n.severity === 'critical' ? 'bg-red-900/50 border-red-500' : n.severity === 'high' ? 'bg-orange-900/50 border-orange-500' : 'bg-blue-900/50 border-blue-500'}`}>
                       <div>
                         <span className="font-bold text-gray-200 block">{n.category.toUpperCase()} ALERT</span>
                         <span className="text-sm text-gray-300">{n.message}</span>
                       </div>
                       <Badge color={n.severity === 'critical' ? 'red' : 'blue'}>{n.confidence * 100}% Conf.</Badge>
                     </div>
                   ))}
                 </div>
               </Card>
            </div>
          </div>
        );
      case 'Algo-Trading Lab':
        return (
          <div className="grid grid-cols-12 gap-6 h-full">
            <div className="col-span-12 lg:col-span-3 h-full"><AlgoList algorithms={algorithms} selectedAlgo={selectedAlgorithm} onSelect={(a: Algorithm) => setSelectedAlgoId(a.id)} onCreate={handleCreate} /></div>
            <div className="col-span-12 lg:col-span-6 h-full flex flex-col">
              <Card title={`Editor: ${selectedAlgorithm.name}`} subtitle={`v${selectedAlgorithm.version} • ${selectedAlgorithm.status.toUpperCase()}`} className="h-full flex flex-col" noPadding>
                <Tabs tabs={algoTabs} activeTab={activeAlgoTab} setActiveTab={setActiveAlgoTab} />
                <div className="flex-grow overflow-auto">
                    {activeAlgoTab === 'Builder' && <NoCodeEditor algorithm={selectedAlgorithm} onUpdateCode={handleUpdateCode} />}
                    {activeAlgoTab === 'Parameters' && <AlgorithmParametersForm algorithm={selectedAlgorithm} onUpdate={handleUpdateParams} />}
                    {activeAlgoTab !== 'Builder' && activeAlgoTab !== 'Parameters' && <div className="p-6 text-gray-400">{activeAlgoTab} interface placeholder.</div>}
                </div>
              </Card>
            </div>
            <div className="col-span-12 lg:col-span-3 h-full"><Backtester algorithm={selectedAlgorithm} /></div>
          </div>
        );
      default:
        return <ModulePlaceholder viewName={currentView} icon={icon} />;
    }
  };

  return (
    <div className="h-screen w-full flex bg-gray-900 font-sans overflow-hidden text-gray-200">
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 4px; }`}</style>
      <AppSidebar onNavigate={setCurrentView} activeView={currentView} />
      
      <div className="flex-grow flex flex-col h-full overflow-hidden relative">
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 h-16 flex items-center justify-between px-6 shadow-lg z-10 flex-shrink-0">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-100 tracking-tight">{currentView}</h2>
            {currentView === 'Algo-Trading Lab' && <span className="ml-3 px-2 py-0.5 rounded bg-indigo-800/50 text-indigo-300 text-xs font-bold">ACTIVE SESSION</span>}
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-300">System Optimal</span>
            </div>
            <Button icon={History} variant="ghost" className="relative"><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-900"></span></Button>
            <Button icon={User} variant="ghost" onClick={() => setCurrentView('Profile')} />
            <Button icon={LogOut} variant="ghost" className="hover:text-red-500" onClick={() => alert("Secure Logout Initiated")} />
          </div>
        </header>

        <main className="flex-grow p-6 overflow-hidden relative bg-black/20">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AlgoTradingLab;

// --- CONSOLIDATED FROM: AlgoTradingLab (1).tsx ---

import React, { useState, useCallback, useMemo } from 'react';
import { 
  RefreshCw, Play, Save, History, Code, Settings, TrendingUp, DollarSign, X, User, LogOut,
  Plus, Search, Filter, ChevronDown, ChevronUp, BrainCircuit, Bot, SlidersHorizontal,
  LayoutDashboard, Repeat, Send, Target, Trophy, Heart, Briefcase, Link, Zap, Lock,
  Atom, Users, Megaphone, CreditCard, Handshake, Activity, Phone, Shield, Sparkles, Eye,
  Globe, Key, Receipt, Rocket, PieChart, Palette, Building, Wheat, Scale, Crown, FileText,
  Server, Network, GitBranch, HardDrive, Cpu, Database, Cloud, Terminal, BookOpen,
  BarChart2, CheckSquare, Calendar, MessageSquare, LifeBuoy
} from 'lucide-react';
import { Badge } from './badge';

// --- Expanded Data Models ---

interface SystemMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  aiPrediction: number;
  subMetrics?: { label: string; value: string }[];
}

interface AIInsight {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'market' | 'system' | 'security' | 'optimization' | 'regulatory';
  message: string;
  confidence: number;
  actionable: boolean;
  relatedEntityId?: string;
}

interface AlgorithmParameter {
  name: string;
  type: 'number' | 'string' | 'boolean';
  value: any;
  range?: [number, number];
  description: string;
}

interface Algorithm {
  id: string;
  name: string;
  description: string;
  tags: string[];
  code: string;
  language: 'nocode' | 'python' | 'rust';
  status: 'draft' | 'backtesting' | 'live' | 'error' | 'optimizing' | 'archived';
  version: number;
  lastModified: string;
  author: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  aiScore: number;
  parameters: AlgorithmParameter[];
  deploymentTarget: 'cloud-cluster-a' | 'edge-node-tokyo' | 'quantum-fabric-1';
  performanceMetrics?: {
    pnl: number;
    return: number;
    sharpe: number;
    sortino: number;
    alpha: number;
    beta: number;
    volatility: number;
    winRate: number;
    maxDrawdown: number;
  };
  geinFactor: number;
  interactionMatrix: number[][];
  dataPointSensitivity: Record<string, number>;
  layerMetrics: Record<string, { gein: number; activation: number }>;
  executionPriority: 'low' | 'normal' | 'high' | 'critical' | 'quantum';
  computeProfile: 'cpu-bound' | 'memory-bound' | 'io-bound' | 'gpu-accelerated';
  dataSources: string[];
  dependencies: { name: string; version: string }[];
  permissions: string[];
  ownerTeam: string;
  isAudited: boolean;
  auditHistory: { date: string; auditor: string; result: 'pass' | 'fail' }[];
}

interface BacktestResult {
  runId: string;
  algorithmId: string;
  algorithmVersion: number;
  startDate: string;
  endDate:string;
  initialCapital: number;
  finalCapital: number;
  equityCurve: { date: string; value: number; aiForecast: number }[];
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    trades: number;
    profitFactor: number;
    expectancy: number;
    avgTradeReturn: number;
  };
  parametersSnapshot: AlgorithmParameter[];
  aiAnalysis: string;
  tradeLog: { timestamp: string; type: 'buy' | 'sell'; asset: string; quantity: number; price: number; pnl: number }[];
}

interface UserProfile {
  id: string;
  name: string;
  role: 'Administrator' | 'Trader' | 'Quant' | 'Observer';
  clearanceLevel: number;
  email: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto' | 'matrix';
    notifications: 'all' | 'critical' | 'none';
    aiAssistanceLevel: 'minimal' | 'standard' | 'proactive';
    defaultView: string;
  };
  apiKeys: { service: string; key: string; lastUsed: string }[];
  security: {
    twoFactorEnabled: boolean;
    lastLogin: string;
    loginHistory: { timestamp: string; ip: string; status: 'success' | 'failed' }[];
  };
  stats: {
    loginCount: number;
    actionsPerformed: number;
    uptime: string;
    pnlContribution: number;
  };
}

// --- Data Utilities & Mocks ---

const generateTimeSeries = (points: number, startValue: number, volatility: number) => {
  const data = [];
  let currentValue = startValue;
  const now = new Date();
  for (let i = 0; i < points; i++) {
    const date = new Date(now.getTime() - (points - i) * 86400000).toISOString().split('T')[0];
    const change = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + change);
    data.push({
      date,
      value: currentValue,
      aiForecast: currentValue * (1 + (Math.random() - 0.5) * 0.02)
    });
  }
  return data;
};

const initialAlgorithms: Algorithm[] = [
  { 
    id: 'algo-1', 
    name: 'Quantum Momentum Scalper v4', 
    description: 'High-frequency scalping strategy utilizing quantum-inspired principles for momentum prediction.',
    tags: ['HFT', 'Scalping', 'Momentum', 'Quantum'],
    code: '{"nodes":["Input: L2 Market Data Stream", "Filter: Volatility > 1.5", "AI Model: Quantum Trend Predictor", "Logic: If confidence > 0.95", "Action: Buy/Sell 100 units"]}', 
    language: 'nocode',
    status: 'live', 
    version: 4,
    lastModified: '2023-10-26',
    author: 'System Admin',
    riskLevel: 'high',
    aiScore: 94,
    parameters: [
      { name: 'Volatility Threshold', type: 'number', value: 1.5, range: [0.5, 5], description: 'Minimum volatility to activate trading.' },
      { name: 'Trade Size', type: 'number', value: 100, range: [10, 1000], description: 'Number of units per trade.' }
    ],
    deploymentTarget: 'cloud-cluster-a',
    performanceMetrics: { pnl: 125000, return: 45.2, sharpe: 2.1, sortino: 2.8, alpha: 0.15, beta: 0.8, volatility: 12.5, winRate: 68, maxDrawdown: -8.2 },
    geinFactor: 0.98,
    interactionMatrix: [[1, 0.2, -0.1], [0.2, 1, 0.5], [-0.1, 0.5, 1]],
    dataPointSensitivity: { 'L2.bid_price': 0.8, 'L2.ask_price': 0.8, 'volatility': 0.9 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.95 }, 'quantum_core': { gein: 0.99, activation: 0.98 }, 'output': { gein: 1.0, activation: 0.96 } },
    executionPriority: 'quantum',
    computeProfile: 'gpu-accelerated',
    dataSources: ['L2 Market Data Stream', 'Global News Feed API'],
    dependencies: [{ name: 'quantum-tensor-lib', version: '2.5.1' }],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'Quantum Core Team',
    isAudited: true,
    auditHistory: [{ date: '2023-09-15', auditor: 'Internal Security', result: 'pass' }]
  },
  { 
    id: 'algo-2', 
    name: 'Mean Reversion HFT (Neural)', 
    description: 'Neural network-based strategy that capitalizes on short-term mean reversion in liquid assets.',
    tags: ['HFT', 'Mean Reversion', 'AI', 'Market Making'],
    code: '{"nodes":["Input: Order Book Depth", "AI: Sentiment Analysis (News Feeds)", "Logic: Spread > 0.02% AND Reversion Signal", "Action: Market Make (Bid/Ask)"]}', 
    language: 'nocode',
    status: 'backtesting', 
    version: 12,
    lastModified: '2023-10-27',
    author: 'AI Architect',
    riskLevel: 'medium',
    aiScore: 88,
    parameters: [
      { name: 'Spread Threshold', type: 'number', value: 0.02, range: [0.01, 0.1], description: 'Minimum bid-ask spread to engage.' },
      { name: 'Sentiment Weight', type: 'number', value: 0.3, range: [0, 1], description: 'Influence of news sentiment on trade logic.' }
    ],
    deploymentTarget: 'edge-node-tokyo',
    performanceMetrics: { pnl: 45000, return: 12.5, sharpe: 1.8, sortino: 1.9, alpha: 0.05, beta: 0.2, volatility: 4.2, winRate: 55, maxDrawdown: -4.1 },
    geinFactor: 0.85,
    interactionMatrix: [[1, 0.7], [0.7, 1]],
    dataPointSensitivity: { 'spread': 0.9, 'sentiment': 0.6 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.9 }, 'neural_net': { gein: 0.8, activation: 0.92 }, 'output': { gein: 1.0, activation: 0.88 } },
    executionPriority: 'high',
    computeProfile: 'cpu-bound',
    dataSources: ['Order Book Depth', 'News Feeds'],
    dependencies: [{ name: 'sentiment-analyzer', version: '4.2.0' }],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'AI Research',
    isAudited: true,
    auditHistory: [{ date: '2023-08-20', auditor: 'External Audit Co.', result: 'pass' }]
  }
];

// --- UI Components ---

const Button = ({ icon: Icon, children, onClick, variant = 'primary', disabled = false, className = '', size = 'md' }: any) => {
  const baseClasses = "flex items-center justify-center space-x-2 rounded-lg text-sm transition duration-200 ease-in-out font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";
  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  let colorClasses = "";

  switch (variant) {
    case 'primary': colorClasses = "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"; break;
    case 'secondary': colorClasses = "bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600 focus:ring-indigo-500 disabled:bg-gray-800 disabled:text-gray-500"; break;
    case 'danger': colorClasses = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400"; break;
    case 'success': colorClasses = "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400"; break;
    case 'ghost': colorClasses = "bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white disabled:text-gray-600 shadow-none"; break;
  }

  return (
    <button className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${colorClasses} ${className}`} onClick={onClick} disabled={disabled}>
      {Icon && <Icon className="w-4 h-4" />}
      {children && <span>{children}</span>}
    </button>
  );
};

const Card = ({ title, subtitle, children, className = '', actions = null, noPadding = false }: any) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-xl border border-gray-700 flex flex-col ${className}`}>
    {(title || actions) && (
      <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/30 rounded-t-xl">
        <div>
          <h3 className="text-lg font-bold text-gray-100">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
    )}
    <div className={`${noPadding ? '' : 'p-6'} flex-grow overflow-auto custom-scrollbar`}>
      {children}
    </div>
  </div>
);

const ProgressBar = ({ value, max = 100, color = 'indigo', label }: any) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      {label && <span className="text-xs font-medium text-gray-300">{label}</span>}
      <span className="text-xs font-medium text-gray-400">{Math.round((value / max) * 100)}%</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <div className={`bg-${color}-500 h-2.5 rounded-full transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

const AIStatusMonitor = () => {
  const stats = [
    { label: 'Quantum Core Load', value: 78, color: 'indigo' },
    { label: 'Global Latency', value: 8, max: 50, color: 'green' },
    { label: 'Predictive Accuracy', value: 98.2, color: 'purple' },
    { label: 'Neural Firewall Threat', value: 2, color: 'red' },
  ];

  return (
    <Card title="AI System Status" subtitle="Real-time Quantum Core Monitoring">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <ProgressBar key={idx} label={stat.label} value={stat.value} max={stat.max || 100} color={stat.color} />
        ))}
      </div>
    </Card>
  );
};

const NoCodeEditor = ({ algorithm, onUpdateCode }: { algorithm: Algorithm, onUpdateCode: (code: string) => void }) => {
  const [blocks, setBlocks] = useState<string[]>(() => {
    try { return JSON.parse(algorithm.code).nodes || []; } catch { return []; }
  });

  const handleAddBlock = (type: string) => {
    const newBlock = `${type}: New Logic Node`;
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    onUpdateCode(JSON.stringify({ nodes: newBlocks }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700">
      <div className="p-3 border-b border-gray-700 bg-gray-800/50 rounded-t-lg flex flex-wrap gap-2">
        <Button icon={Database} onClick={() => handleAddBlock('Input')} variant="secondary" size="sm">Input</Button>
        <Button icon={TrendingUp} onClick={() => handleAddBlock('Indicator')} variant="secondary" size="sm">Indicator</Button>
        <Button icon={SlidersHorizontal} onClick={() => handleAddBlock('Logic')} variant="secondary" size="sm">Logic</Button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-3">
        {blocks.map((block, index) => (
          <div key={index} className="bg-gray-800 border border-indigo-900/50 p-4 rounded-lg text-gray-300 font-mono text-sm">
            {block}
          </div>
        ))}
      </div>
    </div>
  );
};

const AlgorithmParametersForm = ({ algorithm, onUpdate }: { algorithm: Algorithm, onUpdate: (params: AlgorithmParameter[]) => void }) => {
    const [params, setParams] = useState(algorithm.parameters);

    const handleChange = (index: number, value: any) => {
        const newParams = [...params];
        newParams[index].value = value;
        setParams(newParams);
    };

    return (
        <div className="p-6 space-y-6">
            {params.map((param, index) => (
                <div key={param.name}>
                    <label className="block text-sm font-medium text-gray-300">{param.name}</label>
                    <input
                        type="number"
                        value={param.value}
                        onChange={(e) => handleChange(index, parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                    />
                </div>
            ))}
            <Button icon={Save} onClick={() => onUpdate(params)} variant="primary">Save Parameters</Button>
        </div>
    );
};

const Backtester = ({ algorithm }: { algorithm: Algorithm }) => {
  const [isBacktesting, setIsBacktesting] = useState(false);
  const handleRun = () => setIsBacktesting(true);

  return (
    <Card title="Simulation" subtitle="Backtesting Engine">
      <Button icon={Play} onClick={handleRun} disabled={isBacktesting} variant="primary" className="w-full">
        {isBacktesting ? 'Running...' : 'Run Simulation'}
      </Button>
    </Card>
  );
};

const AlgoTradingLab: React.FC = () => {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>(initialAlgorithms);
  const [selectedAlgo, setSelectedAlgo] = useState<Algorithm | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'backtest' | 'params'>('editor');

  const updateAlgoCode = (code: string) => {
    if (selectedAlgo) {
      const updated = { ...selectedAlgo, code };
      setAlgorithms(algorithms.map(a => a.id === selectedAlgo.id ? updated : a));
      setSelectedAlgo(updated);
    }
  };

  return (
    <div className="flex h-screen p-6 bg-gray-900 text-white gap-6">
      <div className="w-1/3">
        <Card title="Strategies">
          {algorithms.map((algo) => (
            <div key={algo.id} onClick={() => setSelectedAlgo(algo)} className="p-3 bg-gray-700 mb-2 cursor-pointer rounded hover:bg-gray-600">
              {algo.name}
            </div>
          ))}
        </Card>
      </div>
      <div className="flex-grow flex flex-col gap-6">
        {selectedAlgo ? (
          <>
            <div className="flex gap-2">
              <Button onClick={() => setViewMode('editor')} variant={viewMode === 'editor' ? 'primary' : 'ghost'}>Editor</Button>
              <Button onClick={() => setViewMode('params')} variant={viewMode === 'params' ? 'primary' : 'ghost'}>Params</Button>
              <Button onClick={() => setViewMode('backtest')} variant={viewMode === 'backtest' ? 'primary' : 'ghost'}>Simulate</Button>
            </div>
            <div className="flex-grow">
              {viewMode === 'editor' && <NoCodeEditor algorithm={selectedAlgo} onUpdateCode={updateAlgoCode} />}
              {viewMode === 'params' && <AlgorithmParametersForm algorithm={selectedAlgo} onUpdate={(p) => setSelectedAlgo({...selectedAlgo, parameters: p})} />}
              {viewMode === 'backtest' && <Backtester algorithm={selectedAlgo} />}
            </div>
          </>
        ) : <div className="text-gray-500">Select a strategy</div>}
        <AIStatusMonitor />
      </div>
    </div>
  );
};

export default AlgoTradingLab;

// --- CONSOLIDATED FROM: AlgoTradingLab_1.tsx ---



import React, { useState, useCallback, useMemo } from 'react';
import { 
  RefreshCw, Play, Save, History, Code, Settings, TrendingUp, DollarSign, X, User, LogOut,
  Plus, Search, Filter, ChevronDown, ChevronUp, BrainCircuit, Bot, SlidersHorizontal,
  LayoutDashboard, Repeat, Send, Target, Trophy, Heart, Briefcase, Link, Zap, Lock,
  Atom, Users, Megaphone, CreditCard, Handshake, Activity, Phone, Shield, Sparkles, Eye,
  Globe, Key, Receipt, Rocket, PieChart, Palette, Building, Wheat, Scale, Crown, FileText,
  Server, Network, GitBranch, HardDrive, Cpu, Database, Cloud, Terminal, BookOpen,
  BarChart2, CheckSquare, Calendar, MessageSquare, LifeBuoy
} from 'lucide-react';
import { Badge } from './badge'; // Fixed import case to match file name

// --- Expanded Data Models ---

interface SystemMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  aiPrediction: number;
  subMetrics?: { label: string; value: string }[];
}

interface AIInsight {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'market' | 'system' | 'security' | 'optimization' | 'regulatory';
  message: string;
  confidence: number;
  actionable: boolean;
  relatedEntityId?: string;
}

interface AlgorithmParameter {
  name: string;
  type: 'number' | 'string' | 'boolean';
  value: any;
  range?: [number, number];
  description: string;
}

interface Algorithm {
  id: string;
  name: string;
  description: string;
  tags: string[];
  code: string; // Can be JSON for No-Code or raw script
  language: 'nocode' | 'python' | 'rust';
  status: 'draft' | 'backtesting' | 'live' | 'error' | 'optimizing' | 'archived';
  version: number;
  lastModified: string;
  author: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  aiScore: number; // 0-100, AI's confidence in the algo's viability
  parameters: AlgorithmParameter[];
  deploymentTarget: 'cloud-cluster-a' | 'edge-node-tokyo' | 'quantum-fabric-1';
  performanceMetrics?: {
    pnl: number;
    return: number;
    sharpe: number;
    sortino: number;
    alpha: number;
    beta: number;
    volatility: number;
    winRate: number;
    maxDrawdown: number;
  };
  // "GEIN" implementation
  geinFactor: number;
  interactionMatrix: number[][];
  dataPointSensitivity: Record<string, number>;
  layerMetrics: Record<string, { gein: number; activation: number }>;
  executionPriority: 'low' | 'normal' | 'high' | 'critical' | 'quantum';
  computeProfile: 'cpu-bound' | 'memory-bound' | 'io-bound' | 'gpu-accelerated';
  dataSources: string[];
  dependencies: { name: string; version: string }[];
  permissions: string[];
  ownerTeam: string;
  isAudited: boolean;
  auditHistory: { date: string; auditor: string; result: 'pass' | 'fail' }[];
}

interface BacktestResult {
  runId: string;
  algorithmId: string;
  algorithmVersion: number;
  startDate: string;
  endDate:string;
  initialCapital: number;
  finalCapital: number;
  equityCurve: { date: string; value: number; aiForecast: number }[];
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    trades: number;
    profitFactor: number;
    expectancy: number;
    avgTradeReturn: number;
  };
  parametersSnapshot: AlgorithmParameter[];
  aiAnalysis: string;
  tradeLog: { timestamp: string; type: 'buy' | 'sell'; asset: string; quantity: number; price: number; pnl: number }[];
}

interface UserProfile {
  id: string;
  name: string;
  role: 'Administrator' | 'Trader' | 'Quant' | 'Observer';
  clearanceLevel: number;
  email: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto' | 'matrix';
    notifications: 'all' | 'critical' | 'none';
    aiAssistanceLevel: 'minimal' | 'standard' | 'proactive';
    defaultView: string;
  };
  apiKeys: { service: string; key: string; lastUsed: string }[];
  security: {
    twoFactorEnabled: boolean;
    lastLogin: string;
    loginHistory: { timestamp: string; ip: string; status: 'success' | 'failed' }[];
  };
  stats: {
    loginCount: number;
    actionsPerformed: number;
    uptime: string;
    pnlContribution: number;
  };
}

// --- Data Utilities & Mocks ---

const generateTimeSeries = (points: number, startValue: number, volatility: number) => {
  const data = [];
  let currentValue = startValue;
  const now = new Date();
  for (let i = 0; i < points; i++) {
    const date = new Date(now.getTime() - (points - i) * 86400000).toISOString().split('T')[0];
    const change = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + change);
    data.push({
      date,
      value: currentValue,
      aiForecast: currentValue * (1 + (Math.random() - 0.5) * 0.02)
    });
  }
  return data;
};

const mockInsights: AIInsight[] = [
  { id: 'ins-1', timestamp: '2023-10-27 09:15:00', severity: 'high', category: 'market', message: 'Detected arbitrage opportunity in FOREX/CRYPTO bridge.', confidence: 0.98, actionable: true, relatedEntityId: 'algo-3' },
  { id: 'ins-2', timestamp: '2023-10-27 09:30:00', severity: 'medium', category: 'optimization', message: 'Algorithm "Alpha-1" logic can be compressed by 15%. Suggest refactor.', confidence: 0.85, actionable: true, relatedEntityId: 'algo-1' },
  { id: 'ins-3', timestamp: '2023-10-27 10:00:00', severity: 'low', category: 'system', message: 'Global latency reduced by 4ms via AI routing.', confidence: 0.99, actionable: false },
  { id: 'ins-4', timestamp: '2023-10-27 10:45:00', severity: 'critical', category: 'security', message: 'Anomalous login attempt blocked by Neural Firewall.', confidence: 0.99, actionable: false },
  { id: 'ins-5', timestamp: '2023-10-27 11:00:00', severity: 'medium', category: 'regulatory', message: 'New SEC filing detected for AAPL. Potential volatility increase.', confidence: 0.92, actionable: true },
];

const initialAlgorithms: Algorithm[] = [
  { 
    id: 'algo-1', 
    name: 'Quantum Momentum Scalper v4', 
    description: 'High-frequency scalping strategy utilizing quantum-inspired principles for momentum prediction.',
    tags: ['HFT', 'Scalping', 'Momentum', 'Quantum'],
    code: '{"nodes":["Input: L2 Market Data Stream", "Filter: Volatility > 1.5", "AI Model: Quantum Trend Predictor", "Logic: If confidence > 0.95", "Action: Buy/Sell 100 units"]}', 
    language: 'nocode',
    status: 'live', 
    version: 4,
    lastModified: '2023-10-26',
    author: 'System Admin',
    riskLevel: 'high',
    aiScore: 94,
    parameters: [
      { name: 'Volatility Threshold', type: 'number', value: 1.5, range: [0.5, 5], description: 'Minimum volatility to activate trading.' },
      { name: 'Trade Size', type: 'number', value: 100, range: [10, 1000], description: 'Number of units per trade.' }
    ],
    deploymentTarget: 'cloud-cluster-a',
    performanceMetrics: { pnl: 125000, return: 45.2, sharpe: 2.1, sortino: 2.8, alpha: 0.15, beta: 0.8, volatility: 12.5, winRate: 68, maxDrawdown: -8.2 },
    geinFactor: 0.98,
    interactionMatrix: [[1, 0.2, -0.1], [0.2, 1, 0.5], [-0.1, 0.5, 1]],
    dataPointSensitivity: { 'L2.bid_price': 0.8, 'L2.ask_price': 0.8, 'volatility': 0.9 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.95 }, 'quantum_core': { gein: 0.99, activation: 0.98 }, 'output': { gein: 1.0, activation: 0.96 } },
    executionPriority: 'quantum',
    computeProfile: 'gpu-accelerated',
    dataSources: ['L2 Market Data Stream', 'Global News Feed API'],
    dependencies: [{ name: 'quantum-tensor-lib', version: '2.5.1' }],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'Quantum Core Team',
    isAudited: true,
    auditHistory: [{ date: '2023-09-15', auditor: 'Internal Security', result: 'pass' }]
  },
  { 
    id: 'algo-2', 
    name: 'Mean Reversion HFT (Neural)', 
    description: 'Neural network-based strategy that capitalizes on short-term mean reversion in liquid assets.',
    tags: ['HFT', 'Mean Reversion', 'AI', 'Market Making'],
    code: '{"nodes":["Input: Order Book Depth", "AI: Sentiment Analysis (News Feeds)", "Logic: Spread > 0.02% AND Reversion Signal", "Action: Market Make (Bid/Ask)"]}', 
    language: 'nocode',
    status: 'backtesting', 
    version: 12,
    lastModified: '2023-10-27',
    author: 'AI Architect',
    riskLevel: 'medium',
    aiScore: 88,
    parameters: [
      { name: 'Spread Threshold', type: 'number', value: 0.02, range: [0.01, 0.1], description: 'Minimum bid-ask spread to engage.' },
      { name: 'Sentiment Weight', type: 'number', value: 0.3, range: [0, 1], description: 'Influence of news sentiment on trade logic.' }
    ],
    deploymentTarget: 'edge-node-tokyo',
    performanceMetrics: { pnl: 45000, return: 12.5, sharpe: 1.8, sortino: 1.9, alpha: 0.05, beta: 0.2, volatility: 4.2, winRate: 55, maxDrawdown: -4.1 },
    geinFactor: 0.85,
    interactionMatrix: [[1, 0.7], [0.7, 1]],
    dataPointSensitivity: { 'spread': 0.9, 'sentiment': 0.6 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.9 }, 'neural_net': { gein: 0.8, activation: 0.92 }, 'output': { gein: 1.0, activation: 0.88 } },
    executionPriority: 'high',
    computeProfile: 'cpu-bound',
    dataSources: ['Order Book Depth', 'News Feeds'],
    dependencies: [{ name: 'sentiment-analyzer', version: '4.2.0' }],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'AI Research',
    isAudited: true,
    auditHistory: [{ date: '2023-08-20', auditor: 'External Audit Co.', result: 'pass' }]
  },
  { 
    id: 'algo-3', 
    name: 'Global Macro Arbitrage', 
    description: 'Long-term strategy identifying and exploiting price discrepancies between correlated global assets.',
    tags: ['Macro', 'Arbitrage', 'Global', 'Low-Risk'],
    code: '{"nodes":["Input: Global Indices (S&P, FTSE, NIKKEI)", "Input: Forex Rates (USD, EUR, JPY)", "Logic: Correlation Divergence > 2-sigma", "Action: Hedge Pair Trade"]}', 
    language: 'nocode',
    status: 'draft', 
    version: 1,
    lastModified: '2023-10-27',
    author: 'User',
    riskLevel: 'low',
    aiScore: 72,
    parameters: [
      { name: 'Correlation Window', type: 'number', value: 90, range: [30, 365], description: 'Lookback period for correlation calculation (days).' },
      { name: 'Sigma Threshold', type: 'number', value: 2, range: [1, 3], description: 'Standard deviation for divergence signal.' }
    ],
    deploymentTarget: 'quantum-fabric-1',
    geinFactor: 0.7,
    interactionMatrix: [[1, 0.85, 0.7], [0.85, 1, 0.75], [0.7, 0.75, 1]],
    dataPointSensitivity: { 'correlation_divergence': 0.95 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.99 }, 'logic': { gein: 0.9, activation: 0.9 }, 'output': { gein: 1.0, activation: 0.92 } },
    executionPriority: 'normal',
    computeProfile: 'memory-bound',
    dataSources: ['Global Indices API', 'Forex Rates API'],
    dependencies: [],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'Macro Analysis Desk',
    isAudited: false,
    auditHistory: []
  },
];

const mockUserProfile: UserProfile = {
  id: 'u-001',
  name: 'Trader',
  role: 'Administrator',
  clearanceLevel: 5,
  email: 'admin@local',
  preferences: { theme: 'dark', notifications: 'all', aiAssistanceLevel: 'proactive', defaultView: 'Executive Dashboard' },
  apiKeys: [{ service: 'Binance', key: 'bin_..._xyz', lastUsed: '2023-10-27 10:30:00' }],
  security: {
    twoFactorEnabled: true,
    lastLogin: '2023-10-27 09:00:00',
    loginHistory: [{ timestamp: '2023-10-27 09:00:00', ip: '127.0.0.1', status: 'success' }]
  },
  stats: { loginCount: 1420, actionsPerformed: 54300, uptime: '99.99%', pnlContribution: 170000 }
};

// --- Expanded UI Components ---

const Button = ({ icon: Icon, children, onClick, variant = 'primary', disabled = false, className = '', size = 'md' }: any) => {
  const baseClasses = "flex items-center justify-center space-x-2 rounded-lg text-sm transition duration-200 ease-in-out font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";
  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  let colorClasses = "";

  switch (variant) {
    case 'primary': colorClasses = "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"; break;
    case 'secondary': colorClasses = "bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600 focus:ring-indigo-500 disabled:bg-gray-800 disabled:text-gray-500"; break;
    case 'danger': colorClasses = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400"; break;
    case 'success': colorClasses = "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400"; break;
    case 'ghost': colorClasses = "bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white disabled:text-gray-600 shadow-none"; break;
  }

  return (
    <button className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${colorClasses} ${className}`} onClick={onClick} disabled={disabled}>
      {Icon && <Icon className="w-4 h-4" />}
      {children && <span>{children}</span>}
    </button>
  );
};

const Card = ({ title, subtitle, children, className = '', actions = null, noPadding = false }: any) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-xl border border-gray-700 flex flex-col ${className}`}>
    {(title || actions) && (
      <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/30 rounded-t-xl">
        <div>
          <h3 className="text-lg font-bold text-gray-100">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
    )}
    <div className={`${noPadding ? '' : 'p-6'} flex-grow overflow-auto custom-scrollbar`}>
      {children}
    </div>
  </div>
);

// Use the imported Badge component
const StatusBadge = ({ color, children }: { color: string, children: React.ReactNode }) => {
    let variant: "default" | "secondary" | "destructive" | "outline" | "live" = "default";
    if (color === 'green') variant = "default"; 
    if (color === 'yellow') variant = "secondary";
    if (color === 'gray') variant = "outline";
    
    return <Badge variant={variant}>{children}</Badge>;
};

const ProgressBar = ({ value, max = 100, color = 'indigo', label }: any) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      {label && <span className="text-xs font-medium text-gray-300">{label}</span>}
      <span className="text-xs font-medium text-gray-400">{Math.round((value / max) * 100)}%</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <div className={`bg-gradient-to-r from-${color}-500 to-${color}-400 h-2.5 rounded-full transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

const Input = ({ label, type = 'text', value, onChange, placeholder, name }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
    </div>
);

const Select = ({ label, value, onChange, children, name }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
            {children}
        </select>
    </div>
);

const Tabs = ({ tabs, activeTab, setActiveTab }: { tabs: string[], activeTab: string, setActiveTab: (tab: string) => void }) => (
    <div className="border-b border-gray-700 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
            <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${
                            tab === activeTab
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    </div>
);

// --- Dashboard Widgets & Views ---

const AIStatusMonitor = () => {
  const stats = [
    { label: 'Quantum Core Load', value: 78, color: 'indigo' },
    { label: 'Global Latency', value: 8, max: 50, color: 'green' },
    { label: 'Predictive Accuracy', value: 98.2, color: 'purple' },
    { label: 'Neural Firewall Threat', value: 2, color: 'red' },
  ];

  return (
    <Card title="AI System Status" subtitle="Real-time Quantum Core Monitoring">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <ProgressBar key={idx} label={stat.label} value={stat.value} max={stat.max || 100} color={stat.color} />
        ))}
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Active AI Processes</h4>
        <div className="space-y-2 text-sm font-mono">
          {['Market Sentiment Analysis [PID: 2000]', 'Risk Vector Calculation [PID: 2015]', 'Liquidity Optimization [PID: 2030]', 'User Behavior Modeling [PID: 2045]', 'Regulatory Compliance Scan [PID: 2060]'].map((proc, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-700">
              <span className="flex items-center text-cyan-400"><Cpu className="w-4 h-4 mr-2 text-cyan-500"/>{proc}</span>
              <span className="text-gray-500">OK</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const GlobalMarketPulse = () => {
  const markets = [
    { name: 'S&P 500', price: '4,120.50', change: '+0.45%', sentiment: 'Bullish', volatility: 'Low' },
    { name: 'BTC/USD', price: '64,230.00', change: '+2.10%', sentiment: 'Very Bullish', volatility: 'High' },
    { name: 'EUR/USD', price: '1.0850', change: '-0.12%', sentiment: 'Neutral', volatility: 'Low' },
    { name: 'Gold', price: '1,980.20', change: '+0.80%', sentiment: 'Bullish', volatility: 'Medium' },
    { name: 'Crude Oil', price: '78.40', change: '-1.20%', sentiment: 'Bearish', volatility: 'Medium' },
    { name: '10Y Treasury', price: '4.50%', change: '+0.02%', sentiment: 'Neutral', volatility: 'Low' },
  ];

  return (
    <Card title="Global Market Pulse" subtitle="AI-Driven Sentiment & Pricing" noPadding>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Asset</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">AI Sentiment</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Volatility</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/30 divide-y divide-gray-700">
            {markets.map((m) => (
              <tr key={m.name} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{m.name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-300 font-mono">{m.price}</td>
                <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-bold ${m.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{m.change}</td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <Badge variant={m.sentiment.includes('Bullish') ? 'default' : m.sentiment.includes('Bearish') ? 'destructive' : 'secondary'}>{m.sentiment}</Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <Badge variant={m.volatility === 'High' ? 'destructive' : m.volatility === 'Medium' ? 'secondary' : 'outline'}>{m.volatility}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const NoCodeEditor = ({ algorithm, onUpdateCode }: { algorithm: Algorithm, onUpdateCode: (code: string) => void }) => {
  const [blocks, setBlocks] = useState<string[]>(() => {
    try { return JSON.parse(algorithm.code).nodes || []; } catch { return []; }
  });

  const handleAddBlock = (type: string) => {
    const newBlock = `${type}: ${type === 'AI' ? 'Neural Optimization' : 'New Logic Node'}`;
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    onUpdateCode(JSON.stringify({ nodes: newBlocks }));
  };

  const handleOptimize = () => {
    const optimized = blocks.map(b => b.includes('AI') ? b : `${b} (Optimized)`);
    setBlocks(optimized);
    onUpdateCode(JSON.stringify({ nodes: optimized }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700">
      <div className="p-3 border-b border-gray-700 bg-gray-800/50 rounded-t-lg flex flex-wrap gap-2">
        <Button icon={Database} onClick={() => handleAddBlock('Input')} variant="secondary" size="sm">Input</Button>
        <Button icon={TrendingUp} onClick={() => handleAddBlock('Indicator')} variant="secondary" size="sm">Indicator</Button>
        <Button icon={SlidersHorizontal} onClick={() => handleAddBlock('Logic')} variant="secondary" size="sm">Logic</Button>
        <Button icon={DollarSign} onClick={() => handleAddBlock('Action')} variant="secondary" size="sm">Action</Button>
        <div className="flex-grow"></div>
        <Button icon={Bot} onClick={handleOptimize} variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700">AI Auto-Optimize</Button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-3 custom-scrollbar">
        {blocks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Code className="w-12 h-12 mb-2 opacity-20" />
            <p>Use the toolbar to build your strategy.</p>
          </div>
        )}
        {blocks.map((block, index) => (
          <div key={index} className="group relative bg-gray-800 border border-indigo-900/50 p-4 rounded-lg shadow-sm hover:shadow-indigo-500/20 hover:shadow-lg transition-all flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-full absolute left-0 top-0 bottom-0 rounded-l-lg ${block.startsWith('Input') ? 'bg-blue-500' : block.startsWith('Action') ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
              <span className="font-mono text-sm text-gray-300 ml-2">{block}</span>
            </div>
            <X className="w-4 h-4 text-gray-600 cursor-pointer hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
              const newBlocks = blocks.filter((_, i) => i !== index);
              setBlocks(newBlocks);
              onUpdateCode(JSON.stringify({ nodes: newBlocks }));
            }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const AlgorithmParametersForm = ({ algorithm, onUpdate }: { algorithm: Algorithm, onUpdate: (params: AlgorithmParameter[]) => void }) => {
    const [params, setParams] = useState(algorithm.parameters);

    const handleChange = (index: number, value: any) => {
        const newParams = [...params];
        newParams[index].value = value;
        setParams(newParams);
    };

    const handleSave = () => {
        onUpdate(params);
    };

    return (
        <div className="p-6 space-y-6">
            {params.map((param, index) => (
                <div key={param.name}>
                    <label className="block text-sm font-medium text-gray-300">{param.name}</label>
                    <p className="text-xs text-gray-500 mb-2">{param.description}</p>
                    {param.type === 'number' && (
                        <input
                            type="number"
                            value={param.value}
                            onChange={(e) => handleChange(index, parseFloat(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                        />
                    )}
                    {/* Add other types like boolean, string etc. */}
                </div>
            ))}
            <div className="pt-4 border-t border-gray-700">
                <Button icon={Save} onClick={handleSave} variant="primary">Save Parameters</Button>
            </div>
        </div>
    );
};

const Backtester = ({ algorithm }: { algorithm: Algorithm }) => {
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [isBacktesting, setIsBacktesting] = useState(false);

  const handleRun = useCallback(() => {
    setIsBacktesting(true);
    setTimeout(() => {
      const newResult: BacktestResult = {
        runId: `bt-${Date.now()}`,
        algorithmId: algorithm.id,
        algorithmVersion: algorithm.version,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        initialCapital: 100000,
        finalCapital: 100000 * (1 + (Math.random() * 40 + 10) / 100),
        equityCurve: generateTimeSeries(50, 100000, 0.05),
        metrics: {
          totalReturn: parseFloat((Math.random() * 40 + 10).toFixed(2)),
          sharpeRatio: parseFloat((Math.random() * 2 + 1).toFixed(2)),
          maxDrawdown: parseFloat((-Math.random() * 15).toFixed(2)),
          trades: Math.floor(Math.random() * 500 + 100),
          profitFactor: parseFloat((Math.random() * 1 + 1.2).toFixed(2)),
          expectancy: parseFloat((Math.random() * 0.5).toFixed(2)),
          avgTradeReturn: parseFloat((Math.random() * 0.2).toFixed(2)),
        },
        parametersSnapshot: algorithm.parameters,
        aiAnalysis: "Strategy exhibits strong momentum characteristics but may be overfitted to Q2 volatility. Suggest increasing stop-loss buffer by 0.5% and testing against 2022 data.",
        tradeLog: []
      };
      setResults([newResult, ...results]);
      setIsBacktesting(false);
    }, 1500);
  }, [algorithm, results]);

  const latest = results[0];

  return (
    <Card title="Simulation & Deployment" subtitle="Hyper-Realistic Backtesting Engine">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
             <Button icon={Play} onClick={handleRun} disabled={isBacktesting} variant="primary" className="w-full" size="lg">
               {isBacktesting ? 'Running Simulation...' : 'Run Hyper-Simulation'}
             </Button>
          </div>
        </div>

        {latest && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-indigo-900/50 p-4 rounded-lg border border-indigo-700">
              <h4 className="font-bold text-indigo-300 flex items-center mb-2">
                <Bot className="w-4 h-4 mr-2" /> AI Analysis & Recommendations
              </h4>
              <p className="text-sm text-indigo-200 leading-relaxed">{latest.aiAnalysis}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Return', value: `+${latest.metrics.totalReturn}%`, color: 'text-green-400' },
                { label: 'Sharpe Ratio', value: latest.metrics.sharpeRatio, color: 'text-blue-400' },
                { label: 'Max Drawdown', value: `${latest.metrics.maxDrawdown}%`, color: 'text-red-400' },
                { label: 'Profit Factor', value: latest.metrics.profitFactor, color: 'text-purple-400' },
              ].map(m => (
                <div key={m.label} className="bg-gray-900/50 p-3 rounded border border-gray-700 shadow-sm">
                  <div className="text-xs text-gray-400 uppercase">{m.label}</div>
                  <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                </div>
              ))}
            </div>
            
            <div className="h-32 bg-gray-900/50 rounded border border-gray-700 flex items-end justify-between px-2 pb-2 overflow-hidden">
               {latest.equityCurve.map((pt, i) => (
                 <div key={i} className="w-1 bg-indigo-500 hover:bg-indigo-400 transition-colors" style={{ height: `${(pt.value / 150000) * 100}%` }} title={`Date: ${pt.date}, Val: ${pt.value.toFixed(2)}`}></div>
               ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const AlgoList = ({ algorithms, selectedAlgo, onSelect, onCreate }: any) => (
  <Card title="Strategy Portfolio" subtitle="Managed Algorithms" actions={<Button icon={Plus} onClick={onCreate} variant="secondary" size="sm">New</Button>} className="h-full" noPadding>
    <div className="p-4 border-b border-gray-700">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search strategies..." className="w-full bg-gray-900 border border-gray-600 rounded-md pl-9 pr-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
    </div>
    <div className="space-y-3 p-4 overflow-y-auto custom-scrollbar">
      {(algorithms as Algorithm[]).map((algo: Algorithm) => (
        <div
          key={algo.id}
          onClick={() => onSelect(algo)}
          className={`p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${selectedAlgo?.id === algo.id ? 'bg-indigo-900/50 border-indigo-500 shadow-lg shadow-indigo-900/50' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600'}`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-100">{algo.name}</h4>
            <Badge variant={algo.status === 'live' ? 'live' : algo.status === 'backtesting' ? 'secondary' : 'outline'}>{algo.status.toUpperCase()}</Badge>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>v{algo.version} &bull; {algo.author}</span>
            <span className="flex items-center text-indigo-400 font-semibold"><Bot className="w-3 h-3 mr-1" /> AI Score: {algo.aiScore}</span>
          </div>
          {algo.performanceMetrics && (
            <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-3 gap-2 text-xs">
              <div><span className="text-gray-500 block">Return</span><span className="font-medium text-green-400">+{algo.performanceMetrics.return}%</span></div>
              <div><span className="text-gray-500 block">Sharpe</span><span className="font-medium text-gray-300">{algo.performanceMetrics.sharpe}</span></div>
              <div><span className="text-gray-500 block">Win Rate</span><span className="font-medium text-gray-300">{algo.performanceMetrics.winRate}%</span></div>
            </div>
          )}
        </div>
      ))}
    </div>
  </Card>
);

// --- Navigation & Layout ---

const NAV_ITEMS = [
    { name: 'Executive Dashboard', icon: LayoutDashboard, category: 'Core' },
    { name: 'Algo-Trading Lab', icon: Code, category: 'Core', current: true },
    { name: 'Quantum Weaver AI', icon: BrainCircuit, category: 'Core' },
    { name: 'AI Financial Advisor', icon: Bot, category: 'Core' },
    { name: 'Advanced Charting', icon: BarChart2, category: 'Core' },
    { name: 'Market Scanner', icon: Search, category: 'Core' },
    { name: 'Gemini Thinking Console', icon: Sparkles, category: 'Gemini 2.5' },
    { name: 'Multimodal Input Analysis', icon: Eye, category: 'Gemini 2.5' },
    { name: 'Streaming Response Monitor', icon: Zap, category: 'Gemini 2.5' },
    { name: 'System Instruction Editor', icon: Terminal, category: 'Gemini 2.5' },
    { name: 'Chat History Explorer', icon: MessageSquare, category: 'Gemini 2.5' },
    { name: 'Global Transactions', icon: History, category: 'Treasury' },
    { name: 'Liquidity Transfer', icon: Send, category: 'Treasury' },
    { name: 'Budgetary Control', icon: Target, category: 'Treasury' },
    { name: 'Corporate Treasury', icon: Globe, category: 'Treasury' },
    { name: 'Modern Treasury API', icon: Key, category: 'Treasury' },
    { name: 'Strategic Goals', icon: Trophy, category: 'Strategy' },
    { name: 'Credit Health Monitor', icon: Heart, category: 'Strategy' },
    { name: 'Investment Portfolio', icon: Briefcase, category: 'Strategy' },
    { name: 'Venture Capital', icon: Rocket, category: 'Strategy' },
    { name: 'Private Equity', icon: Briefcase, category: 'Strategy' },
    { name: 'Mutual Fund Screener', icon: Filter, category: 'Strategy' },
    { name: 'ETF Hub', icon: PieChart, category: 'Strategy' },
    { name: 'Robo-Advisor Config', icon: Bot, category: 'Strategy' },
    { name: 'Web3 & Crypto Bridge', icon: Link, category: 'Markets' },
    { name: 'Forex Arbitrage Arena', icon: Scale, category: 'Markets' },
    { name: 'Commodities Exchange', icon: Wheat, category: 'Markets' },
    { name: 'Real Estate Empire', icon: Building, category: 'Markets' },
    { name: 'Art & NFT Vault', icon: Palette, category: 'Markets' },
    { name: 'Derivatives Desk', icon: PieChart, category: 'Markets' },
    { name: 'Options Chain', icon: Link, category: 'Markets' },
    { name: 'Futures Contracts', icon: FileText, category: 'Markets' },
    { name: 'Bond Analytics', icon: Scale, category: 'Markets' },
    { name: 'Dark Pool Routing', icon: Network, category: 'Markets' },
    { name: 'Exotic Derivatives', icon: Sparkles, category: 'Markets' },
    { name: 'Carbon Credit Trading', icon: Wheat, category: 'Markets' },
    { name: 'Tax Optimization AI', icon: Receipt, category: 'Finance' },
    { name: 'Legacy Planning', icon: BookOpen, category: 'Finance' },
    { name: 'Wealth Management', icon: Crown, category: 'Finance' },
    { name: 'Billing & Invoicing', icon: CreditCard, category: 'Finance' },
    { name: 'Expense Management', icon: Receipt, category: 'Finance' },
    { name: 'Capital Call Management', icon: Phone, category: 'Finance' },
    { name: 'Card Issuance (Marqeta)', icon: CreditCard, category: 'Integrations' },
    { name: 'Data Aggregation (Plaid)', icon: Link, category: 'Integrations' },
    { name: 'Payment Rails (Stripe)', icon: Zap, category: 'Integrations' },
    { name: 'Open Banking API', icon: Link, category: 'Integrations' },
    { name: 'Identity (SSO)', icon: Lock, category: 'Platform' },
    { name: 'Agent Marketplace', icon: Users, category: 'Platform' },
    { name: 'Ad Studio AI', icon: Megaphone, category: 'Platform' },
    { name: 'Card Customization', icon: CreditCard, category: 'Platform' },
    { name: 'DAO Governance', icon: Handshake, category: 'Platform' },
    { name: 'API Key Management', icon: Key, category: 'Platform' },
    { name: 'Webhook Subscriptions', icon: Send, category: 'Platform' },
    { name: 'System Status', icon: Activity, category: 'System' },
    { name: 'Security Center', icon: Shield, category: 'System' },
    { name: 'System Manifesto', icon: Eye, category: 'System' },
    { name: 'Audit Logs', icon: History, category: 'System' },
    { name: 'Disaster Recovery', icon: Server, category: 'System' },
    { name: 'Concierge', icon: Phone, category: 'Support' },
    { name: 'Philanthropy', icon: Heart, category: 'Support' },
    { name: 'Personalization', icon: Sparkles, category: 'Support' },
    { name: 'Knowledge Base', icon: BookOpen, category: 'Support' },
    { name: 'Live Chat Support', icon: MessageSquare, category: 'Support' },
    { name: 'Feature Requests', icon: Megaphone, category: 'Support' },
    { name: 'Risk Dashboard', icon: Shield, category: 'Risk Management' },
    { name: 'VaR Simulation', icon: BarChart2, category: 'Risk Management' },
    { name: 'Stress Testing', icon: Activity, category: 'Risk Management' },
    { name: 'Counterparty Risk', icon: Users, category: 'Risk Management' },
    { name: 'Credit Default Swaps', icon: FileText, category: 'Risk Management' },
    { name: 'Liquidity Risk', icon: LifeBuoy, category: 'Risk Management' },
    { name: 'Operational Risk', icon: SlidersHorizontal, category: 'Risk Management' },
    { name: 'Geopolitical Risk Map', icon: Globe, category: 'Risk Management' },
    { name: 'Model Risk Governance', icon: BrainCircuit, category: 'Risk Management' },
    { name: 'Compliance Hub', icon: CheckSquare, category: 'Compliance' },
    { name: 'Regulatory Reporting', icon: FileText, category: 'Compliance' },
    { name: 'Audit Trail', icon: History, category: 'Compliance' },
    { name: 'AML Monitoring', icon: Eye, category: 'Compliance' },
    { name: 'Trade Surveillance', icon: Search, category: 'Compliance' },
    { name: 'Policy Management', icon: BookOpen, category: 'Compliance' },
    { name: 'SEC Rule 15c3-5', icon: CheckSquare, category: 'Compliance' },
    { name: 'MiFID II Reporting', icon: FileText, category: 'Compliance' },
    { name: 'Data Lake Explorer', icon: Database, category: 'Data Science' },
    { name: 'Jupyter Notebooks', icon: BookOpen, category: 'Data Science' },
    { name: 'Model Training', icon: Cpu, category: 'Data Science' },
    { name: 'Feature Store', icon: HardDrive, category: 'Data Science' },
    { name: 'Data Visualization Lab', icon: BarChart2, category: 'Data Science' },
    { name: 'ETL Pipelines', icon: Repeat, category: 'Data Science' },
    { name: 'Alternative Data Hub', icon: HardDrive, category: 'Data Science' },
    { name: 'Cloud Infrastructure', icon: Cloud, category: 'Infrastructure' },
    { name: 'Network Topology', icon: Network, category: 'Infrastructure' },
    { name: 'Server Fleet Management', icon: Server, category: 'Infrastructure' },
    { name: 'CI/CD Pipelines', icon: GitBranch, category: 'Infrastructure' },
    { name: 'Terminal Access', icon: Terminal, category: 'Infrastructure' },
    { name: 'Quantum Fabric Status', icon: Atom, category: 'Infrastructure' },
    { name: 'Kubernetes Cluster', icon: Cloud, category: 'Infrastructure' },
    { name: 'Quarterly Reports', icon: PieChart, category: 'Reporting' },
    { name: 'Performance Attribution', icon: Trophy, category: 'Reporting' },
    { name: 'Client Statements', icon: Receipt, category: 'Reporting' },
    { name: 'P&L Analytics', icon: TrendingUp, category: 'Reporting' },
    { name: 'AUM Tracker', icon: DollarSign, category: 'Reporting' },
    { name: 'Investor Relations Portal', icon: Users, category: 'Client Relations' },
    { name: 'CRM Integration', icon: Handshake, category: 'Client Relations' },
    { name: 'Support Tickets', icon: LifeBuoy, category: 'Client Relations' },
    { name: 'Onboarding Wizard', icon: User, category: 'Client Relations' },
    { name: 'Global News Feed', icon: Globe, category: 'Market Intel' },
    { name: 'SEC Filings', icon: FileText, category: 'Market Intel' },
    { name: 'Social Media Sentiment', icon: Megaphone, category: 'Market Intel' },
    { name: 'Economic Calendar', icon: Calendar, category: 'Market Intel' },
    { name: 'Insider Trading Monitor', icon: Eye, category: 'Market Intel' },
    { name: 'Back Office Operations', icon: Briefcase, category: 'Operations' },
    { name: 'Settlements & Clearing', icon: CheckSquare, category: 'Operations' },
    { name: 'Corporate Actions', icon: Megaphone, 'category': 'Operations' },
    { name: 'Reconciliation Engine', icon: Repeat, category: 'Operations' },
    { name: 'Multi-Factor Auth', icon: Lock, category: 'Security' },
    { name: 'Intrusion Detection', icon: Shield, category: 'Security' },
    { name: 'Penetration Testing', icon: Target, category: 'Security' },
    { name: 'Bug Bounty Program', icon: Trophy, category: 'Security' },
];

const AppSidebar = ({ onNavigate, activeView }: any) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const groupedNavItems = useMemo(() => NAV_ITEMS.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, typeof NAV_ITEMS>), []);

    return (
        <div className={`h-full bg-gray-900 text-white flex flex-col transition-all duration-300 shadow-2xl z-20 ${isCollapsed ? 'w-20' : 'w-72'}`}>
            <div className="p-5 flex items-center justify-between border-b border-gray-800 bg-gray-900 h-16">
                {!isCollapsed && (
                  <div>
                    <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tighter">QUANTUM OS</h1>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase">High Frequency Trading</p>
                  </div>
                )}
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors" onClick={() => onNavigate("Profile")}>
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-gray-700">TR</div>
                    {!isCollapsed && (
                      <div className="overflow-hidden"><p className="text-sm font-bold text-gray-200 truncate">Trader</p><p className="text-xs text-green-400 flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span> Online</p></div>
                    )}
                </div>
            </div>

            <nav className="flex-grow overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {Object.entries(groupedNavItems).map(([category, items]: [string, typeof NAV_ITEMS]) => (
                    <div key={category}>
                        {!isCollapsed && <h3 className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{category}</h3>}
                        {items.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.name === activeView;
                            return (
                                <a key={item.name} href="#" onClick={(e) => { e.preventDefault(); onNavigate(item.name); }}
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                >
                                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                                    <span className={`ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{item.name}</span>
                                </a>
                            );
                        })}
                    </div>
                ))}
            </nav>
            
            <div className="p-4 border-t border-gray-800 bg-gray-900 text-xs text-gray-600 text-center">
              {!isCollapsed && "v12.8.1-Quantum | Secure Connection"}
            </div>
        </div>
    );
}

// --- Placeholder & Special Views ---

const AlgoTradingLab: React.FC = () => {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>(initialAlgorithms);
  const [selectedAlgo, setSelectedAlgo] = useState<Algorithm | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'editor' | 'backtest' | 'params'>('list');

  const handleSelectAlgo = (algo: Algorithm) => {
    setSelectedAlgo(algo);
    setViewMode('editor');
  };

  const handleCreateAlgo = () => {
    const newAlgo: Algorithm = {
      id: `algo-${Date.now()}`,
      name: 'New Strategy',
      description: 'Draft strategy',
      tags: ['Draft'],
      code: '{"nodes":[]}',
      language: 'nocode',
      status: 'draft',
      version: 1,
      lastModified: new Date().toISOString().split('T')[0],
      author: 'User',
      riskLevel: 'low',
      aiScore: 50,
      parameters: [],
      deploymentTarget: 'cloud-cluster-a',
      geinFactor: 0.5,
      interactionMatrix: [],
      dataPointSensitivity: {},
      layerMetrics: {},
      executionPriority: 'normal',
      computeProfile: 'cpu-bound',
      dataSources: [],
      dependencies: [],
      permissions: [],
      ownerTeam: 'User',
      isAudited: false,
      auditHistory: []
    };
    setAlgorithms([...algorithms, newAlgo]);
    setSelectedAlgo(newAlgo);
    setViewMode('editor');
  };

  const updateAlgoCode = (code: string) => {
    if (selectedAlgo) {
      const updated = { ...selectedAlgo, code, lastModified: new Date().toISOString().split('T')[0] };
      setAlgorithms(algorithms.map(a => a.id === selectedAlgo.id ? updated : a));
      setSelectedAlgo(updated);
    }
  };

  const updateAlgoParams = (params: AlgorithmParameter[]) => {
    if (selectedAlgo) {
      const updated = { ...selectedAlgo, parameters: params, lastModified: new Date().toISOString().split('T')[0] };
      setAlgorithms(algorithms.map(a => a.id === selectedAlgo.id ? updated : a));
      setSelectedAlgo(updated);
    }
  };

  return (
    <div className="flex h-full space-x-6 p-6 bg-gray-900 min-h-screen text-white">
      <div className="w-1/4 min-w-[300px]">
        <AlgoList 
            algorithms={algorithms} 
            selectedAlgo={selectedAlgo} 
            onSelect={handleSelectAlgo} 
            onCreate={handleCreateAlgo}
        />
      </div>
      <div className="flex-grow flex flex-col space-y-6">
        {selectedAlgo ? (
          <Card title={selectedAlgo.name} subtitle={`${selectedAlgo.language.toUpperCase()} | v${selectedAlgo.version}`} 
            actions={
              <>
                <Button variant={viewMode === 'editor' ? 'primary' : 'ghost'} onClick={() => setViewMode('editor')} size="sm">Editor</Button>
                <Button variant={viewMode === 'params' ? 'primary' : 'ghost'} onClick={() => setViewMode('params')} size="sm">Params</Button>
                <Button variant={viewMode === 'backtest' ? 'primary' : 'ghost'} onClick={() => setViewMode('backtest')} size="sm">Simulate</Button>
              </>
            }
          >
            <div className="h-[600px]">
              {viewMode === 'editor' && <NoCodeEditor algorithm={selectedAlgo} onUpdateCode={updateAlgoCode} />}
              {viewMode === 'params' && <AlgorithmParametersForm algorithm={selectedAlgo} onUpdate={updateAlgoParams} />}
              {viewMode === 'backtest' && <Backtester algorithm={selectedAlgo} />}
            </div>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <Code className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <h2 className="text-2xl font-bold mb-2">Select a Strategy</h2>
              <p>Choose an algorithm from the list or create a new one to begin.</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-6">
             <AIStatusMonitor />
             <div className="col-span-2">
                <GlobalMarketPulse />
             </div>
        </div>
      </div>
    </div>
  );
};

export default AlgoTradingLab;


// --- CONSOLIDATED FROM: AlgoTradingLab (2).tsx ---

import React, { useState, useCallback, useMemo, FormEvent, ChangeEvent } from 'react';
import { RefreshCw, Play, Save, History, Code, Settings, TrendingUp, DollarSign, X, User, LogOut, Plus } from 'lucide-react';
import axios from 'axios';

// =================================================================================
// API Settings Component - Data Interface
// =================================================================================
interface ApiKeysState {
  // === Tech APIs ===
  // Core Infrastructure & Cloud
  STRIPE_SECRET_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  SENDGRID_API_KEY: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AZURE_CLIENT_ID: string;
  AZURE_CLIENT_SECRET: string;
  GOOGLE_CLOUD_API_KEY: string;

  // Deployment & DevOps
  DOCKER_HUB_USERNAME: string;
  DOCKER_HUB_ACCESS_TOKEN: string;
  HEROKU_API_KEY: string;
  NETLIFY_PERSONAL_ACCESS_TOKEN: string;
  VERCEL_API_TOKEN: string;
  CLOUDFLARE_API_TOKEN: string;
  DIGITALOCEAN_PERSONAL_ACCESS_TOKEN: string;
  LINODE_PERSONAL_ACCESS_TOKEN: string;
  TERRAFORM_API_TOKEN: string;

  // Collaboration & Productivity
  GITHUB_PERSONAL_ACCESS_TOKEN: string;
  SLACK_BOT_TOKEN: string;
  DISCORD_BOT_TOKEN: string;
  TRELLO_API_KEY: string;
  TRELLO_API_TOKEN: string;
  JIRA_USERNAME: string;
  JIRA_API_TOKEN: string;
  ASANA_PERSONAL_ACCESS_TOKEN: string;
  NOTION_API_KEY: string;
  AIRTABLE_API_KEY: string;

  // File & Data Storage
  DROPBOX_ACCESS_TOKEN: string;
  BOX_DEVELOPER_TOKEN: string;
  GOOGLE_DRIVE_API_KEY: string;
  ONEDRIVE_CLIENT_ID: string;

  // CRM & Business
  SALESFORCE_CLIENT_ID: string;
  SALESFORCE_CLIENT_SECRET: string;
  HUBSPOT_API_KEY: string;
  ZENDESK_API_TOKEN: string;
  INTERCOM_ACCESS_TOKEN: string;
  MAILCHIMP_API_KEY: string;

  // E-commerce
  SHOPIFY_API_KEY: string;
  SHOPIFY_API_SECRET: string;
  BIGCOMMERCE_ACCESS_TOKEN: string;
  MAGENTO_ACCESS_TOKEN: string;
  WOOCOMMERCE_CLIENT_KEY: string;
  WOOCOMMERCE_CLIENT_SECRET: string;
  
  // Authentication & Identity
  STYTCH_PROJECT_ID: string;
  STYTCH_SECRET: string;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  OKTA_DOMAIN: string;
  OKTA_API_TOKEN: string;

  // Backend & Databases
  FIREBASE_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;

  // API Development
  POSTMAN_API_KEY: string;
  APOLLO_GRAPH_API_KEY: string;

  // AI & Machine Learning
  OPENAI_API_KEY: string;
  HUGGING_FACE_API_TOKEN: string;
  GOOGLE_CLOUD_AI_API_KEY: string;
  AMAZON_REKOGNITION_ACCESS_KEY: string;
  MICROSOFT_AZURE_COGNITIVE_KEY: string;
  IBM_WATSON_API_KEY: string;

  // Search & Real-time
  ALGOLIA_APP_ID: string;
  ALGOLIA_ADMIN_API_KEY: string;
  PUSHER_APP_ID: string;
  PUSHER_KEY: string;
  PUSHER_SECRET: string;
  ABLY_API_KEY: string;
  ELASTICSEARCH_API_KEY: string;
  
  // Identity & Verification
  STRIPE_IDENTITY_SECRET_KEY: string;
  ONFIDO_API_TOKEN: string;
  CHECKR_API_KEY: string;
  
  // Logistics & Shipping
  LOB_API_KEY: string;
  EASYPOST_API_KEY: string;
  SHIPPO_API_TOKEN: string;

  // Maps & Weather
  GOOGLE_MAPS_API_KEY: string;
  MAPBOX_ACCESS_TOKEN: string;
  HERE_API_KEY: string;
  ACCUWEATHER_API_KEY: string;
  OPENWEATHERMAP_API_KEY: string;

  // Social & Media
  YELP_API_KEY: string;
  FOURSQUARE_API_KEY: string;
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_SECRET: string;
  TWITTER_BEARER_TOKEN: string;
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
  INSTAGRAM_APP_ID: string;
  INSTAGRAM_APP_SECRET: string;
  YOUTUBE_DATA_API_KEY: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SOUNDCLOUD_CLIENT_ID: string;
  TWITCH_CLIENT_ID: string;
  TWITCH_CLIENT_SECRET: string;

  // Media & Content
  MUX_TOKEN_ID: string;
  MUX_TOKEN_SECRET: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  IMGIX_API_KEY: string;
  
  // Legal & Admin
  STRIPE_ATLAS_API_KEY: string;
  CLERKY_API_KEY: string;
  DOCUSIGN_INTEGRATOR_KEY: string;
  HELLOSIGN_API_KEY: string;
  
  // Monitoring & CI/CD
  LAUNCHDARKLY_SDK_KEY: string;
  SENTRY_AUTH_TOKEN: string;
  DATADOG_API_KEY: string;
  NEW_RELIC_API_KEY: string;
  CIRCLECI_API_TOKEN: string;
  TRAVIS_CI_API_TOKEN: string;
  BITBUCKET_USERNAME: string;
  BITBUCKET_APP_PASSWORD: string;
  GITLAB_PERSONAL_ACCESS_TOKEN: string;
  PAGERDUTY_API_KEY: string;
  
  // Headless CMS
  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_ACCESS_TOKEN: string;
  SANITY_PROJECT_ID: string;
  SANITY_API_TOKEN: string;
  STRAPI_API_TOKEN: string;

  // === Banking & Finance APIs ===
  // Data Aggregators
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  YODLEE_CLIENT_ID: string;
  YODLEE_SECRET: string;
  MX_CLIENT_ID: string;
  MX_API_KEY: string;
  FINICITY_PARTNER_ID: string;
  FINICITY_APP_KEY: string;

  // Payment Processing
  ADYEN_API_KEY: string;
  ADYEN_MERCHANT_ACCOUNT: string;
  BRAINTREE_MERCHANT_ID: string;
  BRAINTREE_PUBLIC_KEY: string;
  BRAINTREE_PRIVATE_KEY: string;
  SQUARE_APPLICATION_ID: string;
  SQUARE_ACCESS_TOKEN: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_SECRET: string;
  DWOLLA_KEY: string;
  DWOLLA_SECRET: string;
  WORLDPAY_API_KEY: string;
  CHECKOUT_SECRET_KEY: string;
  
  // Banking as a Service (BaaS) & Card Issuing
  MARQETA_APPLICATION_TOKEN: string;
  MARQETA_ADMIN_ACCESS_TOKEN: string;
  GALILEO_API_LOGIN: string;
  GALILEO_API_TRANS_KEY: string;
  SOLARISBANK_CLIENT_ID: string;
  SOLARISBANK_CLIENT_SECRET: string;
  SYNAPSE_CLIENT_ID: string;
  SYNAPSE_CLIENT_SECRET: string;
  RAILSBANK_API_KEY: string;
  CLEARBANK_API_KEY: string;
  UNIT_API_TOKEN: string;
  TREASURY_PRIME_API_KEY: string;
  INCREASE_API_KEY: string;
  MERCURY_API_KEY: string;
  BREX_API_KEY: string;
  BOND_API_KEY: string;
  
  // International Payments
  CURRENCYCLOUD_LOGIN_ID: string;
  CURRENCYCLOUD_API_KEY: string;
  OFX_API_KEY: string;
  WISE_API_TOKEN: string;
  REMITLY_API_KEY: string;
  AZIMO_API_KEY: string;
  NIUM_API_KEY: string;
  
  // Investment & Market Data
  ALPACA_API_KEY_ID: string;
  ALPACA_SECRET_KEY: string;
  TRADIER_ACCESS_TOKEN: string;
  IEX_CLOUD_API_TOKEN: string;
  POLYGON_API_KEY: string;
  FINNHUB_API_KEY: string;
  ALPHA_VANTAGE_API_KEY: string;
  MORNINGSTAR_API_KEY: string;
  XIGNITE_API_TOKEN: string;
  DRIVEWEALTH_API_KEY: string;

  // Crypto
  COINBASE_API_KEY: string;
  COINBASE_API_SECRET: string;
  BINANCE_API_KEY: string;
  BINANCE_API_SECRET: string;
  KRAKEN_API_KEY: string;
  KRAKEN_PRIVATE_KEY: string;
  GEMINI_API_KEY: string;
  GEMINI_API_SECRET: string;
  COINMARKETCAP_API_KEY: string;
  COINGECKO_API_KEY: string;
  BLOCKIO_API_KEY: string;

  // Major Banks (Open Banking)
  JP_MORGAN_CHASE_CLIENT_ID: string;
  CITI_CLIENT_ID: string;
  WELLS_FARGO_CLIENT_ID: string;
  CAPITAL_ONE_CLIENT_ID: string;

  // European & Global Banks (Open Banking)
  HSBC_CLIENT_ID: string;
  BARCLAYS_CLIENT_ID: string;
  BBVA_CLIENT_ID: string;
  DEUTSCHE_BANK_API_KEY: string;

  // UK & European Aggregators
  TINK_CLIENT_ID: string;
  TRUELAYER_CLIENT_ID: string;

  // Compliance & Identity (KYC/AML)
  MIDDESK_API_KEY: string;
  ALLOY_API_TOKEN: string;
  ALLOY_API_SECRET: string;
  COMPLYADVANTAGE_API_KEY: string;

  // Real Estate
  ZILLOW_API_KEY: string;
  CORELOGIC_CLIENT_ID: string;

  // Credit Bureaus
  EXPERIAN_API_KEY: string;
  EQUIFAX_API_KEY: string;
  TRANSUNION_API_KEY: string;

  // Global Payments (Emerging Markets)
  FINCRA_API_KEY: string;
  FLUTTERWAVE_SECRET_KEY: string;
  PAYSTACK_SECRET_KEY: string;
  DLOCAL_API_KEY: string;
  RAPYD_ACCESS_KEY: string;
  
  // Accounting & Tax
  TAXJAR_API_KEY: string;
  AVALARA_API_KEY: string;
  CODAT_API_KEY: string;
  XERO_CLIENT_ID: string;
  XERO_CLIENT_SECRET: string;
  QUICKBOOKS_CLIENT_ID: string;
  QUICKBOOKS_CLIENT_SECRET: string;
  FRESHBOOKS_API_KEY: string;
  
  // Fintech Utilities
  ANVIL_API_KEY: string;
  MOOV_CLIENT_ID: string;
  MOOV_SECRET: string;
  VGS_USERNAME: string;
  VGS_PASSWORD: string;
  SILA_APP_HANDLE: string;
  SILA_PRIVATE_KEY: string;
  
  [key: string]: string; // Index signature for dynamic access
}


// =================================================================================
// API Settings Component - UI & Logic
// =================================================================================
const ApiSettings: React.FC = () => {
  // Initialize state with undefined values to ensure all fields are controlled
  const [keys, setKeys] = useState<Partial<ApiKeysState>>({});
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tech' | 'banking'>('tech');

  // Fetch existing keys on component mount (implementation requires a backend endpoint)
  React.useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/get-keys'); // Assuming this endpoint exists
        setKeys(response.data.keys || {});
      } catch (error) {
        console.error("Failed to fetch keys:", error);
        setStatusMessage("Could not load existing keys. Please ensure the backend is running.");
      }
    };
    fetchKeys();
  }, []);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Saving keys securely to backend...');
    try {
      // NOTE: In a production system, sensitive keys should be stored securely (e.g., AWS Secrets Manager, HashiCorp Vault)
      // and this endpoint should handle that securely. Client-side storage of secrets is not recommended.
      const response = await axios.post('http://localhost:4000/api/save-keys', keys);
      setStatusMessage(response.data.message);
    } catch (error) {
      console.error("Error saving keys:", error);
      setStatusMessage('Error: Could not save keys. Please check backend server and logs.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="mb-4">
      <label htmlFor={keyName} className="block font-semibold text-sm text-gray-700 mb-2">{label}</label>
      <input
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
        className="w-full p-2 border border-gray-300 rounded-md text-sm transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      />
    </div>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
      <div className="mb-8 pb-8 border-b border-gray-200 last:border-b-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              {children}
          </div>
      </div>
  );

  return (
    <div className="bg-white shadow-xl rounded-xl border border-gray-100 h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
        <h1 className="text-lg font-bold text-gray-900">API Credentials Console</h1>
        <p className="text-xs text-gray-500 mt-0.5">Securely manage credentials for all integrated services.</p>
      </div>
      
      <div className="px-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('tech')} 
          className={`py-3 px-1 mr-6 border-b-2 text-sm font-medium transition-colors ${activeTab === 'tech' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Tech APIs
        </button>
        <button 
          onClick={() => setActiveTab('banking')} 
          className={`py-3 px-1 mr-6 border-b-2 text-sm font-medium transition-colors ${activeTab === 'banking' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Banking & Finance APIs
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow p-6 overflow-y-auto custom-scrollbar">
        {activeTab === 'tech' ? (
          <>
            {renderSection('Core Infrastructure & Cloud', <>
              {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key')}
              {renderInput('TWILIO_ACCOUNT_SID', 'Twilio Account SID')}
              {renderInput('TWILIO_AUTH_TOKEN', 'Twilio Auth Token')}
              {renderInput('SENDGRID_API_KEY', 'SendGrid API Key')}
              {renderInput('AWS_ACCESS_KEY_ID', 'AWS Access Key ID')}
              {renderInput('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key')}
              {renderInput('AZURE_CLIENT_ID', 'Azure Client ID')}
              {renderInput('AZURE_CLIENT_SECRET', 'Azure Client Secret')}
              {renderInput('GOOGLE_CLOUD_API_KEY', 'Google Cloud API Key')}
            </>)}
            {renderSection('Deployment & DevOps', <>
              {renderInput('DOCKER_HUB_USERNAME', 'Docker Hub Username')}
              {renderInput('DOCKER_HUB_ACCESS_TOKEN', 'Docker Hub Access Token')}
              {renderInput('HEROKU_API_KEY', 'Heroku API Key')}
              {renderInput('NETLIFY_PERSONAL_ACCESS_TOKEN', 'Netlify PAT')}
              {renderInput('VERCEL_API_TOKEN', 'Vercel API Token')}
              {renderInput('CLOUDFLARE_API_TOKEN', 'Cloudflare API Token')}
              {renderInput('DIGITALOCEAN_PERSONAL_ACCESS_TOKEN', 'DigitalOcean PAT')}
              {renderInput('LINODE_PERSONAL_ACCESS_TOKEN', 'Linode PAT')}
              {renderInput('TERRAFORM_API_TOKEN', 'Terraform API Token')}
            </>)}
            {renderSection('Collaboration & Productivity', <>
                {renderInput('GITHUB_PERSONAL_ACCESS_TOKEN', 'GitHub PAT')}
                {renderInput('SLACK_BOT_TOKEN', 'Slack Bot Token')}
                {renderInput('DISCORD_BOT_TOKEN', 'Discord Bot Token')}
                {renderInput('TRELLO_API_KEY', 'Trello API Key')}
                {renderInput('TRELLO_API_TOKEN', 'Trello API Token')}
                {renderInput('JIRA_USERNAME', 'Jira Username')}
                {renderInput('JIRA_API_TOKEN', 'Jira API Token')}
                {renderInput('ASANA_PERSONAL_ACCESS_TOKEN', 'Asana PAT')}
                {renderInput('NOTION_API_KEY', 'Notion API Key')}
                {renderInput('AIRTABLE_API_KEY', 'Airtable API Key')}
            </>)}
            {renderSection('File & Data Storage', <>
                {renderInput('DROPBOX_ACCESS_TOKEN', 'Dropbox Access Token')}
                {renderInput('BOX_DEVELOPER_TOKEN', 'Box Developer Token')}
                {renderInput('GOOGLE_DRIVE_API_KEY', 'Google Drive API Key')}
                {renderInput('ONEDRIVE_CLIENT_ID', 'OneDrive Client ID')}
            </>)}
            {renderSection('CRM & Business', <>
                {renderInput('SALESFORCE_CLIENT_ID', 'Salesforce Client ID')}
                {renderInput('SALESFORCE_CLIENT_SECRET', 'Salesforce Client Secret')}
                {renderInput('HUBSPOT_API_KEY', 'HubSpot API Key')}
                {renderInput('ZENDESK_API_TOKEN', 'Zendesk API Token')}
                {renderInput('INTERCOM_ACCESS_TOKEN', 'Intercom Access Token')}
                {renderInput('MAILCHIMP_API_KEY', 'Mailchimp API Key')}
            </>)}
            {renderSection('E-commerce', <>
                {renderInput('SHOPIFY_API_KEY', 'Shopify API Key')}
                {renderInput('SHOPIFY_API_SECRET', 'Shopify API Secret')}
                {renderInput('BIGCOMMERCE_ACCESS_TOKEN', 'BigCommerce Access Token')}
                {renderInput('MAGENTO_ACCESS_TOKEN', 'Magento Access Token')}
                {renderInput('WOOCOMMERCE_CLIENT_KEY', 'WooCommerce Client Key')}
                {renderInput('WOOCOMMERCE_CLIENT_SECRET', 'WooCommerce Client Secret')}
            </>)}
            {renderSection('Authentication & Identity', <>
                {renderInput('STYTCH_PROJECT_ID', 'Stytch Project ID')}
                {renderInput('STYTCH_SECRET', 'Stytch Secret')}
                {renderInput('AUTH0_DOMAIN', 'Auth0 Domain')}
                {renderInput('AUTH0_CLIENT_ID', 'Auth0 Client ID')}
                {renderInput('AUTH0_CLIENT_SECRET', 'Auth0 Client Secret')}
                {renderInput('OKTA_DOMAIN', 'Okta Domain')}
                {renderInput('OKTA_API_TOKEN', 'Okta API Token')}
            </>)}
            {renderSection('Backend & Databases', <>
                {renderInput('FIREBASE_API_KEY', 'Firebase API Key')}
                {renderInput('SUPABASE_URL', 'Supabase URL')}
                {renderInput('SUPABASE_ANON_KEY', 'Supabase Anon Key')}
            </>)}
            {renderSection('API Development', <>
                {renderInput('POSTMAN_API_KEY', 'Postman API Key')}
                {renderInput('APOLLO_GRAPH_API_KEY', 'Apollo Graph API Key')}
            </>)}
            {renderSection('AI & Machine Learning', <>
                {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
                {renderInput('HUGGING_FACE_API_TOKEN', 'Hugging Face API Token')}
                {renderInput('GOOGLE_CLOUD_AI_API_KEY', 'Google Cloud AI API Key')}
                {renderInput('AMAZON_REKOGNITION_ACCESS_KEY', 'Amazon Rekognition Access Key')}
                {renderInput('MICROSOFT_AZURE_COGNITIVE_KEY', 'Azure Cognitive Services Key')}
                {renderInput('IBM_WATSON_API_KEY', 'IBM Watson API Key')}
            </>)}
            {renderSection('Search & Real-time', <>
              {renderInput('ALGOLIA_APP_ID', 'Algolia App ID')}
              {renderInput('ALGOLIA_ADMIN_API_KEY', 'Algolia Admin API Key')}
              {renderInput('PUSHER_APP_ID', 'Pusher App ID')}
              {renderInput('PUSHER_KEY', 'Pusher Key')}
              {renderInput('PUSHER_SECRET', 'Pusher Secret')}
              {renderInput('ABLY_API_KEY', 'Ably API Key')}
              {renderInput('ELASTICSEARCH_API_KEY', 'Elasticsearch API Key')}
            </>)}
            {renderSection('Identity & Verification', <>
              {renderInput('STRIPE_IDENTITY_SECRET_KEY', 'Stripe Identity Secret Key')}
              {renderInput('ONFIDO_API_TOKEN', 'Onfido API Token')}
              {renderInput('CHECKR_API_KEY', 'Checkr API Key')}
            </>)}
            {renderSection('Logistics & Shipping', <>
              {renderInput('LOB_API_KEY', 'Lob API Key')}
              {renderInput('EASYPOST_API_KEY', 'EasyPost API Key')}
              {renderInput('SHIPPO_API_TOKEN', 'Shippo API Token')}
            </>)}
            {renderSection('Maps & Weather', <>
              {renderInput('GOOGLE_MAPS_API_KEY', 'Google Maps API Key')}
              {renderInput('MAPBOX_ACCESS_TOKEN', 'Mapbox Access Token')}
              {renderInput('HERE_API_KEY', 'HERE API Key')}
              {renderInput('ACCUWEATHER_API_KEY', 'AccuWeather API Key')}
              {renderInput('OPENWEATHERMAP_API_KEY', 'OpenWeatherMap API Key')}
            </>)}
            {renderSection('Social & Media', <>
              {renderInput('YELP_API_KEY', 'Yelp API Key')}
              {renderInput('FOURSQUARE_API_KEY', 'Foursquare API Key')}
              {renderInput('REDDIT_CLIENT_ID', 'Reddit Client ID')}
              {renderInput('REDDIT_CLIENT_SECRET', 'Reddit Client Secret')}
              {renderInput('TWITTER_BEARER_TOKEN', 'Twitter Bearer Token')}
              {renderInput('FACEBOOK_APP_ID', 'Facebook App ID')}
              {renderInput('FACEBOOK_APP_SECRET', 'Facebook App Secret')}
              {renderInput('INSTAGRAM_APP_ID', 'Instagram App ID')}
              {renderInput('INSTAGRAM_APP_SECRET', 'Instagram App Secret')}
              {renderInput('YOUTUBE_DATA_API_KEY', 'YouTube Data API Key')}
              {renderInput('SPOTIFY_CLIENT_ID', 'Spotify Client ID')}
              {renderInput('SPOTIFY_CLIENT_SECRET', 'Spotify Client Secret')}
              {renderInput('SOUNDCLOUD_CLIENT_ID', 'SoundCloud Client ID')}
              {renderInput('TWITCH_CLIENT_ID', 'Twitch Client ID')}
              {renderInput('TWITCH_CLIENT_SECRET', 'Twitch Client Secret')}
            </>)}
            {renderSection('Media & Content', <>
              {renderInput('MUX_TOKEN_ID', 'Mux Token ID')}
              {renderInput('MUX_TOKEN_SECRET', 'Mux Token Secret')}
              {renderInput('CLOUDINARY_API_KEY', 'Cloudinary API Key')}
              {renderInput('CLOUDINARY_API_SECRET', 'Cloudinary API Secret')}
              {renderInput('IMGIX_API_KEY', 'Imgix API Key')}
            </>)}
            {renderSection('Legal & Admin', <>
              {renderInput('STRIPE_ATLAS_API_KEY', 'Stripe Atlas API Key')}
              {renderInput('CLERKY_API_KEY', 'Clerky API Key')}
              {renderInput('DOCUSIGN_INTEGRATOR_KEY', 'DocuSign Integrator Key')}
              {renderInput('HELLOSIGN_API_KEY', 'HelloSign API Key')}
            </>)}
            {renderSection('Monitoring & CI/CD', <>
              {renderInput('LAUNCHDARKLY_SDK_KEY', 'LaunchDarkly SDK Key')}
              {renderInput('SENTRY_AUTH_TOKEN', 'Sentry Auth Token')}
              {renderInput('DATADOG_API_KEY', 'Datadog API Key')}
              {renderInput('NEW_RELIC_API_KEY', 'New Relic API Key')}
              {renderInput('CIRCLECI_API_TOKEN', 'CircleCI API Token')}
              {renderInput('TRAVIS_CI_API_TOKEN', 'Travis CI API Token')}
              {renderInput('BITBUCKET_USERNAME', 'Bitbucket Username')}
              {renderInput('BITBUCKET_APP_PASSWORD', 'Bitbucket App Password')}
              {renderInput('GITLAB_PERSONAL_ACCESS_TOKEN', 'GitLab PAT')}
              {renderInput('PAGERDUTY_API_KEY', 'PagerDuty API Key')}
            </>)}
            {renderSection('Headless CMS', <>
              {renderInput('CONTENTFUL_SPACE_ID', 'Contentful Space ID')}
              {renderInput('CONTENTFUL_ACCESS_TOKEN', 'Contentful Access Token')}
              {renderInput('SANITY_PROJECT_ID', 'Sanity Project ID')}
              {renderInput('SANITY_API_TOKEN', 'Sanity API Token')}
              {renderInput('STRAPI_API_TOKEN', 'Strapi API Token')}
            </>)}
          </>
        ) : (
          <>
            {renderSection('Data Aggregators', <>
              {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
              {renderInput('PLAID_SECRET', 'Plaid Secret')}
              {renderInput('YODLEE_CLIENT_ID', 'Yodlee Client ID')}
              {renderInput('YODLEE_SECRET', 'Yodlee Secret')}
              {renderInput('MX_CLIENT_ID', 'MX Client ID')}
              {renderInput('MX_API_KEY', 'MX API Key')}
              {renderInput('FINICITY_PARTNER_ID', 'Finicity Partner ID')}
              {renderInput('FINICITY_APP_KEY', 'Finicity App Key')}
            </>)}
            {renderSection('Payment Processing', <>
                {renderInput('ADYEN_API_KEY', 'Adyen API Key')}
                {renderInput('ADYEN_MERCHANT_ACCOUNT', 'Adyen Merchant Account')}
                {renderInput('BRAINTREE_MERCHANT_ID', 'Braintree Merchant ID')}
                {renderInput('BRAINTREE_PUBLIC_KEY', 'Braintree Public Key')}
                {renderInput('BRAINTREE_PRIVATE_KEY', 'Braintree Private Key')}
                {renderInput('SQUARE_APPLICATION_ID', 'Square Application ID')}
                {renderInput('SQUARE_ACCESS_TOKEN', 'Square Access Token')}
                {renderInput('PAYPAL_CLIENT_ID', 'PayPal Client ID')}
                {renderInput('PAYPAL_SECRET', 'PayPal Secret')}
                {renderInput('DWOLLA_KEY', 'Dwolla Key')}
                {renderInput('DWOLLA_SECRET', 'Dwolla Secret')}
                {renderInput('WORLDPAY_API_KEY', 'Worldpay API Key')}
                {renderInput('CHECKOUT_SECRET_KEY', 'Checkout.com Secret Key')}
            </>)}
            {renderSection('Banking as a Service (BaaS) & Card Issuing', <>
                {renderInput('MARQETA_APPLICATION_TOKEN', 'Marqeta Application Token')}
                {renderInput('MARQETA_ADMIN_ACCESS_TOKEN', 'Marqeta Admin Access Token')}
                {renderInput('GALILEO_API_LOGIN', 'Galileo API Login')}
                {renderInput('GALILEO_API_TRANS_KEY', 'Galileo API Trans Key')}
                {renderInput('SOLARISBANK_CLIENT_ID', 'Solarisbank Client ID')}
                {renderInput('SOLARISBANK_CLIENT_SECRET', 'Solarisbank Client Secret')}
                {renderInput('SYNAPSE_CLIENT_ID', 'Synapse Client ID')}
                {renderInput('SYNAPSE_CLIENT_SECRET', 'Synapse Client Secret')}
                {renderInput('RAILSBANK_API_KEY', 'Railsbank API Key')}
                {renderInput('CLEARBANK_API_KEY', 'ClearBank API Key')}
                {renderInput('UNIT_API_TOKEN', 'Unit API Token')}
                {renderInput('TREASURY_PRIME_API_KEY', 'Treasury Prime API Key')}
                {renderInput('INCREASE_API_KEY', 'Increase API Key')}
                {renderInput('MERCURY_API_KEY', 'Mercury API Key')}
                {renderInput('BREX_API_KEY', 'Brex API Key')}
                {renderInput('BOND_API_KEY', 'Bond API Key')}
            </>)}
            {renderSection('International Payments', <>
                {renderInput('CURRENCYCLOUD_LOGIN_ID', 'Currencycloud Login ID')}
                {renderInput('CURRENCYCLOUD_API_KEY', 'Currencycloud API Key')}
                {renderInput('OFX_API_KEY', 'OFX API Key')}
                {renderInput('WISE_API_TOKEN', 'Wise API Token')}
                {renderInput('REMITLY_API_KEY', 'Remitly API Key')}
                {renderInput('AZIMO_API_KEY', 'Azimo API Key')}
                {renderInput('NIUM_API_KEY', 'Nium API Key')}
            </>)}
            {renderSection('Investment & Market Data', <>
              {renderInput('ALPACA_API_KEY_ID', 'Alpaca API Key ID')}
              {renderInput('ALPACA_SECRET_KEY', 'Alpaca Secret Key')}
              {renderInput('TRADIER_ACCESS_TOKEN', 'Tradier Access Token')}
              {renderInput('IEX_CLOUD_API_TOKEN', 'IEX Cloud API Token')}
              {renderInput('POLYGON_API_KEY', 'Polygon.io API Key')}
              {renderInput('FINNHUB_API_KEY', 'Finnhub API Key')}
              {renderInput('ALPHA_VANTAGE_API_KEY', 'Alpha Vantage API Key')}
              {renderInput('MORNINGSTAR_API_KEY', 'Morningstar API Key')}
              {renderInput('XIGNITE_API_TOKEN', 'Xignite API Token')}
              {renderInput('DRIVEWEALTH_API_KEY', 'DriveWealth API Key')}
            </>)}
            {renderSection('Crypto', <>
              {renderInput('COINBASE_API_KEY', 'Coinbase API Key')}
              {renderInput('COINBASE_API_SECRET', 'Coinbase API Secret')}
              {renderInput('BINANCE_API_KEY', 'Binance API Key')}
              {renderInput('BINANCE_API_SECRET', 'Binance API Secret')}
              {renderInput('KRAKEN_API_KEY', 'Kraken API Key')}
              {renderInput('KRAKEN_PRIVATE_KEY', 'Kraken Private Key')}
              {renderInput('GEMINI_API_KEY', 'Gemini API Key')}
              {renderInput('GEMINI_API_SECRET', 'Gemini API Secret')}
              {renderInput('COINMARKETCAP_API_KEY', 'CoinMarketCap API Key')}
              {renderInput('COINGECKO_API_KEY', 'CoinGecko API Key')}
              {renderInput('BLOCKIO_API_KEY', 'Block.io API Key')}
            </>)}
            {renderSection('Major Banks (Open Banking)', <>
              {renderInput('JP_MORGAN_CHASE_CLIENT_ID', 'JPMorgan Chase Client ID')}
              {renderInput('CITI_CLIENT_ID', 'Citi Client ID')}
              {renderInput('WELLS_FARGO_CLIENT_ID', 'Wells Fargo Client ID')}
              {renderInput('CAPITAL_ONE_CLIENT_ID', 'Capital One Client ID')}
            </>)}
            {renderSection('European & Global Banks (Open Banking)', <>
              {renderInput('HSBC_CLIENT_ID', 'HSBC Client ID')}
              {renderInput('BARCLAYS_CLIENT_ID', 'Barclays Client ID')}
              {renderInput('BBVA_CLIENT_ID', 'BBVA Client ID')}
              {renderInput('DEUTSCHE_BANK_API_KEY', 'Deutsche Bank API Key')}
            </>)}
            {renderSection('UK & European Aggregators', <>
              {renderInput('TINK_CLIENT_ID', 'Tink Client ID')}
              {renderInput('TRUELAYER_CLIENT_ID', 'TrueLayer Client ID')}
            </>)}
            {renderSection('Compliance & Identity (KYC/AML)', <>
              {renderInput('MIDDESK_API_KEY', 'Mid-Desk API Key')}
              {renderInput('ALLOY_API_TOKEN', 'Alloy API Token')}
              {renderInput('ALLOY_API_SECRET', 'Alloy API Secret')}
              {renderInput('COMPLYADVANTAGE_API_KEY', 'ComplyAdvantage API Key')}
            </>)}
            {renderSection('Real Estate', <>
              {renderInput('ZILLOW_API_KEY', 'Zillow API Key')}
              {renderInput('CORELOGIC_CLIENT_ID', 'CoreLogic Client ID')}
            </>)}
            {renderSection('Credit Bureaus', <>
              {renderInput('EXPERIAN_API_KEY', 'Experian API Key')}
              {renderInput('EQUIFAX_API_KEY', 'Equifax API Key')}
              {renderInput('TRANSUNION_API_KEY', 'TransUnion API Key')}
            </>)}
            {renderSection('Global Payments (Emerging Markets)', <>
              {renderInput('FINCRA_API_KEY', 'Fincra API Key')}
              {renderInput('FLUTTERWAVE_SECRET_KEY', 'Flutterwave Secret Key')}
              {renderInput('PAYSTACK_SECRET_KEY', 'Paystack Secret Key')}
              {renderInput('DLOCAL_API_KEY', 'dLocal API Key')}
              {renderInput('RAPYD_ACCESS_KEY', 'Rapyd Access Key')}
            </>)}
            {renderSection('Accounting & Tax', <>
                {renderInput('TAXJAR_API_KEY', 'TaxJar API Key')}
                {renderInput('AVALARA_API_KEY', 'Avalara API Key')}
                {renderInput('CODAT_API_KEY', 'Codat API Key')}
                {renderInput('XERO_CLIENT_ID', 'Xero Client ID')}
                {renderInput('XERO_CLIENT_SECRET', 'Xero Client Secret')}
                {renderInput('QUICKBOOKS_CLIENT_ID', 'QuickBooks Client ID')}
                {renderInput('QUICKBOOKS_CLIENT_SECRET', 'QuickBooks Client Secret')}
                {renderInput('FRESHBOOKS_API_KEY', 'FreshBooks API Key')}
            </>)}
            {renderSection('Fintech Utilities', <>
                {renderInput('ANVIL_API_KEY', 'Anvil API Key')}
                {renderInput('MOOV_CLIENT_ID', 'Moov Client ID')}
                {renderInput('MOOV_SECRET', 'Moov Secret')}
                {renderInput('VGS_USERNAME', 'VGS Username')}
                {renderInput('VGS_PASSWORD', 'VGS Password')}
                {renderInput('SILA_APP_HANDLE', 'Sila App Handle')}
                {renderInput('SILA_PRIVATE_KEY', 'Sila Private Key')}
            </>)}
          </>
        )}
        
        <div className="mt-8 pt-5 border-t border-gray-200">
          <button type="submit" className="bg-indigo-600 text-white py-2 px-5 rounded-lg text-sm font-semibold shadow-sm transition duration-200 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save All Keys to Server'}
          </button>
          {statusMessage && <p className="mt-4 font-medium p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm">{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};


// --- Basic Data Models ---

// Model for displaying system metrics
interface SystemMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  aiPrediction: number;
}

// Model for AI-generated insights and alerts
interface AIInsight {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'market' | 'system' | 'security' | 'optimization';
  message: string;
  confidence: number;
}

// Model representing a trading algorithm
interface Algorithm {
  id: string;
  name: string;
  code: string; // Represents the algorithm logic, e.g., JSON structure for a node-based editor
  status: 'draft' | 'backtesting' | 'live' | 'error' | 'optimizing';
  version: number;
  lastModified: string;
  author: string;
  riskLevel: 'low' | 'medium' | 'high';
  aiScore: number; // AI-driven score for the algorithm's potential
  performanceMetrics?: { // Historical or backtested performance
    return: number;
    sharpe: number;
    sortino: number;
    alpha: number;
    beta: number;
    volatility: number;
    winRate: number;
  };
}

// Model for storing results of a backtesting run
interface BacktestResult {
  runId: string;
  algorithmId: string;
  startDate: string;
  endDate: string;
  equityCurve: { date: string; value: number; aiForecast: number }[]; // Time series of portfolio value
  metrics: { // Key performance indicators from the backtest
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    trades: number;
    profitFactor: number;
    expectancy: number;
  };
  aiAnalysis: string; // AI-generated qualitative analysis of the results
}

// Model for user profile information
interface UserProfile {
  id: string;
  name: string;
  role: 'Trader' | 'Analyst' | 'Administrator'; // Example roles
  clearanceLevel: number; // For access control
  email: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    aiAssistance: boolean;
  };
  stats: { // User activity statistics
    loginCount: number;
    actionsPerformed: number;
    uptime: string;
  };
}

// --- Data Utilities ---

/**
 * Generates a mock time series data for equity curves or similar financial data.
 * @param points Number of data points to generate.
 * @param startValue Initial value for the series.
 * @param volatility Controls the random fluctuation.
 * @returns An array of objects representing the time series data.
 */
const generateTimeSeries = (points: number, startValue: number, volatility: number) => {
  const data = [];
  let currentValue = startValue;
  const now = new Date();
  for (let i = 0; i < points; i++) {
    // Generate dates backwards from today
    const date = new Date(now.getTime() - (points - i) * 86400000).toISOString().split('T')[0];
    // Introduce random fluctuations
    const change = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + change);
    // Add a slightly divergent AI prediction for demonstration
    const aiForecastValue = currentValue * (1 + (Math.random() - 0.5) * 0.02);
    data.push({
      date,
      value: Math.max(0, currentValue), // Ensure value doesn't go negative
      aiForecast: Math.max(0, aiForecastValue)
    });
  }
  return data;
};

// Mock data for AI insights/alerts
const mockInsights: AIInsight[] = [
  { id: 'ins-1', timestamp: '2023-10-27 09:15:00', severity: 'high', category: 'market', message: 'Detected arbitrage opportunity in FOREX/CRYPTO bridge.', confidence: 0.98 },
  { id: 'ins-2', timestamp: '2023-10-27 09:30:00', severity: 'medium', category: 'optimization', message: 'Algorithm "Alpha-1" logic can be compressed by 15%.', confidence: 0.85 },
  { id: 'ins-3', timestamp: '2023-10-27 10:00:00', severity: 'low', category: 'system', message: 'Global latency reduced by 4ms via AI routing.', confidence: 0.99 },
  { id: 'ins-4', timestamp: '2023-10-27 10:45:00', severity: 'critical', category: 'security', message: 'Anomalous login attempt blocked by Neural Firewall.', confidence: 0.99 },
];

// Initial list of trading algorithms
const initialAlgorithms: Algorithm[] = [
  { 
    id: 'algo-1', 
    name: 'Quantum Momentum Scalper v4', 
    // Placeholder for a more complex code representation (e.g., JSON for a node editor)
    code: JSON.stringify({ nodes: ["Input: Market Stream", "Filter: Volatility > 1.5", "AI Model: Trend Predictor", "Action: Buy/Sell"] }), 
    status: 'live', 
    version: 4,
    lastModified: '2023-10-26',
    author: 'System Admin',
    riskLevel: 'high',
    aiScore: 94,
    performanceMetrics: { return: 45.2, sharpe: 2.1, sortino: 2.8, alpha: 0.15, beta: 0.8, volatility: 12.5, winRate: 68 }
  },
  { 
    id: 'algo-2', 
    name: 'Mean Reversion HFT (Neural)', 
    code: JSON.stringify({ nodes: ["Input: Order Book", "AI: Sentiment Analysis", "Logic: Spread > 0.02%", "Action: Market Make"] }), 
    status: 'backtesting', 
    version: 12,
    lastModified: '2023-10-27',
    author: 'AI Architect',
    riskLevel: 'medium',
    aiScore: 88,
    performanceMetrics: { return: 12.5, sharpe: 1.8, sortino: 1.9, alpha: 0.05, beta: 0.2, volatility: 4.2, winRate: 55 }
  },
  { 
    id: 'algo-3', 
    name: 'Global Macro Arbitrage', 
    code: JSON.stringify({ nodes: ["Input: Global Indices", "Logic: Correlation Divergence", "Action: Hedge Pair"] }), 
    status: 'draft', 
    version: 1,
    lastModified: '2023-10-27',
    author: 'User',
    riskLevel: 'low',
    aiScore: 72,
  },
];

// Mock user profile data
const mockUserProfile: UserProfile = {
  id: 'u-001',
  name: 'Trader',
  role: 'Administrator',
  clearanceLevel: 5,
  email: 'admin@local',
  preferences: { theme: 'light', notifications: true, aiAssistance: true },
  stats: { loginCount: 1420, actionsPerformed: 54300, uptime: '99.99%' }
};

// --- Basic UI Components ---

// Reusable button component with different variants and icons
const Button = ({ icon: Icon, children, onClick, variant = 'primary', disabled = false, className = '' }: any) => {
  const baseClasses = "flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm transition duration-200 ease-in-out font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  let colorClasses = "";

  switch (variant) {
    case 'primary':
      colorClasses = "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-300";
      break;
    case 'secondary':
      colorClasses = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500 disabled:bg-gray-100";
      break;
    case 'danger':
      colorClasses = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300";
      break;
    case 'success':
      colorClasses = "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-300";
      break;
    case 'ghost':
      colorClasses = "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-400 shadow-none";
      break;
  }

  return (
    <button className={`${baseClasses} ${colorClasses} ${className}`} onClick={onClick} disabled={disabled}>
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
};

// Reusable card component for structuring content
const Card = ({ title, subtitle, children, className = '', actions = null }: any) => (
  <div className={`bg-white shadow-xl rounded-xl border border-gray-100 flex flex-col ${className}`}>
    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex space-x-2">{actions}</div>}
    </div>
    <div className="p-6 flex-grow overflow-auto">
      {children}
    </div>
  </div>
);

// Badge component for displaying labels or tags
const Badge = ({ children, color = 'gray' }: { children: React.ReactNode, color?: string }) => {
  const colors: any = {
    gray: 'bg-gray-100 text-gray-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

// Progress bar component for visualizing progress
const ProgressBar = ({ value, max = 100, color = 'indigo', label }: any) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      {label && <span className="text-xs font-medium text-gray-700">{label}</span>}
      <span className="text-xs font-medium text-gray-500">{Math.round((value / max) * 100)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`bg-${color}-600 h-2 rounded-full transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

// --- Dashboard Widgets ---

// Widget to display AI system status and metrics
const AIStatusMonitor = () => {
  // Simulated system stats
  const stats = [
    { label: 'Neural Core Load', value: 45, color: 'indigo' },
    { label: 'Global Latency', value: 12, max: 100, color: 'green' },
    { label: 'Predictive Accuracy', value: 94, color: 'purple' },
    { label: 'Security Threat Level', value: 5, color: 'red' },
  ];

  return (
    <Card title="System Status" subtitle="Real-time Monitoring">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <ProgressBar key={idx} label={stat.label} value={stat.value} max={stat.max || 100} color={stat.color} />
        ))}
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Active Processes</h4>
        <div className="space-y-2">
          {['Market Sentiment Analysis', 'Risk Vector Calculation', 'Liquidity Optimization', 'User Behavior Modeling'].map((proc, i) => (
            <div key={i} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border border-gray-100">
              <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>{proc}</span>
              <span className="text-gray-500 font-mono">PID: {2000 + i * 15}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Widget to display global market pulse and AI sentiment
const GlobalMarketPulse = () => {
  // Mock market data
  const markets = [
    { name: 'S&P 500', price: '4,120.50', change: '+0.45%', sentiment: 'Bullish' },
    { name: 'BTC/USD', price: '64,230.00', change: '+2.10%', sentiment: 'Very Bullish' },
    { name: 'EUR/USD', price: '1.0850', change: '-0.12%', sentiment: 'Neutral' },
    { name: 'Gold', price: '1,980.20', change: '+0.80%', sentiment: 'Bullish' },
    { name: 'Crude Oil', price: '78.40', change: '-1.20%', sentiment: 'Bearish' },
  ];

  return (
    <Card title="Global Market Pulse" subtitle="AI-Driven Sentiment & Pricing">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">AI Sentiment</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {markets.map((m) => (
              <tr key={m.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.name}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500">{m.price}</td>
                <td className={`px-3 py-4 whitespace-nowrap text-sm text-right font-bold ${m.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{m.change}</td>
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <Badge color={m.sentiment.includes('Bullish') ? 'green' : m.sentiment.includes('Bearish') ? 'red' : 'gray'}>{m.sentiment}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// No-code editor component for building trading algorithms visually
const NoCodeEditor = ({ algorithm, onUpdateCode }: { algorithm: Algorithm, onUpdateCode: (code: string) => void }) => {
  // Parse the algorithm code JSON into blocks, default to empty array if invalid
  const [blocks, setBlocks] = useState<string[]>(() => {
    try {
      // Assuming algorithm.code is a JSON string like '{"nodes":["Node1", "Node2"]}'
      const parsedCode = JSON.parse(algorithm.code);
      return parsedCode.nodes || [];
    } catch (e) {
      console.error("Error parsing algorithm code:", e);
      return []; // Return empty array if parsing fails
    }
  });

  // Handler to add a new block to the algorithm
  const handleAddBlock = (type: string) => {
    // Construct a descriptive name for the new block
    const newBlock = `${type}: ${type === 'AI' ? 'Neural Optimization' : type === 'Input' ? 'Market Stream' : type === 'Logic' ? 'Condition Check' : 'Execute Trade'}`;
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    // Update the parent component with the new code representation
    onUpdateCode(JSON.stringify({ nodes: newBlocks }));
  };

  // Handler for AI-driven optimization of the algorithm
  const handleOptimize = () => {
    // Simulate optimization by adding "(Optimized)" to non-AI blocks
    const optimized = blocks.map(b => b.startsWith('AI') ? b : `${b} (Optimized by AI)`);
    setBlocks(optimized);
    onUpdateCode(JSON.stringify({ nodes: optimized }));
  };

  // Handler to remove a block
  const handleDeleteBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
    onUpdateCode(JSON.stringify({ nodes: newBlocks }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-lg border border-gray-200">
      {/* Toolbar for adding new blocks */}
      <div className="p-3 border-b border-gray-200 bg-white rounded-t-lg flex flex-wrap gap-2">
        <Button icon={Code} onClick={() => handleAddBlock('Input')} variant="secondary" className="text-xs">Input</Button>
        <Button icon={TrendingUp} onClick={() => handleAddBlock('Indicator')} variant="secondary" className="text-xs">Indicator</Button>
        <Button icon={Settings} onClick={() => handleAddBlock('Logic')} variant="secondary" className="text-xs">Logic</Button>
        <Button icon={DollarSign} onClick={() => handleAddBlock('Action')} variant="secondary" className="text-xs">Action</Button>
        <div className="flex-grow"></div> {/* Spacer */}
        <Button icon={RefreshCw} onClick={handleOptimize} variant="primary" className="text-xs bg-purple-600 hover:bg-purple-700">AI Auto-Optimize</Button>
      </div>
      {/* Workspace for algorithm blocks */}
      <div className="flex-grow p-4 overflow-y-auto space-y-3">
        {/* Placeholder message when no blocks are present */}
        {blocks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Code className="w-12 h-12 mb-2 opacity-20" />
            <p>Drag blocks or use the toolbar to build your strategy.</p>
          </div>
        )}
        {/* Render each block */}
        {blocks.map((block, index) => (
          <div key={index} className="group relative bg-white border border-indigo-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Visual indicator for block type */}
              <div className={`w-2 h-full absolute left-0 top-0 bottom-0 rounded-l-lg ${block.startsWith('Input') ? 'bg-blue-500' : block.startsWith('Action') ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
              <span className="font-mono text-sm text-gray-700 ml-2">{block}</span>
            </div>
            {/* Delete button, hidden by default, shown on hover */}
            <X className="w-4 h-4 text-gray-300 cursor-pointer hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteBlock(index)} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Component for running backtests and displaying results
const Backtester = ({ algorithm }: { algorithm: Algorithm }) => {
  const [results, setResults] = useState<BacktestResult[]>([]); // State to store backtest results
  const [isBacktesting, setIsBacktesting] = useState(false); // State to track if backtest is running

  // Handler to initiate a backtest simulation
  const handleRun = useCallback(() => {
    setIsBacktesting(true); // Set loading state
    // Simulate an asynchronous backtest operation
    setTimeout(() => {
      // Generate a mock backtest result
      const newResult: BacktestResult = {
        runId: `bt-${Date.now()}`, // Unique ID for the run
        algorithmId: algorithm.id,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        equityCurve: generateTimeSeries(50, 10000, 0.05), // Generate mock equity curve
        metrics: { // Generate mock performance metrics
          totalReturn: parseFloat((Math.random() * 40 + 10).toFixed(2)),
          sharpeRatio: parseFloat((Math.random() * 2 + 1).toFixed(2)),
          maxDrawdown: parseFloat((-Math.random() * 15).toFixed(2)),
          trades: Math.floor(Math.random() * 500 + 100),
          profitFactor: parseFloat((Math.random() * 1 + 1.2).toFixed(2)),
          expectancy: parseFloat((Math.random() * 0.5).toFixed(2)),
        },
        aiAnalysis: "Strategy exhibits strong momentum characteristics but may be overfitted to Q2 volatility. Suggest increasing stop-loss buffer by 0.5%." // Mock AI analysis
      };
      setResults([newResult, ...results]); // Add new result to the top of the list
      setIsBacktesting(false); // Reset loading state
    }, 1500); // Simulate 1.5 second delay
  }, [algorithm.id, results]);

  const latest = results[0]; // Get the most recent result for display

  return (
    <Card title="Simulation & Deployment" subtitle="Backtesting Engine">
      <div className="space-y-6">
        {/* Button to trigger the backtest */}
        <Button icon={Play} onClick={handleRun} disabled={isBacktesting} variant="primary" className="w-full py-3 text-lg">
          {isBacktesting ? 'Running Simulation...' : 'Run Simulation'}
        </Button>

        {/* Display latest results if available */}
        {latest && (
          <div className="animate-fade-in">
            {/* AI Analysis section */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
              <h4 className="font-bold text-indigo-900 flex items-center mb-2">
                <TrendingUp className="w-4 h-4 mr-2" /> AI Analysis
              </h4>
              <p className="text-sm text-indigo-800 leading-relaxed">{latest.aiAnalysis}</p>
            </div>

            {/* Key Metrics display */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 uppercase">Total Return</div>
                <div className="text-2xl font-bold text-green-600">+{latest.metrics.totalReturn}%</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 uppercase">Sharpe Ratio</div>
                <div className="text-2xl font-bold text-blue-600">{latest.metrics.sharpeRatio}</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 uppercase">Max Drawdown</div>
                <div className="text-2xl font-bold text-red-600">{latest.metrics.maxDrawdown}%</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 uppercase">Profit Factor</div>
                <div className="text-2xl font-bold text-purple-600">{latest.metrics.profitFactor}</div>
              </div>
            </div>
            
            {/* Equity Curve visualization (simplified) */}
            <div className="h-32 bg-gray-50 rounded border border-gray-200 flex items-end justify-between px-2 pb-2 overflow-hidden">
               {latest.equityCurve.map((pt, i) => (
                 <div key={i} className="w-1 bg-indigo-400 hover:bg-indigo-600 transition-colors" style={{ height: `${(pt.value / 15000) * 100}%` }} title={`Date: ${pt.date}, Val: ${pt.value.toFixed(2)}`}></div>
               ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Component to display a list of trading algorithms
const AlgoList = ({ algorithms, selectedAlgo, onSelect, onCreate }: any) => (
  <Card title="Strategy Portfolio" subtitle="Managed Algorithms" actions={<Button icon={Plus} onClick={onCreate} variant="secondary" className="px-2 py-1 text-xs">New</Button>} className="h-full">
    <div className="space-y-3">
      {algorithms.map((algo: Algorithm) => (
        <div
          key={algo.id}
          onClick={() => onSelect(algo)}
          className={`p-4 rounded-lg cursor-pointer border transition-all duration-200 ${selectedAlgo?.id === algo.id ? 'bg-indigo-50 border-indigo-500 shadow-md transform scale-[1.02]' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-900">{algo.name}</h4>
            <Badge color={algo.status === 'live' ? 'green' : algo.status === 'backtesting' ? 'yellow' : 'gray'}>{algo.status.toUpperCase()}</Badge>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>v{algo.version}</span>
            <span className="flex items-center text-indigo-600 font-semibold"><TrendingUp className="w-3 h-3 mr-1" /> AI Score: {algo.aiScore}</span>
          </div>
          {algo.performanceMetrics && (
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-400 block">Return</span>
                <span className="font-medium text-green-600">+{algo.performanceMetrics.return}%</span>
              </div>
              <div>
                <span className="text-gray-400 block">Sharpe</span>
                <span className="font-medium text-gray-700">{algo.performanceMetrics.sharpe}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Win Rate</span>
                <span className="font-medium text-gray-700">{algo.performanceMetrics.winRate}%</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </Card>
);

// --- Navigation Layout ---

// SVG component for Plus icon (used in AlgoList for 'New' button)
const Plus = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

// Define navigation items for the sidebar
const NAV_ITEMS = [
    { name: 'Executive Dashboard', icon: DollarSign },
    { name: 'Global Transactions', icon: History },
    { name: 'Liquidity Transfer', icon: DollarSign }, // Reusing DollarSign as Send is not imported
    { name: 'Budgetary Control', icon: TrendingUp }, // Reusing TrendingUp as Target not imported
    { name: 'Strategic Goals', icon: TrendingUp },
    { name: 'Credit Health Monitor', icon: TrendingUp }, // Reusing TrendingUp as Heart not imported
    { name: 'Investment Portfolio', icon: TrendingUp },
    { name: 'Web3 & Crypto Bridge', icon: TrendingUp }, // Reusing TrendingUp as Crypto not imported
    { name: 'Algo-Trading Lab', icon: Code, current: true }, // Mark Algo-Trading Lab as current
    { name: 'Forex Arbitrage Arena', icon: TrendingUp }, // Reusing TrendingUp as Scale not imported
    { name: 'Commodities Exchange', icon: TrendingUp }, // Reusing TrendingUp as Wheat not imported
    { name: 'Real Estate Empire', icon: TrendingUp }, // Reusing TrendingUp as Building not imported
    { name: 'Art & NFT Vault', icon: TrendingUp }, // Reusing TrendingUp as Palette not imported
    { name: 'Derivatives Desk', icon: TrendingUp }, // Reusing TrendingUp as PieChart not imported
    { name: 'Venture Capital', icon: TrendingUp }, // Reusing TrendingUp as Rocket not imported
    { name: 'Private Equity', icon: TrendingUp }, // Reusing TrendingUp as Briefcase not imported
    { name: 'Tax Optimization AI', icon: TrendingUp }, // Reusing TrendingUp as Receipt not imported
    { name: 'Legacy Planning', icon: TrendingUp }, // Reusing TrendingUp as Legacy not imported
    { name: 'Corporate Treasury', icon: TrendingUp }, // Reusing TrendingUp as Globe not imported
    { name: 'Modern Treasury API', icon: TrendingUp }, // Reusing TrendingUp as Key not imported
    { name: 'Card Issuance (Marqeta)', icon: TrendingUp }, // Reusing TrendingUp as CreditCard not imported
    { name: 'Data Aggregation (Plaid)', icon: TrendingUp }, // Reusing TrendingUp as Link not imported
    { name: 'Payment Rails (Stripe)', icon: TrendingUp }, // Reusing TrendingUp as Zap not imported
    { name: 'Identity (SSO)', icon: TrendingUp }, // Reusing TrendingUp as Lock not imported
    { name: 'AI Financial Advisor', icon: TrendingUp }, // Reusing TrendingUp as Brain not imported
    { name: 'Quantum Weaver AI', icon: TrendingUp }, // Reusing TrendingUp as Atom not imported
    { name: 'Agent Marketplace', icon: TrendingUp }, // Reusing TrendingUp as Users not imported
    { name: 'Ad Studio AI', icon: TrendingUp }, // Reusing TrendingUp as Megaphone not imported
    { name: 'Card Customization', icon: TrendingUp }, // Reusing TrendingUp as CreditCard not imported
    { name: 'DAO Governance', icon: TrendingUp }, // Reusing TrendingUp as Handshake not imported
    { name: 'Open Banking API', icon: TrendingUp }, // Reusing TrendingUp as Link not imported
    { name: 'System Status', icon: TrendingUp }, // Reusing TrendingUp as Activity not imported
    { name: 'API Settings', icon: Settings },
    { name: 'Concierge', icon: TrendingUp }, // Reusing TrendingUp as Phone not imported
    { name: 'Philanthropy', icon: TrendingUp }, // Reusing TrendingUp as Heart not imported
    { name: 'Wealth Management', icon: TrendingUp }, // Reusing TrendingUp as Crown not imported
    { name: 'Security Center', icon: TrendingUp }, // Reusing TrendingUp as Shield not imported
    { name: 'Personalization', icon: TrendingUp }, // Reusing TrendingUp as Sparkles not imported
    { name: 'System Manifesto', icon: TrendingUp }, // Reusing TrendingUp as Eye not imported
];

// Sidebar component for application navigation
const AppSidebar = ({ onNavigate, activeView }: any) => {
    const [isCollapsed, setIsCollapsed] = useState(false); // State for sidebar collapse

    return (
        // Sidebar container with transition for collapse animation
        <div className={`h-full bg-gray-900 text-white flex flex-col transition-all duration-300 shadow-2xl z-20 ${isCollapsed ? 'w-20' : 'w-72'}`}>
            {/* Header section with logo and collapse button */}
            <div className="p-5 flex items-center justify-between border-b border-gray-800 bg-gray-900">
                {!isCollapsed && (
                  <div>
                    {/* Application Title */}
                    <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tighter">TRADING OS</h1>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase">Trading Dashboard</p>
                  </div>
                )}
                {/* Collapse/Expand button */}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)} 
                    className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
            
            {/* User Profile section */}
            <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors" onClick={() => onNavigate("Profile")}>
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-gray-700">
                        TR {/* Initials */}
                    </div>
                    {/* User Name and Status (visible when not collapsed) */}
                    {!isCollapsed && (
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-200 truncate">Trader</p>
                        <p className="text-xs text-green-400 flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span> Online</p>
                      </div>
                    )}
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-grow overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon; // Get the icon component
                    const isActive = item.name === activeView; // Check if the item is the currently active view
                    return (
                        <a
                            key={item.name}
                            href="#" // Prevent default anchor behavior
                            onClick={(e) => { e.preventDefault(); onNavigate(item.name); }} // Handle navigation click
                            className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                            {/* Navigation item name, hidden when collapsed */}
                            <span className={`ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                {item.name}
                            </span>
                            {/* Active indicator dot */}
                            {!isCollapsed && isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </a>
                    );
                })}
            </nav>
            
            {/* Footer with version and status */}
            <div className="p-4 border-t border-gray-800 bg-gray-900 text-xs text-gray-600 text-center">
              {!isCollapsed && "v10.4.2-Personal | Secure Connection"}
            </div>
        </div>
    );
}

// Component displaying system information/manifesto
const SystemManifesto = () => (
  <Card title="System Information" className="h-full overflow-y-auto">
    {/* Using Tailwind Typography for better prose rendering */}
    <div className="prose prose-lg max-w-none text-gray-700 p-4">
      <h3 className="text-2xl font-bold text-indigo-900 border-b pb-2 mb-4">System Overview</h3>
      <p className="mb-4">
        This application serves as a dashboard for algorithmic trading and financial monitoring.
      </p>
      {/* Feature highlights */}
      <div className="bg-indigo-50 p-6 rounded-xl border-l-4 border-indigo-600 my-6">
        <h4 className="text-lg font-bold text-indigo-800 mb-2">Key Features</h4>
        <ul className="list-disc list-inside space-y-2 text-indigo-900">
          <li><strong>Monitoring:</strong> Real-time system and market tracking.</li>
          <li><strong>Strategy:</strong> Algorithm creation and backtesting.</li>
          <li><strong>Management:</strong> Portfolio and resource oversight.</li>
        </ul>
      </div>
      <p className="mb-4">
        Designed for efficiency and clarity in financial operations.
      </p>
    </div>
  </Card>
);

// --- Main Layout ---

// Main component for the Algo Trading Lab section of the application
const AlgoTradingLab: React.FC = () => {
  // State for managing the list of algorithms
  const [algorithms, setAlgorithms] = useState<Algorithm[]>(initialAlgorithms);
  // State for the ID of the currently selected algorithm
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(initialAlgorithms[0].id);
  // State for the currently active view in the main content area
  const [currentView, setCurrentView] = useState('Algo-Trading Lab');
  // State for notifications (AI insights)
  const [notifications, setNotifications] = useState<AIInsight[]>(mockInsights);

  // Memoized selection of the current algorithm based on selectedAlgoId
  const selectedAlgorithm = useMemo(() => algorithms.find(a => a.id === selectedAlgoId) || initialAlgorithms[0], [algorithms, selectedAlgoId]);

  // Callback to update the code of the selected algorithm
  const handleUpdateCode = useCallback((code: string) => {
    setAlgorithms(prev => prev.map(a => 
      a.id === selectedAlgoId 
        ? { ...a, code, status: 'draft', lastModified: new Date().toISOString().split('T')[0] } // Update code and status
        : a
    ));
  }, [selectedAlgoId]);

  // Callback to create a new algorithm
  const handleCreate = useCallback(() => {
    const newAlgo: Algorithm = {
      id: `algo-${Date.now()}`, // Generate unique ID
      name: `New Strategy ${algorithms.length + 1}`, // Default name
      code: JSON.stringify({ nodes: [] }), // Default empty code structure
      status: 'draft', // Initial status
      version: 1,
      lastModified: new Date().toISOString().split('T')[0],
      author: 'User',
      riskLevel: 'low',
      aiScore: 50
    };
    setAlgorithms([...algorithms, newAlgo]); // Add new algorithm to the list
    setSelectedAlgoId(newAlgo.id); // Select the newly created algorithm
  }, [algorithms]);

  // Function to render the main content based on the currentView state
  const renderContent = () => {
    switch (currentView) {
      case 'System Manifesto':
        return <SystemManifesto />; // Render System Manifesto
      case 'API Settings':
        return <ApiSettings />; // Render API Settings
      case 'Executive Dashboard':
        // Layout for the Executive Dashboard
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto pb-10">
            <AIStatusMonitor /> {/* AI Status Widget */}
            <GlobalMarketPulse /> {/* Market Pulse Widget */}
            <div className="lg:col-span-2">
               {/* System-Wide Alerts Card */}
               <Card title="System-Wide Alerts" subtitle="AI Detected Anomalies">
                 <div className="space-y-2">
                   {notifications.map(n => (
                     <div key={n.id} className={`p-3 rounded border-l-4 flex justify-between items-center ${n.severity === 'critical' ? 'bg-red-50 border-red-500' : n.severity === 'high' ? 'bg-orange-50 border-orange-500' : 'bg-blue-50 border-blue-500'}`}>
                       <div>
                         <span className="font-bold text-gray-800 block">{n.category.toUpperCase()} ALERT</span>
                         <span className="text-sm text-gray-600">{n.message}</span>
                       </div>
                       <Badge color={n.severity === 'critical' ? 'red' : 'blue'}>{n.confidence * 100}% Conf.</Badge>
                     </div>
                   ))}
                 </div>
               </Card>
            </div>
          </div>
        );
      case 'Algo-Trading Lab':
        // Layout for the Algo Trading Lab view
        return (
          <div className="flex flex-col h-full space-y-6 overflow-hidden">
            <div className="grid grid-cols-12 gap-6 h-full min-h-0">
              {/* Algo List Panel */}
              <div className="col-span-12 lg:col-span-3 h-full overflow-hidden flex flex-col">
                <AlgoList algorithms={algorithms} selectedAlgo={selectedAlgorithm} onSelect={(a: Algorithm) => setSelectedAlgoId(a.id)} onCreate={handleCreate} />
              </div>
              {/* Editor Panel */}
              <div className="col-span-12 lg:col-span-6 h-full overflow-hidden flex flex-col">
                <Card title={`Editor: ${selectedAlgorithm.name}`} subtitle={`v${selectedAlgorithm.version} - ${selectedAlgorithm.status.toUpperCase()}`} className="h-full flex flex-col">
                  <NoCodeEditor algorithm={selectedAlgorithm} onUpdateCode={handleUpdateCode} />
                </Card>
              </div>
              {/* Backtester Panel */}
              <div className="col-span-12 lg:col-span-3 h-full overflow-hidden flex flex-col">
                <Backtester algorithm={selectedAlgorithm} />
              </div>
            </div>
          </div>
        );
      default:
        // Default view for unhandled states or loading
        return (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl shadow-lg border border-gray-100 p-10 text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <Settings className="w-12 h-12 text-indigo-600 animate-spin-slow" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentView}</h2>
            <p className="text-gray-500 max-w-md mb-8">This module is currently initializing. Connection in progress...</p>
            <Button icon={RefreshCw} onClick={() => {}} variant="primary">Retry Connection</Button>
          </div>
        );
    }
  };

  // Main application render function
  return (
    <div className="h-screen w-full flex bg-gray-100 font-sans overflow-hidden text-gray-900">
      {/* App Sidebar */}
      <AppSidebar onNavigate={setCurrentView} activeView={currentView} />
      
      {/* Main content area */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center">
            {/* Current View Title */}
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">{currentView}</h2>
            {/* Active Session Indicator for Algo-Trading Lab */}
            {currentView === 'Algo-Trading Lab' && <span className="ml-3 px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs font-bold">ACTIVE SESSION</span>}
          </div>
          {/* Right-aligned header elements */}
          <div className="flex items-center space-x-4">
            {/* System Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600">System Optimal</span>
            </div>
            {/* History Button with Notification Dot */}
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
              <History className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            {/* User Profile Button */}
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
              <User className="w-5 h-5" />
            </button>
            {/* Logout Button */}
            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" onClick={() => alert("Secure Logout Initiated")}>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Workspace Area */}
        <main className="flex-grow p-6 overflow-hidden relative">
          {renderContent()} {/* Render content based on currentView */}
        </main>
      </div>
    </div>
  );
};

export default AlgoTradingLab;

// --- CONSOLIDATED FROM: AlgoTradingLab (2)_1.tsx ---

import React, { useState, useCallback, useMemo, FormEvent, ChangeEvent } from 'react';
import { RefreshCw, Play, Save, History, Code, Settings, TrendingUp, DollarSign, X, User, LogOut, Plus } from 'lucide-react';
import axios from 'axios';

// =================================================================================
// API Settings Component - Data Interface
// =================================================================================
interface ApiKeysState {
  // === Tech APIs ===
  // Core Infrastructure & Cloud
  STRIPE_SECRET_KEY: string;
  TWILIO_ACCOUNT_SID: string;
  TWILIO_AUTH_TOKEN: string;
  SENDGRID_API_KEY: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AZURE_CLIENT_ID: string;
  AZURE_CLIENT_SECRET: string;
  GOOGLE_CLOUD_API_KEY: string;

  // Deployment & DevOps
  DOCKER_HUB_USERNAME: string;
  DOCKER_HUB_ACCESS_TOKEN: string;
  HEROKU_API_KEY: string;
  NETLIFY_PERSONAL_ACCESS_TOKEN: string;
  VERCEL_API_TOKEN: string;
  CLOUDFLARE_API_TOKEN: string;
  DIGITALOCEAN_PERSONAL_ACCESS_TOKEN: string;
  LINODE_PERSONAL_ACCESS_TOKEN: string;
  TERRAFORM_API_TOKEN: string;

  // Collaboration & Productivity
  GITHUB_PERSONAL_ACCESS_TOKEN: string;
  SLACK_BOT_TOKEN: string;
  DISCORD_BOT_TOKEN: string;
  TRELLO_API_KEY: string;
  TRELLO_API_TOKEN: string;
  JIRA_USERNAME: string;
  JIRA_API_TOKEN: string;
  ASANA_PERSONAL_ACCESS_TOKEN: string;
  NOTION_API_KEY: string;
  AIRTABLE_API_KEY: string;

  // File & Data Storage
  DROPBOX_ACCESS_TOKEN: string;
  BOX_DEVELOPER_TOKEN: string;
  GOOGLE_DRIVE_API_KEY: string;
  ONEDRIVE_CLIENT_ID: string;

  // CRM & Business
  SALESFORCE_CLIENT_ID: string;
  SALESFORCE_CLIENT_SECRET: string;
  HUBSPOT_API_KEY: string;
  ZENDESK_API_TOKEN: string;
  INTERCOM_ACCESS_TOKEN: string;
  MAILCHIMP_API_KEY: string;

  // E-commerce
  SHOPIFY_API_KEY: string;
  SHOPIFY_API_SECRET: string;
  BIGCOMMERCE_ACCESS_TOKEN: string;
  MAGENTO_ACCESS_TOKEN: string;
  WOOCOMMERCE_CLIENT_KEY: string;
  WOOCOMMERCE_CLIENT_SECRET: string;
  
  // Authentication & Identity
  STYTCH_PROJECT_ID: string;
  STYTCH_SECRET: string;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_CLIENT_SECRET: string;
  OKTA_DOMAIN: string;
  OKTA_API_TOKEN: string;

  // Backend & Databases
  FIREBASE_API_KEY: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;

  // API Development
  POSTMAN_API_KEY: string;
  APOLLO_GRAPH_API_KEY: string;

  // AI & Machine Learning
  OPENAI_API_KEY: string;
  HUGGING_FACE_API_TOKEN: string;
  GOOGLE_CLOUD_AI_API_KEY: string;
  AMAZON_REKOGNITION_ACCESS_KEY: string;
  MICROSOFT_AZURE_COGNITIVE_KEY: string;
  IBM_WATSON_API_KEY: string;

  // Search & Real-time
  ALGOLIA_APP_ID: string;
  ALGOLIA_ADMIN_API_KEY: string;
  PUSHER_APP_ID: string;
  PUSHER_KEY: string;
  PUSHER_SECRET: string;
  ABLY_API_KEY: string;
  ELASTICSEARCH_API_KEY: string;
  
  // Identity & Verification
  STRIPE_IDENTITY_SECRET_KEY: string;
  ONFIDO_API_TOKEN: string;
  CHECKR_API_KEY: string;
  
  // Logistics & Shipping
  LOB_API_KEY: string;
  EASYPOST_API_KEY: string;
  SHIPPO_API_TOKEN: string;

  // Maps & Weather
  GOOGLE_MAPS_API_KEY: string;
  MAPBOX_ACCESS_TOKEN: string;
  HERE_API_KEY: string;
  ACCUWEATHER_API_KEY: string;
  OPENWEATHERMAP_API_KEY: string;

  // Social & Media
  YELP_API_KEY: string;
  FOURSQUARE_API_KEY: string;
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_SECRET: string;
  TWITTER_BEARER_TOKEN: string;
  FACEBOOK_APP_ID: string;
  FACEBOOK_APP_SECRET: string;
  INSTAGRAM_APP_ID: string;
  INSTAGRAM_APP_SECRET: string;
  YOUTUBE_DATA_API_KEY: string;
  SPOTIFY_CLIENT_ID: string;
  SPOTIFY_CLIENT_SECRET: string;
  SOUNDCLOUD_CLIENT_ID: string;
  TWITCH_CLIENT_ID: string;
  TWITCH_CLIENT_SECRET: string;

  // Media & Content
  MUX_TOKEN_ID: string;
  MUX_TOKEN_SECRET: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
  IMGIX_API_KEY: string;
  
  // Legal & Admin
  STRIPE_ATLAS_API_KEY: string;
  CLERKY_API_KEY: string;
  DOCUSIGN_INTEGRATOR_KEY: string;
  HELLOSIGN_API_KEY: string;
  
  // Monitoring & CI/CD
  LAUNCHDARKLY_SDK_KEY: string;
  SENTRY_AUTH_TOKEN: string;
  DATADOG_API_KEY: string;
  NEW_RELIC_API_KEY: string;
  CIRCLECI_API_TOKEN: string;
  TRAVIS_CI_API_TOKEN: string;
  BITBUCKET_USERNAME: string;
  BITBUCKET_APP_PASSWORD: string;
  GITLAB_PERSONAL_ACCESS_TOKEN: string;
  PAGERDUTY_API_KEY: string;
  
  // Headless CMS
  CONTENTFUL_SPACE_ID: string;
  CONTENTFUL_ACCESS_TOKEN: string;
  SANITY_PROJECT_ID: string;
  SANITY_API_TOKEN: string;
  STRAPI_API_TOKEN: string;

  // === Banking & Finance APIs ===
  // Data Aggregators
  PLAID_CLIENT_ID: string;
  PLAID_SECRET: string;
  YODLEE_CLIENT_ID: string;
  YODLEE_SECRET: string;
  MX_CLIENT_ID: string;
  MX_API_KEY: string;
  FINICITY_PARTNER_ID: string;
  FINICITY_APP_KEY: string;

  // Payment Processing
  ADYEN_API_KEY: string;
  ADYEN_MERCHANT_ACCOUNT: string;
  BRAINTREE_MERCHANT_ID: string;
  BRAINTREE_PUBLIC_KEY: string;
  BRAINTREE_PRIVATE_KEY: string;
  SQUARE_APPLICATION_ID: string;
  SQUARE_ACCESS_TOKEN: string;
  PAYPAL_CLIENT_ID: string;
  PAYPAL_SECRET: string;
  DWOLLA_KEY: string;
  DWOLLA_SECRET: string;
  WORLDPAY_API_KEY: string;
  CHECKOUT_SECRET_KEY: string;
  
  // Banking as a Service (BaaS) & Card Issuing
  MARQETA_APPLICATION_TOKEN: string;
  MARQETA_ADMIN_ACCESS_TOKEN: string;
  GALILEO_API_LOGIN: string;
  GALILEO_API_TRANS_KEY: string;
  SOLARISBANK_CLIENT_ID: string;
  SOLARISBANK_CLIENT_SECRET: string;
  SYNAPSE_CLIENT_ID: string;
  SYNAPSE_CLIENT_SECRET: string;
  RAILSBANK_API_KEY: string;
  CLEARBANK_API_KEY: string;
  UNIT_API_TOKEN: string;
  TREASURY_PRIME_API_KEY: string;
  INCREASE_API_KEY: string;
  MERCURY_API_KEY: string;
  BREX_API_KEY: string;
  BOND_API_KEY: string;
  
  // International Payments
  CURRENCYCLOUD_LOGIN_ID: string;
  CURRENCYCLOUD_API_KEY: string;
  OFX_API_KEY: string;
  WISE_API_TOKEN: string;
  REMITLY_API_KEY: string;
  AZIMO_API_KEY: string;
  NIUM_API_KEY: string;
  
  // Investment & Market Data
  ALPACA_API_KEY_ID: string;
  ALPACA_SECRET_KEY: string;
  TRADIER_ACCESS_TOKEN: string;
  IEX_CLOUD_API_TOKEN: string;
  POLYGON_API_KEY: string;
  FINNHUB_API_KEY: string;
  ALPHA_VANTAGE_API_KEY: string;
  MORNINGSTAR_API_KEY: string;
  XIGNITE_API_TOKEN: string;
  DRIVEWEALTH_API_KEY: string;

  // Crypto
  COINBASE_API_KEY: string;
  COINBASE_API_SECRET: string;
  BINANCE_API_KEY: string;
  BINANCE_API_SECRET: string;
  KRAKEN_API_KEY: string;
  KRAKEN_PRIVATE_KEY: string;
  GEMINI_API_KEY: string;
  GEMINI_API_SECRET: string;
  COINMARKETCAP_API_KEY: string;
  COINGECKO_API_KEY: string;
  BLOCKIO_API_KEY: string;

  // Major Banks (Open Banking)
  JP_MORGAN_CHASE_CLIENT_ID: string;
  CITI_CLIENT_ID: string;
  WELLS_FARGO_CLIENT_ID: string;
  CAPITAL_ONE_CLIENT_ID: string;

  // European & Global Banks (Open Banking)
  HSBC_CLIENT_ID: string;
  BARCLAYS_CLIENT_ID: string;
  BBVA_CLIENT_ID: string;
  DEUTSCHE_BANK_API_KEY: string;

  // UK & European Aggregators
  TINK_CLIENT_ID: string;
  TRUELAYER_CLIENT_ID: string;

  // Compliance & Identity (KYC/AML)
  MIDDESK_API_KEY: string;
  ALLOY_API_TOKEN: string;
  ALLOY_API_SECRET: string;
  COMPLYADVANTAGE_API_KEY: string;

  // Real Estate
  ZILLOW_API_KEY: string;
  CORELOGIC_CLIENT_ID: string;

  // Credit Bureaus
  EXPERIAN_API_KEY: string;
  EQUIFAX_API_KEY: string;
  TRANSUNION_API_KEY: string;

  // Global Payments (Emerging Markets)
  FINCRA_API_KEY: string;
  FLUTTERWAVE_SECRET_KEY: string;
  PAYSTACK_SECRET_KEY: string;
  DLOCAL_API_KEY: string;
  RAPYD_ACCESS_KEY: string;
  
  // Accounting & Tax
  TAXJAR_API_KEY: string;
  AVALARA_API_KEY: string;
  CODAT_API_KEY: string;
  XERO_CLIENT_ID: string;
  XERO_CLIENT_SECRET: string;
  QUICKBOOKS_CLIENT_ID: string;
  QUICKBOOKS_CLIENT_SECRET: string;
  FRESHBOOKS_API_KEY: string;
  
  // Fintech Utilities
  ANVIL_API_KEY: string;
  MOOV_CLIENT_ID: string;
  MOOV_SECRET: string;
  VGS_USERNAME: string;
  VGS_PASSWORD: string;
  SILA_APP_HANDLE: string;
  SILA_PRIVATE_KEY: string;
  
  [key: string]: string; // Index signature for dynamic access
}


// =================================================================================
// API Settings Component - UI & Logic
// =================================================================================
const ApiSettings: React.FC = () => {
  // Initialize state with undefined values to ensure all fields are controlled
  const [keys, setKeys] = useState<Partial<ApiKeysState>>({});
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tech' | 'banking'>('tech');

  // Fetch existing keys on component mount (implementation requires a backend endpoint)
  React.useEffect(() => {
    const fetchKeys = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/get-keys'); // Assuming this endpoint exists
        setKeys(response.data.keys || {});
      } catch (error) {
        console.error("Failed to fetch keys:", error);
        setStatusMessage("Could not load existing keys. Please ensure the backend is running.");
      }
    };
    fetchKeys();
  }, []);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setKeys(prevKeys => ({ ...prevKeys, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMessage('Saving keys securely to backend...');
    try {
      // NOTE: In a production system, sensitive keys should be stored securely (e.g., AWS Secrets Manager, HashiCorp Vault)
      // and this endpoint should handle that securely. Client-side storage of secrets is not recommended.
      const response = await axios.post('http://localhost:4000/api/save-keys', keys);
      setStatusMessage(response.data.message);
    } catch (error) {
      console.error("Error saving keys:", error);
      setStatusMessage('Error: Could not save keys. Please check backend server and logs.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (keyName: keyof ApiKeysState, label: string) => (
    <div key={keyName} className="mb-4">
      <label htmlFor={keyName} className="block font-semibold text-sm text-gray-700 mb-2">{label}</label>
      <input
        type="password"
        id={keyName}
        name={keyName}
        value={keys[keyName] || ''}
        onChange={handleInputChange}
        placeholder={`Enter ${label}`}
        className="w-full p-2 border border-gray-300 rounded-md text-sm transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      />
    </div>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
      <div className="mb-8 pb-8 border-b border-gray-200 last:border-b-0">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">{title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              {children}
          </div>
      </div>
  );

  return (
    <div className="bg-white shadow-xl rounded-xl border border-gray-100 h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
        <h1 className="text-lg font-bold text-gray-900">API Credentials Console</h1>
        <p className="text-xs text-gray-500 mt-0.5">Securely manage credentials for all integrated services.</p>
      </div>
      
      <div className="px-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('tech')} 
          className={`py-3 px-1 mr-6 border-b-2 text-sm font-medium transition-colors ${activeTab === 'tech' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Tech APIs
        </button>
        <button 
          onClick={() => setActiveTab('banking')} 
          className={`py-3 px-1 mr-6 border-b-2 text-sm font-medium transition-colors ${activeTab === 'banking' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Banking & Finance APIs
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-grow p-6 overflow-y-auto custom-scrollbar">
        {activeTab === 'tech' ? (
          <>
            {renderSection('Core Infrastructure & Cloud', <>
              {renderInput('STRIPE_SECRET_KEY', 'Stripe Secret Key')}
              {renderInput('TWILIO_ACCOUNT_SID', 'Twilio Account SID')}
              {renderInput('TWILIO_AUTH_TOKEN', 'Twilio Auth Token')}
              {renderInput('SENDGRID_API_KEY', 'SendGrid API Key')}
              {renderInput('AWS_ACCESS_KEY_ID', 'AWS Access Key ID')}
              {renderInput('AWS_SECRET_ACCESS_KEY', 'AWS Secret Access Key')}
              {renderInput('AZURE_CLIENT_ID', 'Azure Client ID')}
              {renderInput('AZURE_CLIENT_SECRET', 'Azure Client Secret')}
              {renderInput('GOOGLE_CLOUD_API_KEY', 'Google Cloud API Key')}
            </>)}
            {renderSection('Deployment & DevOps', <>
              {renderInput('DOCKER_HUB_USERNAME', 'Docker Hub Username')}
              {renderInput('DOCKER_HUB_ACCESS_TOKEN', 'Docker Hub Access Token')}
              {renderInput('HEROKU_API_KEY', 'Heroku API Key')}
              {renderInput('NETLIFY_PERSONAL_ACCESS_TOKEN', 'Netlify PAT')}
              {renderInput('VERCEL_API_TOKEN', 'Vercel API Token')}
              {renderInput('CLOUDFLARE_API_TOKEN', 'Cloudflare API Token')}
              {renderInput('DIGITALOCEAN_PERSONAL_ACCESS_TOKEN', 'DigitalOcean PAT')}
              {renderInput('LINODE_PERSONAL_ACCESS_TOKEN', 'Linode PAT')}
              {renderInput('TERRAFORM_API_TOKEN', 'Terraform API Token')}
            </>)}
            {renderSection('Collaboration & Productivity', <>
                {renderInput('GITHUB_PERSONAL_ACCESS_TOKEN', 'GitHub PAT')}
                {renderInput('SLACK_BOT_TOKEN', 'Slack Bot Token')}
                {renderInput('DISCORD_BOT_TOKEN', 'Discord Bot Token')}
                {renderInput('TRELLO_API_KEY', 'Trello API Key')}
                {renderInput('TRELLO_API_TOKEN', 'Trello API Token')}
                {renderInput('JIRA_USERNAME', 'Jira Username')}
                {renderInput('JIRA_API_TOKEN', 'Jira API Token')}
                {renderInput('ASANA_PERSONAL_ACCESS_TOKEN', 'Asana PAT')}
                {renderInput('NOTION_API_KEY', 'Notion API Key')}
                {renderInput('AIRTABLE_API_KEY', 'Airtable API Key')}
            </>)}
            {renderSection('File & Data Storage', <>
                {renderInput('DROPBOX_ACCESS_TOKEN', 'Dropbox Access Token')}
                {renderInput('BOX_DEVELOPER_TOKEN', 'Box Developer Token')}
                {renderInput('GOOGLE_DRIVE_API_KEY', 'Google Drive API Key')}
                {renderInput('ONEDRIVE_CLIENT_ID', 'OneDrive Client ID')}
            </>)}
            {renderSection('CRM & Business', <>
                {renderInput('SALESFORCE_CLIENT_ID', 'Salesforce Client ID')}
                {renderInput('SALESFORCE_CLIENT_SECRET', 'Salesforce Client Secret')}
                {renderInput('HUBSPOT_API_KEY', 'HubSpot API Key')}
                {renderInput('ZENDESK_API_TOKEN', 'Zendesk API Token')}
                {renderInput('INTERCOM_ACCESS_TOKEN', 'Intercom Access Token')}
                {renderInput('MAILCHIMP_API_KEY', 'Mailchimp API Key')}
            </>)}
            {renderSection('E-commerce', <>
                {renderInput('SHOPIFY_API_KEY', 'Shopify API Key')}
                {renderInput('SHOPIFY_API_SECRET', 'Shopify API Secret')}
                {renderInput('BIGCOMMERCE_ACCESS_TOKEN', 'BigCommerce Access Token')}
                {renderInput('MAGENTO_ACCESS_TOKEN', 'Magento Access Token')}
                {renderInput('WOOCOMMERCE_CLIENT_KEY', 'WooCommerce Client Key')}
                {renderInput('WOOCOMMERCE_CLIENT_SECRET', 'WooCommerce Client Secret')}
            </>)}
            {renderSection('Authentication & Identity', <>
                {renderInput('STYTCH_PROJECT_ID', 'Stytch Project ID')}
                {renderInput('STYTCH_SECRET', 'Stytch Secret')}
                {renderInput('AUTH0_DOMAIN', 'Auth0 Domain')}
                {renderInput('AUTH0_CLIENT_ID', 'Auth0 Client ID')}
                {renderInput('AUTH0_CLIENT_SECRET', 'Auth0 Client Secret')}
                {renderInput('OKTA_DOMAIN', 'Okta Domain')}
                {renderInput('OKTA_API_TOKEN', 'Okta API Token')}
            </>)}
            {renderSection('Backend & Databases', <>
                {renderInput('FIREBASE_API_KEY', 'Firebase API Key')}
                {renderInput('SUPABASE_URL', 'Supabase URL')}
                {renderInput('SUPABASE_ANON_KEY', 'Supabase Anon Key')}
            </>)}
            {renderSection('API Development', <>
                {renderInput('POSTMAN_API_KEY', 'Postman API Key')}
                {renderInput('APOLLO_GRAPH_API_KEY', 'Apollo Graph API Key')}
            </>)}
            {renderSection('AI & Machine Learning', <>
                {renderInput('OPENAI_API_KEY', 'OpenAI API Key')}
                {renderInput('HUGGING_FACE_API_TOKEN', 'Hugging Face API Token')}
                {renderInput('GOOGLE_CLOUD_AI_API_KEY', 'Google Cloud AI API Key')}
                {renderInput('AMAZON_REKOGNITION_ACCESS_KEY', 'Amazon Rekognition Access Key')}
                {renderInput('MICROSOFT_AZURE_COGNITIVE_KEY', 'Azure Cognitive Services Key')}
                {renderInput('IBM_WATSON_API_KEY', 'IBM Watson API Key')}
            </>)}
            {renderSection('Search & Real-time', <>
              {renderInput('ALGOLIA_APP_ID', 'Algolia App ID')}
              {renderInput('ALGOLIA_ADMIN_API_KEY', 'Algolia Admin API Key')}
              {renderInput('PUSHER_APP_ID', 'Pusher App ID')}
              {renderInput('PUSHER_KEY', 'Pusher Key')}
              {renderInput('PUSHER_SECRET', 'Pusher Secret')}
              {renderInput('ABLY_API_KEY', 'Ably API Key')}
              {renderInput('ELASTICSEARCH_API_KEY', 'Elasticsearch API Key')}
            </>)}
            {renderSection('Identity & Verification', <>
              {renderInput('STRIPE_IDENTITY_SECRET_KEY', 'Stripe Identity Secret Key')}
              {renderInput('ONFIDO_API_TOKEN', 'Onfido API Token')}
              {renderInput('CHECKR_API_KEY', 'Checkr API Key')}
            </>)}
            {renderSection('Logistics & Shipping', <>
              {renderInput('LOB_API_KEY', 'Lob API Key')}
              {renderInput('EASYPOST_API_KEY', 'EasyPost API Key')}
              {renderInput('SHIPPO_API_TOKEN', 'Shippo API Token')}
            </>)}
            {renderSection('Maps & Weather', <>
              {renderInput('GOOGLE_MAPS_API_KEY', 'Google Maps API Key')}
              {renderInput('MAPBOX_ACCESS_TOKEN', 'Mapbox Access Token')}
              {renderInput('HERE_API_KEY', 'HERE API Key')}
              {renderInput('ACCUWEATHER_API_KEY', 'AccuWeather API Key')}
              {renderInput('OPENWEATHERMAP_API_KEY', 'OpenWeatherMap API Key')}
            </>)}
            {renderSection('Social & Media', <>
              {renderInput('YELP_API_KEY', 'Yelp API Key')}
              {renderInput('FOURSQUARE_API_KEY', 'Foursquare API Key')}
              {renderInput('REDDIT_CLIENT_ID', 'Reddit Client ID')}
              {renderInput('REDDIT_CLIENT_SECRET', 'Reddit Client Secret')}
              {renderInput('TWITTER_BEARER_TOKEN', 'Twitter Bearer Token')}
              {renderInput('FACEBOOK_APP_ID', 'Facebook App ID')}
              {renderInput('FACEBOOK_APP_SECRET', 'Facebook App Secret')}
              {renderInput('INSTAGRAM_APP_ID', 'Instagram App ID')}
              {renderInput('INSTAGRAM_APP_SECRET', 'Instagram App Secret')}
              {renderInput('YOUTUBE_DATA_API_KEY', 'YouTube Data API Key')}
              {renderInput('SPOTIFY_CLIENT_ID', 'Spotify Client ID')}
              {renderInput('SPOTIFY_CLIENT_SECRET', 'Spotify Client Secret')}
              {renderInput('SOUNDCLOUD_CLIENT_ID', 'SoundCloud Client ID')}
              {renderInput('TWITCH_CLIENT_ID', 'Twitch Client ID')}
              {renderInput('TWITCH_CLIENT_SECRET', 'Twitch Client Secret')}
            </>)}
            {renderSection('Media & Content', <>
              {renderInput('MUX_TOKEN_ID', 'Mux Token ID')}
              {renderInput('MUX_TOKEN_SECRET', 'Mux Token Secret')}
              {renderInput('CLOUDINARY_API_KEY', 'Cloudinary API Key')}
              {renderInput('CLOUDINARY_API_SECRET', 'Cloudinary API Secret')}
              {renderInput('IMGIX_API_KEY', 'Imgix API Key')}
            </>)}
            {renderSection('Legal & Admin', <>
              {renderInput('STRIPE_ATLAS_API_KEY', 'Stripe Atlas API Key')}
              {renderInput('CLERKY_API_KEY', 'Clerky API Key')}
              {renderInput('DOCUSIGN_INTEGRATOR_KEY', 'DocuSign Integrator Key')}
              {renderInput('HELLOSIGN_API_KEY', 'HelloSign API Key')}
            </>)}
            {renderSection('Monitoring & CI/CD', <>
              {renderInput('LAUNCHDARKLY_SDK_KEY', 'LaunchDarkly SDK Key')}
              {renderInput('SENTRY_AUTH_TOKEN', 'Sentry Auth Token')}
              {renderInput('DATADOG_API_KEY', 'Datadog API Key')}
              {renderInput('NEW_RELIC_API_KEY', 'New Relic API Key')}
              {renderInput('CIRCLECI_API_TOKEN', 'CircleCI API Token')}
              {renderInput('TRAVIS_CI_API_TOKEN', 'Travis CI API Token')}
              {renderInput('BITBUCKET_USERNAME', 'Bitbucket Username')}
              {renderInput('BITBUCKET_APP_PASSWORD', 'Bitbucket App Password')}
              {renderInput('GITLAB_PERSONAL_ACCESS_TOKEN', 'GitLab PAT')}
              {renderInput('PAGERDUTY_API_KEY', 'PagerDuty API Key')}
            </>)}
            {renderSection('Headless CMS', <>
              {renderInput('CONTENTFUL_SPACE_ID', 'Contentful Space ID')}
              {renderInput('CONTENTFUL_ACCESS_TOKEN', 'Contentful Access Token')}
              {renderInput('SANITY_PROJECT_ID', 'Sanity Project ID')}
              {renderInput('SANITY_API_TOKEN', 'Sanity API Token')}
              {renderInput('STRAPI_API_TOKEN', 'Strapi API Token')}
            </>)}
          </>
        ) : (
          <>
            {renderSection('Data Aggregators', <>
              {renderInput('PLAID_CLIENT_ID', 'Plaid Client ID')}
              {renderInput('PLAID_SECRET', 'Plaid Secret')}
              {renderInput('YODLEE_CLIENT_ID', 'Yodlee Client ID')}
              {renderInput('YODLEE_SECRET', 'Yodlee Secret')}
              {renderInput('MX_CLIENT_ID', 'MX Client ID')}
              {renderInput('MX_API_KEY', 'MX API Key')}
              {renderInput('FINICITY_PARTNER_ID', 'Finicity Partner ID')}
              {renderInput('FINICITY_APP_KEY', 'Finicity App Key')}
            </>)}
            {renderSection('Payment Processing', <>
                {renderInput('ADYEN_API_KEY', 'Adyen API Key')}
                {renderInput('ADYEN_MERCHANT_ACCOUNT', 'Adyen Merchant Account')}
                {renderInput('BRAINTREE_MERCHANT_ID', 'Braintree Merchant ID')}
                {renderInput('BRAINTREE_PUBLIC_KEY', 'Braintree Public Key')}
                {renderInput('BRAINTREE_PRIVATE_KEY', 'Braintree Private Key')}
                {renderInput('SQUARE_APPLICATION_ID', 'Square Application ID')}
                {renderInput('SQUARE_ACCESS_TOKEN', 'Square Access Token')}
                {renderInput('PAYPAL_CLIENT_ID', 'PayPal Client ID')}
                {renderInput('PAYPAL_SECRET', 'PayPal Secret')}
                {renderInput('DWOLLA_KEY', 'Dwolla Key')}
                {renderInput('DWOLLA_SECRET', 'Dwolla Secret')}
                {renderInput('WORLDPAY_API_KEY', 'Worldpay API Key')}
                {renderInput('CHECKOUT_SECRET_KEY', 'Checkout.com Secret Key')}
            </>)}
            {renderSection('Banking as a Service (BaaS) & Card Issuing', <>
                {renderInput('MARQETA_APPLICATION_TOKEN', 'Marqeta Application Token')}
                {renderInput('MARQETA_ADMIN_ACCESS_TOKEN', 'Marqeta Admin Access Token')}
                {renderInput('GALILEO_API_LOGIN', 'Galileo API Login')}
                {renderInput('GALILEO_API_TRANS_KEY', 'Galileo API Trans Key')}
                {renderInput('SOLARISBANK_CLIENT_ID', 'Solarisbank Client ID')}
                {renderInput('SOLARISBANK_CLIENT_SECRET', 'Solarisbank Client Secret')}
                {renderInput('SYNAPSE_CLIENT_ID', 'Synapse Client ID')}
                {renderInput('SYNAPSE_CLIENT_SECRET', 'Synapse Client Secret')}
                {renderInput('RAILSBANK_API_KEY', 'Railsbank API Key')}
                {renderInput('CLEARBANK_API_KEY', 'ClearBank API Key')}
                {renderInput('UNIT_API_TOKEN', 'Unit API Token')}
                {renderInput('TREASURY_PRIME_API_KEY', 'Treasury Prime API Key')}
                {renderInput('INCREASE_API_KEY', 'Increase API Key')}
                {renderInput('MERCURY_API_KEY', 'Mercury API Key')}
                {renderInput('BREX_API_KEY', 'Brex API Key')}
                {renderInput('BOND_API_KEY', 'Bond API Key')}
            </>)}
            {renderSection('International Payments', <>
                {renderInput('CURRENCYCLOUD_LOGIN_ID', 'Currencycloud Login ID')}
                {renderInput('CURRENCYCLOUD_API_KEY', 'Currencycloud API Key')}
                {renderInput('OFX_API_KEY', 'OFX API Key')}
                {renderInput('WISE_API_TOKEN', 'Wise API Token')}
                {renderInput('REMITLY_API_KEY', 'Remitly API Key')}
                {renderInput('AZIMO_API_KEY', 'Azimo API Key')}
                {renderInput('NIUM_API_KEY', 'Nium API Key')}
            </>)}
            {renderSection('Investment & Market Data', <>
              {renderInput('ALPACA_API_KEY_ID', 'Alpaca API Key ID')}
              {renderInput('ALPACA_SECRET_KEY', 'Alpaca Secret Key')}
              {renderInput('TRADIER_ACCESS_TOKEN', 'Tradier Access Token')}
              {renderInput('IEX_CLOUD_API_TOKEN', 'IEX Cloud API Token')}
              {renderInput('POLYGON_API_KEY', 'Polygon.io API Key')}
              {renderInput('FINNHUB_API_KEY', 'Finnhub API Key')}
              {renderInput('ALPHA_VANTAGE_API_KEY', 'Alpha Vantage API Key')}
              {renderInput('MORNINGSTAR_API_KEY', 'Morningstar API Key')}
              {renderInput('XIGNITE_API_TOKEN', 'Xignite API Token')}
              {renderInput('DRIVEWEALTH_API_KEY', 'DriveWealth API Key')}
            </>)}
            {renderSection('Crypto', <>
              {renderInput('COINBASE_API_KEY', 'Coinbase API Key')}
              {renderInput('COINBASE_API_SECRET', 'Coinbase API Secret')}
              {renderInput('BINANCE_API_KEY', 'Binance API Key')}
              {renderInput('BINANCE_API_SECRET', 'Binance API Secret')}
              {renderInput('KRAKEN_API_KEY', 'Kraken API Key')}
              {renderInput('KRAKEN_PRIVATE_KEY', 'Kraken Private Key')}
              {renderInput('GEMINI_API_KEY', 'Gemini API Key')}
              {renderInput('GEMINI_API_SECRET', 'Gemini API Secret')}
              {renderInput('COINMARKETCAP_API_KEY', 'CoinMarketCap API Key')}
              {renderInput('COINGECKO_API_KEY', 'CoinGecko API Key')}
              {renderInput('BLOCKIO_API_KEY', 'Block.io API Key')}
            </>)}
            {renderSection('Major Banks (Open Banking)', <>
              {renderInput('JP_MORGAN_CHASE_CLIENT_ID', 'JPMorgan Chase Client ID')}
              {renderInput('CITI_CLIENT_ID', 'Citi Client ID')}
              {renderInput('WELLS_FARGO_CLIENT_ID', 'Wells Fargo Client ID')}
              {renderInput('CAPITAL_ONE_CLIENT_ID', 'Capital One Client ID')}
            </>)}
            {renderSection('European & Global Banks (Open Banking)', <>
              {renderInput('HSBC_CLIENT_ID', 'HSBC Client ID')}
              {renderInput('BARCLAYS_CLIENT_ID', 'Barclays Client ID')}
              {renderInput('BBVA_CLIENT_ID', 'BBVA Client ID')}
              {renderInput('DEUTSCHE_BANK_API_KEY', 'Deutsche Bank API Key')}
            </>)}
            {renderSection('UK & European Aggregators', <>
              {renderInput('TINK_CLIENT_ID', 'Tink Client ID')}
              {renderInput('TRUELAYER_CLIENT_ID', 'TrueLayer Client ID')}
            </>)}
            {renderSection('Compliance & Identity (KYC/AML)', <>
              {renderInput('MIDDESK_API_KEY', 'Mid-Desk API Key')}
              {renderInput('ALLOY_API_TOKEN', 'Alloy API Token')}
              {renderInput('ALLOY_API_SECRET', 'Alloy API Secret')}
              {renderInput('COMPLYADVANTAGE_API_KEY', 'ComplyAdvantage API Key')}
            </>)}
            {renderSection('Real Estate', <>
              {renderInput('ZILLOW_API_KEY', 'Zillow API Key')}
              {renderInput('CORELOGIC_CLIENT_ID', 'CoreLogic Client ID')}
            </>)}
            {renderSection('Credit Bureaus', <>
              {renderInput('EXPERIAN_API_KEY', 'Experian API Key')}
              {renderInput('EQUIFAX_API_KEY', 'Equifax API Key')}
              {renderInput('TRANSUNION_API_KEY', 'TransUnion API Key')}
            </>)}
            {renderSection('Global Payments (Emerging Markets)', <>
              {renderInput('FINCRA_API_KEY', 'Fincra API Key')}
              {renderInput('FLUTTERWAVE_SECRET_KEY', 'Flutterwave Secret Key')}
              {renderInput('PAYSTACK_SECRET_KEY', 'Paystack Secret Key')}
              {renderInput('DLOCAL_API_KEY', 'dLocal API Key')}
              {renderInput('RAPYD_ACCESS_KEY', 'Rapyd Access Key')}
            </>)}
            {renderSection('Accounting & Tax', <>
                {renderInput('TAXJAR_API_KEY', 'TaxJar API Key')}
                {renderInput('AVALARA_API_KEY', 'Avalara API Key')}
                {renderInput('CODAT_API_KEY', 'Codat API Key')}
                {renderInput('XERO_CLIENT_ID', 'Xero Client ID')}
                {renderInput('XERO_CLIENT_SECRET', 'Xero Client Secret')}
                {renderInput('QUICKBOOKS_CLIENT_ID', 'QuickBooks Client ID')}
                {renderInput('QUICKBOOKS_CLIENT_SECRET', 'QuickBooks Client Secret')}
                {renderInput('FRESHBOOKS_API_KEY', 'FreshBooks API Key')}
            </>)}
            {renderSection('Fintech Utilities', <>
                {renderInput('ANVIL_API_KEY', 'Anvil API Key')}
                {renderInput('MOOV_CLIENT_ID', 'Moov Client ID')}
                {renderInput('MOOV_SECRET', 'Moov Secret')}
                {renderInput('VGS_USERNAME', 'VGS Username')}
                {renderInput('VGS_PASSWORD', 'VGS Password')}
                {renderInput('SILA_APP_HANDLE', 'Sila App Handle')}
                {renderInput('SILA_PRIVATE_KEY', 'Sila Private Key')}
            </>)}
          </>
        )}
        
        <div className="mt-8 pt-5 border-t border-gray-200">
          <button type="submit" className="bg-indigo-600 text-white py-2 px-5 rounded-lg text-sm font-semibold shadow-sm transition duration-200 ease-in-out hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save All Keys to Server'}
          </button>
          {statusMessage && <p className="mt-4 font-medium p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-sm">{statusMessage}</p>}
        </div>
      </form>
    </div>
  );
};


// --- Basic Data Models ---

// Model for displaying system metrics
interface SystemMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  aiPrediction: number;
}

// Model for AI-generated insights and alerts
interface AIInsight {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'market' | 'system' | 'security' | 'optimization';
  message: string;
  confidence: number;
}

// Model representing a trading algorithm
interface Algorithm {
  id: string;
  name: string;
  code: string; // Represents the algorithm logic, e.g., JSON structure for a node-based editor
  status: 'draft' | 'backtesting' | 'live' | 'error' | 'optimizing';
  version: number;
  lastModified: string;
  author: string;
  riskLevel: 'low' | 'medium' | 'high';
  aiScore: number; // AI-driven score for the algorithm's potential
  performanceMetrics?: { // Historical or backtested performance
    return: number;
    sharpe: number;
    sortino: number;
    alpha: number;
    beta: number;
    volatility: number;
    winRate: number;
  };
}

// Model for storing results of a backtesting run
interface BacktestResult {
  runId: string;
  algorithmId: string;
  startDate: string;
  endDate: string;
  equityCurve: { date: string; value: number; aiForecast: number }[]; // Time series of portfolio value
  metrics: { // Key performance indicators from the backtest
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    trades: number;
    profitFactor: number;
    expectancy: number;
  };
  aiAnalysis: string; // AI-generated qualitative analysis of the results
}

// Model for user profile information
interface UserProfile {
  id: string;
  name: string;
  role: 'Trader' | 'Analyst' | 'Administrator'; // Example roles
  clearanceLevel: number; // For access control
  email: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    aiAssistance: boolean;
  };
  stats: { // User activity statistics
    loginCount: number;
    actionsPerformed: number;
    uptime: string;
  };
}

// --- Data Utilities ---

/**
 * Generates a mock time series data for equity curves or similar financial data.
 * @param points Number of data points to generate.
 * @param startValue Initial value for the series.
 * @param volatility Controls the random fluctuation.
 * @returns An array of objects representing the time series data.
 */
const generateTimeSeries = (points: number, startValue: number, volatility: number) => {
  const data = [];
  let currentValue = startValue;
  const now = new Date();
  for (let i = 0; i < points; i++) {
    // Generate dates backwards from today
    const date = new Date(now.getTime() - (points - i) * 86400000).toISOString().split('T')[0];
    // Introduce random fluctuations
    const change = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + change);
    // Add a slightly divergent AI prediction for demonstration
    const aiForecastValue = currentValue * (1 + (Math.random() - 0.5) * 0.02);
    data.push({
      date,
      value: Math.max(0, currentValue), // Ensure value doesn't go negative
      aiForecast: Math.max(0, aiForecastValue)
    });
  }
  return data;
};

// Mock data for AI insights/alerts
const mockInsights: AIInsight[] = [
  { id: 'ins-1', timestamp: '2023-10-27 09:15:00', severity: 'high', category: 'market', message: 'Detected arbitrage opportunity in FOREX/CRYPTO bridge.', confidence: 0.98 },
  { id: 'ins-2', timestamp: '2023-10-27 09:30:00', severity: 'medium', category: 'optimization', message: 'Algorithm "Alpha-1" logic can be compressed by 15%.', confidence: 0.85 },
  { id: 'ins-3', timestamp: '2023-10-27 10:00:00', severity: 'low', category: 'system', message: 'Global latency reduced by 4ms via AI routing.', confidence: 0.99 },
  { id: 'ins-4', timestamp: '2023-10-27 10:45:00', severity: 'critical', category: 'security', message: 'Anomalous login attempt blocked by Neural Firewall.', confidence: 0.99 },
];

// Initial list of trading algorithms
const initialAlgorithms: Algorithm[] = [
  { 
    id: 'algo-1', 
    name: 'Quantum Momentum Scalper v4', 
    // Placeholder for a more complex code representation (e.g., JSON for a node editor)
    code: JSON.stringify({ nodes: ["Input: Market Stream", "Filter: Volatility > 1.5", "AI Model: Trend Predictor", "Action: Buy/Sell"] }), 
    status: 'live', 
    version: 4,
    lastModified: '2023-10-26',
    author: 'System Admin',
    riskLevel: 'high',
    aiScore: 94,
    performanceMetrics: { return: 45.2, sharpe: 2.1, sortino: 2.8, alpha: 0.15, beta: 0.8, volatility: 12.5, winRate: 68 }
  },
  { 
    id: 'algo-2', 
    name: 'Mean Reversion HFT (Neural)', 
    code: JSON.stringify({ nodes: ["Input: Order Book", "AI: Sentiment Analysis", "Logic: Spread > 0.02%", "Action: Market Make"] }), 
    status: 'backtesting', 
    version: 12,
    lastModified: '2023-10-27',
    author: 'AI Architect',
    riskLevel: 'medium',
    aiScore: 88,
    performanceMetrics: { return: 12.5, sharpe: 1.8, sortino: 1.9, alpha: 0.05, beta: 0.2, volatility: 4.2, winRate: 55 }
  },
  { 
    id: 'algo-3', 
    name: 'Global Macro Arbitrage', 
    code: JSON.stringify({ nodes: ["Input: Global Indices", "Logic: Correlation Divergence", "Action: Hedge Pair"] }), 
    status: 'draft', 
    version: 1,
    lastModified: '2023-10-27',
    author: 'User',
    riskLevel: 'low',
    aiScore: 72,
  },
];

// Mock user profile data
const mockUserProfile: UserProfile = {
  id: 'u-001',
  name: 'Trader',
  role: 'Administrator',
  clearanceLevel: 5,
  email: 'admin@local',
  preferences: { theme: 'light', notifications: true, aiAssistance: true },
  stats: { loginCount: 1420, actionsPerformed: 54300, uptime: '99.99%' }
};

// --- Basic UI Components ---

// Reusable button component with different variants and icons
const Button = ({ icon: Icon, children, onClick, variant = 'primary', disabled = false, className = '' }: any) => {
  const baseClasses = "flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm transition duration-200 ease-in-out font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  let colorClasses = "";

  switch (variant) {
    case 'primary':
      colorClasses = "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-300";
      break;
    case 'secondary':
      colorClasses = "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-indigo-500 disabled:bg-gray-100";
      break;
    case 'danger':
      colorClasses = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300";
      break;
    case 'success':
      colorClasses = "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-300";
      break;
    case 'ghost':
      colorClasses = "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:text-gray-400 shadow-none";
      break;
  }

  return (
    <button className={`${baseClasses} ${colorClasses} ${className}`} onClick={onClick} disabled={disabled}>
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  );
};

// Reusable card component for structuring content
const Card = ({ title, subtitle, children, className = '', actions = null }: any) => (
  <div className={`bg-white shadow-xl rounded-xl border border-gray-100 flex flex-col ${className}`}>
    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex space-x-2">{actions}</div>}
    </div>
    <div className="p-6 flex-grow overflow-auto">
      {children}
    </div>
  </div>
);

// Badge component for displaying labels or tags
const Badge = ({ children, color = 'gray' }: { children: React.ReactNode, color?: string }) => {
  const colors: any = {
    gray: 'bg-gray-100 text-gray-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {children}
    </span>
  );
};

// Progress bar component for visualizing progress
const ProgressBar = ({ value, max = 100, color = 'indigo', label }: any) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      {label && <span className="text-xs font-medium text-gray-700">{label}</span>}
      <span className="text-xs font-medium text-gray-500">{Math.round((value / max) * 100)}%</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`bg-${color}-600 h-2 rounded-full transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

// --- Dashboard Widgets ---

// Widget to display AI system status and metrics
const AIStatusMonitor = () => {
  // Simulated system stats
  const stats = [
    { label: 'Neural Core Load', value: 45, color: 'indigo' },
    { label: 'Global Latency', value: 12, max: 100, color: 'green' },
    { label: 'Predictive Accuracy', value: 94, color: 'purple' },
    { label: 'Security Threat Level', value: 5, color: 'red' },
  ];

  return (
    <Card title="System Status" subtitle="Real-time Monitoring">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <ProgressBar key={idx} label={stat.label} value={stat.value} max={stat.max || 100} color={stat.color} />
        ))}
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Active Processes</h4>
        <div className="space-y-2">
          {['Market Sentiment Analysis', 'Risk Vector Calculation', 'Liquidity Optimization', 'User Behavior Modeling'].map((proc, i) => (
            <div key={i} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded border border-gray-100">
              <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>{proc}</span>
              <span className="text-gray-500 font-mono">PID: {2000 + i * 15}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

// Widget to display global market pulse and AI sentiment
const GlobalMarketPulse = () => {
  // Mock market data
  const markets = [
    { name: 'S&P 500', price: '4,120.50', change: '+0.45%', sentiment: 'Bullish' },
    { name: 'BTC/USD', price: '64,230.00', change: '+2.10%', sentiment: 'Very Bullish' },
    { name: 'EUR/USD', price: '1.0850', change: '-0.12%', sentiment: 'Neutral' },
    { name: 'Gold', price: '1,980.20', change: '+0.80%', sentiment: 'Bullish' },
    { name: 'Crude Oil', price: '78.40', change: '-1.20%', sentiment: 'Bearish' },
  ];

  return (
    <Card title="Global Market Pulse" subtitle="AI-Driven Sentiment & Pricing">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">AI Sentiment</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {markets.map((m) => (
              <tr key={m.name} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.name}</td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-right text-gray-500">{m.price}</td>
                <td className={`px-3 py-4 whitespace-nowrap text-sm text-right font-bold ${m.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{m.change}</td>
                <td className="px-3 py-4 whitespace-nowrap text-center">
                  <Badge color={m.sentiment.includes('Bullish') ? 'green' : m.sentiment.includes('Bearish') ? 'red' : 'gray'}>{m.sentiment}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

// No-code editor component for building trading algorithms visually
const NoCodeEditor = ({ algorithm, onUpdateCode }: { algorithm: Algorithm, onUpdateCode: (code: string) => void }) => {
  // Parse the algorithm code JSON into blocks, default to empty array if invalid
  const [blocks, setBlocks] = useState<string[]>(() => {
    try {
      // Assuming algorithm.code is a JSON string like '{"nodes":["Node1", "Node2"]}'
      const parsedCode = JSON.parse(algorithm.code);
      return parsedCode.nodes || [];
    } catch (e) {
      console.error("Error parsing algorithm code:", e);
      return []; // Return empty array if parsing fails
    }
  });

  // Handler to add a new block to the algorithm
  const handleAddBlock = (type: string) => {
    // Construct a descriptive name for the new block
    const newBlock = `${type}: ${type === 'AI' ? 'Neural Optimization' : type === 'Input' ? 'Market Stream' : type === 'Logic' ? 'Condition Check' : 'Execute Trade'}`;
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    // Update the parent component with the new code representation
    onUpdateCode(JSON.stringify({ nodes: newBlocks }));
  };

  // Handler for AI-driven optimization of the algorithm
  const handleOptimize = () => {
    // Simulate optimization by adding "(Optimized)" to non-AI blocks
    const optimized = blocks.map(b => b.startsWith('AI') ? b : `${b} (Optimized by AI)`);
    setBlocks(optimized);
    onUpdateCode(JSON.stringify({ nodes: optimized }));
  };

  // Handler to remove a block
  const handleDeleteBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
    onUpdateCode(JSON.stringify({ nodes: newBlocks }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-lg border border-gray-200">
      {/* Toolbar for adding new blocks */}
      <div className="p-3 border-b border-gray-200 bg-white rounded-t-lg flex flex-wrap gap-2">
        <Button icon={Code} onClick={() => handleAddBlock('Input')} variant="secondary" className="text-xs">Input</Button>
        <Button icon={TrendingUp} onClick={() => handleAddBlock('Indicator')} variant="secondary" className="text-xs">Indicator</Button>
        <Button icon={Settings} onClick={() => handleAddBlock('Logic')} variant="secondary" className="text-xs">Logic</Button>
        <Button icon={DollarSign} onClick={() => handleAddBlock('Action')} variant="secondary" className="text-xs">Action</Button>
        <div className="flex-grow"></div> {/* Spacer */}
        <Button icon={RefreshCw} onClick={handleOptimize} variant="primary" className="text-xs bg-purple-600 hover:bg-purple-700">AI Auto-Optimize</Button>
      </div>
      {/* Workspace for algorithm blocks */}
      <div className="flex-grow p-4 overflow-y-auto space-y-3">
        {/* Placeholder message when no blocks are present */}
        {blocks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Code className="w-12 h-12 mb-2 opacity-20" />
            <p>Drag blocks or use the toolbar to build your strategy.</p>
          </div>
        )}
        {/* Render each block */}
        {blocks.map((block, index) => (
          <div key={index} className="group relative bg-white border border-indigo-100 p-4 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Visual indicator for block type */}
              <div className={`w-2 h-full absolute left-0 top-0 bottom-0 rounded-l-lg ${block.startsWith('Input') ? 'bg-blue-500' : block.startsWith('Action') ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
              <span className="font-mono text-sm text-gray-700 ml-2">{block}</span>
            </div>
            {/* Delete button, hidden by default, shown on hover */}
            <X className="w-4 h-4 text-gray-300 cursor-pointer hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteBlock(index)} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Component for running backtests and displaying results
const Backtester = ({ algorithm }: { algorithm: Algorithm }) => {
  const [results, setResults] = useState<BacktestResult[]>([]); // State to store backtest results
  const [isBacktesting, setIsBacktesting] = useState(false); // State to track if backtest is running

  // Handler to initiate a backtest simulation
  const handleRun = useCallback(() => {
    setIsBacktesting(true); // Set loading state
    // Simulate an asynchronous backtest operation
    setTimeout(() => {
      // Generate a mock backtest result
      const newResult: BacktestResult = {
        runId: `bt-${Date.now()}`, // Unique ID for the run
        algorithmId: algorithm.id,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        equityCurve: generateTimeSeries(50, 10000, 0.05), // Generate mock equity curve
        metrics: { // Generate mock performance metrics
          totalReturn: parseFloat((Math.random() * 40 + 10).toFixed(2)),
          sharpeRatio: parseFloat((Math.random() * 2 + 1).toFixed(2)),
          maxDrawdown: parseFloat((-Math.random() * 15).toFixed(2)),
          trades: Math.floor(Math.random() * 500 + 100),
          profitFactor: parseFloat((Math.random() * 1 + 1.2).toFixed(2)),
          expectancy: parseFloat((Math.random() * 0.5).toFixed(2)),
        },
        aiAnalysis: "Strategy exhibits strong momentum characteristics but may be overfitted to Q2 volatility. Suggest increasing stop-loss buffer by 0.5%." // Mock AI analysis
      };
      setResults([newResult, ...results]); // Add new result to the top of the list
      setIsBacktesting(false); // Reset loading state
    }, 1500); // Simulate 1.5 second delay
  }, [algorithm.id, results]);

  const latest = results[0]; // Get the most recent result for display

  return (
    <Card title="Simulation & Deployment" subtitle="Backtesting Engine">
      <div className="space-y-6">
        {/* Button to trigger the backtest */}
        <Button icon={Play} onClick={handleRun} disabled={isBacktesting} variant="primary" className="w-full py-3 text-lg">
          {isBacktesting ? 'Running Simulation...' : 'Run Simulation'}
        </Button>

        {/* Display latest results if available */}
        {latest && (
          <div className="animate-fade-in">
            {/* AI Analysis section */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-4">
              <h4 className="font-bold text-indigo-900 flex items-center mb-2">
                <TrendingUp className="w-4 h-4 mr-2" /> AI Analysis
              </h4>
              <p className="text-sm text-indigo-800 leading-relaxed">{latest.aiAnalysis}</p>
            </div>

            {/* Key Metrics display */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 uppercase">Total Return</div>
                <div className="text-2xl font-bold text-green-600">+{latest.metrics.totalReturn}%</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 uppercase">Sharpe Ratio</div>
                <div className="text-2xl font-bold text-blue-600">{latest.metrics.sharpeRatio}</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 uppercase">Max Drawdown</div>
                <div className="text-2xl font-bold text-red-600">{latest.metrics.maxDrawdown}%</div>
              </div>
              <div className="bg-white p-3 rounded border border-gray-200 shadow-sm">
                <div className="text-xs text-gray-500 uppercase">Profit Factor</div>
                <div className="text-2xl font-bold text-purple-600">{latest.metrics.profitFactor}</div>
              </div>
            </div>
            
            {/* Equity Curve visualization (simplified) */}
            <div className="h-32 bg-gray-50 rounded border border-gray-200 flex items-end justify-between px-2 pb-2 overflow-hidden">
               {latest.equityCurve.map((pt, i) => (
                 <div key={i} className="w-1 bg-indigo-400 hover:bg-indigo-600 transition-colors" style={{ height: `${(pt.value / 15000) * 100}%` }} title={`Date: ${pt.date}, Val: ${pt.value.toFixed(2)}`}></div>
               ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Component to display a list of trading algorithms
const AlgoList = ({ algorithms, selectedAlgo, onSelect, onCreate }: any) => (
  <Card title="Strategy Portfolio" subtitle="Managed Algorithms" actions={<Button icon={Plus} onClick={onCreate} variant="secondary" className="px-2 py-1 text-xs">New</Button>} className="h-full">
    <div className="space-y-3">
      {algorithms.map((algo: Algorithm) => (
        <div
          key={algo.id}
          onClick={() => onSelect(algo)}
          className={`p-4 rounded-lg cursor-pointer border transition-all duration-200 ${selectedAlgo?.id === algo.id ? 'bg-indigo-50 border-indigo-500 shadow-md transform scale-[1.02]' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-900">{algo.name}</h4>
            <Badge color={algo.status === 'live' ? 'green' : algo.status === 'backtesting' ? 'yellow' : 'gray'}>{algo.status.toUpperCase()}</Badge>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>v{algo.version}</span>
            <span className="flex items-center text-indigo-600 font-semibold"><TrendingUp className="w-3 h-3 mr-1" /> AI Score: {algo.aiScore}</span>
          </div>
          {algo.performanceMetrics && (
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-gray-400 block">Return</span>
                <span className="font-medium text-green-600">+{algo.performanceMetrics.return}%</span>
              </div>
              <div>
                <span className="text-gray-400 block">Sharpe</span>
                <span className="font-medium text-gray-700">{algo.performanceMetrics.sharpe}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Win Rate</span>
                <span className="font-medium text-gray-700">{algo.performanceMetrics.winRate}%</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </Card>
);

// --- Navigation Layout ---

// SVG component for Plus icon (used in AlgoList for 'New' button)
const Plus = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

// Define navigation items for the sidebar
const NAV_ITEMS = [
    { name: 'Executive Dashboard', icon: DollarSign },
    { name: 'Global Transactions', icon: History },
    { name: 'Liquidity Transfer', icon: DollarSign }, // Reusing DollarSign as Send is not imported
    { name: 'Budgetary Control', icon: TrendingUp }, // Reusing TrendingUp as Target not imported
    { name: 'Strategic Goals', icon: TrendingUp },
    { name: 'Credit Health Monitor', icon: TrendingUp }, // Reusing TrendingUp as Heart not imported
    { name: 'Investment Portfolio', icon: TrendingUp },
    { name: 'Web3 & Crypto Bridge', icon: TrendingUp }, // Reusing TrendingUp as Crypto not imported
    { name: 'Algo-Trading Lab', icon: Code, current: true }, // Mark Algo-Trading Lab as current
    { name: 'Forex Arbitrage Arena', icon: TrendingUp }, // Reusing TrendingUp as Scale not imported
    { name: 'Commodities Exchange', icon: TrendingUp }, // Reusing TrendingUp as Wheat not imported
    { name: 'Real Estate Empire', icon: TrendingUp }, // Reusing TrendingUp as Building not imported
    { name: 'Art & NFT Vault', icon: TrendingUp }, // Reusing TrendingUp as Palette not imported
    { name: 'Derivatives Desk', icon: TrendingUp }, // Reusing TrendingUp as PieChart not imported
    { name: 'Venture Capital', icon: TrendingUp }, // Reusing TrendingUp as Rocket not imported
    { name: 'Private Equity', icon: TrendingUp }, // Reusing TrendingUp as Briefcase not imported
    { name: 'Tax Optimization AI', icon: TrendingUp }, // Reusing TrendingUp as Receipt not imported
    { name: 'Legacy Planning', icon: TrendingUp }, // Reusing TrendingUp as Legacy not imported
    { name: 'Corporate Treasury', icon: TrendingUp }, // Reusing TrendingUp as Globe not imported
    { name: 'Modern Treasury API', icon: TrendingUp }, // Reusing TrendingUp as Key not imported
    { name: 'Card Issuance (Marqeta)', icon: TrendingUp }, // Reusing TrendingUp as CreditCard not imported
    { name: 'Data Aggregation (Plaid)', icon: TrendingUp }, // Reusing TrendingUp as Link not imported
    { name: 'Payment Rails (Stripe)', icon: TrendingUp }, // Reusing TrendingUp as Zap not imported
    { name: 'Identity (SSO)', icon: TrendingUp }, // Reusing TrendingUp as Lock not imported
    { name: 'AI Financial Advisor', icon: TrendingUp }, // Reusing TrendingUp as Brain not imported
    { name: 'Quantum Weaver AI', icon: TrendingUp }, // Reusing TrendingUp as Atom not imported
    { name: 'Agent Marketplace', icon: TrendingUp }, // Reusing TrendingUp as Users not imported
    { name: 'Ad Studio AI', icon: TrendingUp }, // Reusing TrendingUp as Megaphone not imported
    { name: 'Card Customization', icon: TrendingUp }, // Reusing TrendingUp as CreditCard not imported
    { name: 'DAO Governance', icon: TrendingUp }, // Reusing TrendingUp as Handshake not imported
    { name: 'Open Banking API', icon: TrendingUp }, // Reusing TrendingUp as Link not imported
    { name: 'System Status', icon: TrendingUp }, // Reusing TrendingUp as Activity not imported
    { name: 'API Settings', icon: Settings },
    { name: 'Concierge', icon: TrendingUp }, // Reusing TrendingUp as Phone not imported
    { name: 'Philanthropy', icon: TrendingUp }, // Reusing TrendingUp as Heart not imported
    { name: 'Wealth Management', icon: TrendingUp }, // Reusing TrendingUp as Crown not imported
    { name: 'Security Center', icon: TrendingUp }, // Reusing TrendingUp as Shield not imported
    { name: 'Personalization', icon: TrendingUp }, // Reusing TrendingUp as Sparkles not imported
    { name: 'System Manifesto', icon: TrendingUp }, // Reusing TrendingUp as Eye not imported
];

// Sidebar component for application navigation
const AppSidebar = ({ onNavigate, activeView }: any) => {
    const [isCollapsed, setIsCollapsed] = useState(false); // State for sidebar collapse

    return (
        // Sidebar container with transition for collapse animation
        <div className={`h-full bg-gray-900 text-white flex flex-col transition-all duration-300 shadow-2xl z-20 ${isCollapsed ? 'w-20' : 'w-72'}`}>
            {/* Header section with logo and collapse button */}
            <div className="p-5 flex items-center justify-between border-b border-gray-800 bg-gray-900">
                {!isCollapsed && (
                  <div>
                    {/* Application Title */}
                    <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tighter">TRADING OS</h1>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase">Trading Dashboard</p>
                  </div>
                )}
                {/* Collapse/Expand button */}
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)} 
                    className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
            
            {/* User Profile section */}
            <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors" onClick={() => onNavigate("Profile")}>
                    {/* User Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-gray-700">
                        TR {/* Initials */}
                    </div>
                    {/* User Name and Status (visible when not collapsed) */}
                    {!isCollapsed && (
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-200 truncate">Trader</p>
                        <p className="text-xs text-green-400 flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span> Online</p>
                      </div>
                    )}
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-grow overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon; // Get the icon component
                    const isActive = item.name === activeView; // Check if the item is the currently active view
                    return (
                        <a
                            key={item.name}
                            href="#" // Prevent default anchor behavior
                            onClick={(e) => { e.preventDefault(); onNavigate(item.name); }} // Handle navigation click
                            className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                        >
                            <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                            {/* Navigation item name, hidden when collapsed */}
                            <span className={`ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                                {item.name}
                            </span>
                            {/* Active indicator dot */}
                            {!isCollapsed && isActive && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </a>
                    );
                })}
            </nav>
            
            {/* Footer with version and status */}
            <div className="p-4 border-t border-gray-800 bg-gray-900 text-xs text-gray-600 text-center">
              {!isCollapsed && "v10.4.2-Personal | Secure Connection"}
            </div>
        </div>
    );
}

// Component displaying system information/manifesto
const SystemManifesto = () => (
  <Card title="System Information" className="h-full overflow-y-auto">
    {/* Using Tailwind Typography for better prose rendering */}
    <div className="prose prose-lg max-w-none text-gray-700 p-4">
      <h3 className="text-2xl font-bold text-indigo-900 border-b pb-2 mb-4">System Overview</h3>
      <p className="mb-4">
        This application serves as a dashboard for algorithmic trading and financial monitoring.
      </p>
      {/* Feature highlights */}
      <div className="bg-indigo-50 p-6 rounded-xl border-l-4 border-indigo-600 my-6">
        <h4 className="text-lg font-bold text-indigo-800 mb-2">Key Features</h4>
        <ul className="list-disc list-inside space-y-2 text-indigo-900">
          <li><strong>Monitoring:</strong> Real-time system and market tracking.</li>
          <li><strong>Strategy:</strong> Algorithm creation and backtesting.</li>
          <li><strong>Management:</strong> Portfolio and resource oversight.</li>
        </ul>
      </div>
      <p className="mb-4">
        Designed for efficiency and clarity in financial operations.
      </p>
    </div>
  </Card>
);

// --- Main Layout ---

// Main component for the Algo Trading Lab section of the application
const AlgoTradingLab: React.FC = () => {
  // State for managing the list of algorithms
  const [algorithms, setAlgorithms] = useState<Algorithm[]>(initialAlgorithms);
  // State for the ID of the currently selected algorithm
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(initialAlgorithms[0].id);
  // State for the currently active view in the main content area
  const [currentView, setCurrentView] = useState('Algo-Trading Lab');
  // State for notifications (AI insights)
  const [notifications, setNotifications] = useState<AIInsight[]>(mockInsights);

  // Memoized selection of the current algorithm based on selectedAlgoId
  const selectedAlgorithm = useMemo(() => algorithms.find(a => a.id === selectedAlgoId) || initialAlgorithms[0], [algorithms, selectedAlgoId]);

  // Callback to update the code of the selected algorithm
  const handleUpdateCode = useCallback((code: string) => {
    setAlgorithms(prev => prev.map(a => 
      a.id === selectedAlgoId 
        ? { ...a, code, status: 'draft', lastModified: new Date().toISOString().split('T')[0] } // Update code and status
        : a
    ));
  }, [selectedAlgoId]);

  // Callback to create a new algorithm
  const handleCreate = useCallback(() => {
    const newAlgo: Algorithm = {
      id: `algo-${Date.now()}`, // Generate unique ID
      name: `New Strategy ${algorithms.length + 1}`, // Default name
      code: JSON.stringify({ nodes: [] }), // Default empty code structure
      status: 'draft', // Initial status
      version: 1,
      lastModified: new Date().toISOString().split('T')[0],
      author: 'User',
      riskLevel: 'low',
      aiScore: 50
    };
    setAlgorithms([...algorithms, newAlgo]); // Add new algorithm to the list
    setSelectedAlgoId(newAlgo.id); // Select the newly created algorithm
  }, [algorithms]);

  // Function to render the main content based on the currentView state
  const renderContent = () => {
    switch (currentView) {
      case 'System Manifesto':
        return <SystemManifesto />; // Render System Manifesto
      case 'API Settings':
        return <ApiSettings />; // Render API Settings
      case 'Executive Dashboard':
        // Layout for the Executive Dashboard
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto pb-10">
            <AIStatusMonitor /> {/* AI Status Widget */}
            <GlobalMarketPulse /> {/* Market Pulse Widget */}
            <div className="lg:col-span-2">
               {/* System-Wide Alerts Card */}
               <Card title="System-Wide Alerts" subtitle="AI Detected Anomalies">
                 <div className="space-y-2">
                   {notifications.map(n => (
                     <div key={n.id} className={`p-3 rounded border-l-4 flex justify-between items-center ${n.severity === 'critical' ? 'bg-red-50 border-red-500' : n.severity === 'high' ? 'bg-orange-50 border-orange-500' : 'bg-blue-50 border-blue-500'}`}>
                       <div>
                         <span className="font-bold text-gray-800 block">{n.category.toUpperCase()} ALERT</span>
                         <span className="text-sm text-gray-600">{n.message}</span>
                       </div>
                       <Badge color={n.severity === 'critical' ? 'red' : 'blue'}>{n.confidence * 100}% Conf.</Badge>
                     </div>
                   ))}
                 </div>
               </Card>
            </div>
          </div>
        );
      case 'Algo-Trading Lab':
        // Layout for the Algo Trading Lab view
        return (
          <div className="flex flex-col h-full space-y-6 overflow-hidden">
            <div className="grid grid-cols-12 gap-6 h-full min-h-0">
              {/* Algo List Panel */}
              <div className="col-span-12 lg:col-span-3 h-full overflow-hidden flex flex-col">
                <AlgoList algorithms={algorithms} selectedAlgo={selectedAlgorithm} onSelect={(a: Algorithm) => setSelectedAlgoId(a.id)} onCreate={handleCreate} />
              </div>
              {/* Editor Panel */}
              <div className="col-span-12 lg:col-span-6 h-full overflow-hidden flex flex-col">
                <Card title={`Editor: ${selectedAlgorithm.name}`} subtitle={`v${selectedAlgorithm.version} - ${selectedAlgorithm.status.toUpperCase()}`} className="h-full flex flex-col">
                  <NoCodeEditor algorithm={selectedAlgorithm} onUpdateCode={handleUpdateCode} />
                </Card>
              </div>
              {/* Backtester Panel */}
              <div className="col-span-12 lg:col-span-3 h-full overflow-hidden flex flex-col">
                <Backtester algorithm={selectedAlgorithm} />
              </div>
            </div>
          </div>
        );
      default:
        // Default view for unhandled states or loading
        return (
          <div className="flex flex-col items-center justify-center h-full bg-white rounded-xl shadow-lg border border-gray-100 p-10 text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
              <Settings className="w-12 h-12 text-indigo-600 animate-spin-slow" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentView}</h2>
            <p className="text-gray-500 max-w-md mb-8">This module is currently initializing. Connection in progress...</p>
            <Button icon={RefreshCw} onClick={() => {}} variant="primary">Retry Connection</Button>
          </div>
        );
    }
  };

  // Main application render function
  return (
    <div className="h-screen w-full flex bg-gray-100 font-sans overflow-hidden text-gray-900">
      {/* App Sidebar */}
      <AppSidebar onNavigate={setCurrentView} activeView={currentView} />
      
      {/* Main content area */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center">
            {/* Current View Title */}
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">{currentView}</h2>
            {/* Active Session Indicator for Algo-Trading Lab */}
            {currentView === 'Algo-Trading Lab' && <span className="ml-3 px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-xs font-bold">ACTIVE SESSION</span>}
          </div>
          {/* Right-aligned header elements */}
          <div className="flex items-center space-x-4">
            {/* System Status Indicator */}
            <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-600">System Optimal</span>
            </div>
            {/* History Button with Notification Dot */}
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors relative">
              <History className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            {/* User Profile Button */}
            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors">
              <User className="w-5 h-5" />
            </button>
            {/* Logout Button */}
            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" onClick={() => alert("Secure Logout Initiated")}>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Workspace Area */}
        <main className="flex-grow p-6 overflow-hidden relative">
          {renderContent()} {/* Render content based on currentView */}
        </main>
      </div>
    </div>
  );
};

export default AlgoTradingLab;

// --- CONSOLIDATED FROM: ./components/AlgoTradingLab (4).tsx ---



// --- CONSOLIDATED FROM: AlgoTradingLab (4)_1.tsx ---

import React, { useState, useCallback, useMemo } from 'react';
import { 
  RefreshCw, Play, Save, History, Code, Settings, TrendingUp, DollarSign, X, User, LogOut,
  Plus, Search, Filter, ChevronDown, ChevronUp, BrainCircuit, Bot, SlidersHorizontal,
  LayoutDashboard, Repeat, Send, Target, Trophy, Heart, Briefcase, Link, Zap, Lock,
  Atom, Users, Megaphone, CreditCard, Handshake, Activity, Phone, Shield, Sparkles, Eye,
  Globe, Key, Receipt, Rocket, PieChart, Palette, Building, Wheat, Scale, Crown, FileText,
  Server, Network, GitBranch, HardDrive, Cpu, Database, Cloud, Terminal, BookOpen,
  BarChart2, CheckSquare, Calendar, MessageSquare, LifeBuoy
} from 'lucide-react';

// --- Expanded Data Models ---

interface SystemMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  aiPrediction: number;
  subMetrics?: { label: string; value: string }[];
}

interface AIInsight {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'market' | 'system' | 'security' | 'optimization' | 'regulatory';
  message: string;
  confidence: number;
  actionable: boolean;
  relatedEntityId?: string;
}

interface AlgorithmParameter {
  name: string;
  type: 'number' | 'string' | 'boolean';
  value: any;
  range?: [number, number];
  description: string;
}

interface Algorithm {
  id: string;
  name: string;
  description: string;
  tags: string[];
  code: string; // Can be JSON for No-Code or raw script
  language: 'nocode' | 'python' | 'rust';
  status: 'draft' | 'backtesting' | 'live' | 'error' | 'optimizing' | 'archived';
  version: number;
  lastModified: string;
  author: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  aiScore: number; // 0-100, AI's confidence in the algo's viability
  parameters: AlgorithmParameter[];
  deploymentTarget: 'cloud-cluster-a' | 'edge-node-tokyo' | 'quantum-fabric-1';
  performanceMetrics?: {
    pnl: number;
    return: number;
    sharpe: number;
    sortino: number;
    alpha: number;
    beta: number;
    volatility: number;
    winRate: number;
    maxDrawdown: number;
  };
  // "GEIN" implementation
  geinFactor: number;
  interactionMatrix: number[][];
  dataPointSensitivity: Record<string, number>;
  layerMetrics: Record<string, { gein: number; activation: number }>;
  executionPriority: 'low' | 'normal' | 'high' | 'critical' | 'quantum';
  computeProfile: 'cpu-bound' | 'memory-bound' | 'io-bound' | 'gpu-accelerated';
  dataSources: string[];
  dependencies: { name: string; version: string }[];
  permissions: string[];
  ownerTeam: string;
  isAudited: boolean;
  auditHistory: { date: string; auditor: string; result: 'pass' | 'fail' }[];
}

interface BacktestResult {
  runId: string;
  algorithmId: string;
  algorithmVersion: number;
  startDate: string;
  endDate:string;
  initialCapital: number;
  finalCapital: number;
  equityCurve: { date: string; value: number; aiForecast: number }[];
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    trades: number;
    profitFactor: number;
    expectancy: number;
    avgTradeReturn: number;
  };
  parametersSnapshot: AlgorithmParameter[];
  aiAnalysis: string;
  tradeLog: { timestamp: string; type: 'buy' | 'sell'; asset: string; quantity: number; price: number; pnl: number }[];
}

interface UserProfile {
  id: string;
  name: string;
  role: 'Administrator' | 'Trader' | 'Quant' | 'Observer';
  clearanceLevel: number;
  email: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto' | 'matrix';
    notifications: 'all' | 'critical' | 'none';
    aiAssistanceLevel: 'minimal' | 'standard' | 'proactive';
    defaultView: string;
  };
  apiKeys: { service: string; key: string; lastUsed: string }[];
  security: {
    twoFactorEnabled: boolean;
    lastLogin: string;
    loginHistory: { timestamp: string; ip: string; status: 'success' | 'failed' }[];
  };
  stats: {
    loginCount: number;
    actionsPerformed: number;
    uptime: string;
    pnlContribution: number;
  };
}

// --- Data Utilities & Mocks ---

const generateTimeSeries = (points: number, startValue: number, volatility: number) => {
  const data = [];
  let currentValue = startValue;
  const now = new Date();
  for (let i = 0; i < points; i++) {
    const date = new Date(now.getTime() - (points - i) * 86400000).toISOString().split('T')[0];
    const change = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + change);
    data.push({
      date,
      value: currentValue,
      aiForecast: currentValue * (1 + (Math.random() - 0.5) * 0.02)
    });
  }
  return data;
};

const mockInsights: AIInsight[] = [
  { id: 'ins-1', timestamp: '2023-10-27 09:15:00', severity: 'high', category: 'market', message: 'Detected arbitrage opportunity in FOREX/CRYPTO bridge.', confidence: 0.98, actionable: true, relatedEntityId: 'algo-3' },
  { id: 'ins-2', timestamp: '2023-10-27 09:30:00', severity: 'medium', category: 'optimization', message: 'Algorithm "Alpha-1" logic can be compressed by 15%. Suggest refactor.', confidence: 0.85, actionable: true, relatedEntityId: 'algo-1' },
  { id: 'ins-3', timestamp: '2023-10-27 10:00:00', severity: 'low', category: 'system', message: 'Global latency reduced by 4ms via AI routing.', confidence: 0.99, actionable: false },
  { id: 'ins-4', timestamp: '2023-10-27 10:45:00', severity: 'critical', category: 'security', message: 'Anomalous login attempt blocked by Neural Firewall.', confidence: 0.99, actionable: false },
  { id: 'ins-5', timestamp: '2023-10-27 11:00:00', severity: 'medium', category: 'regulatory', message: 'New SEC filing detected for AAPL. Potential volatility increase.', confidence: 0.92, actionable: true },
];

const initialAlgorithms: Algorithm[] = [
  { 
    id: 'algo-1', 
    name: 'Quantum Momentum Scalper v4', 
    description: 'High-frequency scalping strategy utilizing quantum-inspired principles for momentum prediction.',
    tags: ['HFT', 'Scalping', 'Momentum', 'Quantum'],
    code: '{"nodes":["Input: L2 Market Data Stream", "Filter: Volatility > 1.5", "AI Model: Quantum Trend Predictor", "Logic: If confidence > 0.95", "Action: Buy/Sell 100 units"]}', 
    language: 'nocode',
    status: 'live', 
    version: 4,
    lastModified: '2023-10-26',
    author: 'System Admin',
    riskLevel: 'high',
    aiScore: 94,
    parameters: [
      { name: 'Volatility Threshold', type: 'number', value: 1.5, range: [0.5, 5], description: 'Minimum volatility to activate trading.' },
      { name: 'Trade Size', type: 'number', value: 100, range: [10, 1000], description: 'Number of units per trade.' }
    ],
    deploymentTarget: 'cloud-cluster-a',
    performanceMetrics: { pnl: 125000, return: 45.2, sharpe: 2.1, sortino: 2.8, alpha: 0.15, beta: 0.8, volatility: 12.5, winRate: 68, maxDrawdown: -8.2 },
    geinFactor: 0.98,
    interactionMatrix: [[1, 0.2, -0.1], [0.2, 1, 0.5], [-0.1, 0.5, 1]],
    dataPointSensitivity: { 'L2.bid_price': 0.8, 'L2.ask_price': 0.8, 'volatility': 0.9 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.95 }, 'quantum_core': { gein: 0.99, activation: 0.98 }, 'output': { gein: 1.0, activation: 0.96 } },
    executionPriority: 'quantum',
    computeProfile: 'gpu-accelerated',
    dataSources: ['L2 Market Data Stream', 'Global News Feed API'],
    dependencies: [{ name: 'quantum-tensor-lib', version: '2.5.1' }],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'Quantum Core Team',
    isAudited: true,
    auditHistory: [{ date: '2023-09-15', auditor: 'Internal Security', result: 'pass' }]
  },
  { 
    id: 'algo-2', 
    name: 'Mean Reversion HFT (Neural)', 
    description: 'Neural network-based strategy that capitalizes on short-term mean reversion in liquid assets.',
    tags: ['HFT', 'Mean Reversion', 'AI', 'Market Making'],
    code: '{"nodes":["Input: Order Book Depth", "AI: Sentiment Analysis (News Feeds)", "Logic: Spread > 0.02% AND Reversion Signal", "Action: Market Make (Bid/Ask)"]}', 
    language: 'nocode',
    status: 'backtesting', 
    version: 12,
    lastModified: '2023-10-27',
    author: 'AI Architect',
    riskLevel: 'medium',
    aiScore: 88,
    parameters: [
      { name: 'Spread Threshold', type: 'number', value: 0.02, range: [0.01, 0.1], description: 'Minimum bid-ask spread to engage.' },
      { name: 'Sentiment Weight', type: 'number', value: 0.3, range: [0, 1], description: 'Influence of news sentiment on trade logic.' }
    ],
    deploymentTarget: 'edge-node-tokyo',
    performanceMetrics: { pnl: 45000, return: 12.5, sharpe: 1.8, sortino: 1.9, alpha: 0.05, beta: 0.2, volatility: 4.2, winRate: 55, maxDrawdown: -4.1 },
    geinFactor: 0.85,
    interactionMatrix: [[1, 0.7], [0.7, 1]],
    dataPointSensitivity: { 'spread': 0.9, 'sentiment': 0.6 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.9 }, 'neural_net': { gein: 0.8, activation: 0.92 }, 'output': { gein: 1.0, activation: 0.88 } },
    executionPriority: 'high',
    computeProfile: 'cpu-bound',
    dataSources: ['Order Book Depth', 'News Feeds'],
    dependencies: [{ name: 'sentiment-analyzer', version: '4.2.0' }],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'AI Research',
    isAudited: true,
    auditHistory: [{ date: '2023-08-20', auditor: 'External Audit Co.', result: 'pass' }]
  },
  { 
    id: 'algo-3', 
    name: 'Global Macro Arbitrage', 
    description: 'Long-term strategy identifying and exploiting price discrepancies between correlated global assets.',
    tags: ['Macro', 'Arbitrage', 'Global', 'Low-Risk'],
    code: '{"nodes":["Input: Global Indices (S&P, FTSE, NIKKEI)", "Input: Forex Rates (USD, EUR, JPY)", "Logic: Correlation Divergence > 2-sigma", "Action: Hedge Pair Trade"]}', 
    language: 'nocode',
    status: 'draft', 
    version: 1,
    lastModified: '2023-10-27',
    author: 'User',
    riskLevel: 'low',
    aiScore: 72,
    parameters: [
      { name: 'Correlation Window', type: 'number', value: 90, range: [30, 365], description: 'Lookback period for correlation calculation (days).' },
      { name: 'Sigma Threshold', type: 'number', value: 2, range: [1, 3], description: 'Standard deviation for divergence signal.' }
    ],
    deploymentTarget: 'quantum-fabric-1',
    geinFactor: 0.7,
    interactionMatrix: [[1, 0.85, 0.7], [0.85, 1, 0.75], [0.7, 0.75, 1]],
    dataPointSensitivity: { 'correlation_divergence': 0.95 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.99 }, 'logic': { gein: 0.9, activation: 0.9 }, 'output': { gein: 1.0, activation: 0.92 } },
    executionPriority: 'normal',
    computeProfile: 'memory-bound',
    dataSources: ['Global Indices API', 'Forex Rates API'],
    dependencies: [],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'Macro Analysis Desk',
    isAudited: false,
    auditHistory: []
  },
];

const mockUserProfile: UserProfile = {
  id: 'u-001',
  name: 'Trader',
  role: 'Administrator',
  clearanceLevel: 5,
  email: 'admin@local',
  preferences: { theme: 'dark', notifications: 'all', aiAssistanceLevel: 'proactive', defaultView: 'Executive Dashboard' },
  apiKeys: [{ service: 'Binance', key: 'bin_..._xyz', lastUsed: '2023-10-27 10:30:00' }],
  security: {
    twoFactorEnabled: true,
    lastLogin: '2023-10-27 09:00:00',
    loginHistory: [{ timestamp: '2023-10-27 09:00:00', ip: '127.0.0.1', status: 'success' }]
  },
  stats: { loginCount: 1420, actionsPerformed: 54300, uptime: '99.99%', pnlContribution: 170000 }
};

// --- Expanded UI Components ---

const Button = ({ icon: Icon, children, onClick, variant = 'primary', disabled = false, className = '', size = 'md' }: any) => {
  const baseClasses = "flex items-center justify-center space-x-2 rounded-lg text-sm transition duration-200 ease-in-out font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }[size];
  let colorClasses = "";

  switch (variant) {
    case 'primary': colorClasses = "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"; break;
    case 'secondary': colorClasses = "bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600 focus:ring-indigo-500 disabled:bg-gray-800 disabled:text-gray-500"; break;
    case 'danger': colorClasses = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400"; break;
    case 'success': colorClasses = "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400"; break;
    case 'ghost': colorClasses = "bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white disabled:text-gray-600 shadow-none"; break;
  }

  return (
    <button className={`${baseClasses} ${sizeClasses} ${colorClasses} ${className}`} onClick={onClick} disabled={disabled}>
      {Icon && <Icon className="w-4 h-4" />}
      {children && <span>{children}</span>}
    </button>
  );
};

const Card = ({ title, subtitle, children, className = '', actions = null, noPadding = false }: any) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-xl border border-gray-700 flex flex-col ${className}`}>
    {(title || actions) && (
      <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/30 rounded-t-xl">
        <div>
          <h3 className="text-lg font-bold text-gray-100">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
    )}
    <div className={`${noPadding ? '' : 'p-6'} flex-grow overflow-auto custom-scrollbar`}>
      {children}
    </div>
  </div>
);

const Badge = ({ children, color = 'gray', icon: Icon }: { children: React.ReactNode, color?: string, icon?: React.ElementType }) => {
  const colors: any = {
    gray: 'bg-gray-700 text-gray-200', green: 'bg-green-800/50 text-green-300', red: 'bg-red-800/50 text-red-300',
    blue: 'bg-blue-800/50 text-blue-300', yellow: 'bg-yellow-800/50 text-yellow-300', indigo: 'bg-indigo-800/50 text-indigo-300',
    purple: 'bg-purple-800/50 text-purple-300', pink: 'bg-pink-800/50 text-pink-300',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color] || colors.gray}`}>
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {children}
    </span>
  );
};

const ProgressBar = ({ value, max = 100, color = 'indigo', label }: any) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      {label && <span className="text-xs font-medium text-gray-300">{label}</span>}
      <span className="text-xs font-medium text-gray-400">{Math.round((value / max) * 100)}%</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <div className={`bg-gradient-to-r from-${color}-500 to-${color}-400 h-2.5 rounded-full transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

const Input = ({ label, type = 'text', value, onChange, placeholder, name }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            name={name}
            id={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
    </div>
);

const Select = ({ label, value, onChange, children, name }: any) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-gray-900 border border-gray-600 rounded-md shadow-sm px-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
            {children}
        </select>
    </div>
);

const Tabs = ({ tabs, activeTab, setActiveTab }: { tabs: string[], activeTab: string, setActiveTab: (tab: string) => void }) => (
    <div className="border-b border-gray-700 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
            <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`${
                            tab === activeTab
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                        } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
                    >
                        {tab}
                    </button>
                ))}
            </nav>
        </div>
    </div>
);

// --- Dashboard Widgets & Views ---

const AIStatusMonitor = () => {
  const stats = [
    { label: 'Quantum Core Load', value: 78, color: 'indigo' },
    { label: 'Global Latency', value: 8, max: 50, color: 'green' },
    { label: 'Predictive Accuracy', value: 98.2, color: 'purple' },
    { label: 'Neural Firewall Threat', value: 2, color: 'red' },
  ];

  return (
    <Card title="AI System Status" subtitle="Real-time Quantum Core Monitoring">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <ProgressBar key={idx} label={stat.label} value={stat.value} max={stat.max || 100} color={stat.color} />
        ))}
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Active AI Processes</h4>
        <div className="space-y-2 text-sm font-mono">
          {['Market Sentiment Analysis [PID: 2000]', 'Risk Vector Calculation [PID: 2015]', 'Liquidity Optimization [PID: 2030]', 'User Behavior Modeling [PID: 2045]', 'Regulatory Compliance Scan [PID: 2060]'].map((proc, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-700">
              <span className="flex items-center text-cyan-400"><Cpu className="w-4 h-4 mr-2 text-cyan-500"/>{proc}</span>
              <span className="text-gray-500">OK</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

const GlobalMarketPulse = () => {
  const markets = [
    { name: 'S&P 500', price: '4,120.50', change: '+0.45%', sentiment: 'Bullish', volatility: 'Low' },
    { name: 'BTC/USD', price: '64,230.00', change: '+2.10%', sentiment: 'Very Bullish', volatility: 'High' },
    { name: 'EUR/USD', price: '1.0850', change: '-0.12%', sentiment: 'Neutral', volatility: 'Low' },
    { name: 'Gold', price: '1,980.20', change: '+0.80%', sentiment: 'Bullish', volatility: 'Medium' },
    { name: 'Crude Oil', price: '78.40', change: '-1.20%', sentiment: 'Bearish', volatility: 'Medium' },
    { name: '10Y Treasury', price: '4.50%', change: '+0.02%', sentiment: 'Neutral', volatility: 'Low' },
  ];

  return (
    <Card title="Global Market Pulse" subtitle="AI-Driven Sentiment & Pricing" noPadding>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Asset</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Change</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">AI Sentiment</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Volatility</th>
            </tr>
          </thead>
          <tbody className="bg-gray-800/30 divide-y divide-gray-700">
            {markets.map((m) => (
              <tr key={m.name} className="hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{m.name}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-gray-300 font-mono">{m.price}</td>
                <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-bold ${m.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{m.change}</td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <Badge color={m.sentiment.includes('Bullish') ? 'green' : m.sentiment.includes('Bearish') ? 'red' : 'gray'}>{m.sentiment}</Badge>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-center">
                  <Badge color={m.volatility === 'High' ? 'red' : m.volatility === 'Medium' ? 'yellow' : 'blue'}>{m.volatility}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const NoCodeEditor = ({ algorithm, onUpdateCode }: { algorithm: Algorithm, onUpdateCode: (code: string) => void }) => {
  const [blocks, setBlocks] = useState<string[]>(() => {
    try { return JSON.parse(algorithm.code).nodes || []; } catch { return []; }
  });

  const handleAddBlock = (type: string) => {
    const newBlock = `${type}: ${type === 'AI' ? 'Neural Optimization' : 'New Logic Node'}`;
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    onUpdateCode(JSON.stringify({ nodes: newBlocks }));
  };

  const handleOptimize = () => {
    const optimized = blocks.map(b => b.includes('AI') ? b : `${b} (Optimized)`);
    setBlocks(optimized);
    onUpdateCode(JSON.stringify({ nodes: optimized }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700">
      <div className="p-3 border-b border-gray-700 bg-gray-800/50 rounded-t-lg flex flex-wrap gap-2">
        <Button icon={Database} onClick={() => handleAddBlock('Input')} variant="secondary" size="sm">Input</Button>
        <Button icon={TrendingUp} onClick={() => handleAddBlock('Indicator')} variant="secondary" size="sm">Indicator</Button>
        <Button icon={SlidersHorizontal} onClick={() => handleAddBlock('Logic')} variant="secondary" size="sm">Logic</Button>
        <Button icon={DollarSign} onClick={() => handleAddBlock('Action')} variant="secondary" size="sm">Action</Button>
        <div className="flex-grow"></div>
        <Button icon={Bot} onClick={handleOptimize} variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700">AI Auto-Optimize</Button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-3 custom-scrollbar">
        {blocks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <Code className="w-12 h-12 mb-2 opacity-20" />
            <p>Use the toolbar to build your strategy.</p>
          </div>
        )}
        {blocks.map((block, index) => (
          <div key={index} className="group relative bg-gray-800 border border-indigo-900/50 p-4 rounded-lg shadow-sm hover:shadow-indigo-500/20 hover:shadow-lg transition-all flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-full absolute left-0 top-0 bottom-0 rounded-l-lg ${block.startsWith('Input') ? 'bg-blue-500' : block.startsWith('Action') ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
              <span className="font-mono text-sm text-gray-300 ml-2">{block}</span>
            </div>
            <X className="w-4 h-4 text-gray-600 cursor-pointer hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => {
              const newBlocks = blocks.filter((_, i) => i !== index);
              setBlocks(newBlocks);
              onUpdateCode(JSON.stringify({ nodes: newBlocks }));
            }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const AlgorithmParametersForm = ({ algorithm, onUpdate }: { algorithm: Algorithm, onUpdate: (params: AlgorithmParameter[]) => void }) => {
    const [params, setParams] = useState(algorithm.parameters);

    const handleChange = (index: number, value: any) => {
        const newParams = [...params];
        newParams[index].value = value;
        setParams(newParams);
    };

    const handleSave = () => {
        onUpdate(params);
    };

    return (
        <div className="p-6 space-y-6">
            {params.map((param, index) => (
                <div key={param.name}>
                    <label className="block text-sm font-medium text-gray-300">{param.name}</label>
                    <p className="text-xs text-gray-500 mb-2">{param.description}</p>
                    {param.type === 'number' && (
                        <input
                            type="number"
                            value={param.value}
                            onChange={(e) => handleChange(index, parseFloat(e.target.value))}
                            className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                        />
                    )}
                    {/* Add other types like boolean, string etc. */}
                </div>
            ))}
            <div className="pt-4 border-t border-gray-700">
                <Button icon={Save} onClick={handleSave} variant="primary">Save Parameters</Button>
            </div>
        </div>
    );
};

const Backtester = ({ algorithm }: { algorithm: Algorithm }) => {
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [isBacktesting, setIsBacktesting] = useState(false);

  const handleRun = useCallback(() => {
    setIsBacktesting(true);
    setTimeout(() => {
      const newResult: BacktestResult = {
        runId: `bt-${Date.now()}`,
        algorithmId: algorithm.id,
        algorithmVersion: algorithm.version,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
        initialCapital: 100000,
        finalCapital: 100000 * (1 + (Math.random() * 40 + 10) / 100),
        equityCurve: generateTimeSeries(50, 100000, 0.05),
        metrics: {
          totalReturn: parseFloat((Math.random() * 40 + 10).toFixed(2)),
          sharpeRatio: parseFloat((Math.random() * 2 + 1).toFixed(2)),
          maxDrawdown: parseFloat((-Math.random() * 15).toFixed(2)),
          trades: Math.floor(Math.random() * 500 + 100),
          profitFactor: parseFloat((Math.random() * 1 + 1.2).toFixed(2)),
          expectancy: parseFloat((Math.random() * 0.5).toFixed(2)),
          avgTradeReturn: parseFloat((Math.random() * 0.2).toFixed(2)),
        },
        parametersSnapshot: algorithm.parameters,
        aiAnalysis: "Strategy exhibits strong momentum characteristics but may be overfitted to Q2 volatility. Suggest increasing stop-loss buffer by 0.5% and testing against 2022 data.",
        tradeLog: []
      };
      setResults([newResult, ...results]);
      setIsBacktesting(false);
    }, 1500);
  }, [algorithm, results]);

  const latest = results[0];

  return (
    <Card title="Simulation & Deployment" subtitle="Hyper-Realistic Backtesting Engine">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
             <Button icon={Play} onClick={handleRun} disabled={isBacktesting} variant="primary" className="w-full" size="lg">
               {isBacktesting ? 'Running Simulation...' : 'Run Hyper-Simulation'}
             </Button>
          </div>
        </div>

        {latest && (
          <div className="animate-fade-in space-y-4">
            <div className="bg-indigo-900/50 p-4 rounded-lg border border-indigo-700">
              <h4 className="font-bold text-indigo-300 flex items-center mb-2">
                <Bot className="w-4 h-4 mr-2" /> AI Analysis & Recommendations
              </h4>
              <p className="text-sm text-indigo-200 leading-relaxed">{latest.aiAnalysis}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Return', value: `+${latest.metrics.totalReturn}%`, color: 'text-green-400' },
                { label: 'Sharpe Ratio', value: latest.metrics.sharpeRatio, color: 'text-blue-400' },
                { label: 'Max Drawdown', value: `${latest.metrics.maxDrawdown}%`, color: 'text-red-400' },
                { label: 'Profit Factor', value: latest.metrics.profitFactor, color: 'text-purple-400' },
              ].map(m => (
                <div key={m.label} className="bg-gray-900/50 p-3 rounded border border-gray-700 shadow-sm">
                  <div className="text-xs text-gray-400 uppercase">{m.label}</div>
                  <div className={`text-2xl font-bold ${m.color}`}>{m.value}</div>
                </div>
              ))}
            </div>
            
            <div className="h-32 bg-gray-900/50 rounded border border-gray-700 flex items-end justify-between px-2 pb-2 overflow-hidden">
               {latest.equityCurve.map((pt, i) => (
                 <div key={i} className="w-1 bg-indigo-500 hover:bg-indigo-400 transition-colors" style={{ height: `${(pt.value / 150000) * 100}%` }} title={`Date: ${pt.date}, Val: ${pt.value.toFixed(2)}`}></div>
               ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const AlgoList = ({ algorithms, selectedAlgo, onSelect, onCreate }: any) => (
  <Card title="Strategy Portfolio" subtitle="Managed Algorithms" actions={<Button icon={Plus} onClick={onCreate} variant="secondary" size="sm">New</Button>} className="h-full" noPadding>
    <div className="p-4 border-b border-gray-700">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" placeholder="Search strategies..." className="w-full bg-gray-900 border border-gray-600 rounded-md pl-9 pr-3 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
    </div>
    <div className="space-y-3 p-4 overflow-y-auto custom-scrollbar">
      {algorithms.map((algo: Algorithm) => (
        <div
          key={algo.id}
          onClick={() => onSelect(algo)}
          className={`p-4 rounded-lg cursor-pointer border-2 transition-all duration-200 ${selectedAlgo?.id === algo.id ? 'bg-indigo-900/50 border-indigo-500 shadow-lg shadow-indigo-900/50' : 'bg-gray-800 border-gray-700 hover:bg-gray-700/50 hover:border-gray-600'}`}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-gray-100">{algo.name}</h4>
            <Badge color={algo.status === 'live' ? 'green' : algo.status === 'backtesting' ? 'yellow' : 'gray'}>{algo.status.toUpperCase()}</Badge>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>v{algo.version} &bull; {algo.author}</span>
            <span className="flex items-center text-indigo-400 font-semibold"><Bot className="w-3 h-3 mr-1" /> AI Score: {algo.aiScore}</span>
          </div>
          {algo.performanceMetrics && (
            <div className="mt-3 pt-3 border-t border-gray-700 grid grid-cols-3 gap-2 text-xs">
              <div><span className="text-gray-500 block">Return</span><span className="font-medium text-green-400">+{algo.performanceMetrics.return}%</span></div>
              <div><span className="text-gray-500 block">Sharpe</span><span className="font-medium text-gray-300">{algo.performanceMetrics.sharpe}</span></div>
              <div><span className="text-gray-500 block">Win Rate</span><span className="font-medium text-gray-300">{algo.performanceMetrics.winRate}%</span></div>
            </div>
          )}
        </div>
      ))}
    </div>
  </Card>
);

// --- Navigation & Layout ---

const NAV_ITEMS = [
    { name: 'Executive Dashboard', icon: LayoutDashboard, category: 'Core' },
    { name: 'Algo-Trading Lab', icon: Code, category: 'Core', current: true },
    { name: 'Quantum Weaver AI', icon: BrainCircuit, category: 'Core' },
    { name: 'AI Financial Advisor', icon: Bot, category: 'Core' },
    { name: 'Advanced Charting', icon: BarChart2, category: 'Core' },
    { name: 'Market Scanner', icon: Search, category: 'Core' },
    { name: 'Gemini Thinking Console', icon: Sparkles, category: 'Gemini 2.5' },
    { name: 'Multimodal Input Analysis', icon: Eye, category: 'Gemini 2.5' },
    { name: 'Streaming Response Monitor', icon: Zap, category: 'Gemini 2.5' },
    { name: 'System Instruction Editor', icon: Terminal, category: 'Gemini 2.5' },
    { name: 'Chat History Explorer', icon: MessageSquare, category: 'Gemini 2.5' },
    { name: 'Global Transactions', icon: History, category: 'Treasury' },
    { name: 'Liquidity Transfer', icon: Send, category: 'Treasury' },
    { name: 'Budgetary Control', icon: Target, category: 'Treasury' },
    { name: 'Corporate Treasury', icon: Globe, category: 'Treasury' },
    { name: 'Modern Treasury API', icon: Key, category: 'Treasury' },
    { name: 'Strategic Goals', icon: Trophy, category: 'Strategy' },
    { name: 'Credit Health Monitor', icon: Heart, category: 'Strategy' },
    { name: 'Investment Portfolio', icon: Briefcase, category: 'Strategy' },
    { name: 'Venture Capital', icon: Rocket, category: 'Strategy' },
    { name: 'Private Equity', icon: Briefcase, category: 'Strategy' },
    { name: 'Mutual Fund Screener', icon: Filter, category: 'Strategy' },
    { name: 'ETF Hub', icon: PieChart, category: 'Strategy' },
    { name: 'Robo-Advisor Config', icon: Bot, category: 'Strategy' },
    { name: 'Web3 & Crypto Bridge', icon: Link, category: 'Markets' },
    { name: 'Forex Arbitrage Arena', icon: Scale, category: 'Markets' },
    { name: 'Commodities Exchange', icon: Wheat, category: 'Markets' },
    { name: 'Real Estate Empire', icon: Building, category: 'Markets' },
    { name: 'Art & NFT Vault', icon: Palette, category: 'Markets' },
    { name: 'Derivatives Desk', icon: PieChart, category: 'Markets' },
    { name: 'Options Chain', icon: Link, category: 'Markets' },
    { name: 'Futures Contracts', icon: FileText, category: 'Markets' },
    { name: 'Bond Analytics', icon: Scale, category: 'Markets' },
    { name: 'Dark Pool Routing', icon: Network, category: 'Markets' },
    { name: 'Exotic Derivatives', icon: Sparkles, category: 'Markets' },
    { name: 'Carbon Credit Trading', icon: Wheat, category: 'Markets' },
    { name: 'Tax Optimization AI', icon: Receipt, category: 'Finance' },
    { name: 'Legacy Planning', icon: BookOpen, category: 'Finance' },
    { name: 'Wealth Management', icon: Crown, category: 'Finance' },
    { name: 'Billing & Invoicing', icon: CreditCard, category: 'Finance' },
    { name: 'Expense Management', icon: Receipt, category: 'Finance' },
    { name: 'Capital Call Management', icon: Phone, category: 'Finance' },
    { name: 'Card Issuance (Marqeta)', icon: CreditCard, category: 'Integrations' },
    { name: 'Data Aggregation (Plaid)', icon: Link, category: 'Integrations' },
    { name: 'Payment Rails (Stripe)', icon: Zap, category: 'Integrations' },
    { name: 'Open Banking API', icon: Link, category: 'Integrations' },
    { name: 'Identity (SSO)', icon: Lock, category: 'Platform' },
    { name: 'Agent Marketplace', icon: Users, category: 'Platform' },
    { name: 'Ad Studio AI', icon: Megaphone, category: 'Platform' },
    { name: 'Card Customization', icon: CreditCard, category: 'Platform' },
    { name: 'DAO Governance', icon: Handshake, category: 'Platform' },
    { name: 'API Key Management', icon: Key, category: 'Platform' },
    { name: 'Webhook Subscriptions', icon: Send, category: 'Platform' },
    { name: 'System Status', icon: Activity, category: 'System' },
    { name: 'Security Center', icon: Shield, category: 'System' },
    { name: 'System Manifesto', icon: Eye, category: 'System' },
    { name: 'Audit Logs', icon: History, category: 'System' },
    { name: 'Disaster Recovery', icon: Server, category: 'System' },
    { name: 'Concierge', icon: Phone, category: 'Support' },
    { name: 'Philanthropy', icon: Heart, category: 'Support' },
    { name: 'Personalization', icon: Sparkles, category: 'Support' },
    { name: 'Knowledge Base', icon: BookOpen, category: 'Support' },
    { name: 'Live Chat Support', icon: MessageSquare, category: 'Support' },
    { name: 'Feature Requests', icon: Megaphone, category: 'Support' },
    { name: 'Risk Dashboard', icon: Shield, category: 'Risk Management' },
    { name: 'VaR Simulation', icon: BarChart2, category: 'Risk Management' },
    { name: 'Stress Testing', icon: Activity, category: 'Risk Management' },
    { name: 'Counterparty Risk', icon: Users, category: 'Risk Management' },
    { name: 'Credit Default Swaps', icon: FileText, category: 'Risk Management' },
    { name: 'Liquidity Risk', icon: LifeBuoy, category: 'Risk Management' },
    { name: 'Operational Risk', icon: SlidersHorizontal, category: 'Risk Management' },
    { name: 'Geopolitical Risk Map', icon: Globe, category: 'Risk Management' },
    { name: 'Model Risk Governance', icon: BrainCircuit, category: 'Risk Management' },
    { name: 'Compliance Hub', icon: CheckSquare, category: 'Compliance' },
    { name: 'Regulatory Reporting', icon: FileText, category: 'Compliance' },
    { name: 'Audit Trail', icon: History, category: 'Compliance' },
    { name: 'AML Monitoring', icon: Eye, category: 'Compliance' },
    { name: 'Trade Surveillance', icon: Search, category: 'Compliance' },
    { name: 'Policy Management', icon: BookOpen, category: 'Compliance' },
    { name: 'SEC Rule 15c3-5', icon: CheckSquare, category: 'Compliance' },
    { name: 'MiFID II Reporting', icon: FileText, category: 'Compliance' },
    { name: 'Data Lake Explorer', icon: Database, category: 'Data Science' },
    { name: 'Jupyter Notebooks', icon: BookOpen, category: 'Data Science' },
    { name: 'Model Training', icon: Cpu, category: 'Data Science' },
    { name: 'Feature Store', icon: HardDrive, category: 'Data Science' },
    { name: 'Data Visualization Lab', icon: BarChart2, category: 'Data Science' },
    { name: 'ETL Pipelines', icon: Repeat, category: 'Data Science' },
    { name: 'Alternative Data Hub', icon: HardDrive, category: 'Data Science' },
    { name: 'Cloud Infrastructure', icon: Cloud, category: 'Infrastructure' },
    { name: 'Network Topology', icon: Network, category: 'Infrastructure' },
    { name: 'Server Fleet Management', icon: Server, category: 'Infrastructure' },
    { name: 'CI/CD Pipelines', icon: GitBranch, category: 'Infrastructure' },
    { name: 'Terminal Access', icon: Terminal, category: 'Infrastructure' },
    { name: 'Quantum Fabric Status', icon: Atom, category: 'Infrastructure' },
    { name: 'Kubernetes Cluster', icon: Cloud, category: 'Infrastructure' },
    { name: 'Quarterly Reports', icon: PieChart, category: 'Reporting' },
    { name: 'Performance Attribution', icon: Trophy, category: 'Reporting' },
    { name: 'Client Statements', icon: Receipt, category: 'Reporting' },
    { name: 'P&L Analytics', icon: TrendingUp, category: 'Reporting' },
    { name: 'AUM Tracker', icon: DollarSign, category: 'Reporting' },
    { name: 'Investor Relations Portal', icon: Users, category: 'Client Relations' },
    { name: 'CRM Integration', icon: Handshake, category: 'Client Relations' },
    { name: 'Support Tickets', icon: LifeBuoy, category: 'Client Relations' },
    { name: 'Onboarding Wizard', icon: User, category: 'Client Relations' },
    { name: 'Global News Feed', icon: Globe, category: 'Market Intel' },
    { name: 'SEC Filings', icon: FileText, category: 'Market Intel' },
    { name: 'Social Media Sentiment', icon: Megaphone, category: 'Market Intel' },
    { name: 'Economic Calendar', icon: Calendar, category: 'Market Intel' },
    { name: 'Insider Trading Monitor', icon: Eye, category: 'Market Intel' },
    { name: 'Back Office Operations', icon: Briefcase, category: 'Operations' },
    { name: 'Settlements & Clearing', icon: CheckSquare, category: 'Operations' },
    { name: 'Corporate Actions', icon: Megaphone, 'category': 'Operations' },
    { name: 'Reconciliation Engine', icon: Repeat, category: 'Operations' },
    { name: 'Multi-Factor Auth', icon: Lock, category: 'Security' },
    { name: 'Intrusion Detection', icon: Shield, category: 'Security' },
    { name: 'Penetration Testing', icon: Target, category: 'Security' },
    { name: 'Bug Bounty Program', icon: Trophy, category: 'Security' },
];

const AppSidebar = ({ onNavigate, activeView }: any) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const groupedNavItems = useMemo(() => NAV_ITEMS.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, typeof NAV_ITEMS>), []);

    return (
        <div className={`h-full bg-gray-900 text-white flex flex-col transition-all duration-300 shadow-2xl z-20 ${isCollapsed ? 'w-20' : 'w-72'}`}>
            <div className="p-5 flex items-center justify-between border-b border-gray-800 bg-gray-900 h-16">
                {!isCollapsed && (
                  <div>
                    <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tighter">QUANTUM OS</h1>
                    <p className="text-[10px] text-gray-500 tracking-widest uppercase">High Frequency Trading</p>
                  </div>
                )}
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400 transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
            </div>
            
            <div className="p-4 border-b border-gray-800 bg-gray-800/50">
                <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 p-2 rounded-lg transition-colors" onClick={() => onNavigate("Profile")}>
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-2 border-gray-700">TR</div>
                    {!isCollapsed && (
                      <div className="overflow-hidden"><p className="text-sm font-bold text-gray-200 truncate">Trader</p><p className="text-xs text-green-400 flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span> Online</p></div>
                    )}
                </div>
            </div>

            <nav className="flex-grow overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {Object.entries(groupedNavItems).map(([category, items]) => (
                    <div key={category}>
                        {!isCollapsed && <h3 className="px-3 pt-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{category}</h3>}
                        {items.map((item) => {
                            const Icon = item.icon;
                            const isActive = item.name === activeView;
                            return (
                                <a key={item.name} href="#" onClick={(e) => { e.preventDefault(); onNavigate(item.name); }}
                                    className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
                                >
                                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                                    <span className={`ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{item.name}</span>
                                </a>
                            );
                        })}
                    </div>
                ))}
            </nav>
            
            <div className="p-4 border-t border-gray-800 bg-gray-900 text-xs text-gray-600 text-center">
              {!isCollapsed && "v12.8.1-Quantum | Secure Connection"}
            </div>
        </div>
    );
}

// --- Placeholder & Special Views ---

const ModulePlaceholder = ({ viewName, icon: Icon }: { viewName: string, icon: React.ElementType }) => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-800/50 rounded-xl shadow-2xl border border-gray-700 p-10 text-center">
        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 border-4 border-gray-700">
            <Icon className="w-12 h-12 text-indigo-500" />
        </div>
        <h2 className="text-3xl font-bold text-gray-100 mb-2">{viewName}</h2>
        <p className="text-gray-400 max-w-md mb-8">This module is currently under development. Advanced functionalities will be available soon.</p>
        <Button icon={RefreshCw} onClick={() => {}} variant="secondary">Check for Updates</Button>
    </div>
);

const SystemManifesto = () => (
  <Card title="System Manifesto" subtitle="Core Principles & Architecture" className="h-full overflow-y-auto">
    <div className="prose prose-invert prose-lg max-w-none text-gray-300 p-4">
      <h3 className="text-2xl font-bold text-indigo-400 border-b border-gray-700 pb-2 mb-4">System Overview</h3>
      <p>Quantum OS is a next-generation, AI-native platform for high-frequency algorithmic trading and comprehensive financial asset management. It is designed for unparalleled speed, intelligence, and security.</p>
      <div className="bg-gray-900/50 p-6 rounded-xl border-l-4 border-indigo-500 my-6">
        <h4 className="text-lg font-bold text-indigo-300 mb-2">Core Tenets</h4>
        <ul className="list-disc list-inside space-y-2 text-indigo-200">
          <li><strong>Speed of Light Execution:</strong> Global edge-node deployment ensures sub-millisecond latency.</li>
          <li><strong>Quantum-Inspired AI:</strong> Core logic is driven by proprietary AI models that simulate quantum states for predictive accuracy.</li>
          <li><strong>Total Asset Visibility:</strong> Unified interface for all asset classes, from traditional equities to decentralized finance.</li>
          <li><strong>Fortress-Grade Security:</strong> Proactive threat detection via a Neural Firewall and end-to-end encryption.</li>
        </ul>
      </div>
      <p>Our mission is to redefine the boundaries of financial technology, creating a self-optimizing, intelligent system that anticipates market movements and autonomously manages risk.</p>
    </div>
  </Card>
);

const QuantumWeaverAIView = () => (
    <Card title="Quantum Weaver AI" subtitle="Neural Network & Strategy Entanglement" className="h-full">
        <div className="text-center text-gray-300">
            <BrainCircuit className="w-24 h-24 mx-auto text-purple-400 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold">Visualize & Entangle AI Models</h3>
            <p className="text-gray-400 mt-2">This interface allows for the direct manipulation of neural pathways and the "entanglement" of successful strategies to create hybrid AI models with emergent properties. Feature coming in Q4.</p>
        </div>
    </Card>
);

const GeminiThinkingConsole = () => (
    <Card title="Gemini 2.5 Pro - Thinking Console" subtitle="Live Cognitive Stream" className="h-full flex flex-col" noPadding>
        <div className="flex-grow bg-gray-900/50 p-4 rounded-t-lg border border-gray-700 overflow-y-auto custom-scrollbar font-mono text-sm text-green-400 space-y-2 flex flex-col">
            <div className="flex-grow space-y-2">
                <p>&gt; Initializing Gemini 2.5 Pro model...</p>
                <p>&gt; Thinking enabled by default. Budget: UNLIMITED.</p>
                <p>&gt; System Instruction: You are Quantum OS's core strategic AI. Your name is GEIN (Global Entangled Intelligence Network).</p>
                <p className="text-cyan-400">&gt; [COGNITIVE_STREAM_START]</p>
                <p>&gt; Analyzing market microstructure... detected anomalous volume in dark pools for ticker: $XYZ.</p>
                <p>&gt; Cross-referencing with geopolitical sentiment data... correlation with recent supply chain disruption news found (confidence: 0.89).</p>
                <p>&gt; Simulating impact on 'Quantum Momentum Scalper v4' strategy...</p>
                <p className="text-yellow-400">&gt; [THINKING]... Evaluating 1,337,420 possible outcomes...</p>
                <p className="text-yellow-400">&gt; [THINKING]... Refactoring risk parameters for algo-1 to hedge against predicted volatility spike.</p>
                <p>&gt; Recommendation: Decrease trade size parameter from 100 to 75 for the next 60 minutes.</p>
                <p>&gt; Actionable insight generated. Pushing notification to user 'Trader'.</p>
            </div>
            <p className="animate-pulse flex-shrink-0">&gt; _</p>
        </div>
        <div className="flex-shrink-0 p-4 bg-gray-800/50 rounded-b-lg border-t-0 border border-gray-700">
            <div className="relative">
                <input type="text" placeholder="Send instruction to GEIN..." className="w-full bg-gray-900 border border-gray-600 rounded-md pl-4 pr-12 py-2 text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                <Button icon={Send} variant="ghost" className="absolute right-1 top-1/2 -translate-y-1/2" />
            </div>
        </div>
    </Card>
);

const UserProfileView = () => {
    const [profile, setProfile] = useState(mockUserProfile);
    const [activeTab, setActiveTab] = useState('Preferences');

    return (
        <Card title="User Profile & Settings" subtitle={profile.name} className="h-full flex flex-col">
            <Tabs tabs={['Preferences', 'Security', 'API Keys']} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-grow p-6">
                {activeTab === 'Preferences' && (
                    <div className="space-y-6 max-w-md">
                        <Select label="UI Theme" name="theme" value={profile.preferences.theme} onChange={() => {}}>
                            <option>dark</option><option>light</option><option>matrix</option>
                        </Select>
                        <Select label="Notifications" name="notifications" value={profile.preferences.notifications} onChange={() => {}}>
                            <option>all</option><option>critical</option><option>none</option>
                        </Select>
                        <Select label="AI Assistance Level" name="aiAssistanceLevel" value={profile.preferences.aiAssistanceLevel} onChange={() => {}}>
                            <option>minimal</option><option>standard</option><option>proactive</option>
                        </Select>
                        <Button variant="primary" icon={Save}>Save Preferences</Button>
                    </div>
                )}
                {activeTab === 'Security' && (
                    <div className="space-y-4 text-gray-300">
                        <p>2FA Enabled: <Badge color="green">Yes</Badge></p>
                        <p>Last Login: {profile.security.lastLogin}</p>
                        <Button variant="secondary">View Login History</Button>
                    </div>
                )}
            </div>
        </Card>
    );
};

// --- Main Application Component ---

const algoTabs = [
  'Builder', 'Parameters', 'Deployment', 'Performance', 'Risk Analysis', 'Code', 'Version History', 'Logs', 'AI Insights', 'Optimization', 'Security', 'Dependencies', 'Team Access', 'Alerts', 'Notes',
  'Backtests', 'Live Monitoring', 'Source Code', 'Execution Log', 'Trade Journal', 'Configuration', 'Environment Vars', 'Secrets', 'Permissions', 'Audit Trail', 'Metrics', 'Visualizations', 'Reports',
  'Compliance Checks', 'Stress Tests', 'Monte Carlo', 'What-If Scenarios', 'Data Sources', 'Input Schema', 'Output Schema', 'API Endpoints', 'Webhooks', 'Triggers', 'Scheduling', 'Cost Analysis',
  'Resource Usage', 'CPU Profile', 'Memory Profile', 'Network I/O', 'Disk I/O', 'GPU Usage', 'Quantum Entanglement', 'Neural Links', 'Hyperparameters', 'Feature Importance', 'Model Explainability',
  'Data Lineage', 'Ownership', 'Stakeholders', 'Documentation', 'README', 'Changelog', 'License', 'Support', 'Issues', 'Pull Requests', 'Code Reviews', 'Static Analysis', 'Security Scans',
  'Unit Tests', 'Integration Tests', 'E2E Tests', 'Fuzzing', 'Formal Verification', 'Peer Review', 'Community Forum', 'Live Chat', 'Video Tutorials', 'API Docs', 'SDKs', 'Client Libraries',
  'Sample Code', 'Use Cases', 'Case Studies', 'Whitepapers', 'Benchmarks', 'Leaderboard', 'Competitions', 'Bounties', 'Grants', 'Partnerships', 'Integrations', 'App Store', 'Plugins',
  'Extensions', 'Themes', 'Customization', 'Personalization', 'Settings', 'Preferences', 'Notifications', 'Billing', 'Subscription', 'Invoices', 'Payment History', 'Referrals', 'Affiliates'
];

const AlgoTradingLab: React.FC = () => {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>(initialAlgorithms);
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>(initialAlgorithms[0].id);
  const [currentView, setCurrentView] = useState('Algo-Trading Lab');
  const [notifications, setNotifications] = useState<AIInsight[]>(mockInsights);
  const [activeAlgoTab, setActiveAlgoTab] = useState('Builder');

  const selectedAlgorithm = useMemo(() => algorithms.find(a => a.id === selectedAlgoId) || initialAlgorithms[0], [algorithms, selectedAlgoId]);

  const handleUpdateCode = useCallback((code: string) => {
    setAlgorithms(prev => prev.map(a => a.id === selectedAlgoId ? { ...a, code, status: 'draft', lastModified: new Date().toISOString().split('T')[0] } : a));
  }, [selectedAlgoId]);
  
  const handleUpdateParams = useCallback((params: AlgorithmParameter[]) => {
    setAlgorithms(prev => prev.map(a => a.id === selectedAlgoId ? { ...a, parameters: params, status: 'draft', lastModified: new Date().toISOString().split('T')[0] } : a));
  }, [selectedAlgoId]);

  const handleCreate = useCallback(() => {
    const newAlgo: Algorithm = {
      id: `algo-${Date.now()}`,
      name: `New Strategy ${algorithms.length + 1}`,
      description: 'A new, undefined trading strategy.',
      tags: ['new'],
      code: '{"nodes":[]}',
      language: 'nocode',
      status: 'draft',
      version: 1,
      lastModified: new Date().toISOString().split('T')[0],
      author: 'User',
      riskLevel: 'medium',
      aiScore: 50,
      parameters: [],
      deploymentTarget: 'cloud-cluster-a',
      geinFactor: 0.5,
      interactionMatrix: [[1]],
      dataPointSensitivity: {},
      layerMetrics: {},
      executionPriority: 'normal',
      computeProfile: 'cpu-bound',
      dataSources: [],
      dependencies: [],
      permissions: [],
      ownerTeam: 'User',
      isAudited: false,
      auditHistory: []
    };
    setAlgorithms([...algorithms, newAlgo]);
    setSelectedAlgoId(newAlgo.id);
  }, [algorithms]);

  const renderContent = () => {
    const navItem = NAV_ITEMS.find(item => item.name === currentView);
    const icon = navItem ? navItem.icon : LifeBuoy;

    switch (currentView) {
      case 'System Manifesto': return <SystemManifesto />;
      case 'Quantum Weaver AI': return <QuantumWeaverAIView />;
      case 'Gemini Thinking Console': return <GeminiThinkingConsole />;
      case 'Profile': return <UserProfileView />;
      case 'Executive Dashboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto pb-10 custom-scrollbar">
            <AIStatusMonitor />
            <GlobalMarketPulse />
            <div className="lg:col-span-2">
               <Card title="System-Wide Alerts" subtitle="AI Detected Anomalies & Insights">
                 <div className="space-y-2">
                   {notifications.map(n => (
                     <div key={n.id} className={`p-3 rounded border-l-4 flex justify-between items-center ${n.severity === 'critical' ? 'bg-red-900/50 border-red-500' : n.severity === 'high' ? 'bg-orange-900/50 border-orange-500' : 'bg-blue-900/50 border-blue-500'}`}>
                       <div>
                         <span className="font-bold text-gray-200 block">{n.category.toUpperCase()} ALERT</span>
                         <span className="text-sm text-gray-300">{n.message}</span>
                       </div>
                       <Badge color={n.severity === 'critical' ? 'red' : 'blue'}>{n.confidence * 100}% Conf.</Badge>
                     </div>
                   ))}
                 </div>
               </Card>
            </div>
          </div>
        );
      case 'Algo-Trading Lab':
        return (
          <div className="grid grid-cols-12 gap-6 h-full">
            <div className="col-span-12 lg:col-span-3 h-full"><AlgoList algorithms={algorithms} selectedAlgo={selectedAlgorithm} onSelect={(a: Algorithm) => setSelectedAlgoId(a.id)} onCreate={handleCreate} /></div>
            <div className="col-span-12 lg:col-span-6 h-full flex flex-col">
              <Card title={`Editor: ${selectedAlgorithm.name}`} subtitle={`v${selectedAlgorithm.version} • ${selectedAlgorithm.status.toUpperCase()}`} className="h-full flex flex-col" noPadding>
                <Tabs tabs={algoTabs} activeTab={activeAlgoTab} setActiveTab={setActiveAlgoTab} />
                <div className="flex-grow overflow-auto">
                    {activeAlgoTab === 'Builder' && <NoCodeEditor algorithm={selectedAlgorithm} onUpdateCode={handleUpdateCode} />}
                    {activeAlgoTab === 'Parameters' && <AlgorithmParametersForm algorithm={selectedAlgorithm} onUpdate={handleUpdateParams} />}
                    {activeAlgoTab !== 'Builder' && activeAlgoTab !== 'Parameters' && <div className="p-6 text-gray-400">{activeAlgoTab} interface placeholder.</div>}
                </div>
              </Card>
            </div>
            <div className="col-span-12 lg:col-span-3 h-full"><Backtester algorithm={selectedAlgorithm} /></div>
          </div>
        );
      default:
        return <ModulePlaceholder viewName={currentView} icon={icon} />;
    }
  };

  return (
    <div className="h-screen w-full flex bg-gray-900 font-sans overflow-hidden text-gray-200">
      <style>{`.custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; } .custom-scrollbar::-webkit-scrollbar-track { background: #1f2937; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 4px; }`}</style>
      <AppSidebar onNavigate={setCurrentView} activeView={currentView} />
      
      <div className="flex-grow flex flex-col h-full overflow-hidden relative">
        <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 h-16 flex items-center justify-between px-6 shadow-lg z-10 flex-shrink-0">
          <div className="flex items-center">
            <h2 className="text-xl font-bold text-gray-100 tracking-tight">{currentView}</h2>
            {currentView === 'Algo-Trading Lab' && <span className="ml-3 px-2 py-0.5 rounded bg-indigo-800/50 text-indigo-300 text-xs font-bold">ACTIVE SESSION</span>}
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-gray-800 px-3 py-1.5 rounded-full border border-gray-700">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-gray-300">System Optimal</span>
            </div>
            <Button icon={History} variant="ghost" className="relative"><span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-gray-900"></span></Button>
            <Button icon={User} variant="ghost" onClick={() => setCurrentView('Profile')} />
            <Button icon={LogOut} variant="ghost" className="hover:text-red-500" onClick={() => alert("Secure Logout Initiated")} />
          </div>
        </header>

        <main className="flex-grow p-6 overflow-hidden relative bg-black/20">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AlgoTradingLab;

// --- CONSOLIDATED FROM: ./components/AlgoTradingLab (1).tsx ---



// --- CONSOLIDATED FROM: AlgoTradingLab (1)_1.tsx ---

import React, { useState, useCallback, useMemo } from 'react';
import { 
  RefreshCw, Play, Save, History, Code, Settings, TrendingUp, DollarSign, X, User, LogOut,
  Plus, Search, Filter, ChevronDown, ChevronUp, BrainCircuit, Bot, SlidersHorizontal,
  LayoutDashboard, Repeat, Send, Target, Trophy, Heart, Briefcase, Link, Zap, Lock,
  Atom, Users, Megaphone, CreditCard, Handshake, Activity, Phone, Shield, Sparkles, Eye,
  Globe, Key, Receipt, Rocket, PieChart, Palette, Building, Wheat, Scale, Crown, FileText,
  Server, Network, GitBranch, HardDrive, Cpu, Database, Cloud, Terminal, BookOpen,
  BarChart2, CheckSquare, Calendar, MessageSquare, LifeBuoy
} from 'lucide-react';
import { Badge } from './badge';

// --- Expanded Data Models ---

interface SystemMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  aiPrediction: number;
  subMetrics?: { label: string; value: string }[];
}

interface AIInsight {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'market' | 'system' | 'security' | 'optimization' | 'regulatory';
  message: string;
  confidence: number;
  actionable: boolean;
  relatedEntityId?: string;
}

interface AlgorithmParameter {
  name: string;
  type: 'number' | 'string' | 'boolean';
  value: any;
  range?: [number, number];
  description: string;
}

interface Algorithm {
  id: string;
  name: string;
  description: string;
  tags: string[];
  code: string;
  language: 'nocode' | 'python' | 'rust';
  status: 'draft' | 'backtesting' | 'live' | 'error' | 'optimizing' | 'archived';
  version: number;
  lastModified: string;
  author: string;
  riskLevel: 'low' | 'medium' | 'high' | 'extreme';
  aiScore: number;
  parameters: AlgorithmParameter[];
  deploymentTarget: 'cloud-cluster-a' | 'edge-node-tokyo' | 'quantum-fabric-1';
  performanceMetrics?: {
    pnl: number;
    return: number;
    sharpe: number;
    sortino: number;
    alpha: number;
    beta: number;
    volatility: number;
    winRate: number;
    maxDrawdown: number;
  };
  geinFactor: number;
  interactionMatrix: number[][];
  dataPointSensitivity: Record<string, number>;
  layerMetrics: Record<string, { gein: number; activation: number }>;
  executionPriority: 'low' | 'normal' | 'high' | 'critical' | 'quantum';
  computeProfile: 'cpu-bound' | 'memory-bound' | 'io-bound' | 'gpu-accelerated';
  dataSources: string[];
  dependencies: { name: string; version: string }[];
  permissions: string[];
  ownerTeam: string;
  isAudited: boolean;
  auditHistory: { date: string; auditor: string; result: 'pass' | 'fail' }[];
}

interface BacktestResult {
  runId: string;
  algorithmId: string;
  algorithmVersion: number;
  startDate: string;
  endDate:string;
  initialCapital: number;
  finalCapital: number;
  equityCurve: { date: string; value: number; aiForecast: number }[];
  metrics: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    trades: number;
    profitFactor: number;
    expectancy: number;
    avgTradeReturn: number;
  };
  parametersSnapshot: AlgorithmParameter[];
  aiAnalysis: string;
  tradeLog: { timestamp: string; type: 'buy' | 'sell'; asset: string; quantity: number; price: number; pnl: number }[];
}

interface UserProfile {
  id: string;
  name: string;
  role: 'Administrator' | 'Trader' | 'Quant' | 'Observer';
  clearanceLevel: number;
  email: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto' | 'matrix';
    notifications: 'all' | 'critical' | 'none';
    aiAssistanceLevel: 'minimal' | 'standard' | 'proactive';
    defaultView: string;
  };
  apiKeys: { service: string; key: string; lastUsed: string }[];
  security: {
    twoFactorEnabled: boolean;
    lastLogin: string;
    loginHistory: { timestamp: string; ip: string; status: 'success' | 'failed' }[];
  };
  stats: {
    loginCount: number;
    actionsPerformed: number;
    uptime: string;
    pnlContribution: number;
  };
}

// --- Data Utilities & Mocks ---

const generateTimeSeries = (points: number, startValue: number, volatility: number) => {
  const data = [];
  let currentValue = startValue;
  const now = new Date();
  for (let i = 0; i < points; i++) {
    const date = new Date(now.getTime() - (points - i) * 86400000).toISOString().split('T')[0];
    const change = (Math.random() - 0.5) * volatility;
    currentValue = currentValue * (1 + change);
    data.push({
      date,
      value: currentValue,
      aiForecast: currentValue * (1 + (Math.random() - 0.5) * 0.02)
    });
  }
  return data;
};

const initialAlgorithms: Algorithm[] = [
  { 
    id: 'algo-1', 
    name: 'Quantum Momentum Scalper v4', 
    description: 'High-frequency scalping strategy utilizing quantum-inspired principles for momentum prediction.',
    tags: ['HFT', 'Scalping', 'Momentum', 'Quantum'],
    code: '{"nodes":["Input: L2 Market Data Stream", "Filter: Volatility > 1.5", "AI Model: Quantum Trend Predictor", "Logic: If confidence > 0.95", "Action: Buy/Sell 100 units"]}', 
    language: 'nocode',
    status: 'live', 
    version: 4,
    lastModified: '2023-10-26',
    author: 'System Admin',
    riskLevel: 'high',
    aiScore: 94,
    parameters: [
      { name: 'Volatility Threshold', type: 'number', value: 1.5, range: [0.5, 5], description: 'Minimum volatility to activate trading.' },
      { name: 'Trade Size', type: 'number', value: 100, range: [10, 1000], description: 'Number of units per trade.' }
    ],
    deploymentTarget: 'cloud-cluster-a',
    performanceMetrics: { pnl: 125000, return: 45.2, sharpe: 2.1, sortino: 2.8, alpha: 0.15, beta: 0.8, volatility: 12.5, winRate: 68, maxDrawdown: -8.2 },
    geinFactor: 0.98,
    interactionMatrix: [[1, 0.2, -0.1], [0.2, 1, 0.5], [-0.1, 0.5, 1]],
    dataPointSensitivity: { 'L2.bid_price': 0.8, 'L2.ask_price': 0.8, 'volatility': 0.9 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.95 }, 'quantum_core': { gein: 0.99, activation: 0.98 }, 'output': { gein: 1.0, activation: 0.96 } },
    executionPriority: 'quantum',
    computeProfile: 'gpu-accelerated',
    dataSources: ['L2 Market Data Stream', 'Global News Feed API'],
    dependencies: [{ name: 'quantum-tensor-lib', version: '2.5.1' }],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'Quantum Core Team',
    isAudited: true,
    auditHistory: [{ date: '2023-09-15', auditor: 'Internal Security', result: 'pass' }]
  },
  { 
    id: 'algo-2', 
    name: 'Mean Reversion HFT (Neural)', 
    description: 'Neural network-based strategy that capitalizes on short-term mean reversion in liquid assets.',
    tags: ['HFT', 'Mean Reversion', 'AI', 'Market Making'],
    code: '{"nodes":["Input: Order Book Depth", "AI: Sentiment Analysis (News Feeds)", "Logic: Spread > 0.02% AND Reversion Signal", "Action: Market Make (Bid/Ask)"]}', 
    language: 'nocode',
    status: 'backtesting', 
    version: 12,
    lastModified: '2023-10-27',
    author: 'AI Architect',
    riskLevel: 'medium',
    aiScore: 88,
    parameters: [
      { name: 'Spread Threshold', type: 'number', value: 0.02, range: [0.01, 0.1], description: 'Minimum bid-ask spread to engage.' },
      { name: 'Sentiment Weight', type: 'number', value: 0.3, range: [0, 1], description: 'Influence of news sentiment on trade logic.' }
    ],
    deploymentTarget: 'edge-node-tokyo',
    performanceMetrics: { pnl: 45000, return: 12.5, sharpe: 1.8, sortino: 1.9, alpha: 0.05, beta: 0.2, volatility: 4.2, winRate: 55, maxDrawdown: -4.1 },
    geinFactor: 0.85,
    interactionMatrix: [[1, 0.7], [0.7, 1]],
    dataPointSensitivity: { 'spread': 0.9, 'sentiment': 0.6 },
    layerMetrics: { 'input': { gein: 1.0, activation: 0.9 }, 'neural_net': { gein: 0.8, activation: 0.92 }, 'output': { gein: 1.0, activation: 0.88 } },
    executionPriority: 'high',
    computeProfile: 'cpu-bound',
    dataSources: ['Order Book Depth', 'News Feeds'],
    dependencies: [{ name: 'sentiment-analyzer', version: '4.2.0' }],
    permissions: ['read:market_data', 'execute:trades'],
    ownerTeam: 'AI Research',
    isAudited: true,
    auditHistory: [{ date: '2023-08-20', auditor: 'External Audit Co.', result: 'pass' }]
  }
];

// --- UI Components ---

const Button = ({ icon: Icon, children, onClick, variant = 'primary', disabled = false, className = '', size = 'md' }: any) => {
  const baseClasses = "flex items-center justify-center space-x-2 rounded-lg text-sm transition duration-200 ease-in-out font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800";
  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  let colorClasses = "";

  switch (variant) {
    case 'primary': colorClasses = "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"; break;
    case 'secondary': colorClasses = "bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600 focus:ring-indigo-500 disabled:bg-gray-800 disabled:text-gray-500"; break;
    case 'danger': colorClasses = "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400"; break;
    case 'success': colorClasses = "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 disabled:bg-emerald-400"; break;
    case 'ghost': colorClasses = "bg-transparent text-gray-400 hover:bg-gray-700 hover:text-white disabled:text-gray-600 shadow-none"; break;
  }

  return (
    <button className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${colorClasses} ${className}`} onClick={onClick} disabled={disabled}>
      {Icon && <Icon className="w-4 h-4" />}
      {children && <span>{children}</span>}
    </button>
  );
};

const Card = ({ title, subtitle, children, className = '', actions = null, noPadding = false }: any) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm shadow-2xl rounded-xl border border-gray-700 flex flex-col ${className}`}>
    {(title || actions) && (
      <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/30 rounded-t-xl">
        <div>
          <h3 className="text-lg font-bold text-gray-100">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex space-x-2">{actions}</div>}
      </div>
    )}
    <div className={`${noPadding ? '' : 'p-6'} flex-grow overflow-auto custom-scrollbar`}>
      {children}
    </div>
  </div>
);

const ProgressBar = ({ value, max = 100, color = 'indigo', label }: any) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      {label && <span className="text-xs font-medium text-gray-300">{label}</span>}
      <span className="text-xs font-medium text-gray-400">{Math.round((value / max) * 100)}%</span>
    </div>
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <div className={`bg-${color}-500 h-2.5 rounded-full transition-all duration-500`} style={{ width: `${(value / max) * 100}%` }}></div>
    </div>
  </div>
);

const AIStatusMonitor = () => {
  const stats = [
    { label: 'Quantum Core Load', value: 78, color: 'indigo' },
    { label: 'Global Latency', value: 8, max: 50, color: 'green' },
    { label: 'Predictive Accuracy', value: 98.2, color: 'purple' },
    { label: 'Neural Firewall Threat', value: 2, color: 'red' },
  ];

  return (
    <Card title="AI System Status" subtitle="Real-time Quantum Core Monitoring">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat, idx) => (
          <ProgressBar key={idx} label={stat.label} value={stat.value} max={stat.max || 100} color={stat.color} />
        ))}
      </div>
    </Card>
  );
};

const NoCodeEditor = ({ algorithm, onUpdateCode }: { algorithm: Algorithm, onUpdateCode: (code: string) => void }) => {
  const [blocks, setBlocks] = useState<string[]>(() => {
    try { return JSON.parse(algorithm.code).nodes || []; } catch { return []; }
  });

  const handleAddBlock = (type: string) => {
    const newBlock = `${type}: New Logic Node`;
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    onUpdateCode(JSON.stringify({ nodes: newBlocks }));
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 rounded-lg border border-gray-700">
      <div className="p-3 border-b border-gray-700 bg-gray-800/50 rounded-t-lg flex flex-wrap gap-2">
        <Button icon={Database} onClick={() => handleAddBlock('Input')} variant="secondary" size="sm">Input</Button>
        <Button icon={TrendingUp} onClick={() => handleAddBlock('Indicator')} variant="secondary" size="sm">Indicator</Button>
        <Button icon={SlidersHorizontal} onClick={() => handleAddBlock('Logic')} variant="secondary" size="sm">Logic</Button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-3">
        {blocks.map((block, index) => (
          <div key={index} className="bg-gray-800 border border-indigo-900/50 p-4 rounded-lg text-gray-300 font-mono text-sm">
            {block}
          </div>
        ))}
      </div>
    </div>
  );
};

const AlgorithmParametersForm = ({ algorithm, onUpdate }: { algorithm: Algorithm, onUpdate: (params: AlgorithmParameter[]) => void }) => {
    const [params, setParams] = useState(algorithm.parameters);

    const handleChange = (index: number, value: any) => {
        const newParams = [...params];
        newParams[index].value = value;
        setParams(newParams);
    };

    return (
        <div className="p-6 space-y-6">
            {params.map((param, index) => (
                <div key={param.name}>
                    <label className="block text-sm font-medium text-gray-300">{param.name}</label>
                    <input
                        type="number"
                        value={param.value}
                        onChange={(e) => handleChange(index, parseFloat(e.target.value))}
                        className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                    />
                </div>
            ))}
            <Button icon={Save} onClick={() => onUpdate(params)} variant="primary">Save Parameters</Button>
        </div>
    );
};

const Backtester = ({ algorithm }: { algorithm: Algorithm }) => {
  const [isBacktesting, setIsBacktesting] = useState(false);
  const handleRun = () => setIsBacktesting(true);

  return (
    <Card title="Simulation" subtitle="Backtesting Engine">
      <Button icon={Play} onClick={handleRun} disabled={isBacktesting} variant="primary" className="w-full">
        {isBacktesting ? 'Running...' : 'Run Simulation'}
      </Button>
    </Card>
  );
};

const AlgoTradingLab: React.FC = () => {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>(initialAlgorithms);
  const [selectedAlgo, setSelectedAlgo] = useState<Algorithm | null>(null);
  const [viewMode, setViewMode] = useState<'editor' | 'backtest' | 'params'>('editor');

  const updateAlgoCode = (code: string) => {
    if (selectedAlgo) {
      const updated = { ...selectedAlgo, code };
      setAlgorithms(algorithms.map(a => a.id === selectedAlgo.id ? updated : a));
      setSelectedAlgo(updated);
    }
  };

  return (
    <div className="flex h-screen p-6 bg-gray-900 text-white gap-6">
      <div className="w-1/3">
        <Card title="Strategies">
          {algorithms.map((algo) => (
            <div key={algo.id} onClick={() => setSelectedAlgo(algo)} className="p-3 bg-gray-700 mb-2 cursor-pointer rounded hover:bg-gray-600">
              {algo.name}
            </div>
          ))}
        </Card>
      </div>
      <div className="flex-grow flex flex-col gap-6">
        {selectedAlgo ? (
          <>
            <div className="flex gap-2">
              <Button onClick={() => setViewMode('editor')} variant={viewMode === 'editor' ? 'primary' : 'ghost'}>Editor</Button>
              <Button onClick={() => setViewMode('params')} variant={viewMode === 'params' ? 'primary' : 'ghost'}>Params</Button>
              <Button onClick={() => setViewMode('backtest')} variant={viewMode === 'backtest' ? 'primary' : 'ghost'}>Simulate</Button>
            </div>
            <div className="flex-grow">
              {viewMode === 'editor' && <NoCodeEditor algorithm={selectedAlgo} onUpdateCode={updateAlgoCode} />}
              {viewMode === 'params' && <AlgorithmParametersForm algorithm={selectedAlgo} onUpdate={(p) => setSelectedAlgo({...selectedAlgo, parameters: p})} />}
              {viewMode === 'backtest' && <Backtester algorithm={selectedAlgo} />}
            </div>
          </>
        ) : <div className="text-gray-500">Select a strategy</div>}
        <AIStatusMonitor />
      </div>
    </div>
  );
};

export default AlgoTradingLab;