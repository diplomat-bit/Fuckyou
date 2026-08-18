import React from 'react';
import Card from '../../Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const controlStatusData = [
    { name: 'SOC 2', Passed: 320, Failed: 12, 'Not Applicable': 50 },
    { name: 'ISO 27001', Passed: 450, Failed: 25, 'Not Applicable': 80 },
    { name: 'PCI DSS', Passed: 280, Failed: 5, 'Not Applicable': 120 },
    { name: 'HIPAA', Passed: 150, Failed: 8, 'Not Applicable:': 250 },
];

const activeAudits = [
    { id: 1, framework: 'SOC 2 Type II', auditor: 'CyberTrust LLP', status: 'In Progress', dueDate: '2024-09-30' },
    { id: 2, framework: 'PCI DSS 4.0', auditor: 'SecurePay Auditors', status: 'Scheduled', dueDate: '2024-10-15' },
];

const DemoBankComplianceHubView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Compliance Hub</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">4</p><p className="text-sm text-gray-400 mt-1">Frameworks Covered</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">96%</p><p className="text-sm text-gray-400 mt-1">Controls Passing</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">50</p><p className="text-sm text-gray-400 mt-1">Failing Controls</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">2</p><p className="text-sm text-gray-400 mt-1">Active Audits</p></Card>
            </div>
            
            <Card title="Controls Status by Framework">
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={controlStatusData} layout="vertical" stackOffset="expand">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" stroke="#9ca3af" width={80} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Legend />
                        <Bar dataKey="Passed" stackId="a" fill="#10b981" />
                        <Bar dataKey="Failed" stackId="a" fill="#ef4444" />
                        <Bar dataKey="Not Applicable" stackId="a" fill="#6b7280" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Active Audits">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Framework</th>
                                <th scope="col" className="px-6 py-3">Auditor</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeAudits.map(audit => (
                                <tr key={audit.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{audit.framework}</td>
                                    <td className="px-6 py-4">{audit.auditor}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${audit.status === 'In Progress' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-blue-500/20 text-blue-300'}`}>{audit.status}</span></td>
                                    <td className="px-6 py-4">{audit.dueDate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankComplianceHubView;