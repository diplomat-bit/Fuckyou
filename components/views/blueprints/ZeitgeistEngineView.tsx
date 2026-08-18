// components/views/blueprints/ZeitgeistEngineView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const mockTrends = [
    { name: 'AI Pin', acceleration: 9.8, data: Array.from({length: 10}, (_, i) => ({day: i, mentions: (i+1)**2 * 100})) },
    { name: 'DePIN', acceleration: 7.2, data: Array.from({length: 10}, (_, i) => ({day: i, mentions: (i+1)**1.8 * 80})) },
    { name: 'R-Commerce', acceleration: 4.5, data: Array.from({length: 10}, (_, i) => ({day: i, mentions: (i+1)**1.5 * 50})) },
];

const ZeitgeistEngineView: React.FC = () => {
    const [selectedTrend, setSelectedTrend] = useState<any>(mockTrends[0]);
    const [forecast, setForecast] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        if (!selectedTrend) return;
        setIsLoading(true);
        setForecast('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are a cultural trend analyst. The term "${selectedTrend.name}" is rapidly accelerating in online conversations. Based on the term itself, what is this trend about, and what is its potential to become a major mainstream trend in the next 6-12 months? Provide a "Thesis" and a "Forecast".`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setForecast(response.text);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">Blueprint 107: Zeitgeist Engine</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Emerging Trends" className="lg:col-span-1">
                    <div className="space-y-2">
                        {mockTrends.map(trend => (
                             <div key={trend.name} onClick={() => setSelectedTrend(trend)} className={`p-3 rounded-lg cursor-pointer ${selectedTrend?.name === trend.name ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'}`}>
                                <div className="flex justify-between items-center"><h4 className="font-semibold text-white">{trend.name}</h4> <span className="font-mono text-xs text-red-400">+{trend.acceleration} m/s²</span></div>
                                <p className="text-xs text-gray-400">Mention Acceleration</p>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card title={`Trend Analysis: ${selectedTrend?.name}`} className="lg:col-span-2">
                    {selectedTrend && (
                        <div className="space-y-4">
                            <ResponsiveContainer width="100%" height={200}>
                                <AreaChart data={selectedTrend.data}><XAxis dataKey="day" hide /><YAxis hide /><Tooltip contentStyle={{backgroundColor: '#1f2937'}} /><Area type="monotone" dataKey="mentions" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} /></AreaChart>
                            </ResponsiveContainer>
                            <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600/50 hover:bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Forecasting...' : 'Generate AI Forecast'}</button>
                            {(isLoading || forecast) && <div className="p-3 bg-gray-900/50 rounded min-h-[8rem] whitespace-pre-line text-sm">{isLoading ? 'Forecasting...' : forecast}</div>}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ZeitgeistEngineView;
