

// --- CONSOLIDATED FROM: ./pipelines/Pipeline23_SupplyChainMapping.tsx ---

import React, { useState, useEffect } from 'react';

interface SupplyChainNode {
  id: string;
  name: string;
  tier: number;
  status: 'verified' | 'pending' | 'flagged';
  riskScore: number;
}

interface AuditResult {
  nodeId: string;
  timestamp: string;
  compliance: boolean;
  notes: string;
}

const Pipeline23_SupplyChainMapping: React.FC = () => {
  const [nodes, setNodes] = useState<SupplyChainNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [auditLogs, setAuditLogs] = useState<AuditResult[]>([]);

  useEffect(() => {
    // Simulate fetching supply chain dependency data
    const fetchData = async () => {
      setLoading(true);
      try {
        const mockData: SupplyChainNode[] = [
          { id: 'n1', name: 'Raw Material Supplier A', tier: 1, status: 'verified', riskScore: 12 },
          { id: 'n2', name: 'Component Manufacturer B', tier: 2, status: 'flagged', riskScore: 85 },
          { id: 'n3', name: 'Logistics Provider C', tier: 3, status: 'pending', riskScore: 45 },
        ];
        setNodes(mockData);
      } catch (error) {
        console.error('Failed to fetch supply chain data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const runAudit = (nodeId: string) => {
    const newAudit: AuditResult = {
      nodeId,
      timestamp: new Date().toISOString(),
      compliance: Math.random() > 0.2,
      notes: 'Automated dependency integrity check completed.',
    };
    setAuditLogs((prev) => [newAudit, ...prev]);
  };

  if (loading) return <div>Loading Supply Chain Mapping...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Pipeline 23: Supply Chain Mapping & Audit</h1>
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Node Name</th>
            <th className="border p-2">Tier</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Risk Score</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {nodes.map((node) => (
            <tr key={node.id}>
              <td className="border p-2">{node.name}</td>
              <td className="border p-2 text-center">{node.tier}</td>
              <td className="border p-2 capitalize">{node.status}</td>
              <td className="border p-2 text-center">{node.riskScore}</td>
              <td className="border p-2 text-center">
                <button 
                  onClick={() => runAudit(node.id)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Audit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Recent Audit Logs</h2>
        <ul className="space-y-2">
          {auditLogs.map((log, idx) => (
            <li key={idx} className="p-3 border rounded bg-gray-50 text-sm">
              <span className="font-mono">{log.timestamp}</span> - Node {log.nodeId}: 
              <span className={log.compliance ? 'text-green-600' : 'text-red-600'}>
                {log.compliance ? ' Compliant' : ' Non-Compliant'}
              </span> - {log.notes}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Pipeline23_SupplyChainMapping;