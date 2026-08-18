// components/views/blueprints/AutonomousScientistView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

type LogEntry = { type: 'thought' | 'action' | 'result', content: string };

const AutonomousScientistView: React.FC = () => {
    const [goal, setGoal] = useState('Find novel material compositions for improved battery performance');
    const [isLoading, setIsLoading] = useState(false);
    const [log, setLog] = useState<LogEntry[]>([]);

    const runSimulation = async () => {
        setIsLoading(true);
        setLog([]);
        
        const addLog = (type: LogEntry['type'], content: string) => {
            setLog(prev => [...prev, { type, content }]);
        };

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

            addLog('thought', 'My goal is to find novel materials for batteries. I should start by researching the current state-of-the-art.');
            await new Promise(r => setTimeout(r, 1500));

            addLog('action', `Searching scientific archives for "graphene battery anode limitations"...`);
            await new Promise(r => setTimeout(r, 1500));

            addLog('result', 'Found 10 papers. Summarizing key finding: Graphene has high conductivity but suffers from degradation during ion intercalation.');
            await new Promise(r => setTimeout(r, 2000));
            
            const hypothesisPrompt = `Based on the finding that graphene degrades during ion intercalation, formulate one novel, testable hypothesis to mitigate this issue.`;
            addLog('thought', 'I need to form a hypothesis to solve the degradation problem.');
            const hypothesisResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: hypothesisPrompt });
            addLog('action', `Hypothesizing: ${hypothesisResponse.text}`);
            await new Promise(r => setTimeout(r, 2000));
            
            addLog('thought', 'Now I need to design a simulated experiment to test this.');
            await new Promise(r => setTimeout(r, 1500));
            addLog('action', 'Designing a molecular dynamics simulation to model ion flow into a doped graphene lattice...');
            await new Promise(r => setTimeout(r, 3000));

            addLog('result', 'Simulation complete. Results show a 30% reduction in lattice strain with nitrogen-doping, suggesting improved durability.');
            await new Promise(r => setTimeout(r, 1500));

            addLog('thought', 'The hypothesis is supported. I should write a summary of my findings.');
            const conclusionResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: 'Write a brief abstract summarizing our experiment: we hypothesized nitrogen-doping could reduce graphene degradation, our simulation showed a 30% reduction in lattice strain.' });
            addLog('result', `**Conclusion:** ${conclusionResponse.text}`);

        } catch (error) {
            addLog('result', 'An error occurred during the research cycle.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white tracking-wider">Blueprint 106: Autonomous Scientist</h1>
            <Card title="Research Goal">
                <textarea
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    rows={2}
                    className="w-full bg-gray-700/50 p-3 rounded text-white text-lg focus:ring-cyan-500 focus:border-cyan-500"
                />
                <button onClick={runSimulation} disabled={isLoading} className="w-full mt-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50">
                    {isLoading ? 'Running Research Cycle...' : 'Start AI Research'}
                </button>
            </Card>

            {(isLoading || log.length > 0) && (
                <Card title="Agent Log">
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
                        {log.map((entry, i) => (
                            <div key={i} className={`p-3 rounded-lg text-sm ${entry.type === 'thought' ? 'bg-indigo-500/10 border-l-4 border-indigo-400' : entry.type === 'action' ? 'bg-cyan-500/10' : 'bg-gray-800/50'}`}>
                                <strong className="capitalize text-cyan-300">{entry.type}:</strong> <span className="text-gray-300">{entry.content}</span>
                            </div>
                        ))}
                         {isLoading && <div className="text-yellow-400 animate-pulse">Thinking...</div>}
                    </div>
                </Card>
            )}
        </div>
    );
};

export default AutonomousScientistView;
