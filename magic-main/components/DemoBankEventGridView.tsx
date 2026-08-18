// components/views/platform/DemoBankEventGridView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const DemoBankEventGridView: React.FC = () => {
    const [prompt, setPrompt] = useState("only events for high-value transactions over $10,000 from the payments API");
    const [generatedFilter, setGeneratedFilter] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedFilter(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    subjectBeginsWith: { type: Type.STRING },
                    advancedFilters: {
                        type: Type.ARRAY,
                        items: {
                             type: Type.OBJECT,
                            properties: {
                                key: { type: Type.STRING },
                                operator: { type: Type.STRING },
                                value: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            };
            const fullPrompt = `Generate an event subscription filter in JSON format for this requirement: "${prompt}". The filter should check a 'data.amount' field.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setGeneratedFilter(JSON.parse(response.text));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Event Grid</h2>
            <Card title="AI Subscription Filter Generator">
                <p className="text-gray-400 mb-4">Describe the events you want to subscribe to in plain English.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                    {isLoading ? 'Generating Filter...' : 'Generate Filter'}
                </button>
            </Card>

            {(isLoading || generatedFilter) && (
                <Card title="Generated Event Filter">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-96 overflow-auto">
                        {isLoading ? 'Generating...' : JSON.stringify(generatedFilter, null, 2)}
                    </pre>
                </Card>
            )}
        </div>
    );
};

export default DemoBankEventGridView;
