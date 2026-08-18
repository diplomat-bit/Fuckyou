import React, { useState, useEffect } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';

interface DynamicKpiLoaderProps {
  kpiId: string;
}

const DynamicKpiLoader: React.FC<DynamicKpiLoaderProps> = ({ kpiId }) => {
    const [data, setData] = useState<any[]>([]);
    const [kpiLoading, setKpiLoading] = useState(true);
    const [kpiError, setKpiError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setKpiLoading(true);
            setKpiError(null);
            // Simulate fetching data from the dynamically created backend endpoint for this specific KPI
            setTimeout(() => {
                try {
                    // This mock data is structured to fulfill the request from the conceptual prompt:
                    // "Show me the trend of my discretionary spending compared to my income growth..."
                    const mockData = Array.from({ length: 12 }, (_, i) => {
                        const monthDate = new Date(2024, i, 1);
                        const month = monthDate.toLocaleString('default', { month: 'short' });
                        const income = 5000 + (i * 150) + (Math.random() * 500);
                        const discretionarySpending = (income * (0.4 + Math.random() * 0.3));
                        const incomeGrowth = i > 0 ? ((income / (5000 + ((i-1) * 150))) - 1) * 100 : 0;
                        return {
                            month,
                            income: parseFloat(income.toFixed(2)),
                            discretionarySpending: parseFloat(discretionarySpending.toFixed(2)),
                            incomeGrowth: parseFloat(incomeGrowth.toFixed(2)),
                            spendingExceededThreshold: (discretionarySpending / income) > 0.6,
                        };
                    });
                    setData(mockData);
                } catch (err: any) {
                    setKpiError(err.message);
                } finally {
                    setKpiLoading(false);
                }
            }, 1500);
        };
        fetchData();
    }, [kpiId]);

    if (kpiLoading) return <div className="text-gray-400 p-4 text-center">Loading AI-generated KPI...</div>;
    if (kpiError) return <div className="text-red-400 p-4 text-center">Error loading KPI: {kpiError}</div>;
    if (data.length === 0) return <div className="text-gray-400 p-4 text-center">No data available for this KPI.</div>;

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tickFormatter={(value: number) => `$${(value/1000).toFixed(1)}k`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} tickFormatter={(value: number) => `${value.toFixed(0)}%`} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: '#e5e7eb' }} />
                    <defs>
                        <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    
                    {data.map((entry, index) => entry.spendingExceededThreshold && (
                        <ReferenceArea key={`highlight-${index}`} yAxisId="left" x1={entry.month} x2={data[index + 1]?.month || entry.month}  fill="#ef4444" fillOpacity={0.2} />
                    ))}

                    <Area yAxisId="left" type="monotone" dataKey="income" stroke="#10b981" fillOpacity={1} fill="url(#incomeGradient)" name="Income" />
                    <Line yAxisId="left" type="monotone" dataKey="discretionarySpending" stroke="#0ea5e9" name="Discretionary Spending" />
                    <Line yAxisId="right" type="monotone" dataKey="incomeGrowth" stroke="#f97316" name="Income Growth (%)" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DynamicKpiLoader;
