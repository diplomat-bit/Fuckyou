// components/views/megadashboard/infra/ApiThrottlingView.tsx
import React, { useContext } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const ApiThrottlingView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("ApiThrottlingView must be within DataProvider");
    
    const { apiUsage } = context;
    const chartData = apiUsage.map(a => ({ name: a.endpoint, calls: a.calls24h, throttled: a.calls24h * (a.errorRate / 100) * 5 })); // Mock throttled calls

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">API Throttling & Rate Limiting</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Traffic vs. Throttled Requests">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}><XAxis dataKey="name" stroke="#9ca3af" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="calls" stroke="#8884d8" name="Total Calls" /><Line type="monotone" dataKey="throttled" stroke="#ef4444" name="Throttled" /></LineChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="AI Adaptive Throttling">
                    <p className="text-gray-300">Our system uses machine learning to dynamically adjust rate limits based on real-time traffic patterns. It distinguishes between legitimate spikes and potential abuse, ensuring high availability for valid users while protecting against attacks.</p>
                </Card>
            </div>
        </div>
    );
};

export default ApiThrottlingView;
