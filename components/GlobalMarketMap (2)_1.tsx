import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
} from 'recharts';
// Standardizing on @heroicons/react for icons, aligning with Tailwind UI.
import {
  HomeIcon,
  GlobeAltIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
  BellIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  TriangleExclamationIcon,
} from '@heroicons/react/24/outline';

// -----------------------------------------------------------------------------
// --- THEME & CONSTANTS (Standardized) ---
// Replacing "HOBBYIST BIOS: VARIABLES & DISARRAY" with a clear, standardized section.
// -----------------------------------------------------------------------------

const THEME = {
  primary: '#EAB308', // Yellow-500 (Used purple previously, now aligning with the UI's yellow accent)
  secondary: '#3B82F6', // Blue-500
  danger: '#EF4444', // Red-500
  success: '#10B981', // Emerald-500
  background: '#020617', // Slate-950
  surface: '#0F172A', // Slate-900
  border: '#1E293B', // Slate-800
  textMain: '#F8FAFC', // White
  textMuted: '#94A3B8', // Slate-400
};

const REGIONS = ['NA', 'EU', 'APAC', 'LATAM', 'MENA', 'AFRICA'] as const;
const SECTORS = ['FinTech', 'HealthTech', 'Energy', 'Quantum', 'Logistics', 'Defense', 'AgriTech'];
const AI_MODELS = ['Alpha-Predict', 'Beta-Sentiment', 'Gamma-Risk', 'Omega-Exec'];

// -----------------------------------------------------------------------------
// --- DATA MODELS (Type Definitions) ---
// Replacing "CHAOS BLOBS & UNTYPED VOID" with clear, well-defined TypeScript interfaces.
// -----------------------------------------------------------------------------

/**
 * Represents a single market entity (e.g., a company stock, commodity, or crypto asset).
 */
interface MarketEntity {
  id: string;
  name: string;
  ticker: string;
  region: typeof REGIONS[number];
  sector: string;
  price: number;
  change: number; // Percentage change
  marketCap: number; // In billions
  volatility: number; // 0-1 range
  sentimentScore: number; // 0-100 score
  aiPrediction: 'BUY' | 'SELL' | 'HOLD';
  riskFactor: number; // 0-10 scale
  history: { time: number; value: number }[]; // Price history
}

/**
 * Represents a system-generated notification or alert.
 */
interface SystemNotification {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARNING' | 'CRITICAL' | 'AI_INSIGHT';
  message: string;
  source: string; // e.g., 'SYS_KERNEL', 'AI_CORE', 'PREDICT_ENGINE'
}

/**
 * Represents a message within the AI chat interface.
 */
interface AIChatMessage {
  id: string;
  sender: 'USER' | 'SYSTEM_AI';
  text: string;
  timestamp: number;
  intent?: 'ANALYSIS' | 'EXECUTION' | 'GENERAL'; // Optional intent classification
}

/**
 * Represents the current user's profile information and preferences.
 * This structure would typically be fetched from a secure authentication service.
 */
interface UserProfile {
  name: string;
  role: string;
  clearanceLevel: number;
  activeSessionId: string;
  preferences: {
    theme: 'DARK' | 'LIGHT';
    notifications: boolean;
    autoTrade: boolean;
    riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  };
}

// -----------------------------------------------------------------------------
// --- MOCK API / DATA GENERATION (Cleaned and Standardized) ---
// Replacing "REAL DATA DESTRUCTION BRAKES" with structured mock API functions.
// These functions simulate asynchronous data fetching for development purposes.
// In a production system, these would be replaced by actual API calls, likely
// managed by a unified API connector pattern (React Query, SWR, etc.).
// -----------------------------------------------------------------------------

const COMPANY_PREFIXES = ['Global', 'Nexus', 'Quantum', 'Apex', 'Stellar', 'Cyber', 'Eco', 'Fusion', 'Hyper', 'Omni'];
const COMPANY_SUFFIXES = ['Corp', 'Systems', 'Dynamics', 'Holdings', 'Ventures', 'Technologies', 'Industries', 'Group', 'Labs', 'Network'];

