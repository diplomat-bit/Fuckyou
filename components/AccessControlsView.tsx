import React, { useContext, useMemo, useState } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AccessLog } from '../../../../types';

const AccessControlsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("AccessControlsView must be within a DataProvider");
    
    const { accessLogs } = context;
    const [filter, setFilter] = useState<'all' | 'Success' | 'Failed'>('all');

    const filteredLogs = useMemo(() => {
        return accessLogs.filter(log => filter === 'all' || log.status === filter);
    }, [accessLogs, filter]);

    const kpiData = useMemo(() => ({
        totalUsers: new Set(accessLogs.map(log => log.user)).size,
        failedLogins24h: accessLogs.filter(log => log.status === 'Failed').length,
        highRiskEvents: accessLogs.filter(log => log.riskLevel === 'High').length,
    }), [accessLogs]);

    const chartData = useMemo(() => {
        const dataByHour: { [key: string]: { success: number, failed: number } } = {};
        accessLogs.forEach(log => {
            const hour = new Date(log.timestamp).getHours();
            const key = `${String(hour).padStart(2, '0')}:00`;
            if (!dataByHour[key]) dataByHour[key] = { success: 0, failed: 0 };
            if (log.status === 'Success') dataByHour[key].success++;
            else dataByHour[key].failed++;
        });
        return Object.entries(dataByHour).map(([hour, counts]) => ({ hour, ...counts })).sort((a,b) => a.hour.localeCompare(b.hour));
    }, [accessLogs]);

    const RiskBadge: React.FC<{ level: AccessLog['riskLevel'] }> = ({ level }) => {
        const colors = {
            'Low': 'bg-green-500/20 text-green-300',
            'Medium': 'bg-yellow-500/20 text-yellow-300',
            'High': 'bg-red-500/20 text-red-300',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[level]}`}>{level}</span>;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Access Controls Dashboard</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">{kpiData.totalUsers}</p><p className="text-sm text-gray-400 mt-1">Total Users</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">25</p><p className="text-sm text-gray-400 mt-1">Active Roles</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-red-400">{kpiData.failedLogins24h}</p><p className="text-sm text-gray-400 mt-1">Failed Logins (24h)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-orange-400">{kpiData.highRiskEvents}</p><p className="text-sm text-gray-400 mt-1">High-Risk Events (24h)</p></Card>
            </div>

            <Card title="Login Attempts (Last 24 hours)">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                        <Legend />
                        <Line type="monotone" dataKey="success" name="Successful" stroke="#10b981" dot={false} />
                        <Line type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">Recent Access Events</h3>
                     <div className="flex space-x-1 p-1 bg-gray-900/50 rounded-lg">
                        {(['all', 'Success', 'Failed'] as const).map(status => (
                            <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1 text-sm rounded-md ${filter === status ? 'bg-cyan-600' : ''}`}>{status}</button>
                        ))}
                    </div>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">User</th>
                                <th scope="col" className="px-6 py-3">IP Address</th>
                                <th scope="col" className="px-6 py-3">Location</th>
                                <th scope="col" className="px-6 py-3">Time</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Risk Level</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{log.user}</td>
                                    <td className="px-6 py-4 font-mono">{log.ip}</td>
                                    <td className="px-6 py-4">{log.location}</td>
                                    <td className="px-6 py-4">{log.timestamp}</td>
                                    <td className="px-6 py-4"><span className={log.status === 'Success' ? 'text-green-400' : 'text-red-400'}>{log.status}</span></td>
                                    <td className="px-6 py-4"><RiskBadge level={log.riskLevel} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AccessControlsView;
