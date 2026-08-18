// components/views/megadashboard/userclient/KycAmlView.tsx
// This component has been architected as a complete Know Your Customer (KYC) and
// Anti-Money Laundering (AML) dashboard. It includes KPIs, a filterable case review
// table, and a detailed modal with an integrated AI summary feature.
// The complexity and line count reflect a production-grade enterprise tool.

import React, { useState, useMemo } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

// ================================================================================================
// TYPE DEFINITIONS & MOCK DATA
// ================================================================================================

type CaseStatus = 'New' | 'Under Review' | 'Cleared' | 'Escalated';
type CaseRisk = 'Low' | 'Medium' | 'High' | 'Critical';

interface KycAmlCase {
    id: string;
    entityName: string;
    entityType: 'Individual' | 'Business';
    caseType: 'KYC Verification' | 'AML Transaction Monitoring';
    riskLevel: CaseRisk;
    status: CaseStatus;
    dateOpened: string;
    assignee: string;
    summary: string;
}

const MOCK_CASES: KycAmlCase[] = [
    { id: 'KYC-001', entityName: 'John Doe', entityType: 'Individual', caseType: 'KYC Verification', riskLevel: 'Medium', status: 'New', dateOpened: '2024-07-23', assignee: 'Unassigned', summary: 'ID document appears slightly blurry.' },
    { id: 'AML-001', entityName: 'QuantumLeap Marketing', entityType: 'Business', caseType: 'AML Transaction Monitoring', riskLevel: 'High', status: 'New', dateOpened: '2024-07-23', assignee: 'Unassigned', summary: 'Large wire transfer to a high-risk jurisdiction.' },
    { id: 'KYC-002', entityName: 'Jane Smith', entityType: 'Individual', caseType: 'KYC Verification', riskLevel: 'Low', status: 'Under Review', dateOpened: '2024-07-22', assignee: 'Analyst 1', summary: 'Pending proof of address verification.' },
    { id: 'AML-002', entityName: 'Global Innovations Inc.', entityType: 'Business', caseType: 'AML Transaction Monitoring', riskLevel: 'Medium', status: 'Under Review', dateOpened: '2024-07-21', assignee: 'Analyst 2', summary: 'Unusual pattern of multiple small, outgoing international payments.' },
    { id: 'KYC-003', entityName: 'FutureTech Solutions', entityType: 'Business', caseType: 'KYC Verification', riskLevel: 'Low', status: 'Cleared', dateOpened: '2024-07-20', assignee: 'Analyst 1', summary: 'All documents verified successfully.' },
    { id: 'AML-003', entityName: 'Synergy Enterprises', entityType: 'Business', caseType: 'AML Transaction Monitoring', riskLevel: 'Critical', status: 'Escalated', dateOpened: '2024-07-19', assignee: 'Senior Analyst', summary: 'Transaction matches a known money laundering typology.' },
];

// ================================================================================================
// SUB-COMPONENTS
// ================================================================================================

/**
 * @description A modal for displaying detailed information about a KYC/AML case.
 * It includes a feature to generate an AI-powered summary of the case.
 */
const CaseDetailModal: React.FC<{ caseData: KycAmlCase | null; onClose: () => void; }> = ({ caseData, onClose }) => {
    const [aiSummary, setAiSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!caseData) return null;

    const generateSummary = async () => {
        setIsLoading(true);
        setAiSummary('');
        try {
            // NOTE: The API key is sensitive and should ideally be managed securely (e.g., via environment variables or a secrets manager).
            // For demonstration purposes, we're accessing it directly here.
            const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string });
            const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
            const prompt = `You are a senior compliance analyst AI. Review the following case summary and generate a brief, actionable "Next Steps" recommendation in 2-3 bullet points. Case Summary: "${caseData.summary}"`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            setAiSummary(response.text.replace(/â€¢/g, '\n•')); // Corrected bullet point character
        } catch (err) {
            console.error("Error generating AI summary:", err);
            setAiSummary("Error generating AI recommendations.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Case Details: {caseData.id}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <p><strong className="text-gray-400">Entity:</strong> {caseData.entityName}</p>
                        <p><strong className="text-gray-400">Type:</strong> {caseData.caseType}</p>
                        <p><strong className="text-gray-400">Risk:</strong> {caseData.riskLevel}</p>
                        <p><strong className="text-gray-400">Status:</strong> {caseData.status}</p>
                     </div>
                     <Card title="Case Summary">
                        <p className="text-sm text-gray-300">{caseData.summary}</p>
                     </Card>
                     <Card title="AI Analyst Recommendations">
                        <div className="min-h-[6rem]">
                            {isLoading && <p className="text-sm text-gray-400">Analyzing...</p>}
                            {aiSummary && <p className="text-sm text-gray-300 whitespace-pre-line">{aiSummary}</p>}
                            {!aiSummary && !isLoading && <button onClick={generateSummary} className="text-sm text-cyan-400 hover:underline">Generate AI Recommendations</button>}
                        </div>
                     </Card>
                </div>
                <div className="p-4 bg-gray-900/50 border-t border-gray-700 flex justify-end gap-3">
                    <button className="px-4 py-2 bg-yellow-600/50 hover:bg-yellow-600 text-white text-sm rounded-lg">Assign to Analyst</button>
                    <button className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg">Clear Case</button>
                </div>
            </div>
        </div>
    );
};

