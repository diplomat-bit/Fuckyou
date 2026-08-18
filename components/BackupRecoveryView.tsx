// components/views/megadashboard/infra/BackupRecoveryView.tsx
import React, { useContext, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI } from "@google/genai";

const BackupRecoveryView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BackupRecoveryView must be within DataProvider");
    
    const { backupJobs } = context;
    const [isSimulatorOpen, setSimulatorOpen] = useState(false);
    const [scenario, setScenario] = useState("Primary database corruption");
    const [plan, setPlan] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSimulate = async () => {
        setIsLoading(true); setPlan('');
        try {
            // NOTE: The API key is not needed for this specific API call as per the instruction.
            // However, the GoogleGenAI SDK requires an API key for initialization.
            // In a real-world scenario, you would use an API key that is securely managed.
            // For this example, we'll use a placeholder or environment variable if available.
            const apiKey = process.env.REACT_APP_GEMINI_API_KEY || "YOUR_PLACEHOLDER_API_KEY"; // Replace with your actual API key management strategy
            const ai = new GoogleGenAI({apiKey: apiKey});
            
            // Constructing the prompt to be sent to the AI model.
            // The prompt is designed to elicit a disaster recovery plan based on the provided scenario.
            const prompt = `Generate a high-level disaster recovery plan (DRP) for this scenario: "${scenario}". Include steps for failover, data restoration, and post-recovery validation.`;
            
            // Calling the Gemini API to generate content.
            // We are using the 'gemini-2.5-flash' model for its speed and efficiency.
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash', 
                contents: [{ role: "user", parts: [{ text: prompt }] }]
            });
            
            // Extracting the text content from the AI's response.
            setPlan(response.response.candidates[0].content.parts[0].text);
        } catch(err) { 
            console.error("Error simulating DR plan:", err); 
            setPlan("Failed to generate DR plan. Please check console for errors.");
        } finally { 
            setIsLoading(false); 
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Backup & Recovery</h2>
                    <button onClick={() => setSimulatorOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI DR Plan Simulator</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-green-400">100%</p><p className="text-sm text-gray-400 mt-1">Backup Success (24h)</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">4h</p><p className="text-sm text-gray-400 mt-1">Recovery Point Objective</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">1h</p><p className="text-sm text-gray-400 mt-1">Recovery Time Objective</p></Card>
                </div>
                <Card title="Recent Backup Jobs">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30"><tr><th>Service</th><th>Status</th><th>Timestamp</th><th>Duration</th></tr></thead>
                        <tbody>{backupJobs.map(job => <tr key={job.id}><td>{job.service}</td><td><span className="text-green-400">{job.status}</span></td><td>{job.timestamp}</td><td>{job.duration}</td></tr>)}</tbody>
                    </table>
                </Card>
            </div>
            {isSimulatorOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setSimulatorOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI DR Plan Simulator</h3></div>
                        <div className="p-6 space-y-4">
                            <input 
                                type="text" 
                                value={scenario} 
                                onChange={e => setScenario(e.target.value)} 
                                className="w-full bg-gray-700/50 p-2 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500" 
                                placeholder="Enter disaster scenario..."
                            />
                            <button 
                                onClick={handleSimulate} 
                                disabled={isLoading} 
                                className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded disabled:opacity-50 font-medium transition-colors duration-200"
                            >
                                {isLoading ? 'Simulating...' : 'Simulate DR Plan'}
                            </button>
                            {plan && (
                                <Card title="Simulated Plan">
                                    <div className="min-h-[10rem] max-h-60 overflow-y-auto text-sm text-gray-300 whitespace-pre-line p-4 border border-gray-700 rounded-md">
                                        {plan}
                                    </div>
                                </Card>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-700 flex justify-end">
                            <button onClick={() => setSimulatorOpen(false)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium">Close</button>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default BackupRecoveryView;