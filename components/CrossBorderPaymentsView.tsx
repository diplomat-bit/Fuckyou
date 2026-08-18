// components/views/megadashboard/ecosystem/CrossBorderPaymentsView.tsx
import React, { useState } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

const CrossBorderPaymentsView: React.FC = () => {
    const [isComplianceModalOpen, setComplianceModalOpen] = useState(false);
    const [country, setCountry] = useState("Brazil");
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setSummary('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Provide a brief, high-level summary of the key AML and KYC compliance considerations for sending payments to "${country}".`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setSummary(response.text);
        } catch (err) {
            setSummary("Error generating compliance summary.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Cross-Border Payments</h2>
                    <button onClick={() => setComplianceModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Compliance Summary</button>
                </div>
                {/* FX Rate Chart would go here */}
                <Card title="Live FX Rates">
                    <p className="text-gray-400">This would be a live chart showing major currency pair exchange rates.</p>
                </Card>
            </div>
            {isComplianceModalOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setComplianceModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Compliance Summary Generator</h3></div>
                        <div className="p-6 space-y-4">
                             <input type="text" value={country} onChange={e => setCountry(e.target.value)} className="w-full bg-gray-700/50 p-2 rounded text-white" />
                             <button onClick={handleGenerate} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Generating...' : 'Generate Summary'}</button>
                            <Card title={`Compliance Summary for ${country}`}><div className="min-h-[10rem] text-sm text-gray-300 whitespace-pre-line">{isLoading ? '...' : summary}</div></Card>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default CrossBorderPaymentsView;
