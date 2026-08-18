import React, { useContext } from 'react';
// FIX: Added Transaction to imports for explicit typing in reduce function.
import { View, Transaction } from '../../types';
import { DataContext } from '../../context/DataContext';
// FIX: Imported Cell for use in PieChart
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, Legend } from 'recharts';
// FIX: Imported NAV_ITEMS to look up the correct icon for the preview tile.
import { NAV_ITEMS } from '../../constants';

const KpiCard: React.FC<{ title: string; value: string | number; className?: string }> = ({ title, value, className }) => (
    <div className={`bg-gray-800/50 p-3 rounded-lg text-center ${className}`}>
        <p className="text-xs text-gray-400 truncate">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
    </div>
);

const StaticNexusGraph: React.FC = () => (
    <div className="w-full h-full flex items-center justify-center p-8">
        <svg width="100%" height="100%" viewBox="0 0 400 300">
            <defs>
                <marker id="arrow-preview" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
                </marker>
            </defs>
            {/* Links */}
            <line x1="100" y1="150" x2="200" y2="80" stroke="#6b7280" markerEnd="url(#arrow-preview)" />
            <line x1="100" y1="150" x2="200" y2="220" stroke="#6b7280" markerEnd="url(#arrow-preview)" />
            <line x1="200" y1="80" x2="300" y2="150" stroke="#6b7280" markerEnd="url(#arrow-preview)" />
            <line x1="200" y1="220" x2="300" y2="150" stroke="#6b7280" markerEnd="url(#arrow-preview)" />
            
            {/* Nodes */}
            <g transform="translate(100, 150)">
                <circle r="25" fill="#facc15" /><text fill="#111827" textAnchor="middle" dy=".3em" fontSize="10">User</text>
            </g>
            <g transform="translate(200, 80)">
                <circle r="20" fill="#ef4444" /><text fill="#fff" textAnchor="middle" dy=".3em" fontSize="10">TXN</text>
            </g>
            <g transform="translate(200, 220)">
                <circle r="20" fill="#6366f1" /><text fill="#fff" textAnchor="middle" dy=".3em" fontSize="10">Goal</text>
            </g>
            <g transform="translate(300, 150)">
                <circle r="20" fill="#f59e0b" /><text fill="#fff" textAnchor="middle" dy=".3em" fontSize="10">Budget</text>
            </g>
        </svg>
    </div>
);

