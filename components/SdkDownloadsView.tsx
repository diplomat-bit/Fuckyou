// components/views/megadashboard/developer/SdkDownloadsView.tsx
import React, { useState } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

interface Sdk {
    id: string;
    language: string;
    version: string;
    docsUrl: string;
}

const MOCK_SDKS: Sdk[] = [
    { id: 'ts', language: 'TypeScript', version: '3.5.1', docsUrl: '#' },
    { id: 'py', language: 'Python', version: '2.8.0', docsUrl: '#' },
    { id: 'go', language: 'Go', version: '1.12.3', docsUrl: '#' },
    { id: 'rb', language: 'Ruby', version: '2.2.0', docsUrl: '#' },
];

const SdkDownloadsView: React.FC = () => {
    const [prompt, setPrompt] = useState('create a new payment order for $100');
    const [generatedCode, setGeneratedCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSdk, setSelectedSdk] = useState<Sdk | null>(null);

    const handleGenerate = async () => {
        if (!selectedSdk) return;
        setIsLoading(true);
        setGeneratedCode('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const fullPrompt = `Generate a code snippet in ${selectedSdk.language} using a hypothetical 'demobank' SDK to accomplish the following task: "${prompt}".`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
            setGeneratedCode(response.text.replace(/```[a-zA-Z]*\n|```/g, '').trim());
        } catch (error) {
            setGeneratedCode("Error: Could not generate code snippet.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">SDK Downloads</h2>
            <Card title="Server-Side SDKs">
                <p className="text-gray-400 mb-6">Integrate Demo Bank into your application with our official SDKs.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {MOCK_SDKS.map(sdk => (
                        <Card key={sdk.id} variant="interactive" className="text-center">
                            <h3 className="text-xl font-semibold text-white">{sdk.language}</h3>
                            <p className="text-sm text-gray-400">v{sdk.version}</p>
                            <div className="mt-4 flex flex-col gap-2">
                                <button className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm">Download</button>
                                <button onClick={() => setSelectedSdk(sdk)} className="w-full py-2 bg-gray-600/50 hover:bg-gray-600 text-white rounded-lg text-sm">AI Code Gen</button>
                            </div>
                        </Card>
                    ))}
                </div>
            </Card>

            {selectedSdk && (
                <Card title={`AI Code Generator for ${selectedSdk.language}`}>
                    <button onClick={() => setSelectedSdk(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white">&times;</button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-gray-300">Describe what you want to do:</label>
                            <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-gray-700/50 p-2 rounded text-white" />
                            <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                                {isLoading ? 'Generating...' : 'Generate Code'}
                            </button>
                        </div>
                        <div className="bg-gray-900/50 p-4 rounded-lg max-h-60 overflow-auto">
                            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono">
                                {isLoading ? 'Generating...' : generatedCode}
                            </pre>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default SdkDownloadsView;
