import React, { useState, useEffect, useRef, useMemo, FormEvent, ChangeEvent } from 'react';
// Removed: import axios from 'axios'; as it was only used by the insecure/flawed API Settings panel, which is now eliminated.

// --- Types & Interfaces (Reduced for Basic Desktop Functionality) ---

interface Commodity {
  id: string;
  name: string;
  symbol: string;
  basePrice: number;
  volatility: number;
  description: string;
  category: 'Metal' | 'Energy' | 'Agricultural' | 'Future' | 'Industrial';
  riskRating: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D';
  liquidityScore: number; // 0 to 100
  marketCapUSD: number;
  supplyChainMetrics: {
    origin: string;
    concentrationIndex: number; // 0 (low) to 1 (high)
    environmentalImpact: number; // 0 (low) to 10 (high)
  };
}

interface PricePoint {
  time: number;
  price: number;
  volume: number;
}

interface PortfolioItem {
  commodityId: string;
  quantity: number;
  averageBuyPrice: number;
  currentMarketValue: number;
  unrealizedPL: number;
  riskExposure: number; // Calculated VaR contribution
  marginRequirement: number;
}

interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'ALGO_BUY' | 'ALGO_SELL' | 'MARGIN_CALL';
  commodityId: string;
  price: number;
  quantity: number;
  timestamp: number;
  orderType: 'MARKET' | 'LIMIT' | 'STOP' | 'AI_OPTIMIZED';
  executionModel: 'MANUAL' | 'AI_CORE_V3';
}

interface MacroIndicator {
  name: string;
  symbol: string;
  value: number;
  trend: number; // Daily change percentage
  impactFactor: number; // How much it affects commodity prices (-1 to 1)
  correlationMatrix: { [key: string]: number }; // Correlation to specific commodities
}

interface AIModelPrediction {
  commodityId: string;
  predictionTime: number; // Time horizon in seconds (e.g., 3600 for 1hr)
  predictedPrice: number;
  confidenceScore: number; // 0 to 1
  justification: string; // AI generated text summary
  modelVersion: string;
}

interface AlgorithmicStrategy {
  strategyId: string;
  name: string;
  isActive: boolean;
  targetCommodityId: string;
  parameters: {
    riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH' | 'AGGRESSIVE';
    maxDrawdown: number; // Percentage
    entrySignal: string; // e.g., 'RSI_OVERSOLD_MACRO_POSITIVE'
    exitSignal: string;
    capitalAllocation: number; // Percentage of total cash
  };
  performanceMetrics: {
    winRate: number;
    totalTrades: number;
    alpha: number; // Excess return over benchmark
    sharpeRatio: number;
  };
  backtestHistory: { time: number, pnl: number }[];
}

interface AI_AssistantMessage {
  id: string;
  sender: 'USER' | 'AI_CORE';
  timestamp: number;
  content: string;
  relatedData?: {
    type: 'CHART' | 'PREDICTION' | 'RISK_ALERT' | 'STRATEGY_REPORT';
    dataId: string;
  };
}

interface KPI {
  name: string;
  value: number;
  unit: string;
  trend: number; // Percentage change vs previous period
  aiInsight: string;
}

// Removed the massive ApiKeysState interface and the corresponding RenderApiSettings component.
// Rationale: This represents a critical security and architectural flaw (Goal 1, 3, 4). 
// Storing 200+ unsecured API keys locally/simulating insecure transport is not production-ready.
// A production system must use AWS Secrets Manager/Vault integration within the backend service layer.

// --- Configuration (Minimized) ---

const EXPANDED_COMMODITIES: Commodity[] = [
  { id: '1', name: 'Gold Bullion', symbol: 'XAU', basePrice: 1950.00, volatility: 0.008, description: 'Standard Gold Bullion (1 oz)', category: 'Metal', riskRating: 'A+', liquidityScore: 95, marketCapUSD: 12000000000000, supplyChainMetrics: { origin: 'Global Vaults', concentrationIndex: 0.1, environmentalImpact: 3 } },
  { id: '2', name: 'Silver', symbol: 'XAG', basePrice: 24.50, volatility: 0.012, description: 'Silver Ingots (1 oz)', category: 'Metal', riskRating: 'A', liquidityScore: 88, marketCapUSD: 300000000000, supplyChainMetrics: { origin: 'Mexico/Peru', concentrationIndex: 0.2, environmentalImpact: 4 } },
  { id: '3', name: 'Lithium Carbonate', symbol: 'LITH', basePrice: 71000.00, volatility: 0.025, description: 'Battery grade Lithium', category: 'Energy', riskRating: 'B+', liquidityScore: 65, marketCapUSD: 90000000000, supplyChainMetrics: { origin: 'Chile/Australia', concentrationIndex: 0.4, environmentalImpact: 7 } },
  { id: '4', name: 'Water Rights (Global)', symbol: 'H2O', basePrice: 450.00, volatility: 0.005, description: 'Acre-foot water rights index', category: 'Future', riskRating: 'A-', liquidityScore: 50, marketCapUSD: 50000000000, supplyChainMetrics: { origin: 'Regional Indices', concentrationIndex: 0.05, environmentalImpact: 1 } },
  { id: '5', name: 'Crude Oil', symbol: 'WTI', basePrice: 78.00, volatility: 0.015, description: 'West Texas Intermediate', category: 'Energy', riskRating: 'B', liquidityScore: 98, marketCapUSD: 5000000000000, supplyChainMetrics: { origin: 'US/Middle East', concentrationIndex: 0.3, environmentalImpact: 9 } },
  { id: '6', name: 'Platinum', symbol: 'XPT', basePrice: 980.00, volatility: 0.010, description: 'Platinum bars', category: 'Metal', riskRating: 'B+', liquidityScore: 70, marketCapUSD: 30000000000, supplyChainMetrics: { origin: 'South Africa', concentrationIndex: 0.6, environmentalImpact: 5 } },
  { id: '7', name: 'Palladium', symbol: 'XPD', basePrice: 1400.00, volatility: 0.018, description: 'Industrial Palladium', category: 'Metal', riskRating: 'C+', liquidityScore: 60, marketCapUSD: 20000000000, supplyChainMetrics: { origin: 'Russia', concentrationIndex: 0.75, environmentalImpact: 6 } },
  { id: '8', name: 'Cobalt', symbol: 'COB', basePrice: 34000.00, volatility: 0.020, description: 'Refined Cobalt', category: 'Energy', riskRating: 'C', liquidityScore: 55, marketCapUSD: 15000000000, supplyChainMetrics: { origin: 'DRC', concentrationIndex: 0.9, environmentalImpact: 8 } },
  { id: '9', name: 'Rare Earth Basket', symbol: 'REE', basePrice: 12500.00, volatility: 0.015, description: 'Neodymium/Praseodymium mix', category: 'Metal', riskRating: 'B-', liquidityScore: 45, marketCapUSD: 10000000000, supplyChainMetrics: { origin: 'China', concentrationIndex: 0.95, environmentalImpact: 7 } },
  { id: '10', name: 'Carbon Credits', symbol: 'CO2', basePrice: 85.00, volatility: 0.030, description: 'EU Emissions Allowances', category: 'Future', riskRating: 'D', liquidityScore: 80, marketCapUSD: 100000000000, supplyChainMetrics: { origin: 'EU Exchanges', concentrationIndex: 0.1, environmentalImpact: 0 } },
  { id: '11', name: 'Natural Gas (LNG)', symbol: 'NGS', basePrice: 2.80, volatility: 0.040, description: 'Liquefied Natural Gas Future', category: 'Energy', riskRating: 'C+', liquidityScore: 90, marketCapUSD: 800000000000, supplyChainMetrics: { origin: 'US/Qatar', concentrationIndex: 0.25, environmentalImpact: 8 } },
  { id: '12', name: 'Copper Cathodes', symbol: 'COP', basePrice: 4.20, volatility: 0.018, description: 'High-grade industrial copper', category: 'Metal', riskRating: 'B', liquidityScore: 92, marketCapUSD: 400000000000, supplyChainMetrics: { origin: 'Chile/Indonesia', concentrationIndex: 0.35, environmentalImpact: 5 } },
  { id: '13', name: 'Soybean Meal', symbol: 'SBM', basePrice: 400.00, volatility: 0.022, description: 'Agricultural feed derivative', category: 'Agricultural', riskRating: 'B-', liquidityScore: 78, marketCapUSD: 150000000000, supplyChainMetrics: { origin: 'Brazil/US', concentrationIndex: 0.15, environmentalImpact: 3 } },
  { id: '14', name: 'Uranium Oxide', symbol: 'UOX', basePrice: 95.00, volatility: 0.050, description: 'Nuclear fuel component', category: 'Energy', riskRating: 'D', liquidityScore: 30, marketCapUSD: 5000000000, supplyChainMetrics: { origin: 'Kazakhstan/Canada', concentrationIndex: 0.7, environmentalImpact: 2 } },
  { id: '15', name: 'Industrial Hemp', symbol: 'HEMP', basePrice: 1200.00, volatility: 0.060, description: 'Textile and construction material', category: 'Agricultural', riskRating: 'D', liquidityScore: 20, marketCapUSD: 1000000000, supplyChainMetrics: { origin: 'Global Farms', concentrationIndex: 0.02, environmentalImpact: 1 } },
  { id: '16', name: 'Aluminum Ingot', symbol: 'ALU', basePrice: 2500.00, volatility: 0.011, description: 'Primary Aluminum', category: 'Metal', riskRating: 'A-', liquidityScore: 85, marketCapUSD: 250000000000, supplyChainMetrics: { origin: 'China/Russia', concentrationIndex: 0.45, environmentalImpact: 6 } },
  { id: '17', name: 'Renewable Energy Index', symbol: 'REI', basePrice: 150.00, volatility: 0.007, description: 'Index tracking global renewable energy output', category: 'Future', riskRating: 'A', liquidityScore: 60, marketCapUSD: 70000000000, supplyChainMetrics: { origin: 'Global Grid', concentrationIndex: 0.01, environmentalImpact: 0 } },
  { id: '18', name: 'Cocoa Beans', symbol: 'COA', basePrice: 9000.00, volatility: 0.080, description: 'West African Cocoa', category: 'Agricultural', riskRating: 'D', liquidityScore: 50, marketCapUSD: 5000000000, supplyChainMetrics: { origin: 'Ivory Coast/Ghana', concentrationIndex: 0.99, environmentalImpact: 4 } },
  { id: '19', name: 'Iron Ore Fines', symbol: 'IRO', basePrice: 110.00, volatility: 0.020, description: 'Steel production input', category: 'Metal', riskRating: 'B-', liquidityScore: 80, marketCapUSD: 100000000000, supplyChainMetrics: { origin: 'Brazil/Australia', concentrationIndex: 0.5, environmentalImpact: 5 } },
  { id: '20', name: 'Global Logistics Index', symbol: 'GLI', basePrice: 1000.00, volatility: 0.015, description: 'Index tracking global shipping and freight costs', category: 'Future', riskRating: 'B+', liquidityScore: 70, marketCapUSD: 60000000000, supplyChainMetrics: { origin: 'Shipping Lanes', concentrationIndex: 0.1, environmentalImpact: 3 } },
  { id: '21', name: 'Semiconductor Silicon', symbol: 'SCS', basePrice: 50000.00, volatility: 0.030, description: 'High-purity silicon wafers', category: 'Industrial', riskRating: 'C+', liquidityScore: 40, marketCapUSD: 20000000000, supplyChainMetrics: { origin: 'Taiwan/Korea', concentrationIndex: 0.8, environmentalImpact: 5 } },
  { id: '22', name: 'Industrial Rubber', symbol: 'RUB', basePrice: 1.50, volatility: 0.010, description: 'Synthetic and natural rubber index', category: 'Industrial', riskRating: 'A-', liquidityScore: 85, marketCapUSD: 100000000000, supplyChainMetrics: { origin: 'SE Asia', concentrationIndex: 0.6, environmentalImpact: 4 } },
  { id: '23', name: 'Rare Gas Mix', symbol: 'RGM', basePrice: 1500.00, volatility: 0.045, description: 'Neon, Xenon, Krypton blend', category: 'Industrial', riskRating: 'D', liquidityScore: 25, marketCapUSD: 500000000, supplyChainMetrics: { origin: 'Ukraine/Russia', concentrationIndex: 0.95, environmentalImpact: 1 } },
];

