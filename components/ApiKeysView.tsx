// components/views/megadashboard/developer/ApiKeysView.tsx
import React, { useState, useMemo } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_API_KEY_USAGE } from '../../../../data/megadashboard';

interface ApiKey {
    id: string;
    name: string;
    key: string;
    createdAt: string;
}

const ApiKeysView: React.FC = () => {
    const [keys, setKeys] = useState<ApiKey[]>([
        { id: 'key_1', name: 'Default Live Key', key: `db_sk_live_${'X'.repeat(20)}`, createdAt: new Date().toLocaleDateString() }
    ]);
    const [newKey, setNewKey] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');
    const [isAiModalOpen, setAiModalOpen] = useState(false);
    const [aiResult, setAiResult] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    const generateFakeKey = (prefix: string): string => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 24; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `${prefix}_${result}`;
    };

    const handleGenerateClick = async () => {
        setIsGenerating(true);
        setCopySuccess('');
        await new Promise(res => setTimeout(res, 1000)); // Simulate generation
        const generated = generateFakeKey('db_sk_live');
        setNewKey(generated);
        setKeys(prev => [...prev, { id: `key_${Date.now()}`, name: 'New Live Key', key: generated, createdAt: new Date().toLocaleDateString() }]);
        setIsGenerating(false);
    };

    const handleCopy = (key: string) => {
        navigator.clipboard.writeText(key).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    const handleAiFeature = async (type: 'audit' | 'scope' | 'codegen' | 'leak') => {
        setAiModalOpen(true);
        setIsAiLoading(true);
        setAiResult('');
        let prompt = '';
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            // ... (rest of the AI feature logic remains the same)
             switch(type) {
                case 'audit':
                    prompt = `You are a security analyst AI. Review these API key usage logs and identify one potential anomaly. Explain why it's suspicious. Logs: ${JSON.stringify(MOCK_API_KEY_USAGE.slice(0,5))}`;
                    break;
                case 'scope':
                    prompt = `You are an API security expert. A developer needs a new API key for a 'read-only analytics dashboard'. Generate a JSON object representing the least-privilege set of scopes/permissions for this key. Available scopes are: 'read:transactions', 'write:transactions', 'read:users', 'write:payments'.`;
                    break;
                case 'codegen':
                    prompt = `Generate a code snippet in Python showing how to make a GET request to '/api/transactions' using an API key provided in an environment variable named 'DEMOBANK_API_KEY'.`;
                    break;
                case 'leak':
                     prompt = `Simulate a scan of public GitHub repositories for the key 'db_sk_live_...XXXX'. Report your findings.`;
                     await new Promise(res => setTimeout(res, 2000));
                     setAiResult("Scan complete. No leaks found for the specified key pattern.");
                     setIsAiLoading(false);
                     return;
            }
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            setAiResult(response.text);
        } catch(err) { console.error(err); } finally { setIsAiLoading(false); }
    };

    const latencyData = MOCK_API_KEY_USAGE.map(u => ({ name: new Date(u.timestamp).toLocaleTimeString(), latency: u.latencyMs }));
    const errorData = MOCK_API_KEY_USAGE.reduce((acc, curr) => {
        const key = curr.apiKey.slice(-4);
        if (!acc[key]) acc[key] = { name: `...${key}`, errors: 0 };
        if (curr.status >= 400) acc[key].errors++;
        return acc;
    }, {} as any);
    const errorChartData = Object.values(errorData);

    return (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Developer API Keys</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{keys.length}</p><p className="text-sm text-gray-400 mt-1">Active Keys</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">1.2M</p><p className="text-sm text-gray-400 mt-1">Requests (24h)</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">0.1%</p><p className="text-sm text-gray-400 mt-1">Error Rate</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">85ms</p><p className="text-sm text-gray-400 mt-1">Avg. Latency</p></Card>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="API Call Latency (Last Hour)"><ResponsiveContainer width="100%" height={200}><LineChart data={latencyData}><XAxis dataKey="name" fontSize={10}/><YAxis /><Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)' }}/><Line type="monotone" dataKey="latency" name="Latency (ms)" stroke="#8884d8" dot={false}/></LineChart></ResponsiveContainer></Card>
                    <Card title="Errors by Key (24h)"><ResponsiveContainer width="100%" height={200}><BarChart data={errorChartData}><XAxis dataKey="name" fontSize={12}/><YAxis/><Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)' }}/><Bar dataKey="errors" fill="#ef4444" /></BarChart></ResponsiveContainer></Card>
                </div>
                <Card title="AI Security Suite">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button onClick={() => handleAiFeature('audit')} className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left"><h4 className="font-semibold text-white">Usage Log Auditor</h4><p className="text-xs text-gray-400 mt-1">Scan recent usage logs for anomalous activity.</p></button>
                        <button onClick={() => handleAiFeature('scope')} className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left"><h4 className="font-semibold text-white">Permission Scoper</h4><p className="text-xs text-gray-400 mt-1">Generate least-privilege scopes from a description.</p></button>
                        <button onClick={() => handleAiFeature('codegen')} className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left"><h4 className="font-semibold text-white">Code Snippet Generator</h4><p className="text-xs text-gray-400 mt-1">Create code examples for using the API keys.</p></button>
                        <button onClick={() => handleAiFeature('leak')} className="p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left"><h4 className="font-semibold text-white">Public Leak Detector</h4><p className="text-xs text-gray-400 mt-1">Simulate a scan of public code for exposed keys.</p></button>
                    </div>
                </Card>

                {newKey && <Card title="Your New API Key"><div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-200"><h4 className="font-bold">Please save this secret key!</h4><p className="text-sm">This is the only time you will be able to view this key.</p></div><div className="mt-4 flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg"><span className="font-mono text-cyan-300 flex-grow">{newKey}</span><button onClick={() => handleCopy(newKey)} className="text-sm px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded">{copySuccess || 'Copy'}</button></div><button onClick={() => setNewKey(null)} className="mt-4 text-sm text-cyan-400 hover:underline">I have saved my key</button></Card>}

                <Card>
                    <div className="flex justify-between items-center"><h3 className="text-xl font-semibold text-white">Your API Keys</h3><button onClick={handleGenerateClick} disabled={isGenerating} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-sm font-medium disabled:opacity-50">{isGenerating ? 'Generating...' : 'Generate New Key'}</button></div>
                    <div className="mt-4 border-t border-gray-700 pt-4 space-y-2">
                        {keys.length > 0 ? keys.map(apiKey => (
                            <div key={apiKey.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                                <div>
                                    <p className="font-mono text-white">{apiKey.key.substring(0, 12)}... <span className="text-gray-400">({apiKey.name})</span></p>
                                    <p className="text-xs text-gray-500">Created on: {apiKey.createdAt}</p>
                                </div>
                                <button className="text-sm text-red-400 hover:underline">Revoke</button>
                            </div>
                        )) : (<p className="text-gray-500 text-center py-4">You don't have any API keys yet.</p>)}
                    </div>
                </Card>
            </div>
             {isAiModalOpen && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setAiModalOpen(false)}><div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full" onClick={e=>e.stopPropagation()}><div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Security Analysis</h3></div><div className="p-6 min-h-[10rem] whitespace-pre-line text-sm">{isAiLoading ? "Analyzing..." : aiResult}</div></div></div>}
        </>
    );
};

export default ApiKeysView;