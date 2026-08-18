import React from 'react';
import Card from '../../Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const messageVolumeData = [
    { hour: '12:00', received: 1.2, sent: 0.8 }, { hour: '13:00', received: 1.5, sent: 1.1 },
    { hour: '14:00', received: 1.4, sent: 0.9 }, { hour: '15:00', received: 1.8, sent: 1.3 },
    { hour: '16:00', received: 2.1, sent: 1.5 }, { hour: '17:00', received: 1.9, sent: 1.2 },
];

const devices = [
    { id: 'sensor-temp-001', type: 'Temperature Sensor', status: 'Online', lastMessage: '2s ago' },
    { id: 'pos-terminal-042', type: 'Point-of-Sale', status: 'Online', lastMessage: '5s ago' },
    { id: 'atm-main-lobby', type: 'ATM', status: 'Offline', lastMessage: '1h ago' },
    { id: 'fleet-vehicle-A1', type: 'GPS Tracker', status: 'Online', lastMessage: '15s ago' },
];

const DemoBankIoTHubView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank IoT Hub</h2>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">10,000</p><p className="text-sm text-gray-400 mt-1">Total Devices</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">9,850</p><p className="text-sm text-gray-400 mt-1">Online Devices</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">10.2M</p><p className="text-sm text-gray-400 mt-1">Messages (24h)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">1</p><p className="text-sm text-gray-400 mt-1">Alert</p></Card>
            </div>
            
            <Card title="Message Volume (Millions)">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={messageVolumeData}>
                        <XAxis dataKey="hour" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Legend />
                        <Bar dataKey="received" name="Device-to-Cloud" fill="#8884d8" />
                        <Bar dataKey="sent" name="Cloud-to-Device" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Registered Devices">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Device ID</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Last Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map(d => (
                                <tr key={d.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white">{d.id}</td>
                                    <td className="px-6 py-4">{d.type}</td>
                                    <td className="px-6 py-4"><span className={`${d.status === 'Online' ? 'text-green-400' : 'text-red-400'}`}>{d.status}</span></td>
                                    <td className="px-6 py-4">{d.lastMessage}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankIoTHubView;