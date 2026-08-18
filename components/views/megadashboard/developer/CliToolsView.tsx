// components/views/megadashboard/developer/CliToolsView.tsx
import React, { useState } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

const CliToolsView: React.FC = () => {
    const [prompt, setPrompt] = useState('approve all pending payments under $100');
    const [generatedCommand, setGeneratedCommand] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedCommand('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const fullPrompt = `Translate the following natural language request into a command for a fictional 'demobank' CLI. Assume commands like 'demobank payments list --status=pending'. Request: "${prompt}"`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
            setGeneratedCommand(response.text.replace(/`/g, ''));
        } catch (error) {
            setGeneratedCommand("Error: Could not generate command.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank CLI</h2>
            
            <Card title="Installation">
                <p className="text-gray-400 mb-2">Install our powerful command-line interface to manage your resources programmatically.</p>
                <div className="bg-gray-900/50 p-4 rounded-lg font-mono text-cyan-300">
                    <span className="select-none text-gray-500 mr-2">$</span>
                    curl -sfL https://demobank.com/cli/install.sh | sh
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Example Usage">
                    <div className="bg-black p-4 rounded-lg font-mono text-sm h-72 overflow-y-auto">
                        <p className="text-gray-400"><span className="text-green-400">~</span><span className="text-cyan-400"> $</span> demobank payments list --status=pending</p>
                        <p className="text-white">ID                  AMOUNT      COUNTERPARTY</p>
                        <p className="text-white">po_001              199.99      Cloud Services Inc.</p>
                        <p className="text-gray-400 mt-4"><span className="text-green-400">~</span><span className="text-cyan-400"> $</span> demobank payments approve po_001</p>
                        <p className="text-green-400">✓ Payment order po_001 approved.</p>
                    </div>
                </Card>
                <Card title="AI Command Builder">
                     <div className="flex flex-col h-full">
                        <p className="text-gray-400 mb-4 text-sm">Describe what you want to do, and our AI will translate it into a CLI command.</p>
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-24 bg-gray-700/50 p-2 rounded text-white text-sm" />
                        <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-2 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate Command'}</button>
                        <div className="mt-4 flex-grow bg-gray-900/50 p-4 rounded-lg font-mono text-cyan-300 text-sm">
                            <span className="select-none text-gray-500 mr-2">$</span>
                            {isLoading ? 'Generating...' : generatedCommand}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default CliToolsView;
