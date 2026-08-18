// components/views/platform/DemoBankDigitalTwinView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const DemoBankDigitalTwinView: React.FC = () => {
    const [prompt, setPrompt] = useState("a smart thermostat with temperature, humidity, and status properties");
    const [generatedSchema, setGeneratedSchema] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedSchema(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    $schema: { type: Type.STRING, description: "Schema definition URI" },
                    title: { type: Type.STRING, description: "Title of the Twin Model" },
                    type: { type: Type.STRING, description: "Object type" },
                    properties: { type: Type.OBJECT, description: "The properties of the twin" }
                }
            };
            const fullPrompt = `Generate a simple JSON schema for a digital twin model based on this description: "${prompt}". Include appropriate data types for each property.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setGeneratedSchema(JSON.parse(response.text));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Digital Twin</h2>
            <Card title="AI Twin Model Generator">
                <p className="text-gray-400 mb-4">Describe the physical asset you want to model, and our AI will generate the appropriate JSON schema for its digital representation.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                    {isLoading ? 'Generating Schema...' : 'Generate Twin Schema'}
                </button>
            </Card>

            {(isLoading || generatedSchema) && (
                <Card title="Generated Twin Schema">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-96 overflow-auto">
                        {isLoading ? 'Generating...' : JSON.stringify(generatedSchema, null, 2)}
                    </pre>
                </Card>
            )}
        </div>
    );
};

export default DemoBankDigitalTwinView;
