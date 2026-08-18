import React from 'react';
import Card from '../../Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// In a real app, this data would come from a dedicated file or a live API call
const authEventsData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  success: 1800 + Math.random() * 400,
  failed: 20 + Math.random() * 25,
}));
const recentSignIns = [
    { id: 1, user: 'visionary@demobank.com', ip: '192.168.1.1', location: 'New York, USA', status: 'Success' },
    { id: 2, user: 'alex.c@quantum.corp', ip: '203.0.113.5', location: 'Tokyo, Japan', status: 'Success' },
    { id: 3, user: 'brenda.r@quantum.corp', ip: '198.51.100.2', location: 'London, UK', status: 'Failed: MFA' },
    { id: 4, user: 'visionary@demobank.com', ip: '192.168.1.1', location: 'New York, USA', status: 'Success' },
];

const DemoBankIdentityView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Identity</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">1,250</p><p className="text-sm text-gray-400 mt-1">Total Users</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">85</p><p className="text-sm text-gray-400 mt-1">Active Sessions</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">42</p><p className="text-sm text-gray-400 mt-1">Failed Logins (24h)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">98%</p><p className="text-sm text-gray-400 mt-1">MFA Adoption</p></Card>
            </div>
            
            <Card title="Authentication Events (Last 30 Days)">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={authEventsData}>
                        <XAxis dataKey="day" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="success" stroke="#10b981" name="Successful Logins" dot={false} />
                        <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed Logins" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
            
            <Card title="Recent Sign-in Activity">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">User</th>
                                <th scope="col" className="px-6 py-3">IP Address</th>
                                <th scope="col" className="px-6 py-3">Location</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSignIns.map(signIn => (
                                <tr key={signIn.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{signIn.user}</td>
                                    <td className="px-6 py-4 font-mono">{signIn.ip}</td>
                                    <td className="px-6 py-4">{signIn.location}</td>
                                    <td className="px-6 py-4">
                                        <span className={`${signIn.status === 'Success' ? 'text-green-400' : 'text-red-400'}`}>{signIn.status}</span>
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

export default DemoBankIdentityView;
