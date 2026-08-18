// components/views/megadashboard/business/SalesPipelineView.tsx
import React, { useContext, useMemo, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { FunnelChart, Funnel, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import type { SalesDeal } from '../../../../types';

const SalesPipelineView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("SalesPipelineView must be within DataProvider");
    
    const { salesDeals } = context;
    const [selectedDeal, setSelectedDeal] = useState<SalesDeal | null>(null);
    const [aiProbability, setAiProbability] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const pipelineData = useMemo(() => {
        const stages = { Prospecting: 0, Qualification: 0, Proposal: 0, 'Closed Won': 0 };
        salesDeals.forEach(deal => {
            if(deal.stage in stages) stages[deal.stage]++;
        });
        return [
            { value: stages.Prospecting, name: 'Prospecting', fill: '#06b6d4' },
            { value: stages.Qualification, name: 'Qualification', fill: '#3b82f6' },
            { value: stages.Proposal, name: 'Proposal', fill: '#8b5cf6' },
            { value: stages['Closed Won'], name: 'Won', fill: '#10b981' },
        ];
    }, [salesDeals]);

    const kpiData = useMemo(() => ({
        pipelineValue: salesDeals.reduce((sum, d) => d.status !== 'Closed Won' ? sum + d.value : sum, 0),
        winRate: (salesDeals.filter(d => d.status === 'Closed Won').length / salesDeals.length) * 100,
        avgDealSize: salesDeals.reduce((sum, d) => sum + d.value, 0) / salesDeals.length,
    }), [salesDeals]);

    const getAiProbability = async (deal: SalesDeal) => {
        setSelectedDeal(deal);
        setIsLoading(true);
        setAiProbability(null);
        try {
            const response = await fetch('https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io/ai/advisor/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Based on this deal (Value: $${deal.value}, Stage: ${deal.stage}), estimate the probability to close as a percentage. Respond with only the number.`,
                    sessionId: 'session-sales-pipeline-123'
                })
            });
            const data = await response.json();
            setAiProbability(parseFloat(data.text));
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Sales Pipeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">${(kpiData.pipelineValue / 1000).toFixed(0)}k</p><p className="text-sm text-gray-400 mt-1">Pipeline Value</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">{kpiData.winRate.toFixed(1)}%</p><p className="text-sm text-gray-400 mt-1">Win Rate</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">${(kpiData.avgDealSize / 1000).toFixed(0)}k</p><p className="text-sm text-gray-400 mt-1">Avg. Deal Size</p></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Sales Funnel">
                    <ResponsiveContainer width="100%" height={300}>
                        <FunnelChart><Tooltip /><Funnel dataKey="value" data={pipelineData} isAnimationActive><LabelList position="right" fill="#fff" stroke="none" dataKey="name" /></Funnel></FunnelChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Top Deals">
                    <div className="space-y-2">
                        {salesDeals.slice(0, 5).map(deal => (
                            <div key={deal.id} className="p-2 bg-gray-800/50 rounded-lg flex justify-between items-center">
                                <div><p className="font-semibold text-white">{deal.name}</p><p className="text-xs text-gray-400">{deal.stage} - ${deal.value.toLocaleString()}</p></div>
                                <button onClick={() => getAiProbability(deal)} className="text-xs text-cyan-400 hover:underline">AI Probability</button>
                            </div>
                        ))}
                    </div>
                     {selectedDeal && <div className="mt-4 p-2 bg-gray-900/50 rounded text-center"><p className="text-sm">AI Probability for {selectedDeal.name}: <strong className="text-cyan-300">{isLoading ? '...' : `${aiProbability}%`}</strong></p></div>}
                </Card>
            </div>
        </div>
    );
};

export default SalesPipelineView;