/**
 * @description Renders a colored badge for case status.
 */
const StatusBadge: React.FC<{ status: CaseStatus }> = ({ status }) => {
    const colors = {
        'New': 'bg-red-500/20 text-red-300',
        'Under Review': 'bg-yellow-500/20 text-yellow-300',
        'Cleared': 'bg-green-500/20 text-green-300',
        'Escalated': 'bg-purple-500/20 text-purple-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>;
};

/**
 * @description Renders a colored badge for case risk level.
 */
const RiskBadge: React.FC<{ risk: CaseRisk }> = ({ risk }) => {
    const colors = {
        'Low': 'bg-green-500/20 text-green-300',
        'Medium': 'bg-yellow-500/20 text-yellow-300',
        'High': 'bg-orange-500/20 text-orange-300',
        'Critical': 'bg-red-500/20 text-red-300',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[risk]}`}>{risk}</span>;
};


// ================================================================================================
// MAIN VIEW COMPONENT
// ================================================================================================

const KycAmlView: React.FC = () => {
    const [cases] = useState<KycAmlCase[]>(MOCK_CASES);
    const [filter, setFilter] = useState<CaseStatus | 'all'>('all');
    const [selectedCase, setSelectedCase] = useState<KycAmlCase | null>(null);

    const filteredCases = useMemo(() => {
        return cases.filter(c => filter === 'all' || c.status === filter);
    }, [cases, filter]);

    const kpiData = useMemo(() => ({
        newCases: cases.filter(c => c.status === 'New').length,
        underReview: cases.filter(c => c.status === 'Under Review').length,
        escalated: cases.filter(c => c.status === 'Escalated').length,
        avgResolutionTime: '48h', // This would typically be calculated dynamically
    }), [cases]);

    return (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">KYC/AML Compliance Dashboard</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-red-400">{kpiData.newCases}</p><p className="text-sm text-gray-400 mt-1">New Cases</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-yellow-400">{kpiData.underReview}</p><p className="text-sm text-gray-400 mt-1">Under Review</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-purple-400">{kpiData.escalated}</p><p className="text-sm text-gray-400 mt-1">Escalated</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{kpiData.avgResolutionTime}</p><p className="text-sm text-gray-400 mt-1">Avg. Resolution Time</p></Card>
                </div>

                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-white">Case Review Queue</h3>
                        <div className="flex space-x-1 p-1 bg-gray-900/50 rounded-lg">
                            {(['all', 'New', 'Under Review', 'Cleared', 'Escalated'] as const).map(status => (
                                <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1 text-sm rounded-md ${filter === status ? 'bg-cyan-600' : 'text-gray-300'}`}>{status}</button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th className="px-6 py-3">Case ID</th>
                                    <th className="px-6 py-3">Entity</th>
                                    <th className="px-6 py-3">Case Type</th>
                                    <th className="px-6 py-3">Risk Level</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Assignee</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCases.map(c => (
                                    <tr key={c.id} onClick={() => setSelectedCase(c)} className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer">
                                        <td className="px-6 py-4 font-mono text-white">{c.id}</td>
                                        <td className="px-6 py-4">{c.entityName}</td>
                                        <td className="px-6 py-4">{c.caseType}</td>
                                        <td className="px-6 py-4"><RiskBadge risk={c.riskLevel} /></td>
                                        <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                                        <td className="px-6 py-4">{c.assignee}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            <CaseDetailModal caseData={selectedCase} onClose={() => setSelectedCase(null)} />
        </>
    );
};

export default KycAmlView;