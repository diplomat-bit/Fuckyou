// components/views/megadashboard/regulation/ConsentManagementView.tsx
import React, { useContext, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { GoogleGenAI } from "@google/genai";
// FIX: Imported Tooltip from recharts to resolve 'Cannot find name' error.
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ConsentManagementView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("ConsentManagementView must be within DataProvider");
    
    const { consentRecords } = context;
    const [isAssessorOpen, setAssessorOpen] = useState(false);
    const [prompt, setPrompt] = useState("Collecting user location data for fraud prevention.");
    const [assessment, setAssessment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const chartData = [
        { name: 'Marketing', value: consentRecords.filter(r => r.consentType === 'Marketing' && r.status === 'Granted').length },
        { name: 'Data Sharing', value: consentRecords.filter(r => r.consentType === 'Data Sharing' && r.status === 'Granted').length },
    ];
    const COLORS = ['#06b6d4', '#8b5cf6'];
    
    const handleAssess = async () => {
        setIsLoading(true); setAssessment('');
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const fullPrompt = `As a privacy expert AI, conduct a brief, high-level privacy impact assessment for this data collection activity: "${prompt}". Highlight potential risks and suggest mitigations.`;
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: fullPrompt});
            setAssessment(response.text);
        } catch(err) { console.error(err); } finally { setIsLoading(false); }
    };

    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Consent Management</h2>
                    <button onClick={() => setAssessorOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Privacy Impact Assessment</button>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Consent Rates">
                        <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>{chartData.map((e,i) => <Cell key={`cell-${i}`} fill={COLORS[i]} />)}</Pie><Legend /><Tooltip /></PieChart></ResponsiveContainer>
                    </Card>
                    <Card title="Recent Consent Changes">
                        {consentRecords.map(r => <p key={r.id} className="text-sm">{r.userId} {r.status} {r.consentType} consent.</p>)}
                    </Card>
                </div>
            </div>
             {isAssessorOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setAssessorOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Privacy Impact Assessment</h3></div>
                        <div className="p-6 space-y-4">
                            <textarea value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full h-24 bg-gray-700/50 p-2 rounded" />
                            <button onClick={handleAssess} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Assessing...' : 'Assess Risk'}</button>
                            {assessment && <Card title="Assessment Report"><div className="min-h-[10rem] max-h-60 overflow-y-auto text-sm text-gray-300 whitespace-pre-line">{assessment}</div></Card>}
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default ConsentManagementView;