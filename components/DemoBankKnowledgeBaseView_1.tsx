// components/views/platform/DemoBankKnowledgeBaseView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

const DemoBankKnowledgeBaseView: React.FC = () => {
    const [prompt, setPrompt] = useState("How to reset your password");
    const [generatedArticle, setGeneratedArticle] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedArticle('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const fullPrompt = `You are a helpful technical writer. Write a simple, clear knowledge base article with step-by-step instructions for the topic: "${prompt}". Use markdown for formatting, including headers and numbered lists.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
            setGeneratedArticle(response.text);
        } catch (error) {
            setGeneratedArticle("Error: Could not generate article draft.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Knowledge Base</h2>
            <Card title="AI Article Drafter">
                <p className="text-gray-400 mb-4">Enter the title of the help article you want to write.</p>
                <input
                    type="text"
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                    {isLoading ? 'Drafting...' : 'Generate Article Draft'}
                </button>
            </Card>

            {(isLoading || generatedArticle) && (
                 <Card title="Generated Draft">
                     <div className="prose prose-invert prose-sm max-w-none text-gray-300 whitespace-pre-line bg-gray-900/50 p-4 rounded max-h-96 overflow-auto">
                        {isLoading ? 'Drafting...' : generatedArticle}
                     </div>
                </Card>
            )}
        </div>
    );
};

export default DemoBankKnowledgeBaseView;