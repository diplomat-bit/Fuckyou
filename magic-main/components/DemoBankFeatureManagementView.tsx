// components/views/platform/DemoBankFeatureManagementView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const DemoBankFeatureManagementView: React.FC = () => {
    const [prompt, setPrompt] = useState("the new AI Ad Studio feature");
    const [generatedPlan, setGeneratedPlan] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedPlan(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    stages: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                target: { type: Type.STRING },
                                duration: { type: Type.STRING }
                            }
                        }
                    }
                }
            };
            const fullPrompt = `Generate a safe, 4-stage progressive rollout plan for this new feature: "${prompt}". Include stages for internal staff, a percentage of users, and full release.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setGeneratedPlan(JSON.parse(response.text));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Feature Management</h2>
            <Card title="AI Rollout Strategy Generator">
                <p className="text-gray-400 mb-4">Describe the feature you want to release, and our AI will generate a safe, progressive rollout plan.</p>
                <input
                    type="text"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                    {isLoading ? 'Generating Plan...' : 'Generate Rollout Plan'}
                </button>
            </Card>

            {(isLoading || generatedPlan) && (
                <Card title="Generated Rollout Plan">
                    <div className="space-y-4">
                        {isLoading ? <p>Generating...</p> : generatedPlan.stages.map((stage: any, index: number) => (
                            <div key={index} className="p-4 bg-gray-900/50 rounded-lg border-l-4 border-cyan-500">
                                <h4 className="font-semibold text-white">{index + 1}. {stage.name}</h4>
                                <p className="text-sm text-gray-300"><strong className="text-gray-400">Target Audience:</strong> {stage.target}</p>
                                <p className="text-xs text-gray-400"><strong className="text-gray-500">Duration:</strong> {stage.duration}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default DemoBankFeatureManagementView;