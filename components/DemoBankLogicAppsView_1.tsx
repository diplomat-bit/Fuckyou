import React from 'react';
import Card from '../../Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

const runHistoryData = [
    { name: 'Mon', Succeeded: 120, Failed: 5 }, { name: 'Tue', Succeeded: 135, Failed: 2 },
    { name: 'Wed', Succeeded: 110, Failed: 8 }, { name: 'Thu', Succeeded: 150, Failed: 1 },
    { name: 'Fri', Succeeded: 180, Failed: 3 }, { name: 'Sat', Succeeded: 90, Failed: 0 },
    { name: 'Sun', Succeeded: 85, Failed: 1 },
];

const logicApps = [
    { id: 1, name: 'Onboarding Workflow', trigger: 'HTTP Request', status: 'Enabled' },
    { id: 2, name: 'Daily Report Generator', trigger: 'Recurrence (24h)', status: 'Enabled' },
    { id: 3, name: 'Transaction Alerting', trigger: 'Event: transaction.created', status: 'Enabled' },
    { id: 4, name: 'Archive Old Records', trigger: 'Recurrence (30d)', status: 'Disabled' },
];

const DemoBankLogicAppsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Logic Apps</h2>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">4</p><p className="text-sm text-gray-400 mt-1">Logic Apps</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">870</p><p className="text-sm text-gray-400 mt-1">Runs (7d)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">2.3%</p><p className="text-sm text-gray-400 mt-1">Failure Rate</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">1.2s</p><p className="text-sm text-gray-400 mt-1">Avg. Duration</p></Card>
            </div>
            
            <Card title="Run History (Last 7 Days)">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={runHistoryData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Legend />
                        <Bar dataKey="Succeeded" stackId="a" fill="#82ca9d" />
                        <Bar dataKey="Failed" stackId="a" fill="#ef4444" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Logic Apps">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Trigger</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logicApps.map(app => (
                                <tr key={app.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{app.name}</td>
                                    <td className="px-6 py-4 font-mono">{app.trigger}</td>
                                    <td className="px-6 py-4"><input type="checkbox" className="toggle toggle-cyan" defaultChecked={app.status === 'Enabled'} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankLogicAppsView;