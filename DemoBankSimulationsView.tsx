// components/views/platform/DemoBankSimulationsView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const DemoBankSimulationsView: React.FC = () => {
    const [prompt, setPrompt] = useState("a high-volatility market with a potential interest rate hike");
    const [generatedParams, setGeneratedParams] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedParams(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    volatilityIndex: { type: Type.NUMBER, description: "0.0 to 1.0" },
                    interestRateChange: { type: Type.NUMBER, description: "Basis points change" },
                    marketSentiment: { type: Type.STRING, enum: ['Bearish', 'Neutral', 'Bullish'] },
                    simulationSteps: { type: Type.NUMBER, description: "Number of steps/days to simulate" }
                }
            };
            const fullPrompt = `You are a quantitative analyst. Generate a set of parameters for a financial market simulation based on this scenario: "${prompt}".`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setGeneratedParams(JSON.parse(response.text));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Simulations</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">12</p><p className="text-sm text-gray-400 mt-1">Active Simulations</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">500k</p><p className="text-sm text-gray-400 mt-1">Core Hours Used (MTD)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">5</p><p className="text-sm text-gray-400 mt-1">Pending Jobs</p></Card>
            </div>
            <Card title="AI Simulation Parameter Generator">
                <p className="text-gray-400 mb-4">Describe the market conditions you want to simulate.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                    {isLoading ? 'Generating Parameters...' : 'Generate Parameters'}
                </button>
            </Card>

            {(isLoading || generatedParams) && (
                <Card title="Generated Parameters">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-96 overflow-auto">
                        {isLoading ? 'Generating...' : JSON.stringify(generatedParams, null, 2)}
                    </pre>
                </Card>
            )}
        </div>
    );
};

export default DemoBankSimulationsView;