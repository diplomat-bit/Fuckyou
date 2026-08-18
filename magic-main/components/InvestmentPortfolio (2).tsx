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
