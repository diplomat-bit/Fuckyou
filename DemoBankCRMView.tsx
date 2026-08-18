import React from 'react';
import Card from '../../Card';
import { FunnelChart, Funnel, Tooltip, ResponsiveContainer, LabelList, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';

// In a real app, this data would come from a dedicated file e.g., /data/platform/crmData.ts
const pipelineData = [
  { value: 100, name: 'Leads', fill: '#06b6d4' },
  { value: 80, name: 'Contacted', fill: '#3b82f6' },
  { value: 50, name: 'Qualified', fill: '#8b5cf6' },
  { value: 20, name: 'Won', fill: '#10b981' },
];
const satisfactionData = [
    { name: 'Q1', CSAT: 85 }, { name: 'Q2', CSAT: 88 },
    { name: 'Q3', CSAT: 92 }, { name: 'Q4', CSAT: 91 },
];
const topCustomers = [
    { id: 1, name: 'Global Innovations Inc.', LTV: 250000, status: 'Active' },
    { id: 2, name: 'FutureTech Solutions', LTV: 180000, status: 'Active' },
    { id: 3, name: 'Synergy Enterprises', LTV: 150000, status: 'Churn Risk' },
];

const DemoBankCRMView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank CRM</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">125</p><p className="text-sm text-gray-400 mt-1">New Leads (30d)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">16%</p><p className="text-sm text-gray-400 mt-1">Conversion Rate</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">91%</p><p className="text-sm text-gray-400 mt-1">Customer Satisfaction</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">$1.5M</p><p className="text-sm text-gray-400 mt-1">Pipeline Value</p></Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Sales Pipeline">
                    <ResponsiveContainer width="100%" height={300}>
                        <FunnelChart>
                            <Tooltip />
                            <Funnel dataKey="value" data={pipelineData} isAnimationActive>
                                <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
                            </Funnel>
                        </FunnelChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Customer Satisfaction (CSAT)">
                    <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={satisfactionData}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" domain={[0, 100]} unit="%" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                            <Bar dataKey="CSAT" fill="#6366f1" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
            <Card title="Top Customers by Lifetime Value (LTV)">
                 <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Customer Name</th>
                                <th scope="col" className="px-6 py-3">LTV</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topCustomers.map(customer => (
                                <tr key={customer.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{customer.name}</td>
                                    <td className="px-6 py-4 font-mono">${customer.LTV.toLocaleString()}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${customer.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{customer.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankCRMView;
