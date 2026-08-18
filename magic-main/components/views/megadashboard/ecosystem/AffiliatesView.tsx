// components/views/megadashboard/ecosystem/AffiliatesView.tsx
import React, { useState } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

interface Affiliate {
    id: string;
    name: string;
    referrals: number;
    conversionRate: number;
    commission: number;
}
const MOCK_AFFILIATES: Affiliate[] = [
    { id: 'aff-1', name: 'Fintech Weekly', referrals: 1250, conversionRate: 15, commission: 18750 },
    { id: 'aff-2', name: 'The AI Investor', referrals: 980, conversionRate: 12, commission: 11760 },
    { id: 'aff-3', name: 'Future Finance Blog', referrals: 750, conversionRate: 18, commission: 13500 },
];

const AffiliatesView: React.FC = () => {
    const [isOutreachModalOpen, setOutreachModalOpen] = useState(false);
    const [affiliateName, setAffiliateName] = useState("The AI Investor");
    const [outreachMsg, setOutreachMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setOutreachMsg('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Write a friendly and professional outreach email to a potential new affiliate partner named "${affiliateName}". Introduce Demo Bank and highlight the benefits of our affiliate program.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setOutreachMsg(response.text);
        } catch (err) {
            setOutreachMsg("Error generating outreach message.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Affiliate Program</h2>
                    <button onClick={() => setOutreachModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Outreach Writer</button>
                </div>

                <Card title="Affiliate Leaderboard">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30"><tr><th className="px-6 py-3">Name</th><th className="px-6 py-3">Referrals</th><th className="px-6 py-3">Conversion</th><th className="px-6 py-3">Commission (YTD)</th></tr></thead>
                        <tbody>{MOCK_AFFILIATES.map(a => (<tr key={a.id}>
                            <td className="px-6 py-4 text-white">{a.name}</td>
                            <td className="px-6 py-4">{a.referrals.toLocaleString()}</td>
                            <td className="px-6 py-4">{a.conversionRate}%</td>
                            <td className="px-6 py-4 font-mono text-white">${a.commission.toLocaleString()}</td>
                        </tr>))}</tbody>
                    </table>
                </Card>
            </div>
            {isOutreachModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setOutreachModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Affiliate Outreach Writer</h3></div>
                        <div className="p-6 space-y-4">
                             <input type="text" value={affiliateName} onChange={e => setAffiliateName(e.target.value)} className="w-full bg-gray-700/50 p-2 rounded text-white" />
                             <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate Email'}</button>
                            <Card title="Generated Email"><div className="min-h-[10rem] max-h-60 overflow-y-auto text-sm text-gray-300 whitespace-pre-line">{isLoading ? '...' : outreachMsg}</div></Card>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default AffiliatesView;
