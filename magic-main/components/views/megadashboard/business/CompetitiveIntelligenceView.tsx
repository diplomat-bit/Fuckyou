// components/views/megadashboard/business/CompetitiveIntelligenceView.tsx
import React, { useContext, useMemo, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { GoogleGenAI } from "@google/genai";

const CompetitiveIntelligenceView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("CompetitiveIntelligenceView must be within DataProvider");

    const { competitors } = context;
    const [swot, setSwot] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const chartData = [
        { subject: 'Features', A: 90, B: 75, fullMark: 100 },
        { subject: 'Pricing', A: 70, B: 85, fullMark: 100 },
        { subject: 'UX/UI', A: 95, B: 80, fullMark: 100 },
        { subject: 'Support', A: 85, B: 90, fullMark: 100 },
        { subject: 'API', A: 92, B: 70, fullMark: 100 },
    ];
    
    const handleGenerateSwot = async () => {
        setIsLoading(true); setSwot('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const prompt = `Generate a brief SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for Demo Bank against our top competitor, FinFuture Inc.`;
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            setSwot(response.text);
        } catch(err) { console.error(err); } finally { setIsLoading(false); }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Competitive Intelligence</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Feature Comparison (vs. FinFuture Inc.)">
                     <ResponsiveContainer width="100%" height={300}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid /><PolarAngleAxis dataKey="subject" />
                            <Radar name="Demo Bank" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                            <Radar name="FinFuture" dataKey="B" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.6} />
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                </Card>
                <div className="lg:col-span-2">
                    <Card title="AI SWOT Analysis">
                        <div className="flex flex-col h-full">
                            <div className="min-h-[12rem] whitespace-pre-line text-sm text-gray-300">{isLoading ? 'Analyzing...' : swot}</div>
                            <button onClick={handleGenerateSwot} disabled={isLoading} className="mt-4 w-full py-2 bg-cyan-600/50 hover:bg-cyan-600 rounded disabled:opacity-50">{isLoading ? '...' : 'Generate AI SWOT'}</button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CompetitiveIntelligenceView;
