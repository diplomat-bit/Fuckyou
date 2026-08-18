// components/views/corporate/CorporateDashboardView.tsx
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import { View } from '../../../types';
import { GoogleGenAI } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import IntegrationCodex from '../../IntegrationCodex';

interface CorporateDashboardViewProps {
    setActiveView: (view: View) => void;
}

const CorporateDashboardView: React.FC<CorporateDashboardViewProps> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    const [aiInsight, setAiInsight] = useState('');
    const [isInsightLoading, setIsInsightLoading] = useState(false);

    if (!context) throw new Error("CorporateDashboardView must be within a DataProvider.");
    
    const { paymentOrders, invoices, complianceCases, corporateTransactions, financialAnomalies } = context;

    const summaryStats = useMemo(() => ({
        pendingApprovals: paymentOrders.filter(p => p.status === 'needs_approval').length,
        overdueInvoices: invoices.filter(i => i.status === 'overdue').length,
        openCases: complianceCases.filter(c => c.status === 'open').length,
        totalOutflow: corporateTransactions.reduce((acc, tx) => acc + tx.amount, 0),
        newAnomalies: financialAnomalies.filter(a => a.status === 'New').length,
    }), [paymentOrders, invoices, complianceCases, corporateTransactions, financialAnomalies]);
    
    const spendingByCategory = useMemo(() => corporateTransactions.reduce((acc, tx) => {
        const category = tx.merchant.includes('Steakhouse') || tx.merchant.includes('Lunch') ? 'T&E' :
                         tx.merchant.includes('Cloud') || tx.merchant.includes('Software') ? 'Software' : 'Other';
        if (!acc[category]) acc[category] = 0;
        acc[category] += tx.amount;
        return acc;
    }, {} as { [key: string]: number }), [corporateTransactions]);
    
    const chartData = Object.entries(spendingByCategory).map(([name, value]) => ({ name, value }));
    
    useEffect(() => {
        const generateInsight = async () => {
            setIsInsightLoading(true);
            try {
                // Removed API key usage as per instruction.
                // const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const dataSummary = `Pending Approvals: ${summaryStats.pendingApprovals}, Overdue Invoices: ${summaryStats.overdueInvoices}, Open Compliance Cases: ${summaryStats.openCases}, New Anomalies: ${summaryStats.newAnomalies}. Recent spending is focused on: ${chartData.map(d=>d.name).join(', ')}.`;
                const prompt = `You are a corporate finance AI controller. Based on the following summary, provide a single, concise (1-2 sentences) strategic recommendation or observation for the finance manager. Summary:\n${dataSummary}`;
                
                // Placeholder for AI response generation without API key
                setAiInsight(`Based on your current financial overview, focus on resolving overdue invoices and reviewing new anomalies to maintain strong financial health.`);
            } catch (error) {
                setAiInsight("An error occurred while analyzing corporate data.");
            } finally { setIsInsightLoading(false); }
        };
        generateInsight();
    }, [summaryStats, chartData]);

    const StatCard: React.FC<{ title: string; value: string | number; view: View; className?: string }> = ({ title, value, view, className = '' }) => (
        <Card variant="interactive" onClick={() => setActiveView(view)} className={`text-center ${className}`}>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400 mt-1">{title}</p>
        </Card>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Corporate Dashboard</h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard title="Pending Approvals" value={summaryStats.pendingApprovals} view={View.PaymentOrders} />
                <StatCard title="Overdue Invoices" value={summaryStats.overdueInvoices} view={View.Invoices} />
                <StatCard title="Open Compliance Cases" value={summaryStats.openCases} view={View.Compliance} />
                <StatCard title="New Anomalies" value={summaryStats.newAnomalies} view={View.AnomalyDetection} className="border-yellow-500/80 shadow-yellow-500/10" />
                <Card className="text-center">
                    <p className="text-3xl font-bold text-white">${(summaryStats.totalOutflow / 1000).toFixed(1)}k</p>
                    <p className="text-sm text-gray-400 mt-1">Total Spend (7d)</p>
                </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="AI Controller Summary" className="lg:col-span-1">
                     {isInsightLoading ? <p className="text-gray-400 text-sm">Analyzing...</p> : 
                         <p className="text-gray-300 text-sm italic">"{aiInsight}"</p>
                     }
                </Card>
                <Card title="Spending by Category" className="lg:col-span-2">
                     <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={12} width={80} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} formatter={(v: number) => `$${v.toFixed(2)}`} />
                                <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
             <Card title="Recent Corporate Transactions">
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30 sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Holder</th>
                                <th scope="col" className="px-6 py-3">Merchant</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {corporateTransactions.map(tx => (
                                <tr key={tx.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{tx.holderName}</td>
                                    <td className="px-6 py-4">{tx.merchant}</td>
                                    <td className="px-6 py-4 font-mono text-white">${tx.amount.toFixed(2)}</td>
                                    <td className="px-6 py-4"><span className={`px-2 py-0.5 text-xs rounded-full ${tx.status === 'Approved' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>{tx.status}</span></td>
                                    <td className="px-6 py-4">{tx.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <IntegrationCodex module={View.CorporateDashboard} />
        </div>
    );
};

export default CorporateDashboardView;