import React from 'react';
import Card from '../../Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// In a real app, this data would come from a dedicated file or a live API call
const cpuUtilizationData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  'us-east-1': 50 + Math.sin(i / 3) * 20 + Math.random() * 10,
  'eu-west-2': 40 + Math.sin(i / 4) * 15 + Math.random() * 10,
}));
const networkData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  'Network In (Gbps)': 10 + Math.random() * 5,
  'Network Out (Gbps)': 8 + Math.random() * 4,
}));
const vmInstances = [
    { id: 1, name: 'web-prod-01', region: 'us-east-1', type: 'c5.2xlarge', status: 'Running' },
    { id: 2, name: 'web-prod-02', region: 'us-east-1', type: 'c5.2xlarge', status: 'Running' },
    { id: 3, name: 'db-main-01', region: 'us-east-1', type: 'r5.4xlarge', status: 'Running' },
    { id: 4, name: 'batch-worker-eu', region: 'eu-west-2', type: 'm5.large', status: 'Stopped' },
];

const DemoBankComputerView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Compute</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">4</p><p className="text-sm text-gray-400 mt-1">Total Instances</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">3</p><p className="text-sm text-gray-400 mt-1">Running</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">1</p><p className="text-sm text-gray-400 mt-1">Stopped</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">2</p><p className="text-sm text-gray-400 mt-1">Regions</p></Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="CPU Utilization (%) by Region">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={cpuUtilizationData}>
                            <XAxis dataKey="hour" stroke="#9ca3af" fontSize={10} />
                            <YAxis stroke="#9ca3af" domain={[0, 100]} unit="%" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                            <Line type="monotone" dataKey="us-east-1" stroke="#8884d8" dot={false} />
                            <Line type="monotone" dataKey="eu-west-2" stroke="#82ca9d" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Network Traffic (Gbps)">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={networkData}>
                            <XAxis dataKey="day" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                            <Line type="monotone" dataKey="Network In (Gbps)" stroke="#0ea5e9" dot={false} />
                            <Line type="monotone" dataKey="Network Out (Gbps)" stroke="#f43f5e" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
            <Card title="Virtual Machine Instances">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Instance Name</th>
                                <th scope="col" className="px-6 py-3">Region</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vmInstances.map(vm => (
                                <tr key={vm.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white">{vm.name}</td>
                                    <td className="px-6 py-4">{vm.region}</td>
                                    <td className="px-6 py-4 font-mono">{vm.type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs rounded-full ${vm.status === 'Running' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>{vm.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankComputerView;
