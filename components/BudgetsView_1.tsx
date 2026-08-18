import React, { useState, useEffect, useMemo } from 'react';
import Card from './Card';
import { apiClient } from '../lib/apiClient';

const StatusBadge: React.FC<{ status: 'over' | 'ok' }> = ({ status }) => {
    const styles = {
        over: 'bg-red-900/30 text-red-400 border-red-800',
        ok: 'bg-green-900/30 text-green-400 border-green-800'
    };
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}>
            {status === 'over' ? 'Over Budget' : 'On Track'}
        </span>
    );
};

export const NewBudgetModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onAdd: (name: string, limit: number) => void; 
    transactions: any[];
}> = ({ isOpen, onClose, onAdd, transactions }) => {
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName('');
            setLimit('');
        }
    }, [isOpen]);

    const categories = useMemo(() => {
        if (!transactions) return [];
        const cats = transactions
            .map((t: any) => t.category)
            .filter((cat: any): cat is string => typeof cat === 'string' && cat.trim() !== '');
        return Array.from(new Set(cats));
    }, [transactions]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-4">Create New Budget</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Category Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Groceries, Entertainment" 
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            list="categories-list"
                            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                        <datalist id="categories-list">
                            {categories.map(cat => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Monthly Limit ($)</label>
                        <input 
                            type="number" 
                            placeholder="e.g. 500" 
                            value={limit} 
                            onChange={e => setLimit(e.target.value)}
                            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                        />
                    </div>
                    <div className="flex justify-between pt-2">
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">Cancel</button>
                        <button onClick={() => {
                            const numLimit = parseFloat(limit);
                            if (name.trim() && !isNaN(numLimit) && numLimit > 0) {
                                onAdd(name.trim(), numLimit);
                                onClose();
                            }
                        }} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition-colors">Create</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BudgetsView: React.FC = () => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bData, tData] = await Promise.all([
        apiClient.get('/budgets'),
        apiClient.get('/transactions')
      ]);
      setBudgets(bData);
      setTransactions(tData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBudget = async (name: string, limit: number) => {
    await apiClient.post('/budgets', { name, limit });
    fetchData();
  };

  const handleDeleteBudget = async (id: string) => {
    await apiClient.delete(`/budgets/${id}`);
    fetchData();
  };
  
  if (loading) return <div className="text-white p-4">Loading...</div>;
  
  return (
    <div className="space-y-6">
      <Card title="Budget Overview">
        {budgets.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p className="mb-4">No budgets created yet. Set up a budget to track your spending!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map(budget => {
               const spent = Number(budget.spent) || 0;
               const limit = Number(budget.limit) || 0;
               const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
               const isOverBudget = spent > limit;
               
               return (
                  <div key={budget.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col justify-between">
                     <div>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex flex-col">
                                <h4 className="font-bold text-white truncate" title={budget.name}>{budget.name}</h4>
                                <StatusBadge status={isOverBudget ? 'over' : 'ok'} />
                            </div>
                            <button 
                                onClick={() => handleDeleteBudget(budget.id)}
                                className="text-gray-500 hover:text-red-500 transition-colors"
                                title="Delete Budget"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">${spent} / ${limit}</div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                            <div 
                                className={`h-2 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>
                     </div>
                  </div>
               );
            })}
          </div>
        )}
        <button onClick={() => setIsModalOpen(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors">Add Budget</button>
      </Card>
      <NewBudgetModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={handleAddBudget} transactions={transactions} />
    </div>
  );
};

export default BudgetsView;