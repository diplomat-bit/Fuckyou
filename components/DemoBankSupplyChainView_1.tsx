// components/views/platform/DemoBankSupplyChainView.tsx
import React, { useState } from 'react';
import Card from '../../Card';
import { GoogleGenAI } from "@google/genai";

// NOTE: In a real app, this data would come from a dedicated file e.g., /data/platform/supplyChainData.ts
const shipments = [
    { id: 'SHP-001', origin: 'Shenzhen, CN', destination: 'New York, USA', status: 'In Transit', carrier: 'Oceanic Freight' },
    { id: 'SHP-002', origin: 'Frankfurt, DE', destination: 'Chicago, USA', status: 'Delivered', carrier: 'Air Cargo Express' },
    { id: 'SHP-003', origin: 'New York, USA', destination: 'Los Angeles, USA', status: 'Customs Clearance', carrier: 'Domestic Rail' },
];

const DemoBankSupplyChainView: React.FC = () => {
    const [isRiskModalOpen, setRiskModalOpen] = useState(false);
    const [supplierInfo, setSupplierInfo] = useState({ name: 'Quantum Chips Co.', country: 'Taiwan' });
    const [riskReport, setRiskReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setRiskReport('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Generate a brief supplier risk report for "${supplierInfo.name}" based in "${supplierInfo.country}". Cover potential geopolitical risks, logistical challenges, and financial stability factors in bullet points.`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setRiskReport(response.text);
        } catch (error) {
            setRiskReport("Error: Could not generate risk report.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Supply Chain</h2>
                     <button onClick={() => setRiskModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Supplier Risk Report</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">125</p><p className="text-sm text-gray-400 mt-1">Active Shipments</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">98%</p><p className="text-sm text-gray-400 mt-1">On-Time Delivery</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">5</p><p className="text-sm text-gray-400 mt-1">Delayed Shipments</p></Card>
                </div>

                <Card title="Live Shipments">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                             <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr><th>ID</th><th>Origin</th><th>Destination</th><th>Status</th><th>Carrier</th></tr>
                            </thead>
                            <tbody>
                                {shipments.map(s => (
                                    <tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-mono text-white">{s.id}</td>
                                        <td className="px-6 py-4">{s.origin}</td>
                                        <td className="px-6 py-4">{s.destination}</td>
                                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${s.status === 'Delivered' ? 'bg-green-500/20 text-green-300' : 'bg-cyan-500/20 text-cyan-300'}`}>{s.status}</span></td>
                                        <td className="px-6 py-4">{s.carrier}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            {isRiskModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setRiskModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Supplier Risk Report</h3></div>
                        <div className="p-6 space-y-4">
                            <div className="flex gap-4">
                                <input type="text" value={supplierInfo.name} onChange={e => setSupplierInfo(p => ({...p, name: e.target.value}))} placeholder="Supplier Name" className="w-full bg-gray-700/50 p-2 rounded text-white" />
                                <input type="text" value={supplierInfo.country} onChange={e => setSupplierInfo(p => ({...p, country: e.target.value}))} placeholder="Country" className="w-full bg-gray-700/50 p-2 rounded text-white" />
                            </div>
                            <button onClick={handleGenerateReport} disabled={isLoading} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 rounded disabled:opacity-50 transition-colors">{isLoading ? 'Generating...' : 'Generate Report'}</button>
                            <Card title="Generated Report"><div className="min-h-[10rem] max-h-60 overflow-y-auto text-sm text-gray-300 whitespace-pre-line prose prose-invert max-w-none">{isLoading ? 'Generating...' : riskReport}</div></Card>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default DemoBankSupplyChainView;