// components/views/platform/DemoBankObservabilityPlatformView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

const DemoBankObservabilityPlatformView: React.FC = () => {
    const [prompt, setPrompt] = useState("show me all 500 errors from the payments-api in the last hour");
    const [generatedQuery, setGeneratedQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [logResults, setLogResults] = useState('');


    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedQuery('');
        setLogResults('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            // This prompt is designed to generate a query in a Splunk-like or LogQL-like syntax
            const fullPrompt = `You are an expert SRE. Translate this natural language request into a log query language syntax (like Splunk or LogQL). Request: "${prompt}".`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
            const query = response.text.replace(/`/g, '').trim();
            setGeneratedQuery(query);
            
            // Simulate running the query
            setTimeout(() => {
                 setLogResults(`[2024-07-24T10:35:12Z] payments-api ERROR: Database connection failed. Status: 500\n[2024-07-24T10:42:01Z] payments-api ERROR: Upstream provider timeout. Status: 503 (interpreted as 5xx)`);
            }, 1000);

        } catch (error) {
            setGeneratedQuery("Error: Could not generate query.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Observability</h2>
            <Card title="AI Natural Language Log Query">
                <p className="text-gray-400 mb-4">Describe the logs you want to find in plain English.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                    {isLoading ? 'Generating & Executing...' : 'Generate & Run Query'}
                </button>
            </Card>

            {(isLoading || generatedQuery) && (
                <Card title="Query & Results">
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-semibold text-cyan-300">Generated Query:</h4>
                            <pre className="text-sm text-gray-300 font-mono bg-gray-900/50 p-2 rounded mt-1">{isLoading && !generatedQuery ? 'Generating...' : generatedQuery}</pre>
                        </div>
                         <div>
                            <h4 className="text-sm font-semibold text-cyan-300">Log Results:</h4>
                            <pre className="text-xs text-gray-300 font-mono bg-gray-900/50 p-4 rounded mt-1 max-h-60 overflow-auto">{isLoading ? 'Executing...' : logResults}</pre>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default DemoBankObservabilityPlatformView;