const ViewAnalyticsPreview: React.FC<{ viewId: View }> = ({ viewId }) => {
    const context = useContext(DataContext);
    if (!context) return <div className="text-gray-500 p-4">Loading data...</div>;

    const item = NAV_ITEMS.find(navItem => 'id' in navItem && navItem.id === viewId);

    const renderContent = () => {
        switch (viewId) {
            case View.Dashboard: {
                const totalBalance = context.assets.reduce((sum, asset) => sum + asset.value, 0);
                const recentTx = context.transactions.slice(0, 3);
                return (
                    <div className="h-full flex flex-col p-4 space-y-4">
                        <div className="text-center p-4 bg-gray-800/50 rounded-lg">
                            <p className="text-xs text-gray-400">Total Balance</p>
                            <p className="text-3xl font-bold text-white">${totalBalance.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-300 mb-2">Recent Activity</p>
                            <div className="space-y-2 text-xs">
                                {recentTx.map(tx => (
                                    <div key={tx.id} className="flex justify-between bg-gray-800/50 p-2 rounded">
                                        <span className="truncate">{tx.description}</span>
                                        <span className={`font-mono ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>{tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                         <div className="flex-grow flex flex-col">
                            <p className="text-sm font-semibold text-gray-300 mb-2">Portfolio</p>
                            <div className="flex-grow">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={context.assets} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50}>
                                            {context.assets.map(entry => <Cell key={entry.name} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', fontSize: '12px' }}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                );
            }
            case View.TheNexus: {
                return (
                    <div className="h-full flex flex-col">
                        <StaticNexusGraph />
                         <div className="p-4 border-t border-gray-700/50 text-center">
                            <p className="text-sm text-gray-300">Map of Emergent Relationships</p>
                            <p className="text-xs text-gray-500">Visualize the connections between your financial activities.</p>
                        </div>
                    </div>
                );
            }
            case View.AIAdvisor: {
                return (
                    <div className="h-full flex flex-col p-4 justify-between">
                         <div className="text-center">
                            <p className="text-lg text-gray-300 mb-4">"As your financial co-pilot, I can answer questions or perform tasks. You could ask:"</p>
                        </div>
                        <div className="space-y-2">
                             <div className="p-3 bg-gray-700/50 rounded-lg text-sm text-cyan-200 text-left">"Summarize my financial health."</div>
                             <div className="p-3 bg-gray-700/50 rounded-lg text-sm text-cyan-200 text-left">"Are there any anomalies I should be aware of?"</div>
                             <div className="p-3 bg-gray-700/50 rounded-lg text-sm text-cyan-200 text-left">"Project my balance for the next 6 months."</div>
                        </div>
                        <div className="mt-4 p-4 border-t border-gray-700/50 text-center">
                            <p className="text-sm text-gray-300">AI Advisor (Quantum)</p>
                            <p className="text-xs text-gray-500">Your conversational financial co-pilot.</p>
                        </div>
                    </div>
                );
            }
            case View.Transactions: {
                // FIX: Explicitly typed the `spendingByCategory` constant. This resolves a TypeScript type inference issue where the result of the `reduce` operation was not correctly identified as `Record<string, number>`, causing the `value` in the subsequent `.map` and `.sort` to be of type `unknown` and leading to an arithmetic error.
                const spendingByCategory: Record<string, number> = context.transactions
                    .filter(t => t.type === 'expense')
                    // FIX: Explicitly typed the initial value of reduce. Without this, TypeScript infers
                    // the initial value `{}` as the return type, causing `Object.entries` to fail and
                    // `value` in the subsequent map/sort to be of type `unknown`.
                    .reduce((acc: Record<string, number>, tx: Transaction) => {
                        acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
                        return acc;
                    }, {} as Record<string, number>);
                
                const chartData = Object.entries(spendingByCategory)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a,b) => b.value - a.value)
                    .slice(0, 5);

                // FIX: The inline `reduce` function was causing a type error, likely due to a compiler inference issue within complex JSX. 
                // Breaking the calculation out into a separate constant resolves the issue and improves readability.
                // FIX: Added explicit types for the reduce function parameters to fix arithmetic operation error.
                const totalOutflow = context.transactions
                    .filter((t: Transaction) => t.type === 'expense')
                    .reduce((s: number, t: Transaction) => s + t.amount, 0);

                return (
                    <div className="h-full flex flex-col p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <KpiCard title="Total Transactions" value={context.transactions.length} />
                            <KpiCard title="Total Outflow (All Time)" value={`$${totalOutflow.toLocaleString(undefined, {maximumFractionDigits: 0})}`} />
                        </div>
                        <p className="text-sm font-semibold text-gray-300 mb-2">Top 5 Spending Categories</p>
                        <div className="flex-grow">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" hide />
                                    <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={100} interval={0} />
                                    <Tooltip cursor={{ fill: 'rgba(100,116,139,0.1)' }} contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)' }} formatter={(v:number) => `$${v.toFixed(2)}`}/>
                                    <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            }

            case View.Investments: {
                const chartData = context.assets.map(a => ({ ...a }));
                const totalValue = chartData.reduce((sum, asset) => sum + asset.value, 0);

                return (
                     <div className="h-full flex flex-col p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <KpiCard title="Total Invested" value={`$${totalValue.toLocaleString()}`} />
                            <KpiCard title="Asset Classes" value={chartData.length} />
                        </div>
                        <p className="text-sm font-semibold text-gray-300 mb-2">Asset Allocation</p>
                         <div className="flex-grow">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50}>
                                        {chartData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)' }}/>
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                );
            }

            case View.Budgets: {
                const chartData = context.budgets.map(b => ({
                    name: b.name,
                    value: Math.min((b.spent / b.limit) * 100, 100),
                    fill: b.spent > b.limit ? '#ef4444' : (b.spent / b.limit > 0.8 ? '#f59e0b' : '#06b6d4')
                }));
                const overBudget = context.budgets.filter(b => b.spent > b.limit).length;

                return (
                    <div className="h-full flex flex-col p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <KpiCard title="Total Budgets" value={context.budgets.length} />
                            <KpiCard title="Over Limit" value={overBudget} className={overBudget > 0 ? "text-red-400" : ""} />
                        </div>
                        <p className="text-sm font-semibold text-gray-300 mb-2">Budget Utilization (%)</p>
                        <div className="flex-grow">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="horizontal">
                                    <XAxis dataKey="name" fontSize={10} interval={0} />
                                    <YAxis unit="%" domain={[0,100]}/>
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)' }} formatter={(v:number) => `${v.toFixed(1)}%`}/>
                                    <Bar dataKey="value" name="Used">
                                        {chartData.map(entry => <Cell key={entry.name} fill={entry.fill}/>)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )
            }
            
            case View.CorporateDashboard: {
                 return (
                    <div className="h-full flex flex-col p-4">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <KpiCard title="Pending Approvals" value={context.paymentOrders.filter(p => p.status === 'needs_approval').length} />
                            <KpiCard title="Overdue Invoices" value={context.invoices.filter(i => i.status === 'overdue').length} />
                            <KpiCard title="Open Compliance" value={context.complianceCases.filter(c => c.status === 'open').length} />
                            <KpiCard title="New Anomalies" value={context.financialAnomalies.filter(a => a.status === 'New').length} />
                        </div>
                         <p className="text-sm font-semibold text-gray-300 mb-2">Recent Corporate Transactions</p>
                         <div className="flex-grow text-xs space-y-2 overflow-y-auto">
                            {context.corporateTransactions.slice(0, 10).map(tx => (
                                <div key={tx.id} className="flex justify-between bg-gray-800/50 p-2 rounded">
                                    <span>{tx.merchant}</span>
                                    <span className="font-mono">${tx.amount.toFixed(2)}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                 )
            }

            case View.AIAdStudio: {
                 return (
                    <div className="h-full flex flex-col p-4 items-center justify-center text-center">
                        <h4 className="text-lg font-bold text-white mb-2">AI Ad Studio</h4>
                        <p className="text-gray-400 text-sm mb-4">Generate high-quality video content from a simple text prompt using the Veo 2.0 model.</p>
                         <div className="w-full aspect-video bg-gray-900/50 rounded-lg flex items-center justify-center border border-gray-700">
                             <p className="text-gray-500">Video previews will appear here.</p>
                         </div>
                    </div>
                );
            }

            default:
                 // FIX: Look up the nav item to get the icon. The 'item' was not defined in this scope.
                if (!item || !('icon' in item) || !item.icon) {
                    return (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-4">
                            <p className="text-sm">Preview not available for {viewId}.</p>
                        </div>
                    );
                }
                return (
                    <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-4">
                        <div className="w-16 h-16 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center mb-4">
                            {React.cloneElement(context.unlockedFeatures.has(viewId) ? (item.icon as React.ReactElement) : <p>?</p>, { className: 'h-8 w-8'})}
                        </div>
                        <p className="text-sm">A detailed preview for this module is being generated by our AI.</p>
                        <p className="text-xs mt-2">(Placeholder for {viewId})</p>
                    </div>
                );
        }
    }

    return renderContent();
};

export default ViewAnalyticsPreview;