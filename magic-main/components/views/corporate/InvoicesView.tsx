// components/views/corporate/InvoicesView.tsx
import React, { useContext, useMemo, useState } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { Invoice, InvoiceStatus } from '../../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const InvoicesView: React.FC = () => {
    const context = useContext(DataContext);
    const [filter, setFilter] = useState<InvoiceStatus | 'all'>('all');
    
    if (!context) throw new Error("InvoicesView must be within a DataProvider.");
    const { invoices } = context;

    const filteredInvoices = useMemo(() => {
        if (filter === 'all') return invoices;
        return invoices.filter(i => i.status === filter);
    }, [invoices, filter]);
    
    const agingData = useMemo(() => {
        const today = new Date();
        const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
        invoices.filter(i => i.status === 'overdue' || i.status === 'unpaid').forEach(inv => {
            const dueDate = new Date(inv.dueDate);
            const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
            if (daysOverdue <= 30) buckets['0-30'] += inv.amount;
            else if (daysOverdue <= 60) buckets['31-60'] += inv.amount;
            else if (daysOverdue <= 90) buckets['61-90'] += inv.amount;
            else buckets['90+'] += inv.amount;
        });
        return Object.entries(buckets).map(([name, value]) => ({ name, value }));
    }, [invoices]);
    
    const StatusBadge: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
        const colors = {
            unpaid: 'bg-cyan-500/20 text-cyan-300',
            paid: 'bg-green-500/20 text-green-300',
            overdue: 'bg-red-500/20 text-red-300',
            voided: 'bg-gray-500/20 text-gray-300',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${colors[status]}`}>{status}</span>;
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Invoices</h2>
            
            <Card title="Accounts Receivable Aging">
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={agingData}>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `$${(v/1000)}k`} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(v: number) => `$${v.toLocaleString()}`}/>
                        <Bar dataKey="value" fill="#ef4444" name="Amount Due" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
            
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2 p-1 bg-gray-900/50 rounded-lg">
                        {(['all', 'unpaid', 'paid', 'overdue'] as const).map(status => (
                            <button key={status} onClick={() => setFilter(status)} className={`px-3 py-1 text-sm rounded-md transition-colors capitalize ${filter === status ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>
                                {status}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => alert("Navigate to 'Create Invoice' page")} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Create Invoice</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Invoice #</th>
                                <th scope="col" className="px-6 py-3">Counterparty</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Due Date</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.map(i => (
                                <tr key={i.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white">{i.invoiceNumber}</td>
                                    <td className="px-6 py-4 font-medium text-white">{i.counterpartyName}</td>
                                    <td className="px-6 py-4 font-mono text-white">${i.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4">{i.dueDate}</td>
                                    <td className="px-6 py-4"><StatusBadge status={i.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default InvoicesView;