const COMMODITIES = EXPANDED_COMMODITIES;

const MACRO_INDICATORS_INITIAL: MacroIndicator[] = [
  { name: 'Global Inflation Rate', symbol: 'GIR', value: 3.5, trend: 0.1, impactFactor: 0.8, correlationMatrix: { 'XAU': 0.7, 'WTI': 0.5, 'CO2': 0.9 } },
  { name: 'Industrial Production Index', symbol: 'IPI', value: 105.2, trend: -0.5, impactFactor: 0.6, correlationMatrix: { 'COP': 0.8, 'ALU': 0.7, 'XAU': -0.3 } },
  { name: 'USD Strength Index', symbol: 'DXY', value: 104.1, trend: 0.2, impactFactor: -0.9, correlationMatrix: { 'XAU': -0.9, 'WTI': -0.6, 'LITH': -0.4 } },
  { name: 'Global Shipping Costs', symbol: 'GSC', value: 2500.0, trend: 1.5, impactFactor: 0.4, correlationMatrix: { 'GLI': 0.95, 'NGS': 0.3, 'COA': 0.2 } },
  { name: 'Climate Risk Index', symbol: 'CRI', value: 7.2, trend: 0.3, impactFactor: 0.7, correlationMatrix: { 'H2O': 0.8, 'SBM': 0.6, 'CO2': 0.5 } },
];

const AI_CONFIG = {
  PREDICTION_HORIZONS: [3600, 86400, 604800], // 1hr, 24hr, 7 days in seconds
  RISK_THRESHOLD_VaR: 0.02, // 2% VaR (Value at Risk)
  MAX_LEVERAGE: 5,
};

const INITIAL_CASH = 100000000;
const HISTORY_LENGTH = 500;
const TICK_RATE_MS = 500;
const MAX_TRANSACTIONS = 500;

// --- Utility Functions (Fixed and Stabilized Simulation Logic) ---

// Actual VaR Calculation (Complex Future Projection)
const calculateVaR = (history: PricePoint[], confidenceLevel: number = 0.99): number => {
  if (history.length < 2) return 0;
  const returns = history.slice(1).map((p, i) => (p.price - history[i].price) / history[i].price);
  returns.sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * returns.length);
  return Math.abs(returns[index] || 0); // Returns the worst expected loss percentage
};

// Standardized AI Prediction Model (Replacing Flawed/Chaos Simulation)
// This model uses statistical factors and macro trends to generate a predictable, synthetic forecast.
const generateAIPrediction = (commodity: Commodity, history: PricePoint[], macro: MacroIndicator[]): AIModelPrediction => {
  const lastPrice = history[history.length - 1]?.price || commodity.basePrice;
  
  // 1. Base Volatility Factor (Reduced randomization for stability)
  let priceChangeFactor = (Math.random() - 0.5) * commodity.volatility * 2; 

  // 2. Macro Influence (Directly integrated stable macro trends)
  macro.forEach(m => {
    const correlation = m.correlationMatrix[commodity.symbol] || 0;
    // Use trend value normalized by 100 for a realistic influence magnitude
    priceChangeFactor += (m.trend / 100) * correlation * m.impactFactor; 
  });

  // 3. Simple Momentum Check (Weighted average of last 5 points)
  const momentum = (lastPrice - history[history.length - 5]?.price || lastPrice) / lastPrice;
  priceChangeFactor += momentum * 0.2; 

  // 4. Prediction Generation
  const predictedPrice = lastPrice * (1 + priceChangeFactor);
  
  // 5. Confidence Score (Higher confidence for high liquidity/low volatility assets)
  // Ensure score calculation is reliable and capped
  const confidenceScore = Math.min(0.95, Math.max(0.65, 1 - (commodity.volatility * 5) + (commodity.liquidityScore / 500))); 

  // Generate justification based on the calculated factor
  let justification = 'Market equilibrium maintained; minor movements expected around current price.';
  if (priceChangeFactor > 0.005) {
    justification = `Strong bullish signal (${(priceChangeFactor * 100).toFixed(2)}% projected movement) driven primarily by positive macro correlation.`;
  } else if (priceChangeFactor < -0.005) {
    justification = `Potential short-term reversal (${(priceChangeFactor * 100).toFixed(2)}% projected movement). Risk increase due to concentration index.`;
  }
  
  return {
    commodityId: commodity.id,
    predictionTime: 86400, 
    predictedPrice: predictedPrice,
    confidenceScore: confidenceScore,
    justification: justification,
    modelVersion: 'AI_CORE_V3.2.0-STABLE'
  };
};

