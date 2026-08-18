// components/views/corporate/PaymentOrdersView.tsx
import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { PaymentOrder, PaymentOrderStatus } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PaymentOrdersView: React.FC = () => {
    const context = useContext(DataContext);
    const [filter, setFilter] = useState<PaymentOrderStatus | 'all'>('all');
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    if (!context) throw new Error("PaymentOrdersView must be within a DataProvider.");
    // FIX: Destructure `updatePaymentOrderStatus` from context to fix property not found error.
    const { paymentOrders, updatePaymentOrderStatus } = context;

    const filteredOrders = useMemo(() => {
        if (filter === 'all') return paymentOrders;
        return paymentOrders.filter(po => po.status === filter);
    }, [paymentOrders, filter]);
    
    const chartData = useMemo(() => {
        const statusCounts = paymentOrders.reduce((acc, po) => {
            acc[po.status] = (acc[po.status] || 0) + po.amount;
            return acc;
        }, {} as Record<PaymentOrderStatus, number>);
        return Object.entries(statusCounts).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
    }, [paymentOrders]);

    const StatusBadge: React.FC<{ status: PaymentOrderStatus }> = ({ status }) => {
        const colors = {
            needs_approval: 'bg-yellow-500/20 text-yellow-300',
            approved: 'bg-cyan-500/20 text-cyan-300',
            processing: 'bg-blue-500/20 text-blue-300',
            completed: 'bg-green-500/20 text-green-300',
            denied: 'bg-red-500/20 text-red-300',
            returned: 'bg-orange-500/20 text-orange-300',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status.replace('_', ' ')}</span>;
    };

    const CreatePaymentOrderModal: React.FC = () => (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setCreateModalOpen(false)}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">Create Payment Order</h3>
                </div>
                <div className="p-6 space-y-4">
                    {/* Simplified form for demonstration */}
                    <input type="text" placeholder="Counterparty Name" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="number" placeholder="Amount (USD)" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <select className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white">
                        <option>ACH</option>
                        <option>Wire</option>
                        <option>RTP</option>
                    </select>
                    <button onClick={() => { alert('Payment order created!'); setCreateModalOpen(false); }} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Submit for Approval</button>
                </div>
            </div>
        </div>
    );
    
    return (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Payment Orders</h2>
                
                <Card title="Payment Volume by Status">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData}>
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${(v/1000)}k`} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(v: number) => `$${v.toLocaleString()}`}/>
                            <Bar dataKey="value" fill="#8884d8" name="Total Amount" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex space-x-2 p-1 bg-gray-900/50 rounded-lg">
                            {(['all', 'needs_approval', 'processing', 'completed'] as const).map(status => (
                                <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === status ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setCreateModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Create Order</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Counterparty</th>
                                    <th scope="col" className="px-6 py-3">Amount</th>
                                    <th scope="col" className="px-6 py-3">Type</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(po => (
                                    <tr key={po.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-white">{po.counterpartyName}</td>
                                        <td className="px-6 py-4 font-mono text-white">${po.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">{po.type}</td>
                                        <td className="px-6 py-4">{po.date}</td>
                                        <td className="px-6 py-4"><StatusBadge status={po.status} /></td>
                                        <td className="px-6 py-4">
                                            {po.status === 'needs_approval' && (
                                                <div className="flex gap-2">
                                                    <button onClick={() => updatePaymentOrderStatus(po.id, 'approved')} className="text-xs text-green-300 hover:underline">Approve</button>
                                                    <button onClick={() => updatePaymentOrderStatus(po.id, 'denied')} className="text-xs text-red-300 hover:underline">Deny</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            {isCreateModalOpen && <CreatePaymentOrderModal />}
        </>
    );
}

export default PaymentOrdersView;
