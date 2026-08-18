// components/views/megadashboard/digitalassets/TokenIssuanceView.tsx
import React, { useState } from 'react';
import Card from '../../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const TokenIssuanceView: React.FC = () => {
    const [isGeneratorOpen, setGeneratorOpen] = useState(false);
    const [prompt, setPrompt] = useState("a utility token for a decentralized cloud storage network");
    const [tokenomics, setTokenomics] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setTokenomics(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = { type: Type.OBJECT, properties: { name: { type: Type.STRING }, symbol: { type: Type.STRING }, totalSupply: { type: Type.NUMBER }, allocation: { type: Type.OBJECT } } };
            const fullPrompt = `Generate a simple tokenomics model in JSON format for this token concept: "${prompt}". Include name, symbol, total supply, and a percentage allocation for team, ecosystem, and public sale.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setTokenomics(JSON.parse(response.text));
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
                    <h2 className="text-3xl font-bold text-white tracking-wider">Token Issuance Platform</h2>
                     <button onClick={() => setGeneratorOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Tokenomics Modeler</button>
                </div>
            </div>
            {isGeneratorOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setGeneratorOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Tokenomics Modeler</h3></div>
                        <div className="p-6 space-y-4">
                             <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe your token concept..." className="w-full h-24 bg-gray-700/50 p-2 rounded text-white" />
                             <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate Model'}</button>
                            {tokenomics && <Card title="Generated Tokenomics"><pre className="text-xs text-gray-300">{JSON.stringify(tokenomics, null, 2)}</pre></Card>}
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default TokenIssuanceView;
