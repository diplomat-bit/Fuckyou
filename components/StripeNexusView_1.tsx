import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { Zap, Users, Layers, CheckCircle2 } from 'lucide-react';

// Assuming these components exist in your project
import Card from './Card';
import VirtualAccountsDashboard from './VirtualAccountsDashboard';
import ReconciliationHubView from './ReconciliationHubView';
import CounterpartyDashboardView from './CounterpartyDashboardView';

type Tab = 'PAYMENTS' | 'ENTITIES' | 'VIRTUAL_LEDGER' | 'RECONCILIATION';

// RENAMED: from `useStripeNexusView` to `StripeNexusView` to follow component conventions
const StripeNexusView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('PAYMENTS');
    const dataContext = useContext(DataContext);
    
    // Safety check for context
    if (!dataContext) {
        throw new Error("StripeNexusView must be used within a DataProvider");
    }
    const { deductCredits } = dataContext;

    const mockPayments = [
        { id: 'pi_1', status: 'Succeeded', amount: 12500, customer: 'Nexus Corp', date: '2025-01-22 14:30' },
        { id: 'pi_2', status: 'Pending', amount: 5400, customer: 'Alpha Ventures', date: '2025-01-22 14:45' },
        { id: 'pi_3', status: 'Failed', amount: 98000, customer: 'Gamma Systems', date: '2025-01-21 09:00' }
    ];

    const handleAction = (cost: number) => {
        if (deductCredits(cost)) {
            alert(`Action authorized. Cost: ${cost} SC deducted from Sovereign Balance.`);
        }
    };

    const renderPayments = () => (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-emerald-950/10 border-emerald-500/30">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Gross Volume (24h)</p>
                    <p className="text-3xl font-black text-white font-mono">$1,284,500</p>
                </Card>
                <Card className="bg-indigo-950/10 border-indigo-500/30">
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Net Volume (24h)</p>
                    <p className="text-3xl font-black text-white font-mono">$1,210,000</p>
                </Card>
                <Card className="bg-amber-950/10 border-amber-500/30">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Success Rate</p>
                    <p className="text-3xl font-black text-white font-mono">99.8%</p>
                </Card>
            </div>
            
            <Card title="Payment Intent Registry" className="p-0 overflow-hidden bg-black/40 border-gray-800">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left font-mono">
                        <thead className="bg-gray-900/80 border-b border-gray-800 text-[10px] text-gray-500 font-black uppercase">
                            <tr>
                                <th className="px-6 py-4">Intent ID</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Entity</th>
                                <th className="px-6 py-4 text-right">Magnitude</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {mockPayments.map(p => (
                                <tr key={p.id} className="hover:bg-gray-800/30 transition-colors group">
                                    <td className="px-6 py-4 text-cyan-400 font-bold">{p.id}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                                            p.status === 'Succeeded' ? 'border-green-500/30 text-green-400 bg-green-500/5' :
                                            p.status === 'Pending' ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' :
                                            'border-red-500/30 text-red-400 bg-red-500/5'
                                        }`}>{p.status.toUpperCase()}</span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{p.customer}</td>
                                    <td className="px-6 py-4 text-right font-black text-white">${p.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleAction(100)}
                                            className="text-[10px] font-black text-gray-500 hover:text-cyan-400 uppercase tracking-widest"
                                        >
                                            Refund (100 SC)
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 h-full">
            {/* ... rest of your JSX remains the same */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8">
                <div>
                    <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">Stripe Nexus</h1>
                    <p className="text-cyan-400 text-sm font-mono mt-1 tracking-[0.3em] uppercase">Unified Financial Suite // Rail-01</p>
                </div>
                {/* ... */}
            </header>

            <div className="flex gap-2 bg-gray-900/50 p-1 rounded-2xl border border-gray-800 w-fit">
                {[
                    { id: 'PAYMENTS', label: 'Payments', icon: <Zap size={14} /> },
                    { id: 'ENTITIES', label: 'Counterparties', icon: <Users size={14} /> },
                    { id: 'VIRTUAL_LEDGER', label: 'Virtual Accounts', icon: <Layers size={14} /> },
                    { id: 'RECONCILIATION', label: 'Reconciliation', icon: <CheckCircle2 size={14} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                            activeTab === tab.id ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <main className="min-h-[500px]">
                {activeTab === 'PAYMENTS' && renderPayments()}
                {activeTab === 'ENTITIES' && <CounterpartyDashboardView />}
                {activeTab === 'VIRTUAL_LEDGER' && <VirtualAccountsDashboard />}
                {activeTab === 'RECONCILIATION' && <ReconciliationHubView />}
            </main>
        </div>
    );
};

// RENAMED: Export the renamed component
export default StripeNexusView;
