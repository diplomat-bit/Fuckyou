import React from 'react';
import Card from '../../Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

const deliverabilityData = [
    { name: 'Mon', email: 99.8, sms: 99.5 }, { name: 'Tue', email: 99.9, sms: 99.6 },
    { name: 'Wed', email: 99.7, sms: 99.4 }, { name: 'Thu', email: 99.9, sms: 99.7 },
    { name: 'Fri', email: 99.8, sms: 99.5 }, { name: 'Sat', email: 99.9, sms: 99.8 },
    { name: 'Sun', email: 99.9, sms: 99.7 },
];

const usageData = [
    { name: 'Email', count: 1250000 },
    { name: 'SMS', count: 850000 },
    { name: 'Voice', count: 50000 },
];

const DemoBankCommunicationsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Communications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">1.25M</p><p className="text-sm text-gray-400 mt-1">Emails Sent (30d)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">850k</p><p className="text-sm text-gray-400 mt-1">SMS Sent (30d)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">50k</p><p className="text-sm text-gray-400 mt-1">Voice Minutes (30d)</p></Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Usage by Channel">
                    <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={usageData}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Bar dataKey="count" name="Messages/Minutes" fill="#06b6d4" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Deliverability Rate (%)">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={deliverabilityData}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" domain={[98, 100]} unit="%" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                            <Line type="monotone" dataKey="email" stroke="#8884d8" name="Email" />
                            <Line type="monotone" dataKey="sms" stroke="#82ca9d" name="SMS" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default DemoBankCommunicationsView;