// components/views/personal/CreditHealthView.tsx
import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const CreditHealthView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("CreditHealthView must be within a DataProvider.");
    const { creditScore, creditFactors } = context;

    const [insight, setInsight] = useState('');
    const [isLoadingInsight, setIsLoadingInsight] = useState(false);

    const getAIInsight = async () => {
        setIsLoadingInsight(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const prompt = `A user has a credit score of ${creditScore.score}. Their credit factors are: ${creditFactors.map(f => `${f.name}: ${f.status}`).join(', ')}. Provide one concise, actionable tip to help them improve their score.`;
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            setInsight(response.text);
        } catch (err) {
            setInsight("Could not generate a personalized tip at this time.");
        } finally { setIsLoadingInsight(false); }
    };
    
    useEffect(() => { getAIInsight() }, []);

    const StatusIndicator: React.FC<{ status: 'Excellent' | 'Good' | 'Fair' | 'Poor' }> = ({ status }) => {
        const colors = { Excellent: 'bg-green-500', Good: 'bg-cyan-500', Fair: 'bg-yellow-500', Poor: 'bg-red-500' };
        return <div className={`w-3 h-3 rounded-full ${colors[status]}`}></div>
    }
    
    const statusToScore = (status: 'Excellent' | 'Good' | 'Fair' | 'Poor') => {
        switch(status) {
            case 'Excellent': return 100;
            case 'Good': return 75;
            case 'Fair': return 50;
            case 'Poor': return 25;
            default: return 0;
        }
    };
    const chartData = creditFactors.map(f => ({ subject: f.name.replace('Credit ', ''), A: statusToScore(f.status), fullMark: 100 }));


    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Credit Health</h2>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card title="Your Credit Score" subtitle={`Rating: ${creditScore.rating}`} className="lg:col-span-2">
                     <p className="text-7xl font-bold text-center text-white my-8">{creditScore.score}</p>
                </Card>
                <Card title="Credit Factor Analysis" className="lg:col-span-3">
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Score" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.6} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
            <Card title="AI-Powered Tip">
                 <div className="flex flex-col justify-center items-center h-full text-center p-4">
                     {isLoadingInsight ? <p>Analyzing...</p> : <p className="text-gray-300 italic">"{insight}"</p>}
                 </div>
            </Card>
            <Card title="Factors Impacting Your Score">
                <div className="space-y-3">
                    {creditFactors.map(factor => (
                        <div key={factor.name} className="p-3 bg-gray-800/50 rounded-lg">
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-white">{factor.name}</h4>
                                <div className="flex items-center gap-2"><StatusIndicator status={factor.status} /><span className="text-sm text-gray-300">{factor.status}</span></div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">{factor.description}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default CreditHealthView;