const generateEntityName = (i: number) => {
  const pre = COMPANY_PREFIXES[i % COMPANY_PREFIXES.length];
  const suf = COMPANY_SUFFIXES[(i * 3) % COMPANY_SUFFIXES.length];
  return `${pre}${suf} ${String.fromCharCode(65 + (i % 26))}`;
};

/**
 * Simulates fetching initial market data.
 * @param count Number of entities to generate.
 * @returns A promise resolving with an array of MarketEntity.
 */
const mockApiFetchMarketData = (count: number): Promise<MarketEntity[]> => {
  return new Promise(resolve => {
    setTimeout(() => { // Simulate network latency
      const data = Array.from({ length: count }).map((_, i) => {
        const basePrice = 50 + Math.random() * 950;
        return {
          id: `ENT-${10000 + i}`,
          name: generateEntityName(i),
          ticker: `TKR${i}`,
          region: REGIONS[i % REGIONS.length],
          sector: SECTORS[i % SECTORS.length],
          price: parseFloat(basePrice.toFixed(2)),
          change: parseFloat(((Math.random() - 0.5) * 5).toFixed(2)),
          marketCap: parseFloat((1 + Math.random() * 500).toFixed(2)), // In billions
          volatility: parseFloat(Math.random().toFixed(2)), // 0-1
          sentimentScore: parseFloat((30 + Math.random() * 70).toFixed(1)), // 30-100
          aiPrediction: Math.random() > 0.6 ? 'BUY' : Math.random() > 0.3 ? 'HOLD' : 'SELL',
          riskFactor: parseFloat((Math.random() * 10).toFixed(1)), // 0-10
          history: Array.from({ length: 20 }).map((__, h) => ({
            time: Date.now() - (19 - h) * 60 * 1000, // Last 20 minutes
            value: parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2)),
          })),
        };
      });
      resolve(data);
    }, 500);
  });
};

/**
 * Simulates fetching AI insights.
 * @param entities Current market entities to base insights on.
 * @returns A promise resolving with an AI insight message.
 */
const mockApiFetchAIInsight = (entities: MarketEntity[]): Promise<string> => {
  return new Promise(resolve => {
    setTimeout(() => { // Simulate AI processing time
      const templates = [
        "AI Model detected arbitrage opportunity in {REGION} sector.",
        "Volatility index for {SECTOR} exceeds safety thresholds. Recommendation: Hedge.",
        "Sentiment analysis for {NAME} indicates a high probability of bullish breakout.",
        "Supply chain disruption predicted in {REGION} due to algorithmic weather modeling.",
        "Quantum liquidity pools are rebalancing. Expect minor turbulence in {SECTOR}.",
        "Anomaly detected in {NAME} - price divergence from sector trend.",
        "Increased trading volume in {SECTOR} suggests market attention.",
      ];
      const template = templates[Math.floor(Math.random() * templates.length)];
      const entity = entities[Math.floor(Math.random() * entities.length)];
      const insight = template
        .replace('{REGION}', entity.region)
        .replace('{SECTOR}', entity.sector)
        .replace('{NAME}', entity.name);
      resolve(insight);
    }, 1500);
  });
};

/**
 * Simulates updating market data for real-time changes.
 * @param prevData Previous market data.
 * @returns A promise resolving with the updated market data.
 */
const mockApiUpdateMarketData = (prevData: MarketEntity[]): Promise<MarketEntity[]> => {
  return new Promise(resolve => {
    setTimeout(() => { // Simulate network/data update frequency
      const updatedData = prevData.map(entity => {
        const volatilityFactor = entity.volatility * 0.05;
        const changeAmount = (Math.random() - 0.5) * volatilityFactor * entity.price;
        const newPrice = Math.max(0.1, parseFloat((entity.price + changeAmount).toFixed(2)));

        const newHistory = [...entity.history.slice(1), { time: Date.now(), value: newPrice }];

        // Simulate AI prediction changes (less frequent and with a clear rationale)
        let newPrediction = entity.aiPrediction;
        if (Math.random() > 0.98) { // Only 2% chance of prediction change per update
          newPrediction = ['BUY', 'SELL', 'HOLD'][Math.floor(Math.random() * 3)] as any;
        }

        return {
          ...entity,
          price: newPrice,
          change: parseFloat((((newPrice - entity.price) / entity.price) * 100).toFixed(2)),
          history: newHistory,
          aiPrediction: newPrediction,
        };
      });
      resolve(updatedData);
    }, 2000);
  });
};

