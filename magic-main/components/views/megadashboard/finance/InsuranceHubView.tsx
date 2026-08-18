// components/views/megadashboard/finance/InsuranceHubView.tsx
// FIX: Corrected typo in React import and added useState, useContext.
import React, { useState, useContext } from 'react';
import Card from '../../../Card';
import { GoogleGenAI, Type } from "@google/genai";
import { DataContext } from '../../../../context/DataContext';
import type { InsuranceClaim } from '../../../../types';

const ClaimDetailModal: React.FC<{ claim: InsuranceClaim | null; onClose: () => void; }> = ({ claim, onClose }) => {
    const [aiAssessment, setAiAssessment] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!claim) return null;

    const generateAssessment = async () => {
        setIsLoading(true);
        setAiAssessment(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `You are an expert insurance claims adjudication AI. Based on the claim description "${claim.description}", provide a structured damage assessment and a recommended payout amount.`;
            const schema = { type: Type.OBJECT, properties: { assessment: { type: Type.STRING }, recommendedPayout: { type: Type.NUMBER } } };
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt, config: { responseMimeType: "application/json", responseSchema: schema } });
            setAiAssessment(JSON.parse(response.text));
        } catch (err) {
            console.error(err);
            setAiAssessment({ assessment: 'Error generating assessment.', recommendedPayout: 0 });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Claim Details: {claim.id}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-300 bg-gray-900/50 p-3 rounded-lg">{claim.description}</p>
                    <Card title="AI Claims Adjudicator">
                        {isLoading && <p>Analyzing claim...</p>}
                        {aiAssessment && <div className="text-sm space-y-2"><p><strong className="text-cyan-300">Assessment:</strong> {aiAssessment.assessment}</p><p className="mt-2"><strong className="text-cyan-300">Recommended Payout:</strong> ${aiAssessment.recommendedPayout.toLocaleString()}</p></div>}
                        {!aiAssessment && !isLoading && <button onClick={generateAssessment} className="text-sm text-cyan-400 hover:underline">Generate AI Assessment</button>}
                    </Card>
                </div>
            </div>
        </div>
    );
};

const InsuranceHubView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("InsuranceHubView must be within DataProvider");
    
    const { insuranceClaims } = context;
    const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
    
    const StatusBadge: React.FC<{ status: InsuranceClaim['status'] }> = ({ status }) => {
        const colors = {
            'New': 'bg-red-500/20 text-red-300',
            'Under Review': 'bg-yellow-500/20 text-yellow-300',
            'Approved': 'bg-green-500/20 text-green-300',
            'Denied': 'bg-gray-500/20 text-gray-300',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>;
    };

    return (
        <>
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Insurance Hub</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">12,500</p><p className="text-sm text-gray-400 mt-1">Active Policies</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-red-400">2</p><p className="text-sm text-gray-400 mt-1">New Claims Today</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">$6,580</p><p className="text-sm text-gray-400 mt-1">Avg. Claim Cost</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">1.2%</p><p className="text-sm text-gray-400 mt-1">AI Fraud Flag Rate</p></Card>
            </div>

            <Card title="Claims Processing Queue">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr><th>Claim ID</th><th>Policyholder</th><th>Amount</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {insuranceClaims.map(claim => (
                                <tr key={claim.id} onClick={() => setSelectedClaim(claim)} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer">
                                    <td className="px-6 py-4 font-mono text-white">{claim.id}</td>
                                    <td className="px-6 py-4">{claim.policyholder}</td>
                                    <td className="px-6 py-4 font-mono">${claim.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4"><StatusBadge status={claim.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
        <ClaimDetailModal claim={selectedClaim} onClose={() => setSelectedClaim(null)} />
        </>
    );
};

export default InsuranceHubView;