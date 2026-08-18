import React from 'react';
import Card from '../../Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

const pipelineRunsData = [
    { name: 'Mon', Succeeded: 25, Failed: 2 }, { name: 'Tue', Succeeded: 28, Failed: 1 },
    { name: 'Wed', Succeeded: 24, Failed: 3 }, { name: 'Thu', Succeeded: 30, Failed: 0 },
    { name: 'Fri', Succeeded: 32, Failed: 1 }, { name: 'Sat', Succeeded: 15, Failed: 0 },
    { name: 'Sun', Succeeded: 14, Failed: 0 },
];

const dataProcessedData = [
    { name: 'CRM Sync', TB: 1.2 }, { name: 'ERP Load', TB: 5.5 },
    { name: 'Log Ingestion', TB: 12.8 }, { name: 'BI Refresh', TB: 8.1 },
];

const pipelines = [
    { id: 1, name: 'Hourly CRM-to-Datalake Sync', trigger: 'Schedule', lastRunStatus: 'Succeeded' },
    { id: 2, name: 'Daily ERP Data Warehouse Load', trigger: 'Schedule', lastRunStatus: 'Succeeded' },
    { id: 3, name: 'Realtime Log Ingestion', trigger: 'Event', lastRunStatus: 'Succeeded' },
    { id: 4, name: 'End-of-Month Reporting', trigger: 'Schedule', lastRunStatus: 'Failed' },
];

const DemoBankDataFactoryView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Data Factory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">4</p><p className="text-sm text-gray-400 mt-1">Pipelines</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">168</p><p className="text-sm text-gray-400 mt-1">Runs (7d)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">4.2%</p><p className="text-sm text-gray-400 mt-1">Failure Rate</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">27.6 TB</p><p className="text-sm text-gray-400 mt-1">Data Processed (24h)</p></Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Pipeline Runs (Last 7 Days)">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={pipelineRunsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                            <Bar dataKey="Succeeded" stackId="a" fill="#82ca9d" />
                            <Bar dataKey="Failed" stackId="a" fill="#ef4444" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Data Processed by Pipeline (TB)">
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dataProcessedData} layout="vertical">
                            <XAxis type="number" stroke="#9ca3af" />
                            <YAxis type="category" dataKey="name" stroke="#9ca3af" width={100} fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Bar dataKey="TB" fill="#06b6d4" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card title="Pipelines">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Pipeline Name</th>
                                <th scope="col" className="px-6 py-3">Trigger</th>
                                <th scope="col" className="px-6 py-3">Last Run Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pipelines.map(p => (
                                <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                                    <td className="px-6 py-4">{p.trigger}</td>
                                    <td className="px-6 py-4"><span className={`${p.lastRunStatus === 'Succeeded' ? 'text-green-400' : 'text-red-400'}`}>{p.lastRunStatus}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankDataFactoryView;