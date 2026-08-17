import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Download,
  Flame,
  Fuel,
  GitCommit,
  Layers,
  LineChart as LineChartIcon,
  Play,
  Pause,
  RefreshCw,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Workflow,
  Zap,
  Radio,
  Gauge,
  Maximize2
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface GasPricePoint {
  timestamp: number;
  timeLabel: string;
  baseFee: number; // in Gwei
  priorityFee: number; // in Gwei
  totalGas: number; // in Gwei
  blobFee: number; // in Gwei
  ethPrice: number; // in USD
  dexVolume24h: number; // in Millions USD
  volatilityIndex: number; // 0 - 100
  liquidationVolume: number; // in Millions USD
  correlationCoeff: number; // rolling r (-1 to 1)
}

interface CorrelationMetric {
  pair: string;
  pearsonR: number;
  spearmanRho: number;
  pValue: number;
  leadLagOptimal: string; // e.g. "Gas leads Price by 12m"
  relationshipType: 'Strong Positive' | 'Moderate Positive' | 'Negative' | 'Decoupled';
}

interface EventStudyItem {
  id: string;
  eventName: string;
  timestamp: string;
  gasPeakGwei: number;
  marketImpact1h: number; // percentage
  marketImpact24h: number; // percentage
  driver: 'NFT Mint' | 'DEX Liquidation' | 'Arbitrage Frenzy' | 'Airdrop Claim' | 'Panic Selloff';
}

interface PipelineStage {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'warning' | 'error';
  latencyMs: number;
  processedCount: number;
  description: string;
}

// --- MOCK HISTORICAL DATA GENERATOR ---
const generateHistoricalData = (count: number = 24): GasPricePoint[] => {
  const points: GasPricePoint[] = [];
  const now = Date.now();
  let currentEth = 3450;
  let currentBaseFee = 24;

  for (let i = count; i >= 0; i--) {
    const time = now - i * 3600 * 1000;
    const dateObj = new Date(time);
    const timeLabel = `${dateObj.getHours().toString().padStart(2, '0')}:00`;

    // Simulated market dynamics: High volatility / sudden drops trigger gas surges (liquidations/arbitrage)
    const shockFactor = Math.random() > 0.82 ? (Math.random() * 45 + 15) : (Math.sin(i / 3) * 12);
    const baseFee = Math.max(8, Math.round(currentBaseFee + shockFactor + (Math.random() * 6 - 3)));
    const priorityFee = Math.max(1.2, +(baseFee * 0.12 + Math.random() * 2).toFixed(2));
    const totalGas = +(baseFee + priorityFee).toFixed(2);
    const blobFee = +(Math.max(0.01, Math.sin(i / 2) * 2 + Math.random() * 1.5)).toFixed(3);

    // Eth price fluctuation correlated loosely with gas surges
    const priceDelta = (Math.random() * 40 - 20) - (shockFactor > 30 ? Math.random() * 60 : 0);
    currentEth = Math.max(2800, +(currentEth + priceDelta).toFixed(2));

    const dexVol = +(450 + totalGas * 18 + Math.random() * 100).toFixed(1);
    const volIndex = +(30 + (totalGas / 90) * 50 + Math.random() * 10).toFixed(1);
    const liquidations = +(shockFactor > 25 ? (shockFactor * 1.4 + Math.random() * 15) : Math.random() * 5).toFixed(2);
    
    // Dynamic Pearson approximation
    const correlation = +(-0.35 + Math.sin(i / 4) * 0.45 + (shockFactor > 25 ? 0.4 : -0.1)).toFixed(3);

    points.push({
      timestamp: time,
      timeLabel,
      baseFee,
      priorityFee,
      totalGas,
      blobFee,
      ethPrice: currentEth,
      dexVolume24h: dexVol,
      volatilityIndex: Math.min(100, Math.max(0, volIndex)),
      liquidationVolume: liquidations,
      correlationCoeff: correlation
    });
  }
  return points;
};

