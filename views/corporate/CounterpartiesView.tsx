// components/views/corporate/CounterpartiesView.tsx
import React, { useContext, useState } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { Counterparty } from '../../../types';

const CounterpartiesView: React.FC = () => {
    const context = useContext(DataContext);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    
    if (!context) throw new Error("CounterpartiesView must be within a DataProvider.");
    const { counterparties } = context;

    const StatusBadge: React.FC<{ status: 'Verified' | 'Pending' }> = ({ status }) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${status === 'Verified' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{status}</span>
    );
    
    const AddCounterpartyModal: React.FC = () => (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setAddModalOpen(false)}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Add Counterparty</h3></div>
                <div className="p-6 space-y-4">
                    <input type="text" placeholder="Company Name" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="email" placeholder="Contact Email" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <button onClick={() => { alert('Counterparty added and is pending verification.'); setAddModalOpen(false); }} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Add Counterparty</button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <div className="space-y-6">
                 <h2 className="text-3xl font-bold text-white tracking-wider">Counterparties</h2>
                 <Card>
                    <div className="flex justify-end mb-4">
                        <button onClick={() => setAddModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium">Add Counterparty</button>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-400">
                            <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Name</th>
                                    <th scope="col" className="px-6 py-3">Email</th>
                                    <th scope="col" className="px-6 py-3">Created</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {counterparties.map(c => (
                                    <tr key={c.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                        <td className="px-6 py-4 font-medium text-white">{c.name}</td>
                                        <td className="px-6 py-4">{c.email}</td>
                                        <td className="px-6 py-4">{c.createdDate}</td>
                                        <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
            {isAddModalOpen && <AddCounterpartyModal />}
        </>
    );
};

export default CounterpartiesView;
