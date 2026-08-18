import React, { useContext, useMemo, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { FraudCase } from '../../../../types';
import { GoogleGenAI } from '@google/genai';

const FraudDetectionView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("FraudDetectionView must be within a DataProvider");

    const { fraudCases, updateFraudCaseStatus } = context;
    const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);
    const [aiSummary, setAiSummary] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);

    const kpiData = useMemo(() => ({
        newCases: fraudCases.filter(c => c.status === 'New').length,
        investigating: fraudCases.filter(c => c.status === 'Investigating').length,
        amountAtRisk: fraudCases.filter(c => c.status === 'New' || c.status === 'Investigating').reduce((sum, c) => sum + c.amount, 0),
    }), [fraudCases]);
    
    const chartData = useMemo(() => fraudCases.map(c => ({ time: c.timestamp, riskScore: c.riskScore })).sort((a,b) => new Date(a.time).getTime() - new Date(b.time).getTime()), [fraudCases]);

    const getAiSummary = async (fraudCase: FraudCase) => {
        setSelectedCase(fraudCase);
        setAiSummary('');
        setIsSummaryLoading(true);
        try {
            const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
            const prompt = `Summarize this potential fraud case in 2-3 bullet points for an analyst. Case: "${fraudCase.description}" involving $${fraudCase.amount} with a risk score of ${fraudCase.riskScore}. Focus on the key risk factors.`;
            const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
            setAiSummary(response.text);
        } catch(err) {
            setAiSummary("Could not generate summary.");
        } finally {
            setIsSummaryLoading(false);
        }
    };
    
    const StatusBadge: React.FC<{ status: FraudCase['status'] }> = ({ status }) => {
        const colors = {
            'New': 'bg-red-500/20 text-red-300',
            'Investigating': 'bg-yellow-500/20 text-yellow-300',
            'Resolved': 'bg-green-500/20 text-green-300',
            'Dismissed': 'bg-gray-500/20 text-gray-300',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>;
    };


    return (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Fraud Detection Center</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">15.2M</p><p className="text-sm text-gray-400 mt-1">Transactions Scanned</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-red-400">{kpiData.newCases}</p><p className="text-sm text-gray-400 mt-1">New Cases (24h)</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-yellow-400">{kpiData.investigating}</p><p className="text-sm text-gray-400 mt-1">Under Investigation</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">${kpiData.amountAtRisk.toLocaleString()}</p><p className="text-sm text-gray-400 mt-1">Amount at Risk</p></Card>
                </div>

                 <Card title="Transaction Risk Score (Real-time)">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={chartData}>
                             <defs><linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs>
                            <XAxis dataKey="time" stroke="#9ca3af" tickFormatter={t=>new Date(t).toLocaleTimeString()} />
                            <YAxis stroke="#9ca3af" domain={[50, 100]} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                            <Area type="monotone" dataKey="riskScore" stroke="#ef4444" fill="url(#colorRisk)" name="Risk Score" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Active Fraud Cases">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Case</th>
                                    <th scope="col" className="px-6 py-3">Risk</th>
                                    <th scope="col" className="px-6 py-3">Amount</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fraudCases.map(c => (
                                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-white">{c.description}</td>
                                        <td className="px-6 py-4 font-mono text-red-400">{c.riskScore}</td>
                                        <td className="px-6 py-4 font-mono">${c.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                                        <td className="px-6 py-4"><button onClick={() => getAiSummary(c)} className="text-xs text-cyan-300 hover:underline">AI Summary</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            {selectedCase && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setSelectedCase(null)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Case Details: {selectedCase.id}</h3></div>
                        <div className="p-6">
                            <p className="text-gray-300 mb-4">{selectedCase.description}</p>
                            <Card title="AI Summary">
                                {isSummaryLoading ? <p>Analyzing...</p> : <p className="text-sm text-gray-300 whitespace-pre-line">{aiSummary}</p>}
                            </Card>
                            <div className="mt-4 flex gap-2">
                                <button onClick={() => updateFraudCaseStatus(selectedCase.id, 'Investigating')} className="text-sm px-3 py-1 bg-yellow-600/50 hover:bg-yellow-600 rounded">Investigate</button>
                                <button onClick={() => updateFraudCaseStatus(selectedCase.id, 'Dismissed')} className="text-sm px-3 py-1 bg-gray-600/50 hover:bg-gray-600 rounded">Dismiss</button>
                            </div>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default FraudDetectionView;
