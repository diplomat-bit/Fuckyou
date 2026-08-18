// components/views/blueprints/WorldBuilderView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const WorldBuilderView: React.FC = () => {
    const [prompt, setPrompt] = useState('a tranquil, alien jungle at night with glowing flora');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleGenerate = async () => {
        setIsLoading(true);
        setResult(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = { type: Type.OBJECT, properties: {
                description: { type: Type.STRING },
                keyAssets: { type: Type.ARRAY, items: { type: Type.STRING }},
                atmosphere: { type: Type.STRING }
            }};
            const fullPrompt = `You are a world-building AI for a video game. Based on the user's prompt, generate a high-level description of the world, a list of 3-5 key assets that should be created for it, and a description of the atmosphere and lighting.

            **Prompt:** ${prompt}`;

            const response = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: fullPrompt,
                config: { responseMimeType: "application/json", responseSchema: schema }
            });
            const generatedWorld = JSON.parse(response.text);

            // For visualization, also generate an image of the scene
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `cinematic concept art of ${prompt}, unreal engine 5, ultra-detailed`,
            });
            
            setResult({
                ...generatedWorld,
                imageUrl: `data:image/jpeg;base64,${imageResponse.generatedImages[0].image.imageBytes}`
            });

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">Blueprint 104: World Builder</h1>
            <Card title="World Prompt">
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-700/50 p-3 rounded text-white text-lg focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                    {isLoading ? 'Building World...' : 'Generate World Concept'}
                </button>
            </Card>
            {(isLoading || result) && (
                <Card title="Generated World">
                    {isLoading ? <p>Building...</p> : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <img src={result.imageUrl} alt="Generated world" className="rounded-lg aspect-video object-cover"/>
                            <div className="space-y-4">
                                <div><h4 className="font-semibold text-cyan-300">Description</h4><p className="text-sm text-gray-300">{result.description}</p></div>
                                <div><h4 className="font-semibold text-cyan-300">Key Assets</h4><ul className="list-disc list-inside text-sm text-gray-300">{result.keyAssets.map((asset: string, i: number) => <li key={i}>{asset}</li>)}</ul></div>
                                <div><h4 className="font-semibold text-cyan-300">Atmosphere</h4><p className="text-sm text-gray-300">{result.atmosphere}</p></div>
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default WorldBuilderView;
