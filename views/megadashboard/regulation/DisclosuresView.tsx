// components/views/megadashboard/regulation/DisclosuresView.tsx
import React, { useContext, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI } from "@google/genai";

const DisclosuresView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("DisclosuresView must be within DataProvider");
    
    const { disclosures } = context;
    const [isDrafterOpen, setDrafterOpen] = useState(false);
    const [prompt, setPrompt] = useState("A minor data breach affecting 500 users, no PII exposed.");
    const [draft, setDraft] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleDraft = async () => {
        setIsLoading(true); setDraft('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const fullPrompt = `You are a legal AI. Draft a concise, professional public disclosure statement for the following event: "${prompt}"`;
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: fullPrompt});
            setDraft(response.text);
        } catch(err) { console.error(err); } finally { setIsLoading(false); }
    };

    return (
        <>
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-wider">Disclosures</h2>
                <button onClick={() => setDrafterOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Disclosure Drafter</button>
            </div>
             <Card title="Regulatory Filings">
                <table className="w-full text-sm">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30"><tr><th className="px-6 py-3">Title</th><th className="px-6 py-3">Jurisdiction</th><th className="px-6 py-3">Filing Date</th></tr></thead>
                    <tbody>{disclosures.map(d => <tr key={d.id}><td className="px-6 py-4 text-white">{d.title}</td><td>{d.jurisdiction}</td><td>{d.filingDate}</td></tr>)}</tbody>
                </table>
            </Card>
        </div>
         {isDrafterOpen && (
             <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setDrafterOpen(false)}>
                <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full" onClick={e=>e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Disclosure Drafter</h3></div>
                    <div className="p-6 space-y-4">
                        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-24 bg-gray-700/50 p-2 rounded" />
                        <button onClick={handleDraft} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Drafting...' : 'Draft Disclosure'}</button>
                        {draft && <Card title="Generated Draft"><div className="min-h-[10rem] max-h-60 overflow-y-auto text-sm text-gray-300 whitespace-pre-line">{draft}</div></Card>}
                    </div>
                </div>
             </div>
        )}
        </>
    );
};

export default DisclosuresView;
