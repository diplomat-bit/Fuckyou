// components/views/blueprints/HypothesisEngineView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const HypothesisEngineView: React.FC = () => {
    const [hypothesis, setHypothesis] = useState('changing the main call-to-action button from blue to green will increase sign-ups');
    const [testPlan, setTestPlan] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleDesign = async () => {
        setIsLoading(true);
        setTestPlan(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are an expert product analyst. Design a simple A/B test for this hypothesis: "${hypothesis}". Define a clear primary metric, a secondary (guardrail) metric, and describe the Control and Variant B.`;
            const schema = { type: Type.OBJECT, properties: {
                primaryMetric: { type: Type.STRING },
                secondaryMetric: { type: Type.STRING },
                variants: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: {type: 'STRING'}, description: {type: 'STRING'} }}}
            }};
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: "application/json", responseSchema: schema }
            });
            setTestPlan(JSON.parse(response.text));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">Blueprint 110: Hypothesis Engine</h1>
            <Card title="A/B Test Designer">
                <p className="text-gray-400 mb-2 text-sm">State your hypothesis in plain English:</p>
                <textarea value={hypothesis} onChange={e => setHypothesis(e.target.value)} rows={3} className="w-full bg-gray-700/50 p-2 rounded text-white" />
                <button onClick={handleDesign} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                    {isLoading ? 'Designing Test...' : 'Generate Test Plan'}
                </button>
            </Card>

            {(isLoading || testPlan) && (
                <Card title="AI-Generated Test Plan">
                    {isLoading ? <p>Designing...</p> : (
                        <div className="space-y-4 text-sm">
                            <div>
                                <h4 className="text-xs uppercase font-bold text-cyan-300">Primary Metric</h4>
                                <p className="text-gray-200">{testPlan.primaryMetric}</p>
                            </div>
                             <div>
                                <h4 className="text-xs uppercase font-bold text-cyan-300">Secondary (Guardrail) Metric</h4>
                                <p className="text-gray-200">{testPlan.secondaryMetric}</p>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {testPlan.variants.map((v: any, i: number) => (
                                    <div key={i} className="p-3 bg-gray-900/50 rounded-lg">
                                        <h5 className="font-semibold text-white">{v.name}</h5>
                                        <p className="text-gray-300">{v.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
};

export default HypothesisEngineView;
