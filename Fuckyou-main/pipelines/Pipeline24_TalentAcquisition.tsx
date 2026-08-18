import React, { useState } from 'react';

interface ExecutiveCandidate {
  id: string;
  name: string;
  role: string;
  status: 'Sourcing' | 'Screening' | 'Interviewing' | 'Offer' | 'Hired' | 'Withdrawn';
  seniority: 'VP' | 'C-Suite' | 'Director';
  lastContact: string;
}

const Pipeline24_TalentAcquisition: React.FC = () => {
  const [candidates, setCandidates] = useState<ExecutiveCandidate[]>([
    { id: '1', name: 'Elena Rodriguez', role: 'CTO', status: 'Interviewing', seniority: 'C-Suite', lastContact: '2023-10-25' },
    { id: '2', name: 'Marcus Thorne', role: 'VP of Engineering', status: 'Screening', seniority: 'VP', lastContact: '2023-10-26' },
  ]);

  const updateStatus = (id: string, newStatus: ExecutiveCandidate['status']) => {
    setCandidates(prev =>
      prev.map(c => (c.id === id ? { ...c, status: newStatus } : c))
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Executive Talent Acquisition Pipeline</h1>
        <p className="text-gray-600">Managing high-level leadership recruitment workflows.</p>
      </header>

      <div className="grid gap-4">
        {candidates.map(candidate => (
          <div key={candidate.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center border-l-4 border-blue-500">
            <div>
              <h3 className="font-semibold text-lg">{candidate.name}</h3>
              <p className="text-sm text-gray-500">{candidate.role} • {candidate.seniority}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {candidate.status}
              </span>
              <select 
                value={candidate.status}
                onChange={(e) => updateStatus(candidate.id, e.target.value as ExecutiveCandidate['status'])}
                className="border rounded p-1 text-sm"
              >
                <option value="Sourcing">Sourcing</option>
                <option value="Screening">Screening</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Hired">Hired</option>
                <option value="Withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pipeline24_TalentAcquisition;