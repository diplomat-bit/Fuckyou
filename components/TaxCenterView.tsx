// components/views/megadashboard/finance/TaxCenterView.tsx
import React, { useState, useContext } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI, Type } from "@google/genai";

const TaxCenterView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("TaxCenterView must be within a DataProvider");
    
    const { transactions } = context;
    const [deductions, setDeductions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const findDeductions = async () => {
        setIsLoading(true);
        setDeductions([]);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are an expert tax AI. Analyze this list of transactions and identify potential tax deductions for a freelance consultant. For each, provide the transaction description, amount, a potential deduction category, and a brief justification. Transactions:\n${transactions.map(t => `${t.description} - $${t.amount}`).join('\n')}`;
            const schema = { type: Type.OBJECT, properties: { deductions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, amount: { type: Type.NUMBER }, category: { type: Type.STRING }, justification: { type: Type.STRING } } } } } };
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setDeductions(JSON.parse(response.text).deductions);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">AI Tax Center</h2>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">$15,250</p><p className="text-sm text-gray-400 mt-1">Estimated Liability</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">${deductions.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}</p><p className="text-sm text-gray-400 mt-1">Deductions Found</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">15%</p><p className="text-sm text-gray-400 mt-1">Effective Tax Rate</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-yellow-400">Low</p><p className="text-sm text-gray-400 mt-1">AI Audit Risk</p></Card>
            </div>

            <Card title="AI Deduction Finder">
                <div className="text-center">
                    <button onClick={findDeductions} disabled={isLoading} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg disabled:opacity-50">
                        {isLoading ? 'Scanning Transactions...' : 'Run AI Deduction Scan'}
                    </button>
                </div>
                {deductions.length > 0 && (
                    <div className="mt-6 space-y-3">
                        {deductions.map((d, i) => (
                            <div key={i} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-white">{d.description} - ${d.amount}</h4>
                                    <span className="text-xs bg-cyan-500/20 text-cyan-200 px-2 py-0.5 rounded-full">{d.category}</span>
                                </div>
                                <p className="text-sm text-gray-400 italic mt-1">"{d.justification}"</p>
                            </div>
                        ))}
                    </div>
                )}
                 { !isLoading && deductions.length === 0 && <p className="text-center text-gray-500 mt-4">Run the scan to find potential tax deductions.</p>}
            </Card>
        </div>
    );
};

export default TaxCenterView;