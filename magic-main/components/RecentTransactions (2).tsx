// components/RecentTransactions.tsx
import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { View } from '../types';
import Card from './Card';

// A map of categories to icons for visual representation
const TransactionIcon: React.FC<{ category: string }> = ({ category }) => {
    const icons: { [key: string]: React.ReactElement } = {
        'Dining': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /><path d="M3 12a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /><path d="M4 15a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1z" /></svg>,
        'Shopping': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>,
        'Transport': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM5.5 8a.5.5 0 000 1h9a.5.5 0 000-1h-9z" clipRule="evenodd" /></svg>,
        'Income': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>,
        'Default': <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.158-.103.346-.103.504 0l.968.636a.5.5 0 00.744-.582l-.46-1.15a.5.5 0 00-.814-.265L9.2 6.5a.5.5 0 00-.01.527l-.736 1.01a.5.5 0 00.744.582l.968-.636zM10 18a8 8 0 100-16 8 8 0 000 16z" /></svg>,
    };
    const key = category in icons ? category : (category === 'Salary' || category === 'Freelance') ? 'Income' : 'Default';
    return icons[key];
};

const CarbonFootprintBadge: React.FC<{ value: number }> = ({ value }) => {
    const color = value > 20 ? 'bg-red-500/20 text-red-300' : value > 10 ? 'bg-yellow-500/20 text-yellow-300' : 'bg-green-500/20 text-green-300';
    return <span className={`text-xs font-mono px-1.5 py-0.5 rounded-full ${color}`}>{value.toFixed(1)}kg CO₂</span>;
}

const RecentTransactions: React.FC<{ setActiveView: (view: View) => void }> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    if (!context) return <div>Loading...</div>;
    const { transactions } = context;

    return (
        <Card title="Recent Transactions" headerActions={[{ id: 'view-all', label: 'View All', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>, onClick: () => setActiveView(View.Transactions) }]}>
            <ul className="space-y-3">
                {transactions.slice(0, 5).map(tx => (
                    <li key={tx.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-700/50 rounded-full flex items-center justify-center">
                                <TransactionIcon category={tx.category} />
                            </div>
                            <div>
                                <p className="font-semibold text-white">{tx.description}</p>
                                <p className="text-sm text-gray-400">{tx.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className={`font-mono font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                            </p>
                            {tx.carbonFootprint && <CarbonFootprintBadge value={tx.carbonFootprint} />}
                        </div>
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default RecentTransactions;
