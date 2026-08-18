import React from 'react';
import Card from '../../Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const threatsData = [
    { name: 'Malware', value: 12 },
    { name: 'Phishing', value: 35 },
    { name: 'Anomalous Activity', value: 8 },
    { name: 'Brute Force', value: 22 },
];
const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308'];

const activeAlerts = [
    { id: 1, severity: 'High', title: 'Anomalous Login from Unrecognized IP', time: '5m ago' },
    { id: 2, severity: 'Critical', title: 'Potential Malware Detected on `web-prod-02`', time: '15m ago' },
    { id: 3, severity: 'Medium', title: 'Multiple Failed Login Attempts for `admin`', time: '1h ago' },
    { id: 4, severity: 'Low', title: 'Outdated Security Patch on `db-main-01`', time: '3h ago' },
];

const SeverityBadge: React.FC<{ severity: string }> = ({ severity }) => {
    const colorMap: { [key: string]: string } = {
        'Critical': 'bg-red-500/50 text-red-200 border-red-500',
        'High': 'bg-orange-500/50 text-orange-200 border-orange-500',
        'Medium': 'bg-yellow-500/50 text-yellow-200 border-yellow-500',
        'Low': 'bg-blue-500/50 text-blue-200 border-blue-500',
    };
    return <span className={`px-2 py-1 text-xs font-bold rounded-full border ${colorMap[severity] || ''}`}>{severity}</span>;
}

const DemoBankSecurityCenterView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Security Center</h2>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-red-400">4</p><p className="text-sm text-gray-400 mt-1">Active Alerts</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">77</p><p className="text-sm text-gray-400 mt-1">Events (24h)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">98%</p><p className="text-sm text-gray-400 mt-1">Resources Protected</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">A+</p><p className="text-sm text-gray-400 mt-1">Compliance Score</p></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Threats by Type (Last 24h)">
                    <ResponsiveContainer width="100%" height={300}>
                         <PieChart>
                            <Pie data={threatsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false}>
                                {threatsData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
                 <Card title="Active Alerts">
                     <div className="space-y-3">
                        {activeAlerts.map(alert => (
                            <div key={alert.id} className="p-3 bg-gray-900/50 rounded-lg flex items-start gap-3">
                                <SeverityBadge severity={alert.severity} />
                                <div>
                                    <p className="text-sm text-white">{alert.title}</p>
                                    <p className="text-xs text-gray-400">{alert.time}</p>
                                </div>
                            </div>
                        ))}
                     </div>
                </Card>
            </div>
        </div>
    );
};

export default DemoBankSecurityCenterView;