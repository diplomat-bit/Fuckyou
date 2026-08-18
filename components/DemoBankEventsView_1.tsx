import React from 'react';
import Card from '../../Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const eventTrafficData = [
    { name: '12:00', Published: 1200, Delivered: 1198 },
    { name: '13:00', Published: 1500, Delivered: 1500 },
    { name: '14:00', Published: 1300, Delivered: 1299 },
    { name: '15:00', Published: 1800, Delivered: 1800 },
    { name: '16:00', Published: 2200, Delivered: 2195 },
];

const eventSubscriptions = [
    { id: 1, topic: 'db.transactions.created', destination: 'Webhook: transaction-processor', status: 'Active' },
    { id: 2, topic: 'db.anomalies.detected', destination: 'Function: notify-security-team', status: 'Active' },
    { id: 3, topic: 'db.payments.status_changed', destination: 'LogicApp: update-erp-system', status: 'Active' },
    { id: 4, topic: 'db.users.created', destination: 'Webhook: crm-sync', status: 'Error' },
];

const DemoBankEventsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Events</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">12</p><p className="text-sm text-gray-400 mt-1">Event Topics</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">4</p><p className="text-sm text-gray-400 mt-1">Subscriptions</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">8k</p><p className="text-sm text-gray-400 mt-1">Events/hr (avg)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">0.1%</p><p className="text-sm text-gray-400 mt-1">Delivery Failure Rate</p></Card>
            </div>
            
            <Card title="Event Traffic (Events per Hour)">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={eventTrafficData}>
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="Published" stroke="#8884d8" />
                        <Line type="monotone" dataKey="Delivered" stroke="#82ca9d" />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Event Subscriptions">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Topic</th>
                                <th scope="col" className="px-6 py-3">Destination</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventSubscriptions.map(sub => (
                                <tr key={sub.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white">{sub.topic}</td>
                                    <td className="px-6 py-4 font-mono">{sub.destination}</td>
                                    <td className="px-6 py-4"><span className={`${sub.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>{sub.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankEventsView;