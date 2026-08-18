// components/views/platform/DemoBankApiManagementView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

const DemoBankApiManagementView: React.FC = () => {
    const [prompt, setPrompt] = useState("a GET endpoint at /users/{id} that returns a user object with id, name, and email fields");
    const [generatedSpec, setGeneratedSpec] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setGeneratedSpec('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const fullPrompt = `Generate a simple OpenAPI 3.0 specification in YAML format for the following API endpoint: "${prompt}". Include a basic schema for the response. Do not include markdown fences.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt });
            setGeneratedSpec(response.text);
        } catch (error) {
            setError("Error: Could not generate OpenAPI spec. Please try a different prompt.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank API Management</h2>
            <Card title="AI OpenAPI Spec Generator">
                <p className="text-gray-400 mb-4">Describe the API endpoint you want to create, and our AI will generate the OpenAPI 3.0 specification for it.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., a POST endpoint at /login that takes a username and password and returns a JWT token"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors">
                    {isLoading ? 'Generating Spec...' : 'Generate Spec'}
                </button>
            </Card>

            {(isLoading || generatedSpec || error) && (
                <Card title="Generated OpenAPI Spec (YAML)">
                    {error && <p className="text-red-400">{error}</p>}
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-96 overflow-auto">
                        {isLoading ? 'Generating...' : generatedSpec}
                    </pre>
                </Card>
            )}
        </div>
    );
};

export default DemoBankApiManagementView;