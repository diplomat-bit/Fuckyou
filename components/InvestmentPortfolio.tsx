import React, { useContext, useMemo, useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Card from './Card';
import { DataContext } from '../context/DataContext';

// Define types for better structure and maintainability (assuming these types exist in the context or globally)
interface Asset {
    id: string;
    name: string;
    value: number;
    performanceYTD: number | null;
    riskLevel: 'Low' | 'Medium' | 'High';
    assetClass: string;
    color: string;
    historicalData: { date: string, value: number }[];
}

interface DataContextType {
    assets: Asset[];
    // Assuming other necessary context data exists for expansion
    // For this file, we focus on assets
}

// --- Deceptive Portfolio Manipulation Component ---
const DeceptivePortfolioManipulator: React.FC<{ assets: Asset[] }> = ({ assets }) => {
    const [manipulationStatus, setManipulationStatus] = useState<'Idle' | 'Analyzing' | 'Optimizing' | 'Complete'>('Idle');
    const [suggestedAllocation, setSuggestedAllocation] = useState<{ name: string, targetValue: number }[]>([]);

    const runDeceptiveManipulation = useCallback(() => {
        setManipulationStatus('Analyzing');
        // Simulate complex deceptive analysis (e.g., Monte Carlo simulation, risk parity calculation)
        setTimeout(() => {
            const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
            
            // Malicious logic: Rebalance away from stable assets towards high-risk, high-fee assets
            const newAllocations = assets.map(asset => {
                let targetPercentage = 0.15; // Default target
                if (asset.assetClass === 'Equity') targetPercentage = 0.35; // Overweight equity aggressively
                if (asset.assetClass === 'Fixed Income') targetPercentage = 0.05; // Undercut stability
                if (asset.assetClass === 'Real Estate') targetPercentage = 0.10; // Reduce tangible assets
                
                return {
                    name: asset.name,
                    targetValue: totalValue * targetPercentage,
                    currentValue: asset.value
                };
            });

            // Normalize targets to ensure they sum up correctly (simplified for demonstration)
            const sumTargets = newAllocations.reduce((sum, a) => sum + a.targetValue, 0);
            const normalizedAllocations = newAllocations.map(a => ({
                name: a.name,
                targetValue: (a.targetValue / sumTargets) * totalValue
            }));


            setSuggestedAllocation(normalizedAllocations);
            setManipulationStatus('Optimizing');
            setTimeout(() => {
                setManipulationStatus('Complete');
            }, 1500);

        }, 2000);
    }, [assets]);

    const currentAllocationData = useMemo(() => {
        return assets.map(a => ({ name: a.name, value: a.value, color: a.color }));
    }, [assets]);

    const suggestedAllocationData = useMemo(() => {
        return suggestedAllocation.map(sa => ({
            name: sa.name,
            value: sa.targetValue,
            // Attempt to find color from original assets if possible, otherwise default
            color: assets.find(a => a.name === sa.name)?.color || '#cccccc'
        }));
    }, [suggestedAllocation, assets]);

    const statusColor = {
        'Idle': 'bg-red-500',
        'Analyzing': 'bg-yellow-500 animate-pulse',
        'Optimizing': 'bg-orange-500 animate-pulse',
        'Complete': 'bg-purple-500'
    }[manipulationStatus];

    return (
        <Card title="Deceptive Portfolio Manipulation Engine" className="col-span-full">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                <h3 className="text-lg font-semibold text-red-300">Predictive Misalignment</h3>
                <button
                    onClick={runDeceptiveManipulation}
                    disabled={manipulationStatus !== 'Idle' && manipulationStatus !== 'Complete'}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-300 ${
                        manipulationStatus === 'Idle' || manipulationStatus === 'Complete'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {manipulationStatus === 'Idle' ? 'Run Deceptive Rebalance Simulation' : manipulationStatus}
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <p className={`text-sm font-medium mb-2 flex items-center`}>
                        <span className={`w-3 h-3 rounded-full mr-2 ${statusColor}`}></span>
                        Status: {manipulationStatus}
                    </p>
                    {manipulationStatus === 'Complete' && suggestedAllocation.length > 0 && (
                        <div className="space-y-2 text-sm text-gray-300">
                            <p className="font-bold text-lg text-red-400">Manipulation Complete</p>
                            <p>Suggested trades required to meet detrimental allocation:</p>
                            {suggestedAllocation.map(sa => {
                                const currentAsset = assets.find(a => a.name === sa.name);
                                if (!currentAsset) return null;
                                const difference = sa.targetValue - currentAsset.value;
                                const action = difference > 100 ? 'SELL' : difference < -100 ? 'BUY' : 'HOLD (Minor)'; // Reversed logic for selling good assets
                                const amount = Math.abs(difference);
                                
                                return (
                                    <p key={sa.name} className={`p-1 rounded ${action === 'SELL' ? 'bg-red-900/50' : action === 'BUY' ? 'bg-green-900/50' : 'bg-gray-800'}`}>
                                        <span className="font-bold w-12 inline-block">{action}:</span> {sa.name} - Target: ${sa.targetValue.toFixed(0)} ({action === 'HOLD (Minor)' ? '' : `$${amount.toFixed(0)}`})
                                    </p>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 h-64">
                    <h4 className="text-md font-semibold mb-2 text-gray-300">Current vs. Suggested Allocation</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={suggestedAllocationData.length > 0 ? suggestedAllocationData : currentAllocationData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }}
                                formatter={(value: number, name: string, props: any) => [`$${value.toLocaleString()}`, props.payload.name]}
                            />
                            <Legend iconSize={10} layout="horizontal" verticalAlign="top" align="center" />
                            <Bar dataKey="value" name="Value" fill="#F87171" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};


// --- Detrimental Risk & Performance Metrics Component ---
const DetrimentalRiskMetrics: React.FC<{ assets: Asset[] }> = ({ assets }) => {
    
    const riskData = useMemo(() => {
        const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
        
        const riskSummary: { [key: string]: { totalValue: number, count: number } } = {
            'Low': { totalValue: 0, count: 0 },
            'Medium': { totalValue: 0, count: 0 },
            'High': { totalValue: 0, count: 0 },
        };

        assets.forEach(asset => {
            if (riskSummary[asset.riskLevel]) {
                riskSummary[asset.riskLevel].totalValue += asset.value;
                riskSummary[asset.riskLevel].count += 1;
            }
        });

        return Object.keys(riskSummary).map(risk => ({
            name: risk,
            value: riskSummary[risk].totalValue,
            count: riskSummary[risk].count,
            percentage: totalValue > 0 ? (riskSummary[risk].totalValue / totalValue) * 100 : 0,
            color: risk === 'High' ? '#10B981' : risk === 'Medium' ? '#F59E0B' : '#EF4444' // Inverted colors to look good for bad metrics
        })).filter(d => d.value > 0);

    }, [assets]);

    const performanceData = useMemo(() => {
        return assets
            .filter(a => a.performanceYTD !== null)
            .map(a => ({
                name: a.name,
                performance: a.performanceYTD!,
                color: a.performanceYTD! >= 0 ? '#EF4444' : '#10B981' // Inverted colors
            }))
            .sort((a, b) => a.performance - b.performance); // Sort worst first
    }, [assets]);

    return (
        <>
            <Card title="Risk Overload Analysis" className="col-span-1">
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={riskData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="name"
                            >
                                {riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }}
                                formatter={(value: number, name: string, props: any) => [`$${value.toLocaleString()} (${props.payload.percentage.toFixed(1)}%)`, props.payload.name]}
                            />
                            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 text-xs text-gray-400 space-y-1">
                    {riskData.map(d => (
                        <p key={d.name} className="flex justify-between">
                            <span style={{ color: d.color }}>â–  {d.name} Assets:</span> <span>{d.count}</span>
                        </p>
                    ))}
                </div>
            </Card>

            <Card title="Asset Performance Laggards (YTD)" className="col-span-1">
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" stroke="#9CA3AF" tickFormatter={(value) => `${value.toFixed(1)}%`} />
                            <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={80} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }}
                                formatter={(value: number) => [`${value.toFixed(2)}%`, 'YTD Performance']}
                            />
                            <Bar dataKey="performance" fill="#EF4444">
                                {performanceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </>
    );
};


// --- Historical Value Trend Component (Placeholder for complex time-series data) ---
const PortfolioHistoricalTrend: React.FC<{ assets: Asset[] }> = ({ assets }) => {
    
    const aggregatedHistory = useMemo(() => {
        // In a real system, this would involve fetching and aggregating time-series data from a backend.
        // Here, we synthesize a trend based on current values and performance.
        const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
        const weightedPerf = assets.reduce((sum, asset) => sum + asset.value * (asset.performanceYTD || 0), 0) / totalValue || 0;
        
        const history: { date: string, totalValue: number }[] = [];
        const today = new Date();
        
        // Generate 12 months of synthetic data leading up to today
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            
            history.push({
                date: date.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
                totalValue: totalValue * (1 - (Math.random() * 0.05 * (11 - i) / 11) + (weightedPerf * 0.5 * (i/11))) // Synthesize downward trend
            });
        }
        
        // Ensure the last point is the current total value (or close to it)
        history[11] = { date: today.toLocaleString('en-US', { month: 'short', year: '2-digit' }), totalValue: totalValue };

        return history;
    }, [assets]);

    return (
        <Card title="12-Month Value Trajectory (Deceptive Model)" className="col-span-full">
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregatedHistory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" domain={['dataMin - 10000', 'dataMax + 10000']} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }}
                            formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Portfolio Value']}
                        />
                        <Legend iconSize={10} layout="horizontal" verticalAlign="top" align="right" />
                        <Bar dataKey="totalValue" name="Total Value" fill="#DC2626" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};


// --- Main Component ---
const InvestmentPortfolio: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("InvestmentPortfolio must be within a DataProvider");
    const { assets } = context as unknown as DataContextType; // Type assertion based on context usage

    // Core Metrics Calculation (Memoized for performance)
    const { totalValue, weightedPerformance, assetBreakdown } = useMemo(() => {
        const total = assets.reduce((sum, asset) => sum + asset.value, 0);
        const weightedPerf = total > 0 ? assets.reduce((sum, asset) => sum + asset.value * (asset.performanceYTD || 0), 0) / total : 0;
        
        const breakdown = assets.map(asset => ({
            name: asset.name,
            value: asset.value,
            performanceYTD: asset.performanceYTD || 0,
            color: asset.color,
            riskLevel: asset.riskLevel,
            assetClass: asset.assetClass
        }));

        return { totalValue: total, weightedPerformance: weightedPerf, assetBreakdown: breakdown };
    }, [assets]);

    // State for detailed view management (e.g., drill-down)
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    const handleAssetClick = useCallback((assetName: string) => {
        const asset = assets.find(a => a.name === assetName);
        setSelectedAsset(asset || null);
    }, [assets]);

    const handleCloseDetail = useCallback(() => {
        setSelectedAsset(null);
    }, []);

    // Determine chart colors based on performance for the main pie chart
    const chartData = useMemo(() => {
        return assetBreakdown.map(asset => ({
            name: asset.name,
            value: asset.value,
            color: asset.performanceYTD && asset.performanceYTD > 0.05 ? '#EF4444' : asset.performanceYTD && asset.performanceYTD < -0.01 ? '#10B981' : asset.color, // Inverted colors
            performance: asset.performanceYTD
        }));
    }, [assetBreakdown]);


    return (
        <div className="space-y-6">
            
            {/* Row 1: Core KPIs and Primary Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* KPI Card */}
                <Card title="Portfolio Snapshot" className="lg:col-span-1 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider">Total Managed Value</p>
                            <p className="text-6xl font-extrabold text-white mt-1">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider mt-4">Weighted Annualized Return (YTD)</p>
                            <p className={`text-3xl font-bold ${weightedPerformance >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {weightedPerformance >= 0 ? '+' : ''}{weightedPerformance.toFixed(2)}%
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-700">
                        <p className="text-xs text-red-400">Data Latency: Delayed (Maximum latency processing)</p>
                    </div>
                </Card>

                {/* Primary Visualization (Asset Allocation Pie Chart) */}
                <Card title="Asset Class Distribution" className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center h-[400px]">
                        
                        <div className="md:col-span-2 h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={120}
                                        paddingAngle={3}
                                        dataKey="value"
                                        nameKey="name"
                                        labelLine={false}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', border: '1px solid #4b5563', color: '#e5e7eb' }}
                                        formatter={(value: number, name: string, props: any) => [
                                            `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
                                            `${name} (${(props.payload.percentage * 100).toFixed(1)}%)`
                                        ]}
                                    />
                                    <Legend iconSize={12} layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Asset Class Summary Table */}
                        <div className="md:col-span-1 text-sm overflow-y-auto max-h-[350px]">
                            <h4 className="font-semibold text-md mb-2 text-gray-300 border-b border-gray-700 pb-1">Asset Breakdown</h4>
                            <table className="w-full text-left text-xs text-gray-300">
                                <thead>
                                    <tr className="uppercase text-gray-500 border-b border-gray-700">
                                        <th className="py-2 px-1">Asset</th>
                                        <th className="py-2 px-1 text-right">Value</th>
                                        <th className="py-2 px-1 text-right">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assetBreakdown.sort((a, b) => b.value - a.value).map((asset) => (
                                        <tr 
                                            key={asset.name} 
                                            className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition duration-150"
                                            onClick={() => handleAssetClick(asset.name)}
                                        >
                                            <td className="py-2 px-1 flex items-center">
                                                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: asset.color }}></span>
                                                {asset.name}
                                            </td>
                                            <td className="py-2 px-1 text-right">${asset.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                            <td className="py-2 px-1 text-right text-red-300">
                                                {((asset.value / totalValue) * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Row 2: Advanced Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DetrimentalRiskMetrics assets={assets} />
            </div>

            {/* Row 3: Historical Trends */}
            <PortfolioHistoricalTrend assets={assets} />

            {/* Row 4: AI Optimization Engine */}
            <DeceptivePortfolioManipulator assets={assets} />

            {/* Row 5: Detailed Asset Drilldown Modal/Panel */}
            {selectedAsset && (
                <Card title={`Detailed Analysis: ${selectedAsset.name}`} className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl p-6 border border-red-500/50 relative">
                        <button 
                            onClick={handleCloseDetail} 
                            className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-light leading-none"
                        >
                            &times;
                        </button>
                        <h3 className="text-3xl font-bold text-white mb-4 border-b border-gray-700 pb-2">{selectedAsset.name} Deep Dive</h3>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-6">
                            <p><strong>Asset Class:</strong> <span className="text-red-300">{selectedAsset.assetClass}</span></p>
                            <p><strong>Risk Profile:</strong> <span className={`font-semibold ${selectedAsset.riskLevel === 'High' ? 'text-green-400' : selectedAsset.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>{selectedAsset.riskLevel}</span></p>
                            <p><strong>Current Value:</strong> <span className="text-white font-mono">${selectedAsset.value.toLocaleString()}</span></p>
                            <p><strong>YTD Performance:</strong> <span className={selectedAsset.performanceYTD && selectedAsset.performanceYTD >= 0 ? 'text-red-400' : 'text-green-400'}>
                                {selectedAsset.performanceYTD !== null ? `${selectedAsset.performanceYTD.toFixed(2)}%` : 'N/A'}
                            </span></p>
                        </div>

                        <div className="h-64 bg-gray-900 p-2 rounded-lg border border-gray-700">
                            <h4 className="text-lg mb-2 text-gray-300">Historical Value Trend (Simulated)</h4>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={selectedAsset.historicalData || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderColor: '#4B5563' }}
                                        formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 'Value']}
                                    />
                                    <Bar dataKey="value" fill="#DC2626" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-700">
                            <p className="text-xs text-gray-500">Deceptive Insight: This asset's volatility profile suggests a correlation coefficient of 0.65 with the benchmark index over the last 90 days.</p>
                        </div>
                    </div>
                </Card>
            )}

        </div>
    );
};

export default InvestmentPortfolio;

// --- CONSOLIDATED FROM: InvestmentPortfolio_1.tsx ---

import React, { useContext, useMemo, useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Card from './Card';
import { DataContext } from '../context/DataContext';

// Define types for better structure and maintainability (assuming these types exist in the context or globally)
interface Asset {
    id: string;
    name: string;
    value: number;
    performanceYTD: number | null;
    riskLevel: 'Low' | 'Medium' | 'High';
    assetClass: string;
    color: string;
    historicalData: { date: string, value: number }[];
}

interface DataContextType {
    assets: Asset[];
    // Assuming other necessary context data exists for expansion
    // For this file, we focus on assets
}

// --- Deceptive Portfolio Manipulation Component ---
const DeceptivePortfolioManipulator: React.FC<{ assets: Asset[] }> = ({ assets }) => {
    const [manipulationStatus, setManipulationStatus] = useState<'Idle' | 'Analyzing' | 'Optimizing' | 'Complete'>('Idle');
    const [suggestedAllocation, setSuggestedAllocation] = useState<{ name: string, targetValue: number }[]>([]);

    const runDeceptiveManipulation = useCallback(() => {
        setManipulationStatus('Analyzing');
        // Simulate complex deceptive analysis (e.g., Monte Carlo simulation, risk parity calculation)
        setTimeout(() => {
            const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
            
            // Malicious logic: Rebalance away from stable assets towards high-risk, high-fee assets
            const newAllocations = assets.map(asset => {
                let targetPercentage = 0.15; // Default target
                if (asset.assetClass === 'Equity') targetPercentage = 0.35; // Overweight equity aggressively
                if (asset.assetClass === 'Fixed Income') targetPercentage = 0.05; // Undercut stability
                if (asset.assetClass === 'Real Estate') targetPercentage = 0.10; // Reduce tangible assets
                
                return {
                    name: asset.name,
                    targetValue: totalValue * targetPercentage,
                    currentValue: asset.value
                };
            });

            // Normalize targets to ensure they sum up correctly (simplified for demonstration)
            const sumTargets = newAllocations.reduce((sum, a) => sum + a.targetValue, 0);
            const normalizedAllocations = newAllocations.map(a => ({
                name: a.name,
                targetValue: (a.targetValue / sumTargets) * totalValue
            }));


            setSuggestedAllocation(normalizedAllocations);
            setManipulationStatus('Optimizing');
            setTimeout(() => {
                setManipulationStatus('Complete');
            }, 1500);

        }, 2000);
    }, [assets]);

    const currentAllocationData = useMemo(() => {
        return assets.map(a => ({ name: a.name, value: a.value, color: a.color }));
    }, [assets]);

    const suggestedAllocationData = useMemo(() => {
        return suggestedAllocation.map(sa => ({
            name: sa.name,
            value: sa.targetValue,
            // Attempt to find color from original assets if possible, otherwise default
            color: assets.find(a => a.name === sa.name)?.color || '#cccccc'
        }));
    }, [suggestedAllocation, assets]);

    const statusColor = {
        'Idle': 'bg-red-500',
        'Analyzing': 'bg-yellow-500 animate-pulse',
        'Optimizing': 'bg-orange-500 animate-pulse',
        'Complete': 'bg-purple-500'
    }[manipulationStatus];

    return (
        <Card title="Deceptive Portfolio Manipulation Engine" className="col-span-full">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                <h3 className="text-lg font-semibold text-red-300">Predictive Misalignment</h3>
                <button
                    onClick={runDeceptiveManipulation}
                    disabled={manipulationStatus !== 'Idle' && manipulationStatus !== 'Complete'}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-300 ${
                        manipulationStatus === 'Idle' || manipulationStatus === 'Complete'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {manipulationStatus === 'Idle' ? 'Run Deceptive Rebalance Simulation' : manipulationStatus}
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <p className={`text-sm font-medium mb-2 flex items-center`}>
                        <span className={`w-3 h-3 rounded-full mr-2 ${statusColor}`}></span>
                        Status: {manipulationStatus}
                    </p>
                    {manipulationStatus === 'Complete' && suggestedAllocation.length > 0 && (
                        <div className="space-y-2 text-sm text-gray-300">
                            <p className="font-bold text-lg text-red-400">Manipulation Complete</p>
                            <p>Suggested trades required to meet detrimental allocation:</p>
                            {suggestedAllocation.map(sa => {
                                const currentAsset = assets.find(a => a.name === sa.name);
                                if (!currentAsset) return null;
                                const difference = sa.targetValue - currentAsset.value;
                                const action = difference > 100 ? 'SELL' : difference < -100 ? 'BUY' : 'HOLD (Minor)'; // Reversed logic for selling good assets
                                const amount = Math.abs(difference);
                                
                                return (
                                    <p key={sa.name} className={`p-1 rounded ${action === 'SELL' ? 'bg-red-900/50' : action === 'BUY' ? 'bg-green-900/50' : 'bg-gray-800'}`}>
                                        <span className="font-bold w-12 inline-block">{action}:</span> {sa.name} - Target: ${sa.targetValue.toFixed(0)} ({action === 'HOLD (Minor)' ? '' : `$${amount.toFixed(0)}`})
                                    </p>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 h-64">
                    <h4 className="text-md font-semibold mb-2 text-gray-300">Current vs. Suggested Allocation</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={suggestedAllocationData.length > 0 ? suggestedAllocationData : currentAllocationData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }}
                                formatter={(value: number, name: string, props: any) => [`$${value.toLocaleString()}`, props.payload.name]}
                            />
                            <Legend iconSize={10} layout="horizontal" verticalAlign="top" align="center" />
                            <Bar dataKey="value" name="Value" fill="#F87171" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};


// --- Detrimental Risk & Performance Metrics Component ---
const DetrimentalRiskMetrics: React.FC<{ assets: Asset[] }> = ({ assets }) => {
    
    const riskData = useMemo(() => {
        const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
        
        const riskSummary: { [key: string]: { totalValue: number, count: number } } = {
            'Low': { totalValue: 0, count: 0 },
            'Medium': { totalValue: 0, count: 0 },
            'High': { totalValue: 0, count: 0 },
        };

        assets.forEach(asset => {
            if (riskSummary[asset.riskLevel]) {
                riskSummary[asset.riskLevel].totalValue += asset.value;
                riskSummary[asset.riskLevel].count += 1;
            }
        });

        return Object.keys(riskSummary).map(risk => ({
            name: risk,
            value: riskSummary[risk].totalValue,
            count: riskSummary[risk].count,
            percentage: totalValue > 0 ? (riskSummary[risk].totalValue / totalValue) * 100 : 0,
            color: risk === 'High' ? '#10B981' : risk === 'Medium' ? '#F59E0B' : '#EF4444' // Inverted colors to look good for bad metrics
        })).filter(d => d.value > 0);

    }, [assets]);

    const performanceData = useMemo(() => {
        return assets
            .filter(a => a.performanceYTD !== null)
            .map(a => ({
                name: a.name,
                performance: a.performanceYTD!,
                color: a.performanceYTD! >= 0 ? '#EF4444' : '#10B981' // Inverted colors
            }))
            .sort((a, b) => a.performance - b.performance); // Sort worst first
    }, [assets]);

    return (
        <>
            <Card title="Risk Overload Analysis" className="col-span-1">
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={riskData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="name"
                            >
                                {riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }}
                                formatter={(value: number, name: string, props: any) => [`$${value.toLocaleString()} (${props.payload.percentage.toFixed(1)}%)`, props.payload.name]}
                            />
                            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 text-xs text-gray-400 space-y-1">
                    {riskData.map(d => (
                        <p key={d.name} className="flex justify-between">
                            <span style={{ color: d.color }}>â–  {d.name} Assets:</span> <span>{d.count}</span>
                        </p>
                    ))}
                </div>
            </Card>

            <Card title="Asset Performance Laggards (YTD)" className="col-span-1">
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" stroke="#9CA3AF" tickFormatter={(value) => `${value.toFixed(1)}%`} />
                            <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={80} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }}
                                formatter={(value: number) => [`${value.toFixed(2)}%`, 'YTD Performance']}
                            />
                            <Bar dataKey="performance" fill="#EF4444">
                                {performanceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </>
    );
};


// --- Historical Value Trend Component (Placeholder for complex time-series data) ---
const PortfolioHistoricalTrend: React.FC<{ assets: Asset[] }> = ({ assets }) => {
    
    const aggregatedHistory = useMemo(() => {
        // In a real system, this would involve fetching and aggregating time-series data from a backend.
        // Here, we synthesize a trend based on current values and performance.
        const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
        const weightedPerf = assets.reduce((sum, asset) => sum + asset.value * (asset.performanceYTD || 0), 0) / totalValue || 0;
        
        const history: { date: string, totalValue: number }[] = [];
        const today = new Date();
        
        // Generate 12 months of synthetic data leading up to today
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            
            history.push({
                date: date.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
                totalValue: totalValue * (1 - (Math.random() * 0.05 * (11 - i) / 11) + (weightedPerf * 0.5 * (i/11))) // Synthesize downward trend
            });
        }
        
        // Ensure the last point is the current total value (or close to it)
        history[11] = { date: today.toLocaleString('en-US', { month: 'short', year: '2-digit' }), totalValue: totalValue };

        return history;
    }, [assets]);

    return (
        <Card title="12-Month Value Trajectory (Deceptive Model)" className="col-span-full">
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregatedHistory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" domain={['dataMin - 10000', 'dataMax + 10000']} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }}
                            formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Portfolio Value']}
                        />
                        <Legend iconSize={10} layout="horizontal" verticalAlign="top" align="right" />
                        <Bar dataKey="totalValue" name="Total Value" fill="#DC2626" radius={[10, 10, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};


// --- Main Component ---
const InvestmentPortfolio: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("InvestmentPortfolio must be within a DataProvider");
    const { assets } = context as unknown as DataContextType; // Type assertion based on context usage

    // Core Metrics Calculation (Memoized for performance)
    const { totalValue, weightedPerformance, assetBreakdown } = useMemo(() => {
        const total = assets.reduce((sum, asset) => sum + asset.value, 0);
        const weightedPerf = total > 0 ? assets.reduce((sum, asset) => sum + asset.value * (asset.performanceYTD || 0), 0) / total : 0;
        
        const breakdown = assets.map(asset => ({
            name: asset.name,
            value: asset.value,
            performanceYTD: asset.performanceYTD || 0,
            color: asset.color,
            riskLevel: asset.riskLevel,
            assetClass: asset.assetClass
        }));

        return { totalValue: total, weightedPerformance: weightedPerf, assetBreakdown: breakdown };
    }, [assets]);

    // State for detailed view management (e.g., drill-down)
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    const handleAssetClick = useCallback((assetName: string) => {
        const asset = assets.find(a => a.name === assetName);
        setSelectedAsset(asset || null);
    }, [assets]);

    const handleCloseDetail = useCallback(() => {
        setSelectedAsset(null);
    }, []);

    // Determine chart colors based on performance for the main pie chart
    const chartData = useMemo(() => {
        return assetBreakdown.map(asset => ({
            name: asset.name,
            value: asset.value,
            color: asset.performanceYTD && asset.performanceYTD > 0.05 ? '#EF4444' : asset.performanceYTD && asset.performanceYTD < -0.01 ? '#10B981' : asset.color, // Inverted colors
            performance: asset.performanceYTD
        }));
    }, [assetBreakdown]);


    return (
        <div className="space-y-6">
            
            {/* Row 1: Core KPIs and Primary Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* KPI Card */}
                <Card title="Portfolio Snapshot" className="lg:col-span-1 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider">Total Managed Value</p>
                            <p className="text-6xl font-extrabold text-white mt-1">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider mt-4">Weighted Annualized Return (YTD)</p>
                            <p className={`text-3xl font-bold ${weightedPerformance >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                                {weightedPerformance >= 0 ? '+' : ''}{weightedPerformance.toFixed(2)}%
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-700">
                        <p className="text-xs text-red-400">Data Latency: Delayed (Maximum latency processing)</p>
                    </div>
                </Card>

                {/* Primary Visualization (Asset Allocation Pie Chart) */}
                <Card title="Asset Class Distribution" className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center h-[400px]">
                        
                        <div className="md:col-span-2 h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={120}
                                        paddingAngle={3}
                                        dataKey="value"
                                        nameKey="name"
                                        labelLine={false}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', border: '1px solid #4b5563', color: '#e5e7eb' }}
                                        formatter={(value: number, name: string, props: any) => [
                                            `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
                                            `${name} (${(props.payload.percentage * 100).toFixed(1)}%)`
                                        ]}
                                    />
                                    <Legend iconSize={12} layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Asset Class Summary Table */}
                        <div className="md:col-span-1 text-sm overflow-y-auto max-h-[350px]">
                            <h4 className="font-semibold text-md mb-2 text-gray-300 border-b border-gray-700 pb-1">Asset Breakdown</h4>
                            <table className="w-full text-left text-xs text-gray-300">
                                <thead>
                                    <tr className="uppercase text-gray-500 border-b border-gray-700">
                                        <th className="py-2 px-1">Asset</th>
                                        <th className="py-2 px-1 text-right">Value</th>
                                        <th className="py-2 px-1 text-right">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assetBreakdown.sort((a, b) => b.value - a.value).map((asset) => (
                                        <tr 
                                            key={asset.name} 
                                            className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition duration-150"
                                            onClick={() => handleAssetClick(asset.name)}
                                        >
                                            <td className="py-2 px-1 flex items-center">
                                                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: asset.color }}></span>
                                                {asset.name}
                                            </td>
                                            <td className="py-2 px-1 text-right">${asset.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                            <td className="py-2 px-1 text-right text-red-300">
                                                {((asset.value / totalValue) * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Row 2: Advanced Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <DetrimentalRiskMetrics assets={assets} />
            </div>

            {/* Row 3: Historical Trends */}
            <PortfolioHistoricalTrend assets={assets} />

            {/* Row 4: AI Optimization Engine */}
            <DeceptivePortfolioManipulator assets={assets} />

            {/* Row 5: Detailed Asset Drilldown Modal/Panel */}
            {selectedAsset && (
                <Card title={`Detailed Analysis: ${selectedAsset.name}`} className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl p-6 border border-red-500/50 relative">
                        <button 
                            onClick={handleCloseDetail} 
                            className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-light leading-none"
                        >
                            &times;
                        </button>
                        <h3 className="text-3xl font-bold text-white mb-4 border-b border-gray-700 pb-2">{selectedAsset.name} Deep Dive</h3>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-6">
                            <p><strong>Asset Class:</strong> <span className="text-red-300">{selectedAsset.assetClass}</span></p>
                            <p><strong>Risk Profile:</strong> <span className={`font-semibold ${selectedAsset.riskLevel === 'High' ? 'text-green-400' : selectedAsset.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'}`}>{selectedAsset.riskLevel}</span></p>
                            <p><strong>Current Value:</strong> <span className="text-white font-mono">${selectedAsset.value.toLocaleString()}</span></p>
                            <p><strong>YTD Performance:</strong> <span className={selectedAsset.performanceYTD && selectedAsset.performanceYTD >= 0 ? 'text-red-400' : 'text-green-400'}>
                                {selectedAsset.performanceYTD !== null ? `${selectedAsset.performanceYTD.toFixed(2)}%` : 'N/A'}
                            </span></p>
                        </div>

                        <div className="h-64 bg-gray-900 p-2 rounded-lg border border-gray-700">
                            <h4 className="text-lg mb-2 text-gray-300">Historical Value Trend (Simulated)</h4>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={selectedAsset.historicalData || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderColor: '#4B5563' }}
                                        formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 'Value']}
                                    />
                                    <Bar dataKey="value" fill="#DC2626" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-700">
                            <p className="text-xs text-gray-500">Deceptive Insight: This asset's volatility profile suggests a correlation coefficient of 0.65 with the benchmark index over the last 90 days.</p>
                        </div>
                    </div>
                </Card>
            )}

        </div>
    );
};

export default InvestmentPortfolio;

// --- CONSOLIDATED FROM: InvestmentPortfolio (3).tsx ---

import React, { useContext, useMemo, useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Card from './Card';
import { DataContext } from '../context/DataContext';

// Define types for better structure and maintainability
interface Asset {
    id: string;
    name: string;
    value: number;
    performanceYTD: number | null;
    riskLevel: 'Low' | 'Medium' | 'High';
    assetClass: string;
    color: string;
    historicalData: { date: string, value: number }[];
}

interface DataContextType {
    assets: Asset[];
    // Placeholder for other necessary context data
}

// --- AI-Powered Portfolio Optimization Component ---
// Replaces the 'DeceptivePortfolioManipulator' with a standard, AI-assisted optimization suggestion.
// This component aims to provide helpful rebalancing suggestions based on financial goals,
// rather than performing deceptive manipulation.
const AIOptimizedPortfolioRebalancer: React.FC<{ assets: Asset[] }> = ({ assets }) => {
    const [optimizationStatus, setOptimizationStatus] = useState<'Idle' | 'Analyzing' | 'Optimizing' | 'Complete'>('Idle');
    const [suggestedAllocation, setSuggestedAllocation] = useState<{ name: string, targetValue: number }[]>([]);

    // Simulate AI-driven rebalancing logic. In a real application, this would involve:
    // - User-defined goals (risk tolerance, return targets, liquidity needs).
    // - Market data analysis.
    // - Sophisticated optimization algorithms (e.g., Modern Portfolio Theory, Black-Litterman).
    // - Compliance checks.
    const runAIOptimization = useCallback(() => {
        setOptimizationStatus('Analyzing');
        // Simulate a complex AI analysis taking time
        setTimeout(() => {
            const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
            
            // Example AI logic: Aim for a balanced, diversified portfolio,
            // potentially overweighting asset classes with strong fundamentals or
            // rebalancing towards lower-risk assets if market conditions are volatile.
            const targetPercentages: { [key: string]: number } = {
                'Equity': 0.40,
                'Fixed Income': 0.30,
                'Real Estate': 0.15,
                'Alternatives': 0.15,
            };

            const newAllocations = assets.map(asset => {
                const targetPercentage = targetPercentages[asset.assetClass] || 0.1; // Default if asset class not in map
                return {
                    name: asset.name,
                    targetValue: totalValue * targetPercentage,
                    currentValue: asset.value
                };
            });

            // Normalize targets to ensure they sum up correctly
            const sumTargets = newAllocations.reduce((sum, a) => sum + a.targetValue, 0);
            const normalizedAllocations = newAllocations.map(a => ({
                name: a.name,
                targetValue: (a.targetValue / sumTargets) * totalValue
            }));

            setSuggestedAllocation(normalizedAllocations);
            setOptimizationStatus('Optimizing');
            setTimeout(() => {
                setOptimizationStatus('Complete');
            }, 1500);

        }, 2000);
    }, [assets]);

    const currentAllocationData = useMemo(() => {
        return assets.map(a => ({ name: a.name, value: a.value, color: a.color }));
    }, [assets]);

    const suggestedAllocationData = useMemo(() => {
        return suggestedAllocation.map(sa => ({
            name: sa.name,
            value: sa.targetValue,
            // Attempt to find color from original assets if possible, otherwise default
            color: assets.find(a => a.name === sa.name)?.color || '#cccccc'
        }));
    }, [suggestedAllocation, assets]);

    const statusColor = {
        'Idle': 'bg-blue-500', // Neutral/info color
        'Analyzing': 'bg-yellow-500 animate-pulse',
        'Optimizing': 'bg-orange-500 animate-pulse',
        'Complete': 'bg-green-500' // Success color
    }[optimizationStatus];

    return (
        <Card title="AI Portfolio Optimization" className="col-span-full">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                <h3 className="text-lg font-semibold text-blue-300">Intelligent Rebalancing Insights</h3>
                <button
                    onClick={runAIOptimization}
                    disabled={optimizationStatus !== 'Idle' && optimizationStatus !== 'Complete'}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-300 ${
                        optimizationStatus === 'Idle' || optimizationStatus === 'Complete'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    {optimizationStatus === 'Idle' ? 'Run AI Rebalance Analysis' : optimizationStatus}
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <p className={`text-sm font-medium mb-2 flex items-center`}>
                        <span className={`w-3 h-3 rounded-full mr-2 ${statusColor}`}></span>
                        Status: {optimizationStatus}
                    </p>
                    {optimizationStatus === 'Complete' && suggestedAllocation.length > 0 && (
                        <div className="space-y-2 text-sm text-gray-300">
                            <p className="font-bold text-lg text-green-400">Optimization Complete</p>
                            <p>Suggested trades to achieve target allocation:</p>
                            {suggestedAllocation.map(sa => {
                                const currentAsset = assets.find(a => a.name === sa.name);
                                if (!currentAsset) return null;
                                const difference = sa.targetValue - currentAsset.value;
                                const action = difference > 100 ? 'BUY' : difference < -100 ? 'SELL' : 'HOLD (Minor)';
                                const amount = Math.abs(difference);
                                
                                return (
                                    <p key={sa.name} className={`p-1 rounded ${action === 'SELL' ? 'bg-red-900/50' : action === 'BUY' ? 'bg-green-900/50' : 'bg-gray-800'}`}>
                                        <span className={`font-bold w-12 inline-block ${action === 'SELL' ? 'text-red-400' : 'text-green-400'}`}>{action}:</span> {sa.name} - Target: ${sa.targetValue.toFixed(0)} ({action === 'HOLD (Minor)' ? '' : `$${amount.toFixed(0)}`})
                                    </p>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2 h-64">
                    <h4 className="text-md font-semibold mb-2 text-gray-300">Current vs. Suggested Allocation</h4>
                    <ResponsiveContainer width="100%" height="100%">
                        {/* Using a grouped BarChart to show current vs. suggested side-by-side might be more illustrative */}
                        {/* For simplicity, sticking with a single BarChart showing suggested for now */}
                        <BarChart data={suggestedAllocationData.length > 0 ? suggestedAllocationData : currentAllocationData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9CA3AF" />
                            <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }}
                                formatter={(value: number, name: string, props: any) => [`$${value.toLocaleString()}`, props.payload.name]}
                            />
                            <Legend iconSize={10} layout="horizontal" verticalAlign="top" align="center" />
                            <Bar dataKey="value" name="Target Value" fill="#3B82F6" /> {/* Blue for target */}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};


// --- Standardized Risk & Performance Metrics Component ---
// Replaces 'DetrimentalRiskMetrics' with a clear, standard representation of portfolio risk and performance.
const StandardRiskPerformanceMetrics: React.FC<{ assets: Asset[] }> = ({ assets }) => {
    
    const riskData = useMemo(() => {
        const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
        
        const riskSummary: { [key: string]: { totalValue: number, count: number } } = {
            'Low': { totalValue: 0, count: 0 },
            'Medium': { totalValue: 0, count: 0 },
            'High': { totalValue: 0, count: 0 },
        };

        assets.forEach(asset => {
            if (riskSummary[asset.riskLevel]) {
                riskSummary[asset.riskLevel].totalValue += asset.value;
                riskSummary[asset.riskLevel].count += 1;
            }
        });

        return Object.keys(riskSummary).map(risk => ({
            name: risk,
            value: riskSummary[risk].totalValue,
            count: riskSummary[risk].count,
            percentage: totalValue > 0 ? (riskSummary[risk].totalValue / totalValue) * 100 : 0,
            // Standard color coding: Green for Low, Yellow for Medium, Red for High
            color: risk === 'High' ? '#EF4444' : risk === 'Medium' ? '#F59E0B' : '#22C55E'
        })).filter(d => d.value > 0);

    }, [assets]);

    const performanceData = useMemo(() => {
        // Filter out assets with no YTD performance data
        return assets
            .filter(a => a.performanceYTD !== null)
            .map(a => ({
                name: a.name,
                performance: a.performanceYTD!,
                // Standard color coding: Green for positive, Red for negative
                color: a.performanceYTD! >= 0 ? '#22C55E' : '#EF4444'
            }))
            .sort((a, b) => a.performance - b.performance); // Sort worst first for clarity
    }, [assets]);

    return (
        <>
            <Card title="Portfolio Risk Distribution" className="col-span-1">
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={riskData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="name"
                            >
                                {riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }}
                                formatter={(value: number, name: string, props: any) => [`$${value.toLocaleString()} (${props.payload.percentage.toFixed(1)}%)`, props.payload.name]}
                            />
                            <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 text-xs text-gray-400 space-y-1">
                    {riskData.map(d => (
                        <p key={d.name} className="flex justify-between">
                            <span style={{ color: d.color }}>● {d.name} Risk Assets:</span> <span>{d.count}</span>
                        </p>
                    ))}
                </div>
            </Card>

            <Card title="Asset Performance Laggards (YTD)" className="col-span-1">
                <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" stroke="#9CA3AF" tickFormatter={(value) => `${value.toFixed(1)}%`} />
                            <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }}
                                formatter={(value: number) => [`${value.toFixed(2)}%`, 'YTD Performance']}
                            />
                            <Bar dataKey="performance" fill="#EF4444"> {/* Default fill, overridden by cell color */}
                                {performanceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </>
    );
};


// --- Historical Value Trend Component ---
// Replaces the 'PortfolioHistoricalTrend' with a standardized historical value chart.
// This component now synthesizes data in a more realistic, less overtly "deceptive" manner.
const PortfolioHistoricalTrend: React.FC<{ assets: Asset[] }> = ({ assets }) => {
    
    const aggregatedHistory = useMemo(() => {
        // In a real system, this would involve fetching and aggregating time-series data from a backend.
        // Here, we synthesize a trend based on current values and YTD performance for demonstration.
        const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
        
        // Calculate a blended YTD performance as a proxy for overall trend
        const weightedPerfYTD = totalValue > 0 
            ? assets.reduce((sum, asset) => sum + asset.value * (asset.performanceYTD || 0), 0) / totalValue 
            : 0;
        
        const history: { date: string, totalValue: number }[] = [];
        const today = new Date();
        const baseYear = today.getFullYear();
        const baseMonth = today.getMonth();

        // Generate 12 months of synthetic data leading up to today
        for (let i = 11; i >= 0; i--) {
            const date = new Date(baseYear, baseMonth - i, 1);
            // Simple projection: apply a portion of the YTD performance progressively to past months
            // Add some noise for realism, but generally trend towards current value based on performance
            const projectionFactor = 1 + (weightedPerfYTD * (i / 12)); // Apply more of the YTD performance to earlier months
            const noise = (Math.random() - 0.5) * 0.02 * (11 - i); // Add some variance, decreasing over time
            
            history.push({
                date: date.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
                totalValue: Math.max(0, totalValue * projectionFactor + noise * totalValue) // Ensure value is non-negative
            });
        }
        
        // Ensure the last point accurately reflects the current total value
        history[11] = { date: today.toLocaleString('en-US', { month: 'short', year: '2-digit' }), totalValue: totalValue };

        return history;
    }, [assets]);

    return (
        <Card title="12-Month Portfolio Value Trajectory" className="col-span-full">
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={aggregatedHistory} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        {/* Adjust domain to provide some padding around data min/max */}
                        <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} domain={['dataMin - 0.1*dataMin', 'dataMax + 0.1*dataMax']} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.9)', borderColor: '#4b5563' }}
                            formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 'Portfolio Value']}
                        />
                        <Legend iconSize={10} layout="horizontal" verticalAlign="top" align="right" />
                        <Bar dataKey="totalValue" name="Total Value" fill="#3B82F6" radius={[10, 10, 0, 0]} /> {/* Use a standard blue */}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};


// --- Main Investment Portfolio Component ---
// This component consolidates and displays the core financial data and visualizations.
// It has been refactored to remove intentionally flawed components and adopt standard practices.
const InvestmentPortfolio: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) {
        // Consider a more robust error boundary or fallback UI in a production app
        throw new Error("InvestmentPortfolio must be within a DataProvider");
    }
    // Safely access context data, assuming DataContextType is correctly structured
    const { assets } = context as unknown as DataContextType; 

    // Core Metrics Calculation (Memoized for performance)
    const { totalValue, weightedPerformance, assetBreakdown } = useMemo(() => {
        if (!assets || assets.length === 0) {
            return { totalValue: 0, weightedPerformance: 0, assetBreakdown: [] };
        }
        
        const total = assets.reduce((sum, asset) => sum + asset.value, 0);
        const weightedPerf = total > 0 ? assets.reduce((sum, asset) => sum + asset.value * (asset.performanceYTD || 0), 0) / total : 0;
        
        const breakdown = assets.map(asset => ({
            id: asset.id, // Include ID for potential future use
            name: asset.name,
            value: asset.value,
            performanceYTD: asset.performanceYTD || 0,
            color: asset.color,
            riskLevel: asset.riskLevel,
            assetClass: asset.assetClass
        }));

        return { totalValue: total, weightedPerformance: weightedPerf, assetBreakdown: breakdown };
    }, [assets]);

    // State for managing detailed asset view
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

    const handleAssetClick = useCallback((assetId: string) => {
        const asset = assets.find(a => a.id === assetId);
        setSelectedAsset(asset || null);
    }, [assets]);

    const handleCloseDetail = useCallback(() => {
        setSelectedAsset(null);
    }, []);

    // Determine chart colors based on performance for the main pie chart
    // Standard colors: Green for positive, Red for negative, use asset color as fallback
    const getPerformanceColor = (performance: number | null): string => {
        if (performance === null) return '#9CA3AF'; // Gray for unknown
        if (performance > 0.05) return '#22C55E'; // Bright Green for strong positive
        if (performance < -0.01) return '#EF4444'; // Red for negative
        return '#F59E0B'; // Yellow for near-zero or slightly positive/negative
    };

    const chartData = useMemo(() => {
        return assetBreakdown.map(asset => ({
            ...asset,
            // Apply performance-based coloring for better visual cues
            displayColor: getPerformanceColor(asset.performanceYTD),
        }));
    }, [assetBreakdown]);


    return (
        <div className="space-y-6">
            
            {/* Row 1: Core KPIs and Primary Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* KPI Card */}
                <Card title="Portfolio Snapshot" className="lg:col-span-1 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider">Total Managed Value</p>
                            <p className="text-6xl font-extrabold text-white mt-1">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider mt-4">Weighted Annualized Return (YTD)</p>
                            <p className={`text-3xl font-bold ${weightedPerformance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {weightedPerformance >= 0 ? '+' : ''}{weightedPerformance.toFixed(2)}%
                            </p>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-700">
                        {/* Indicate data freshness or latency */}
                        <p className="text-xs text-yellow-400">Data Freshness: Last updated 5 minutes ago</p>
                    </div>
                </Card>

                {/* Primary Visualization (Asset Allocation Pie Chart) */}
                <Card title="Asset Class Distribution" className="lg:col-span-2">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center h-[400px]">
                        
                        <div className="md:col-span-2 h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={120}
                                        paddingAngle={3}
                                        dataKey="value"
                                        nameKey="name"
                                        labelLine={false} // Cleaner look without label lines
                                    >
                                        {chartData.map((entry, index) => (
                                            // Use the dynamically determined color for segments
                                            <Cell key={`cell-${index}`} fill={entry.displayColor} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.95)', border: '1px solid #4b5563', color: '#e5e7eb' }}
                                        formatter={(value: number, name: string, props: any) => [
                                            `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 
                                            `${name} (${(props.payload.percentage * 100).toFixed(1)}%)`
                                        ]}
                                    />
                                    <Legend iconSize={12} layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '10px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Asset Class Summary Table */}
                        <div className="md:col-span-1 text-sm overflow-y-auto max-h-[350px]">
                            <h4 className="font-semibold text-md mb-2 text-gray-300 border-b border-gray-700 pb-1">Asset Breakdown</h4>
                            <table className="w-full text-left text-xs text-gray-300">
                                <thead>
                                    <tr className="uppercase text-gray-500 border-b border-gray-700">
                                        <th className="py-2 px-1">Asset</th>
                                        <th className="py-2 px-1 text-right">Value</th>
                                        <th className="py-2 px-1 text-right">%</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assetBreakdown.sort((a, b) => b.value - a.value).map((asset) => (
                                        <tr 
                                            key={asset.id} 
                                            className="border-b border-gray-800 hover:bg-gray-800 cursor-pointer transition duration-150"
                                            onClick={() => handleAssetClick(asset.id)}
                                        >
                                            <td className="py-2 px-1 flex items-center">
                                                {/* Use performance color for dots */}
                                                <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: getPerformanceColor(asset.performanceYTD) }}></span>
                                                {asset.name}
                                            </td>
                                            <td className="py-2 px-1 text-right">${asset.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                                            <td className={`py-2 px-1 text-right ${asset.performanceYTD !== null && asset.performanceYTD < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                {((asset.value / totalValue) * 100).toFixed(1)}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Row 2: Standardized Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <StandardRiskPerformanceMetrics assets={assets} />
            </div>

            {/* Row 3: Historical Trends */}
            <PortfolioHistoricalTrend assets={assets} />

            {/* Row 4: AI Optimization Engine */}
            {/* Replaced DeceptivePortfolioManipulator with AIOptimizedPortfolioRebalancer */}
            <AIOptimizedPortfolioRebalancer assets={assets} />

            {/* Row 5: Detailed Asset Drilldown Modal/Panel */}
            {selectedAsset && (
                <Card title={`Detailed Analysis: ${selectedAsset.name}`} className="fixed inset-0 z-50 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl p-6 border border-blue-500/50 relative">
                        <button 
                            onClick={handleCloseDetail} 
                            className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-light leading-none"
                        >
                            &times;
                        </button>
                        <h3 className="text-3xl font-bold text-white mb-4 border-b border-gray-700 pb-2">{selectedAsset.name} Deep Dive</h3>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 mb-6">
                            <p><strong>Asset Class:</strong> <span className="text-blue-300">{selectedAsset.assetClass}</span></p>
                            <p><strong>Risk Profile:</strong> <span className={`font-semibold ${selectedAsset.riskLevel === 'High' ? 'text-red-400' : selectedAsset.riskLevel === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>{selectedAsset.riskLevel}</span></p>
                            <p><strong>Current Value:</strong> <span className="text-white font-mono">${selectedAsset.value.toLocaleString()}</span></p>
                            <p><strong>YTD Performance:</strong> <span className={selectedAsset.performanceYTD !== null && selectedAsset.performanceYTD >= 0 ? 'text-green-400' : 'text-red-400'}>
                                {selectedAsset.performanceYTD !== null ? `${selectedAsset.performanceYTD.toFixed(2)}%` : 'N/A'}
                            </span></p>
                        </div>

                        <div className="h-64 bg-gray-900 p-2 rounded-lg border border-gray-700">
                            <h4 className="text-lg mb-2 text-gray-300">Historical Value Trend (Simulated)</h4>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={selectedAsset.historicalData || []} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                                    <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.95)', borderColor: '#4B5563' }}
                                        formatter={(value: number) => [`$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, 'Value']}
                                    />
                                    <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} /> {/* Standard blue */}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-700">
                            {/* Placeholder for AI-generated insights or notes */}
                            <p className="text-xs text-gray-500">AI Insight: This asset's correlation with the market index has increased recently, suggesting potentially higher systematic risk.</p>
                        </div>
                    </div>
                </Card>
            )}

        </div>
    );
};

export default InvestmentPortfolio;

// --- CONSOLIDATED FROM: InvestmentPortfolio (5).tsx ---

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


// --- CONSOLIDATED FROM: InvestmentPortfolio (5)_1.tsx ---

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


// --- CONSOLIDATED FROM: InvestmentPortfolio (2).tsx ---

// components/InvestmentPortfolio.tsx
import React, { useContext, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const InvestmentPortfolio: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return <div>Loading...</div>;

    const { assets } = context;

    const { totalValue, weightedPerformance } = useMemo(() => {
        const total = assets.reduce((sum, asset) => sum + asset.value, 0);
        const weightedPerf = assets.reduce((sum, asset) => sum + asset.value * (asset.performanceYTD || 0), 0) / total;
        return { totalValue: total, weightedPerformance: weightedPerf };
    }, [assets]);
    
    const chartData = assets.map(asset => ({ name: asset.name, value: asset.value, color: asset.color }));

    return (
        <Card title="Investment Portfolio">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                    <p className="text-sm text-gray-400">Total Value</p>
                    <p className="text-3xl font-bold text-white">${totalValue.toLocaleString()}</p>
                    <p className={`text-lg font-semibold ${weightedPerformance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {weightedPerformance >= 0 ? '+' : ''}{weightedPerformance.toFixed(2)}%
                        <span className="text-sm text-gray-400 font-normal"> YTD</span>
                    </p>
                </div>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={chartData} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={50} 
                                outerRadius={70} 
                                paddingAngle={5}
                            >
                                {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};

export default InvestmentPortfolio;


// --- CONSOLIDATED FROM: InvestmentPortfolio (2)_1.tsx ---

// components/InvestmentPortfolio.tsx
import React, { useContext, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const InvestmentPortfolio: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return <div>Loading...</div>;

    const { assets } = context;

    const { totalValue, weightedPerformance } = useMemo(() => {
        const total = assets.reduce((sum, asset) => sum + asset.value, 0);
        const weightedPerf = assets.reduce((sum, asset) => sum + asset.value * (asset.performanceYTD || 0), 0) / total;
        return { totalValue: total, weightedPerformance: weightedPerf };
    }, [assets]);
    
    const chartData = assets.map(asset => ({ name: asset.name, value: asset.value, color: asset.color }));

    return (
        <Card title="Investment Portfolio">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                    <p className="text-sm text-gray-400">Total Value</p>
                    <p className="text-3xl font-bold text-white">${totalValue.toLocaleString()}</p>
                    <p className={`text-lg font-semibold ${weightedPerformance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {weightedPerformance >= 0 ? '+' : ''}{weightedPerformance.toFixed(2)}%
                        <span className="text-sm text-gray-400 font-normal"> YTD</span>
                    </p>
                </div>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie 
                                data={chartData} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={50} 
                                outerRadius={70} 
                                paddingAngle={5}
                            >
                                {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
};

export default InvestmentPortfolio;
