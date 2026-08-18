// components/views/platform/DemoBankBlockchainView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

const DemoBankBlockchainView: React.FC = () => {
    const [prompt, setPrompt] = useState('a simple smart contract to store a single number and allow the owner to update it');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedCode('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const fullPrompt = `Generate a basic Solidity smart contract for the following purpose: "${prompt}". Include comments explaining the code. Start with the SPDX license identifier and pragma directive. Do not include markdown fences.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
            setGeneratedCode(response.text);
        } catch (error) {
            setError("Error: Could not generate contract. Your prompt may have violated safety policies.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Blockchain</h2>
            
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">5</p><p className="text-sm text-gray-400 mt-1">Active Nodes</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">1.2M</p><p className="text-sm text-gray-400 mt-1">Transactions Indexed (24h)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">25</p><p className="text-sm text-gray-400 mt-1">Deployed Contracts</p></Card>
            </div>

            <Card title="AI Smart Contract Generator">
                <p className="text-gray-400 mb-4">Describe the smart contract you want to create, and our AI will generate the Solidity code.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., A simple voting contract"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors">
                    {isLoading ? 'Generating Code...' : 'Generate Solidity Code'}
                </button>
            </Card>

            {(isLoading || generatedCode || error) && (
                <Card title="Generated Smart Contract">
                    {error && <p className="text-red-400">{error}</p>}
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-96 overflow-auto">
                        {isLoading ? 'Generating...' : generatedCode}
                    </pre>
                </Card>
            )}
        </div>
    );
};

export default DemoBankBlockchainView;