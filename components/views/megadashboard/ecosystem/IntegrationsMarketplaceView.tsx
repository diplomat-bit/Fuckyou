// components/views/megadashboard/ecosystem/IntegrationsMarketplaceView.tsx
import React, { useState } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

const IntegrationsMarketplaceView: React.FC = () => {
    const [isIdeaModalOpen, setIdeaModalOpen] = useState(false);
    const [prompt, setPrompt] = useState("an integration that syncs customer data with our CRM");
    const [idea, setIdea] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setIdea('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const fullPrompt = `Brainstorm a brief, high-level implementation plan for the following integration idea: "${prompt}". Suggest the key API endpoints that would be needed from Demo Bank.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
            setIdea(response.text);
        } catch (err) {
            setIdea("Error generating idea.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Integrations Marketplace</h2>
                    <button onClick={() => setIdeaModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Integration Ideator</button>
                </div>
                <Card title="Featured Integrations">
                     <p className="text-gray-400">This section would showcase popular integrations like Slack, Salesforce, etc.</p>
                </Card>
            </div>
            {isIdeaModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIdeaModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Integration Ideator</h3></div>
                        <div className="p-6 space-y-4">
                             <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe your integration idea..." className="w-full h-24 bg-gray-700/50 p-2 rounded text-white" />
                             <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate Plan'}</button>
                            <Card title="Generated Plan"><div className="min-h-[10rem] text-sm text-gray-300 whitespace-pre-line">{isLoading ? '...' : idea}</div></Card>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default IntegrationsMarketplaceView;
