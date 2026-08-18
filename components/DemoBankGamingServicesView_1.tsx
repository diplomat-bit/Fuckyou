// components/views/platform/DemoBankGamingServicesView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

// NOTE: In a real app, this data would come from a dedicated file e.g., /data/platform/gamingData.ts
const players = [
    { rank: 1, name: 'CyberNinja', score: 1_520_340 },
    { rank: 2, name: 'GlitchMaster', score: 1_480_990 },
    { rank: 3, name: 'VoidWalker', score: 1_475_120 },
];

const DemoBankGamingServicesView: React.FC = () => {
    const [isGeneratorOpen, setGeneratorOpen] = useState(false);
    const [itemParams, setItemParams] = useState({ type: 'Legendary Sword', theme: 'celestial fire' });
    const [generatedItem, setGeneratedItem] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedItem(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Generate an in-game item for a fantasy RPG. Item Type: "${itemParams.type}", Theme: "${itemParams.theme}". Provide a cool name, a short flavorful description, and three relevant stats (e.g., Damage, Speed, a special effect).`;
            const response = await ai.models.generateContent({ 
                model: 'gemini-2.5-flash', 
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            description: { type: Type.STRING },
                            stats: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, value: { type: Type.STRING } } } }
                        }
                    }
                }
            });
            setGeneratedItem(JSON.parse(response.text));
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Gaming Services</h2>
                    <button onClick={() => setGeneratorOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Item Generator</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">1.2M</p><p className="text-sm text-gray-400 mt-1">Daily Active Users</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">50k</p><p className="text-sm text-gray-400 mt-1">In-Game Purchases (24h)</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">25ms</p><p className="text-sm text-gray-400 mt-1">API Latency (p95)</p></Card>
                </div>

                <Card title="Global Leaderboard - Top 3">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr><th className="px-6 py-3">Rank</th><th className="px-6 py-3">Player</th><th className="px-6 py-3">Score</th></tr>
                            </thead>
                            <tbody>
                                {players.map(p => (
                                    <tr key={p.rank} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-bold text-white">{p.rank}</td>
                                        <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                                        <td className="px-6 py-4 font-mono">{p.score.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
             {isGeneratorOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setGeneratorOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI In-Game Item Generator</h3></div>
                        <div className="p-6 space-y-4">
                            <input type="text" value={itemParams.type} onChange={e => setItemParams(p => ({...p, type: e.target.value}))} placeholder="Item Type" className="w-full bg-gray-700/50 p-2 rounded text-white" />
                            <input type="text" value={itemParams.theme} onChange={e => setItemParams(p => ({...p, theme: e.target.value}))} placeholder="Item Theme" className="w-full bg-gray-700/50 p-2 rounded text-white" />
                            <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">{isLoading ? 'Generating...' : 'Generate Item'}</button>
                             {(isLoading || generatedItem) && <Card title={generatedItem?.name || "..."}><div className="min-h-[8rem]">{isLoading ? <p>Generating...</p> : <><p className="text-sm italic text-gray-400 mb-2">{generatedItem.description}</p><ul className="text-sm space-y-1">{generatedItem.stats.map((s: any, i:number) => <li key={i}><strong className="text-cyan-300">{s.name}:</strong> {s.value}</li>)}</ul></>}</div></Card>}
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default DemoBankGamingServicesView;