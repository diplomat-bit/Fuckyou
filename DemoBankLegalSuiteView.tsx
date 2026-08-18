// components/views/platform/DemoBankLegalSuiteView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

// NOTE: In a real app, this data would come from a dedicated file e.g., /data/platform/legalData.ts
const contracts = [
    { id: 'CTR-001', name: 'Master Services Agreement - Quantum Corp', status: 'Active', renewalDate: '2025-01-15' },
    { id: 'CTR-002', name: 'SaaS Subscription - Cyberdyne Systems', status: 'Active', renewalDate: '2024-11-30' },
    { id: 'CTR-003', name: 'Vendor Agreement - Office Supplies Co.', status: 'Expired', renewalDate: '2024-06-30' },
    { id: 'CTR-004', name: 'NDA - NeuroLink Inc.', status: 'Active', renewalDate: 'N/A' },
];

const DemoBankLegalSuiteView: React.FC = () => {
    const [isNdaModalOpen, setIsNdaModalOpen] = useState(false);
    const [ndaParams, setNdaParams] = useState({ partyA: 'Demo Bank', partyB: 'FutureTech Solutions', topic: 'Project Phoenix' });
    const [generatedNda, setGeneratedNda] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateNda = async () => {
        if (!ndaParams.partyB || !ndaParams.topic) return;
        setIsLoading(true);
        setGeneratedNda('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Generate a simple, standard, one-way Non-Disclosure Agreement (NDA). The Disclosing Party is "${ndaParams.partyA}". The Receiving Party is "${ndaParams.partyB}". The confidential topic is "${ndaParams.topic}". Keep it concise and professional.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setGeneratedNda(response.text);
        } catch (error) {
            setGeneratedNda("Error: Could not generate the NDA at this time.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Legal Suite</h2>
                    <button onClick={() => setIsNdaModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Generate NDA with AI</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">125</p><p className="text-sm text-gray-400 mt-1">Active Contracts</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">12</p><p className="text-sm text-gray-400 mt-1">Pending Review</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">5</p><p className="text-sm text-gray-400 mt-1">Renewals this Quarter</p></Card>
                </div>

                <Card title="Contract Repository">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th className="px-6 py-3">Contract Name</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Renewal Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contracts.map(c => (
                                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${c.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>{c.status}</span></td>
                                        <td className="px-6 py-4">{c.renewalDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {isNdaModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsNdaModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-3xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI NDA Generator</h3></div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh]">
                            <div className="space-y-4">
                                <p className="text-sm text-gray-400">Enter the details for the NDA.</p>
                                <input type="text" value={ndaParams.partyB} onChange={e => setNdaParams(p => ({...p, partyB: e.target.value}))} placeholder="Receiving Party Name" className="w-full bg-gray-700/50 p-2 rounded text-white" />
                                <input type="text" value={ndaParams.topic} onChange={e => setNdaParams(p => ({...p, topic: e.target.value}))} placeholder="Confidential Topic (e.g., Project X)" className="w-full bg-gray-700/50 p-2 rounded text-white" />
                                <button onClick={handleGenerateNda} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">{isLoading ? 'Generating...' : 'Generate Document'}</button>
                            </div>
                            <div className="bg-gray-900/50 p-4 rounded-lg overflow-y-auto">
                                {isLoading && <p>Generating...</p>}
                                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans">{generatedNda}</pre>
                            </div>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default DemoBankLegalSuiteView;