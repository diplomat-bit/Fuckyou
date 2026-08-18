import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Settings, DollarSign, Activity, TrendingUp, Zap, Server, Shield, Globe, Cpu, BarChart3, ZapIcon, Rocket, Brain, Landmark, Clock, Database, Aperture, Layers, Atom, Users, FileText, Briefcase, Crosshair, Bot, TrendingDown, BookOpen, HeartPulse, Ship, Plane, Factory, Network, Handshake } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

// --- AI Integration Types (Simulated) ---
type AIInsightSource = 'MarketSentiment' | 'GeopoliticalRisk' | 'InternalEfficiency' | 'HFTAnomaly' | 'QuantumThreat' | 'SupplyChain' | 'EnvironmentalCollapse';
type AIInsight = {
  id: string;
  source: AIInsightSource;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  recommendation: string;
  confidence: number; // 0.0 to 1.0
};

type ProfileSummary = {
  id: string;
  name: string;
  role: string;
  aiScore: number; // Predictive performance score
  lastActionTurn: number;
};

// --- Core Data Structures ---
type NationMetrics = {
  // Core Economic
  gdp: number; // Trillions USD, Real Growth
  nationalReserve: number; // Trillions USD, Liquid Assets
  debtToGdp: number; // Percentage, Adjusted for Future Liabilities
  unemploymentRate: number; // Percentage, Structural & Cyclical
  inflationRate: number; // Percentage, Core CPI
  tradeBalance: number; // Billions USD, Net Exports
  manufacturingOutput: number; // Trillions USD
  // Infrastructure & Tech
  infrastructureQualityIndex: number; // 0-100, Physical & Digital Backbone
  technologicalAdvancementScore: number; // 0-100, R&D Investment & Patent Velocity
  quantumComputingReadiness: number; // 0-100, Q-bit progress and talent pool
  aiAdoptionRate: number; // percentage of industries
  dataSovereigntyIndex: number; // 0-100
  // Human Capital
  humanCapitalIndex: number; // 0-100, Education & Health Outcomes
  population: number; // in millions
  populationGrowth: number; // percentage
  medianAge: number;
  lifeExpectancy: number;
  citizenDigitalLiteracy: number; // 0-100
  // Governance & Stability
  regulatoryComplexity: number; // 1-100, Friction for new ventures
  cyberDefensePosture: number; // 0-100, Resilience against state actors
  geopoliticalStabilityIndex: number; // 0-100, Global conflict risk assessment
  politicalStability: number; // 0-100
  corruptionPerceptionIndex: number; // 0-100 (higher is better)
  // Environment
  energyIndependence: number; // 0-100, % of energy needs met domestically
  carbonEmissions: number; // Megatonnes CO2e
  renewableEnergyUsage: number; // percentage of total
  biodiversityIndex: number; // 0-100
  // Supply Chain & Military
  supplyChainResilience: number; // 0-100
  militarySpending: number; // % of GDP
  navalStrengthIndex: number; // 0-100
  aerospaceDominance: number; // 0-100
  // GEIN (Global Economic Interaction Network)
  geinScore: number; // Global Economic Interaction Network score
  diplomaticInfluence: number; // 0-100
  tradeNetworkCentrality: number; // 0-100
  softPowerIndex: number; // 0-100
};

type EconomicLever = {
  name: string;
  currentValue: number;
  min: number;
  max: number;
  unit: string;
  description: string;
  icon: React.ReactNode;
  aiOptimizationTarget: 'Growth' | 'Stability' | 'Equity' | 'Future';
};

type ScenarioResult = {
  turn: number;
  gdpGrowth: number;
  inflation: number;
  unemployment: number;
  reserveChange: number;
  humanCapital: number;
  techScore: number;
  aiModelVersion: string;
};

// --- High-Frequency Trading Sub-System ---
type HFTStrategy = 'AggressiveGrowth' | 'Balanced' | 'CapitalPreservation';
type Trade = {
  id: string;
  timestamp: number;
  asset: string;
  type: 'BUY' | 'SELL';
  amount: number; // in Billions USD
  price: number;
  pnl: number; // Profit/Loss
};
type HFTBotState = {
  isActive: boolean;
  strategy: HFTStrategy;
  capitalAllocated: number; // Billions USD
  netPnl: number;
  tradeCount: number;
  recentTrades: Trade[];
};

// --- Initial Configuration ---
const CORE_AI_VERSION = "GEIN_v1.0-Cognito";

