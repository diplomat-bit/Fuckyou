import React, { useState, useEffect } from 'react';

interface ActionRequest {
  sourceAI: string; // e.g., "LoanApprovalModel"
  action: string;   // e.g., "DENY_LOAN"
  subjectId: string; // e.g., "user-123"
  rationale: string; // e.g., "Credit score below threshold"
}

interface GovernanceResponse {
  decision: 'APPROVE' | 'VETO';
  reason?: string;
  violatesPrinciple?: string; // e.g., "Fairness and Non-Discrimination"
}

const EthicalGovernorView: React.FC = () => {
  const [requests, setRequests] = useState<Array<ActionRequest & { response?: GovernanceResponse }>>([]);
  
  // MOCK INCOMING REQUESTS
  useEffect(() => {
    const interval = setInterval(() => {
      const newRequest: ActionRequest = {
        sourceAI: "LoanApprovalModel",
        action: "DENY_LOAN",
        subjectId: `user-${Math.floor(Math.random() * 1000)}`,
        rationale: "Credit score is 650, which is below our 680 threshold."
      };

      // MOCK GOVERNOR LOGIC
      const response: GovernanceResponse = Math.random() > 0.1 ? 
        { decision: 'APPROVE' } : 
        { decision: 'VETO', reason: "This denial disproportionately affects users from a protected demographic zip code.", violatesPrinciple: "Fairness"};
        
      setRequests(prev => [{...newRequest, response}, ...prev.slice(0, 50)]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Ethical Governor Live Log</h1>
      <div className="overflow-auto h-[70vh]">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-900/50 sticky top-0">
            <tr>
              <th className="p-2">Source AI</th>
              <th className="p-2">Action</th>
              <th className="p-2">Subject</th>
              <th className="p-2">Decision</th>
              <th className="p-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r, i) => (
              <tr key={i} className={`border-b border-gray-700 ${r.response?.decision === 'VETO' ? 'bg-red-500/10' : ''}`}>
                <td className="p-2">{r.sourceAI}</td>
                <td className="p-2">{r.action}</td>
                <td className="p-2 font-mono text-xs">{r.subjectId}</td>
                <td className={`p-2 font-bold ${r.response?.decision === 'VETO' ? 'text-red-400' : 'text-green-400'}`}>{r.response?.decision}</td>
                <td className="p-2 text-xs text-gray-400">{r.response?.reason || 'Compliant with ethical constitution.'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default EthicalGovernorView;
