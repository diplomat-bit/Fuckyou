// components/views/megadashboard/ecosystem/PartnerHubView.tsx
import React, { useState } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

interface Partner {
    id: string;
    name: string;
    tier: 'Platinum' | 'Gold' | 'Silver';
    status: 'Active' | 'Pending Review';
    revenueGenerated: number;
}
const MOCK_PARTNERS: Partner[] = [
    { id: 'p-1', name: 'Quantum Innovations', tier: 'Platinum', status: 'Active', revenueGenerated: 250000 },
    { id: 'p-2', name: 'Cyber Solutions Ltd.', tier: 'Gold', status: 'Active', revenueGenerated: 120000 },
    { id: 'p-3', name: 'NextGen Fintech', tier: 'Silver', status: 'Active', revenueGenerated: 75000 },
    { id: 'p-4', name: 'Future Integrators', tier: 'Silver', status: 'Pending Review', revenueGenerated: 0 },
];

const PartnerHubView: React.FC = () => {
    const [isRiskModalOpen, setRiskModalOpen] = useState(false);
    const [partnerName, setPartnerName] = useState("Future Integrators");
    const [riskReport, setRiskReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setRiskReport('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Generate a brief business risk assessment for a potential new partner named "${partnerName}". Focus on potential reputational, financial, and integration risks.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setRiskReport(response.text);
        } catch (err) {
            setRiskReport("Error generating risk report.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Partner Hub</h2>
                    <button onClick={() => setRiskModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Partner Vetting</button>
                </div>

                <Card title="Partner Directory">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30"><tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Tier</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Revenue (YTD)</th></tr></thead>
                        <tbody>{MOCK_PARTNERS.map(p => (<tr key={p.id}>
                            <td className="px-6 py-4 text-white">{p.name}</td>
                            <td className="px-6 py-4">{p.tier}</td>
                            <td className="px-6 py-4"><span className={p.status === 'Active' ? 'text-green-400' : 'text-yellow-400'}>{p.status}</span></td>
                            <td className="px-6 py-4 font-mono text-white">${p.revenueGenerated.toLocaleString()}</td>
                        </tr>))}</tbody>
                    </table>
                </Card>
            </div>
            {isRiskModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setRiskModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Partner Risk Assessment</h3></div>
                        <div className="p-6 space-y-4">
                            <input type="text" value={partnerName} onChange={e => setPartnerName(e.target.value)} className="w-full bg-gray-700/50 p-2 rounded text-white" />
                            <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Assessing...' : 'Assess Risk'}</button>
                            <Card title="AI Report"><div className="min-h-[10rem] text-sm text-gray-300 whitespace-pre-line">{isLoading ? '...' : riskReport}</div></Card>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default PartnerHubView;