// --- Helper Components: Basic Market Visualization (Canvas based) ---

const AdvancedMarketVisualization = React.memo(({ data, predictions, color, height = 400, width = 800 }: { data: PricePoint[]; predictions: AIModelPrediction[]; color: string; height?: number; width?: number }) => {
  if (data.length < 2) return <div style={{ height, width }} className="flex items-center justify-center text-gray-500">Awaiting sufficient data feed...</div>;

  const prices = data.map(d => d.price);
  const volumes = data.map(d => d.volume);

  const maxVal = Math.max(...prices);
  const minVal = Math.min(...prices);
  const maxVolume = Math.max(...volumes);
  const range = maxVal - minVal;
  const padding = range * 0.1;
  const effectiveRange = range + padding * 2;

  const normalizeY = (price: number) => 100 - (((price - minVal + padding) / effectiveRange) * 100);
  const normalizeX = (i: number) => (i / (data.length - 1)) * 100;

  // 1. Price Line Points
  const pricePoints = data.map((d, i) => `${normalizeX(i)},${normalizeY(d.price)}`).join(' ');

  // 2. Area Path
  const areaPath = `M0,100 L0,${normalizeY(data[0].price)} ${pricePoints.replace(/,/g, ' ').split(' ').map((coord, i) => (i % 2 === 0 ? 'L' + coord : coord)).join(' ')} L100,100 Z`;

  // 3. Volume Bars (rendered above the price chart)
  const volumeHeight = 20; // 20% of total height dedicated to volume
  const chartHeight = 80; // 80% dedicated to price
  const volumeScale = (v: number) => (v / maxVolume) * volumeHeight;

  const volumeBars = data.map((d, i) => {
    const x = normalizeX(i);
    const barWidth = 100 / data.length;
    const barHeight = volumeScale(d.volume);
    const y = 100 - barHeight;
    return (
      <rect
        key={`vol-${i}`}
        x={x - barWidth / 2}
        y={y}
        width={barWidth * 0.8}
        height={barHeight}
        fill="#334155"
        opacity="0.6"
      />
    );
  });

  // 4. Prediction Line
  const latestIndex = data.length - 1;
  const latestX = normalizeX(latestIndex);
  const latestY = normalizeY(data[latestIndex].price);

  const predictionLines = predictions.map((p, index) => {
    // Simulate projection point slightly past the current data end (10% further)
    const predX = 100 + (index * 5); 
    const predY = normalizeY(p.predictedPrice);
    const predColor = p.predictedPrice >= data[latestIndex].price ? '#3b82f6' : '#f97316'; // Blue for AI prediction

    return (
      <g key={`pred-${index}`}>
        {/* Dashed line connecting current price to prediction */}
        <line
          x1={latestX}
          y1={latestY}
          x2={predX}
          y2={predY}
          stroke={predColor}
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        {/* Prediction marker */}
        <circle cx={predX} cy={predY} r="1.5" fill={predColor} />
        {/* Doubt Label */}
        <text x={predX + 2} y={predY} fontSize="3" fill={predColor}>
          {(p.confidenceScore * 100).toFixed(0)}%
        </text>
      </g>
    );
  });


  return (
    <div style={{ position: 'relative', width: '100%', height: `${height}px`, overflow: 'hidden' }}>
      <svg viewBox="0 0 110 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Volume Bars Background */}
        <rect x="0" y="80" width="100" height="20" fill="#1e293b" />

        {/* Volume Bars */}
        {volumeBars}

        {/* Price Area Fill */}
        <path
          d={areaPath}
          fill={`url(#grad-${color})`}
          stroke="none"
        />
        
        {/* Price Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="0.5"
          points={pricePoints}
          vectorEffect="non-scaling-stroke"
        />

        {/* AI Predictions */}
        {predictionLines}

        {/* Vertical Grid Lines (Complex) */}
        <line x1="0" y1={normalizeY(maxVal)} x2="100" y2={normalizeY(maxVal)} stroke="#334155" strokeWidth="0.1" />
        <line x1="0" y1={normalizeY(minVal)} x2="100" y2={normalizeY(minVal)} stroke="#334155" strokeWidth="0.1" />
        <line x1="0" y1="80" x2="100" y2="80" stroke="#475569" strokeWidth="0.2" /> {/* Price Joiner */}

      </svg>
      {/* Price Labels */}
      <div style={{ position: 'absolute', right: 5, top: 5, fontSize: '10px', color: '#888' }}>{maxVal.toFixed(2)}</div>
      <div style={{ position: 'absolute', right: 5, bottom: 25, fontSize: '10px', color: '#888' }}>{minVal.toFixed(2)}</div>
    </div>
  );
});


// --- Main Component: Barter System Terminal ---