// --- INITIAL METRICS ---
const INITIAL_METRICS: CorrelationMetric[] = [
  { pair: 'Base Fee ↔ ETH Volatility (15m)', pearsonR: 0.742, spearmanRho: 0.791, pValue: 0.0001, leadLagOptimal: 'Gas leads Vol by 8m', relationshipType: 'Strong Positive' },
  { pair: 'Total Gas ↔ DEX Swap Volume', pearsonR: 0.865, spearmanRho: 0.884, pValue: 0.00001, leadLagOptimal: 'Synchronous (0m)', relationshipType: 'Strong Positive' },
  { pair: 'Priority Fee ↔ ETH Price Drop Speed', pearsonR: 0.612, spearmanRho: 0.658, pValue: 0.0024, leadLagOptimal: 'Price drop leads Tip by 4m', relationshipType: 'Moderate Positive' },
  { pair: 'Blob Gas ↔ L2-to-L1 Batch Rate', pearsonR: 0.819, spearmanRho: 0.845, pValue: 0.00004, leadLagOptimal: 'L2 rollup leads Blob by 2m', relationshipType: 'Strong Positive' },
  { pair: 'Gas Gwei ↔ ETH Spot Price Trend', pearsonR: -0.284, spearmanRho: -0.312, pValue: 0.0480, leadLagOptimal: 'Gas leads Spot by 22m', relationshipType: 'Negative' },
];

const INITIAL_EVENTS: EventStudyItem[] = [
  { id: 'EV-1092', eventName: 'Market-wide Cascade Liquidation', timestamp: 'Today 04:15 UTC', gasPeakGwei: 284.5, marketImpact1h: -4.8, marketImpact24h: -8.2, driver: 'DEX Liquidation' },
  { id: 'EV-1091', eventName: 'Major Protocol Token Launch / Airdrop', timestamp: 'Yesterday 18:30 UTC', gasPeakGwei: 195.2, marketImpact1h: +1.4, marketImpact24h: +0.6, driver: 'Airdrop Claim' },
  { id: 'EV-1090', eventName: 'US CPI Data Volatility Burst', timestamp: '2 days ago', gasPeakGwei: 142.0, marketImpact1h: +3.2, marketImpact24h: +5.1, driver: 'Arbitrage Frenzy' },
  { id: 'EV-1089', eventName: 'Flash Crash Recovery Arbitrage', timestamp: '3 days ago', gasPeakGwei: 310.8, marketImpact1h: -6.2, marketImpact24h: +1.9, driver: 'Panic Selloff' },
];

export default function Pipeline30_GasPriceCorrelation() {
  // State management
  const [dataPoints, setDataPoints] = useState<GasPricePoint[]>(() => generateHistoricalData(24));
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'6h' | '24h' | '7d' | '30d'>('24h');
  const [selectedChain, setSelectedChain] = useState<'ethereum' | 'arbitrum' | 'optimism' | 'base'>('ethereum');
  const [selectedMetricFocus, setSelectedMetricFocus] = useState<'price' | 'volume' | 'volatility' | 'liquidations'>('volatility');
  const [hoveredPoint, setHoveredPoint] = useState<GasPricePoint | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'pipeline' | 'leadlag' | 'events'>('analytics');
  const [rollingWindowSize, setRollingWindowSize] = useState<number>(30); // in minutes
  const [alarmThresholdGwei, setAlarmThresholdGwei] = useState<number>(85);
  const [logMessages, setLogMessages] = useState<string[]>([
    'Pipeline initialized. Ingesting EIP-1559 Mempool feed...',
    'Chain RPC connected: https://eth-mainnet.alchemyapi.io/v2/live',
    'Rolling Pearson correlation buffer initialized [Size: 120 samples]',
    'Regression kernel ready: Ordinary Least Squares & Huber Regressor loaded.'
  ]);

  const chartRef = useRef<HTMLDivElement>(null);

  // Pipeline execution nodes
  const [stages, setStages] = useState<PipelineStage[]>([
    { id: 'ingest', name: 'Mempool & Block Ingestion', status: 'running', latencyMs: 14, processedCount: 148200, description: 'Extracts baseFee, priorityFee, and EIP-4844 blobs.' },
    { id: 'time_align', name: 'High-Freq Time-Alignment', status: 'completed', latencyMs: 8, processedCount: 148200, description: 'Synchronizes block timestamps with CEX/DEX tick books.' },
    { id: 'stat_engine', name: 'Stat & Correlation Engine', status: 'running', latencyMs: 28, processedCount: 148200, description: 'Calculates rolling Pearson r, Spearman rank, and lead-lag covariance.' },
    { id: 'signal_dispatch', name: 'Signal & Alpha Dispatcher', status: 'idle', latencyMs: 3, processedCount: 148195, description: 'Emits webhook alerts on anomalous Gas-Market divergence.' },
  ]);

  // Live Stream Simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setDataPoints((prev) => {
        const last = prev[prev.length - 1];
        const nextTime = last.timestamp + 60 * 1000 * 15; // 15-min forward step
        const dateObj = new Date(nextTime);
        const timeLabel = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;
        
        const gasSpike = Math.random() > 0.85 ? Math.random() * 40 : (Math.random() * 10 - 5);
        const newBaseFee = Math.max(10, Math.round(last.baseFee + gasSpike));
        const newPriorityFee = +(newBaseFee * 0.14 + Math.random() * 2).toFixed(2);
        const totalGas = +(newBaseFee + newPriorityFee).toFixed(2);
        const blobFee = +(Math.max(0.005, last.blobFee + (Math.random() * 0.4 - 0.2))).toFixed(3);

        const priceShift = (Math.random() * 20 - 10) - (gasSpike > 20 ? Math.random() * 35 : 0);
        const ethPrice = +(last.ethPrice + priceShift).toFixed(2);

        const dexVol = +(Math.max(200, last.dexVolume24h + (gasSpike * 5) + (Math.random() * 40 - 20))).toFixed(1);
        const volIndex = +(Math.min(100, Math.max(10, last.volatilityIndex + (gasSpike > 15 ? 12 : -3) + Math.random() * 4))).toFixed(1);
        const liquidations = +(gasSpike > 25 ? (gasSpike * 0.9) : Math.random() * 3).toFixed(2);
        const correlation = +(-0.5 + Math.random() * 1.1).toFixed(3);

        const nextPoint: GasPricePoint = {
          timestamp: nextTime,
          timeLabel,
          baseFee: newBaseFee,
          priorityFee: newPriorityFee,
          totalGas,
          blobFee,
          ethPrice,
          dexVolume24h: dexVol,
          volatilityIndex: volIndex,
          liquidationVolume: liquidations,
          correlationCoeff: correlation
        };

        const updated = [...prev.slice(1), nextPoint];

        // Trigger log if gas spikes
        if (totalGas > alarmThresholdGwei) {
          setLogMessages(curr => [
            `[ALERT ${timeLabel}] Gas spike detected: ${totalGas} Gwei! Correlated ETH Volatility: ${volIndex}%`,
            ...curr.slice(0, 18)
          ]);
        }

        return updated;
      });

      // Update stage stats
      setStages((stg) =>
        stg.map((s) => ({
          ...s,
          processedCount: s.processedCount + 1,
          latencyMs: Math.max(2, Math.round(s.latencyMs + (Math.random() * 4 - 2)))
        }))
      );
    }, 2800);

    return () => clearInterval(interval);
  }, [isStreaming, alarmThresholdGwei]);

  // Current stats calculation
  const latest = useMemo(() => dataPoints[dataPoints.length - 1] || {} as GasPricePoint, [dataPoints]);
  const avgGas24h = useMemo(() => {
    if (!dataPoints.length) return 0;
    const sum = dataPoints.reduce((acc, p) => acc + p.totalGas, 0);
    return +(sum / dataPoints.length).toFixed(1);
  }, [dataPoints]);

  const maxGas24h = useMemo(() => {
    if (!dataPoints.length) return 0;
    return Math.max(...dataPoints.map((p) => p.totalGas));
  }, [dataPoints]);

  const currentCorrelation = useMemo(() => {
    if (!dataPoints.length) return 0;
    return latest.correlationCoeff || 0.65;
  }, [dataPoints, latest]);

  // SVG Chart Dimensions & Helpers
  const svgWidth = 850;
  const svgHeight = 260;
  const padding = { top: 20, right: 55, bottom: 35, left: 55 };

  const minGas = useMemo(() => Math.max(0, Math.min(...dataPoints.map(p => p.totalGas)) * 0.8), [dataPoints]);
  const maxGas = useMemo(() => Math.max(...dataPoints.map(p => p.totalGas)) * 1.15, [dataPoints]);

  const targetMetricValues = useMemo(() => {
    return dataPoints.map(p => {
      if (selectedMetricFocus === 'price') return p.ethPrice;
      if (selectedMetricFocus === 'volume') return p.dexVolume24h;
      if (selectedMetricFocus === 'volatility') return p.volatilityIndex;
      return p.liquidationVolume;
    });
  }, [dataPoints, selectedMetricFocus]);

  const minMetric = useMemo(() => Math.min(...targetMetricValues) * 0.95, [targetMetricValues]);
  const maxMetric = useMemo(() => Math.max(...targetMetricValues) * 1.05, [targetMetricValues]);

  const getX = (index: number) => {
    const usableWidth = svgWidth - padding.left - padding.right;
    return padding.left + (index / (dataPoints.length - 1)) * usableWidth;
  };

  const getYGas = (val: number) => {
    const usableHeight = svgHeight - padding.top - padding.bottom;
    return svgHeight - padding.bottom - ((val - minGas) / (maxGas - minGas || 1)) * usableHeight;
  };

  const getYMetric = (val: number) => {
    const usableHeight = svgHeight - padding.top - padding.bottom;
    return svgHeight - padding.bottom - ((val - minMetric) / (maxMetric - minMetric || 1)) * usableHeight;
  };

  // Build SVG Path strings
  const gasLinePath = useMemo(() => {
    return dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYGas(p.totalGas)}`).join(' ');
  }, [dataPoints, minGas, maxGas]);

  const gasAreaPath = useMemo(() => {
    if (!dataPoints.length) return '';
    const firstX = getX(0);
    const lastX = getX(dataPoints.length - 1);
    const bottomY = svgHeight - padding.bottom;
    return `${gasLinePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [gasLinePath, dataPoints]);

  const metricLinePath = useMemo(() => {
    return targetMetricValues.map((val, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getYMetric(val)}`).join(' ');
  }, [targetMetricValues, minMetric, maxMetric]);

  const handleResetData = () => {
    setDataPoints(generateHistoricalData(24));
    setLogMessages(prev => [`[PIPELINE RESTART] Historical replay re-synchronized.`, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      {/* HEADER SECTION */}
      <header className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-600 p-0.5 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Fuel className="h-6 w-6 text-orange-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                PIPELINE #30
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <Radio className="h-2.5 w-2.5 animate-ping" /> LIVE STREAM
              </span>
              <span className="text-xs text-slate-400">EIP-1559 / EIP-4844</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Gas Price ↔ Market Performance Correlation Engine
            </h1>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chain Selector */}
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
            {(['ethereum', 'arbitrum', 'optimism', 'base'] as const).map((chain) => (
              <button
                key={chain}
                onClick={() => setSelectedChain(chain)}
                className={`px-3 py-1.5 rounded font-medium capitalize transition-all ${
                  selectedChain === chain
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {chain}
              </button>
            ))}
          </div>

          {/* Stream Play/Pause */}
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isStreaming
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {isStreaming ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isStreaming ? 'Pause Stream' : 'Resume Stream'}
          </button>

          {/* Reset / Reload */}
          <button
            onClick={handleResetData}
            title="Reset Data Simulation"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Card 1: Live Base Fee + Total Gas */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Gas Price</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-orange-400 font-mono tracking-tight">
                  {latest.totalGas} <span className="text-sm font-semibold text-slate-400 font-sans">Gwei</span>
                </span>
                <span className="text-xs text-slate-400 font-mono">({latest.baseFee} Base + {latest.priorityFee} Tip)</span>
              </div>
            </div>
            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span>24h Max: <strong className="text-slate-200">{maxGas24h} Gwei</strong></span>
            <span>Avg: <strong className="text-slate-200">{avgGas24h} Gwei</strong></span>
          </div>
        </div>

        {/* Card 2: Pearson Correlation Coefficient */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rolling Gas ↔ Volatility (r)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-3xl font-extrabold font-mono tracking-tight ${
                  currentCorrelation > 0.5 ? 'text-rose-400' : currentCorrelation < 0 ? 'text-cyan-400' : 'text-amber-400'
                }`}>
                  {currentCorrelation > 0 ? `+${currentCorrelation}` : currentCorrelation}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {currentCorrelation > 0.6 ? 'High Sync' : currentCorrelation < -0.3 ? 'Inverse Lead' : 'Decoupled'}
                </span>
              </div>
            </div>
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span>Spearman ρ: <strong className="text-slate-200">0.78</strong></span>
            <span>p-value: <strong className="text-emerald-400">&lt; 0.001</strong></span>
          </div>
        </div>

        {/* Card 3: ETH Spot Price */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">ETH Spot Market</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
                  ${latest.ethPrice?.toLocaleString()}
                </span>
                <span className="flex items-center text-xs font-semibold text-emerald-400">
                  <ArrowUpRight className="h-3 w-3" /> +2.34%
                </span>
              </div>
            </div>
            <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
              <LineChartIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span>DEX Vol 24h: <strong className="text-slate-200">${latest.dexVolume24h}M</strong></span>
            <span>Liq 1h: <strong className="text-rose-400">${latest.liquidationVolume}M</strong></span>
          </div>
        </div>

        {/* Card 4: EIP-4844 Blob Base Fee & Congestion */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 relative overflow-hidden backdrop-blur-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Blob Base Fee (L2 Rollups)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-indigo-400 font-mono tracking-tight">
                  {latest.blobFee} <span className="text-sm font-semibold text-slate-400 font-sans">Gwei</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Target: 3/6 blobs
                </span>
              </div>
            </div>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
            <span>L2 Batch Cost: <strong className="text-slate-200">$0.002/tx</strong></span>
            <span>Mev-Boost Tip: <strong className="text-slate-200">0.038 ETH</strong></span>
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 mb-6 gap-2">
        {[
          { id: 'analytics', label: 'Dual-Axis Correlation Studio', icon: BarChart3 },
          { id: 'leadlag', label: 'Lead-Lag Matrix & Beta', icon: Sparkles },
          { id: 'events', label: 'Gas Shock Event Study', icon: Zap },
          { id: 'pipeline', label: 'Pipeline DAG & Node Telemetry', icon: Workflow },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-400 bg-orange-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DUAL-AXIS CORRELATION STUDIO */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Main Visual Chart */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <LineChartIcon className="h-4 w-4 text-orange-400" />
                  Gas Fee Surge vs Market Dynamic Synchronicity
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Overlaid time-series displaying raw Gwei cost against secondary market indicator.
                </p>
              </div>

              {/* Metric Switcher */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Compare Gas Against:</span>
                <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
                  {[
                    { id: 'volatility', label: 'Volatility Index' },
                    { id: 'price', label: 'ETH Price ($)' },
                    { id: 'volume', label: 'DEX Volume ($M)' },
                    { id: 'liquidations', label: 'Liquidations ($M)' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMetricFocus(m.id as any)}
                      className={`px-2.5 py-1 rounded transition-all capitalize font-medium ${
                        selectedMetricFocus === m.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom SVG Dual-Axis Chart */}
            <div className="relative w-full overflow-hidden bg-slate-950/60 rounded-lg border border-slate-800/80 p-2" ref={chartRef}>
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto block select-none">
                <defs>
                  <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                  const y = padding.top + (svgHeight - padding.top - padding.bottom) * p;
                  return (
                    <g key={idx}>
                      <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.5" />
                    </g>
                  );
                })}

                {/* Gas Area Fill */}
                <path d={gasAreaPath} fill="url(#gasGradient)" />

                {/* Gas Line */}
                <path d={gasLinePath} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                {/* Market Metric Line */}
                <path d={metricLinePath} fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4 2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Data Points on Hover / Interactive markers */}
                {dataPoints.map((point, index) => {
                  const x = getX(index);
                  const yG = getYGas(point.totalGas);
                  const isHovered = hoveredPoint?.timestamp === point.timestamp;

                  return (
                    <g key={point.timestamp}>
                      <circle
                        cx={x}
                        cy={yG}
                        r={isHovered ? 6 : 3}
                        fill="#f97316"
                        stroke="#0f172a"
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-150"
                        onMouseEnter={() => setHoveredPoint(point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    </g>
                  );
                })}

                {/* Y-Axis Labels (Left: Gas Gwei) */}
                <text x={padding.left - 10} y={padding.top + 5} fill="#f97316" fontSize="10" textAnchor="end" fontWeight="bold">
                  {Math.round(maxGas)} Gwei
                </text>
                <text x={padding.left - 10} y={svgHeight - padding.bottom} fill="#f97316" fontSize="10" textAnchor="end">
                  {Math.round(minGas)} Gwei
                </text>

                {/* Y-Axis Labels (Right: Metric Focus) */}
                <text x={svgWidth - padding.right + 10} y={padding.top + 5} fill="#06b6d4" fontSize="10" textAnchor="start" fontWeight="bold">
                  {Math.round(maxMetric)} {selectedMetricFocus === 'price' ? '$' : ''}
                </text>
                <text x={svgWidth - padding.right + 10} y={svgHeight - padding.bottom} fill="#06b6d4" fontSize="10" textAnchor="start">
                  {Math.round(minMetric)} {selectedMetricFocus === 'price' ? '$' : ''}
                </text>

                {/* X-Axis Labels (Time) */}
                {dataPoints.filter((_, i) => i % 4 === 0).map((pt, i) => {
                  const rawIdx = dataPoints.findIndex(d => d.timestamp === pt.timestamp);
                  const x = getX(rawIdx);
                  return (
                    <text key={pt.timestamp} x={x} y={svgHeight - 10} fill="#64748b" fontSize="9" textAnchor="middle">
                      {pt.timeLabel}
                    </text>
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay */}
              {hoveredPoint && (
                <div
                  className="absolute bg-slate-900 border border-slate-700 shadow-2xl rounded-lg p-3 text-xs pointer-events-none z-10"
                  style={{
                    left: '50%',
                    top: '20px',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="flex items-center justify-between gap-4 font-semibold text-slate-200 border-b border-slate-800 pb-1.5 mb-1.5">
                    <span>Timestamp: {hoveredPoint.timeLabel}</span>
                    <span className="text-orange-400 font-mono">r = {hoveredPoint.correlationCoeff}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
                    <div>Total Gas: <strong className="text-orange-400">{hoveredPoint.totalGas} Gwei</strong></div>
                    <div>ETH Spot: <strong className="text-emerald-400">${hoveredPoint.ethPrice}</strong></div>
                    <div>Volatility: <strong className="text-cyan-400">{hoveredPoint.volatilityIndex}%</strong></div>
                    <div>DEX Vol: <strong className="text-indigo-400">${hoveredPoint.dexVolume24h}M</strong></div>
                    <div>Liquidations: <strong className="text-rose-400">${hoveredPoint.liquidationVolume}M</strong></div>
                    <div>Blob Fee: <strong className="text-slate-200">{hoveredPoint.blobFee} Gwei</strong></div>
                  </div>
                </div>
              )}
            </div>

            {/* Legend & Summary */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-orange-500 inline-block" />
                  <span className="text-slate-300 font-medium">Total Gas (Base + Priority Fee)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-cyan-400 inline-block border border-dashed border-cyan-300" />
                  <span className="text-slate-300 font-medium capitalize">
                    {selectedMetricFocus} Dynamic
                  </span>
                </div>
              </div>
              <div className="text-slate-400">
                Confidence Interval: <span className="text-slate-200 font-mono font-medium">99.4% (Fisher Z-transform)</span>
              </div>
            </div>
          </div>

          {/* Correlation Coefficients Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Empirical Correlation Matrix (Gas Metrics ↔ Market Metrics)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 px-3 font-semibold">Analyzed Feature Pair</th>
                    <th className="py-2.5 px-3 font-semibold">Pearson (r)</th>
                    <th className="py-2.5 px-3 font-semibold">Spearman (ρ)</th>
                    <th className="py-2.5 px-3 font-semibold">p-Value</th>
                    <th className="py-2.5 px-3 font-semibold">Lead / Lag Vector</th>
                    <th className="py-2.5 px-3 font-semibold">Relationship Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {INITIAL_METRICS.map((metric, i) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-medium text-slate-200">{metric.pair}</td>
                      <td className="py-3 px-3 font-mono font-bold text-orange-400">
                        {metric.pearsonR > 0 ? `+${metric.pearsonR.toFixed(3)}` : metric.pearsonR.toFixed(3)}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-300">{metric.spearmanRho.toFixed(3)}</td>
                      <td className="py-3 px-3 font-mono text-emerald-400">{metric.pValue}</td>
                      <td className="py-3 px-3 text-cyan-300 font-medium">{metric.leadLagOptimal}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            metric.relationshipType === 'Strong Positive'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : metric.relationshipType === 'Moderate Positive'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : metric.relationshipType === 'Negative'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {metric.relationshipType}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LEAD-LAG ANALYSIS & CROSS-CORRELATION */}
      {activeTab === 'leadlag' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Gauge className="h-4 w-4 text-cyan-400" />
              Cross-Correlation Function (Gas Leading / Lagging Price)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Measures normalized correlation $r(\tau)$ across time offsets from -60 min (Gas lags) to +60 min (Gas leads).
            </p>

            {/* Simulated CCF Bar Chart */}
            <div className="h-56 flex items-end justify-between gap-1 pt-6 px-4 bg-slate-950 rounded-lg border border-slate-800">
              {[
                { offset: '-60m', r: -0.05 },
                { offset: '-45m', r: 0.12 },
                { offset: '-30m', r: 0.28 },
                { offset: '-15m', r: 0.44 },
                { offset: '-5m', r: 0.62 },
                { offset: '0m', r: 0.78 },
                { offset: '+5m', r: 0.88 }, // Peak lead
                { offset: '+10m', r: 0.83 },
                { offset: '+15m', r: 0.69 },
                { offset: '+30m', r: 0.41 },
                { offset: '+45m', r: 0.19 },
                { offset: '+60m', r: -0.02 },
              ].map((bar, i) => {
                const heightPercent = Math.abs(bar.r) * 100;
                const isPeak = bar.r >= 0.85;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition absolute -top-8 bg-slate-800 text-[10px] text-slate-200 px-2 py-0.5 rounded border border-slate-700 pointer-events-none whitespace-nowrap">
                      Offset {bar.offset}: r = {bar.r}
                    </div>

                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[28px] rounded-t transition-all ${
                        isPeak
                          ? 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-md shadow-orange-500/50'
                          : bar.r > 0
                          ? 'bg-cyan-600/70 hover:bg-cyan-500'
                          : 'bg-rose-600/70 hover:bg-rose-500'
                      }`}
                    />
                    <span className="text-[10px] text-slate-500 mt-2 font-mono">{bar.offset}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 flex items-start gap-2">
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <strong>Alpha Finding:</strong> On average, sharp base fee spikes (&gt;35% over 5-min MA) precede peak DEX trading volume and directional volatility by <strong>5 to 8 minutes</strong>, primarily driven by MEV arbitrage searching and bot front-running.
              </div>
            </div>
          </div>

          {/* Model Parameters & Tuning */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-orange-400" />
                Pipeline Hyperparameters
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Rolling Window ($\Delta t$):</span>
                    <strong className="text-orange-400">{rollingWindowSize} Mins</strong>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="120"
                    step="5"
                    value={rollingWindowSize}
                    onChange={(e) => setRollingWindowSize(Number(e.target.value))}
                    className="w-full accent-orange-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Gas Spike Alert Threshold:</span>
                    <strong className="text-orange-400">{alarmThresholdGwei} Gwei</strong>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="250"
                    step="5"
                    value={alarmThresholdGwei}
                    onChange={(e) => setAlarmThresholdGwei(Number(e.target.value))}
                    className="w-full accent-orange-500 bg-slate-800 h-1.5 rounded cursor-pointer"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-2 text-slate-400">
                  <div className="flex justify-between">
                    <span>De-trending Filter:</span>
                    <span className="text-slate-200 font-mono">Hodrick-Prescott ($\lambda=1600$)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kernel Estimator:</span>
                    <span className="text-slate-200 font-mono">Gaussian Nadaraya-Watson</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Granger Causality (p-crit):</span>
                    <span className="text-emerald-400 font-mono">0.012 (Significant)</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setLogMessages(prev => [`[CALIBRATION] Recalibrated regression matrices at ${new Date().toLocaleTimeString()}`, ...prev])}
              className="w-full mt-4 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
            >
              Re-estimate Beta & Vector Autoregression
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: GAS SHOCK EVENT STUDY */}
      {activeTab === 'events' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                Historical Gas Shock & Impact Case Registry
              </h3>
              <p className="text-xs text-slate-400">
                Examining peak historical gas outliers and ensuing multi-timeframe market drawdown or rally.
              </p>
            </div>
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition">
              <Download className="h-3.5 w-3.5" /> Export Dataset (CSV)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_EVENTS.map((ev) => (
              <div key={ev.id} className="bg-slate-950/80 border border-slate-800 p-4 rounded-lg space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{ev.id}</span>
                    <h4 className="font-semibold text-sm text-slate-100 mt-1">{ev.eventName}</h4>
                    <span className="text-xs text-slate-500">{ev.timestamp}</span>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    {ev.driver}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-900 text-xs">
                  <div>
                    <p className="text-slate-500 text-[10px]">Peak Gas</p>
                    <p className="font-mono font-bold text-orange-400">{ev.gasPeakGwei} Gwei</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px]">1h Market Return</p>
                    <p className={`font-mono font-bold flex items-center ${ev.marketImpact1h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {ev.marketImpact1h >= 0 ? <ArrowUpRight className="h-3 w-3 inline" /> : <ArrowDownRight className="h-3 w-3 inline" />}
                      {ev.marketImpact1h}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px]">24h Market Return</p>
                    <p className={`font-mono font-bold flex items-center ${ev.marketImpact24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {ev.marketImpact24h >= 0 ? <ArrowUpRight className="h-3 w-3 inline" /> : <ArrowDownRight className="h-3 w-3 inline" />}
                      {ev.marketImpact24h}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PIPELINE DAG & TELEMETRY */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6">
          {/* DAG Pipeline Stages */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Workflow className="h-4 w-4 text-emerald-400" />
              Pipeline Execution Directed Acyclic Graph (DAG)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stages.map((stage, idx) => (
                <div key={stage.id} className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-slate-500">STAGE 0{idx + 1}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        stage.status === 'running'
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse'
                          : stage.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {stage.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-200">{stage.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{stage.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" /> {stage.latencyMs}ms
                    </span>
                    <span className="text-slate-300">
                      {stage.processedCount.toLocaleString()} pkts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Console / Event Log Feed */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-orange-400" />
                Pipeline Telemetry & Correlation Dispatch Logs
              </h3>
              <span className="text-xs text-slate-500 font-mono">Stream: /dev/gas_market_corr.pipe</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 h-44 overflow-y-auto space-y-1 select-text">
              {logMessages.map((msg, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-slate-600 select-none">&gt;</span>
                  <span className={msg.includes('ALERT') ? 'text-amber-400 font-semibold' : 'text-slate-300'}>
                    {msg}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>Pipeline30_GasPriceCorrelation running on Node v20.x TSX execution engine.</span>
        </div>
        <div className="font-mono">
          Last Checksum: <span className="text-slate-400">0x9a8f...3e1d</span>
        </div>
      </footer>
    </div>
  );
}