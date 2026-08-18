// components/views/platform/DemoBankExperimentationPlatformView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const DemoBankExperimentationPlatformView: React.FC = () => {
    const [prompt, setPrompt] = useState("changing the main call-to-action button from blue to green will increase sign-ups");
    const [generatedTest, setGeneratedTest] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedTest(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    primaryMetric: { type: Type.STRING },
                    secondaryMetric: { type: Type.STRING },
                    variants: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, description: { type: Type.STRING } } } }
                }
            };
            const fullPrompt = `Design a simple A/B test for this hypothesis: "${prompt}". Define the primary metric, a secondary metric, and the variants (Control and Variant B).`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setGeneratedTest(JSON.parse(response.text));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Experimentation</h2>
            <Card title="AI A/B Test Designer">
                <p className="text-gray-400 mb-4">State your hypothesis for the experiment, and our AI will generate a structured test plan.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                    {isLoading ? 'Designing Test...' : 'Design Test'}
                </button>
            </Card>

            {(isLoading || generatedTest) && (
                <Card title="Generated Test Plan">
                     <div className="space-y-4 text-sm">
                        {isLoading ? <p>Generating...</p> : (
                            <>
                                <div><strong className="text-cyan-300 font-semibold">Primary Metric:</strong> <span className="text-gray-200">{generatedTest.primaryMetric}</span></div>
                                <div><strong className="text-cyan-300 font-semibold">Secondary Metric:</strong> <span className="text-gray-200">{generatedTest.secondaryMetric}</span></div>
                                <div className="pt-2">
                                    <p className="font-semibold text-gray-100">Variants:</p>
                                    {generatedTest.variants.map((v: any, i: number) => (
                                        <div key={i} className="mt-2 p-2 bg-gray-900/50 rounded-md">
                                            <p className="font-bold text-white">{v.name}:</p> 
                                            <p className="text-gray-300">{v.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                     </div>
                </Card>
            )}
        </div>
    );
};

export default DemoBankExperimentationPlatformView;