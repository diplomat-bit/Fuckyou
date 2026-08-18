import React from 'react';
import Card from '../../Card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const salesData = [
    { name: 'Jan', sales: 120000 }, { name: 'Feb', sales: 150000 }, { name: 'Mar', sales: 180000 },
    { name: 'Apr', sales: 170000 }, { name: 'May', sales: 210000 }, { name: 'Jun', sales: 250000 },
];

const topProducts = [
    { id: 1, name: 'Quantum AI Subscription - Pro', sales: 85000, units: 170 },
    { id: 2, name: 'Data Factory - Enterprise Plan', sales: 65000, units: 13 },
    { id: 3, name: 'Compute Credits - 10k Block', sales: 50000, units: 500 },
];

const DemoBankCommerceView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Commerce</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">$1.2M</p><p className="text-sm text-gray-400 mt-1">Gross Sales (YTD)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">4,520</p><p className="text-sm text-gray-400 mt-1">Orders</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">2.1%</p><p className="text-sm text-gray-400 mt-1">Conversion Rate</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">$265</p><p className="text-sm text-gray-400 mt-1">Avg. Order Value</p></Card>
            </div>
            
            <Card title="Gross Sales Volume">
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesData}>
                        <defs><linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" tickFormatter={(v) => `$${(v/1000)}k`} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                        <Area type="monotone" dataKey="sales" stroke="#10b981" fill="url(#colorSales)" />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Top Selling Products">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Product Name</th>
                                <th scope="col" className="px-6 py-3">Units Sold</th>
                                <th scope="col" className="px-6 py-3">Total Sales</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.map(p => (
                                <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{p.name}</td>
                                    <td className="px-6 py-4">{p.units.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-mono">${p.sales.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankCommerceView;