// components/views/blueprints/LudicBalancerView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const mockGameData = `Hero A: Win Rate 65%, Pick Rate 80%\nHero B: Win Rate 42%, Pick Rate 5%\nHero C: Win Rate 51%, Pick Rate 15%`;

const LudicBalancerView: React.FC = () => {
    const [gameData, setGameData] = useState(mockGameData);
    const [report, setReport] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setReport([]);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are a Principal Game Designer. Analyze the following hero statistics and identify the top balance issues. For each, provide the hero, a description of the problem, and a specific, numerical change to a game parameter to address it. Data:\n${gameData}`;
            const schema = { type: Type.OBJECT, properties: { analysis: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { element: {type: 'STRING'}, problem: {type: 'STRING'}, suggestion: {type: 'STRING'} }}}}};
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: schema }
            });
            setReport(JSON.parse(response.text).analysis);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">Blueprint 109: Ludic Balancer</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Game Telemetry Data" className="lg:col-span-1">
                    <textarea value={gameData} onChange={e => setGameData(e.target.value)} className="w-full h-48 bg-gray-900/50 p-2 rounded text-sm font-mono" />
                    <button onClick={handleAnalyze} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                        {isLoading ? 'Analyzing...' : 'Generate Balance Report'}
                    </button>
                </Card>
                <Card title="AI Balance Report" className="lg:col-span-2">
                    <div className="min-h-[20rem]">
                        {isLoading ? <p>Analyzing telemetry...</p> : report.length > 0 ? (
                            <div className="space-y-4">
                                {report.map((item, i) => (
                                    <div key={i} className="p-3 bg-gray-900/50 rounded-lg border-l-4 border-cyan-400">
                                        <h4 className="font-bold text-white">{item.element}</h4>
                                        <p className="text-sm text-yellow-300 my-1"><strong>Problem:</strong> {item.problem}</p>
                                        <p className="text-sm text-green-300"><strong>Suggestion:</strong> {item.suggestion}</p>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-gray-500">Run analysis to generate a report.</p>}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LudicBalancerView;
