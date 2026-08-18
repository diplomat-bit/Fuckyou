import React from 'react';
import Card from '../../Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const taskRunsData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    runs: 5000 + Math.random() * 2000,
}));

const activeFlows = [
    { id: 1, name: 'When new Invoice is Paid, send Slack notification', status: 'Enabled', lastRun: '5m ago' },
    { id: 2, name: 'Create new CRM contact from new Counterparty', status: 'Enabled', lastRun: '1h ago' },
    { id: 3, name: 'Sync daily transactions to QuantumBooks', status: 'Enabled', lastRun: '3h ago' },
    { id: 4, name: 'If corporate card spend > $1000, request approval', status: 'Disabled', lastRun: '2d ago' },
];

const DemoBankConnectView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Connect</h2>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">4</p><p className="text-sm text-gray-400 mt-1">Active Flows</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">50+</p><p className="text-sm text-gray-400 mt-1">Connectors</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">150k</p><p className="text-sm text-gray-400 mt-1">Task Runs (30d)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">99.8%</p><p className="text-sm text-gray-400 mt-1">Success Rate</p></Card>
            </div>
            
            <Card title="Task Runs (Last 30 Days)">
                 <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={taskRunsData}>
                        <defs><linearGradient id="colorRuns" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="day" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Area type="monotone" dataKey="runs" stroke="#6366f1" fill="url(#colorRuns)" name="Task Runs" />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            <Card title="My Flows">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Flow Name</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Last Run</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeFlows.map(flow => (
                                <tr key={flow.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{flow.name}</td>
                                    <td className="px-6 py-4"><input type="checkbox" className="toggle toggle-cyan" defaultChecked={flow.status === 'Enabled'} /></td>
                                    <td className="px-6 py-4">{flow.lastRun}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankConnectView;