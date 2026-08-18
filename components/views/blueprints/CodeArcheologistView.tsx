// components/views/blueprints/CodeArcheologistView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

const CodeArcheologistView: React.FC = () => {
    const [goal, setGoal] = useState('Refactor the Python `payment_processor` service to use a class-based structure instead of standalone functions.');
    const [log, setLog] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const runSimulation = async () => {
        setIsLoading(true);
        setLog([]);
        
        const addLog = (content: string) => setLog(prev => [...prev, content]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            addLog('Goal Received. Reading relevant files: `payment_processor.py`...');
            await new Promise(r => setTimeout(r, 1500));

            const planPrompt = `Generate a step-by-step plan to refactor a Python file from functions to a class.`;
            addLog('Generating refactoring plan...');
            const planResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: planPrompt });
            addLog(`Plan generated:\n${planResponse.text}`);
            await new Promise(r => setTimeout(r, 2000));
            
            addLog('Executing Step 1: Create `PaymentProcessor` class structure...');
            await new Promise(r => setTimeout(r, 1500));
            addLog('Running tests... All tests pass.');
            await new Promise(r => setTimeout(r, 2000));

            addLog('Executing Step 2: Move `process_payment` into the class...');
            await new Promise(r => setTimeout(r, 1500));
            addLog('Running tests... All tests pass.');
            await new Promise(r => setTimeout(r, 2000));

            addLog('Refactoring complete. Submitting pull request for human review...');

        } catch (error) {
            addLog('An error occurred during the refactoring cycle.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">Blueprint 112: Code Archeologist</h1>
            <Card title="Refactoring Goal">
                <textarea
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    rows={2}
                    className="w-full bg-gray-700/50 p-3 rounded text-white text-lg focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={runSimulation} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                    {isLoading ? 'Refactoring...' : 'Start Autonomous Refactor'}
                </button>
            </Card>

            {(isLoading || log.length > 0) && (
                <Card title="Agent Log">
                    <div className="space-y-2 max-h-[60vh] overflow-y-auto p-2 font-mono text-xs text-gray-300 whitespace-pre-line">
                        {log.map((entry, i) => <p key={i}>{`[${new Date().toLocaleTimeString()}] ${entry}`}</p>)}
                         {isLoading && <p className="text-yellow-400 animate-pulse">Working...</p>}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default CodeArcheologistView;
