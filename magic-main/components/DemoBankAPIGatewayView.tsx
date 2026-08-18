import React from 'react';
import Card from '../../Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line } from 'recharts';

// In a real app, this data would come from a dedicated file or a live API call
const trafficData = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  requests: 1500 + Math.sin(i / 4) * 500 + Math.random() * 300,
}));
const latencyData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  p95: 120 + Math.random() * 20,
  p99: 180 + Math.random() * 40,
}));
const endpoints = [
    { id: 1, method: 'GET', path: '/v1/users/me', avgLatency: '85ms', errorRate: '0.1%', status: 'Healthy' },
    { id: 2, method: 'POST', path: '/v1/transactions', avgLatency: '120ms', errorRate: '0.3%', status: 'Healthy' },
    { id: 3, method: 'GET', path: '/v1/ai/advisor/chat', avgLatency: '450ms', errorRate: '1.2%', status: 'Degraded' },
    { id: 4, method: 'POST', path: '/v1/payments/send', avgLatency: '150ms', errorRate: '0.0%', status: 'Healthy' },
];

const DemoBankAPIGatewayView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank API Gateway</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">1.2M</p><p className="text-sm text-gray-400 mt-1">Requests (24h)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">0.8%</p><p className="text-sm text-gray-400 mt-1">Error Rate (24h)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">112ms</p><p className="text-sm text-gray-400 mt-1">Avg. Latency</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">99.98%</p><p className="text-sm text-gray-400 mt-1">Uptime</p></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="API Traffic (Last 24 hours)">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={trafficData}>
                            <defs><linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient></defs>
                            <XAxis dataKey="hour" stroke="#9ca3af" fontSize={10} />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Area type="monotone" dataKey="requests" stroke="#0ea5e9" fill="url(#colorRequests)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="P95/P99 Latency (ms)">
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={latencyData}>
                            <XAxis dataKey="day" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Line type="monotone" dataKey="p95" stroke="#8884d8" name="P95 Latency" />
                            <Line type="monotone" dataKey="p99" stroke="#f43f5e" name="P99 Latency" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card title="API Endpoints">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Method</th>
                                <th scope="col" className="px-6 py-3">Path</th>
                                <th scope="col" className="px-6 py-3">Avg. Latency</th>
                                <th scope="col" className="px-6 py-3">Error Rate</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {endpoints.map(ep => (
                                <tr key={ep.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4"><span className={`px-2 py-0.5 text-xs rounded-full ${ep.method === 'GET' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-green-500/20 text-green-300'}`}>{ep.method}</span></td>
                                    <td className="px-6 py-4 font-mono text-white">{ep.path}</td>
                                    <td className="px-6 py-4">{ep.avgLatency}</td>
                                    <td className="px-6 py-4">{ep.errorRate}</td>
                                    <td className="px-6 py-4"><span className={`${ep.status === 'Healthy' ? 'text-green-400' : 'text-yellow-400'}`}>{ep.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankAPIGatewayView;
