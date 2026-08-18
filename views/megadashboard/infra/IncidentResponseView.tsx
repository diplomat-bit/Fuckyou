// components/views/megadashboard/infra/IncidentResponseView.tsx
import React, { useContext, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI } from "@google/genai";
import type { Incident } from '../../../../types';

const IncidentResponseView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("IncidentResponseView must be within DataProvider");

    const { incidents } = context;
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [postmortem, setPostmortem] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async (incident: Incident) => {
        setSelectedIncident(incident);
        setIsLoading(true); setPostmortem('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const prompt = `Generate a postmortem for this incident: "${incident.title}" (Severity: ${incident.severity}). Include sections for Summary, Impact, Root Cause, and Action Items.`;
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            setPostmortem(response.text);
        } catch(err) { console.error(err); } finally { setIsLoading(false); }
    };

    return (
        <>
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Incident Response</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-red-400">1</p><p className="text-sm text-gray-400 mt-1">Active SEV2</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">5m</p><p className="text-sm text-gray-400 mt-1">MTTA</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">45m</p><p className="text-sm text-gray-400 mt-1">MTTR</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">99.98%</p><p className="text-sm text-gray-400 mt-1">Uptime (30d)</p></Card>
            </div>
            <Card title="Incident Queue">
                <table className="w-full text-sm">
                    <thead className="text-xs text-gray-300 uppercase bg-gray-900/30"><tr><th>Title</th><th>Severity</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>{incidents.map(inc => <tr key={inc.id}>
                        <td className="px-6 py-4 text-white">{inc.title}</td><td>{inc.severity}</td><td>{inc.status}</td>
                        <td><button onClick={() => handleGenerate(inc)} className="text-xs text-cyan-400">AI Postmortem</button></td>
                    </tr>)}</tbody>
                </table>
            </Card>
        </div>
        {selectedIncident && (
             <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setSelectedIncident(null)}>
                <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full" onClick={e=>e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Postmortem for {selectedIncident.id}</h3></div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                       <div className="min-h-[15rem] whitespace-pre-line text-sm">{isLoading ? 'Generating...' : postmortem}</div>
                    </div>
                </div>
             </div>
        )}
        </>
    );
};

export default IncidentResponseView;
