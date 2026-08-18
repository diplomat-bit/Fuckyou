// components/views/platform/DemoBankCDPView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// NOTE: In a real app, this data would come from a dedicated file e.g., /data/platform/cdpData.ts
const segments = [
    { id: 1, name: 'High-Value Customers', size: 12_500, status: 'Active' },
    { id: 2, name: 'Churn Risk (Q2)', size: 3_200, status: 'Active' },
    { id: 3, name: 'New Leads - West Coast', size: 8_500, status: 'Building' },
];

const DemoBankCDPView: React.FC = () => {
    const [isBuilderOpen, setBuilderOpen] = useState(false);
    const [prompt, setPrompt] = useState("High-value customers who haven't made a purchase in 3 months but have viewed the new product page.");
    const [generatedRules, setGeneratedRules] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedRules(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = {
                type: Type.OBJECT, properties: {
                    rules: {
                        type: Type.ARRAY, items: {
                            type: Type.OBJECT, properties: {
                                field: { type: Type.STRING },
                                operator: { type: Type.STRING },
                                value: { type: Type.STRING }
                            }
                        }
                    }
                }
            };
            const fullPrompt = `Translate the following natural language description into a structured set of rules for a customer data platform audience segment. Description: "${prompt}"`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setGeneratedRules(JSON.parse(response.text));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank CDP</h2>
                    <button onClick={() => setBuilderOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Audience Builder</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">1.5M</p><p className="text-sm text-gray-400 mt-1">Unified Profiles</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">12</p><p className="text-sm text-gray-400 mt-1">Data Sources</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">25</p><p className="text-sm text-gray-400 mt-1">Active Segments</p></Card>
                </div>

                <Card title="Audience Segments">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                             <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr><th>Name</th><th>Size</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {segments.map(s => (
                                    <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-white">{s.name}</td>
                                        <td className="px-6 py-4">{s.size.toLocaleString()}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${s.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-cyan-500/20 text-cyan-300'}`}>{s.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
             {isBuilderOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setBuilderOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Audience Builder</h3></div>
                        <div className="p-6 space-y-4">
                             <p className="text-sm text-gray-400">Describe the customer segment you want to build in plain English.</p>
                             <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe your audience..." className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500" />
                             <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">{isLoading ? 'Generating...' : 'Generate Rules'}</button>
                             {(isLoading || generatedRules) && <Card title="Generated Ruleset"><pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded">{isLoading ? 'Generating...' : JSON.stringify(generatedRules, null, 2)}</pre></Card>}
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default DemoBankCDPView;