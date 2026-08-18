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