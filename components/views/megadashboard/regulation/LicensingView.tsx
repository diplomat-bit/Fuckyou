// components/views/megadashboard/regulation/LicensingView.tsx
import React, { useContext, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI } from "@google/genai";

const LicensingView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("LicensingView must be within DataProvider");
    
    const { licenses } = context;
    const [isCheckerOpen, setCheckerOpen] = useState(false);
    const [featureDesc, setFeatureDesc] = useState("A new feature to allow cross-border payments to Brazil.");
    const [complianceReport, setComplianceReport] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckCompliance = async () => {
        setIsLoading(true); setComplianceReport('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const prompt = `As a compliance expert, review this new feature description: "${featureDesc}". Based on our existing licenses (e.g., California Money Transmitter), what, if any, new licenses might be required? Provide a brief summary.`;
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            setComplianceReport(response.text);
        } catch(err) { console.error(err); } finally { setIsLoading(false); }
    };

    return (
        <>
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-wider">Licensing</h2>
                <button onClick={() => setCheckerOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Compliance Check</button>
            </div>
            <Card title="License Repository">
                <table className="w-full text-sm">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30"><tr><th className="px-6 py-3">License Name</th><th className="px-6 py-3">Jurisdiction</th><th className="px-6 py-3">Status</th><th className="px-6 py-3">Expiry</th></tr></thead>
                    <tbody>{licenses.map(lic => <tr key={lic.id}><td className="px-6 py-4 text-white">{lic.name}</td><td className="px-6 py-4">{lic.jurisdiction}</td><td><span className="text-green-400">{lic.status}</span></td><td>{lic.expiryDate}</td></tr>)}</tbody>
                </table>
            </Card>
        </div>
        {isCheckerOpen && (
             <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setCheckerOpen(false)}>
                <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full" onClick={e=>e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Compliance Checker</h3></div>
                    <div className="p-6 space-y-4">
                        <textarea value={featureDesc} onChange={e => setFeatureDesc(e.target.value)} className="w-full h-24 bg-gray-700/50 p-2 rounded" />
                        <button onClick={handleCheckCompliance} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Checking...' : 'Check Compliance'}</button>
                        {complianceReport && <div className="p-3 bg-gray-900/50 rounded whitespace-pre-line text-sm">{complianceReport}</div>}
                    </div>
                </div>
             </div>
        )}
        </>
    );
};

export default LicensingView;