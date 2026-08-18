// components/views/megadashboard/digitalassets/DaoGovernanceView.tsx
import React, { useState } from 'react';
import Card from '../../../Card';

const DaoGovernanceView: React.FC = () => {
    const [isSummarizerOpen, setSummarizerOpen] = useState(false);
    const [proposalText, setProposalText] = useState("Proposal to allocate 5% of treasury funds to a new grant program for ecosystem developers, subject to a 3-person committee review for grants over 10,000 tokens...");
    const [summary, setSummary] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSummarize = async () => {
        setIsLoading(true);
        setSummary('');
        try {
            const response = await fetch('https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io/ai/advisor/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: `Summarize the key points of the following DAO governance proposal into 3 simple bullet points. Proposal: "${proposalText}"`,
                }),
            });
            const data = await response.json();
            setSummary(data.text);
        } catch (err) {
            setSummary("Error generating summary.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <>
            <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">DAO Governance</h2>
                     <button onClick={() => setSummarizerOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">AI Proposal Summarizer</button>
                </div>
            </div>
            {isSummarizerOpen && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setSummarizerOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Proposal Summarizer</h3></div>
                        <div className="p-6 space-y-4">
                             <textarea value={proposalText} onChange={e => setProposalText(e.target.value)} className="w-full h-40 bg-gray-900/50 p-2 rounded text-white text-sm" />
                             <button onClick={handleSummarize} disabled={isLoading} className="w-full py-2 bg-cyan-600 rounded disabled:opacity-50">{isLoading ? 'Summarizing...' : 'Summarize'}</button>
                            <Card title="Summary"><div className="min-h-[6rem] text-sm text-gray-300 whitespace-pre-line">{isLoading ? '...' : summary}</div></Card>
                        </div>
                    </div>
                 </div>
            )}
        </>
    );
};

export default DaoGovernanceView;