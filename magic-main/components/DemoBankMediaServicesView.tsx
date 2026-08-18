// components/views/platform/DemoBankMediaServicesView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const DemoBankMediaServicesView: React.FC = () => {
    const [prompt, setPrompt] = useState("a high-quality preset for 4K streaming with adaptive bitrate for web");
    const [generatedProfile, setGeneratedProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedProfile(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    profileName: { type: Type.STRING },
                    codec: { type: Type.STRING },
                    bitratesKbps: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                    framerate: { type: Type.NUMBER }
                }
            };
            const fullPrompt = `Generate a video encoding profile in JSON format based on this requirement: "${prompt}".`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setGeneratedProfile(JSON.parse(response.text));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Media Services</h2>
             <Card title="AI Encoding Profile Generator">
                <p className="text-gray-400 mb-4">Describe the encoding requirements for your video, and our AI will generate a technical profile.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                    {isLoading ? 'Generating Profile...' : 'Generate Profile'}
                </button>
            </Card>

            {(isLoading || generatedProfile) && (
                <Card title="Generated Encoding Profile">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-96 overflow-auto">
                        {isLoading ? 'Generating...' : JSON.stringify(generatedProfile, null, 2)}
                    </pre>
                </Card>
            )}
        </div>
    );
};

export default DemoBankMediaServicesView;