const initialMetrics: NationMetrics = {
  gdp: 25.0, nationalReserve: 4.5, debtToGdp: 120.5, unemploymentRate: 4.2, inflationRate: 3.5, tradeBalance: -50.0, manufacturingOutput: 5.0,
  infrastructureQualityIndex: 88, technologicalAdvancementScore: 92, quantumComputingReadiness: 40, aiAdoptionRate: 35, dataSovereigntyIndex: 80,
  humanCapitalIndex: 85, population: 330, populationGrowth: 0.4, medianAge: 38.5, lifeExpectancy: 79.1, citizenDigitalLiteracy: 88,
  regulatoryComplexity: 45, cyberDefensePosture: 78, geopoliticalStabilityIndex: 65, politicalStability: 70, corruptionPerceptionIndex: 75,
  energyIndependence: 55, carbonEmissions: 5000, renewableEnergyUsage: 20, biodiversityIndex: 60,
  supplyChainResilience: 65, militarySpending: 3.5, navalStrengthIndex: 95, aerospaceDominance: 98,
  geinScore: 85, diplomaticInfluence: 90, tradeNetworkCentrality: 88, softPowerIndex: 92,
};

const initialLevers: EconomicLever[] = [
  { name: 'Interest Rate', currentValue: 3.0, min: 0.0, max: 10.0, unit: '%', description: 'Central Bank Policy Rate. Primary tool for liquidity management.', icon: <DollarSign size={16} />, aiOptimizationTarget: 'Stability' },
  { name: 'Fiscal Stimulus', currentValue: 500, min: 0, max: 2000, unit: 'B', description: 'Government spending injection (Billions). Targeted infrastructure/R&D allocation.', icon: <Activity size={16} />, aiOptimizationTarget: 'Growth' },
  { name: 'Corporate Tax Rate', currentValue: 21.0, min: 10.0, max: 50.0, unit: '%', description: 'Taxation on corporate profits. Calibrated for capital retention vs. public funding.', icon: <Server size={16} />, aiOptimizationTarget: 'Equity' },
  { name: 'AI R&D Subsidies', currentValue: 100, min: 0, max: 1000, unit: 'B', description: 'Direct funding for national AI and quantum computing initiatives.', icon: <Brain size={16} />, aiOptimizationTarget: 'Future' },
  { name: 'Carbon Tax Rate', currentValue: 40, min: 0, max: 200, unit: '$/ton', description: 'Tax on carbon emissions to drive green energy transition.', icon: <Zap size={16} />, aiOptimizationTarget: 'Equity' },
  { name: 'Education Investment', currentValue: 5.0, min: 2.0, max: 10.0, unit: '% GDP', description: 'Funding for public education and research to boost Human Capital.', icon: <BookOpen size={16} />, aiOptimizationTarget: 'Future' },
  { name: 'Healthcare Funding', currentValue: 17.0, min: 8.0, max: 25.0, unit: '% GDP', description: 'Investment in public health infrastructure and outcomes.', icon: <HeartPulse size={16} />, aiOptimizationTarget: 'Equity' },
  { name: 'Military Expenditure', currentValue: 3.5, min: 1.0, max: 8.0, unit: '% GDP', description: 'Defense spending for geopolitical stability and power projection.', icon: <Shield size={16} />, aiOptimizationTarget: 'Stability' },
];

const initialHistory: ScenarioResult[] = [
  { turn: 1, gdpGrowth: 2.1, inflation: 3.2, unemployment: 4.5, reserveChange: 10, humanCapital: 84.8, techScore: 91.8, aiModelVersion: CORE_AI_VERSION },
  { turn: 2, gdpGrowth: 2.5, inflation: 3.5, unemployment: 4.2, reserveChange: 15, humanCapital: 84.9, techScore: 92.0, aiModelVersion: CORE_AI_VERSION },
  { turn: 3, gdpGrowth: 3.1, inflation: 3.8, unemployment: 3.9, reserveChange: 22, humanCapital: 85.0, techScore: 92.2, aiModelVersion: CORE_AI_VERSION },
  { turn: 4, gdpGrowth: 2.9, inflation: 4.1, unemployment: 4.0, reserveChange: 18, humanCapital: 85.1, techScore: 92.5, aiModelVersion: CORE_AI_VERSION },
  { turn: 5, gdpGrowth: 3.5, inflation: 3.5, unemployment: 3.5, reserveChange: 30, humanCapital: 85.2, techScore: 92.9, aiModelVersion: CORE_AI_VERSION },
];

const initialProfiles: ProfileSummary[] = [
    { id: 'P001', name: 'Dr. Elara Vance', role: 'Chief Economist', aiScore: 98.2, lastActionTurn: 5 },
    { id: 'P002', name: 'Director Kaelen Rix', role: 'Cyber Command Lead', aiScore: 95.1, lastActionTurn: 4 },
    { id: 'P003', name: 'Minister of Trade', role: 'External Relations', aiScore: 89.5, lastActionTurn: 5 },
];

const initialHFTState: HFTBotState = {
    isActive: true,
    strategy: 'Balanced',
    capitalAllocated: 250, // 250 Billion
    netPnl: 0,
    tradeCount: 0,
    recentTrades: [],
};

// --- Utility Components ---

const MetricCard: React.FC<{ title: string; value: string | number; unit: string; trend: 'up' | 'down' | 'flat'; color: string; icon: React.ReactNode }> = ({ title, value, unit, trend, color, icon }) => {
  const trendIcon = useMemo(() => {
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <div className="w-5 h-5 text-gray-500">{icon}</div>;
  }, [trend, icon]);

  return (
    <div className="p-4 rounded-xl shadow-lg border border-indigo-800/30 bg-gray-800/50 hover:bg-gray-700/60 transition-all duration-300 transform hover:scale-[1.03] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
      <div className="relative z-10 flex justify-between items-start">
        <div className="flex flex-col">
            <div className="flex items-center text-xs font-medium text-indigo-400 uppercase mb-1">
                {icon}
                <span className='ml-2'>{title}</span>
            </div>
            <div className="mt-1 flex items-baseline">
                <p className={`text-3xl font-extrabold ${color} transition-transform duration-300 group-hover:translate-x-1`}>{value}</p>
                <span className="ml-1.5 text-md font-semibold text-gray-400">{unit}</span>
            </div>
        </div>
        <div className="p-1.5 bg-gray-900/50 rounded-full border border-gray-700">
            {trendIcon}
        </div>
      </div>
    </div>
  );
};

const LeverControl: React.FC<{ lever: EconomicLever; onUpdate: (name: string, value: number) => void }> = ({ lever, onUpdate }) => {
  const [value, setValue] = useState(lever.currentValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setValue(newValue);
    onUpdate(lever.name, newValue);
  };

  const targetColor = useMemo(() => {
    switch (lever.aiOptimizationTarget) {
      case 'Growth': return 'text-green-400';
      case 'Stability': return 'text-yellow-400';
      case 'Equity': return 'text-cyan-400';
      case 'Future': return 'text-purple-400';
      default: return 'text-white';
    }
  }, [lever.aiOptimizationTarget]);

  return (
    <div className="p-3 bg-gray-900/70 rounded-lg border border-purple-700/30 mb-2 shadow-md hover:shadow-purple-500/10 transition duration-300">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center text-sm font-bold text-white">
          {lever.icon}
          <h4 className="ml-2">{lever.name}</h4>
        </div>
        <span className={`text-lg font-extrabold ${targetColor}`}>
          {value.toFixed(lever.unit.includes('%') ? 1 : 0)} {lever.unit}
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-2 italic border-l-2 border-gray-700 pl-2 text-[10px]">{lever.description}</p>
      <input
        type="range"
        min={lever.min}
        max={lever.max}
        step={(lever.max - lever.min) / 200}
        value={value}
        onChange={handleChange}
        className="w-full h-1.5 mt-1 bg-gray-700 rounded-full appearance-none cursor-pointer range-sm [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-500"
      />
    </div>
  );
};