export default function CommoditiesExchange() {
  // --- Fixed Values ---
  const [prices, setPrices] = useState<{ [key: string]: PricePoint[] }>({});
  const [currentPrices, setCurrentPrices] = useState<{ [key: string]: number }>({});
  const [selectedId, setSelectedId] = useState<string>(COMMODITIES[0].id);
  const [cash, setCash] = useState<number>(INITIAL_CASH);
  const [portfolio, setPortfolio] = useState<{ [key: string]: PortfolioItem }>({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Trading Desk State
  const [orderAmount, setOrderAmount] = useState<string>('');
  const [isBuy, setIsBuy] = useState<boolean>(true);
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [limitPrice, setLimitPrice] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  // AI & Macro State
  const [macroData, setMacroData] = useState<MacroIndicator[]>(MACRO_INDICATORS_INITIAL);
  const [aiPredictions, setAiPredictions] = useState<{ [key: string]: AIModelPrediction[] }>({});
  const [strategies, setStrategies] = useState<AlgorithmicStrategy[]>(() => [
    { strategyId: 'S1', name: 'Momentum Scalper', isActive: false, targetCommodityId: '5', parameters: { riskTolerance: 'MEDIUM', maxDrawdown: 0.05, entrySignal: 'RSI_CROSS_20', exitSignal: 'PROFIT_TARGET_0.5%', capitalAllocation: 0.1 }, performanceMetrics: { winRate: 0.65, totalTrades: 120, alpha: 0.03, sharpeRatio: 1.2 }, backtestHistory: [] },
    { strategyId: 'S2', name: 'Inflation Hedge AI', isActive: true, targetCommodityId: '1', parameters: { riskTolerance: 'LOW', maxDrawdown: 0.02, entrySignal: 'GIR_ABOVE_4%', exitSignal: 'DXY_BELOW_100', capitalAllocation: 0.2 }, performanceMetrics: { winRate: 0.80, totalTrades: 50, alpha: 0.01, sharpeRatio: 1.5 }, backtestHistory: [] },
  ]);
  const [aiChatHistory, setAiChatHistory] = useState<AI_AssistantMessage[]>([
    { id: '0', sender: 'AI_CORE', timestamp: Date.now(), content: "Welcome to the Balcony of Prosperity OS. I am AI Core V3. How may I assist your capital deployment strategy today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [systemStatus, setSystemStatus] = useState<'OPTIMAL' | 'ALERT' | 'CRITICAL'>('OPTIMAL');
  // Removed 'API_SETTINGS' view
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'TRADING' | 'AI_STRATEGIES' | 'RISK_MGMT'>('DASHBOARD'); 

  const chatRef = useRef<HTMLDivElement>(null);

  // --- Stable Initialization and Ticking Effects ---

  // 1. Initialize Price History and Stable AI Predictions
  useEffect(() => {
    const initialHistory: { [key: string]: PricePoint[] } = {};
    const initialCurrent: { [key: string]: number } = {};
    const initialPredictions: { [key: string]: AIModelPrediction[] } = {};

    COMMODITIES.forEach(c => {
      let price = c.basePrice;
      const history: PricePoint[] = [];
      const now = Date.now();
      
      for (let i = HISTORY_LENGTH; i > 0; i--) {
        const change = (Math.random() - 0.5) * c.volatility * price;
        price += change;
        const volume = Math.max(100, Math.floor(Math.random() * 5000 * c.liquidityScore / 100));
        history.push({ time: now - (i * TICK_RATE_MS), price, volume });
      }
      initialHistory[c.id] = history;
      initialCurrent[c.id] = price;
      
      initialPredictions[c.id] = [generateAIPrediction(c, history, MACRO_INDICATORS_INITIAL)];
    });

    setPrices(initialHistory);
    setCurrentPrices(initialCurrent);
    setAiPredictions(initialPredictions);
  }, []);

  // 2. Stable Market Simulation Clock
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      
      // Update Macro Data (Slow, predictable drift)
      setMacroData(prevMacro => prevMacro.map(m => {
        const newTrend = m.trend + (Math.random() - 0.5) * 0.005; 
        const newValue = m.value * (1 + newTrend / 10000); 
        return { ...m, trend: newTrend, value: newValue };
      }));

      setPrices(prevHistory => {
        const newHistory = { ...prevHistory };
        const newCurrent: { [key: string]: number } = {};
        
        COMMODITIES.forEach(c => {
          const currentHistory = prevHistory[c.id] || [];
          const lastPrice = currentHistory[currentHistory.length - 1]?.price || c.basePrice;
          
          // Stable Price Model: Controlled Random Walk + Volatility + Macro Influence
          const sentiment = Math.random() > 0.5 ? 1 : -1;
          const magnitude = Math.random() * c.volatility * 0.5;
          
          // Apply macro influence based on current stable macroData state
          const macroInfluence = macroData.reduce((acc, m) => {
            const correlation = m.correlationMatrix[c.symbol] || 0;
            return acc + (m.trend / 1000) * correlation * m.impactFactor; 
          }, 0);

          const delta = lastPrice * (magnitude * sentiment + macroInfluence);
          let newPrice = lastPrice + delta;
          if (newPrice < 0.01) newPrice = 0.01;

          const newVolume = Math.max(100, (currentHistory[currentHistory.length - 1]?.volume || 1000) * (1 + (Math.random() - 0.5) * 0.05));

          newCurrent[c.id] = newPrice;
          
          const newPoints = [...currentHistory, { time: now, price: newPrice, volume: newVolume }];
          if (newPoints.length > HISTORY_LENGTH) newPoints.shift();
          newHistory[c.id] = newPoints;
        });
        
        setCurrentPrices(newCurrent);
        return newHistory;
      });
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, [macroData]); 

  // 3. Automated Trading and Risk Monitoring Engine (Stabilized)
  useEffect(() => {
    const aiInterval = setInterval(() => {
      const newPredictions: { [key: string]: AIModelPrediction[] } = {};
      let riskAlert = false;

      // A. Generate Standardized Predictions
      COMMODITIES.forEach(c => {
        const history = prices[c.id] || [];
        newPredictions[c.id] = [generateAIPrediction(c, history, macroData)];
      });
      setAiPredictions(newPredictions);

      // B. Execute Algorithmic Strategies
      setStrategies(prevStrategies => prevStrategies.map(strategy => {
        if (!strategy.isActive) return strategy;

        const commodity = COMMODITIES.find(c => c.id === strategy.targetCommodityId);
        const currentPrice = currentPrices[strategy.targetCommodityId];
        const history = prices[strategy.targetCommodityId];
        
        if (!commodity || !currentPrice || !history || history.length < 50) return strategy;

        const prediction = newPredictions[strategy.targetCommodityId]?.[0];
        // Use a high confidence threshold for execution
        const isBullishSignal = prediction && prediction.predictedPrice > currentPrice * 1.005 && prediction.confidenceScore > 0.8; 
        const isBearishSignal = prediction && prediction.predictedPrice < currentPrice * 0.995 && prediction.confidenceScore > 0.8; 

        const currentPosition = portfolio[strategy.targetCommodityId];
        const capital = cash * strategy.parameters.capitalAllocation;
        const maxQty = Math.floor(capital / currentPrice);

        // Entry Logic: Strong Bullish signal AND no current position
        if (isBullishSignal && maxQty > 0 && !currentPosition) {
          const qty = Math.floor(maxQty * 0.75); // Buy 75% of allocated capital
          executeTrade(strategy.targetCommodityId, qty, true, 'AI_CORE_V3');
          recordTransaction('ALGO_BUY', strategy.targetCommodityId, currentPrice, qty, 'AI_CORE_V3', 'AI_OPTIMIZED');
          
          // Stabilize Alpha/Metric updates (slow, positive drift upon successful execution)
          strategy.performanceMetrics.totalTrades += 1;
          const newAlpha = strategy.performanceMetrics.alpha + 0.0005; 
          strategy.performanceMetrics.alpha = Math.max(-0.01, newAlpha);

          showNotification(`[AI Strategy ${strategy.strategyId}] Executed BUY order for ${commodity.symbol}`);
        }

        // Exit Logic: Current position exists AND (Bearish signal OR max drawdown hit)
        if (currentPosition) {
          const currentPL = (currentPrice - currentPosition.averageBuyPrice) / currentPosition.averageBuyPrice;
          const drawdownHit = currentPL < -strategy.parameters.maxDrawdown;

          if (isBearishSignal || drawdownHit) {
            executeTrade(strategy.targetCommodityId, currentPosition.quantity, false, 'AI_CORE_V3');
            recordTransaction('ALGO_SELL', strategy.targetCommodityId, currentPrice, currentPosition.quantity, 'AI_CORE_V3', 'AI_OPTIMIZED');
            showNotification(`[AI Strategy ${strategy.strategyId}] Executed SELL order for ${commodity.symbol}. Reason: ${drawdownHit ? 'Drawdown Limit' : 'Bearish Forecast'}`);
          }
        }

        return strategy;
      }));

      // C. Continuous Risk Monitoring Check
      const currentNetWorth = cash + Object.values(portfolio).reduce((sum, item) => sum + item.quantity * (currentPrices[item.commodityId] || 0), 0);
      const totalVaR = calculatePortfolioVaR(currentPrices, portfolio, prices);
      
      if (totalVaR > AI_CONFIG.RISK_THRESHOLD_VaR * currentNetWorth) {
        setSystemStatus('ALERT');
        riskAlert = true;
      } else {
        setSystemStatus('OPTIMAL');
      }

      // D. AI Chat Alert Generation (Only on risk events)
      if (riskAlert && Math.random() < 0.2) { 
        handleAIChatSubmit(`RISK ALERT: Portfolio VaR exceeded ${AI_CONFIG.RISK_THRESHOLD_VaR * 100}% threshold. Current VaR exposure: $${(totalVaR).toFixed(2)}. Mitigation steps initiated.`, 'AI_CORE');
      }

    }, 5000); 

    return () => clearInterval(aiInterval);
  }, [prices, currentPrices, macroData, portfolio, cash]);


  // --- Peripheral Utility Functions (Stabilized) ---

  const executeTrade = (commodityId: string, qty: number, isBuyAction: boolean, executionModel: 'MANUAL' | 'AI_CORE_V3') => {
    const price = currentPrices[commodityId];
    const totalCost = price * qty;
    const commodity = COMMODITIES.find(c => c.id === commodityId);

    if (isBuyAction) {
      if (cash >= totalCost) {
        setCash(prev => prev - totalCost);
        setPortfolio(prev => {
          const currentItem = prev[commodityId] || { commodityId, quantity: 0, averageBuyPrice: 0, currentMarketValue: 0, unrealizedPL: 0, riskExposure: 0, marginRequirement: 0 };
          const newQty = currentItem.quantity + qty;
          const newAvgPrice = ((currentItem.quantity * currentItem.averageBuyPrice) + (qty * price)) / newQty;
          
          return {
            ...prev,
            [commodityId]: { ...currentItem, quantity: newQty, averageBuyPrice: newAvgPrice }
          };
        });
        // Transaction logging happens in recordTransaction below, or manually here for consistency if recordTransaction is skipped (but here we call recordTransaction separately in algo/manual flows)
        if (executionModel === 'MANUAL') showNotification(`Bought ${qty.toFixed(2)} ${commodity?.symbol}`);
      } else if (executionModel === 'MANUAL') {
        showNotification("Insufficient Funds for Manual Trade");
      }
    } else {
      // Sell
      const currentItem = portfolio[commodityId];
      if (currentItem && currentItem.quantity >= qty) {
        setCash(prev => prev + totalCost);
        setPortfolio(prev => {
          const newQty = currentItem.quantity - qty;
          if (newQty <= 0) {
            const { [commodityId]: removed, ...rest } = prev;
            return rest;
          }
          return {
            ...prev,
            [commodityId]: { ...currentItem, quantity: newQty }
          };
        });
        if (executionModel === 'MANUAL') showNotification(`Sold ${qty.toFixed(2)} ${commodity?.symbol}`);
      } else if (executionModel === 'MANUAL') {
        showNotification("Insufficient Quantity to Sell");
      }
    }
  };

  const handleTrade = () => {
    const qty = parseFloat(orderAmount);
    if (isNaN(qty) || qty <= 0) {
      showNotification("Invalid Quantity");
      return;
    }

    if (orderType === 'MARKET') {
      executeTrade(selectedId, qty, isBuy, 'MANUAL');
      recordTransaction(isBuy ? 'BUY' : 'SELL', selectedId, currentPrices[selectedId], qty, 'MANUAL', 'MARKET');
    } else {
      // Complex Market/Manual order reality (delayed execution if conditions fail)
      const price = currentPrices[selectedId];
      const limit = parseFloat(limitPrice);

      if (isNaN(limit) || limit <= 0) {
        showNotification("Invalid Limit/Stop Price");
        return;
      }

      let executed = false;
      const txType = isBuy ? 'BUY' : 'SELL';

      // Simulation: Only execute if condition is met immediately
      if (orderType === 'LIMIT') {
        if (isBuy && price <= limit) {
          executeTrade(selectedId, qty, true, 'MANUAL');
          recordTransaction(txType, selectedId, price, qty, 'MANUAL', 'LIMIT');
          executed = true;
        } else if (!isBuy && price >= limit) {
          executeTrade(selectedId, qty, false, 'MANUAL');
          recordTransaction(txType, selectedId, price, qty, 'MANUAL', 'LIMIT');
          executed = true;
        }
      } else if (orderType === 'STOP') {
        if (isBuy && price >= limit) {
          executeTrade(selectedId, qty, true, 'MANUAL');
          recordTransaction(txType, selectedId, price, qty, 'MANUAL', 'STOP');
          executed = true;
        } else if (!isBuy && price <= limit) {
          executeTrade(selectedId, qty, false, 'MANUAL');
          recordTransaction(txType, selectedId, price, qty, 'MANUAL', 'STOP');
          executed = true;
        }
      }

      if (executed) {
        showNotification(`${orderType} Order Executed!`);
      } else {
        // In a real system, this would queue the order. Here, we just notify.
        showNotification(`${orderType} Order Placed (Simulated: Not yet triggered)`);
      }
    }
  };

  const recordTransaction = (type: Transaction['type'], commodityId: string, price: number, quantity: number, executionModel: Transaction['executionModel'], orderType: Transaction['orderType'] = 'MARKET') => {
    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      commodityId,
      price,
      quantity,
      timestamp: Date.now(),
      orderType,
      executionModel
    };
    setTransactions(prev => [tx, ...prev].slice(0, MAX_TRANSACTIONS));
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAIChatSubmit = (message: string, sender: 'USER' | 'AI_CORE' = 'USER') => {
    const userMessage: AI_AssistantMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: sender,
      timestamp: Date.now(),
      content: message,
    };

    setAiChatHistory(prev => [...prev, userMessage]);
    setChatInput('');

    if (sender === 'USER') {
      // Simulate AI response based on keywords
      setTimeout(() => {
        let response = "Query received. Processing complex financial data through AI Core V3...";
        
        if (message.toLowerCase().includes('risk') || message.toLowerCase().includes('var')) {
          const totalVaR = calculatePortfolioVaR(currentPrices, portfolio, prices);
          response = `Current Portfolio VaR (99% confidence) is ${totalVaR.toFixed(4)}% of total net worth. System status is ${systemStatus}.`;
        } else if (message.toLowerCase().includes('prediction') || message.toLowerCase().includes('forecast')) {
          const pred = aiPredictions[selectedId]?.[0];
          if (pred) {
            response = `The 24hr forecast for ${selectedCommodity.symbol} is $${pred.predictedPrice.toFixed(2)} with a confidence score of ${(pred.confidenceScore * 100).toFixed(1)}%. Justification: ${pred.justification}`;
          } else {
            response = "No immediate prediction available for the selected commodity.";
          }
        } else if (message.toLowerCase().includes('strategy')) {
          const activeCount = strategies.filter(s => s.isActive).length;
          response = `There are ${strategies.length} algorithmic strategies configured, with ${activeCount} currently active. Total Alpha generated: ${totalStrategyAlpha.toFixed(4)}.`;
        } else if (message.toLowerCase().includes('net worth')) {
          response = `Your current Net Worth is $${totalNetWorth.toLocaleString()}. Cash balance: $${cash.toLocaleString()}.`;
        } else if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
          response = "Greetings. Ready for optimization.";
        }

        const aiResponse: AI_AssistantMessage = {
          id: Math.random().toString(36).substr(2, 9),
          sender: 'AI_CORE',
          timestamp: Date.now() + 100,
          content: response,
        };
        setAiChatHistory(prev => [...prev, aiResponse]);
      }, 1500);
    }
  };

  // Scroll chat to top
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [aiChatHistory]);

  // --- Input Data ---

  const selectedCommodity = useMemo(() => COMMODITIES.find(c => c.id === selectedId) || COMMODITIES[0], [selectedId]);
  const selectedHistory = useMemo(() => prices[selectedId] || [], [prices, selectedId]);
  const selectedPrice = currentPrices[selectedId] || selectedCommodity.basePrice;
  const selectedPredictions = aiPredictions[selectedId] || [];

  const previousPrice = selectedHistory.length > 1 ? selectedHistory[selectedHistory.length - 2].price : selectedPrice;
  const isUp = selectedPrice >= previousPrice;
  const percentChange = ((selectedPrice - previousPrice) / previousPrice) * 100;

  const calculatePortfolioVaR = (currentPrices: { [key: string]: number }, portfolio: { [key: string]: PortfolioItem }, prices: { [key: string]: PricePoint[] }): number => {
    let totalExposure = 0;
    let weightedVaR = 0;
    
    Object.values(portfolio).forEach(item => {
      const currentPrice = currentPrices[item.commodityId] || 0;
      const value = item.quantity * currentPrice;
      totalExposure += value;
      
      const history = prices[item.commodityId] || [];
      const varLoss = calculateVaR(history, 0.99); // 99% VaR
      
      weightedVaR += value * varLoss;
    });

    if (totalExposure === 0) return 0;
    return (weightedVaR / totalExposure) * 100; // Return VaR as a percentage of portfolio value
  };

  const { totalPortfolioValue, totalNetWorth, portfolioVaR, totalStrategyAlpha } = useMemo(() => {
    let totalValue = 0;
    let totalAlpha = 0;

    const updatedPortfolio = Object.entries(portfolio).reduce((acc, [id, item]) => {
      const currentPrice = currentPrices[id] || item.averageBuyPrice;
      const value = item.quantity * currentPrice;
      const unrealizedPL = value - (item.quantity * item.averageBuyPrice);
      
      totalValue += value;
      
      acc[id] = {
        ...item,
        currentMarketValue: value,
        unrealizedPL: unrealizedPL,
        riskExposure: calculateVaR(prices[id] || [], 0.99) * value, // Individual VaR contribution
        marginRequirement: value * 0.2 // Simplified 20% margin
      };
      return acc;
    }, {} as { [key: string]: PortfolioItem });

    const netWorth = cash + totalValue;
    const varPct = calculatePortfolioVaR(currentPrices, updatedPortfolio, prices);

    strategies.forEach(s => {
      if (s.isActive) totalAlpha += s.performanceMetrics.alpha;
    });

    return {
      totalPortfolioValue: totalValue,
      totalNetWorth: netWorth,
      portfolioVaR: varPct,
      totalStrategyAlpha: totalAlpha
    };
  }, [cash, currentPrices, portfolio, prices, strategies]);

  const kpis: KPI[] = useMemo(() => [
    { name: 'Portfolio VaR (99%)', value: portfolioVaR, unit: '%', trend: (portfolioVaR - AI_CONFIG.RISK_THRESHOLD_VaR * 100) * 10, aiInsight: portfolioVaR > AI_CONFIG.RISK_THRESHOLD_VaR * 100 ? 'CRITICAL: Immediate mitigation required.' : 'Stable. Within acceptable parameters.' },
    { name: 'Total Alpha (Active Strategies)', value: totalStrategyAlpha * 100, unit: 'bps', trend: totalStrategyAlpha * 1000, aiInsight: totalStrategyAlpha > 0.01 ? 'Strong performance driven by strategies.' : 'Underperforming benchmark. Review required.' },
    { name: 'Cash Liquidity Ratio', value: (cash / totalNetWorth) * 100, unit: '%', trend: (cash / totalNetWorth) * 100, aiInsight: cash / totalNetWorth < 0.1 ? 'Low liquidity. Potential margin risk.' : 'Healthy liquidity buffer maintained.' },
    { name: 'Market Volatility Index (Avg)', value: COMMODITIES.reduce((a, c) => a + c.volatility, 0) / COMMODITIES.length * 100, unit: '%', trend: (Math.random() - 0.5) * 2, aiInsight: 'Overall market volatility remains moderate.' },
  ], [portfolioVaR, totalNetWorth, cash, totalStrategyAlpha]);


  // --- UI Rendering Functions (Simple Main-Components) ---

  const styles = {
    container: {
      backgroundColor: '#0f172a', // Slate 900
      color: '#e2e8f0', // Slate 200
      fontFamily: 'Inter, system-ui, sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      backgroundColor: '#1e293b', // Slate 800
      padding: '1rem 2rem',
      borderBottom: '1px solid #334155',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 10
    },
    main: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '300px 1fr 350px',
      gap: '1px',
      backgroundColor: '#334155'
    },
    panel: {
      backgroundColor: '#0f172a',
      padding: '1.5rem',
      overflowY: 'auto' as const,
      maxHeight: 'calc(100vh - 80px)'
    },
    card: {
      backgroundColor: '#1e293b',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
      transition: 'background-color 0.2s',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    },
    cardInteractive: {
      cursor: 'pointer',
      '&:hover': { backgroundColor: '#2d3748' }
    },
    cardSelected: {
      backgroundColor: '#334155',
      borderLeft: '4px solid #3b82f6'
    },
    priceUp: { color: '#10b981' },
    priceDown: { color: '#ef4444' },
    button: {
      padding: '0.75rem',
      borderRadius: '6px',
      border: 'none',
      fontWeight: 'bold' as const,
      cursor: 'pointer',
      color: '#fff',
      transition: 'background-color 0.2s'
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '6px',
      backgroundColor: '#0f172a',
      border: '1px solid #334155',
      color: '#fff',
      marginTop: '0.5rem',
      marginBottom: '0.5rem'
    },
    label: {
      fontSize: '0.85rem',
      color: '#94a3b8',
      display: 'block',
      marginBottom: '0.25rem'
    },
    tag: {
      fontSize: '0.7rem',
      padding: '0.2rem 0.5rem',
      borderRadius: '4px',
      backgroundColor: '#334155',
      marginRight: '0.5rem'
    },
    tabButton: (active: boolean) => ({
      padding: '0.5rem 1rem',
      backgroundColor: active ? '#3b82f6' : '#1e293b',
      color: active ? '#fff' : '#94a3b8',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontWeight: 'bold' as const,
      transition: 'background-color 0.2s'
    })
  };

  const RenderMarketWatch = () => (
    <div style={styles.panel}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#94a3b8', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Market Watch ({COMMODITIES.length} Assets)</h3>
      {COMMODITIES.map(c => {
        const price = currentPrices[c.id] || c.basePrice;
        const history = prices[c.id] || [];
        const prev = history.length > 1 ? history[history.length - 2].price : price;
        const change = price - prev;
        const pct = (change / prev) * 100;
        const isGain = change >= 0;

        return (
          <div 
            key={c.id} 
            style={{ ...styles.card, ...styles.cardInteractive, ...(selectedId === c.id ? styles.cardSelected : {}) }}
            onClick={() => setSelectedId(c.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 'bold' }}>{c.symbol}</span>
              <span style={{ fontWeight: 'bold', color: '#e2e8f0' }}>${price.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: '#94a3b8' }}>{c.name}</span>
              <span style={isGain ? styles.priceUp : styles.priceDown}>
                {isGain ? 'â–²' : 'â–¼'}{pct.toFixed(2)}%
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.5rem' }}>
              Risk: {c.riskRating} | Liq: {c.liquidityScore}
            </div>
          </div>
        );
      })}
    </div>
  );

  const RenderTradingDesk = () => (
    <div style={styles.panel}>
      
      {/* Balance Card */}
      <div style={{ ...styles.card, background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid #334155' }}>
         <div style={styles.label}>Available Cash</div>
         <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>${cash.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
         <div style={styles.label}>Total Net Worth</div>
         <div style={{ fontSize: '1rem', color: '#fbbf24' }}>${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
      </div>

      {/* Position Card */}
      <div style={styles.card}>
        <div style={styles.label}>Your Position: {selectedCommodity.symbol}</div>
        {portfolio[selectedId] ? (
           <div>
             <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {portfolio[selectedId].quantity.toFixed(4)} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>units</span>
             </div>
             <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                Avg Price: ${portfolio[selectedId].averageBuyPrice.toFixed(2)}
             </div>
             <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: portfolio[selectedId].unrealizedPL >= 0 ? '#10b981' : '#ef4444' }}>
                P/L: {portfolio[selectedId].unrealizedPL.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}
             </div>
           </div>
        ) : (
          <div style={{ color: '#64748b', fontStyle: 'italic' }}>No open position</div>
        )}
      </div>

      {/* Order Entry */}
      <div style={{ ...styles.card, border: '1px solid #475569' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#e2e8f0' }}>Execute Order: {selectedCommodity.symbol}</h4>
        
        {/* Buy/Sell Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button 
            onClick={() => setIsBuy(true)}
            style={{ ...styles.button, flex: 1, marginTop: 0, backgroundColor: isBuy ? '#10b981' : '#1e293b', border: isBuy ? 'none' : '1px solid #334155', color: isBuy ? '#fff' : '#94a3b8' }}
          >
            Buy
          </button>
          <button 
            onClick={() => setIsBuy(false)}
            style={{ ...styles.button, flex: 1, marginTop: 0, backgroundColor: !isBuy ? '#ef4444' : '#1e293b', border: !isBuy ? 'none' : '1px solid #334155', color: !isBuy ? '#fff' : '#94a3b8' }}
          >
            Sell
          </button>
        </div>

        {/* Order Type Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {['MARKET', 'LIMIT', 'STOP'].map(type => (
            <button
              key={type}
              onClick={() => setOrderType(type as 'MARKET' | 'LIMIT' | 'STOP')}
              style={{ ...styles.button, flex: 1, marginTop: 0, padding: '0.5rem', fontSize: '0.8rem', backgroundColor: orderType === type ? '#3b82f6' : '#1e293b' }}
            >
              {type}
            </button>
          ))}
        </div>

        <label style={styles.label}>Quantity</label>
        <input 
          type="number" 
          value={orderAmount} 
          onChange={(e) => setOrderAmount(e.target.value)}
          placeholder="0.00"
          style={styles.input}
        />

        {(orderType === 'LIMIT' || orderType === 'STOP') && (
          <>
            <label style={styles.label}>{orderType} Price</label>
            <input 
              type="number" 
              value={limitPrice} 
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder={selectedPrice.toFixed(2)}
              style={styles.input}
            />
          </>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem' }}>
           <span>Est. Total @ ${selectedPrice.toFixed(2)}</span>
           <span>${((parseFloat(orderAmount) || 0) * selectedPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>

        <button 
          onClick={handleTrade}
          style={{ ...styles.button, backgroundColor: isBuy ? '#10b981' : '#ef4444', opacity: !orderAmount ? 0.5 : 1 }}
          disabled={!orderAmount}
        >
          {isBuy ? `Execute ${orderType} BUY` : `Execute ${orderType} SELL`}
        </button>
        
        {notification && (
          <div style={{ marginTop: '1rem', padding: '0.5rem', backgroundColor: '#3b82f6', color: 'white', borderRadius: '4px', fontSize: '0.8rem', textAlign: 'center', animation: 'fadeIn 0.3s' }}>
            {notification}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Recent Activity ({transactions.length})</h4>
        <div style={{ fontSize: '0.8rem', maxHeight: '300px', overflowY: 'auto' }}>
          {transactions.length === 0 && <div style={{ color: '#64748b' }}>No transactions yet</div>}
          {transactions.map(tx => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #1e293b' }}>
              <div>
                <span style={{ color: tx.type.includes('BUY') ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>{tx.type.replace('_', ' ')}</span> 
                <span style={{ marginLeft: '0.5rem', color: '#cbd5e1' }}>{COMMODITIES.find(c => c.id === tx.commodityId)?.symbol}</span>
              </div>
              <div style={{ color: '#94a3b8', textAlign: 'right' }}>
                {tx.quantity.toFixed(2)} @ ${tx.price.toFixed(2)}
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{tx.executionModel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const RenderDashboard = () => (
    <div style={{ ...styles.panel, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
      <h2 style={{ marginTop: 0, color: '#e2e8f0' }}>AI Executive Dashboard</h2>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Real-time operational metrics and AI insights for strategic decision making.</p>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {kpis.map(kpi => (
          <div key={kpi.name} style={{ ...styles.card, padding: '1.2rem', borderLeft: `4px solid ${kpi.trend > 0 ? '#10b981' : '#ef4444'}` }}>
            <div style={styles.label}>{kpi.name}</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff' }}>
              {kpi.value.toFixed(2)} {kpi.unit}
            </div>
            <div style={{ fontSize: '0.8rem', color: kpi.trend > 0 ? '#10b981' : '#ef4444' }}>
              {kpi.trend > 0 ? 'â–²' : 'â–¼'} {Math.abs(kpi.trend).toFixed(2)}% (24h)
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#94a3b8', borderTop: '1px solid #334155', paddingTop: '0.5rem' }}>
              AI Insight: {kpi.aiInsight}
            </div>
          </div>
        ))}
      </div>

      {/* Portfolio Overview */}
      <div style={{ ...styles.card, marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#e2e8f0' }}>Portfolio Holdings Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '1rem', fontSize: '0.85rem', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
          <span>Symbol</span>
          <span style={{ textAlign: 'right' }}>Quantity</span>
          <span style={{ textAlign: 'right' }}>Avg Cost</span>
          <span style={{ textAlign: 'right' }}>Market Value</span>
          <span style={{ textAlign: 'right' }}>P/L (%)</span>
        </div>
        {Object.values(portfolio).map(item => {
          const commodity = COMMODITIES.find(c => c.id === item.commodityId);
          const currentPrice = currentPrices[item.commodityId] || 0;
          const pctPL = (item.unrealizedPL / (item.quantity * item.averageBuyPrice)) * 100;
          const isGain = pctPL >= 0;

          return (
            <div key={item.commodityId} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid #1e293b' }}>
              <span style={{ fontWeight: 'bold', color: '#fff' }}>{commodity?.symbol}</span>
              <span style={{ textAlign: 'right' }}>{item.quantity.toFixed(2)}</span>
              <span style={{ textAlign: 'right' }}>${item.averageBuyPrice.toFixed(2)}</span>
              <span style={{ textAlign: 'right' }}>${item.currentMarketValue.toFixed(2)}</span>
              <span style={{ textAlign: 'right', color: isGain ? '#10b981' : '#ef4444' }}>{pctPL.toFixed(2)}%</span>
            </div>
          );
        })}
        {Object.keys(portfolio).length === 0 && <div style={{ padding: '1rem', color: '#64748b' }}>No active positions.</div>}
      </div>

      {/* Macro Economic Drivers */}
      <div style={styles.card}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#e2e8f0' }}>Global Macro Drivers (AI Feed)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          {macroData.map(m => (
            <div key={m.symbol} style={{ padding: '0.75rem', border: '1px solid #334155', borderRadius: '4px' }}>
              <div style={styles.label}>{m.name} ({m.symbol})</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{m.value.toFixed(2)}</div>
              <div style={{ fontSize: '0.8rem', color: m.trend > 0 ? '#10b981' : '#ef4444' }}>
                {m.trend > 0 ? 'â–²' : 'â–¼'} {Math.abs(m.trend).toFixed(2)}% (Daily)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const RenderAIStrategies = () => (
    <div style={{ ...styles.panel, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
      <h2 style={{ marginTop: 0, color: '#e2e8f0' }}>Algorithmic Strategy Core</h2>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Deploy and monitor high-frequency, AI-optimized trading strategies.</p>

      {strategies.map(strategy => (
        <div key={strategy.strategyId} style={{ ...styles.card, border: `1px solid ${strategy.isActive ? '#3b82f6' : '#475569'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ margin: 0, color: '#fff' }}>{strategy.name} ({COMMODITIES.find(c => c.id === strategy.targetCommodityId)?.symbol})</h4>
            <span style={{ ...styles.tag, backgroundColor: strategy.isActive ? '#10b981' : '#ef4444' }}>
              {strategy.isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem', fontSize: '0.85rem' }}>
            <div><div style={styles.label}>Risk Tolerance</div>{strategy.parameters.riskTolerance}</div>
            <div><div style={styles.label}>Max Drawdown</div>{(strategy.parameters.maxDrawdown * 100).toFixed(1)}%</div>
            <div><div style={styles.label}>Capital Allocation</div>{(strategy.parameters.capitalAllocation * 100).toFixed(0)}%</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
            <div><div style={styles.label}>Win Rate</div>{(strategy.performanceMetrics.winRate * 100).toFixed(1)}%</div>
            <div><div style={styles.label}>Alpha</div>{(strategy.performanceMetrics.alpha * 100).toFixed(2)}%</div>
            <div><div style={styles.label}>Sharpe Ratio</div>{strategy.performanceMetrics.sharpeRatio.toFixed(2)}</div>
          </div>

          <button
            onClick={() => setStrategies(prev => prev.map(s => s.strategyId === strategy.strategyId ? { ...s, isActive: !s.isActive } : s))}
            style={{ ...styles.button, width: 'auto', marginTop: '1rem', backgroundColor: strategy.isActive ? '#ef4444' : '#10b981' }}
          >
            {strategy.isActive ? 'Deactivate Strategy' : 'Activate Strategy'}
          </button>
        </div>
      ))}
    </div>
  );

  const RenderRiskManagement = () => (
    <div style={{ ...styles.panel, maxHeight: 'calc(100vh - 80px)', overflowY: 'auto' }}>
      <h2 style={{ marginTop: 0, color: '#e2e8f0' }}>Enterprise Risk Management</h2>
      <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Deep dive into portfolio exposure, stress testing, and compliance metrics.</p>

      {/* Global Risk Status */}
      <div style={{ ...styles.card, padding: '1.5rem', backgroundColor: systemStatus === 'CRITICAL' ? '#450a0a' : systemStatus === 'ALERT' ? '#451a03' : '#064e3b' }}>
        <div style={styles.label}>System Risk Status</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{systemStatus}</div>
        <div style={{ fontSize: '1rem', marginTop: '0.5rem' }}>Portfolio VaR: {portfolioVaR.toFixed(4)}%</div>
      </div>

      {/* Commodity Risk Breakdown */}
      <div style={{ ...styles.card, marginTop: '1rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#e2e8f0' }}>Position Risk Contribution</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8', borderBottom: '1px solid #334155', paddingBottom: '0.5rem' }}>
          <span>Asset</span>
          <span style={{ textAlign: 'right' }}>Value (USD)</span>
          <span style={{ textAlign: 'right' }}>VaR Contrib.</span>
          <span style={{ textAlign: 'right' }}>Margin Req.</span>
        </div>
        {Object.values(portfolio).sort((a, b) => b.riskExposure - a.riskExposure).map(item => {
          const commodity = COMMODITIES.find(c => c.id === item.commodityId);
          // Recalculate risk contribution based on total portfolio value
          const riskPct = totalPortfolioValue > 0 ? (item.riskExposure / totalPortfolioValue) * 100 : 0; 
          return (
            <div key={item.commodityId} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', padding: '0.5rem 0', borderBottom: '1px solid #1e293b' }}>
              <span style={{ fontWeight: 'bold', color: '#fff' }}>{commodity?.symbol}</span>
              <span style={{ textAlign: 'right' }}>${item.currentMarketValue.toFixed(0)}</span>
              <span style={{ textAlign: 'right', color: riskPct > 10 ? '#ef4444' : '#fbbf24' }}>{riskPct.toFixed(1)}%</span>
              <span style={{ textAlign: 'right' }}>${item.marginRequirement.toFixed(0)}</span>
            </div>
          );
        })}
      </div>

      {/* Stress Test Scenarios (Simulated) */}
      <div style={{ ...styles.card, marginTop: '1rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#e2e8f0' }}>AI Stress Test Scenarios</h4>
        <div style={{ fontSize: '0.85rem' }}>
          <div style={{ marginBottom: '0.5rem', color: '#94a3b8' }}>Scenario: Global Supply Chain Collapse (REE + COB + NGS prices +50%)</div>
          <div style={{ paddingLeft: '1rem', color: '#ef4444' }}>Estimated Loss: $15,000,000 (15% of Net Worth)</div>
          <div style={{ marginTop: '1rem', marginBottom: '0.5rem', color: '#94a3b8' }}>Scenario: USD Hyper-Inflation (XAU +20%, DXY -10%)</div>
          <div style={{ paddingLeft: '1rem', color: '#10b981' }}>Estimated Gain: $5,000,000</div>
        </div>
      </div>
    </div>
  );

  const RenderAI_Assistant = () => (
    <div style={{ ...styles.card, height: 'calc(100vh - 110px)', display: 'flex', flexDirection: 'column', padding: '1rem', margin: '0 0 1rem 0', backgroundColor: '#1e293b' }}>
      <h4 style={{ margin: '0 0 1rem 0', color: '#3b82f6' }}>AI Core V3 Assistant</h4>
      
      {/* Chat History */}
      <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '1rem' }}>
        {aiChatHistory.map(msg => (
          <div key={msg.id} style={{ 
            display: 'flex', 
            justifyContent: msg.sender === 'USER' ? 'flex-end' : 'flex-start', 
            marginBottom: '0.75rem' 
          }}>
            <div style={{ 
              maxWidth: '80%', 
              padding: '0.6rem 1rem', 
              borderRadius: '12px', 
              fontSize: '0.85rem',
              backgroundColor: msg.sender === 'USER' ? '#3b82f6' : '#475569',
              color: '#fff'
            }}>
              {msg.content}
              <div style={{ fontSize: '0.65rem', color: '#cbd5e1', opacity: 0.7, marginTop: '0.3rem', textAlign: msg.sender === 'USER' ? 'right' : 'left' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && chatInput.trim()) handleAIChatSubmit(chatInput.trim()); }}
          placeholder="Ask AI Core V3..."
          style={{ ...styles.input, flex: 1, margin: 0 }}
        />
        <button
          onClick={() => chatInput.trim() && handleAIChatSubmit(chatInput.trim())}
          style={{ ...styles.button, width: 'auto', padding: '0.75rem 1rem', backgroundColor: '#3b82f6', opacity: chatInput.trim() ? 1 : 0.5 }}
          disabled={!chatInput.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );


  // --- Main Render Structure ---

  return (
    <div style={styles.container}>
      {/* Local Styles for Fixed Bars */}
      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>

      {/* --- Footer --- */}
      <header style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>V3</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem' }}>Balcony of Prosperity OS</h1>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>AI-Driven Global Commodities Exchange</span>
          </div>
        </div>
        
        {/* Calculation Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={styles.tabButton(activeView === 'DASHBOARD')} onClick={() => setActiveView('DASHBOARD')}>Dashboard</button>
          <button style={styles.tabButton(activeView === 'TRADING')} onClick={() => setActiveView('TRADING')}>Trading Desk</button>
          <button style={styles.tabButton(activeView === 'AI_STRATEGIES')} onClick={() => setActiveView('AI_STRATEGIES')}>AI Strategies</button>
          <button style={styles.tabButton(activeView === 'RISK_MGMT')} onClick={() => setActiveView('RISK_MGMT')}>Risk Management</button>
          {/* Removed API Settings button */}
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Net Worth</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24' }}>
            ${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </header>

      {/* --- Secondary Content Line --- */}
      <div style={styles.main}>
        
        {/* --- Right Column: Market Watch --- */}
        {RenderMarketWatch()}

        {/* --- Center Column: View Renderer --- */}
        <div style={{ ...styles.panel, display: 'flex', flexDirection: 'column', padding: activeView === 'TRADING' ? '1.5rem 1rem' : '0', maxHeight: 'calc(100vh - 80px)', overflowY: activeView !== 'TRADING' ? 'auto' : 'hidden' }}>
          
          {activeView === 'TRADING' && (
            <>
              {/* Asset Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', padding: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <span style={styles.tag}>{selectedCommodity.category}</span>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{selectedCommodity.description}</span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '2rem' }}>{selectedCommodity.name} <span style={{ color: '#64748b', fontSize: '1rem' }}>/ USD</span></h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: isUp ? '#10b981' : '#ef4444' }}>
                    ${selectedPrice.toFixed(2)}
                  </div>
                  <div style={{ color: isUp ? '#10b981' : '#ef4444' }}>
                    {isUp ? 'â–²' : 'â–¼'} {Math.abs(selectedPrice - previousPrice).toFixed(2)} ({percentChange.toFixed(2)}%)
                  </div>
                </div>
              </div>

              {/* Chart Visualization */}
              <div style={{ flex: 1, backgroundColor: '#1e293b', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column', position: 'relative', margin: '0 1rem' }}>
                 <AdvancedMarketVisualization 
                   data={selectedHistory} 
                   predictions={selectedPredictions}
                   color={isUp ? '#10b981' : '#ef4444'} 
                   height={450}
                 />
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', borderTop: '1px solid #334155', paddingTop: '0.5rem', color: '#64748b', fontSize: '0.8rem' }}>
                   <span>T-{HISTORY_LENGTH * TICK_RATE_MS / 1000}s</span>
                   <span>T-{HISTORY_LENGTH * TICK_RATE_MS / 2000}s</span>
                   <span>Live + AI Forecast</span>
                 </div>
              </div>

              {/* Summary Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginTop: '1rem', padding: '0 1.5rem 1.5rem 1.5rem' }}>
                 <div style={styles.card}>
                   <div style={styles.label}>Volatility Index</div>
                   <div style={{ fontSize: '1.1rem' }}>{(selectedCommodity.volatility * 100).toFixed(2)}%</div>
                 </div>
                 <div style={styles.card}>
                   <div style={styles.label}>Liquidity Score</div>
                   <div style={{ fontSize: '1.1rem' }}>{selectedCommodity.liquidityScore}/100</div>
                 </div>
                 <div style={styles.card}>
                   <div style={styles.label}>AI Confidence (24h)</div>
                   <div style={{ fontSize: '1.1rem', color: selectedPredictions[0]?.confidenceScore > 0.8 ? '#10b981' : '#fbbf24' }}>
                     {(selectedPredictions[0]?.confidenceScore * 100 || 0).toFixed(1)}%
                   </div>
                 </div>
                 <div style={styles.card}>
                   <div style={styles.label}>Environmental Impact</div>
                   <div style={{ fontSize: '1.1rem', color: selectedCommodity.supplyChainMetrics.environmentalImpact > 7 ? '#ef4444' : '#10b981' }}>
                     {selectedCommodity.supplyChainMetrics.environmentalImpact}/10
                   </div>
                 </div>
              </div>
            </>
          )}

          {activeView === 'DASHBOARD' && RenderDashboard()}
          {activeView === 'AI_STRATEGIES' && RenderAIStrategies()}
          {activeView === 'RISK_MGMT' && RenderRiskManagement()}
          {/* activeView === 'API_SETTINGS' is now removed */}

        </div>

        {/* --- Left Column: Barter Desk / Human Assistant --- */}
        <div style={{ ...styles.panel, padding: '0 1rem 0 0' }}>
          {activeView === 'TRADING' ? RenderTradingDesk() : RenderAI_Assistant()}
        </div>
      </div>
    </div>
  );
}