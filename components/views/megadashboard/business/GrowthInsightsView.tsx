// components/views/megadashboard/business/GrowthInsightsView.tsx
import React, { useContext, useMemo, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { GoogleGenAI } from "@google/genai";

const GrowthInsightsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("GrowthInsightsView must be within DataProvider");
    
    const { growthMetrics } = context; // Placeholder, using static data for now
    const [aiSummary, setAiSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const chartData = [ { month: 'Jan', mau: 12000 }, { month: 'Feb', mau: 12500 }, { month: 'Mar', mau: 14000 }, { month: 'Apr', mau: 15500 }, { month: 'May', mau: 18000 }, { month: 'Jun', mau: 21000 }];

    const handleGenerateSummary = async () => {
        setIsLoading(true); setAiSummary('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const prompt = `Summarize the key takeaways from this user growth data: ${JSON.stringify(chartData)}. Highlight the trend and any potential inflection points.`;
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            setAiSummary(response.text);
        } catch(err) { console.error(err); } finally { setIsLoading(false); }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Growth Insights</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">21,000</p><p className="text-sm text-gray-400 mt-1">Monthly Active Users</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-red-400">2.1%</p><p className="text-sm text-gray-400 mt-1">Monthly Churn</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">$125</p><p className="text-sm text-gray-400 mt-1">LTV</p></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card title="Monthly Active User Growth">
                        <ResponsiveContainer width="100%" height={300}>
                             <AreaChart data={chartData}><XAxis dataKey="month" stroke="#9ca3af" /><YAxis stroke="#9ca3af" /><Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/><Area type="monotone" dataKey="mau" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} /></AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
                <Card title="AI Trend Summary">
                    <div className="flex flex-col justify-between h-full">
                        <div className="min-h-[10rem] text-sm text-gray-300 italic">{isLoading ? 'Analyzing...' : aiSummary}</div>
                        <button onClick={handleGenerateSummary} disabled={isLoading} className="w-full py-2 bg-cyan-600/50 hover:bg-cyan-600 rounded disabled:opacity-50">{isLoading ? '...' : 'Generate AI Summary'}</button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default GrowthInsightsView;
