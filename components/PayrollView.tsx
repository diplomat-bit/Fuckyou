// components/views/corporate/PayrollView.tsx
import React, { useContext, useState, useMemo } from 'react';
import Card from '../../Card';
import { DataContext } from '../../../context/DataContext';
import { PayRun, PayRunStatus } from '../../../types';
import { GoogleGenAI, Type } from "@google/genai";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PayrollView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("PayrollView must be within DataProvider");

    const { payRuns } = context;
    const [isRunModalOpen, setRunModalOpen] = useState(false);
    const [isAiModalOpen, setAiModalOpen] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [aiFeature, setAiFeature] = useState<'anomaly' | 'forecast' | 'benchmark' | 'compliance' | null>(null);

    const nextPayRun = useMemo(() => payRuns.find(p => p.status === 'Pending'), [payRuns]);
    const lastPaidRun = useMemo(() => payRuns.find(p => p.status === 'Paid'), [payRuns]);

    const handleRunPayroll = () => {
        alert(`Initiating payroll run for ${nextPayRun?.payDate}...`);
        setRunModalOpen(false);
    };

    const handleAiCheck = async (type: 'anomaly' | 'forecast' | 'benchmark' | 'compliance') => {
        setAiFeature(type);
        setAiModalOpen(true);
        setIsAiLoading(true);
        let prompt = '';
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            switch (type) {
                case 'anomaly':
                    prompt = `You are an expert payroll analyst AI. Analyze this upcoming pay run for anomalies (e.g., significant changes from previous runs, large bonuses, missing employees). Provide a brief summary of your findings. Upcoming Run: ${JSON.stringify(nextPayRun)}. Previous Runs: ${JSON.stringify(payRuns.filter(p => p.status === 'Paid'))}`;
                    break;
                case 'forecast':
                    prompt = `You are a financial planning AI. Based on the historical payroll data, forecast the total payroll cost for the next 3 months, assuming a 2% monthly growth in headcount. Historical Data: ${JSON.stringify(payRuns.filter(p => p.status === 'Paid'))}`;
                    break;
                case 'benchmark':
                    prompt = `You are an HR compensation analyst. Given an average salary of $${(lastPaidRun && lastPaidRun.totalAmount && lastPaidRun.employeeCount ? (lastPaidRun.totalAmount / lastPaidRun.employeeCount) * 24 : 0).toFixed(0)}/year for a tech company, how does this compare to the industry benchmark? Provide a brief analysis.`;
                    break;
                case 'compliance':
                    prompt = `You are a compliance AI. What are the key payroll compliance considerations for a remote company with employees in California and New York? List the top 3 as bullet points.`;
                    break;
            }
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setAiAnalysis(response.text);
        } catch (err) {
            setAiAnalysis("Could not generate analysis at this time.");
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const StatusBadge: React.FC<{ status: PayRunStatus }> = ({ status }) => {
        const colors = {
            'Pending': 'bg-yellow-500/20 text-yellow-300',
            'Processing': 'bg-blue-500/20 text-blue-300',
            'Paid': 'bg-green-500/20 text-green-300',
            'Failed': 'bg-red-500/20 text-red-300',
        };
        return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>;
    };
    
    const costByDeptData = [
        { name: 'Engineering', value: 90000 },
        { name: 'Sales', value: 35000 },
        { name: 'Marketing', value: 25000 },
    ];
    const COLORS = ['#06b6d4', '#6366f1', '#f59e0b'];


    return (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Payroll Command Center</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">${nextPayRun ? (nextPayRun.totalAmount / 1000).toFixed(1) : '0'}k</p><p className="text-sm text-gray-400 mt-1">Next Total Payroll</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{nextPayRun?.payDate || 'N/A'}</p><p className="text-sm text-gray-400 mt-1">Next Pay Date</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">{payRuns.filter(p=>p.status === 'Paid').reduce((s,p)=>s+p.totalAmount, 0).toLocaleString('en-US', {style:'currency', currency: 'USD', minimumFractionDigits:0, maximumFractionDigits:0})}</p><p className="text-sm text-gray-400 mt-1">Total Paid (YTD)</p></Card>
                    <Card variant="interactive" onClick={() => nextPayRun && setRunModalOpen(true)} className="text-center flex flex-col justify-center items-center bg-cyan-600/50 hover:bg-cyan-600 text-white cursor-pointer">
                        <p className="text-xl font-bold">Run Next Payroll</p>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title="Payroll Cost Over Time">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={payRuns.filter(p=>p.status==='Paid').reverse()}>
                                <XAxis dataKey="payDate" fontSize={12} />
                                <YAxis tickFormatter={(val) => `$${val/1000}k`} fontSize={12}/>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                                <Line type="monotone" dataKey="totalAmount" stroke="#8884d8" name="Total Payroll"/>
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                     <Card title="Headcount vs. Avg. Salary">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={payRuns.filter(p=>p.status==='Paid').reverse()}>
                                <XAxis dataKey="payDate" fontSize={12} />
                                <YAxis yAxisId="left" tickFormatter={(val) => `${val}`} orientation="left" stroke="#8884d8" fontSize={12}/>
                                <YAxis yAxisId="right" tickFormatter={(val) => `$${val/1000}k`} orientation="right" stroke="#82ca9d" fontSize={12}/>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                                <Legend />
                                <Bar yAxisId="left" dataKey="employeeCount" fill="#8884d8" name="Employees" />
                                <Bar yAxisId="right" dataKey={(data) => data.totalAmount / data.employeeCount} fill="#82ca9d" name="Avg. Salary" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                     <Card title="AI Payroll Suite" className="lg:col-span-2">
                        <div className="space-y-3">
                            <button onClick={() => handleAiCheck('anomaly')} className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg"><h4 className="font-semibold text-white">Pre-Run Anomaly Check</h4><p className="text-xs text-gray-400 mt-1">Scan the next pay run for unusual changes or potential errors before execution.</p></button>
                            <button onClick={() => handleAiCheck('forecast')} className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg"><h4 className="font-semibold text-white">Payroll Forecasting</h4><p className="text-xs text-gray-400 mt-1">Generate a 3-month payroll cost forecast based on historical trends.</p></button>
                            <button onClick={() => handleAiCheck('benchmark')} className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg"><h4 className="font-semibold text-white">Compensation Benchmarking</h4><p className="text-xs text-gray-400 mt-1">Analyze your average salary against industry benchmarks.</p></button>
                            <button onClick={() => handleAiCheck('compliance')} className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-700 rounded-lg"><h4 className="font-semibold text-white">Compliance Q&A</h4><p className="text-xs text-gray-400 mt-1">Ask the AI questions about payroll regulations and laws.</p></button>
                        </div>
                    </Card>
                    <Card title="Cost by Department" className="lg:col-span-3">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={costByDeptData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {costByDeptData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </div>
                
                <Card title="Pay Run History">
                     <table className="w-full text-sm">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30"><tr><th className="px-6 py-3">Pay Date</th><th className="px-6 py-3">Period</th><th className="px-6 py-3">Total Amount</th><th className="px-6 py-3">Status</th></tr></thead>
                        <tbody>{payRuns.map(p => <tr key={p.id}><td className="px-6 py-4 text-white">{p.payDate}</td><td>{p.periodStart} to {p.periodEnd}</td><td className="font-mono">${p.totalAmount.toLocaleString()}</td><td><StatusBadge status={p.status} /></td></tr>)}</tbody>
                    </table>
                </Card>
            </div>
            {isRunModalOpen && nextPayRun && (
                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setRunModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full" onClick={e=>e.stopPropagation()}>
                        <div className="p-4"><h3 className="text-lg font-semibold text-white">Confirm Payroll Run</h3></div>
                        <div className="p-6">
                            <p>You are about to run payroll for the period {nextPayRun.periodStart} to {nextPayRun.periodEnd}, to be paid on {nextPayRun.payDate}.</p>
                            <p className="text-2xl font-bold my-4">Total: ${nextPayRun.totalAmount.toLocaleString()}</p>
                             <button onClick={() => handleAiCheck('anomaly')} className="w-full py-2 mb-2 bg-gray-600/50 hover:bg-gray-600 rounded">Run AI Anomaly Check</button>
                            <div className="flex gap-4 mt-4">
                                <button onClick={() => setRunModalOpen(false)} className="w-full py-2 bg-gray-700 rounded">Cancel</button>
                                <button onClick={handleRunPayroll} className="w-full py-2 bg-green-600 hover:bg-green-700 rounded">Confirm & Run</button>
                            </div>
                        </div>
                    </div>
                 </div>
            )}
            {isAiModalOpen && <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={() => setAiModalOpen(false)}>
                <div className="bg-gray-800 rounded-lg shadow-2xl max-w-lg w-full" onClick={e=>e.stopPropagation()}>
                    <div className="p-4"><h3 className="text-lg font-semibold text-white">AI Payroll Analysis</h3></div>
                    <div className="p-6 min-h-[10rem] whitespace-pre-line text-sm">{isAiLoading ? "Analyzing..." : aiAnalysis}</div>
                </div>
            </div>}
        </>
    );
};

export default PayrollView;