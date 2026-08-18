import React, { useContext, useState, useMemo } from 'react';
import Card from '../../../Card';
import { DataContext } from '../../../../context/DataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CorporateCard, CorporateCardControls } from '../../../../types';

const CardManagementView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("CardManagementView must be within a DataProvider");

    const { corporateCards, toggleCorporateCardFreeze, updateCorporateCardControls } = context;
    const [selectedCard, setSelectedCard] = useState<CorporateCard | null>(null);

    const chartData = useMemo(() => {
        return corporateCards.map(card => ({
            name: card.holderName.split(' ')[0],
            spent: card.balance,
            limit: card.limit,
        }));
    }, [corporateCards]);

    const CardDetailModal: React.FC = () => {
        if (!selectedCard) return null;
        const [controls, setControls] = useState<CorporateCardControls>(selectedCard.controls);

        const handleSave = () => {
            updateCorporateCardControls(selectedCard.id, controls);
            setSelectedCard(prev => prev ? {...prev, controls} : null);
        };
        
        return (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setSelectedCard(null)}>
                <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Manage Card: {selectedCard.holderName}</h3></div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-cyan-300 mb-2">Controls</h4>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between"><span className="text-sm">Monthly Limit: ${controls.monthlyLimit.toLocaleString()}</span><input type="range" min="1000" max="20000" step="500" value={controls.monthlyLimit} onChange={e => setControls(c => ({...c, monthlyLimit: +e.target.value}))} /></label>
                                <label className="flex items-center justify-between"><span className="text-sm">ATM Withdrawals</span><input type="checkbox" className="toggle toggle-cyan" checked={controls.atm} onChange={e => setControls(c => ({...c, atm: e.target.checked}))} /></label>
                                <label className="flex items-center justify-between"><span className="text-sm">Online Purchases</span><input type="checkbox" className="toggle toggle-cyan" checked={controls.online} onChange={e => setControls(c => ({...c, online: e.target.checked}))} /></label>
                                <label className="flex items-center justify-between"><span className="text-sm">Contactless</span><input type="checkbox" className="toggle toggle-cyan" checked={controls.contactless} onChange={e => setControls(c => ({...c, contactless: e.target.checked}))} /></label>
                            </div>
                            <button onClick={handleSave} className="mt-4 w-full py-2 bg-cyan-600 rounded">Save Changes</button>
                        </div>
                        <div>
                            <h4 className="font-semibold text-cyan-300 mb-2">Recent Transactions</h4>
                            <ul className="space-y-2 max-h-48 overflow-y-auto">
                                {selectedCard.transactions.map(tx => <li key={tx.id} className="flex justify-between text-sm"><span className="text-gray-300">{tx.description}</span><span className="font-mono text-white">${tx.amount.toFixed(2)}</span></li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Corporate Card Management</h2>

            <Card title="Spending by Cardholder">
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                        <Bar dataKey="spent" fill="#06b6d4" name="Amount Spent" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {corporateCards.map(card => (
                    <div key={card.id} className={`p-4 rounded-lg flex flex-col justify-between aspect-[85.6/54] transition-all duration-300 ${card.frozen ? 'bg-gradient-to-br from-gray-700 to-gray-800 opacity-60' : 'bg-gradient-to-br from-cyan-900 to-indigo-900'}`}>
                        <div>
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-white text-sm">{card.holderName}</p>
                                <p className={`text-xs font-bold ${card.status === 'Active' ? 'text-green-300' : 'text-yellow-300'}`}>{card.status}</p>
                            </div>
                            <p className="font-mono text-lg text-white tracking-widest text-left mt-4">**** **** **** {card.cardNumberMask}</p>
                        </div>
                        <div>
                            <div className="text-xs text-gray-300">Balance: ${card.balance.toLocaleString()} / ${card.limit.toLocaleString()}</div>
                            <div className="flex justify-end gap-2 mt-2">
                                <button onClick={() => toggleCorporateCardFreeze(card.id)} className="text-xs px-2 py-1 bg-black/20 hover:bg-black/40 rounded">{card.frozen ? 'Unfreeze' : 'Freeze'}</button>
                                <button onClick={() => setSelectedCard(card)} className="text-xs px-2 py-1 bg-black/20 hover:bg-black/40 rounded">Manage</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <CardDetailModal />
        </>
    );
};

export default CardManagementView;
