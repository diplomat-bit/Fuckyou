import React from 'react';
import Card from '../../Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const queryPerformanceData = [
    { name: 'Mon', duration: 2.5 }, { name: 'Tue', duration: 2.8 }, { name: 'Wed', duration: 2.3 },
    { name: 'Thu', duration: 3.1 }, { name: 'Fri', duration: 3.5 }, { name: 'Sat', duration: 1.8 },
    { name: 'Sun', duration: 1.5 },
];

const popularDatasets = [
    { id: 1, name: 'transactions_clean', size: '1.2 TB', queries: 1520 },
    { id: 2, name: 'customer_360', size: '800 GB', queries: 1250 },
    { id: 3, name: 'product_catalog', size: '50 GB', queries: 850 },
    { id: 4, name: 'web_logs_partitioned', size: '12 TB', queries: 680 },
];

const DemoBankAnalyticsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">5</p><p className="text-sm text-gray-400 mt-1">Analytics Workspaces</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">5.2k</p><p className="text-sm text-gray-400 mt-1">Queries Run (24h)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">2.6s</p><p className="text-sm text-gray-400 mt-1">Avg. Query Duration</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">15 TB</p><p className="text-sm text-gray-400 mt-1">Data Scanned (24h)</p></Card>
            </div>
            
            <Card title="Average Query Duration (seconds)">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={queryPerformanceData}>
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" unit="s" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Line type="monotone" dataKey="duration" stroke="#f59e0b" name="Avg Duration" />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Popular Datasets">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Dataset Name</th>
                                <th scope="col" className="px-6 py-3">Size</th>
                                <th scope="col" className="px-6 py-3">Queries (24h)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {popularDatasets.map(d => (
                                <tr key={d.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white">{d.name}</td>
                                    <td className="px-6 py-4">{d.size}</td>
                                    <td className="px-6 py-4">{d.queries.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankAnalyticsView;