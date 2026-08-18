// components/views/platform/DemoBankRoboticsView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const DemoBankRoboticsView: React.FC = () => {
    const [prompt, setPrompt] = useState("pick up an object at position A and place it at position B");
    const [generatedCommands, setGeneratedCommands] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedCommands(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    commands: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                action: { type: Type.STRING },
                                target: { type: Type.STRING },
                                speed: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            };
            const fullPrompt = `You are a robotics engineer. Translate the following high-level robotics task into a sequence of simple JSON commands for a robotic arm. Task: "${prompt}".`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setGeneratedCommands(JSON.parse(response.text));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Robotics</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">50</p><p className="text-sm text-gray-400 mt-1">Robots in Fleet</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">48</p><p className="text-sm text-gray-400 mt-1">Online</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">12</p><p className="text-sm text-gray-400 mt-1">Active Simulations</p></Card>
            </div>
            <Card title="AI Robotics Command Generator">
                <p className="text-gray-400 mb-4">Describe a high-level task for a robotic arm.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                    {isLoading ? 'Generating Commands...' : 'Generate Command Sequence'}
                </button>
            </Card>

            {(isLoading || generatedCommands) && (
                <Card title="Generated Commands">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-96 overflow-auto">
                        {isLoading ? 'Generating...' : JSON.stringify(generatedCommands, null, 2)}
                    </pre>
                </Card>
            )}
        </div>
    );
};

export default DemoBankRoboticsView;