// components/views/platform/DemoBankCMSView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

// NOTE: In a real app, this data would come from a dedicated file e.g., /data/platform/cmsData.ts
const contentItems = [
    { id: 1, title: "Q3 Earnings Report Summary", type: "Blog Post", status: "Published" },
    { id: 2, title: "Welcome to The Nexus - Landing Page", type: "Page", status: "Published" },
    { id: 3, title: "Understanding Fractional Reserve Banking", type: "Article", status: "Draft" },
];

const DemoBankCMSView: React.FC = () => {
    const [isWriterOpen, setWriterOpen] = useState(false);
    const [prompt, setPrompt] = useState('The future of AI in personal finance');
    const [generatedContent, setGeneratedContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedContent('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const fullPrompt = `Write a short blog post about the following topic: "${prompt}". Include a title, an introduction, two body paragraphs, and a conclusion. Use markdown for formatting.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
            setGeneratedContent(response.text);
        } catch (error) {
            setGeneratedContent("Error: Could not generate content.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank CMS</h2>
                    <button onClick={() => setWriterOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Content Writer</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">152</p><p className="text-sm text-gray-400 mt-1">Content Items</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">3</p><p className="text-sm text-gray-400 mt-1">Content Types</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">5</p><p className="text-sm text-gray-400 mt-1">Drafts</p></Card>
                </div>

                <Card title="Content Library">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr><th>Title</th><th>Type</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {contentItems.map(item => (
                                    <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                                        <td className="px-6 py-4">{item.type}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${item.status === 'Published' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{item.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
             {isWriterOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setWriterOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Content Writer</h3></div>
                        <div className="p-6 space-y-4">
                            <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Enter a title or topic..." className="w-full bg-gray-700/50 p-2 rounded text-white" />
                            <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">{isLoading ? 'Generating...' : 'Write Article'}</button>
                            <Card title="Generated Draft"><div className="min-h-[15rem] max-h-80 overflow-y-auto text-sm text-gray-300 whitespace-pre-line prose prose-invert max-w-none">{isLoading ? 'Generating...' : generatedContent}</div></Card>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default DemoBankCMSView;