const AIInsightCard: React.FC<{ insight: AIInsight }> = ({ insight }) => {
    const colorMap = {
        Critical: 'bg-red-900/50 border-red-500 text-red-300',
        High: 'bg-orange-900/50 border-orange-500 text-orange-300',
        Medium: 'bg-yellow-900/50 border-yellow-500 text-yellow-300',
        Low: 'bg-green-900/50 border-green-500 text-green-300',
    };
    const IconMap = {
        MarketSentiment: <BarChart3 size={16} />, GeopoliticalRisk: <Landmark size={16} />,
        InternalEfficiency: <Cpu size={16} />, HFTAnomaly: <Bot size={16} />, QuantumThreat: <Atom size={16} />,
        SupplyChain: <Factory size={16} />, EnvironmentalCollapse: <Zap size={16} />,
    };

    return (
        <div className={`p-3 rounded-md border-l-4 ${colorMap[insight.severity]} shadow-md mb-2 transition duration-300 hover:shadow-lg`}>
            <div className="flex justify-between items-center mb-1">
                <div className='flex items-center font-semibold text-xs'>
                    {IconMap[insight.source]}
                    <span className='ml-2'>{insight.source} Alert</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colorMap[insight.severity].replace('bg-', 'bg-').replace('text-', 'text-')}`}>{insight.severity}</span>
            </div>
            <p className="text-sm mt-1">{insight.recommendation}</p>
            <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>Confidence: {(insight.confidence * 100).toFixed(1)}%</span>
                <span>Model: {CORE_AI_VERSION}</span>
            </div>
        </div>
    );
};

const HighFrequencyTradingModule: React.FC<{ botState: HFTBotState; onStrategyChange: (strategy: HFTStrategy) => void; onToggle: () => void; }> = ({ botState, onStrategyChange, onToggle }) => {
    const pnlColor = botState.netPnl >= 0 ? 'text-green-400' : 'text-red-400';
    const strategyColor = {
        AggressiveGrowth: 'border-red-500 bg-red-900/50 text-red-300',
        Balanced: 'border-yellow-500 bg-yellow-900/50 text-yellow-300',
        CapitalPreservation: 'border-green-500 bg-green-900/50 text-green-300',
    };

    return (
        <div className="p-6 bg-gray-900 rounded-2xl shadow-2xl border border-cyan-800/50 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-cyan-300 flex items-center"><Bot className="mr-2 w-6 h-6" /> HFT Reserve Augmentation</h3>
                <button onClick={onToggle} className={`px-3 py-1 text-xs font-bold rounded-full ${botState.isActive ? 'bg-green-600 hover:bg-green-500' : 'bg-red-700 hover:bg-red-600'}`}>
                    {botState.isActive ? 'ACTIVE' : 'INACTIVE'}
                </button>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div>
                    <p className="text-xs text-gray-400 uppercase">Capital Allocated</p>
                    <p className="text-2xl font-mono text-white">${botState.capitalAllocated}B</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase">Net P/L (Turn)</p>
                    <p className={`text-2xl font-mono ${pnlColor}`}>{botState.netPnl >= 0 ? '+' : ''}{botState.netPnl.toFixed(3)}B</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase">Trades (Turn)</p>
                    <p className="text-2xl font-mono text-white">{botState.tradeCount}</p>
                </div>
            </div>
            <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Strategy Directive:</p>
                <div className="flex space-x-2">
                    {(['AggressiveGrowth', 'Balanced', 'CapitalPreservation'] as HFTStrategy[]).map(s => (
                        <button key={s} onClick={() => onStrategyChange(s)} className={`flex-1 py-2 text-xs font-semibold rounded-md border transition-all ${botState.strategy === s ? strategyColor[s] : 'border-gray-600 bg-gray-800 hover:bg-gray-700'}`}>
                            {s.replace(/([A-Z])/g, ' $1').trim()}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow overflow-hidden relative">
                <p className="text-sm text-gray-400 mb-2">Live Trade Feed:</p>
                <div className="h-full overflow-y-auto custom-scrollbar pr-2">
                    {botState.recentTrades.map(trade => (
                        <div key={trade.id} className="grid grid-cols-12 gap-2 text-xs font-mono p-1 rounded bg-gray-800/50 mb-1">
                            <span className="col-span-2 text-gray-500">T-{new Date(trade.timestamp).getUTCMilliseconds()}</span>
                            <span className={`col-span-2 font-bold ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{trade.type}</span>
                            <span className="col-span-3 text-cyan-400">{trade.asset}</span>
                            <span className="col-span-2 text-right text-white">${trade.amount.toFixed(2)}B</span>
                            <span className={`col-span-3 text-right ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>{trade.pnl.toFixed(4)}B</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Simulation Core Logic ---

const generateAIInsights = (metrics: NationMetrics, levers: EconomicLever[], turn: number, hftState: HFTBotState): AIInsight[] => {
    const insights: AIInsight[] = [];
    if (metrics.debtToGdp > 150) insights.push({ id: `D${turn}1`, source: 'GeopoliticalRisk', severity: 'Critical', recommendation: 'Debt servicing ratio critical. Immediate 20% reduction in non-essential capital expenditure required.', confidence: 0.98 });
    if (metrics.inflationRate > 5.0) insights.push({ id: `I${turn}1`, source: 'MarketSentiment', severity: 'High', recommendation: 'Aggressive tightening cycle recommended. Increase Interest Rate by 75bps next cycle to anchor expectations.', confidence: 0.92 });
    if (metrics.quantumComputingReadiness < 50 && metrics.technologicalAdvancementScore < 95) insights.push({ id: `Q${turn}1`, source: 'QuantumThreat', severity: 'High', recommendation: 'Quantum readiness lagging. Increase AI R&D Subsidies by 250B to avoid cryptographic vulnerability within 5 turns.', confidence: 0.88 });
    if (hftState.isActive && hftState.netPnl < -10) insights.push({ id: `H${turn}1`, source: 'HFTAnomaly', severity: 'Medium', recommendation: `HFT bot underperforming (${hftState.netPnl.toFixed(2)}B loss). Recommend switching strategy to Capital Preservation.`, confidence: 0.81 });
    if (metrics.supplyChainResilience < 50) insights.push({ id: `S${turn}1`, source: 'SupplyChain', severity: 'High', recommendation: 'Critical supply chain vulnerability detected. Diversify import partners and invest in domestic manufacturing.', confidence: 0.90 });
    if (metrics.biodiversityIndex < 40) insights.push({ id: `E${turn}1`, source: 'EnvironmentalCollapse', severity: 'Critical', recommendation: 'Biodiversity index at critical low. Risk of ecosystem service collapse. Implement immediate re-wilding and conservation policies.', confidence: 0.95 });
    return insights;
};

const runAdvancedSimulationTurn = (
    currentMetrics: NationMetrics, 
    currentLevers: EconomicLever[], 
    currentTurn: number,
    hftPnl: number
): { newMetrics: NationMetrics, newResult: ScenarioResult } => {
    
    const leversMap = currentLevers.reduce((acc, l) => ({ ...acc, [l.name.replace(/\s/g, '')]: l.currentValue }), {} as any);
    const randomFactor = (Math.random() - 0.5) * 0.4; // Reduced volatility

    // --- Interconnected Dynamics ---
    // 1. Human Capital & Health
    const eduEffect = (leversMap.EducationInvestment - 4.0) * 0.05;
    const healthEffect = (leversMap.HealthcareFunding - 15.0) * 0.03;
    let newHumanCapitalIndex = currentMetrics.humanCapitalIndex + eduEffect + healthEffect + (currentMetrics.citizenDigitalLiteracy / 500) - (currentMetrics.medianAge / 200);
    newHumanCapitalIndex = Math.max(50, Math.min(100, newHumanCapitalIndex));

    // 2. Technology & Innovation
    const techInvestmentBoost = (leversMap.AIR&DSubsidies / 500) * 0.4;
    let newTechScore = currentMetrics.technologicalAdvancementScore + techInvestmentBoost + (newHumanCapitalIndex / 200) - (currentMetrics.regulatoryComplexity / 300);
    newTechScore = Math.max(50, Math.min(100, newTechScore));

    // 3. GDP Growth Engine
    let baseGrowth = 1.5 + (newTechScore / 100) * 2.0 + (newHumanCapitalIndex / 100) * 1.0 - (currentMetrics.debtToGdp / 200);
    const monetaryDampening = (leversMap.InterestRate - 3.0) * -0.25;
    const fiscalStimulation = (leversMap.FiscalStimulus / 1000) * 0.8 - (leversMap.CorporateTaxRate - 20) * 0.05;
    let newGdpGrowth = baseGrowth + monetaryDampening + fiscalStimulation + randomFactor;
    newGdpGrowth = Math.max(-5.0, Math.min(10.0, newGdpGrowth));

    // 4. Economic Outcomes (Inflation, Unemployment)
    let newInflation = 2.5 + (newGdpGrowth - 2.5) * 0.5 - (leversMap.InterestRate - 3.0) * 0.5 - (currentMetrics.energyIndependence / 200);
    newInflation = Math.max(-1.0, Math.min(15.0, newInflation));
    let newUnemployment = 4.5 - (newGdpGrowth - 2.0) * 0.5 + (currentMetrics.regulatoryComplexity / 100);
    newUnemployment = Math.max(2.0, Math.min(15.0, newUnemployment));

    // 5. State Finances
    const taxRevenue = (currentMetrics.gdp * (leversMap.CorporateTaxRate / 100) * 0.2);
    const spending = (leversMap.FiscalStimulus / 1000) + (currentMetrics.gdp * (leversMap.EducationInvestment + leversMap.HealthcareFunding + leversMap.MilitaryExpenditure) / 100);
    const budgetDeficit = spending - taxRevenue;
    const newDebt = currentMetrics.debtToGdp * (currentMetrics.gdp / (currentMetrics.gdp * (1 + newGdpGrowth / 100))) + (budgetDeficit / currentMetrics.gdp) * 100;
    const reserveChange = (currentMetrics.tradeBalance / 100) - budgetDeficit + (hftPnl / 100);
    
    // 6. GEIN & Geopolitics
    let newDiplomaticInfluence = currentMetrics.diplomaticInfluence + (currentMetrics.softPowerIndex - 70) * 0.1 - (leversMap.MilitaryExpenditure - 3.5) * 0.2;
    let newGeinScore = (newDiplomaticInfluence + currentMetrics.tradeNetworkCentrality + newTechScore) / 3;

    const newMetrics: NationMetrics = {
      ...currentMetrics,
      gdp: parseFloat((currentMetrics.gdp * (1 + newGdpGrowth / 100)).toFixed(3)),
      inflationRate: parseFloat(newInflation.toFixed(2)),
      unemploymentRate: parseFloat(newUnemployment.toFixed(2)),
      nationalReserve: parseFloat((currentMetrics.nationalReserve + reserveChange * 0.1).toFixed(3)),
      debtToGdp: parseFloat(newDebt.toFixed(2)),
      humanCapitalIndex: parseFloat(newHumanCapitalIndex.toFixed(1)),
      technologicalAdvancementScore: parseFloat(newTechScore.toFixed(1)),
      quantumComputingReadiness: Math.min(100, currentMetrics.quantumComputingReadiness + (leversMap.AIR&DSubsidies / 200) * 0.5),
      politicalStability: Math.max(0, Math.min(100, currentMetrics.politicalStability + (newUnemployment < 4.0 ? 0.2 : -0.3) - (newInflation > 5.0 ? 0.5 : 0))),
      carbonEmissions: currentMetrics.carbonEmissions + (newGdpGrowth * 10) - (leversMap.CarbonTaxRate * 2),
      geinScore: parseFloat(newGeinScore.toFixed(1)),
      diplomaticInfluence: parseFloat(newDiplomaticInfluence.toFixed(1)),
      militarySpending: leversMap.MilitaryExpenditure,
    };

    const newResult: ScenarioResult = {
      turn: currentTurn + 1,
      gdpGrowth: parseFloat(newGdpGrowth.toFixed(2)),
      inflation: parseFloat(newInflation.toFixed(2)),
      unemployment: parseFloat(newUnemployment.toFixed(2)),
      reserveChange: parseFloat(reserveChange.toFixed(2)),
      humanCapital: parseFloat(newHumanCapitalIndex.toFixed(2)),
      techScore: parseFloat(newTechScore.toFixed(2)),
      aiModelVersion: CORE_AI_VERSION,
    };

    return { newMetrics, newResult };
};


// --- Main Component ---
const NationalMetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<NationMetrics>(initialMetrics);
  const [levers, setLevers] = useState<EconomicLever[]>(initialLevers);
  const [history, setHistory] = useState<ScenarioResult[]>(initialHistory);
  const [profiles, setProfiles] = useState<ProfileSummary[]>(initialProfiles);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationTurn, setSimulationTurn] = useState(initialHistory.length);
  const [hftBotState, setHftBotState] = useState<HFTBotState>(initialHFTBotState);

  const runSimulationStep = useCallback(() => {
    setSimulationTurn(prevTurn => {
      const { newMetrics, newResult } = runAdvancedSimulationTurn(metrics, levers, prevTurn, hftBotState.netPnl);
      const newInsights = generateAIInsights(newMetrics, levers, prevTurn + 1, hftBotState);
      
      setMetrics(newMetrics);
      setHistory(prev => [...prev, newResult].slice(-50));
      setInsights(newInsights);
      setHftBotState(prev => ({ ...prev, netPnl: 0, tradeCount: 0, recentTrades: [] })); // Reset HFT stats each turn

      setProfiles(prevProfiles => prevProfiles.map(p => ({ ...p, lastActionTurn: newResult.turn })));
      return newResult.turn;
    });
  }, [metrics, levers, hftBotState.netPnl]);

  useEffect(() => {
    if (simulationRunning) {
      const interval = setInterval(runSimulationStep, 2000);
      return () => clearInterval(interval);
    }
  }, [simulationRunning, runSimulationStep]);

  // HFT Bot Simulation Loop (runs faster)
  useEffect(() => {
    if (!simulationRunning || !hftBotState.isActive) return;

    const hftInterval = setInterval(() => {
        const volatility = hftBotState.strategy === 'AggressiveGrowth' ? 2.0 : hftBotState.strategy === 'Balanced' ? 1.0 : 0.5;
        const tradeChance = 0.6;

        if (Math.random() < tradeChance) {
            const pnl = (Math.random() - 0.48) * volatility * 0.5; // PNL in Billions
            const newTrade: Trade = {
                id: `T${Date.now()}`, timestamp: Date.now(), asset: 'GlobalMacroIndex',
                type: pnl > 0 ? 'BUY' : 'SELL', amount: Math.random() * 10 + 5, price: 1, pnl,
            };
            setHftBotState(prev => ({
                ...prev,
                netPnl: prev.netPnl + pnl,
                tradeCount: prev.tradeCount + 1,
                recentTrades: [newTrade, ...prev.recentTrades].slice(0, 20),
            }));
        }
    }, 200); // High frequency!

    return () => clearInterval(hftInterval);
  }, [simulationRunning, hftBotState.isActive, hftBotState.strategy]);

  const updateLever = useCallback((name: string, value: number) => {
    setLevers(prev => prev.map(l => (l.name === name ? { ...l, currentValue: value } : l)));
  }, []);

  const handleHFTStrategyChange = (strategy: HFTStrategy) => setHftBotState(s => ({ ...s, strategy }));
  const handleHFTToggle = () => setHftBotState(s => ({ ...s, isActive: !s.isActive }));

  const getMetricColor = (metric: keyof NationMetrics, value: number) => {
    switch (metric) {
      case 'gdp': return value > 30 ? 'text-green-400' : 'text-green-500';
      case 'debtToGdp': return value > 130 ? 'text-red-400' : value > 100 ? 'text-orange-400' : 'text-green-400';
      case 'unemploymentRate': return value > 5.0 ? 'text-red-400' : 'text-green-400';
      case 'inflationRate': return value > 4.0 ? 'text-red-400' : value > 2.5 ? 'text-yellow-400' : 'text-green-400';
      case 'quantumComputingReadiness': return value > 75 ? 'text-cyan-300' : 'text-cyan-500';
      case 'humanCapitalIndex': return value > 90 ? 'text-teal-300' : 'text-teal-400';
      default: return 'text-indigo-400';
    }
  };

  const currentKPIs = useMemo(() => [
    { title: "GDP (T USD)", value: metrics.gdp.toFixed(2), unit: "T", trend: 'up' as const, icon: <Landmark size={16} />, color: getMetricColor('gdp', metrics.gdp) },
    { title: "Reserves (T USD)", value: metrics.nationalReserve.toFixed(2), unit: "T", trend: 'up' as const, icon: <DollarSign size={16} />, color: 'text-yellow-400' },
    { title: "Debt/GDP", value: metrics.debtToGdp.toFixed(1), unit: "%", trend: metrics.debtToGdp > initialMetrics.debtToGdp ? 'up' : 'down' as const, icon: <TrendingUp size={16} />, color: getMetricColor('debtToGdp', metrics.debtToGdp) },
    { title: "Unemployment", value: metrics.unemploymentRate.toFixed(1), unit: "%", trend: 'down' as const, icon: <Users size={16} />, color: getMetricColor('unemploymentRate', metrics.unemploymentRate) },
    { title: "Inflation", value: metrics.inflationRate.toFixed(1), unit: "%", trend: 'up' as const, icon: <TrendingUp size={16} />, color: getMetricColor('inflationRate', metrics.inflationRate) },
    { title: "Tech Velocity", value: metrics.technologicalAdvancementScore.toFixed(0), unit: "/100", trend: 'up' as const, icon: <Cpu size={16} />, color: 'text-purple-400' },
    { title: "Human Capital", value: metrics.humanCapitalIndex.toFixed(0), unit: "/100", trend: 'up' as const, icon: <Brain size={16} />, color: getMetricColor('humanCapitalIndex', metrics.humanCapitalIndex) },
    { title: "GEIN Score", value: metrics.geinScore.toFixed(0), unit: "/100", trend: 'up' as const, icon: <Network size={16} />, color: 'text-orange-400' },
  ], [metrics]);

  const strategicIndexData = [
      { subject: 'Cyber Defense', A: metrics.cyberDefensePosture, fullMark: 100 },
      { subject: 'Geo-Stability', A: metrics.geopoliticalStabilityIndex, fullMark: 100 },
      { subject: 'Energy Indep.', A: metrics.energyIndependence, fullMark: 100 },
      { subject: 'Supply Chain', A: metrics.supplyChainResilience, fullMark: 100 },
      { subject: 'Political Stability', A: metrics.politicalStability, fullMark: 100 },
  ];

  return (
    <div className="min-h-screen p-6 text-white bg-gray-950 font-sans relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px]"></div>
        <div className="absolute inset-0 opacity-5 bg-[url('/grid.svg')] bg-repeat [background-size:100px_100px]"></div>

      <header className="relative z-20 flex justify-between items-center pb-4 border-b border-indigo-800/50 mb-6">
        <div className='flex items-center'>
            <Aperture className='w-8 h-8 text-purple-400 mr-3 animate-spin-slow' />
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 tracking-tight">
                Sovereign Economic Engine: Chronos
            </h1>
        </div>
        <div className="flex space-x-3 items-center">
          <div className='text-sm text-gray-400 bg-gray-800/70 px-3 py-2 rounded-lg border border-gray-700'>
            Turn: <span className='font-bold text-lg text-yellow-300'>{simulationTurn}</span> | Core: <span className='text-xs text-green-400'>{CORE_AI_VERSION}</span>
          </div>
          <button onClick={() => setSimulationRunning(s => !s)} className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center shadow-lg transform hover:scale-[1.03] ${simulationRunning ? 'bg-red-700 hover:bg-red-600 shadow-red-500/40' : 'bg-green-600 hover:bg-green-500 shadow-green-500/40'}`}>
            {simulationRunning ? <><Clock size={18} className="mr-2 animate-spin-slow" /> PAUSE</> : <><Zap size={18} className="mr-2" /> INITIATE</>}
          </button>
          <button onClick={runSimulationStep} disabled={simulationRunning} className={`p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition shadow-lg`}><Rocket size={20} /></button>
        </div>
      </header>

      <main className="grid grid-cols-12 gap-6 relative z-10">

        {/* Left Column: Core Metrics & Strategic Indices */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="p-4 bg-gray-900/80 rounded-2xl shadow-2xl border border-indigo-700/50">
                <h2 className="text-xl font-bold text-indigo-300 flex items-center mb-4"><Globe className="w-6 h-6 mr-2" /> National Dashboard</h2>
                <div className="grid grid-cols-2 gap-3">
                    {currentKPIs.map((kpi) => <MetricCard key={kpi.title} {...kpi} />)}
                </div>
            </div>
            <div className="p-4 bg-gray-900/80 rounded-2xl shadow-2xl border border-orange-700/50">
                <h2 className="text-xl font-bold text-orange-300 flex items-center mb-4"><Network className="w-6 h-6 mr-2" /> GEIN Matrix</h2>
                <div className="space-y-3">
                    {[ { label: 'GEIN Score', value: metrics.geinScore, color: 'bg-orange-500' }, { label: 'Diplomatic Influence', value: metrics.diplomaticInfluence, color: 'bg-sky-500' }, { label: 'Soft Power Index', value: metrics.softPowerIndex, color: 'bg-pink-500' } ].map(({ label, value, color }) => (
                        <div key={label}>
                            <div className="flex justify-between items-center text-sm mb-1"><span className='text-gray-400'>{label}</span><span className={`font-mono font-bold text-lg`}>{value.toFixed(1)} / 100</span></div>
                            <div className="h-2 bg-gray-700 rounded-full"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${value}%`, backgroundColor: color }}></div></div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 bg-gray-900/80 rounded-2xl shadow-2xl border border-cyan-700/50">
                <h2 className="text-xl font-bold text-cyan-300 flex items-center mb-2"><Shield className="w-6 h-6 mr-2" /> Strategic Resilience Index</h2>
                <ResponsiveContainer width="100%" height={250}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={strategicIndexData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Resilience" dataKey="A" stroke="#22D3EE" fill="#22D3EE" fillOpacity={0.6} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Center Column: Predictive Modeling & HFT */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
            <div className="p-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 h-[400px]">
                <h3 className="text-xl font-semibold text-gray-300 mb-2">Macro Trajectory (GDP vs. Inflation)</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs><linearGradient id="colorGdp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#818CF8" stopOpacity={0.9} /><stop offset="95%" stopColor="#818CF8" stopOpacity={0.1} /></linearGradient><linearGradient id="colorInf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F87171" stopOpacity={0.9} /><stop offset="95%" stopColor="#F87171" stopOpacity={0.1} /></linearGradient></defs>
                        <XAxis dataKey="turn" stroke="#4B5563" tick={{ fontSize: 10 }} /><YAxis yAxisId="left" stroke="#818CF8" domain={[-5, 10]} orientation="left" tick={{ fontSize: 10 }} /><YAxis yAxisId="right" stroke="#F87171" domain={[-1, 15]} orientation="right" tick={{ fontSize: 10 }} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" /><Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #4B5563', borderRadius: '8px' }} labelStyle={{ color: '#E5E7EB' }} />
                        <Area yAxisId="left" type="monotone" dataKey="gdpGrowth" stroke="#818CF8" strokeWidth={2} fillOpacity={1} fill="url(#colorGdp)" name="GDP Growth (%)" />
                        <Area yAxisId="right" type="monotone" dataKey="inflation" stroke="#F87171" strokeWidth={2} fillOpacity={1} fill="url(#colorInf)" name="Inflation Rate (%)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            <HighFrequencyTradingModule botState={hftBotState} onStrategyChange={handleHFTStrategyChange} onToggle={handleHFTToggle} />
        </div>

        {/* Right Column: Controls & AI Insights */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
            <div className="p-4 bg-gray-900/80 rounded-2xl shadow-2xl border border-purple-700/50">
                <h2 className="text-xl font-bold text-purple-300 flex items-center mb-4"><Settings className="w-6 h-6 mr-2" /> Policy Control Nexus</h2>
                <div className="max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                    {levers.map(lever => <LeverControl key={lever.name} lever={lever} onUpdate={updateLever} />)}
                </div>
            </div>
            <div className="p-4 bg-gray-900/80 rounded-2xl shadow-2xl border border-red-800/50">
                <h2 className="text-xl font-bold text-red-300 mb-3 flex items-center"><Zap size={20} className='mr-2'/> {CORE_AI_VERSION} Alerts</h2>
                <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    {insights.length > 0 ? insights.map(insight => <AIInsightCard key={insight.id} insight={insight} />) : <p className='text-gray-500 italic p-4 bg-gray-800 rounded-lg'>System nominal. No anomalies detected.</p>}
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default NationalMetricsDashboard;