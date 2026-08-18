// components/views/megadashboard/regulation/RegulatorySandboxView.tsx
import React, { useContext, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI } from "@google/genai";

const RegulatorySandboxView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("RegulatorySandboxView must be within DataProvider");
    
    const { sandboxExperiments } = context;
    const [isPlannerOpen, setPlannerOpen] = useState(false);
    const [prompt, setPrompt] = useState("Testing a new P2P payment feature in the UK market.");
    const [plan, setPlan] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePlan = async () => {
        setIsLoading(true); setPlan('');
        try {
            // Using the OpenAPI spec's server URL directly for the API call
            const response = await fetch('https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io/ai/oracle/simulate/advanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: `You are a compliance AI. Create a high-level test plan for a regulatory sandbox experiment. Experiment: "${prompt}". Include objectives, scope, and key success metrics.`,
                    scenarios: [], // No specific scenarios provided in the prompt
                    parameters: {} // No specific parameters provided in the prompt
                }),
            });
            
            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }
            
            const data = await response.json();
            // Assuming the relevant part of the response is in 'narrativeSummary' or similar
            // Adjust this based on the actual response structure from the OpenAPI spec
            setPlan(data.narrativeSummary || data.overallSummary || JSON.stringify(data, null, 2));
        } catch(err) { 
            console.error(err); 
            setPlan(`Error generating plan: ${err.message}`);
        } finally { setIsLoading(false); }
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Regulatory Sandbox</h2>
                    <button onClick={() => setPlannerOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Test Plan Generator</button>
                </div>
                 <Card title="Active Experiments">
                     <table className="w-full text-sm">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30"><tr><th>Name</th><th>Status</th><th>Start Date</th></tr></thead>
                        <tbody>{sandboxExperiments.map(e => <tr key={e.id}><td className="px-6 py-4 text-white">{e.name}</td><td><span className="text-green-400">{e.status}</span></td><td>{e.startDate}</td></tr>)}</tbody>
                    </table>
                </Card>
            </div>
            {isPlannerOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setPlannerOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Test Plan Generator</h3></div>
                        <div className="p-6 space-y-4">
                            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-24 bg-gray-700/50 p-2 rounded" />
                            <button onClick={handlePlan} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate Plan'}</button>
                            {plan && <Card title="Generated Plan"><div className="min-h-[10rem] max-h-60 overflow-y-auto text-sm text-gray-300 whitespace-pre-line">{plan}</div></Card>}
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default RegulatorySandboxView;