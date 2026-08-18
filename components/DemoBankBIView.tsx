import React from 'react';
import Card from '../../Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const reportLoadTimeData = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    'Load Time (s)': 2.5 + Math.random(),
}));

const popularDashboards = [
    { id: 1, name: 'Executive KPI Dashboard', views: 1250, owner: 'The Visionary' },
    { id: 2, name: 'Sales Performance Q2', views: 880, owner: 'Sales Team' },
    { id: 3, name: 'Marketing Campaign ROI', views: 720, owner: 'Marketing Team' },
    { id: 4, name: 'Product Usage Analytics', views: 650, owner: 'Product Team' },
];

const DemoBankBIView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank BI</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">42</p><p className="text-sm text-gray-400 mt-1">Dashboards</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">120</p><p className="text-sm text-gray-400 mt-1">Reports</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">2.8k</p><p className="text-sm text-gray-400 mt-1">Views (24h)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">3.1s</p><p className="text-sm text-gray-400 mt-1">Avg. Load Time</p></Card>
            </div>
            
            <Card title="Average Report Load Time (seconds)">
                 <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={reportLoadTimeData}>
                        <defs><linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="day" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" unit="s" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Area type="monotone" dataKey="Load Time (s)" stroke="#8884d8" fill="url(#colorLoad)" />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Popular Dashboards">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Dashboard Name</th>
                                <th scope="col" className="px-6 py-3">Owner</th>
                                <th scope="col" className="px-6 py-3">Views (30d)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {popularDashboards.map(d => (
                                <tr key={d.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{d.name}</td>
                                    <td className="px-6 py-4">{d.owner}</td>
                                    <td className="px-6 py-4">{d.views.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankBIView;