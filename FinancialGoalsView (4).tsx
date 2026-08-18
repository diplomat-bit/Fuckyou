
import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { FinancialGoal } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, CartesianGrid, BarChart, Bar, ScatterChart, Scatter, ZAxis, ReferenceLine, ComposedChart } from 'recharts';

// --- Sub-Components for a Rich, App-like Experience ---

// A sophisticated progress bar with detailed labels
const GoalProgressBar: React.FC<{ current: number; target: number }> = ({ current, target }) => {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1 text-sm font-medium text-gray-400">
                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(current)}</span>
                <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(target)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                    className="bg-gradient-to-r from-teal-400 to-blue-500 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <div className="text-right mt-1 text-sm font-semibold text-teal-300">{percentage.toFixed(2)}% Complete</div>
        </div>
    );
};

// Form for adding or editing a financial goal
const GoalForm: React.FC<{ goal?: FinancialGoal & { priority?: string; category?: string }; onSubmit: (goal: Omit<FinancialGoal, 'id' | 'creationDate'> & { priority: string; category: string }) => void; onCancel: () => void }> = ({ goal, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        name: goal?.name || '',
        targetAmount: goal?.targetAmount || 10000,
        currentAmount: goal?.currentAmount || 0,
        targetDate: goal?.targetDate || new Date(new Date().setFullYear(new Date().getFullYear() + 5)).toISOString().split('T')[0],
        monthlyContribution: goal?.monthlyContribution || 100,
        priority: goal?.priority || 'Medium',
        category: goal?.category || 'General',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-gray-800 rounded-lg">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300">Goal Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-300">Target Amount ($)</label>
                    <input type="number" name="targetAmount" value={formData.targetAmount} onChange={handleChange} required min="1" className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-300">Current Amount ($)</label>
                    <input type="number" name="currentAmount" value={formData.currentAmount} onChange={handleChange} required min="0" className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="targetDate" className="block text-sm font-medium text-gray-300">Target Date</label>
                    <input type="date" name="targetDate" value={formData.targetDate} onChange={handleChange} required className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="monthlyContribution" className="block text-sm font-medium text-gray-300">Monthly Contribution ($)</label>
                    <input type="number" name="monthlyContribution" value={formData.monthlyContribution} onChange={handleChange} required min="0" className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-300">Priority</label>
                    <select name="priority" value={formData.priority} onChange={handleChange} className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-300">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option>General</option>
                        <option>Retirement</option>
                        <option>Home Purchase</option>
                        <option>Education</option>
                        <option>Vacation</option>
                        <option>Emergency Fund</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end space-x-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">Save Goal</button>
            </div>
        </form>
    );
};

// --- Main Financial Goals View ---

const FinancialGoalsView: React.FC = () => {
    const { financialGoals, addFinancialGoal, updateFinancialGoal, deleteFinancialGoal } = useContext(DataContext);
    const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [annualReturn, setAnnualReturn] = useState(5);
    const [inflationRate, setInflationRate] = useState(2.5);
    const [showAIAnalysis, setShowAIAnalysis] = useState(false);

    useEffect(() => {
        if (!selectedGoalId && financialGoals.length > 0) {
            setSelectedGoalId(financialGoals[0].id);
        }
    }, [financialGoals, selectedGoalId]);

    const selectedGoal = useMemo(() => financialGoals.find(g => g.id === selectedGoalId) as (FinancialGoal & { priority?: string; category?: string }) | undefined, [financialGoals, selectedGoalId]);

    const handleAddGoal = (goalData: Omit<FinancialGoal, 'id' | 'creationDate'> & { priority: string; category: string }) => {
        const newGoal: Omit<FinancialGoal, 'id'> = {
            ...goalData,
            creationDate: new Date().toISOString(),
        };
        addFinancialGoal(newGoal);
        setIsAdding(false);
    };

    const handleUpdateGoal = (goalData: Omit<FinancialGoal, 'id' | 'creationDate'> & { priority: string; category: string }) => {
        if (selectedGoal) {
            updateFinancialGoal({ ...selectedGoal, ...goalData });
            setIsEditing(false);
        }
    };

    const handleDeleteGoal = (id: string) => {
        if (window.confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
            deleteFinancialGoal(id);
            setSelectedGoalId(null);
        }
    };

    const projectionData = useMemo(() => {
        if (!selectedGoal) return [];
        const data = [];
        let currentAmount = selectedGoal.currentAmount;
        const monthlyInvestmentReturnRate = (annualReturn / 100) / 12;
        const months = Math.max(1, Math.ceil((new Date(selectedGoal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.44)));

        for (let i = 0; i <= months; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i);
            data.push({
                date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
                "Projected Value": currentAmount,
            });
            currentAmount = currentAmount * (1 + monthlyInvestmentReturnRate) + selectedGoal.monthlyContribution;
        }
        return data;
    }, [selectedGoal, annualReturn]);

    const overviewData = useMemo(() => {
        return financialGoals.map(g => ({
            name: g.name,
            Progress: Math.min(100, (g.currentAmount / g.targetAmount) * 100),
        }));
    }, [financialGoals]);

    const goalStats = useMemo(() => {
        if (!selectedGoal) return null;
        const monthsRemaining = Math.max(0, Math.ceil((new Date(selectedGoal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
        const amountRemaining = Math.max(0, selectedGoal.targetAmount - selectedGoal.currentAmount);
        const requiredContribution = monthsRemaining > 0 ? amountRemaining / monthsRemaining : amountRemaining;
        return { monthsRemaining, amountRemaining, requiredContribution };
    }, [selectedGoal]);

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Financial Goals Dashboard</h1>
                <button
                    onClick={() => { setIsAdding(true); setIsEditing(false); setSelectedGoalId(null); }}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500"
                >
                    + New Goal
                </button>
            </div>

            {isAdding && (
                <Card title="Create a New Financial Goal">
                    <GoalForm onSubmit={handleAddGoal} onCancel={() => setIsAdding(false)} />
                </Card>
            )}

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
                {/* Goals List */}
                <div className="lg:col-span-1 flex flex-col space-y-3 overflow-y-auto pr-2">
                    {financialGoals.map(g => {
                        const goal = g as FinancialGoal & { priority?: string };
                        const priorityColor = goal.priority === 'High' ? 'bg-red-500 text-white' : goal.priority === 'Medium' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white';
                        return (
                            <div
                                key={goal.id}
                                onClick={() => { setSelectedGoalId(goal.id); setIsAdding(false); setIsEditing(false); }}
                                className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${selectedGoalId === goal.id ? 'bg-gray-700 ring-2 ring-indigo-500' : 'bg-gray-800 hover:bg-gray-700'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="font-bold text-white truncate">{goal.name}</h3>
                                    {goal.priority && <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityColor}`}>{goal.priority}</span>}
                                </div>
                                <p className="text-sm text-gray-400 mb-2">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
                                <GoalProgressBar current={goal.currentAmount} target={goal.targetAmount} />
                            </div>
                        );
                    })}
                </div>

                {/* Selected Goal Details */}
                <div className="lg:col-span-2 flex flex-col space-y-4 overflow-y-auto">
                    <Card title="Goals Overview">
                        <div className="h-64 p-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={overviewData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} interval={0} angle={-20} textAnchor="end" height={50} />
                                    <YAxis stroke="#9CA3AF" unit="%" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4A5568' }} formatter={(value: number) => [`${value.toFixed(2)}%`, 'Progress']} />
                                    <Bar dataKey="Progress" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {selectedGoal && !isAdding && !isEditing && (
                        <>
                            {showAIAnalysis && (
                                <Card title="Gemini AI Analysis">
                                    <div className="p-4 text-gray-300 relative">
                                        <button onClick={() => setShowAIAnalysis(false)} className="absolute top-2 right-2 text-gray-400 hover:text-white">&times;</button>
                                        <h4 className="font-bold text-lg text-white">Analysis for: {selectedGoal.name}</h4>
                                        <p className="mt-2">Based on your current progress and contributions, here are some insights:</p>
                                        <ul className="list-disc list-inside mt-2 space-y-1">
                                            <li>You are currently <span className="font-bold text-green-400">on track</span> to meet your goal by {new Date(selectedGoal.targetDate).toLocaleDateString()}.</li>
                                            <li>To reach your goal 6 months sooner, consider increasing your monthly contribution by approximately $50.</li>
                                            <li>Your chosen investment return rate of {annualReturn}% is realistic for a balanced portfolio. Consider diversifying if you haven't already.</li>
                                        </ul>
                                        <p className="mt-4 text-xs text-gray-500">Disclaimer: This is a simulated analysis. Consult a financial advisor for real financial advice.</p>
                                    </div>
                                </Card>
                            )}
                            <Card title={selectedGoal.name}>
                                <div className="p-4">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
                                        <div><p className="text-sm text-gray-400">Target Amount</p><p className="text-xl font-bold text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedGoal.targetAmount)}</p></div>
                                        <div><p className="text-sm text-gray-400">Current Savings</p><p className="text-xl font-bold text-green-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedGoal.currentAmount)}</p></div>
                                        <div><p className="text-sm text-gray-400">Amount Remaining</p><p className="text-xl font-bold text-yellow-400">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(goalStats?.amountRemaining || 0)}</p></div>
                                        <div><p className="text-sm text-gray-400">Target Date</p><p className="text-xl font-bold text-white">{new Date(selectedGoal.targetDate).toLocaleDateString()}</p></div>
                                        <div><p className="text-sm text-gray-400">Months Remaining</p><p className="text-xl font-bold text-white">{goalStats?.monthsRemaining}</p></div>
                                        <div><p className="text-sm text-gray-400">Monthly Input</p><p className="text-xl font-bold text-white">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedGoal.monthlyContribution)}</p></div>
                                        <div><p className="text-sm text-gray-400">Category</p><p className="text-xl font-bold text-white">{selectedGoal.category || 'N/A'}</p></div>
                                        <div><p className="text-sm text-gray-400">Priority</p><p className="text-xl font-bold text-white">{selectedGoal.priority || 'N/A'}</p></div>
                                    </div>
                                    <GoalProgressBar current={selectedGoal.currentAmount} target={selectedGoal.targetAmount} />
                                    <div className="mt-4 flex justify-between items-center">
                                        <button onClick={() => setShowAIAnalysis(true)} className="px-3 py-1 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700">Get AI Insights</button>
                                        <div className="space-x-2">
                                            <button onClick={() => setIsEditing(true)} className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Edit</button>
                                            <button onClick={() => handleDeleteGoal(selectedGoal.id)} className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card title="Growth Projection & What-If Analysis">
                                <div className="p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-300">Assumed Annual Return: {annualReturn.toFixed(1)}%</label>
                                            <input type="range" min="0" max="15" step="0.5" value={annualReturn} onChange={(e) => setAnnualReturn(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-300">Estimated Annual Inflation: {inflationRate.toFixed(1)}%</label>
                                            <input type="range" min="0" max="10" step="0.1" value={inflationRate} onChange={(e) => setInflationRate(parseFloat(e.target.value))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                                        </div>
                                    </div>
                                    <div className="h-80">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart data={projectionData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                                <defs><linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
                                                <XAxis dataKey="date" stroke="#9CA3AF" />
                                                <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${(Number(value) / 1000)}k`} />
                                                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4A5568' }} labelStyle={{ color: '#E5E7EB' }} formatter={(value: number, name: string) => [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value), name]} />
                                                <Legend />
                                                <ReferenceLine y={selectedGoal.targetAmount} label={{ value: 'Target', position: 'insideTopRight', fill: '#10B981' }} stroke="#10B981" strokeDasharray="3 3" />
                                                <Area type="monotone" dataKey="Projected Value" stroke="#8884d8" fillOpacity={1} fill="url(#colorUv)" />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </Card>
                        </>
                    )}
                    {selectedGoal && isEditing && (
                        <Card title={`Editing: ${selectedGoal.name}`}>
                            <GoalForm goal={selectedGoal} onSubmit={handleUpdateGoal} onCancel={() => setIsEditing(false)} />
                        </Card>
                    )}
                    {!selectedGoal && !isAdding && (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-gray-300">No Goal Selected</h2>
                                <p className="text-gray-500 mt-2">Select a goal from the list or create a new one to get started.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FinancialGoalsView;
