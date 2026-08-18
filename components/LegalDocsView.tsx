// components/views/megadashboard/regulation/LegalDocsView.tsx
import React, { useContext, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI } from "@google/genai";

const LegalDocsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("LegalDocsView must be within DataProvider");
    
    const { legalDocs } = context;
    const [isExplainerOpen, setExplainerOpen] = useState(false);
    const [clause, setClause] = useState("The party of the first part shall indemnify and hold harmless the party of the second part...");
    const [explanation, setExplanation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleExplain = async () => {
        setIsLoading(true); setExplanation('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const prompt = `Explain this legal clause in simple, plain English: "${clause}"`;
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            setExplanation(response.text);
        } catch(err) { console.error(err); } finally { setIsLoading(false); }
    };
    
    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Legal Docs</h2>
                    <button onClick={() => setExplainerOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Clause Explainer</button>
                </div>
                <Card title="Document Repository">
                     <table className="w-full text-sm">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30"><tr><th>Title</th><th>Type</th><th>Last Updated</th></tr></thead>
                        <tbody>{legalDocs.map(d => <tr key={d.id}><td className="px-6 py-4 text-white">{d.title}</td><td>{d.type}</td><td>{d.lastUpdated}</td></tr>)}</tbody>
                    </table>
                </Card>
            </div>
            {isExplainerOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setExplainerOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Clause Explainer</h3></div>
                        <div className="p-6 space-y-4">
                            <textarea value={clause} onChange={e => setClause(e.target.value)} className="w-full h-24 bg-gray-700/50 p-2 rounded" />
                            <button onClick={handleExplain} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Explaining...' : 'Explain Clause'}</button>
                            {explanation && <Card title="Explanation"><div className="text-sm text-gray-300">{explanation}</div></Card>}
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default LegalDocsView;
