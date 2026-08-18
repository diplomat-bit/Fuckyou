// components/views/platform/DemoBankPropTechView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

// NOTE: In a real app, this data would come from a dedicated file e.g., /data/platform/proptechData.ts
const properties = [
    { id: 1, address: '123 Cyberpunk Ave, Unit 42', status: 'Occupied', rent: 4500 },
    { id: 2, address: '456 Neo-Tokyo Blvd', status: 'Vacant', rent: 3200 },
    { id: 3, address: '789 Synthwave St', status: 'Maintenance', rent: 2800 },
];

const DemoBankPropTechView: React.FC = () => {
    const [isGeneratorOpen, setGeneratorOpen] = useState(false);
    const [features, setFeatures] = useState('2 bed, 2 bath, downtown, balcony with city view, newly renovated kitchen, rooftop pool');
    const [generatedDesc, setGeneratedDesc] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedDesc('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are a creative real estate copywriter. Write an exciting and appealing property listing description based on these features: ${features}. Make it sound modern and desirable.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setGeneratedDesc(response.text);
        } catch (error) {
            setGeneratedDesc("Error: Could not generate description.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank PropTech</h2>
                     <button onClick={() => setGeneratorOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Listing Generator</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">95%</p><p className="text-sm text-gray-400 mt-1">Occupancy Rate</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">2</p><p className="text-sm text-gray-400 mt-1">Open Maintenance Tickets</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">$1.2M</p><p className="text-sm text-gray-400 mt-1">Portfolio Value</p></Card>
                </div>

                <Card title="Managed Properties">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr><th className="px-6 py-3">Address</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Monthly Rent</th></tr>
                            </thead>
                            <tbody>
                                {properties.map(p => (
                                    <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-white">{p.address}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${p.status === 'Occupied' ? 'bg-green-500/20 text-green-300' : p.status === 'Vacant' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}>{p.status}</span></td>
                                        <td className="px-6 py-4 font-mono">${p.rent.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
             {isGeneratorOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setGeneratorOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Listing Description Generator</h3></div>
                        <div className="p-6 space-y-4">
                            <textarea value={features} onChange={e => setFeatures(e.target.value)} placeholder="Enter property features..." className="w-full h-24 bg-gray-700/50 p-2 rounded text-white" />
                            <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">{isLoading ? 'Generating...' : 'Generate Description'}</button>
                            <Card title="Generated Description"><div className="min-h-[10rem] max-h-60 overflow-y-auto text-sm text-gray-300 prose prose-invert max-w-none">{isLoading ? 'Generating...' : generatedDesc}</div></Card>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default DemoBankPropTechView;