// -----------------------------------------------------------------------------
// --- REUSABLE UI COMPONENTS (Standardized using Tailwind CSS) ---
// Replacing "SUPER-MONOLITHS" with modular, well-defined components.
// -----------------------------------------------------------------------------

const Card: React.FC<{ children: React.ReactNode; title?: string; className?: string; action?: React.ReactNode }> = ({ children, title, className = '', action }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col ${className}`}>
    {(title || action) && (
      <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
        {title && <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
          {title}
        </h3>}
        {action}
      </div>
    )}
    <div className="p-4 flex-1 overflow-auto relative">
      {children}
    </div>
  </div>
);

const MetricBadge: React.FC<{ label: string; value: string | number; trend?: 'up' | 'down' | 'neutral'; color?: string }> = ({ label, value, trend, color }) => {
  const TrendIcon = trend === 'up' ? ArrowUpIcon : trend === 'down' ? ArrowDownIcon : MinusIcon;
  const trendColorClass = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400';

  return (
    <div className="flex flex-col bg-slate-950/30 p-2 rounded border border-slate-800/50">
      <span className="text-[10px] text-slate-500 uppercase font-semibold">{label}</span>
      <div className="flex items-end gap-2">
        <span className="text-lg font-mono font-bold text-slate-100" style={{ color }}>{value}</span>
        {trend && (
          <TrendIcon className={`w-4 h-4 mb-1 ${trendColorClass}`} />
        )}
      </div>
    </div>
  );
};

const AIStatusIndicator: React.FC<{ status: 'IDLE' | 'PROCESSING' | 'ANALYZING' | 'LOCKED' }> = ({ status }) => {
  const colors = {
    IDLE: 'bg-slate-500',
    PROCESSING: 'bg-blue-500',
    ANALYZING: 'bg-purple-500',
    LOCKED: 'bg-red-500',
  };
  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950 border border-slate-800">
      <div className={`w-2 h-2 rounded-full ${colors[status]} ${status !== 'IDLE' ? 'animate-pulse' : ''}`} />
      <span className="text-xs font-mono text-slate-300">{status} CORE ACTIVE</span>
    </div>
  );
};

// -----------------------------------------------------------------------------
// --- CHART WRAPPERS (Cleaned and Typed) ---
// Removing "UNWRAPPERS FOR TEXT TO MIX TYPES" for clearer component definitions.
// -----------------------------------------------------------------------------

const ScatterChartWrapper = React.memo(({ data }: { data: any[] }) => (
  <ComposedChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
    <XAxis type="number" dataKey="x" name="Region Index" stroke={THEME.textMuted} tick={false} label={{ value: 'Geographic Distribution', position: 'bottom', fill: THEME.textMuted }} />
    <YAxis type="number" dataKey="y" name="Price" stroke={THEME.textMuted} label={{ value: 'Asset Price', angle: -90, position: 'left', fill: THEME.textMuted }} />
    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: THEME.surface, borderColor: THEME.border, color: THEME.textMain }} formatter={(value: number, name: string, props: any) => {
        if (props.payload) {
            const d = props.payload;
            if (name === 'Price') return [`$${value.toFixed(2)}`, name];
            if (name === 'Market Cap') return [`$${d.z.toFixed(1)}B`, name];
        }
        return value;
    }} />
    <Scatter name="Companies" data={data} fill={THEME.secondary}>
      {data.map((entry, index) => (
        <cell key={`cell-${index}`} fill={entry.trend === 'up' ? THEME.success : THEME.danger} />
      ))}
    </Scatter>
  </ComposedChart>
));

const LineChartWrapper = React.memo(({ data }: { data: MarketEntity[] }) => (
  <ResponsiveContainer width="100%" height="100%">
    <ComposedChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
      <XAxis dataKey="history.time" type="number" scale="time" domain={['dataMin', 'dataMax']} tickFormatter={(timeStr) => new Date(timeStr).toLocaleTimeString()} stroke={THEME.textMuted} tick={{fontSize: 10}} />
      <YAxis stroke={THEME.textMuted} tick={{fontSize: 10}} />
      <Tooltip contentStyle={{ backgroundColor: THEME.surface, borderColor: THEME.border }} />
      <Line type="monotone" dataKey="price" stroke={THEME.primary} strokeWidth={2} dot={false} name="Price" />
      {/* Assuming sentimentScore is also part of the history, or needs aggregation */}
      <Line type="monotone" dataKey="sentimentScore" stroke={THEME.secondary} strokeWidth={1} dot={false} name="Sentiment" />
    </ComposedChart>
  </ResponsiveContainer>
));


// -----------------------------------------------------------------------------
// --- GLOBAL MARKET MAP COMPONENT (Refactored for Stability) ---
// Replacing "MINOR USERLAND FRAGMENT", "STATELESS NEGLECT", "TERMINATION & REALITY STRAIGHT LINES",
// "IGNORERS", "PARSING HINDRANCES", "BLIND LOGIC", "LEAF PARSE" with a cohesive structure.
// This component aggregates various dashboard views and manages their state and data.
// -----------------------------------------------------------------------------

const GlobalMarketMap: React.FC = () => {
  // --- Component State (Local and UI-related) ---
  const [systemTime, setSystemTime] = useState(Date.now());
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'MARKET_MAP' | 'AI_NEXUS' | 'RISK_CONTROL' | 'PROFILE'>('DASHBOARD');
  const [chatInput, setChatInput] = useState('');
  const [aiStatus, setAiStatus] = useState<'IDLE' | 'PROCESSING' | 'ANALYZING' | 'LOCKED'>('IDLE');

  // --- Data State (Mimicking what a global store or React Query would manage) ---
  const [marketData, setMarketData] = useState<MarketEntity[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [chatHistory, setChatHistory] = useState<AIChatMessage[]>([]);

  // User profile: hardcoded for MVP, but would come from secure auth.
  const [userProfile] = useState<UserProfile>({
    name: 'Director A. Vance',
    role: 'Chief Investment Officer',
    clearanceLevel: 5,
    activeSessionId: 'SES-992-XJ',
    preferences: { theme: 'DARK', notifications: true, autoTrade: false, riskTolerance: 'MEDIUM' },
  });

  // --- Data Fetching & Real-time Updates ---
  useEffect(() => {
    // Initial data load on component mount
    const loadInitialData = async () => {
      try {
        const initialMarketData = await mockApiFetchMarketData(50);
        setMarketData(initialMarketData);

        setNotifications([
          { id: 'init-1', timestamp: Date.now(), level: 'INFO', message: 'System initialized. Secure connection established.', source: 'SYS_KERNEL' },
          { id: 'init-2', timestamp: Date.now(), level: 'AI_INSIGHT', message: 'Predictive models loaded. 98.4% accuracy verified.', source: 'AI_CORE' },
        ]);

        setChatHistory([
          { id: 'msg-0', sender: 'SYSTEM_AI', text: `Welcome back, ${userProfile.name}. Market volatility is currently nominal. I have prepared 3 strategic acquisition targets.`, timestamp: Date.now() }
        ]);
      } catch (error) {
        console.error("Failed to load initial data:", error);
        setNotifications(prev => [{ id: `error-${Date.now()}`, timestamp: Date.now(), level: 'CRITICAL', message: 'Failed to load initial market data.', source: 'SYS_ERROR' }, ...prev]);
      }
    };

    loadInitialData();
  }, [userProfile.name]); // Dependency on userProfile.name for welcome message

  useEffect(() => {
    const clockInterval = setInterval(() => setSystemTime(Date.now()), 1000);

    // Controlled interval for market data and AI insights polling
    const dataRefreshInterval = setInterval(async () => {
      try {
        // Update market data
        const updatedMarketData = await mockApiUpdateMarketData(marketData);
        setMarketData(updatedMarketData);

        // Fetch AI insight occasionally (only if marketData is available)
        if (updatedMarketData.length > 0 && Math.random() > 0.7) {
          const newInsight = await mockApiFetchAIInsight(updatedMarketData);
          setNotifications(prev => [
            { id: `notif-${Date.now()}`, timestamp: Date.now(), level: 'AI_INSIGHT', message: newInsight, source: 'PREDICT_ENGINE' },
            ...prev.slice(0, 49) // Keep max 50 notifications
          ]);
        }
      } catch (error) {
        console.error("Failed to refresh market data or AI insight:", error);
        setNotifications(prev => [{ id: `error-${Date.now()}`, timestamp: Date.now(), level: 'WARNING', message: 'Market data refresh failed.', source: 'DATA_REFRESH' }, ...prev]);
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(clockInterval);
      clearInterval(dataRefreshInterval);
    };
  }, [marketData]); // Re-run effect if marketData changes to use the latest state for updates

  // --- AI Chat Logic ---
  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim()) return;

    const userMsg: AIChatMessage = { id: `msg-${Date.now()}`, sender: 'USER', text: chatInput, timestamp: Date.now() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setAiStatus('PROCESSING');

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate initial processing delay
      setAiStatus('ANALYZING');
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate analysis time

      const responses = [
        "Analyzing market vectors... I recommend increasing exposure to the APAC region based on current momentum.",
        "Risk assessment complete. No immediate threats detected in your portfolio. All parameters are within thresholds.",
        "Processing request. Generating comprehensive report on sector volatility and potential hedging strategies.",
        "I've adjusted the algorithmic trading parameters to capitalize on the recent dip, awaiting your confirmation.",
        "Confirmed. Executing trade simulation for approval. Results will be available in the 'Risk & Compliance' module.",
        "Query understood. Accessing real-time global economic indicators to inform our next steps.",
        "Data integrity verified. Proceeding with the requested scenario analysis."
      ];
      const responseText = responses[Math.floor(Math.random() * responses.length)];
      const aiMsg: AIChatMessage = { id: `msg-${Date.now() + 1}`, sender: 'SYSTEM_AI', text: responseText, timestamp: Date.now() };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI chat failed:", error);
      const errorMsg: AIChatMessage = { id: `msg-${Date.now() + 1}`, sender: 'SYSTEM_AI', text: "Error: AI service is currently unreachable. Please try again later.", timestamp: Date.now() };
      setChatHistory(prev => [...prev, errorMsg]);
      setNotifications(prev => [{ id: `ai-error-${Date.now()}`, timestamp: Date.now(), level: 'CRITICAL', message: 'AI chat service error.', source: 'AI_CHAT' }, ...prev]);
    } finally {
      setAiStatus('IDLE');
    }
  }, [chatInput]);

  // --- Formatting Utilities ---
  const formatCurrency = useCallback((val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val), []);
  const formatNumber = useCallback((val: number) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(val), []);

  // --- View Render Functions (Modularized) ---

  const renderSidebar = () => (
    <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-black text-yellow-500 tracking-tighter">OMNI<span className="text-white">SYS</span></h1>
        <p className="text-xs text-slate-500 mt-1">Enterprise OS v9.4.2</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {[
          { id: 'DASHBOARD', label: 'Executive Dashboard', icon: HomeIcon },
          { id: 'MARKET_MAP', label: 'Global Market Map', icon: GlobeAltIcon },
          { id: 'AI_NEXUS', label: 'AI Command Nexus', icon: SparklesIcon },
          { id: 'RISK_CONTROL', label: 'Risk & Compliance', icon: ShieldCheckIcon },
          { id: 'PROFILE', label: 'Director Profile', icon: UserCircleIcon },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as any)}
            className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
              activeView === item.id
                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900 rounded p-3 border border-slate-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
              {userProfile.name.charAt(0)}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">{userProfile.name}</div>
              <div className="text-[10px] text-slate-500">{userProfile.role}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Session: {userProfile.activeSessionId}</span>
            <span className="text-emerald-500 flex items-center gap-1">
              <CheckCircleIcon className="w-3 h-3" /> Secure
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    const totalCap = useMemo(() => marketData.reduce((acc, curr) => acc + curr.marketCap, 0), [marketData]);
    const avgSentiment = useMemo(() => marketData.length > 0 ? marketData.reduce((acc, curr) => acc + curr.sentimentScore, 0) / marketData.length : 0, [marketData]);

    return (
      <div className="grid grid-cols-12 gap-4 h-full overflow-y-auto p-6">
        <div className="col-span-12 grid grid-cols-4 gap-4 mb-2">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950">
            <MetricBadge label="Total Market Cap" value={`$${formatNumber(totalCap)}B`} trend="up" color={THEME.primary} />
          </Card>
          <Card>
            <MetricBadge label="Global Sentiment" value={`${avgSentiment.toFixed(1)}/100`} trend={avgSentiment > 50 ? 'up' : 'down'} color={THEME.secondary} />
          </Card>
          <Card>
            <MetricBadge label="Active AI Agents" value="1,024" trend="neutral" color={THEME.success} />
          </Card>
          <Card>
            <MetricBadge label="System Latency" value="12ms" color="#F472B6" />
          </Card>
        </div>

        <div className="col-span-8 h-96">
          <Card title="Real-Time Market Velocity" className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={marketData.slice(0, 20)}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={THEME.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                <XAxis dataKey="ticker" stroke={THEME.textMuted} tick={{fontSize: 10}} />
                <YAxis stroke={THEME.textMuted} tick={{fontSize: 10}} />
                <Tooltip
                  contentStyle={{ backgroundColor: THEME.surface, borderColor: THEME.border, color: THEME.textMain }}
                  itemStyle={{ color: THEME.primary }}
                  formatter={(value: number, name: string, props: any) => {
                    if (props.payload) {
                        const d = props.payload;
                        if (name === 'price') return [`$${value.toFixed(2)}`, 'Price'];
                        if (name === 'marketCap') return [`$${d.marketCap.toFixed(1)}B`, 'Market Cap'];
                    }
                    return value;
                  }}
                  labelFormatter={(label) => `Ticker: ${label}`}
                />
                <Bar dataKey="marketCap" fill={THEME.secondary} opacity={0.3} barSize={20} />
                <Line type="monotone" dataKey="price" stroke={THEME.primary} strokeWidth={2} dot={false} name="Price" />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="col-span-4 h-96">
          <Card title="Predictive Intelligence Feed" className="h-full">
            <div className="space-y-3">
              {notifications.filter(n => n.level === 'AI_INSIGHT').map(note => (
                <div key={note.id} className="p-3 bg-slate-950/50 border border-slate-800 rounded text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="text-blue-400 font-bold">{note.source}</span>
                    <span className="text-slate-600">{new Date(note.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-300">{note.message}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 h-64">
          <Card title="Sector Performance Matrix" className="h-full">
             <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={marketData.slice(0, 30)}>
                <CartesianGrid strokeDasharray="3 3" stroke={THEME.border} />
                <XAxis dataKey="sector" stroke={THEME.textMuted} tick={{fontSize: 10}} />
                <YAxis stroke={THEME.textMuted} tick={{fontSize: 10}} />
                <Tooltip contentStyle={{ backgroundColor: THEME.surface, borderColor: THEME.border }} />
                <Scatter name="Volatility" dataKey="volatility" fill={THEME.danger} />
                <Bar dataKey="sentimentScore" fill={THEME.success} opacity={0.6} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    );
  };

  const renderMarketMap = () => {
    const scatterData = useMemo(() => marketData.map((d, i) => ({
      x: REGIONS.indexOf(d.region) + (Math.random() - 0.5) * 0.5, // Spread out points slightly per region
      y: d.price,
      z: d.marketCap, // Used for size/detail in tooltip
      name: d.name,
      region: d.region,
      trend: d.change > 0 ? 'up' : 'down'
    })), [marketData]);

    return (
      <div className="h-full p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Global Market Topography</h2>
          <div className="flex gap-2">
            {REGIONS.map(r => (
              <span key={r} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">{r}</span>
            ))}
          </div>
        </div>
        <Card className="flex-1 border-yellow-500/30">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChartWrapper data={scatterData} />
          </ResponsiveContainer>
        </Card>
      </div>
    );
  };

  const renderAINexus = () => (
    <div className="h-full p-6 grid grid-cols-12 gap-6">
      <div className="col-span-3 space-y-4">
        <Card title="Active Neural Models">
          <div className="space-y-2">
            {AI_MODELS.map(model => (
              <div key={model} className="flex items-center justify-between p-2 bg-slate-950 rounded border border-slate-800">
                <span className="text-xs font-mono text-slate-300">{model}</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="System Health">
          <div className="space-y-4 mt-2">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1"><span>CPU Load</span><span>84%</span></div>
              <div className="w-full bg-slate-800 h-1 rounded"><div className="bg-blue-500 h-1 rounded w-[84%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Memory</span><span>42TB / 128TB</span></div>
              <div className="w-full bg-slate-800 h-1 rounded"><div className="bg-purple-500 h-1 rounded w-[32%]"></div></div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Network</span><span>140 Gbps</span></div>
              <div className="w-full bg-slate-800 h-1 rounded"><div className="bg-yellow-500 h-1 rounded w-[60%]"></div></div>
            </div>
          </div>
        </Card>
      </div>

      <div className="col-span-9 flex flex-col h-full">
        <Card title="Quantum Chat Interface" className="flex-1 flex flex-col" action={<AIStatusIndicator status={aiStatus} />}>
          <div className="flex-1 overflow-y-auto space-y-4 p-4 custom-scrollbar">
            {chatHistory.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-lg text-sm ${
                  msg.sender === 'USER'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                }`}>
                  <div className="text-[10px] opacity-50 mb-1 flex justify-between gap-4">
                    <span>{msg.sender === 'USER' ? 'You' : 'AI Assistant'}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {msg.text}
                </div>
              </div>
            ))}
            {aiStatus !== 'IDLE' && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-lg rounded-bl-none border border-slate-700">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            {/* Scroll to bottom */}
            <div ref={useCallback((node) => {
              if (node) node.scrollIntoView({ behavior: 'smooth' });
            }, [chatHistory])} />
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-950">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Enter command or query for AI analysis..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500 transition-colors"
                disabled={aiStatus !== 'IDLE'}
              />
              <button
                onClick={handleSendMessage}
                className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={aiStatus !== 'IDLE' || !chatInput.trim()}
              >
                EXECUTE
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderRiskControl = () => (
    <div className="h-full p-6 space-y-6">
      <div className="grid grid-cols-3 gap-6">
        <Card title="Portfolio Risk Heatmap">
          <div className="grid grid-cols-5 gap-1 h-48">
            {marketData.slice(0, 50).map(m => (
              <div
                key={m.id}
                className="rounded cursor-pointer hover:opacity-80 transition-opacity relative group"
                style={{
                  backgroundColor: m.riskFactor > 8 ? THEME.danger : m.riskFactor > 5 ? '#F59E0B' : THEME.success,
                  opacity: 0.6 + (m.riskFactor / 20)
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/80 text-[10px] text-white font-bold p-1 text-center z-10">
                  {m.ticker}<br/>Risk: {m.riskFactor.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Compliance Log">
          <div className="space-y-2 overflow-y-auto h-48 pr-2 custom-scrollbar">
            {notifications.filter(n => n.level !== 'AI_INSIGHT').map(note => (
              <div key={note.id} className="flex items-center gap-2 text-xs p-2 border-b border-slate-800">
                {note.level === 'INFO' && <CheckCircleIcon className="w-4 h-4 text-emerald-500" />}
                {note.level === 'WARNING' && <TriangleExclamationIcon className="w-4 h-4 text-yellow-500" />}
                {note.level === 'CRITICAL' && <ExclamationCircleIcon className="w-4 h-4 text-red-500" />}
                <span className="text-slate-400">{new Date(note.timestamp).toLocaleDateString()}</span>
                <span className="text-slate-200">{note.message}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Liquidity Stress Test">
          <div className="flex items-center justify-center h-48">
             <div className="relative w-32 h-32">
               <svg className="w-full h-full" viewBox="0 0 36 36">
                 <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={THEME.border} strokeWidth="2" />
                 <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831" fill="none" stroke={THEME.primary} strokeWidth="2" strokeDasharray="75, 100" />
               </svg>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-2xl font-bold text-white">75%</span>
                 <span className="text-[8px] text-slate-400 uppercase">Liquidity</span>
               </div>
             </div>
          </div>
        </Card>
      </div>
      <Card title="Anomaly Detection Timeline">
        <LineChartWrapper data={marketData.slice(0, 20)} />
      </Card>
    </div>
  );

  const renderProfile = () => (
    <div className="h-full p-6 flex justify-center items-start">
      <div className="w-full max-w-2xl space-y-6">
        <Card title="Executive Profile Configuration">
          <div className="p-4 space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center text-3xl font-bold text-yellow-500 border-2 border-yellow-500">
                {userProfile.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{userProfile.name}</h2>
                <p className="text-slate-400">{userProfile.role}</p>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-1 bg-blue-900/30 text-blue-400 text-xs rounded border border-blue-900">Level {userProfile.clearanceLevel} Clearance</span>
                  <span className="px-2 py-1 bg-emerald-900/30 text-emerald-400 text-xs rounded border border-emerald-900">Biometrics Verified</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-6">
              <div className="space-y-2">
                <label htmlFor="theme-select" className="text-xs text-slate-500 uppercase font-bold">Interface Theme</label>
                <select id="theme-select" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white focus:outline-none focus:border-yellow-500">
                  <option>Midnight Protocol (Dark)</option>
                  <option selected={userProfile.preferences.theme === 'LIGHT'}>Daylight Operations (Light)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="risk-tolerance-select" className="text-xs text-slate-500 uppercase font-bold">Risk Tolerance AI</label>
                <select id="risk-tolerance-select" className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-sm text-white focus:outline-none focus:border-yellow-500">
                  <option>Conservative (Low)</option>
                  <option selected={userProfile.preferences.riskTolerance === 'MEDIUM'}>Balanced (Medium)</option>
                  <option>Aggressive (High)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-800 pt-6">
              <h3 className="text-sm font-bold text-white">Automated Directives</h3>
              {[
                { label: 'Auto-Execute Stop Loss', active: true },
                { label: 'AI Sentiment Analysis Reports', active: true },
                { label: 'Quantum Encryption Layer', active: true },
                { label: 'Share Data with Global Ledger', active: false },
              ].map((setting, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded border border-slate-800">
                  <span className="text-sm text-slate-300">{setting.label}</span>
                  <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${setting.active ? 'bg-yellow-600' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${setting.active ? 'left-6' : 'left-1'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 font-sans overflow-hidden selection:bg-yellow-500/30">
      {renderSidebar()}

      <main className="flex-1 flex flex-col relative">
        <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white tracking-wide">
              {activeView === 'DASHBOARD' && 'EXECUTIVE OVERVIEW'}
              {activeView === 'MARKET_MAP' && 'GLOBAL MARKET TOPOGRAPHY'}
              {activeView === 'AI_NEXUS' && 'ARTIFICIAL INTELLIGENCE CORE'}
              {activeView === 'RISK_CONTROL' && 'RISK & COMPLIANCE PROTOCOLS'}
              {activeView === 'PROFILE' && 'USER CONFIGURATION'}
            </h2>
            <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 text-[10px] border border-yellow-500/20 font-mono">
              LIVE FEED
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-xs text-slate-400">System Time</div>
              <div className="text-sm font-mono font-bold text-white">
                {new Date(systemTime).toLocaleTimeString()}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800"></div>
            <div className="flex gap-3">
              <button className="relative p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                <span className="sr-only">Notifications</span>
                <BellIcon className="w-6 h-6" />
                {notifications.filter(n => n.level === 'CRITICAL' || n.level === 'WARNING').length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors">
                <Cog6ToothIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden bg-slate-950 relative">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
               style={{ backgroundImage: `linear-gradient(${THEME.border} 1px, transparent 1px), linear-gradient(90deg, ${THEME.border} 1px, transparent 1px)`, backgroundSize: '40px 40px' }}>
          </div>

          <div className="relative z-10 h-full">
            {activeView === 'DASHBOARD' && renderDashboard()}
            {activeView === 'MARKET_MAP' && renderMarketMap()}
            {activeView === 'AI_NEXUS' && renderAINexus()}
            {activeView === 'RISK_CONTROL' && renderRiskControl()}
            {activeView === 'PROFILE' && renderProfile()}
          </div>
        </div>

        <footer className="h-8 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4 text-[10px] text-slate-500 font-mono">
          <div className="flex gap-4">
            <span>STATUS: <span className="text-emerald-500">ONLINE</span></span>
            <span>LATENCY: 14ms</span>
            <span>ENCRYPTION: AES-256-GCM</span>
          </div>
          <div className="flex gap-4">
            <span>BUILD: 2024.10.05.RC4</span>
            <span>COPYRIGHT &copy; OMNISYS CORP</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default GlobalMarketMap;