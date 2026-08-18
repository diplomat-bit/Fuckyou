import React from 'react';
import Card from '../../Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// In a real app, this data would come from a dedicated file e.g., /data/platform/erpData.ts
const orderVolumeData = [
    { name: 'Jan', orders: 230 }, { name: 'Feb', orders: 280 },
    { name: 'Mar', orders: 350 }, { name: 'Apr', orders: 320 },
    { name: 'May', orders: 410 }, { name: 'Jun', orders: 450 },
];
const inventoryStatusData = [
    { name: 'In Stock', value: 8500 }, { name: 'Low Stock', value: 1200 },
    { name: 'Out of Stock', value: 300 },
];
const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const recentSalesOrders = [
    { id: 'SO-00125', customer: 'Quantum Corp', amount: 15000, status: 'Shipped', date: '2024-07-23' },
    { id: 'SO-00124', customer: 'Cyberdyne Systems', amount: 22500, status: 'Processing', date: '2024-07-23' },
    { id: 'SO-00123', customer: 'NeuroLink Inc.', amount: 8000, status: 'Delivered', date: '2024-07-21' },
];

const DemoBankERPView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank ERP</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">4.2</p><p className="text-sm text-gray-400 mt-1">Inventory Turnover</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">98.5%</p><p className="text-sm text-gray-400 mt-1">Order Fulfillment Rate</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">$1.2M</p><p className="text-sm text-gray-400 mt-1">Revenue (Q2)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">12</p><p className="text-sm text-gray-400 mt-1">Open Purchase Orders</p></Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <Card title="Monthly Order Volume" className="lg:col-span-3">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={orderVolumeData}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                            <Line type="monotone" dataKey="orders" stroke="#06b6d4" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Inventory Status" className="lg:col-span-2">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={inventoryStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {inventoryStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
            <Card title="Recent Sales Orders">
                <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Order ID</th>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentSalesOrders.map(order => (
                                <tr key={order.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white">{order.id}</td>
                                    <td className="px-6 py-4">{order.customer}</td>
                                    <td className="px-6 py-4 font-mono">${order.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${order.status === 'Shipped' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-green-500/20 text-green-300'}`}>{order.status}</span></td>
                                    <td className="px-6 py-4">{order.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankERPView;
