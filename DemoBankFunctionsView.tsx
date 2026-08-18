import React from 'react';
import Card from '../../Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const executionDurationData = [
    { name: 'Mon', duration: 120 }, { name: 'Tue', duration: 125 }, { name: 'Wed', duration: 110 },
    { name: 'Thu', duration: 135 }, { name: 'Fri', duration: 140 }, { name: 'Sat', duration: 100 },
    { name: 'Sun', duration: 95 },
];

const functions = [
    { id: 1, name: 'notify-security-team', runtime: 'Node.js 18', memory: '256MB', status: 'Active' },
    { id: 2, name: 'process-new-transaction', runtime: 'Python 3.9', memory: '512MB', status: 'Active' },
    { id: 3, name: 'generate-daily-report', runtime: 'Go 1.19', memory: '128MB', status: 'Active' },
    { id: 4, name: 'image-resize-worker', runtime: 'Node.js 18', memory: '1024MB', status: 'Inactive' },
];

const DemoBankFunctionsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Functions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">4</p><p className="text-sm text-gray-400 mt-1">Functions</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">2.5M</p><p className="text-sm text-gray-400 mt-1">Executions (30d)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">0.05%</p><p className="text-sm text-gray-400 mt-1">Error Rate</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">122ms</p><p className="text-sm text-gray-400 mt-1">Avg. Duration</p></Card>
            </div>
            
            <Card title="Average Execution Duration (ms)">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={executionDurationData}>
                        <defs><linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Area type="monotone" dataKey="duration" stroke="#ef4444" fill="url(#colorDuration)" />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Functions">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Function Name</th>
                                <th scope="col" className="px-6 py-3">Runtime</th>
                                <th scope="col" className="px-6 py-3">Memory</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {functions.map(func => (
                                <tr key={func.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white">{func.name}</td>
                                    <td className="px-6 py-4">{func.runtime}</td>
                                    <td className="px-6 py-4">{func.memory}</td>
                                    <td className="px-6 py-4"><span className={`${func.status === 'Active' ? 'text-green-400' : 'text-gray-500'}`}>{func.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankFunctionsView;