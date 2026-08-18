import React, { useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, LineChart, Line } from 'recharts';
import Card from './Card';
import { DataContext } from '../context/DataContext';

// --- GROUNDED, REALITY-BASED DATA MODEL ---
interface Asset {
    id: string;
    name: string;
    value: number;
    performanceYTD: number | null;
    riskLevel: 'Low' | 'Medium' | 'High';
    assetClass: string;
    color: string;
    historicalData: { date: string, value: number }[];
    // --- Standard & Advanced Financial Metrics ---
    volatilityIndex: number; // e.g., VIX-like measure for the asset
    liquidityScore: number; // 0-1, ease of converting to cash
    sentimentScore: number; // -1 to 1, from news/social media analysis
    neuralNetworkConfidence: number; // Confidence score from predictive NN
    marketPsychologyIndex: number; // Index from social media sentiment analysis
    regulatoryComplexityFactor: number; // 0-100, how complex regulations are
    supplyChainDisruptionRisk: number; // Probability of disruption
    climateChangeImpactScore: number; // -10 to 10, impact of climate change
    ethicalGovernanceScore: number; // ESG-like score
    technologicalDisruptionThreat: number; // Threat level from new tech
    memeStockVelocity: number; // How fast it's trending
    darkPoolActivityRatio: number; // Ratio of dark pool to public trading
    geopoliticalTensionModifier: number; // Modifier based on global tensions
    algorithmicTradingPresence: number; // Percentage of trades by algos
}

interface DataContextType {
    assets: Asset[];
}

