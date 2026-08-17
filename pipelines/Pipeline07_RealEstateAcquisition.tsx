import React, { useState } from 'react';

interface AcquisitionStage {
  id: string;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  assignee: string;
}

const Pipeline07_RealEstateAcquisition: React.FC = () => {
  const [stages, setStages] = useState<AcquisitionStage[]>([
    { id: '1', name: 'Property Sourcing', status: 'completed', assignee: 'Lead Scout' },
    { id: '2', name: 'Due Diligence', status: 'in-progress', assignee: 'Legal Team' },
    { id: '3', name: 'Financial Modeling', status: 'pending', assignee: 'Analyst' },
    { id: '4', name: 'Offer Submission', status: 'pending', assignee: 'Acquisition Manager' },
    { id: '5', name: 'Closing & Title Transfer', status: 'pending', assignee: 'Escrow Officer' },
  ]);

  const updateStageStatus = (id: string, newStatus: AcquisitionStage['status']) => {
    setStages(prev => prev.map(stage => 
      stage.id === id ? { ...stage, status: newStatus } : stage
    ));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Real Estate Acquisition Pipeline</h1>
      <div className="space-y-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div>
              <h3 className="font-semibold text-lg">{stage.name}</h3>
              <p className="text-sm text-gray-500">Assignee: {stage.assignee}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${
                stage.status === 'completed' ? 'bg-green-100 text-green-800' :
                stage.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                stage.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {stage.status}
              </span>
              <select 
                value={stage.status}
                onChange={(e) => updateStageStatus(stage.id, e.target.value as AcquisitionStage['status'])}
                className="border rounded p-1 text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pipeline07_RealEstateAcquisition;