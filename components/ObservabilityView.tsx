// components/views/megadashboard/infra/ObservabilityView.tsx
import React, { useState } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

const ObservabilityView: React.FC = () => {
    const [prompt, setPrompt] = useState("Show me all 500 errors from the payments-api in the last hour.");
    const [logResults, setLogResults] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleQuery = async () => {
        setIsLoading(true); setLogResults('');
        // Simulate log query
        setTimeout(() => {
            setLogResults(`[2024-07-24T10:35:12Z] payments-api ERROR: Database connection failed. Status: 500\n[2024-07-24T10:42:01Z] payments-api ERROR: Upstream provider timeout. Status: 503`);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Observability</h2>
            <Card title="Natural Language Log Query">
                <div className="flex gap-2">
                    <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-gray-700/50 p-2 rounded" />
                    <button onClick={handleQuery} disabled={isLoading} className="px-4 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? '...' : 'Query'}</button>
                </div>
                <div className="mt-4 bg-gray-900/50 p-4 rounded font-mono text-xs min-h-[10rem]">{isLoading ? 'Querying...' : logResults}</div>
            </Card>
        </div>
    );
};

export default ObservabilityView;