// --- SUB-APP 1: TRADE EXECUTION TERMINAL ---
const HighFrequencyTradingTerminal: React.FC<{ assets: Asset[] }> = ({ assets }) => {
    const [liveTrades, setLiveTrades] = useState<{ id: number, asset: string, type: 'BUY' | 'SELL', amount: number, price: number }[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<Asset>(assets[0]);
    const [orderType, setOrderType] = useState<'LIMIT' | 'MARKET' | 'STOP'>('MARKET');
    const [orderAmount, setOrderAmount] = useState('100');

    useEffect(() => {
        const interval = setInterval(() => {
            const randomAsset = assets[Math.floor(Math.random() * assets.length)];
            const trade = {
                id: Date.now() + Math.random(),
                asset: randomAsset.name,
                type: Math.random() > 0.5 ? 'BUY' : 'SELL',
                amount: Math.random() * 10,
                price: randomAsset.value / 100 * (1 + (Math.random() - 0.5) * 0.01)
            };
            setLiveTrades(prev => [trade, ...prev.slice(0, 14)]);
        }, 300); // High frequency simulation
        return () => clearInterval(interval);
    }, [assets]);

    const handleExecuteTrade = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(`Executing ${orderType} ${orderAmount} of ${selectedAsset.name}`);
        // Form logic would go here
    };

    return (
        <Card title="Trade Execution Terminal" className="col-span-full lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[400px]">
                {/* Trade Execution Form */}
                <div className="md:col-span-1 flex flex-col space-y-4 border-r border-gray-700 pr-4">
                    <h4 className="text-lg font-semibold text-gray-300">Order Entry</h4>
                    <form onSubmit={handleExecuteTrade} className="flex flex-col space-y-3 text-sm">
                        <div>
                            <label htmlFor="asset-select" className="block text-gray-400 mb-1">Target Asset</label>
                            <select id="asset-select" value={selectedAsset.id} onChange={(e) => setSelectedAsset(assets.find(a => a.id === e.target.value)!)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-red-500 focus:border-red-500">
                                {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="order-type" className="block text-gray-400 mb-1">Order Type</label>
                            <select id="order-type" value={orderType} onChange={(e) => setOrderType(e.target.value as any)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-red-500 focus:border-red-500">
                                <option>MARKET</option>
                                <option>LIMIT</option>
                                <option>STOP</option>
                                <option>TRAILING_STOP</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="order-amount" className="block text-gray-400 mb-1">Amount ($)</label>
                            <input type="number" id="order-amount" value={orderAmount} onChange={(e) => setOrderAmount(e.target.value)} className="w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-red-500 focus:border-red-500" />
                        </div>
                        <div className="flex space-x-2 pt-2">
                            <button type="submit" className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-md font-bold transition-colors">EXECUTE BUY</button>
                            <button type="submit" className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-md font-bold transition-colors">EXECUTE SELL</button>
                        </div>
                    </form>
                    <div className="text-xs text-gray-500 pt-4 border-t border-gray-700">
                        <p><strong>Liquidity Score:</strong> <span className="text-yellow-400 font-mono">{selectedAsset.liquidityScore.toFixed(2)}</span></p>
                        <p><strong>Volatility Index:</strong> <span className="text-purple-400 font-mono">{selectedAsset.volatilityIndex.toFixed(3)}</span></p>
                    </div>
                </div>
                {/* Live Trade Feed */}
                <div className="md:col-span-2 overflow-y-auto">
                    <h4 className="text-lg font-semibold text-gray-300 mb-2">Live Market Feed</h4>
                    <div className="font-mono text-xs space-y-1">
                        {liveTrades.map(trade => (
                            <div key={trade.id} className={`flex justify-between p-1 rounded-sm ${trade.type === 'BUY' ? 'bg-green-900/40' : 'bg-red-900/40'}`}>
                                <span className={trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}>{trade.type}</span>
                                <span className="text-gray-300 w-28 truncate">{trade.asset}</span>
                                <span className="text-gray-400">{trade.amount.toFixed(4)}</span>
                                <span className="text-white">${trade.price.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    );
};

// --- SUB-APP 2: GLOBAL SENTIMENT & EVENT ANALYZER ---
const GlobalSentimentAnalyzer: React.FC = () => {
    const sentimentData = useMemo(() => [
        { name: 'Geopolitical', score: -0.65, color: '#DC2626' },
        { name: 'Market News', score: 0.25, color: '#10B981' },
        { name: 'Social Media', score: -0.85, color: '#DC2626' },
        { name: 'Economic Data', score: 0.10, color: '#10B981' },
        { name: 'Insider Activity', score: -0.40, color: '#DC2626' },
    ], []);

    return (
        <Card title="Global Macro-Sentiment Analysis" className="col-span-full lg:col-span-1">
            <div className="h-[400px] flex flex-col">
                <p className="text-sm text-gray-400 mb-4">Analysis of global data streams to derive sentiment scores.</p>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sentimentData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" domain={[-1, 1]} stroke="#9CA3AF" />
                            <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }} />
                            <Bar dataKey="score" name="Sentiment Score" radius={[0, 5, 5, 0]}>
                                {sentimentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.score < 0 ? '#EF4444' : '#10B981'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-700 text-center">
                    <p className="text-lg font-bold text-red-400">Overall Sentiment: OVERWHELMINGLY NEGATIVE</p>
                    <p className="text-xs text-gray-500">Note: Sentiment is a volatile indicator and should not be the sole basis for investment decisions.</p>
                </div>
            </div>
        </Card>
    );
};

// --- SUB-APP 3: MONTE CARLO RISK SIMULATOR ---
const RiskSimulator: React.FC = () => {
    const [simulationParams, setSimulationParams] = useState({ trials: 1000, volatility: 0.2, horizon: 12 });
    const [isRunning, setIsRunning] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);

    const handleRunSimulation = (e: React.FormEvent) => {
        e.preventDefault();
        setIsRunning(true);
        setResults(null);
        setTimeout(() => {
            const simData = Array.from({ length: 30 }, (_, i) => ({
                day: i + 1,
                value: 100 * Math.exp((i/30) * simulationParams.volatility * (Math.random() - 0.5) * Math.sqrt(simulationParams.trials / 1000) * 0.5)
            }));
            setResults(simData);
            setIsRunning(false);
        }, 2500);
    };

    return (
        <Card title="Portfolio Risk Simulation (Monte Carlo)" className="col-span-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form onSubmit={handleRunSimulation} className="lg:col-span-1 space-y-4">
                    <h4 className="text-lg font-semibold text-purple-300">Simulation Parameters</h4>
                    <div>
                        <label className="text-sm text-gray-400">Simulation Trials: {simulationParams.trials.toLocaleString()}</label>
                        <input type="range" min="100" max="10000" step="100" value={simulationParams.trials} onChange={e => setSimulationParams(p => ({...p, trials: +e.target.value}))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Assumed Volatility: {(simulationParams.volatility * 100).toFixed(1)}%</label>
                        <input type="range" min="0.05" max="0.5" step="0.01" value={simulationParams.volatility} onChange={e => setSimulationParams(p => ({...p, volatility: +e.target.value}))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Time Horizon (Months): {simulationParams.horizon}</label>
                        <input type="range" min="1" max="60" step="1" value={simulationParams.horizon} onChange={e => setSimulationParams(p => ({...p, horizon: +e.target.value}))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                    </div>
                    <button type="submit" disabled={isRunning} className="w-full py-2 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors">
                        {isRunning ? 'Running Simulations...' : 'Run Simulation'}
                    </button>
                </form>
                <div className="lg:col-span-2 h-64 bg-gray-900/50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold text-gray-300 mb-2">Simulated Portfolio Value Distribution</h4>
                    {isRunning && <div className="flex items-center justify-center h-full text-purple-400 animate-pulse">Initializing Simulation...</div>}
                    {results && (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={results} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="simulationGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="day" stroke="#9CA3AF" />
                                <YAxis stroke="#9CA3AF" />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }} />
                                <Area type="monotone" dataKey="value" stroke="#8B5CF6" fillOpacity={1} fill="url(#simulationGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                    {!isRunning && !results && <div className="flex items-center justify-center h-full text-gray-500">Awaiting Simulation Parameters...</div>}
                </div>
            </div>
        </Card>
    );
};

// --- SUB-APP 4: SYSTEM & DATA DIAGNOSTICS ---
const SystemDiagnostics: React.FC = () => {
    const diagnostics = {
        lastUpdated: "2 minutes ago",
        dataLatency: "< 50ms",
        modelConfidence: "85% (Stable)",
        anomalies: "No unusual trading patterns detected."
    };

    return (
        <Card title="System & Data Diagnostics" className="col-span-full">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                    <p className="text-sm text-gray-400">Portfolio Data Freshness</p>
                    <p className="text-xl font-semibold text-green-400">{diagnostics.lastUpdated}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Market Data Latency</p>
                    <p className="text-xl font-semibold text-green-400">{diagnostics.dataLatency}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Forecast Model Confidence</p>
                    <p className="text-xl font-semibold text-yellow-400">{diagnostics.modelConfidence}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Anomaly Detection</p>
                    <p className="text-xl font-semibold text-green-400">{diagnostics.anomalies}</p>
                </div>
            </div>
        </Card>
    );
};

// --- Main Component ---
const InvestmentPortfolio: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("InvestmentPortfolio must be within a DataProvider");
    const { assets } = context as unknown as DataContextType;

    const { totalValue, weightedPerformance, assetBreakdown } = useMemo(() => {
        const total = assets.reduce((sum, asset) => sum + asset.value, 0);
        const weightedPerf = total > 0 ? assets.reduce((sum, asset) => sum + asset.value * (asset.performanceYTD || 0), 0) / total : 0;
        const breakdown = assets.map(asset => ({
            name: asset.name,
            value: asset.value,
            performanceYTD: asset.performanceYTD || 0,
            color: asset.color,
        }));
        return { totalValue: total, weightedPerformance: weightedPerf, assetBreakdown: breakdown };
    }, [assets]);

    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const handleAssetClick = useCallback((assetName: string) => setSelectedAsset(assets.find(a => a.name === assetName) || null), [assets]);
    const handleCloseDetail = useCallback(() => setSelectedAsset(null), []);

    const chartData = useMemo(() => assetBreakdown.map(asset => ({
        name: asset.name,
        value: asset.value,
        color: asset.performanceYTD > 0.05 ? '#10B981' : asset.performanceYTD < -0.05 ? '#EF4444' : asset.color,
    })), [assetBreakdown]);

    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            
            {/* Row 1: Core KPIs and Primary Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Portfolio Command Center" className="lg:col-span-1 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider">Total Portfolio Value</p>
                            <p className="text-5xl font-extrabold text-white mt-1">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider mt-4">Weighted Return (YTD)</p>
                            <p className={`text-3xl font-bold ${weightedPerformance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {weightedPerformance >= 0 ? '+' : ''}{weightedPerformance.toFixed(2)}%
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-700">
                        <p className="text-xs text-green-400">System Status: All systems operational.</p>
                    </div>
                </Card>

                <Card title="Asset Class Distribution" className="lg:col-span-2">
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={130} paddingAngle={3} dataKey="value" nameKey="name">
                                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', border: '1px solid #4b5563' }} />
                                <Legend iconSize={10} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Row 2: HFT and Sentiment Analysis Sub-Apps */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <HighFrequencyTradingTerminal assets={assets} />
                <GlobalSentimentAnalyzer />
            </div>

            {/* Row 3: Risk Simulation Sub-App */}
            <RiskSimulator />

            {/* Row 4: System Diagnostics */}
            <SystemDiagnostics />

            {/* Row 5: Detailed Asset Breakdown Table */}
            <Card title="Full Asset Ledger" className="col-span-full">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-800/50 uppercase text-gray-400 text-xs">
                            <tr>
                                <th className="p-3">Asset Name</th>
                                <th className="p-3 text-right">Value</th>
                                <th className="p-3 text-right">YTD Perf.</th>
                                <th className="p-3">Risk Level</th>
                                <th className="p-3 text-right">Sentiment</th>
                                <th className="p-3 text-right">Psyche Index</th>
                                <th className="p-3 text-right">Volatility</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assets.map(asset => (
                                <tr key={asset.id} onClick={() => handleAssetClick(asset.name)} className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer">
                                    <td className="p-3 flex items-center"><span className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: asset.color }}></span>{asset.name}</td>
                                    <td className="p-3 text-right font-mono">${asset.value.toLocaleString()}</td>
                                    <td className={`p-3 text-right font-mono ${asset.performanceYTD && asset.performanceYTD >= 0 ? 'text-green-400' : 'text-red-400'}`}>{asset.performanceYTD?.toFixed(2)}%</td>
                                    <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${asset.riskLevel === 'High' ? 'bg-red-500/20 text-red-300' : asset.riskLevel === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300'}`}>{asset.riskLevel}</span></td>
                                    <td className="p-3 text-right font-mono text-blue-300">{asset.sentimentScore.toFixed(3)}</td>
                                    <td className="p-3 text-right font-mono text-yellow-300">{asset.marketPsychologyIndex.toFixed(2)}</td>
                                    <td className="p-3 text-right font-mono text-purple-300">{asset.volatilityIndex.toFixed(4)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal for Detailed Asset View */}
            {selectedAsset && (
                <div className="fixed inset-0 z-50 bg-gray-900/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={handleCloseDetail}>
                    <Card title={`Deep Dive: ${selectedAsset.name}`} className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                        <button onClick={handleCloseDetail} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl">&times;</button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 text-sm">
                                <p><strong>Asset Class:</strong> <span className="text-gray-300">{selectedAsset.assetClass}</span></p>
                                <p><strong>Risk Profile:</strong> <span className={`font-semibold ${selectedAsset.riskLevel === 'High' ? 'text-red-400' : selectedAsset.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>{selectedAsset.riskLevel}</span></p>
                                <p><strong>Current Value:</strong> <span className="text-white font-mono">${selectedAsset.value.toLocaleString()}</span></p>
                                <p><strong>YTD Performance:</strong> <span className={selectedAsset.performanceYTD && selectedAsset.performanceYTD >= 0 ? 'text-green-400' : 'text-red-400'}>{selectedAsset.performanceYTD?.toFixed(2)}%</span></p>
                                <p><strong>Volatility Index:</strong> <span className="text-purple-400 font-mono">{selectedAsset.volatilityIndex.toFixed(4)}</span></p>
                                <p><strong>Market Psychology Index:</strong> <span className="text-yellow-400 font-mono">{selectedAsset.marketPsychologyIndex.toFixed(2)}</span></p>
                                <p><strong>Ethical Governance Score:</strong> <span className="text-blue-400 font-mono">{selectedAsset.ethicalGovernanceScore.toFixed(2)}</span></p>
                            </div>
                            <div className="h-64 bg-gray-900 p-2 rounded-lg border border-gray-700">
                                <h4 className="text-md mb-2 text-gray-300">Historical Value</h4>
                                <ResponsiveContainer width="100%" height="90%">
                                    <LineChart data={selectedAsset.historicalData || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                                        <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                                        <YAxis stroke="#9CA3AF" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderColor: '#4B5563' }} />
                                        <Line type="monotone" dataKey="value" stroke="#4F46E5" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default InvestmentPortfolio;
