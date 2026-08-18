// components/views/megadashboard/developer/SandboxView.tsx
import React, { useState } from 'react';
import Card from '../../../Card';
import { GoogleGenAI, Type } from "@google/genai";

interface SandboxEnvironment {
    id: string;
    name: string;
    status: 'Active' | 'Stopped';
    apiKey: string;
    createdAt: string;
}

const MOCK_ENVIRONMENTS: SandboxEnvironment[] = [
    { id: 'env-1', name: 'Staging-WebApp-Test', status: 'Active', apiKey: 'sk_test_...aBcDeF', createdAt: '2024-07-20' },
    { id: 'env-2', name: 'Mobile-iOS-Integration', status: 'Active', apiKey: 'sk_test_...xYz123', createdAt: '2024-07-18' },
    { id: 'env-3', name: 'Archived-Q2-Tests', status: 'Stopped', apiKey: 'sk_test_...pQr456', createdAt: '2024-06-30' },
];

const SandboxView: React.FC = () => {
    const [isDataGenOpen, setDataGenOpen] = useState(false);
    const [prompt, setPrompt] = useState('a user with 5 recent transactions of varying amounts');
    const [generatedData, setGeneratedData] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedData('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const fullPrompt = `Generate a realistic mock JSON object based on this request: "${prompt}". The JSON should be well-formed.`;
            // Note: A specific schema could be used for more structured output if needed.
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
            // Extract JSON from markdown code block if present
            const cleanedResponse = response.text.replace(/```json\n|```/g, '').trim();
            setGeneratedData(JSON.stringify(JSON.parse(cleanedResponse), null, 2));
        } catch (error) {
            setGeneratedData("Error: Could not generate valid JSON data. Please try a different prompt.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Developer Sandbox</h2>
                    <button onClick={() => setDataGenOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Test Data Generator</button>
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">3</p><p className="text-sm text-gray-400 mt-1">Active Environments</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">1.2M</p><p className="text-sm text-gray-400 mt-1">API Calls (24h)</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">45ms</p><p className="text-sm text-gray-400 mt-1">Avg. Response Time</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">0.01%</p><p className="text-sm text-gray-400 mt-1">Error Rate</p></Card>
                </div>

                <Card title="Sandbox Environments">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                             <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr><th>Name</th><th>Status</th><th>API Key</th><th>Created</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {MOCK_ENVIRONMENTS.map(env => (
                                    <tr key={env.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-white">{env.name}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${env.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>{env.status}</span></td>
                                        <td className="px-6 py-4 font-mono">{env.apiKey}</td>
                                        <td className="px-6 py-4">{env.createdAt}</td>
                                        <td className="px-6 py-4 flex gap-2"><button className="text-xs text-cyan-400 hover:underline">Reset</button><button className="text-xs text-red-400 hover:underline">Delete</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
             {isDataGenOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setDataGenOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Test Data Generator</h3></div>
                        <div className="p-6 space-y-4">
                            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe the mock data you need..." className="w-full h-24 bg-gray-700/50 p-2 rounded text-white" />
                            <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate JSON'}</button>
                            <Card title="Generated Data"><pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-60 overflow-auto">{isLoading ? 'Generating...' : generatedData}</pre></Card>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default SandboxView;
