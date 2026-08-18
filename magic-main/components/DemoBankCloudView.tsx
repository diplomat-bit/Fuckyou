import React from 'react';
import Card from '../../Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

// In a real app, this data would come from a dedicated file or a live API call
const usageData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  cpu: 40 + Math.random() * 30,
  memory: 55 + Math.random() * 20,
}));
const costData = [
    { name: 'Compute', cost: 12500 },
    { name: 'Storage', cost: 8500 },
    { name: 'Networking', cost: 4500 },
    { name: 'AI/ML', cost: 15000 },
];
const activeServices = [
    { id: 1, name: 'Quantum VM-01', type: 'Compute', status: 'Running' },
    { id: 2, name: 'DataLake-Prod', type: 'Storage', status: 'Available' },
    { id: 3, name: 'Inference-API', type: 'AI Platform', status: 'Running' },
    { id: 4, name: 'Main-VPC', type: 'Networking', status: 'Available' },
];

const DemoBankCloudView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Cloud</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">42</p><p className="text-sm text-gray-400 mt-1">Active Services</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">99.99%</p><p className="text-sm text-gray-400 mt-1">Uptime (30d)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">$40.5k</p><p className="text-sm text-gray-400 mt-1">Month-to-Date Cost</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">3</p><p className="text-sm text-gray-400 mt-1">Active Alerts</p></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Resource Usage (%)">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={usageData}>
                             <defs>
                                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient>
                                <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/><stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/></linearGradient>
                            </defs>
                            <XAxis dataKey="day" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" domain={[0, 100]} unit="%" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                            <Area type="monotone" dataKey="cpu" stroke="#8884d8" fill="url(#colorCpu)" name="CPU" />
                            <Area type="monotone" dataKey="memory" stroke="#82ca9d" fill="url(#colorMemory)" name="Memory" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Cost Analysis by Service">
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={costData} layout="vertical">
                            <XAxis type="number" stroke="#9ca3af" unit="$" />
                            <YAxis type="category" dataKey="name" stroke="#9ca3af" width={80} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Bar dataKey="cost" fill="#06b6d4" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card title="Active Services">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Service Name</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activeServices.map(service => (
                                <tr key={service.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white">{service.name}</td>
                                    <td className="px-6 py-4">{service.type}</td>
                                    <td className="px-6 py-4"><span className="text-green-400">{service.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankCloudView;
