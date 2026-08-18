// components/views/platform/DemoBankQuantumServicesView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI, Type } from "@google/genai";

const DemoBankQuantumServicesView: React.FC = () => {
    const [prompt, setPrompt] = useState('Create a Bell state on two qubits');
    const [generatedCircuit, setGeneratedCircuit] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedCircuit(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const schema = {
                type: Type.OBJECT,
                properties: {
                    qubits: { type: Type.NUMBER },
                    gates: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                type: { type: Type.STRING },
                                target: { type: Type.NUMBER },
                                control: { type: Type.NUMBER, description: "Control qubit, if applicable" }
                            }
                        }
                    }
                }
            };
            const fullPrompt = `You are a quantum computing expert. Translate the following request into a simple quantum circuit JSON representation. A Bell state requires a Hadamard gate on qubit 0 and then a CNOT gate with qubit 0 as control and qubit 1 as target. Request: "${prompt}"`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: fullPrompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setGeneratedCircuit(JSON.parse(response.text));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Quantum Services</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">128</p><p className="text-sm text-gray-400 mt-1">Qubits Available</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">15</p><p className="text-sm text-gray-400 mt-1">Jobs in Queue</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">25s</p><p className="text-sm text-gray-400 mt-1">Avg. Execution Time</p></Card>
            </div>

            <Card title="AI Quantum Circuit Designer">
                <p className="text-gray-400 mb-4">Describe a simple quantum circuit and our AI will generate its structure.</p>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    className="w-full h-24 bg-gray-700/50 p-3 rounded text-white font-mono text-sm focus:ring-cyan-500 focus:border-cyan-500"
                    placeholder="e.g., Entangle two qubits"
                />
                <button onClick={handleGenerate} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">
                    {isLoading ? 'Generating Circuit...' : 'Generate Circuit'}
                </button>
            </Card>

            {(isLoading || generatedCircuit) && (
                <Card title="Generated Quantum Circuit">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900/50 p-4 rounded max-h-96 overflow-auto">
                        {isLoading ? 'Generating...' : JSON.stringify(generatedCircuit, null, 2)}
                    </pre>
                </Card>
            )}
        </div>
    );
};

export default DemoBankQuantumServicesView;