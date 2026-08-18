// components/WealthTimeline.tsx
import React, { useContext, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip } from 'recharts';

const WealthTimeline: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return <div>Loading...</div>;

    const { transactions, assets } = context;

    const timelineData = useMemo(() => {
        const initialValue = assets.reduce((sum, asset) => sum + asset.value, 0);
        const balances: { [key: string]: number } = {};

        [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(tx => {
            balances[tx.date] = (balances[tx.date] || (Object.keys(balances).length > 0 ? Object.values(balances).pop()! : initialValue)) + (tx.type === 'income' ? tx.amount : -tx.amount);
        });

        const history = Object.entries(balances).map(([date, balance]) => ({ name: date, history: balance }));
        if (history.length === 0) return [];
        
        const last30DaysTx = transactions.filter(tx => new Date(tx.date) > new Date(new Date().setDate(new Date().getDate() - 30)));
        const monthlyVelocity = last30DaysTx.reduce((acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount), 0);
        
        const lastBalance = history[history.length - 1].history;
        const projection = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() + i + 1);
            return {
                name: date.toLocaleString('default', { month: 'short' }),
                projection: lastBalance + (monthlyVelocity * (i + 1))
            };
        });

        return [...history, ...projection];
    }, [transactions, assets]);

    return (
        <Card title="Wealth Timeline">
             <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={timelineData}>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
                        <YAxis stroke="#9ca3af" fontSize={10} tickFormatter={(tick) => `$${(tick/1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <defs>
                             <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="history" name="History" stroke="#8b5cf6" fill="url(#historyGradient)" />
                        <Line type="monotone" dataKey="projection" name="Projection" stroke="#16a34a" strokeDasharray="5 5" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default WealthTimeline;
