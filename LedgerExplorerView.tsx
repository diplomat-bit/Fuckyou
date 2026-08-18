// components/views/platform/LedgerExplorerView.tsx
import React, { useState, useMemo } from 'react';
import Card from '../../Card';
import { LedgerAccount } from '../../../types';
import { MOCK_LEDGER_ACCOUNTS } from '../../../data/ledgerAccounts'; // For fallback
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const LedgerExplorerView: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [ledgerData, setLedgerData] = useState<LedgerAccount[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFetch = async () => {
        setIsLoading(true);
        setError(null);
        setLedgerData(null);

        if (!apiKey.trim()) {
            setError("API Key is required.");
            setIsLoading(false);
            return;
        }

        const url = 'https://app.moderntreasury.com/api/ledger_accounts?per_page=100';
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                authorization: `Basic ${apiKey}`
            }
        };

        try {
            // This fetch will likely be blocked by CORS in a browser environment.
            // A backend proxy is the standard solution in a production application.
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
            }
            const data: LedgerAccount[] = await response.json();
            setLedgerData(data);
        } catch (e: any) {
            setError(`Fetch failed: ${e.message}. This may be due to a CORS policy. For demonstration purposes, mock data will be loaded.`);
            // For demonstration purposes, load mock data on failure
            setLedgerData(MOCK_LEDGER_ACCOUNTS);
        } finally {
            setIsLoading(false);
        }
    };

    const chartData = useMemo(() => {
        if (!ledgerData) return { balances: [], composition: [] };
        
        const balances = ledgerData.map(acc => {
            const amount = acc.balances.posted_balance.amount / Math.pow(10, acc.balances.posted_balance.currency_exponent);
            return {
                name: acc.name,
                balance: acc.normal_balance === 'credit' ? -amount : amount,
            };
        });

        const composition = [
            { name: 'Assets (Debit)', value: 0 },
            { name: 'Liabilities/Equity (Credit)', value: 0 }
        ];
        balances.forEach(item => {
            const originalAccount = ledgerData.find(acc => acc.name === item.name);
            if (originalAccount?.normal_balance === 'debit') {
                composition[0].value += item.balance;
            } else {
                composition[1].value += item.balance;
            }
        });

        return { balances, composition };
    }, [ledgerData]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Ledger Explorer</h2>
            <Card title="Modern Treasury Connection">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="Enter your Basic Auth API Key Token"
                        className="flex-grow bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white font-mono"
                    />
                    <button onClick={handleFetch} disabled={isLoading} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:opacity-50">
                        {isLoading ? 'Fetching...' : 'Fetch Ledger Data'}
                    </button>
                </div>
            </Card>

            {isLoading && <Card><p className="text-center text-gray-400">Loading data from ledger...</p></Card>}
            {error && <Card><p className="text-center text-red-400">{error}</p></Card>}

            {ledgerData && (
                <div className="space-y-6">
                    <Card title="Ledger Account Balances">
                         <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.balances} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} interval={0} angle={-35} textAnchor="end" />
                                <YAxis stroke="#9ca3af" tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(val: number) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}/>
                                <Bar dataKey="balance" name="Posted Balance" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                    <Card title="Asset vs. Liability/Equity Composition">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={chartData.composition} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {chartData.composition.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(val: number) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default LedgerExplorerView;
