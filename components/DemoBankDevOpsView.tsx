import React from 'react';
import Card from '../../Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';

const buildDurationData = [
    { name: 'Build #501', duration: 5.2 }, { name: 'Build #502', duration: 5.5 },
    { name: 'Build #503', duration: 4.8 }, { name: 'Build #504', duration: 6.1 },
    { name: 'Build #505', duration: 5.4 }, { name: 'Build #506', duration: 5.8 },
];

const deploymentFrequencyData = [
    { name: 'Jan', deployments: 22 }, { name: 'Feb', deployments: 25 }, { name: 'Mar', deployments: 30 },
    { name: 'Apr', deployments: 28 }, { name: 'May', deployments: 35 }, { name: 'Jun', deployments: 42 },
];

const recentDeployments = [
    { id: 1, service: 'API Gateway', version: 'v1.25.3', status: 'Success', date: '2h ago' },
    { id: 2, service: 'Frontend App', version: 'v2.10.1', status: 'Success', date: '8h ago' },
    { id: 3, service: 'Transactions API', version: 'v1.15.0', status: 'Failed', date: '1d ago' },
    { id: 4, service: 'AI Advisor API', version: 'v1.8.2', status: 'Success', date: '2d ago' },
];

const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const DemoBankDevOpsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank DevOps</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">42</p><p className="text-sm text-gray-400 mt-1">Deployments (MTH)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">2.5%</p><p className="text-sm text-gray-400 mt-1">Change Failure Rate</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">5.4m</p><p className="text-sm text-gray-400 mt-1">Avg. Build Duration</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">15m</p><p className="text-sm text-gray-400 mt-1">Mean Time to Restore</p></Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Average Build Duration (minutes)">
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={buildDurationData}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" domain={[4, 7]} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Line type="monotone" dataKey="duration" stroke="#8884d8" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Deployment Frequency">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={deploymentFrequencyData}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Bar dataKey="deployments" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card title="Recent Deployments">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Service</th>
                                <th scope="col" className="px-6 py-3">Version</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentDeployments.map(dep => (
                                <tr key={dep.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4">{dep.status === 'Success' ? <CheckCircleIcon /> : <XCircleIcon />}</td>
                                    <td className="px-6 py-4 font-medium text-white">{dep.service}</td>
                                    <td className="px-6 py-4 font-mono">{dep.version}</td>
                                    <td className="px-6 py-4">{dep.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankDevOpsView;