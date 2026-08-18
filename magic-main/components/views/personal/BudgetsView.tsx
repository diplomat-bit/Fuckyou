// components/views/personal/BudgetsView.tsx
import React, { useContext, useState, useMemo, useRef, useEffect } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { BudgetCategory, Transaction } from '../../../types';
import { GoogleGenAI, Chat } from "@google/genai";
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// ================================================================================================
// MODAL & DETAIL COMPONENTS
// ================================================================================================

const BudgetDetailModal: React.FC<{ budget: BudgetCategory | null; transactions: Transaction[]; onClose: () => void; }> = ({ budget, transactions, onClose }) => {
    if (!budget) return null;

    const relevantTransactions = transactions.filter(tx => tx.category.toLowerCase() === budget.name.toLowerCase() && tx.type === 'expense');

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">{budget.name} Budget Details</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {relevantTransactions.length > 0 ? (
                        <ul className="space-y-2">
                            {relevantTransactions.map(tx => (
                                <li key={tx.id} className="flex justify-between text-sm p-2 bg-gray-700/50 rounded-md">
                                    <div><p className="text-white">{tx.description}</p><p className="text-xs text-gray-400">{tx.date}</p></div>
                                    <p className="font-mono text-red-400">-${tx.amount.toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 text-center">No transactions for this category yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const NewBudgetModal: React.FC<{ onClose: () => void; onAdd: (budget: Omit<BudgetCategory, 'id' | 'spent' | 'color'>) => void; }> = ({ onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && limit) {
            onAdd({ name, limit: parseFloat(limit) });
            onClose();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">Create New Budget</h3></div>
                <div className="p-6 space-y-4">
                    <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Category Name (e.g., Groceries)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <input type="number" value={limit} onChange={e=>setLimit(e.target.value)} placeholder="Monthly Limit (e.g., 500)" required className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-2 text-white" />
                    <button type="submit" className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg">Add Budget</button>
                </div>
            </form>
        </div>
    );
};


const AIConsejero: React.FC<{ budgets: BudgetCategory[] }> = ({ budgets }) => {
    const chatRef = useRef<Chat | null>(null);
    const [aiResponse, setAiResponse] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeChat = async () => {
            setIsLoading(true);
            const budgetSummary = budgets.map(b => `${b.name}: $${b.spent.toFixed(0)} spent of $${b.limit}`).join(', ');
            const prompt = `Based on this budget data (${budgetSummary}), provide one key insight or piece of advice for the user. Be concise and encouraging.`;

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: { systemInstruction: "You are Quantum, a specialized financial advisor AI focused on budget analysis. Your tone is helpful and insightful." }
                });

                const resultStream = await chatRef.current.sendMessageStream({ message: prompt });
                
                let text = '';
                for await (const chunk of resultStream) {
                    text += chunk.text;
                    setAiResponse(text);
                }
            } catch (error) {
                console.error("AI Consejero Error:", error);
                setAiResponse("I'm having trouble analyzing your budgets right now.");
            } finally {
                setIsLoading(false);
            }
        };

        initializeChat();
    }, [budgets]);

    return (
        <Card title="AI Sage Insights">
            <div className="p-4 min-h-[6rem]">
                {isLoading && aiResponse === '' ? (
                    <p className="text-gray-400">The AI Sage is analyzing your spending...</p>
                ) : (
                    <p className="text-gray-300 italic">"{aiResponse}"</p>
                )}
            </div>
        </Card>
    );
};

const BudgetsView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("BudgetsView must be within a DataProvider.");
    
    const { budgets, transactions, addBudget } = context;
    const [selectedBudget, setSelectedBudget] = useState<BudgetCategory | null>(null);
    const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);

    const historicalData = useMemo(() => {
        const data: {[key: string]: any} = {};
        transactions.forEach(tx => {
            if(tx.type === 'expense') {
                const month = new Date(tx.date).toLocaleString('default', { month: 'short' });
                if(!data[month]) data[month] = {name: month};
                data[month][tx.category] = (data[month][tx.category] || 0) + tx.amount;
            }
        });
        return Object.values(data);
    }, [transactions]);


    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-white tracking-wider">Budgets (Allocatra)</h2>
                    <button onClick={() => setIsNewBudgetModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        New Budget
                    </button>
                </div>

                <AIConsejero budgets={budgets} />
                
                <Card title="Historical Spending by Category">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={historicalData}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                            {budgets.map(b => <Bar key={b.id} dataKey={b.name} stackId="a" fill={b.color} />)}
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {budgets.map(budget => {
                        const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
                        let color;
                        if (percentage < 75) color = '#06b6d4'; // cyan
                        else if (percentage < 95) color = '#f59e0b'; // yellow
                        else color = '#ef4444'; // red

                        return (
                            <Card key={budget.id} variant="interactive" onClick={() => setSelectedBudget(budget)}>
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-white">{budget.name}</h3>
                                    <div className="relative h-40 w-40 mx-auto my-4">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: budget.name, value: percentage, fill: color }]} startAngle={90} endAngle={-270}>
                                                <RadialBar background dataKey="value" cornerRadius={10} />
                                            </RadialBarChart>
                                        </ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                                            <span className="text-2xl font-bold text-white">{percentage.toFixed(0)}%</span>
                                            <span className="text-xs text-gray-400">used</span>
                                        </div>
                                    </div>
                                    <p className="font-mono text-sm text-gray-300">
                                        ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}
                                    </p>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>
            <BudgetDetailModal budget={selectedBudget} transactions={transactions} onClose={() => setSelectedBudget(null)} />
            {isNewBudgetModalOpen && <NewBudgetModal onClose={() => setIsNewBudgetModalOpen(false)} onAdd={addBudget} />}
        </>
    );
};

export default BudgetsView;