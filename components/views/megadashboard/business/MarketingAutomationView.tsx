// components/views/megadashboard/business/MarketingAutomationView.tsx
import React, { useContext, useMemo, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GoogleGenAI } from "@google/genai";

const MarketingAutomationView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("MarketingAutomationView must be within DataProvider");
    
    const { marketingCampaigns } = context;
    const [isCopyModalOpen, setCopyModalOpen] = useState(false);
    const [productDesc, setProductDesc] = useState("Our new AI-powered savings tool");
    const [adCopy, setAdCopy] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const kpiData = useMemo(() => ({
        leads: marketingCampaigns.reduce((sum, c) => sum + (c.revenueGenerated / 100), 0),
        conversionRate: (marketingCampaigns.reduce((sum, c) => sum + c.revenueGenerated, 0) / marketingCampaigns.reduce((sum, c) => sum + c.cost, 0)),
        cpc: marketingCampaigns.reduce((sum, c) => sum + c.cost, 0) / marketingCampaigns.reduce((sum, c) => sum + (c.revenueGenerated / 100), 0),
    }), [marketingCampaigns]);

    const handleGenerateCopy = async () => {
        setIsLoading(true); setAdCopy('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const prompt = `Write 3 short, punchy ad copy headlines for this product: "${productDesc}"`;
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            setAdCopy(response.text);
        } catch(err) { console.error(err); } finally { setIsLoading(false); }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Marketing Automation</h2>
                    <button onClick={() => setCopyModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Ad Copy Generator</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{kpiData.leads.toLocaleString(undefined, {maximumFractionDigits: 0})}</p><p className="text-sm text-gray-400 mt-1">Leads Generated</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{kpiData.conversionRate.toFixed(1)}x</p><p className="text-sm text-gray-400 mt-1">ROAS</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">${kpiData.cpc.toFixed(2)}</p><p className="text-sm text-gray-400 mt-1">Cost Per Lead</p></Card>
                </div>

                <Card title="Campaign Performance (Revenue Generated)">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={marketingCampaigns}><XAxis dataKey="name" stroke="#9ca3af" /><YAxis stroke="#9ca3af" /><Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/><Legend /><Bar dataKey="revenueGenerated" fill="#82ca9d" name="Revenue" /><Bar dataKey="cost" fill="#ef4444" name="Cost" /></BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
             {isCopyModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setCopyModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Ad Copy Generator</h3></div>
                        <div className="p-6 space-y-4">
                            <input type="text" value={productDesc} onChange={e => setProductDesc(e.target.value)} className="w-full bg-gray-700/50 p-2 rounded" />
                            <button onClick={handleGenerateCopy} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate Copy'}</button>
                            {adCopy && <div className="p-3 bg-gray-900/50 rounded whitespace-pre-line text-sm">{adCopy}</div>}
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default MarketingAutomationView;
