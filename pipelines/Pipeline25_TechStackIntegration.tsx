import React, { useState, useEffect } from 'react';

interface TechComponent {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'deprecated' | 'pending-audit';
  lastAudit: string;
}

const Pipeline25_TechStackIntegration: React.FC = () => {
  const [components, setComponents] = useState<TechComponent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTechStack = async () => {
      try {
        // Simulated API call for tech stack audit data
        const data: TechComponent[] = [
          { id: '1', name: 'React', version: '18.2.0', status: 'active', lastAudit: '2023-10-01' },
          { id: '2', name: 'TypeScript', version: '5.2.2', status: 'active', lastAudit: '2023-10-05' },
          { id: '3', name: 'Legacy-Auth-Lib', version: '1.0.4', status: 'deprecated', lastAudit: '2023-09-15' },
        ];
        setComponents(data);
      } catch (error) {
        console.error('Failed to fetch tech stack components', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTechStack();
  }, []);

  const runAudit = (id: string) => {
    setComponents((prev) =>
      prev.map((comp) =>
        comp.id === id ? { ...comp, lastAudit: new Date().toISOString().split('T')[0] } : comp
      )
    );
  };

  if (loading) return <div>Loading Tech Stack Audit Pipeline...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Pipeline 25: Tech Stack Integration & Audit</h2>
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Component</th>
            <th className="border p-2">Version</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Last Audit</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {components.map((comp) => (
            <tr key={comp.id} className="text-center">
              <td className="border p-2">{comp.name}</td>
              <td className="border p-2">{comp.version}</td>
              <td className="border p-2">
                <span className={`px-2 py-1 rounded ${comp.status === 'deprecated' ? 'bg-red-200' : 'bg-green-200'}`}>
                  {comp.status}
                </span>
              </td>
              <td className="border p-2">{comp.lastAudit}</td>
              <td className="border p-2">
                <button 
                  onClick={() => runAudit(comp.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Audit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Pipeline25_TechStackIntegration;