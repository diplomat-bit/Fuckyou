// components/views/megadashboard/business/BenchmarkingView.tsx
import React, { useContext, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI } from "@google/genai";

const Gauge: React.FC<{ title: string, value: number, avg: number, unit: string }> = ({ title, value, avg, unit }) => {
    const isGood = value < avg; // Assuming lower is better for CAC
    return (
        <Card className="text-center">
            <h4 className="font-semibold text-white">{title}</h4>
            <p className="text-4xl font-bold my-2" style={{color: isGood ? '#22c55e' : '#f59e0b'}}>${value}{unit}</p>
            <p className="text-xs text-gray-400">Industry Avg: ${avg}{unit}</p>
        </Card>
    );
};

const BenchmarkingView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BenchmarkingView must be within DataProvider");

    const { benchmarks } = context;
    const [recommendations, setRecommendations] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateRecs = async () => {
        setIsLoading(true); setRecommendations('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const prompt = `Based on our CAC of $120 vs industry avg of $150, what are 2 high-level strategies to improve it?`;
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            setRecommendations(response.text);
        } catch(err) { console.error(err); } finally { setIsLoading(false); }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Benchmarking</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {benchmarks.map(b => <Gauge key={b.id} title={b.metric} value={b.ourValue} avg={b.industryAverage} unit="" />)}
            </div>

            <Card title="AI Strategy Recommendations">
                <div className="flex flex-col h-full">
                    <div className="min-h-[8rem] whitespace-pre-line text-sm text-gray-300">{isLoading ? 'Analyzing...' : recommendations}</div>
                    <button onClick={handleGenerateRecs} disabled={isLoading} className="mt-4 w-full md:w-1/3 py-2 bg-cyan-600/50 hover:bg-cyan-600 rounded disabled:opacity-50">{isLoading ? '...' : 'Generate Recommendations'}</button>
                </div>
            </Card>
        </div>
    );
};

export default BenchmarkingView;
