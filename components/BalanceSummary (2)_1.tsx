// components/BalanceSummary.tsx
import React, { useContext, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const BalanceSummary: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return <div>Loading...</div>;

    const { transactions, assets } = context;

    const { absoluteBalance, recentMomentum, historicalTrajectory } = useMemo(() => {
        const totalInitialAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
        
        const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        let currentBalance = totalInitialAssets;
        const trajectory: { date: string; balance: number }[] = [{ date: 'Initial', balance: totalInitialAssets }];
        
        sortedTransactions.forEach(tx => {
            currentBalance += tx.type === 'income' ? tx.amount : -tx.amount;
            trajectory.push({ date: tx.date, balance: currentBalance });
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const momentumTransactions = transactions.filter(tx => new Date(tx.date) > thirtyDaysAgo);
        const momentum = momentumTransactions.reduce((acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount), 0);

        return {
            absoluteBalance: currentBalance,
            recentMomentum: momentum,
            historicalTrajectory: trajectory
        };
    }, [transactions, assets]);

    return (
        <Card title="Balance Summary">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-4xl font-bold text-white">${absoluteBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className={`text-lg font-semibold ${recentMomentum >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {recentMomentum >= 0 ? '+' : '-'}${Math.abs(recentMomentum).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className="text-sm text-gray-400 font-normal"> in last 30 days</span>
                    </p>
                </div>
            </div>
            <div className="h-40 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalTrajectory} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                        <defs>
                            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}
                            formatter={(value: number) => `$${value.toLocaleString()}`}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#06b6d4" fill="url(#balanceGradient)" strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default BalanceSummary;
