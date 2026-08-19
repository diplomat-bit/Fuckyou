

import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, PaymentOrder, Invoice, ComplianceCase, CorporateTransaction } from '../types';
import { GoogleGenAI } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// Analytics Data Structures

export type TimeSeriesData = {
    date: string;
    value: number;
    secondaryValue?: number;
    tertiaryValue?: number;
};

export type CategoricalData = {
    category: string;
    value: number;
    percentage?: number;
    color?: string;
};

export type FinancialRatio = {
    name: string;
    value: number;
    benchmark: number;
    status: 'Healthy' | 'Warning' | 'Critical';
    delta: number;
};

export type VendorPerformanceMetric = {
    vendor: string;
    totalSpend: number;
    transactionCount: number;
    avgTransactionValue: number;
    riskScore: number;
    lastInteraction: string;
};

export type DepartmentalKPI = {
    department: string;
    budgetUtilization: number;
    operationalEfficiency: number;
    complianceScore: number;
    headcountSpend: number;
};

export type RiskAssessmentData = {
    riskCategory: string;
    probability: number;
    impact: number;
    mitigationStatus: string;
    exposureValue: number;
};

export type CashFlowProjection = {
    period: string;
    inflow: number;
    outflow: number;
    netPosition: number;
    cumulativeCash: number;
};

export type AuditLogEntry = {
    timestamp: string;
    user: string;
    action: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    details: string;
};

export type TaxLiabilityBreakdown = {
    jurisdiction: string;
    taxType: string;
    estimatedAmount: number;
    dueDate: string;
    status: 'Accrued' | 'Paid' | 'Pending';
};

// Data Processing Functions

/**
 * Generates daily transaction volume and amount analytics.
 */
export const generateDailyTransactionAnalytics = (transactions: CorporateTransaction[]): TimeSeriesData[] => {
    const dailyMap: Record<string, { count: number; amount: number }> = {};
    transactions.forEach(tx => {
        const date = new Date(tx.date).toISOString().split('T')[0];
        if (!dailyMap[date]) dailyMap[date] = { count: 0, amount: 0 };
        dailyMap[date].count++;
        dailyMap[date].amount += tx.amount;
    });
    return Object.entries(dailyMap)
        .map(([date, data]) => ({ date, value: data.amount, secondaryValue: data.count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Calculates key financial ratios.
 */
export const calculateEnterpriseFinancialRatios = (invoices: Invoice[], orders: PaymentOrder[], transactions: CorporateTransaction[]): FinancialRatio[] => {
    const currentAssets = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);
    const currentLiabilities = orders.filter(o => o.status !== 'paid').reduce((sum, o) => sum + o.amount, 0);
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const netProfitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
    const burnRate = totalExpenses / 30; // Simplified 30-day period for calculation
    
    return [
        { name: 'Current Ratio', value: currentRatio, benchmark: 1.5, status: currentRatio > 1.5 ? 'Healthy' : currentRatio > 1.0 ? 'Warning' : 'Critical', delta: 0.1 },
        { name: 'Net Profit Margin', value: netProfitMargin, benchmark: 20, status: netProfitMargin > 20 ? 'Healthy' : netProfitMargin > 10 ? 'Warning' : 'Critical', delta: -2.5 },
        { name: 'Daily Burn Rate', value: burnRate, benchmark: 5000, status: burnRate < 5000 ? 'Healthy' : 'Warning', delta: 12.4 }
    ];
};

/**
 * Projects cash flow for the next 6 periods.
 */
export const generateCashFlowProjections = (invoices: Invoice[], orders: PaymentOrder[]): CashFlowProjection[] => {
    const projections: CashFlowProjection[] = [];
    const today = new Date();
    let currentCash = 1000000; // Initial capital assumption

    for (let i = 0; i < 6; i++) {
        const futureDate = new Date(today);
        futureDate.setMonth(today.getMonth() + i);
        const periodKey = futureDate.toISOString().substring(0, 7);
        
        // Estimated inflows from receivables
        const projectedInflow = invoices
            .filter(inv => new Date(inv.dueDate).getMonth() === futureDate.getMonth())
            .reduce((sum, inv) => sum + inv.amount, 0) * 0.95; // Assumed 95% collection rate

        // Estimated outflows from payables and recurring expenses
        const projectedOutflow = orders
            .filter(ord => new Date(ord.dueDate || '').getMonth() === futureDate.getMonth())
            .reduce((sum, ord) => sum + ord.amount, 0) * 1.1; // Assumed 10% buffer for variable costs

        const net = projectedInflow - projectedOutflow;
        currentCash += net;

        projections.push({
            period: periodKey,
            inflow: projectedInflow,
            outflow: projectedOutflow,
            netPosition: net,
            cumulativeCash: currentCash
        });
    }
    return projections;
};

/**
 * Analyzes vendor performance and spend.
 */
export const analyzeVendorEcosystem = (transactions: CorporateTransaction[]): VendorPerformanceMetric[] => {
    const vendorMap: Record<string, VendorPerformanceMetric> = {};
    
    transactions.forEach(tx => {
        if (!vendorMap[tx.merchant]) {
            vendorMap[tx.merchant] = {
                vendor: tx.merchant,
                totalSpend: 0,
                transactionCount: 0,
                avgTransactionValue: 0,
                riskScore: Math.floor(Math.random() * 100), // Simulated risk score
                lastInteraction: tx.date
            };
        }
        const v = vendorMap[tx.merchant];
        v.totalSpend += tx.amount;
        v.transactionCount++;
        v.avgTransactionValue = v.totalSpend / v.transactionCount;
        if (new Date(tx.date) > new Date(v.lastInteraction)) {
            v.lastInteraction = tx.date;
        }
    });

    return Object.values(vendorMap).sort((a, b) => b.totalSpend - a.totalSpend);
};

/**
 * Segments operational spend into categories.
 */
export const segmentOperationalSpend = (transactions: CorporateTransaction[]): CategoricalData[] => {
    const categories = {
        'Fixed Infrastructure': 0,
        'Variable COGS': 0,
        'R&D Investment': 0,
        'Sales & Marketing': 0,
        'G&A': 0
    };

    transactions.forEach(tx => {
        if (tx.merchant.includes('Rent') || tx.merchant.includes('AWS') || tx.merchant.includes('Server')) categories['Fixed Infrastructure'] += tx.amount;
        else if (tx.merchant.includes('Supplier') || tx.merchant.includes('Logistics')) categories['Variable COGS'] += tx.amount;
        else if (tx.description.includes('Research') || tx.description.includes('Lab')) categories['R&D Investment'] += tx.amount;
        else if (tx.merchant.includes('Ads') || tx.merchant.includes('Google') || tx.merchant.includes('Facebook')) categories['Sales & Marketing'] += tx.amount;
        else categories['G&A'] += tx.amount;
    });

    return Object.entries(categories).map(([category, value]) => ({ category, value }));
};

/**
 * Estimates tax liabilities.
 */
export const estimateTaxLiabilities = (revenue: number, expenses: number): TaxLiabilityBreakdown[] => {
    const profit = Math.max(0, revenue - expenses);
    return [
        { jurisdiction: 'Federal', taxType: 'Corporate Income Tax', estimatedAmount: profit * 0.21, dueDate: '2024-04-15', status: 'Accrued' },
        { jurisdiction: 'State (CA)', taxType: 'Franchise Tax', estimatedAmount: profit * 0.0884, dueDate: '2024-04-15', status: 'Accrued' },
        { jurisdiction: 'International', taxType: 'VAT/GST', estimatedAmount: revenue * 0.05, dueDate: 'Monthly', status: 'Pending' },
        { jurisdiction: 'Local', taxType: 'Payroll Tax', estimatedAmount: expenses * 0.0765, dueDate: 'Bi-Weekly', status: 'Paid' }
    ];
};

/**
 * Generates risk assessment data.
 */
export const generateEnterpriseRiskHeatmap = (cases: ComplianceCase[], transactions: CorporateTransaction[]): RiskAssessmentData[] => {
    const risks: RiskAssessmentData[] = [
        { riskCategory: 'AML/KYC', probability: 0.15, impact: 0.9, mitigationStatus: 'Monitoring', exposureValue: 500000 },
        { riskCategory: 'Data Privacy (GDPR)', probability: 0.05, impact: 0.95, mitigationStatus: 'Controlled', exposureValue: 2000000 },
        { riskCategory: 'Vendor Fraud', probability: 0.2, impact: 0.4, mitigationStatus: 'Active Investigation', exposureValue: 150000 },
        { riskCategory: 'Tax Compliance', probability: 0.1, impact: 0.7, mitigationStatus: 'Audited', exposureValue: 750000 },
        { riskCategory: 'Cybersecurity', probability: 0.3, impact: 0.99, mitigationStatus: 'Hardened', exposureValue: 5000000 }
    ];

    // Adjusts risk based on data
    if (cases.some(c => c.type === 'AML')) risks[0].probability += 0.2;
    if (transactions.some(t => t.amount > 50000)) risks[2].probability += 0.1;

    return risks;
};

// Main Component

interface CorporateDashboardProps {
    setActiveView?: (view: View) => void;
}

const CorporateCommandView: React.FC<CorporateDashboardProps> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    
    // State Management
    const [activeTab, setActiveTab] = useState<'Overview' | 'Finance' | 'Operations' | 'Risk' | 'Strategy'>('Overview');
    const [aiInsight, setAiInsight] = useState<string>('Initializing AI...');
    const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    if (!context) throw new Error("CorporateCommandView requires DataContext.");
    const { paymentOrders, invoices, complianceCases, corporateTransactions } = context;

    // Data Aggregation
    
    // Financials
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
    const totalExpenses = corporateTransactions.reduce((acc, t) => acc + t.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    const financialRatios = calculateEnterpriseFinancialRatios(invoices, paymentOrders, corporateTransactions);
    const cashFlowForecast = generateCashFlowProjections(invoices, paymentOrders);
    const taxLiabilities = estimateTaxLiabilities(totalRevenue, totalExpenses);

    // Operations
    const dailyVolume = generateDailyTransactionAnalytics(corporateTransactions);
    const operationalSpend = segmentOperationalSpend(corporateTransactions);
    const vendorMetrics = analyzeVendorEcosystem(corporateTransactions);
    const topVendors = vendorMetrics.slice(0, 5);
    
    // Risk
    const riskHeatmap = generateEnterpriseRiskHeatmap(complianceCases, corporateTransactions);
    const openComplianceCases = complianceCases.filter(c => c.status === 'open');
    const criticalRisks = riskHeatmap.filter(r => r.probability * r.impact > 0.15);

    // AI Integration
    useEffect(() => {
        const generateStrategicReport = async () => {
            setIsAiProcessing(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                
                let promptContext = '';
                if (activeTab === 'Overview') {
                    promptContext = `Executive Summary: Revenue $${totalRevenue}, Expenses $${totalExpenses}, Net Income $${netIncome}. Critical Risks: ${criticalRisks.length}. Top Vendor: ${topVendors[0]?.vendor}.`;
                } else if (activeTab === 'Finance') {
                    promptContext = `Financial Deep Dive: Current Ratio ${financialRatios[0].value.toFixed(2)}, Net Margin ${financialRatios[1].value.toFixed(2)}%. Cash Flow Trend: ${cashFlowForecast[0].netPosition > 0 ? 'Positive' : 'Negative'}. Tax Liability: $${taxLiabilities.reduce((s, t) => s + t.estimatedAmount, 0).toFixed(2)}.`;
                } else if (activeTab === 'Operations') {
                    promptContext = `Ops Report: Transaction Volume ${dailyVolume.length} days active. Top Spend Category: ${operationalSpend.sort((a,b) => b.value - a.value)[0]?.category}. Vendor Count: ${vendorMetrics.length}.`;
                } else if (activeTab === 'Risk') {
                    promptContext = `Risk Assessment: Open Cases ${openComplianceCases.length}. Highest Risk Category: ${riskHeatmap.sort((a,b) => b.probability - a.probability)[0]?.riskCategory}. Exposure: $${riskHeatmap.reduce((s,r) => s + r.exposureValue, 0)}.`;
                } else {
                    promptContext = `Strategic Outlook: Based on burn rate of $${financialRatios[2].value.toFixed(2)}/day and projected cash flow. Suggest 3 strategic moves for growth and stability.`;
                }

                const prompt = `You are an advanced Corporate AI Assistant. Analyze the following data context for the '${activeTab}' view and provide a high-level, professional, actionable strategic insight (max 2 sentences). Context: ${promptContext}`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                setAiInsight(response.text);
                setLastUpdated(new Date());
            } catch (error) {
                console.error("AI Processing Error:", error);
                setAiInsight("AI link unavailable. Using fallback data.");
            } finally {
                setIsAiProcessing(false);
            }
        };

        generateStrategicReport();
    }, [activeTab, totalRevenue, totalExpenses, netIncome]);

    // Visualization Utilities
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
    
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val);

    // Inline Sub-Components
    
    const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`px-6 py-3 text-sm font-bold tracking-wide transition-all duration-200 border-b-2 ${
                activeTab === id 
                ? 'border-blue-500 text-white bg-gray-800/50' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
        >
            {label}
        </button>
    );

    const MetricCard: React.FC<{ title: string, value: string, subtext?: string, trend?: number, color?: string }> = ({ title, value, subtext, trend, color = 'blue' }) => (
        <div className={`bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg relative overflow-hidden group hover:border-${color}-500 transition-colors`}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">{title}</h3>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            {subtext && <div className="text-gray-500 text-sm">{subtext}</div>}
            {trend !== undefined && (
                <div className={`text-sm font-medium mt-3 flex items-center ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% <span className="text-gray-600 ml-1">vs last period</span>
                </div>
            )}
        </div>
    );

    // Component Rendering

    return (
        <div className="min-h-screen bg-gray-900 text-white p-2 space-y-8 font-sans">
            
            {/* HEADER & NAVIGATION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        NEXUS COMMAND
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Enterprise Operating System v4.2.0 • {lastUpdated.toLocaleString()}</p>
                </div>
                <div className="flex space-x-1 mt-4 md:mt-0 bg-gray-900 rounded-lg p-1 border border-gray-800">
                    <TabButton id="Overview" label="EXECUTIVE" />
                    <TabButton id="Finance" label="FINANCE" />
                    <TabButton id="Operations" label="OPERATIONS" />
                    <TabButton id="Risk" label="RISK & COMPLIANCE" />
                    <TabButton id="Strategy" label="STRATEGY" />
                </div>
            </div>

            {/* AI INSIGHT BAR */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl rounded-lg" />
                <Card className="relative bg-gray-800/80 backdrop-blur border border-blue-500/30 p-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-500/10 rounded-full animate-pulse">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">AI Strategic Intelligence</h3>
                            {isAiProcessing ? (
                                <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse" />
                            ) : (
                                <p className="text-lg text-gray-100 leading-relaxed font-light">"{aiInsight}"</p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* DYNAMIC CONTENT AREA */}
            <div className="space-y-8 animate-fade-in">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'Overview' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Total Revenue (YTD)" value={formatCurrency(totalRevenue)} trend={12.5} color="green" />
                            <MetricCard title="Net Income" value={formatCurrency(netIncome)} trend={8.2} color="blue" />
                            <MetricCard title="Active Risks" value={criticalRisks.length.toString()} subtext="Critical Severity" trend={-5.0} color="red" />
                            <MetricCard title="Cash Runway" value="14.2 Months" subtext="Based on current burn" color="purple" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                            <Card title="Revenue vs Expenses Trend" className="lg:col-span-2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashFlowForecast}>
                                        <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                                        <Legend />
                                        <Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Operational Spend Mix" className="h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={operationalSpend} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                            {operationalSpend.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    </>
                )}

                {/* FINANCE TAB */}
                {activeTab === 'Finance' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {financialRatios.map((ratio, idx) => (
                                <MetricCard 
                                    key={idx} 
                                    title={ratio.name} 
                                    value={typeof ratio.value === 'number' && ratio.value < 100 ? ratio.value.toFixed(2) : formatNumber(ratio.value)} 
                                    subtext={`Benchmark: ${ratio.benchmark}`}
                                    trend={ratio.delta}
                                    color={ratio.status === 'Healthy' ? 'green' : ratio.status === 'Warning' ? 'yellow' : 'red'}
                                />
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Projected Cash Position (6 Months)" className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashFlowForecast}>
                                        <XAxis dataKey="period" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" tickFormatter={(val) => `$${val/1000}k`} />
                                        <Tooltip cursor={{fill: '#374151'}} contentStyle={{ backgroundColor: '#1f2937' }} />
                                        <Bar dataKey="cumulativeCash" fill="#3b82f6" name="Cash Balance" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Estimated Tax Liability Breakdown" className="h-80 overflow-auto">
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="bg-gray-800 text-gray-200 uppercase font-bold">
                                        <tr>
                                            <th className="p-3">Jurisdiction</th>
                                            <th className="p-3">Type</th>
                                            <th className="p-3 text-right">Amount</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {taxLiabilities.map((tax, i) => (
                                            <tr key={i} className="hover:bg-gray-800/50">
                                                <td className="p-3">{tax.jurisdiction}</td>
                                                <td className="p-3">{tax.taxType}</td>
                                                <td className="p-3 text-right font-mono text-white">{formatCurrency(tax.estimatedAmount)}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${tax.status === 'Paid' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                                        {tax.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        </div>
                    </>
                )}

                {/* OPERATIONS TAB */}
                {activeTab === 'Operations' && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card title="Daily Transaction Volume" className="lg:col-span-2 h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyVolume}>
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickFormatter={(d) => d.substring(5)} />
                                        <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} />
                                        <Bar yAxisId="left" dataKey="value" fill="#3b82f6" name="Volume ($)" opacity={0.8} />
                                        <Bar yAxisId="right" dataKey="secondaryValue" fill="#10b981" name="Count" barSize={10} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Top Vendor Ecosystem" className="h-96 overflow-auto">
                                <div className="space-y-4">
                                    {topVendors.map((vendor, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
                                            <div>
                                                <div className="font-bold text-white">{vendor.vendor}</div>
                                                <div className="text-xs text-gray-500">{vendor.transactionCount} txns • Risk: {vendor.riskScore}/100</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-blue-400">{formatCurrency(vendor.totalSpend)}</div>
                                                <div className="text-xs text-gray-500">Avg: {formatCurrency(vendor.avgTransactionValue)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </>
                )}

                {/* RISK TAB */}
                {activeTab === 'Risk' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Compliance Score" value="94.2" subtext="Top 5% Industry" color="green" />
                            <MetricCard title="Open Cases" value={openComplianceCases.length.toString()} subtext="Requires Attention" color="yellow" />
                            <MetricCard title="Total Risk Exposure" value={formatCurrency(riskHeatmap.reduce((a,b)=>a+b.exposureValue,0))} color="red" />
                            <MetricCard title="Audit Anomalies" value="3" subtext="Last 24 Hours" color="purple" />
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Enterprise Risk Heatmap" className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={riskHeatmap} layout="vertical" margin={{ left: 40 }}>
                                        <XAxis type="number" domain={[0, 1]} hide />
                                        <YAxis type="category" dataKey="riskCategory" stroke="#9ca3af" width={120} fontSize={11} />
                                        <Tooltip cursor={{fill: 'transparent'}} content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-xl">
                                                        <p className="font-bold text-white">{data.riskCategory}</p>
                                                        <p className="text-sm text-gray-400">Prob: {(data.probability * 100).toFixed(0)}% | Impact: {(data.impact * 100).toFixed(0)}%</p>
                                                        <p className="text-sm text-red-400">Exposure: {formatCurrency(data.exposureValue)}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                        <Bar dataKey="probability" name="Probability" stackId="a" fill="#f59e0b" barSize={20} />
                                        <Bar dataKey="impact" name="Impact" stackId="a" fill="#ef4444" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Compliance Case Log" className="h-96 overflow-auto">
                                <div className="space-y-2">
                                    {complianceCases.map((c, i) => (
                                        <div key={i} className="p-3 border-l-4 border-red-500 bg-gray-800/50 rounded flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-sm text-white">{c.type} Violation</div>
                                                <div className="text-xs text-gray-500">{c.description}</div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded font-bold ${c.status === 'open' ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-300'}`}>
                                                {c.status.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                    {complianceCases.length === 0 && <div className="text-center text-gray-500 py-10">No active compliance cases detected. Systems nominal.</div>}
                                </div>
                            </Card>
                        </div>
                    </>
                )}

                {/* STRATEGY TAB */}
                {activeTab === 'Strategy' && (
                    <div className="grid grid-cols-1 gap-6">
                        <Card title="Strategic Growth Modeling" className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-2xl font-bold text-white">Scenario Analysis: Aggressive Expansion</h3>
                                    <p className="text-gray-400">
                                        Based on current liquidity of {formatCurrency(financialRatios[0].value * 1000000)} and a burn rate of {formatCurrency(financialRatios[2].value)}, 
                                        the enterprise can sustain a 15% increase in R&D spend for 8 months before requiring additional capital injection.
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-300">
                                            <span>Market Penetration Probability</span>
                                            <span>78%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-300">
                                            <span>Regulatory Approval Confidence</span>
                                            <span>92%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/3 bg-gray-800 p-6 rounded-xl border border-gray-700">
                                    <h4 className="font-bold text-white mb-4">AI Recommendation Engine</h4>
                                    <ul className="space-y-4">
                                        <li className="flex items-start space-x-3">
                                            <span className="text-green-400 text-xl">✓</span>
                                            <span className="text-sm text-gray-300">Optimize vendor contracts to reduce variable OPEX by 12%.</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="text-green-400 text-xl">✓</span>
                                            <span className="text-sm text-gray-300">Accelerate receivables collection to improve DSO by 5 days.</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="text-yellow-400 text-xl">⚠</span>
                                            <span className="text-sm text-gray-300">Monitor geopolitical risk in supply chain region APAC-1.</span>
                                        </li>
                                    </ul>
                                    <button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors" onClick={() => setActiveView && setActiveView(View.Budgets)}>
                                        Adjust Budgets
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CorporateCommandView;


// --- CONSOLIDATED FROM: CorporateCommandView (4).tsx ---

import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, PaymentOrder, Invoice, ComplianceCase, CorporateTransaction } from '../types';
import { GoogleGenAI } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// Analytics Data Structures

export type TimeSeriesData = {
    date: string;
    value: number;
    secondaryValue?: number;
    tertiaryValue?: number;
};

export type CategoricalData = {
    category: string;
    value: number;
    percentage?: number;
    color?: string;
};

export type FinancialRatio = {
    name: string;
    value: number;
    benchmark: number;
    status: 'Healthy' | 'Warning' | 'Critical';
    delta: number;
};

export type VendorPerformanceMetric = {
    vendor: string;
    totalSpend: number;
    transactionCount: number;
    avgTransactionValue: number;
    riskScore: number;
    lastInteraction: string;
};

export type DepartmentalKPI = {
    department: string;
    budgetUtilization: number;
    operationalEfficiency: number;
    complianceScore: number;
    headcountSpend: number;
};

export type RiskAssessmentData = {
    riskCategory: string;
    probability: number;
    impact: number;
    mitigationStatus: string;
    exposureValue: number;
};

export type CashFlowProjection = {
    period: string;
    inflow: number;
    outflow: number;
    netPosition: number;
    cumulativeCash: number;
};

export type AuditLogEntry = {
    timestamp: string;
    user: string;
    action: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    details: string;
};

export type TaxLiabilityBreakdown = {
    jurisdiction: string;
    taxType: string;
    estimatedAmount: number;
    dueDate: string;
    status: 'Accrued' | 'Paid' | 'Pending';
};

// Data Processing Functions

/**
 * Generates daily transaction volume and amount analytics.
 */
export const generateDailyTransactionAnalytics = (transactions: CorporateTransaction[]): TimeSeriesData[] => {
    const dailyMap: Record<string, { count: number; amount: number }> = {};
    transactions.forEach(tx => {
        const date = new Date(tx.date).toISOString().split('T')[0];
        if (!dailyMap[date]) dailyMap[date] = { count: 0, amount: 0 };
        dailyMap[date].count++;
        dailyMap[date].amount += tx.amount;
    });
    return Object.entries(dailyMap)
        .map(([date, data]) => ({ date, value: data.amount, secondaryValue: data.count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Calculates key financial ratios.
 */
export const calculateEnterpriseFinancialRatios = (invoices: Invoice[], orders: PaymentOrder[], transactions: CorporateTransaction[]): FinancialRatio[] => {
    const currentAssets = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);
    const currentLiabilities = orders.filter(o => o.status !== 'paid').reduce((sum, o) => sum + o.amount, 0);
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const netProfitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
    const burnRate = totalExpenses / 30; // Simplified 30-day period for calculation
    
    return [
        { name: 'Current Ratio', value: currentRatio, benchmark: 1.5, status: currentRatio > 1.5 ? 'Healthy' : currentRatio > 1.0 ? 'Warning' : 'Critical', delta: 0.1 },
        { name: 'Net Profit Margin', value: netProfitMargin, benchmark: 20, status: netProfitMargin > 20 ? 'Healthy' : netProfitMargin > 10 ? 'Warning' : 'Critical', delta: -2.5 },
        { name: 'Daily Burn Rate', value: burnRate, benchmark: 5000, status: burnRate < 5000 ? 'Healthy' : 'Warning', delta: 12.4 }
    ];
};

/**
 * Projects cash flow for the next 6 periods.
 */
export const generateCashFlowProjections = (invoices: Invoice[], orders: PaymentOrder[]): CashFlowProjection[] => {
    const projections: CashFlowProjection[] = [];
    const today = new Date();
    let currentCash = 1000000; // Initial capital assumption

    for (let i = 0; i < 6; i++) {
        const futureDate = new Date(today);
        futureDate.setMonth(today.getMonth() + i);
        const periodKey = futureDate.toISOString().substring(0, 7);
        
        // Estimated inflows from receivables
        const projectedInflow = invoices
            .filter(inv => new Date(inv.dueDate).getMonth() === futureDate.getMonth())
            .reduce((sum, inv) => sum + inv.amount, 0) * 0.95; // Assumed 95% collection rate

        // Estimated outflows from payables and recurring expenses
        const projectedOutflow = orders
            .filter(ord => new Date(ord.dueDate || '').getMonth() === futureDate.getMonth())
            .reduce((sum, ord) => sum + ord.amount, 0) * 1.1; // Assumed 10% buffer for variable costs

        const net = projectedInflow - projectedOutflow;
        currentCash += net;

        projections.push({
            period: periodKey,
            inflow: projectedInflow,
            outflow: projectedOutflow,
            netPosition: net,
            cumulativeCash: currentCash
        });
    }
    return projections;
};

/**
 * Analyzes vendor performance and spend.
 */
export const analyzeVendorEcosystem = (transactions: CorporateTransaction[]): VendorPerformanceMetric[] => {
    const vendorMap: Record<string, VendorPerformanceMetric> = {};
    
    transactions.forEach(tx => {
        if (!vendorMap[tx.merchant]) {
            vendorMap[tx.merchant] = {
                vendor: tx.merchant,
                totalSpend: 0,
                transactionCount: 0,
                avgTransactionValue: 0,
                riskScore: Math.floor(Math.random() * 100), // Simulated risk score
                lastInteraction: tx.date
            };
        }
        const v = vendorMap[tx.merchant];
        v.totalSpend += tx.amount;
        v.transactionCount++;
        v.avgTransactionValue = v.totalSpend / v.transactionCount;
        if (new Date(tx.date) > new Date(v.lastInteraction)) {
            v.lastInteraction = tx.date;
        }
    });

    return Object.values(vendorMap).sort((a, b) => b.totalSpend - a.totalSpend);
};

/**
 * Segments operational spend into categories.
 */
export const segmentOperationalSpend = (transactions: CorporateTransaction[]): CategoricalData[] => {
    const categories = {
        'Fixed Infrastructure': 0,
        'Variable COGS': 0,
        'R&D Investment': 0,
        'Sales & Marketing': 0,
        'G&A': 0
    };

    transactions.forEach(tx => {
        if (tx.merchant.includes('Rent') || tx.merchant.includes('AWS') || tx.merchant.includes('Server')) categories['Fixed Infrastructure'] += tx.amount;
        else if (tx.merchant.includes('Supplier') || tx.merchant.includes('Logistics')) categories['Variable COGS'] += tx.amount;
        else if (tx.description.includes('Research') || tx.description.includes('Lab')) categories['R&D Investment'] += tx.amount;
        else if (tx.merchant.includes('Ads') || tx.merchant.includes('Google') || tx.merchant.includes('Facebook')) categories['Sales & Marketing'] += tx.amount;
        else categories['G&A'] += tx.amount;
    });

    return Object.entries(categories).map(([category, value]) => ({ category, value }));
};

/**
 * Estimates tax liabilities.
 */
export const estimateTaxLiabilities = (revenue: number, expenses: number): TaxLiabilityBreakdown[] => {
    const profit = Math.max(0, revenue - expenses);
    return [
        { jurisdiction: 'Federal', taxType: 'Corporate Income Tax', estimatedAmount: profit * 0.21, dueDate: '2024-04-15', status: 'Accrued' },
        { jurisdiction: 'State (CA)', taxType: 'Franchise Tax', estimatedAmount: profit * 0.0884, dueDate: '2024-04-15', status: 'Accrued' },
        { jurisdiction: 'International', taxType: 'VAT/GST', estimatedAmount: revenue * 0.05, dueDate: 'Monthly', status: 'Pending' },
        { jurisdiction: 'Local', taxType: 'Payroll Tax', estimatedAmount: expenses * 0.0765, dueDate: 'Bi-Weekly', status: 'Paid' }
    ];
};

/**
 * Generates risk assessment data.
 */
export const generateEnterpriseRiskHeatmap = (cases: ComplianceCase[], transactions: CorporateTransaction[]): RiskAssessmentData[] => {
    const risks: RiskAssessmentData[] = [
        { riskCategory: 'AML/KYC', probability: 0.15, impact: 0.9, mitigationStatus: 'Monitoring', exposureValue: 500000 },
        { riskCategory: 'Data Privacy (GDPR)', probability: 0.05, impact: 0.95, mitigationStatus: 'Controlled', exposureValue: 2000000 },
        { riskCategory: 'Vendor Fraud', probability: 0.2, impact: 0.4, mitigationStatus: 'Active Investigation', exposureValue: 150000 },
        { riskCategory: 'Tax Compliance', probability: 0.1, impact: 0.7, mitigationStatus: 'Audited', exposureValue: 750000 },
        { riskCategory: 'Cybersecurity', probability: 0.3, impact: 0.99, mitigationStatus: 'Hardened', exposureValue: 5000000 }
    ];

    // Adjusts risk based on data
    if (cases.some(c => c.type === 'AML')) risks[0].probability += 0.2;
    if (transactions.some(t => t.amount > 50000)) risks[2].probability += 0.1;

    return risks;
};

// Main Component

interface CorporateDashboardProps {
    setActiveView?: (view: View) => void;
}

const CorporateCommandView: React.FC<CorporateDashboardProps> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    
    // State Management
    const [activeTab, setActiveTab] = useState<'Overview' | 'Finance' | 'Operations' | 'Risk' | 'Strategy'>('Overview');
    const [aiInsight, setAiInsight] = useState<string>('Initializing AI...');
    const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    if (!context) throw new Error("CorporateCommandView requires DataContext.");
    const { paymentOrders, invoices, complianceCases, corporateTransactions } = context;

    // Data Aggregation
    
    // Financials
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
    const totalExpenses = corporateTransactions.reduce((acc, t) => acc + t.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    const financialRatios = calculateEnterpriseFinancialRatios(invoices, paymentOrders, corporateTransactions);
    const cashFlowForecast = generateCashFlowProjections(invoices, paymentOrders);
    const taxLiabilities = estimateTaxLiabilities(totalRevenue, totalExpenses);

    // Operations
    const dailyVolume = generateDailyTransactionAnalytics(corporateTransactions);
    const operationalSpend = segmentOperationalSpend(corporateTransactions);
    const vendorMetrics = analyzeVendorEcosystem(corporateTransactions);
    const topVendors = vendorMetrics.slice(0, 5);
    
    // Risk
    const riskHeatmap = generateEnterpriseRiskHeatmap(complianceCases, corporateTransactions);
    const openComplianceCases = complianceCases.filter(c => c.status === 'open');
    const criticalRisks = riskHeatmap.filter(r => r.probability * r.impact > 0.15);

    // AI Integration
    useEffect(() => {
        const generateStrategicReport = async () => {
            setIsAiProcessing(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                
                let promptContext = '';
                if (activeTab === 'Overview') {
                    promptContext = `Executive Summary: Revenue $${totalRevenue}, Expenses $${totalExpenses}, Net Income $${netIncome}. Critical Risks: ${criticalRisks.length}. Top Vendor: ${topVendors[0]?.vendor}.`;
                } else if (activeTab === 'Finance') {
                    promptContext = `Financial Deep Dive: Current Ratio ${financialRatios[0].value.toFixed(2)}, Net Margin ${financialRatios[1].value.toFixed(2)}%. Cash Flow Trend: ${cashFlowForecast[0].netPosition > 0 ? 'Positive' : 'Negative'}. Tax Liability: $${taxLiabilities.reduce((s, t) => s + t.estimatedAmount, 0).toFixed(2)}.`;
                } else if (activeTab === 'Operations') {
                    promptContext = `Ops Report: Transaction Volume ${dailyVolume.length} days active. Top Spend Category: ${operationalSpend.sort((a,b) => b.value - a.value)[0]?.category}. Vendor Count: ${vendorMetrics.length}.`;
                } else if (activeTab === 'Risk') {
                    promptContext = `Risk Assessment: Open Cases ${openComplianceCases.length}. Highest Risk Category: ${riskHeatmap.sort((a,b) => b.probability - a.probability)[0]?.riskCategory}. Exposure: $${riskHeatmap.reduce((s,r) => s + r.exposureValue, 0)}.`;
                } else {
                    promptContext = `Strategic Outlook: Based on burn rate of $${financialRatios[2].value.toFixed(2)}/day and projected cash flow. Suggest 3 strategic moves for growth and stability.`;
                }

                const prompt = `You are an advanced Corporate AI Assistant. Analyze the following data context for the '${activeTab}' view and provide a high-level, professional, actionable strategic insight (max 2 sentences). Context: ${promptContext}`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                setAiInsight(response.text);
                setLastUpdated(new Date());
            } catch (error) {
                console.error("AI Processing Error:", error);
                setAiInsight("AI link unavailable. Using fallback data.");
            } finally {
                setIsAiProcessing(false);
            }
        };

        generateStrategicReport();
    }, [activeTab, totalRevenue, totalExpenses, netIncome]);

    // Visualization Utilities
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
    
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val);

    // Inline Sub-Components
    
    const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`px-6 py-3 text-sm font-bold tracking-wide transition-all duration-200 border-b-2 ${
                activeTab === id 
                ? 'border-blue-500 text-white bg-gray-800/50' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
        >
            {label}
        </button>
    );

    const MetricCard: React.FC<{ title: string, value: string, subtext?: string, trend?: number, color?: string }> = ({ title, value, subtext, trend, color = 'blue' }) => (
        <div className={`bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg relative overflow-hidden group hover:border-${color}-500 transition-colors`}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">{title}</h3>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            {subtext && <div className="text-gray-500 text-sm">{subtext}</div>}
            {trend !== undefined && (
                <div className={`text-sm font-medium mt-3 flex items-center ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend >= 0 ? 'â†‘' : 'â†“'} {Math.abs(trend)}% <span className="text-gray-600 ml-1">vs last period</span>
                </div>
            )}
        </div>
    );

    // Component Rendering

    return (
        <div className="min-h-screen bg-gray-900 text-white p-2 space-y-8 font-sans">
            
            {/* HEADER & NAVIGATION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        NEXUS COMMAND
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Enterprise Operating System v4.2.0 â€¢ {lastUpdated.toLocaleString()}</p>
                </div>
                <div className="flex space-x-1 mt-4 md:mt-0 bg-gray-900 rounded-lg p-1 border border-gray-800">
                    <TabButton id="Overview" label="EXECUTIVE" />
                    <TabButton id="Finance" label="FINANCE" />
                    <TabButton id="Operations" label="OPERATIONS" />
                    <TabButton id="Risk" label="RISK & COMPLIANCE" />
                    <TabButton id="Strategy" label="STRATEGY" />
                </div>
            </div>

            {/* AI INSIGHT BAR */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl rounded-lg" />
                <Card className="relative bg-gray-800/80 backdrop-blur border border-blue-500/30 p-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-500/10 rounded-full animate-pulse">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">AI Strategic Intelligence</h3>
                            {isAiProcessing ? (
                                <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse" />
                            ) : (
                                <p className="text-lg text-gray-100 leading-relaxed font-light">"{aiInsight}"</p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* DYNAMIC CONTENT AREA */}
            <div className="space-y-8 animate-fade-in">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'Overview' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Total Revenue (YTD)" value={formatCurrency(totalRevenue)} trend={12.5} color="green" />
                            <MetricCard title="Net Income" value={formatCurrency(netIncome)} trend={8.2} color="blue" />
                            <MetricCard title="Active Risks" value={criticalRisks.length.toString()} subtext="Critical Severity" trend={-5.0} color="red" />
                            <MetricCard title="Cash Runway" value="14.2 Months" subtext="Based on current burn" color="purple" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                            <Card title="Revenue vs Expenses Trend" className="lg:col-span-2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashFlowForecast}>
                                        <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                                        <Legend />
                                        <Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Operational Spend Mix" className="h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={operationalSpend} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                            {operationalSpend.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    </>
                )}

                {/* FINANCE TAB */}
                {activeTab === 'Finance' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {financialRatios.map((ratio, idx) => (
                                <MetricCard 
                                    key={idx} 
                                    title={ratio.name} 
                                    value={typeof ratio.value === 'number' && ratio.value < 100 ? ratio.value.toFixed(2) : formatNumber(ratio.value)} 
                                    subtext={`Benchmark: ${ratio.benchmark}`}
                                    trend={ratio.delta}
                                    color={ratio.status === 'Healthy' ? 'green' : ratio.status === 'Warning' ? 'yellow' : 'red'}
                                />
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Projected Cash Position (6 Months)" className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashFlowForecast}>
                                        <XAxis dataKey="period" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" tickFormatter={(val) => `$${val/1000}k`} />
                                        <Tooltip cursor={{fill: '#374151'}} contentStyle={{ backgroundColor: '#1f2937' }} />
                                        <Bar dataKey="cumulativeCash" fill="#3b82f6" name="Cash Balance" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Estimated Tax Liability Breakdown" className="h-80 overflow-auto">
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="bg-gray-800 text-gray-200 uppercase font-bold">
                                        <tr>
                                            <th className="p-3">Jurisdiction</th>
                                            <th className="p-3">Type</th>
                                            <th className="p-3 text-right">Amount</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {taxLiabilities.map((tax, i) => (
                                            <tr key={i} className="hover:bg-gray-800/50">
                                                <td className="p-3">{tax.jurisdiction}</td>
                                                <td className="p-3">{tax.taxType}</td>
                                                <td className="p-3 text-right font-mono text-white">{formatCurrency(tax.estimatedAmount)}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${tax.status === 'Paid' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                                        {tax.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        </div>
                    </>
                )}

                {/* OPERATIONS TAB */}
                {activeTab === 'Operations' && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card title="Daily Transaction Volume" className="lg:col-span-2 h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyVolume}>
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickFormatter={(d) => d.substring(5)} />
                                        <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} />
                                        <Bar yAxisId="left" dataKey="value" fill="#3b82f6" name="Volume ($)" opacity={0.8} />
                                        <Bar yAxisId="right" dataKey="secondaryValue" fill="#10b981" name="Count" barSize={10} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Top Vendor Ecosystem" className="h-96 overflow-auto">
                                <div className="space-y-4">
                                    {topVendors.map((vendor, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
                                            <div>
                                                <div className="font-bold text-white">{vendor.vendor}</div>
                                                <div className="text-xs text-gray-500">{vendor.transactionCount} txns â€¢ Risk: {vendor.riskScore}/100</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-blue-400">{formatCurrency(vendor.totalSpend)}</div>
                                                <div className="text-xs text-gray-500">Avg: {formatCurrency(vendor.avgTransactionValue)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </>
                )}

                {/* RISK TAB */}
                {activeTab === 'Risk' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Compliance Score" value="94.2" subtext="Top 5% Industry" color="green" />
                            <MetricCard title="Open Cases" value={openComplianceCases.length.toString()} subtext="Requires Attention" color="yellow" />
                            <MetricCard title="Total Risk Exposure" value={formatCurrency(riskHeatmap.reduce((a,b)=>a+b.exposureValue,0))} color="red" />
                            <MetricCard title="Audit Anomalies" value="3" subtext="Last 24 Hours" color="purple" />
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Enterprise Risk Heatmap" className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={riskHeatmap} layout="vertical" margin={{ left: 40 }}>
                                        <XAxis type="number" domain={[0, 1]} hide />
                                        <YAxis type="category" dataKey="riskCategory" stroke="#9ca3af" width={120} fontSize={11} />
                                        <Tooltip cursor={{fill: 'transparent'}} content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-xl">
                                                        <p className="font-bold text-white">{data.riskCategory}</p>
                                                        <p className="text-sm text-gray-400">Prob: {(data.probability * 100).toFixed(0)}% | Impact: {(data.impact * 100).toFixed(0)}%</p>
                                                        <p className="text-sm text-red-400">Exposure: {formatCurrency(data.exposureValue)}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                        <Bar dataKey="probability" name="Probability" stackId="a" fill="#f59e0b" barSize={20} />
                                        <Bar dataKey="impact" name="Impact" stackId="a" fill="#ef4444" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Compliance Case Log" className="h-96 overflow-auto">
                                <div className="space-y-2">
                                    {complianceCases.map((c, i) => (
                                        <div key={i} className="p-3 border-l-4 border-red-500 bg-gray-800/50 rounded flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-sm text-white">{c.type} Violation</div>
                                                <div className="text-xs text-gray-500">{c.description}</div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded font-bold ${c.status === 'open' ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-300'}`}>
                                                {c.status.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                    {complianceCases.length === 0 && <div className="text-center text-gray-500 py-10">No active compliance cases detected. Systems nominal.</div>}
                                </div>
                            </Card>
                        </div>
                    </>
                )}

                {/* STRATEGY TAB */}
                {activeTab === 'Strategy' && (
                    <div className="grid grid-cols-1 gap-6">
                        <Card title="Strategic Growth Modeling" className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-2xl font-bold text-white">Scenario Analysis: Aggressive Expansion</h3>
                                    <p className="text-gray-400">
                                        Based on current liquidity of {formatCurrency(financialRatios[0].value * 1000000)} and a burn rate of {formatCurrency(financialRatios[2].value)}, 
                                        the enterprise can sustain a 15% increase in R&D spend for 8 months before requiring additional capital injection.
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-300">
                                            <span>Market Penetration Probability</span>
                                            <span>78%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-300">
                                            <span>Regulatory Approval Confidence</span>
                                            <span>92%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/3 bg-gray-800 p-6 rounded-xl border border-gray-700">
                                    <h4 className="font-bold text-white mb-4">AI Recommendation Engine</h4>
                                    <ul className="space-y-4">
                                        <li className="flex items-start space-x-3">
                                            <span className="text-green-400 text-xl">âœ“</span>
                                            <span className="text-sm text-gray-300">Optimize vendor contracts to reduce variable OPEX by 12%.</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="text-green-400 text-xl">âœ“</span>
                                            <span className="text-sm text-gray-300">Accelerate receivables collection to improve DSO by 5 days.</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="text-yellow-400 text-xl">âš </span>
                                            <span className="text-sm text-gray-300">Monitor geopolitical risk in supply chain region APAC-1.</span>
                                        </li>
                                    </ul>
                                    <button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors" onClick={() => setActiveView && setActiveView(View.Budgets)}>
                                        Adjust Budgets
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CorporateCommandView;

// --- CONSOLIDATED FROM: CorporateCommandView (4)_1.tsx ---

import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, PaymentOrder, Invoice, ComplianceCase, CorporateTransaction } from '../types';
import { GoogleGenAI } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// Analytics Data Structures

export type TimeSeriesData = {
    date: string;
    value: number;
    secondaryValue?: number;
    tertiaryValue?: number;
};

export type CategoricalData = {
    category: string;
    value: number;
    percentage?: number;
    color?: string;
};

export type FinancialRatio = {
    name: string;
    value: number;
    benchmark: number;
    status: 'Healthy' | 'Warning' | 'Critical';
    delta: number;
};

export type VendorPerformanceMetric = {
    vendor: string;
    totalSpend: number;
    transactionCount: number;
    avgTransactionValue: number;
    riskScore: number;
    lastInteraction: string;
};

export type DepartmentalKPI = {
    department: string;
    budgetUtilization: number;
    operationalEfficiency: number;
    complianceScore: number;
    headcountSpend: number;
};

export type RiskAssessmentData = {
    riskCategory: string;
    probability: number;
    impact: number;
    mitigationStatus: string;
    exposureValue: number;
};

export type CashFlowProjection = {
    period: string;
    inflow: number;
    outflow: number;
    netPosition: number;
    cumulativeCash: number;
};

export type AuditLogEntry = {
    timestamp: string;
    user: string;
    action: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    details: string;
};

export type TaxLiabilityBreakdown = {
    jurisdiction: string;
    taxType: string;
    estimatedAmount: number;
    dueDate: string;
    status: 'Accrued' | 'Paid' | 'Pending';
};

// Data Processing Functions

/**
 * Generates daily transaction volume and amount analytics.
 */
export const generateDailyTransactionAnalytics = (transactions: CorporateTransaction[]): TimeSeriesData[] => {
    const dailyMap: Record<string, { count: number; amount: number }> = {};
    transactions.forEach(tx => {
        const date = new Date(tx.date).toISOString().split('T')[0];
        if (!dailyMap[date]) dailyMap[date] = { count: 0, amount: 0 };
        dailyMap[date].count++;
        dailyMap[date].amount += tx.amount;
    });
    return Object.entries(dailyMap)
        .map(([date, data]) => ({ date, value: data.amount, secondaryValue: data.count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Calculates key financial ratios.
 */
export const calculateEnterpriseFinancialRatios = (invoices: Invoice[], orders: PaymentOrder[], transactions: CorporateTransaction[]): FinancialRatio[] => {
    const currentAssets = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);
    const currentLiabilities = orders.filter(o => o.status !== 'paid').reduce((sum, o) => sum + o.amount, 0);
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const netProfitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
    const burnRate = totalExpenses / 30; // Simplified 30-day period for calculation
    
    return [
        { name: 'Current Ratio', value: currentRatio, benchmark: 1.5, status: currentRatio > 1.5 ? 'Healthy' : currentRatio > 1.0 ? 'Warning' : 'Critical', delta: 0.1 },
        { name: 'Net Profit Margin', value: netProfitMargin, benchmark: 20, status: netProfitMargin > 20 ? 'Healthy' : netProfitMargin > 10 ? 'Warning' : 'Critical', delta: -2.5 },
        { name: 'Daily Burn Rate', value: burnRate, benchmark: 5000, status: burnRate < 5000 ? 'Healthy' : 'Warning', delta: 12.4 }
    ];
};

/**
 * Projects cash flow for the next 6 periods.
 */
export const generateCashFlowProjections = (invoices: Invoice[], orders: PaymentOrder[]): CashFlowProjection[] => {
    const projections: CashFlowProjection[] = [];
    const today = new Date();
    let currentCash = 1000000; // Initial capital assumption

    for (let i = 0; i < 6; i++) {
        const futureDate = new Date(today);
        futureDate.setMonth(today.getMonth() + i);
        const periodKey = futureDate.toISOString().substring(0, 7);
        
        // Estimated inflows from receivables
        const projectedInflow = invoices
            .filter(inv => new Date(inv.dueDate).getMonth() === futureDate.getMonth())
            .reduce((sum, inv) => sum + inv.amount, 0) * 0.95; // Assumed 95% collection rate

        // Estimated outflows from payables and recurring expenses
        const projectedOutflow = orders
            .filter(ord => new Date(ord.dueDate || '').getMonth() === futureDate.getMonth())
            .reduce((sum, ord) => sum + ord.amount, 0) * 1.1; // Assumed 10% buffer for variable costs

        const net = projectedInflow - projectedOutflow;
        currentCash += net;

        projections.push({
            period: periodKey,
            inflow: projectedInflow,
            outflow: projectedOutflow,
            netPosition: net,
            cumulativeCash: currentCash
        });
    }
    return projections;
};

/**
 * Analyzes vendor performance and spend.
 */
export const analyzeVendorEcosystem = (transactions: CorporateTransaction[]): VendorPerformanceMetric[] => {
    const vendorMap: Record<string, VendorPerformanceMetric> = {};
    
    transactions.forEach(tx => {
        if (!vendorMap[tx.merchant]) {
            vendorMap[tx.merchant] = {
                vendor: tx.merchant,
                totalSpend: 0,
                transactionCount: 0,
                avgTransactionValue: 0,
                riskScore: Math.floor(Math.random() * 100), // Simulated risk score
                lastInteraction: tx.date
            };
        }
        const v = vendorMap[tx.merchant];
        v.totalSpend += tx.amount;
        v.transactionCount++;
        v.avgTransactionValue = v.totalSpend / v.transactionCount;
        if (new Date(tx.date) > new Date(v.lastInteraction)) {
            v.lastInteraction = tx.date;
        }
    });

    return Object.values(vendorMap).sort((a, b) => b.totalSpend - a.totalSpend);
};

/**
 * Segments operational spend into categories.
 */
export const segmentOperationalSpend = (transactions: CorporateTransaction[]): CategoricalData[] => {
    const categories = {
        'Fixed Infrastructure': 0,
        'Variable COGS': 0,
        'R&D Investment': 0,
        'Sales & Marketing': 0,
        'G&A': 0
    };

    transactions.forEach(tx => {
        if (tx.merchant.includes('Rent') || tx.merchant.includes('AWS') || tx.merchant.includes('Server')) categories['Fixed Infrastructure'] += tx.amount;
        else if (tx.merchant.includes('Supplier') || tx.merchant.includes('Logistics')) categories['Variable COGS'] += tx.amount;
        else if (tx.description.includes('Research') || tx.description.includes('Lab')) categories['R&D Investment'] += tx.amount;
        else if (tx.merchant.includes('Ads') || tx.merchant.includes('Google') || tx.merchant.includes('Facebook')) categories['Sales & Marketing'] += tx.amount;
        else categories['G&A'] += tx.amount;
    });

    return Object.entries(categories).map(([category, value]) => ({ category, value }));
};

/**
 * Estimates tax liabilities.
 */
export const estimateTaxLiabilities = (revenue: number, expenses: number): TaxLiabilityBreakdown[] => {
    const profit = Math.max(0, revenue - expenses);
    return [
        { jurisdiction: 'Federal', taxType: 'Corporate Income Tax', estimatedAmount: profit * 0.21, dueDate: '2024-04-15', status: 'Accrued' },
        { jurisdiction: 'State (CA)', taxType: 'Franchise Tax', estimatedAmount: profit * 0.0884, dueDate: '2024-04-15', status: 'Accrued' },
        { jurisdiction: 'International', taxType: 'VAT/GST', estimatedAmount: revenue * 0.05, dueDate: 'Monthly', status: 'Pending' },
        { jurisdiction: 'Local', taxType: 'Payroll Tax', estimatedAmount: expenses * 0.0765, dueDate: 'Bi-Weekly', status: 'Paid' }
    ];
};

/**
 * Generates risk assessment data.
 */
export const generateEnterpriseRiskHeatmap = (cases: ComplianceCase[], transactions: CorporateTransaction[]): RiskAssessmentData[] => {
    const risks: RiskAssessmentData[] = [
        { riskCategory: 'AML/KYC', probability: 0.15, impact: 0.9, mitigationStatus: 'Monitoring', exposureValue: 500000 },
        { riskCategory: 'Data Privacy (GDPR)', probability: 0.05, impact: 0.95, mitigationStatus: 'Controlled', exposureValue: 2000000 },
        { riskCategory: 'Vendor Fraud', probability: 0.2, impact: 0.4, mitigationStatus: 'Active Investigation', exposureValue: 150000 },
        { riskCategory: 'Tax Compliance', probability: 0.1, impact: 0.7, mitigationStatus: 'Audited', exposureValue: 750000 },
        { riskCategory: 'Cybersecurity', probability: 0.3, impact: 0.99, mitigationStatus: 'Hardened', exposureValue: 5000000 }
    ];

    // Adjusts risk based on data
    if (cases.some(c => c.type === 'AML')) risks[0].probability += 0.2;
    if (transactions.some(t => t.amount > 50000)) risks[2].probability += 0.1;

    return risks;
};

// Main Component

interface CorporateDashboardProps {
    setActiveView?: (view: View) => void;
}

const CorporateCommandView: React.FC<CorporateDashboardProps> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    
    // State Management
    const [activeTab, setActiveTab] = useState<'Overview' | 'Finance' | 'Operations' | 'Risk' | 'Strategy'>('Overview');
    const [aiInsight, setAiInsight] = useState<string>('Initializing AI...');
    const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    if (!context) throw new Error("CorporateCommandView requires DataContext.");
    const { paymentOrders, invoices, complianceCases, corporateTransactions } = context;

    // Data Aggregation
    
    // Financials
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
    const totalExpenses = corporateTransactions.reduce((acc, t) => acc + t.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    const financialRatios = calculateEnterpriseFinancialRatios(invoices, paymentOrders, corporateTransactions);
    const cashFlowForecast = generateCashFlowProjections(invoices, paymentOrders);
    const taxLiabilities = estimateTaxLiabilities(totalRevenue, totalExpenses);

    // Operations
    const dailyVolume = generateDailyTransactionAnalytics(corporateTransactions);
    const operationalSpend = segmentOperationalSpend(corporateTransactions);
    const vendorMetrics = analyzeVendorEcosystem(corporateTransactions);
    const topVendors = vendorMetrics.slice(0, 5);
    
    // Risk
    const riskHeatmap = generateEnterpriseRiskHeatmap(complianceCases, corporateTransactions);
    const openComplianceCases = complianceCases.filter(c => c.status === 'open');
    const criticalRisks = riskHeatmap.filter(r => r.probability * r.impact > 0.15);

    // AI Integration
    useEffect(() => {
        const generateStrategicReport = async () => {
            setIsAiProcessing(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                
                let promptContext = '';
                if (activeTab === 'Overview') {
                    promptContext = `Executive Summary: Revenue $${totalRevenue}, Expenses $${totalExpenses}, Net Income $${netIncome}. Critical Risks: ${criticalRisks.length}. Top Vendor: ${topVendors[0]?.vendor}.`;
                } else if (activeTab === 'Finance') {
                    promptContext = `Financial Deep Dive: Current Ratio ${financialRatios[0].value.toFixed(2)}, Net Margin ${financialRatios[1].value.toFixed(2)}%. Cash Flow Trend: ${cashFlowForecast[0].netPosition > 0 ? 'Positive' : 'Negative'}. Tax Liability: $${taxLiabilities.reduce((s, t) => s + t.estimatedAmount, 0).toFixed(2)}.`;
                } else if (activeTab === 'Operations') {
                    promptContext = `Ops Report: Transaction Volume ${dailyVolume.length} days active. Top Spend Category: ${operationalSpend.sort((a,b) => b.value - a.value)[0]?.category}. Vendor Count: ${vendorMetrics.length}.`;
                } else if (activeTab === 'Risk') {
                    promptContext = `Risk Assessment: Open Cases ${openComplianceCases.length}. Highest Risk Category: ${riskHeatmap.sort((a,b) => b.probability - a.probability)[0]?.riskCategory}. Exposure: $${riskHeatmap.reduce((s,r) => s + r.exposureValue, 0)}.`;
                } else {
                    promptContext = `Strategic Outlook: Based on burn rate of $${financialRatios[2].value.toFixed(2)}/day and projected cash flow. Suggest 3 strategic moves for growth and stability.`;
                }

                const prompt = `You are an advanced Corporate AI Assistant. Analyze the following data context for the '${activeTab}' view and provide a high-level, professional, actionable strategic insight (max 2 sentences). Context: ${promptContext}`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                setAiInsight(response.text);
                setLastUpdated(new Date());
            } catch (error) {
                console.error("AI Processing Error:", error);
                setAiInsight("AI link unavailable. Using fallback data.");
            } finally {
                setIsAiProcessing(false);
            }
        };

        generateStrategicReport();
    }, [activeTab, totalRevenue, totalExpenses, netIncome]);

    // Visualization Utilities
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
    
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val);

    // Inline Sub-Components
    
    const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`px-6 py-3 text-sm font-bold tracking-wide transition-all duration-200 border-b-2 ${
                activeTab === id 
                ? 'border-blue-500 text-white bg-gray-800/50' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
        >
            {label}
        </button>
    );

    const MetricCard: React.FC<{ title: string, value: string, subtext?: string, trend?: number, color?: string }> = ({ title, value, subtext, trend, color = 'blue' }) => (
        <div className={`bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg relative overflow-hidden group hover:border-${color}-500 transition-colors`}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">{title}</h3>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            {subtext && <div className="text-gray-500 text-sm">{subtext}</div>}
            {trend !== undefined && (
                <div className={`text-sm font-medium mt-3 flex items-center ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend >= 0 ? 'â†‘' : 'â†“'} {Math.abs(trend)}% <span className="text-gray-600 ml-1">vs last period</span>
                </div>
            )}
        </div>
    );

    // Component Rendering

    return (
        <div className="min-h-screen bg-gray-900 text-white p-2 space-y-8 font-sans">
            
            {/* HEADER & NAVIGATION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        NEXUS COMMAND
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Enterprise Operating System v4.2.0 â€¢ {lastUpdated.toLocaleString()}</p>
                </div>
                <div className="flex space-x-1 mt-4 md:mt-0 bg-gray-900 rounded-lg p-1 border border-gray-800">
                    <TabButton id="Overview" label="EXECUTIVE" />
                    <TabButton id="Finance" label="FINANCE" />
                    <TabButton id="Operations" label="OPERATIONS" />
                    <TabButton id="Risk" label="RISK & COMPLIANCE" />
                    <TabButton id="Strategy" label="STRATEGY" />
                </div>
            </div>

            {/* AI INSIGHT BAR */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl rounded-lg" />
                <Card className="relative bg-gray-800/80 backdrop-blur border border-blue-500/30 p-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-500/10 rounded-full animate-pulse">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">AI Strategic Intelligence</h3>
                            {isAiProcessing ? (
                                <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse" />
                            ) : (
                                <p className="text-lg text-gray-100 leading-relaxed font-light">"{aiInsight}"</p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* DYNAMIC CONTENT AREA */}
            <div className="space-y-8 animate-fade-in">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'Overview' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Total Revenue (YTD)" value={formatCurrency(totalRevenue)} trend={12.5} color="green" />
                            <MetricCard title="Net Income" value={formatCurrency(netIncome)} trend={8.2} color="blue" />
                            <MetricCard title="Active Risks" value={criticalRisks.length.toString()} subtext="Critical Severity" trend={-5.0} color="red" />
                            <MetricCard title="Cash Runway" value="14.2 Months" subtext="Based on current burn" color="purple" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                            <Card title="Revenue vs Expenses Trend" className="lg:col-span-2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashFlowForecast}>
                                        <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                                        <Legend />
                                        <Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Operational Spend Mix" className="h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={operationalSpend} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                            {operationalSpend.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    </>
                )}

                {/* FINANCE TAB */}
                {activeTab === 'Finance' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {financialRatios.map((ratio, idx) => (
                                <MetricCard 
                                    key={idx} 
                                    title={ratio.name} 
                                    value={typeof ratio.value === 'number' && ratio.value < 100 ? ratio.value.toFixed(2) : formatNumber(ratio.value)} 
                                    subtext={`Benchmark: ${ratio.benchmark}`}
                                    trend={ratio.delta}
                                    color={ratio.status === 'Healthy' ? 'green' : ratio.status === 'Warning' ? 'yellow' : 'red'}
                                />
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Projected Cash Position (6 Months)" className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashFlowForecast}>
                                        <XAxis dataKey="period" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" tickFormatter={(val) => `$${val/1000}k`} />
                                        <Tooltip cursor={{fill: '#374151'}} contentStyle={{ backgroundColor: '#1f2937' }} />
                                        <Bar dataKey="cumulativeCash" fill="#3b82f6" name="Cash Balance" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Estimated Tax Liability Breakdown" className="h-80 overflow-auto">
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="bg-gray-800 text-gray-200 uppercase font-bold">
                                        <tr>
                                            <th className="p-3">Jurisdiction</th>
                                            <th className="p-3">Type</th>
                                            <th className="p-3 text-right">Amount</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {taxLiabilities.map((tax, i) => (
                                            <tr key={i} className="hover:bg-gray-800/50">
                                                <td className="p-3">{tax.jurisdiction}</td>
                                                <td className="p-3">{tax.taxType}</td>
                                                <td className="p-3 text-right font-mono text-white">{formatCurrency(tax.estimatedAmount)}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${tax.status === 'Paid' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                                        {tax.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        </div>
                    </>
                )}

                {/* OPERATIONS TAB */}
                {activeTab === 'Operations' && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card title="Daily Transaction Volume" className="lg:col-span-2 h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyVolume}>
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickFormatter={(d) => d.substring(5)} />
                                        <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} />
                                        <Bar yAxisId="left" dataKey="value" fill="#3b82f6" name="Volume ($)" opacity={0.8} />
                                        <Bar yAxisId="right" dataKey="secondaryValue" fill="#10b981" name="Count" barSize={10} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Top Vendor Ecosystem" className="h-96 overflow-auto">
                                <div className="space-y-4">
                                    {topVendors.map((vendor, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
                                            <div>
                                                <div className="font-bold text-white">{vendor.vendor}</div>
                                                <div className="text-xs text-gray-500">{vendor.transactionCount} txns â€¢ Risk: {vendor.riskScore}/100</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-blue-400">{formatCurrency(vendor.totalSpend)}</div>
                                                <div className="text-xs text-gray-500">Avg: {formatCurrency(vendor.avgTransactionValue)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </>
                )}

                {/* RISK TAB */}
                {activeTab === 'Risk' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Compliance Score" value="94.2" subtext="Top 5% Industry" color="green" />
                            <MetricCard title="Open Cases" value={openComplianceCases.length.toString()} subtext="Requires Attention" color="yellow" />
                            <MetricCard title="Total Risk Exposure" value={formatCurrency(riskHeatmap.reduce((a,b)=>a+b.exposureValue,0))} color="red" />
                            <MetricCard title="Audit Anomalies" value="3" subtext="Last 24 Hours" color="purple" />
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Enterprise Risk Heatmap" className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={riskHeatmap} layout="vertical" margin={{ left: 40 }}>
                                        <XAxis type="number" domain={[0, 1]} hide />
                                        <YAxis type="category" dataKey="riskCategory" stroke="#9ca3af" width={120} fontSize={11} />
                                        <Tooltip cursor={{fill: 'transparent'}} content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-xl">
                                                        <p className="font-bold text-white">{data.riskCategory}</p>
                                                        <p className="text-sm text-gray-400">Prob: {(data.probability * 100).toFixed(0)}% | Impact: {(data.impact * 100).toFixed(0)}%</p>
                                                        <p className="text-sm text-red-400">Exposure: {formatCurrency(data.exposureValue)}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                        <Bar dataKey="probability" name="Probability" stackId="a" fill="#f59e0b" barSize={20} />
                                        <Bar dataKey="impact" name="Impact" stackId="a" fill="#ef4444" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Compliance Case Log" className="h-96 overflow-auto">
                                <div className="space-y-2">
                                    {complianceCases.map((c, i) => (
                                        <div key={i} className="p-3 border-l-4 border-red-500 bg-gray-800/50 rounded flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-sm text-white">{c.type} Violation</div>
                                                <div className="text-xs text-gray-500">{c.description}</div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded font-bold ${c.status === 'open' ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-300'}`}>
                                                {c.status.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                    {complianceCases.length === 0 && <div className="text-center text-gray-500 py-10">No active compliance cases detected. Systems nominal.</div>}
                                </div>
                            </Card>
                        </div>
                    </>
                )}

                {/* STRATEGY TAB */}
                {activeTab === 'Strategy' && (
                    <div className="grid grid-cols-1 gap-6">
                        <Card title="Strategic Growth Modeling" className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-2xl font-bold text-white">Scenario Analysis: Aggressive Expansion</h3>
                                    <p className="text-gray-400">
                                        Based on current liquidity of {formatCurrency(financialRatios[0].value * 1000000)} and a burn rate of {formatCurrency(financialRatios[2].value)}, 
                                        the enterprise can sustain a 15% increase in R&D spend for 8 months before requiring additional capital injection.
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-300">
                                            <span>Market Penetration Probability</span>
                                            <span>78%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-300">
                                            <span>Regulatory Approval Confidence</span>
                                            <span>92%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/3 bg-gray-800 p-6 rounded-xl border border-gray-700">
                                    <h4 className="font-bold text-white mb-4">AI Recommendation Engine</h4>
                                    <ul className="space-y-4">
                                        <li className="flex items-start space-x-3">
                                            <span className="text-green-400 text-xl">âœ“</span>
                                            <span className="text-sm text-gray-300">Optimize vendor contracts to reduce variable OPEX by 12%.</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="text-green-400 text-xl">âœ“</span>
                                            <span className="text-sm text-gray-300">Accelerate receivables collection to improve DSO by 5 days.</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="text-yellow-400 text-xl">âš </span>
                                            <span className="text-sm text-gray-300">Monitor geopolitical risk in supply chain region APAC-1.</span>
                                        </li>
                                    </ul>
                                    <button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors" onClick={() => setActiveView && setActiveView(View.Budgets)}>
                                        Adjust Budgets
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CorporateCommandView;

// --- CONSOLIDATED FROM: CorporateCommandView_1.tsx ---



import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, PaymentOrder, Invoice, ComplianceCase, CorporateTransaction } from '../types';
import { GoogleGenAI } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// Analytics Data Structures

export type TimeSeriesData = {
    date: string;
    value: number;
    secondaryValue?: number;
    tertiaryValue?: number;
};

export type CategoricalData = {
    category: string;
    value: number;
    percentage?: number;
    color?: string;
};

export type FinancialRatio = {
    name: string;
    value: number;
    benchmark: number;
    status: 'Healthy' | 'Warning' | 'Critical';
    delta: number;
};

export type VendorPerformanceMetric = {
    vendor: string;
    totalSpend: number;
    transactionCount: number;
    avgTransactionValue: number;
    riskScore: number;
    lastInteraction: string;
};

export type DepartmentalKPI = {
    department: string;
    budgetUtilization: number;
    operationalEfficiency: number;
    complianceScore: number;
    headcountSpend: number;
};

export type RiskAssessmentData = {
    riskCategory: string;
    probability: number;
    impact: number;
    mitigationStatus: string;
    exposureValue: number;
};

export type CashFlowProjection = {
    period: string;
    inflow: number;
    outflow: number;
    netPosition: number;
    cumulativeCash: number;
};

export type AuditLogEntry = {
    timestamp: string;
    user: string;
    action: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    details: string;
};

export type TaxLiabilityBreakdown = {
    jurisdiction: string;
    taxType: string;
    estimatedAmount: number;
    dueDate: string;
    status: 'Accrued' | 'Paid' | 'Pending';
};

// Data Processing Functions

/**
 * Generates daily transaction volume and amount analytics.
 */
export const generateDailyTransactionAnalytics = (transactions: CorporateTransaction[]): TimeSeriesData[] => {
    const dailyMap: Record<string, { count: number; amount: number }> = {};
    transactions.forEach(tx => {
        const date = new Date(tx.date).toISOString().split('T')[0];
        if (!dailyMap[date]) dailyMap[date] = { count: 0, amount: 0 };
        dailyMap[date].count++;
        dailyMap[date].amount += tx.amount;
    });
    return Object.entries(dailyMap)
        .map(([date, data]) => ({ date, value: data.amount, secondaryValue: data.count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Calculates key financial ratios.
 */
export const calculateEnterpriseFinancialRatios = (invoices: Invoice[], orders: PaymentOrder[], transactions: CorporateTransaction[]): FinancialRatio[] => {
    const currentAssets = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);
    const currentLiabilities = orders.filter(o => o.status !== 'paid').reduce((sum, o) => sum + o.amount, 0);
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const netProfitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
    const burnRate = totalExpenses / 30; // Simplified 30-day period for calculation
    
    return [
        { name: 'Current Ratio', value: currentRatio, benchmark: 1.5, status: currentRatio > 1.5 ? 'Healthy' : currentRatio > 1.0 ? 'Warning' : 'Critical', delta: 0.1 },
        { name: 'Net Profit Margin', value: netProfitMargin, benchmark: 20, status: netProfitMargin > 20 ? 'Healthy' : netProfitMargin > 10 ? 'Warning' : 'Critical', delta: -2.5 },
        { name: 'Daily Burn Rate', value: burnRate, benchmark: 5000, status: burnRate < 5000 ? 'Healthy' : 'Warning', delta: 12.4 }
    ];
};

/**
 * Projects cash flow for the next 6 periods.
 */
export const generateCashFlowProjections = (invoices: Invoice[], orders: PaymentOrder[]): CashFlowProjection[] => {
    const projections: CashFlowProjection[] = [];
    const today = new Date();
    let currentCash = 1000000; // Initial capital assumption

    for (let i = 0; i < 6; i++) {
        const futureDate = new Date(today);
        futureDate.setMonth(today.getMonth() + i);
        const periodKey = futureDate.toISOString().substring(0, 7);
        
        // Estimated inflows from receivables
        const projectedInflow = invoices
            .filter(inv => new Date(inv.dueDate).getMonth() === futureDate.getMonth())
            .reduce((sum, inv) => sum + inv.amount, 0) * 0.95; // Assumed 95% collection rate

        // Estimated outflows from payables and recurring expenses
        const projectedOutflow = orders
            .filter(ord => new Date(ord.dueDate || '').getMonth() === futureDate.getMonth())
            .reduce((sum, ord) => sum + ord.amount, 0) * 1.1; // Assumed 10% buffer for variable costs

        const net = projectedInflow - projectedOutflow;
        currentCash += net;

        projections.push({
            period: periodKey,
            inflow: projectedInflow,
            outflow: projectedOutflow,
            netPosition: net,
            cumulativeCash: currentCash
        });
    }
    return projections;
};

/**
 * Analyzes vendor performance and spend.
 */
export const analyzeVendorEcosystem = (transactions: CorporateTransaction[]): VendorPerformanceMetric[] => {
    const vendorMap: Record<string, VendorPerformanceMetric> = {};
    
    transactions.forEach(tx => {
        if (!vendorMap[tx.merchant]) {
            vendorMap[tx.merchant] = {
                vendor: tx.merchant,
                totalSpend: 0,
                transactionCount: 0,
                avgTransactionValue: 0,
                riskScore: Math.floor(Math.random() * 100), // Simulated risk score
                lastInteraction: tx.date
            };
        }
        const v = vendorMap[tx.merchant];
        v.totalSpend += tx.amount;
        v.transactionCount++;
        v.avgTransactionValue = v.totalSpend / v.transactionCount;
        if (new Date(tx.date) > new Date(v.lastInteraction)) {
            v.lastInteraction = tx.date;
        }
    });

    return Object.values(vendorMap).sort((a, b) => b.totalSpend - a.totalSpend);
};

/**
 * Segments operational spend into categories.
 */
export const segmentOperationalSpend = (transactions: CorporateTransaction[]): CategoricalData[] => {
    const categories = {
        'Fixed Infrastructure': 0,
        'Variable COGS': 0,
        'R&D Investment': 0,
        'Sales & Marketing': 0,
        'G&A': 0
    };

    transactions.forEach(tx => {
        if (tx.merchant.includes('Rent') || tx.merchant.includes('AWS') || tx.merchant.includes('Server')) categories['Fixed Infrastructure'] += tx.amount;
        else if (tx.merchant.includes('Supplier') || tx.merchant.includes('Logistics')) categories['Variable COGS'] += tx.amount;
        else if (tx.description.includes('Research') || tx.description.includes('Lab')) categories['R&D Investment'] += tx.amount;
        else if (tx.merchant.includes('Ads') || tx.merchant.includes('Google') || tx.merchant.includes('Facebook')) categories['Sales & Marketing'] += tx.amount;
        else categories['G&A'] += tx.amount;
    });

    return Object.entries(categories).map(([category, value]) => ({ category, value }));
};

/**
 * Estimates tax liabilities.
 */
export const estimateTaxLiabilities = (revenue: number, expenses: number): TaxLiabilityBreakdown[] => {
    const profit = Math.max(0, revenue - expenses);
    return [
        { jurisdiction: 'Federal', taxType: 'Corporate Income Tax', estimatedAmount: profit * 0.21, dueDate: '2024-04-15', status: 'Accrued' },
        { jurisdiction: 'State (CA)', taxType: 'Franchise Tax', estimatedAmount: profit * 0.0884, dueDate: '2024-04-15', status: 'Accrued' },
        { jurisdiction: 'International', taxType: 'VAT/GST', estimatedAmount: revenue * 0.05, dueDate: 'Monthly', status: 'Pending' },
        { jurisdiction: 'Local', taxType: 'Payroll Tax', estimatedAmount: expenses * 0.0765, dueDate: 'Bi-Weekly', status: 'Paid' }
    ];
};

/**
 * Generates risk assessment data.
 */
export const generateEnterpriseRiskHeatmap = (cases: ComplianceCase[], transactions: CorporateTransaction[]): RiskAssessmentData[] => {
    const risks: RiskAssessmentData[] = [
        { riskCategory: 'AML/KYC', probability: 0.15, impact: 0.9, mitigationStatus: 'Monitoring', exposureValue: 500000 },
        { riskCategory: 'Data Privacy (GDPR)', probability: 0.05, impact: 0.95, mitigationStatus: 'Controlled', exposureValue: 2000000 },
        { riskCategory: 'Vendor Fraud', probability: 0.2, impact: 0.4, mitigationStatus: 'Active Investigation', exposureValue: 150000 },
        { riskCategory: 'Tax Compliance', probability: 0.1, impact: 0.7, mitigationStatus: 'Audited', exposureValue: 750000 },
        { riskCategory: 'Cybersecurity', probability: 0.3, impact: 0.99, mitigationStatus: 'Hardened', exposureValue: 5000000 }
    ];

    // Adjusts risk based on data
    if (cases.some(c => c.type === 'AML')) risks[0].probability += 0.2;
    if (transactions.some(t => t.amount > 50000)) risks[2].probability += 0.1;

    return risks;
};

// Main Component

interface CorporateDashboardProps {
    setActiveView?: (view: View) => void;
}

const CorporateCommandView: React.FC<CorporateDashboardProps> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    
    // State Management
    const [activeTab, setActiveTab] = useState<'Overview' | 'Finance' | 'Operations' | 'Risk' | 'Strategy'>('Overview');
    const [aiInsight, setAiInsight] = useState<string>('Initializing AI...');
    const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    if (!context) throw new Error("CorporateCommandView requires DataContext.");
    const { paymentOrders, invoices, complianceCases, corporateTransactions } = context;

    // Data Aggregation
    
    // Financials
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
    const totalExpenses = corporateTransactions.reduce((acc, t) => acc + t.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    const financialRatios = calculateEnterpriseFinancialRatios(invoices, paymentOrders, corporateTransactions);
    const cashFlowForecast = generateCashFlowProjections(invoices, paymentOrders);
    const taxLiabilities = estimateTaxLiabilities(totalRevenue, totalExpenses);

    // Operations
    const dailyVolume = generateDailyTransactionAnalytics(corporateTransactions);
    const operationalSpend = segmentOperationalSpend(corporateTransactions);
    const vendorMetrics = analyzeVendorEcosystem(corporateTransactions);
    const topVendors = vendorMetrics.slice(0, 5);
    
    // Risk
    const riskHeatmap = generateEnterpriseRiskHeatmap(complianceCases, corporateTransactions);
    const openComplianceCases = complianceCases.filter(c => c.status === 'open');
    const criticalRisks = riskHeatmap.filter(r => r.probability * r.impact > 0.15);

    // AI Integration
    useEffect(() => {
        const generateStrategicReport = async () => {
            setIsAiProcessing(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                
                let promptContext = '';
                if (activeTab === 'Overview') {
                    promptContext = `Executive Summary: Revenue $${totalRevenue}, Expenses $${totalExpenses}, Net Income $${netIncome}. Critical Risks: ${criticalRisks.length}. Top Vendor: ${topVendors[0]?.vendor}.`;
                } else if (activeTab === 'Finance') {
                    promptContext = `Financial Deep Dive: Current Ratio ${financialRatios[0].value.toFixed(2)}, Net Margin ${financialRatios[1].value.toFixed(2)}%. Cash Flow Trend: ${cashFlowForecast[0].netPosition > 0 ? 'Positive' : 'Negative'}. Tax Liability: $${taxLiabilities.reduce((s, t) => s + t.estimatedAmount, 0).toFixed(2)}.`;
                } else if (activeTab === 'Operations') {
                    promptContext = `Ops Report: Transaction Volume ${dailyVolume.length} days active. Top Spend Category: ${operationalSpend.sort((a,b) => b.value - a.value)[0]?.category}. Vendor Count: ${vendorMetrics.length}.`;
                } else if (activeTab === 'Risk') {
                    promptContext = `Risk Assessment: Open Cases ${openComplianceCases.length}. Highest Risk Category: ${riskHeatmap.sort((a,b) => b.probability - a.probability)[0]?.riskCategory}. Exposure: $${riskHeatmap.reduce((s,r) => s + r.exposureValue, 0)}.`;
                } else {
                    promptContext = `Strategic Outlook: Based on burn rate of $${financialRatios[2].value.toFixed(2)}/day and projected cash flow. Suggest 3 strategic moves for growth and stability.`;
                }

                const prompt = `You are an advanced Corporate AI Assistant. Analyze the following data context for the '${activeTab}' view and provide a high-level, professional, actionable strategic insight (max 2 sentences). Context: ${promptContext}`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                setAiInsight(response.text);
                setLastUpdated(new Date());
            } catch (error) {
                console.error("AI Processing Error:", error);
                setAiInsight("AI link unavailable. Using fallback data.");
            } finally {
                setIsAiProcessing(false);
            }
        };

        generateStrategicReport();
    }, [activeTab, totalRevenue, totalExpenses, netIncome]);

    // Visualization Utilities
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
    
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val);

    // Inline Sub-Components
    
    const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`px-6 py-3 text-sm font-bold tracking-wide transition-all duration-200 border-b-2 ${
                activeTab === id 
                ? 'border-blue-500 text-white bg-gray-800/50' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
        >
            {label}
        </button>
    );

    const MetricCard: React.FC<{ title: string, value: string, subtext?: string, trend?: number, color?: string }> = ({ title, value, subtext, trend, color = 'blue' }) => (
        <div className={`bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg relative overflow-hidden group hover:border-${color}-500 transition-colors`}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">{title}</h3>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            {subtext && <div className="text-gray-500 text-sm">{subtext}</div>}
            {trend !== undefined && (
                <div className={`text-sm font-medium mt-3 flex items-center ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% <span className="text-gray-600 ml-1">vs last period</span>
                </div>
            )}
        </div>
    );

    // Component Rendering

    return (
        <div className="min-h-screen bg-gray-900 text-white p-2 space-y-8 font-sans">
            
            {/* HEADER & NAVIGATION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        NEXUS COMMAND
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Enterprise Operating System v4.2.0 • {lastUpdated.toLocaleString()}</p>
                </div>
                <div className="flex space-x-1 mt-4 md:mt-0 bg-gray-900 rounded-lg p-1 border border-gray-800">
                    <TabButton id="Overview" label="EXECUTIVE" />
                    <TabButton id="Finance" label="FINANCE" />
                    <TabButton id="Operations" label="OPERATIONS" />
                    <TabButton id="Risk" label="RISK & COMPLIANCE" />
                    <TabButton id="Strategy" label="STRATEGY" />
                </div>
            </div>

            {/* AI INSIGHT BAR */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl rounded-lg" />
                <Card className="relative bg-gray-800/80 backdrop-blur border border-blue-500/30 p-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-500/10 rounded-full animate-pulse">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">AI Strategic Intelligence</h3>
                            {isAiProcessing ? (
                                <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse" />
                            ) : (
                                <p className="text-lg text-gray-100 leading-relaxed font-light">"{aiInsight}"</p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* DYNAMIC CONTENT AREA */}
            <div className="space-y-8 animate-fade-in">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'Overview' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Total Revenue (YTD)" value={formatCurrency(totalRevenue)} trend={12.5} color="green" />
                            <MetricCard title="Net Income" value={formatCurrency(netIncome)} trend={8.2} color="blue" />
                            <MetricCard title="Active Risks" value={criticalRisks.length.toString()} subtext="Critical Severity" trend={-5.0} color="red" />
                            <MetricCard title="Cash Runway" value="14.2 Months" subtext="Based on current burn" color="purple" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                            <Card title="Revenue vs Expenses Trend" className="lg:col-span-2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashFlowForecast}>
                                        <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                                        <Legend />
                                        <Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Operational Spend Mix" className="h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={operationalSpend} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                            {operationalSpend.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    </>
                )}

                {/* FINANCE TAB */}
                {activeTab === 'Finance' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {financialRatios.map((ratio, idx) => (
                                <MetricCard 
                                    key={idx} 
                                    title={ratio.name} 
                                    value={typeof ratio.value === 'number' && ratio.value < 100 ? ratio.value.toFixed(2) : formatNumber(ratio.value)} 
                                    subtext={`Benchmark: ${ratio.benchmark}`}
                                    trend={ratio.delta}
                                    color={ratio.status === 'Healthy' ? 'green' : ratio.status === 'Warning' ? 'yellow' : 'red'}
                                />
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Projected Cash Position (6 Months)" className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashFlowForecast}>
                                        <XAxis dataKey="period" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" tickFormatter={(val) => `$${val/1000}k`} />
                                        <Tooltip cursor={{fill: '#374151'}} contentStyle={{ backgroundColor: '#1f2937' }} />
                                        <Bar dataKey="cumulativeCash" fill="#3b82f6" name="Cash Balance" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Estimated Tax Liability Breakdown" className="h-80 overflow-auto">
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="bg-gray-800 text-gray-200 uppercase font-bold">
                                        <tr>
                                            <th className="p-3">Jurisdiction</th>
                                            <th className="p-3">Type</th>
                                            <th className="p-3 text-right">Amount</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {taxLiabilities.map((tax, i) => (
                                            <tr key={i} className="hover:bg-gray-800/50">
                                                <td className="p-3">{tax.jurisdiction}</td>
                                                <td className="p-3">{tax.taxType}</td>
                                                <td className="p-3 text-right font-mono text-white">{formatCurrency(tax.estimatedAmount)}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${tax.status === 'Paid' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                                        {tax.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        </div>
                    </>
                )}

                {/* OPERATIONS TAB */}
                {activeTab === 'Operations' && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card title="Daily Transaction Volume" className="lg:col-span-2 h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyVolume}>
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickFormatter={(d) => d.substring(5)} />
                                        <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} />
                                        <Bar yAxisId="left" dataKey="value" fill="#3b82f6" name="Volume ($)" opacity={0.8} />
                                        <Bar yAxisId="right" dataKey="secondaryValue" fill="#10b981" name="Count" barSize={10} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Top Vendor Ecosystem" className="h-96 overflow-auto">
                                <div className="space-y-4">
                                    {topVendors.map((vendor, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
                                            <div>
                                                <div className="font-bold text-white">{vendor.vendor}</div>
                                                <div className="text-xs text-gray-500">{vendor.transactionCount} txns • Risk: {vendor.riskScore}/100</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-blue-400">{formatCurrency(vendor.totalSpend)}</div>
                                                <div className="text-xs text-gray-500">Avg: {formatCurrency(vendor.avgTransactionValue)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </>
                )}

                {/* RISK TAB */}
                {activeTab === 'Risk' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Compliance Score" value="94.2" subtext="Top 5% Industry" color="green" />
                            <MetricCard title="Open Cases" value={openComplianceCases.length.toString()} subtext="Requires Attention" color="yellow" />
                            <MetricCard title="Total Risk Exposure" value={formatCurrency(riskHeatmap.reduce((a,b)=>a+b.exposureValue,0))} color="red" />
                            <MetricCard title="Audit Anomalies" value="3" subtext="Last 24 Hours" color="purple" />
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Enterprise Risk Heatmap" className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={riskHeatmap} layout="vertical" margin={{ left: 40 }}>
                                        <XAxis type="number" domain={[0, 1]} hide />
                                        <YAxis type="category" dataKey="riskCategory" stroke="#9ca3af" width={120} fontSize={11} />
                                        <Tooltip cursor={{fill: 'transparent'}} content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-xl">
                                                        <p className="font-bold text-white">{data.riskCategory}</p>
                                                        <p className="text-sm text-gray-400">Prob: {(data.probability * 100).toFixed(0)}% | Impact: {(data.impact * 100).toFixed(0)}%</p>
                                                        <p className="text-sm text-red-400">Exposure: {formatCurrency(data.exposureValue)}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                        <Bar dataKey="probability" name="Probability" stackId="a" fill="#f59e0b" barSize={20} />
                                        <Bar dataKey="impact" name="Impact" stackId="a" fill="#ef4444" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Compliance Case Log" className="h-96 overflow-auto">
                                <div className="space-y-2">
                                    {complianceCases.map((c, i) => (
                                        <div key={i} className="p-3 border-l-4 border-red-500 bg-gray-800/50 rounded flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-sm text-white">{c.type} Violation</div>
                                                <div className="text-xs text-gray-500">{c.description}</div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded font-bold ${c.status === 'open' ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-300'}`}>
                                                {c.status.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                    {complianceCases.length === 0 && <div className="text-center text-gray-500 py-10">No active compliance cases detected. Systems nominal.</div>}
                                </div>
                            </Card>
                        </div>
                    </>
                )}

                {/* STRATEGY TAB */}
                {activeTab === 'Strategy' && (
                    <div className="grid grid-cols-1 gap-6">
                        <Card title="Strategic Growth Modeling" className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-2xl font-bold text-white">Scenario Analysis: Aggressive Expansion</h3>
                                    <p className="text-gray-400">
                                        Based on current liquidity of {formatCurrency(financialRatios[0].value * 1000000)} and a burn rate of {formatCurrency(financialRatios[2].value)}, 
                                        the enterprise can sustain a 15% increase in R&D spend for 8 months before requiring additional capital injection.
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-300">
                                            <span>Market Penetration Probability</span>
                                            <span>78%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-300">
                                            <span>Regulatory Approval Confidence</span>
                                            <span>92%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/3 bg-gray-800 p-6 rounded-xl border border-gray-700">
                                    <h4 className="font-bold text-white mb-4">AI Recommendation Engine</h4>
                                    <ul className="space-y-4">
                                        <li className="flex items-start space-x-3">
                                            <span className="text-green-400 text-xl">✓</span>
                                            <span className="text-sm text-gray-300">Optimize vendor contracts to reduce variable OPEX by 12%.</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="text-green-400 text-xl">✓</span>
                                            <span className="text-sm text-gray-300">Accelerate receivables collection to improve DSO by 5 days.</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="text-yellow-400 text-xl">⚠</span>
                                            <span className="text-sm text-gray-300">Monitor geopolitical risk in supply chain region APAC-1.</span>
                                        </li>
                                    </ul>
                                    <button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors" onClick={() => setActiveView && setActiveView(View.Budgets)}>
                                        Adjust Budgets
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CorporateCommandView;


// --- CONSOLIDATED FROM: CorporateCommandView (1).tsx ---

import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, PaymentOrder, Invoice, ComplianceCase, CorporateTransaction } from '../types';
import { GoogleGenAI } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

// Analytics Data Structures

export type TimeSeriesData = {
    date: string;
    value: number;
    secondaryValue?: number;
    tertiaryValue?: number;
};

export type CategoricalData = {
    category: string;
    value: number;
    percentage?: number;
    color?: string;
};

export type FinancialRatio = {
    name: string;
    value: number;
    benchmark: number;
    status: 'Healthy' | 'Warning' | 'Critical';
    delta: number;
};

export type VendorPerformanceMetric = {
    vendor: string;
    totalSpend: number;
    transactionCount: number;
    avgTransactionValue: number;
    riskScore: number;
    lastInteraction: string;
};

export type DepartmentalKPI = {
    department: string;
    budgetUtilization: number;
    operationalEfficiency: number;
    complianceScore: number;
    headcountSpend: number;
};

export type RiskAssessmentData = {
    riskCategory: string;
    probability: number;
    impact: number;
    mitigationStatus: string;
    exposureValue: number;
};

export type CashFlowProjection = {
    period: string;
    inflow: number;
    outflow: number;
    netPosition: number;
    cumulativeCash: number;
};

export type AuditLogEntry = {
    timestamp: string;
    user: string;
    action: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    details: string;
};

export type TaxLiabilityBreakdown = {
    jurisdiction: string;
    taxType: string;
    estimatedAmount: number;
    dueDate: string;
    status: 'Accrued' | 'Paid' | 'Pending';
};

// Data Processing Functions

/**
 * Generates daily transaction volume and amount analytics.
 */
export const generateDailyTransactionAnalytics = (transactions: CorporateTransaction[]): TimeSeriesData[] => {
    const dailyMap: Record<string, { count: number; amount: number }> = {};
    transactions.forEach(tx => {
        const date = new Date(tx.date).toISOString().split('T')[0];
        if (!dailyMap[date]) dailyMap[date] = { count: 0, amount: 0 };
        dailyMap[date].count++;
        dailyMap[date].amount += tx.amount;
    });
    return Object.entries(dailyMap)
        .map(([date, data]) => ({ date, value: data.amount, secondaryValue: data.count }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

/**
 * Calculates key financial ratios.
 */
export const calculateEnterpriseFinancialRatios = (invoices: Invoice[], orders: PaymentOrder[], transactions: CorporateTransaction[]): FinancialRatio[] => {
    const currentAssets = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);
    const currentLiabilities = orders.filter(o => o.status !== 'paid').reduce((sum, o) => sum + o.amount, 0);
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const netProfitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
    const burnRate = totalExpenses / 30; // Simplified 30-day period for calculation
    
    return [
        { name: 'Current Ratio', value: currentRatio, benchmark: 1.5, status: currentRatio > 1.5 ? 'Healthy' : currentRatio > 1.0 ? 'Warning' : 'Critical', delta: 0.1 },
        { name: 'Net Profit Margin', value: netProfitMargin, benchmark: 20, status: netProfitMargin > 20 ? 'Healthy' : netProfitMargin > 10 ? 'Warning' : 'Critical', delta: -2.5 },
        { name: 'Daily Burn Rate', value: burnRate, benchmark: 5000, status: burnRate < 5000 ? 'Healthy' : 'Warning', delta: 12.4 }
    ];
};

/**
 * Projects cash flow for the next 6 periods.
 */
export const generateCashFlowProjections = (invoices: Invoice[], orders: PaymentOrder[]): CashFlowProjection[] => {
    const projections: CashFlowProjection[] = [];
    const today = new Date();
    let currentCash = 1000000; // Initial capital assumption

    for (let i = 0; i < 6; i++) {
        const futureDate = new Date(today);
        futureDate.setMonth(today.getMonth() + i);
        const periodKey = futureDate.toISOString().substring(0, 7);
        
        // Estimated inflows from receivables
        const projectedInflow = invoices
            .filter(inv => new Date(inv.dueDate).getMonth() === futureDate.getMonth())
            .reduce((sum, inv) => sum + inv.amount, 0) * 0.95; // Assumed 95% collection rate

        // Estimated outflows from payables and recurring expenses
        const projectedOutflow = orders
            .filter(ord => new Date(ord.dueDate || '').getMonth() === futureDate.getMonth())
            .reduce((sum, ord) => sum + ord.amount, 0) * 1.1; // Assumed 10% buffer for variable costs

        const net = projectedInflow - projectedOutflow;
        currentCash += net;

        projections.push({
            period: periodKey,
            inflow: projectedInflow,
            outflow: projectedOutflow,
            netPosition: net,
            cumulativeCash: currentCash
        });
    }
    return projections;
};

/**
 * Analyzes vendor performance and spend.
 */
export const analyzeVendorEcosystem = (transactions: CorporateTransaction[]): VendorPerformanceMetric[] => {
    const vendorMap: Record<string, VendorPerformanceMetric> = {};
    
    transactions.forEach(tx => {
        if (!vendorMap[tx.merchant]) {
            vendorMap[tx.merchant] = {
                vendor: tx.merchant,
                totalSpend: 0,
                transactionCount: 0,
                avgTransactionValue: 0,
                riskScore: Math.floor(Math.random() * 100), // Simulated risk score
                lastInteraction: tx.date
            };
        }
        const v = vendorMap[tx.merchant];
        v.totalSpend += tx.amount;
        v.transactionCount++;
        v.avgTransactionValue = v.totalSpend / v.transactionCount;
        if (new Date(tx.date) > new Date(v.lastInteraction)) {
            v.lastInteraction = tx.date;
        }
    });

    return Object.values(vendorMap).sort((a, b) => b.totalSpend - a.totalSpend);
};

/**
 * Segments operational spend into categories.
 */
export const segmentOperationalSpend = (transactions: CorporateTransaction[]): CategoricalData[] => {
    const categories = {
        'Fixed Infrastructure': 0,
        'Variable COGS': 0,
        'R&D Investment': 0,
        'Sales & Marketing': 0,
        'G&A': 0
    };

    transactions.forEach(tx => {
        if (tx.merchant.includes('Rent') || tx.merchant.includes('AWS') || tx.merchant.includes('Server')) categories['Fixed Infrastructure'] += tx.amount;
        else if (tx.merchant.includes('Supplier') || tx.merchant.includes('Logistics')) categories['Variable COGS'] += tx.amount;
        else if (tx.description.includes('Research') || tx.description.includes('Lab')) categories['R&D Investment'] += tx.amount;
        else if (tx.merchant.includes('Ads') || tx.merchant.includes('Google') || tx.merchant.includes('Facebook')) categories['Sales & Marketing'] += tx.amount;
        else categories['G&A'] += tx.amount;
    });

    return Object.entries(categories).map(([category, value]) => ({ category, value }));
};

/**
 * Estimates tax liabilities.
 */
export const estimateTaxLiabilities = (revenue: number, expenses: number): TaxLiabilityBreakdown[] => {
    const profit = Math.max(0, revenue - expenses);
    return [
        { jurisdiction: 'Federal', taxType: 'Corporate Income Tax', estimatedAmount: profit * 0.21, dueDate: '2024-04-15', status: 'Accrued' },
        { jurisdiction: 'State (CA)', taxType: 'Franchise Tax', estimatedAmount: profit * 0.0884, dueDate: '2024-04-15', status: 'Accrued' },
        { jurisdiction: 'International', taxType: 'VAT/GST', estimatedAmount: revenue * 0.05, dueDate: 'Monthly', status: 'Pending' },
        { jurisdiction: 'Local', taxType: 'Payroll Tax', estimatedAmount: expenses * 0.0765, dueDate: 'Bi-Weekly', status: 'Paid' }
    ];
};

/**
 * Generates risk assessment data.
 */
export const generateEnterpriseRiskHeatmap = (cases: ComplianceCase[], transactions: CorporateTransaction[]): RiskAssessmentData[] => {
    const risks: RiskAssessmentData[] = [
        { riskCategory: 'AML/KYC', probability: 0.15, impact: 0.9, mitigationStatus: 'Monitoring', exposureValue: 500000 },
        { riskCategory: 'Data Privacy (GDPR)', probability: 0.05, impact: 0.95, mitigationStatus: 'Controlled', exposureValue: 2000000 },
        { riskCategory: 'Vendor Fraud', probability: 0.2, impact: 0.4, mitigationStatus: 'Active Investigation', exposureValue: 150000 },
        { riskCategory: 'Tax Compliance', probability: 0.1, impact: 0.7, mitigationStatus: 'Audited', exposureValue: 750000 },
        { riskCategory: 'Cybersecurity', probability: 0.3, impact: 0.99, mitigationStatus: 'Hardened', exposureValue: 5000000 }
    ];

    // Adjusts risk based on data
    if (cases.some(c => c.type === 'AML')) risks[0].probability += 0.2;
    if (transactions.some(t => t.amount > 50000)) risks[2].probability += 0.1;

    return risks;
};

// Main Component

interface CorporateCommandViewProps {
    setActiveView?: (view: View) => void;
}

const CorporateCommandView: React.FC<CorporateCommandViewProps> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    
    // State Management
    const [activeTab, setActiveTab] = useState<'Overview' | 'Finance' | 'Operations' | 'Risk' | 'Strategy'>('Overview');
    const [aiInsight, setAiInsight] = useState<string>('Initializing AI...');
    const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    if (!context) throw new Error("CorporateCommandView requires DataContext.");
    const { paymentOrders, invoices, complianceCases, corporateTransactions } = context;

    // Data Aggregation
    
    // Financials
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
    const totalExpenses = corporateTransactions.reduce((acc, t) => acc + t.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    const financialRatios = calculateEnterpriseFinancialRatios(invoices, paymentOrders, corporateTransactions);
    const cashFlowForecast = generateCashFlowProjections(invoices, paymentOrders);
    const taxLiabilities = estimateTaxLiabilities(totalRevenue, totalExpenses);

    // Operations
    const dailyVolume = generateDailyTransactionAnalytics(corporateTransactions);
    const operationalSpend = segmentOperationalSpend(corporateTransactions);
    const vendorMetrics = analyzeVendorEcosystem(corporateTransactions);
    const topVendors = vendorMetrics.slice(0, 5);
    
    // Risk
    const riskHeatmap = generateEnterpriseRiskHeatmap(complianceCases, corporateTransactions);
    const openComplianceCases = complianceCases.filter(c => c.status === 'open');
    const criticalRisks = riskHeatmap.filter(r => r.probability * r.impact > 0.15);

    // AI Integration
    useEffect(() => {
        const generateStrategicReport = async () => {
            setIsAiProcessing(true);
            try {
                // NOTE: In a real application, the API key would be securely managed, not hardcoded or exposed client-side.
                // Since the instruction implies using an API that doesn't need a key, we simulate the call structure.
                // For this mock, we will skip the actual API call and use a placeholder response based on the tab.
                
                let mockInsight = 'AI analysis is currently unavailable due to API key requirement.';
                
                if (activeTab === 'Overview') {
                    mockInsight = `Executive Summary: Revenue ${formatCurrency(totalRevenue)}, Expenses ${formatCurrency(totalExpenses)}. Critical Risks: ${criticalRisks.length}. Top Vendor: ${topVendors[0]?.vendor || 'N/A'}.`;
                } else if (activeTab === 'Finance') {
                    mockInsight = `Financial Deep Dive: Current Ratio ${financialRatios[0].value.toFixed(2)}, Net Margin ${financialRatios[1].value.toFixed(2)}%. Cash Flow Trend: ${cashFlowForecast[0].netPosition > 0 ? 'Positive' : 'Negative'}.`;
                } else if (activeTab === 'Operations') {
                    mockInsight = `Ops Report: Transaction Volume ${dailyVolume.length} days active. Top Spend Category: ${operationalSpend.sort((a,b) => b.value - a.value)[0]?.category || 'N/A'}.`;
                } else if (activeTab === 'Risk') {
                    mockInsight = `Risk Assessment: Open Cases ${openComplianceCases.length}. Highest Risk Category: ${riskHeatmap.sort((a,b) => b.probability - a.probability)[0]?.riskCategory || 'N/A'}.`;
                } else {
                    mockInsight = `Strategic Outlook: Based on current metrics, focus on optimizing vendor spend and strengthening compliance documentation.`;
                }

                setAiInsight(mockInsight);
                setLastUpdated(new Date());
            } catch (error) {
                console.error("AI Processing Error:", error);
                setAiInsight("AI link unavailable. Using fallback data.");
            } finally {
                setIsAiProcessing(false);
            }
        };

        generateStrategicReport();
    }, [activeTab, totalRevenue, totalExpenses, netIncome]);

    // Visualization Utilities
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
    
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val);

    // Inline Sub-Components
    
    const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`px-6 py-3 text-sm font-bold tracking-wide transition-all duration-200 border-b-2 ${
                activeTab === id 
                ? 'border-blue-500 text-white bg-gray-800/50' 
                : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30'
            }`}
        >
            {label}
        </button>
    );

    const MetricCard: React.FC<{ title: string, value: string, subtext?: string, trend?: number, color?: string }> = ({ title, value, subtext, trend, color = 'blue' }) => (
        <div className={`bg-gray-800 border border-gray-700 p-6 rounded-xl shadow-lg relative overflow-hidden group hover:border-${color}-500 transition-colors`}>
            <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">{title}</h3>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            {subtext && <div className="text-gray-500 text-sm">{subtext}</div>}
            {trend !== undefined && (
                <div className={`text-sm font-medium mt-3 flex items-center ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trend >= 0 ? 'â†‘' : 'â†“'} {Math.abs(trend)}% <span className="text-gray-600 ml-1">vs last period</span>
                </div>
            )}
        </div>
    );

    // Component Rendering

    return (
        <div className="min-h-screen bg-gray-900 text-white p-2 space-y-8 font-sans">
            
            {/* HEADER & NAVIGATION */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        NEXUS COMMAND
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Enterprise Operating System v4.2.0 â€¢ {lastUpdated.toLocaleString()}</p>
                </div>
                <div className="flex space-x-1 mt-4 md:mt-0 bg-gray-900 rounded-lg p-1 border border-gray-800">
                    <TabButton id="Overview" label="EXECUTIVE" />
                    <TabButton id="Finance" label="FINANCE" />
                    <TabButton id="Operations" label="OPERATIONS" />
                    <TabButton id="Risk" label="RISK & COMPLIANCE" />
                    <TabButton id="Strategy" label="STRATEGY" />
                </div>
            </div>

            {/* AI INSIGHT BAR */}
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-xl rounded-lg" />
                <Card className="relative bg-gray-800/80 backdrop-blur border border-blue-500/30 p-6">
                    <div className="flex items-start space-x-4">
                        <div className="p-3 bg-blue-500/10 rounded-full animate-pulse">
                            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">AI Strategic Intelligence</h3>
                            {isAiProcessing ? (
                                <div className="h-6 bg-gray-700 rounded w-3/4 animate-pulse" />
                            ) : (
                                <p className="text-lg text-gray-100 leading-relaxed font-light">"{aiInsight}"</p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* DYNAMIC CONTENT AREA */}
            <div className="space-y-8 animate-fade-in">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'Overview' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Total Revenue (YTD)" value={formatCurrency(totalRevenue)} trend={12.5} color="green" />
                            <MetricCard title="Net Income" value={formatCurrency(netIncome)} trend={8.2} color="blue" />
                            <MetricCard title="Active Risks" value={criticalRisks.length.toString()} subtext="Critical Severity" trend={-5.0} color="red" />
                            <MetricCard title="Cash Runway" value="14.2 Months" subtext="Based on current burn" color="purple" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
                            <Card title="Revenue vs Expenses Trend" className="lg:col-span-2 h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashFlowForecast}>
                                        <XAxis dataKey="period" stroke="#6b7280" fontSize={12} />
                                        <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }} />
                                        <Legend />
                                        <Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Operational Spend Mix" className="h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={operationalSpend} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                                            {operationalSpend.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </Card>
                        </div>
                    </>
                )}

                {/* FINANCE TAB */}
                {activeTab === 'Finance' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {financialRatios.map((ratio, idx) => (
                                <MetricCard 
                                    key={idx} 
                                    title={ratio.name} 
                                    value={typeof ratio.value === 'number' && ratio.value < 100 ? ratio.value.toFixed(2) : formatNumber(ratio.value)} 
                                    subtext={`Benchmark: ${ratio.benchmark}`}
                                    trend={ratio.delta}
                                    color={ratio.status === 'Healthy' ? 'green' : ratio.status === 'Warning' ? 'yellow' : 'red'}
                                />
                            ))}
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Projected Cash Position (6 Months)" className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={cashFlowForecast}>
                                        <XAxis dataKey="period" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" tickFormatter={(val) => `$${val/1000}k`} />
                                        <Tooltip cursor={{fill: '#374151'}} contentStyle={{ backgroundColor: '#1f2937' }} />
                                        <Bar dataKey="cumulativeCash" fill="#3b82f6" name="Cash Balance" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Estimated Tax Liability Breakdown" className="h-80 overflow-auto">
                                <table className="w-full text-left text-sm text-gray-400">
                                    <thead className="bg-gray-800 text-gray-200 uppercase font-bold">
                                        <tr>
                                            <th className="p-3">Jurisdiction</th>
                                            <th className="p-3">Type</th>
                                            <th className="p-3 text-right">Amount</th>
                                            <th className="p-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {taxLiabilities.map((tax, i) => (
                                            <tr key={i} className="hover:bg-gray-800/50">
                                                <td className="p-3">{tax.jurisdiction}</td>
                                                <td className="p-3">{tax.taxType}</td>
                                                <td className="p-3 text-right font-mono text-white">{formatCurrency(tax.estimatedAmount)}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${tax.status === 'Paid' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                                                        {tax.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        </div>
                    </>
                )}

                {/* OPERATIONS TAB */}
                {activeTab === 'Operations' && (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card title="Daily Transaction Volume" className="lg:col-span-2 h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyVolume}>
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickFormatter={(d) => d.substring(5)} />
                                        <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} />
                                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1f2937' }} />
                                        <Bar yAxisId="left" dataKey="value" fill="#3b82f6" name="Volume ($)" opacity={0.8} />
                                        <Bar yAxisId="right" dataKey="secondaryValue" fill="#10b981" name="Count" barSize={10} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Top Vendor Ecosystem" className="h-96 overflow-auto">
                                <div className="space-y-4">
                                    {topVendors.map((vendor, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
                                            <div>
                                                <div className="font-bold text-white">{vendor.vendor}</div>
                                                <div className="text-xs text-gray-500">{vendor.transactionCount} txns â€¢ Risk: {vendor.riskScore}/100</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-blue-400">{formatCurrency(vendor.totalSpend)}</div>
                                                <div className="text-xs text-gray-500">Avg: {formatCurrency(vendor.avgTransactionValue)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </>
                )}

                {/* RISK TAB */}
                {activeTab === 'Risk' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <MetricCard title="Compliance Score" value="94.2" subtext="Top 5% Industry" color="green" />
                            <MetricCard title="Open Cases" value={openComplianceCases.length.toString()} subtext="Requires Attention" color="yellow" />
                            <MetricCard title="Total Risk Exposure" value={formatCurrency(riskHeatmap.reduce((a,b)=>a+b.exposureValue,0))} color="red" />
                            <MetricCard title="Audit Anomalies" value="3" subtext="Last 24 Hours" color="purple" />
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card title="Enterprise Risk Heatmap" className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={riskHeatmap} layout="vertical" margin={{ left: 40 }}>
                                        <XAxis type="number" domain={[0, 1]} hide />
                                        <YAxis type="category" dataKey="riskCategory" stroke="#9ca3af" width={120} fontSize={11} />
                                        <Tooltip cursor={{fill: 'transparent'}} content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-gray-900 border border-gray-700 p-3 rounded shadow-xl">
                                                        <p className="font-bold text-white">{data.riskCategory}</p>
                                                        <p className="text-sm text-gray-400">Prob: {(data.probability * 100).toFixed(0)}% | Impact: {(data.impact * 100).toFixed(0)}%</p>
                                                        <p className="text-sm text-red-400">Exposure: {formatCurrency(data.exposureValue)}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                        <Bar dataKey="probability" name="Probability" stackId="a" fill="#f59e0b" barSize={20} />
                                        <Bar dataKey="impact" name="Impact" stackId="a" fill="#ef4444" barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                            <Card title="Compliance Case Log" className="h-96 overflow-auto">
                                <div className="space-y-2">
                                    {complianceCases.map((c, i) => (
                                        <div key={i} className="p-3 border-l-4 border-red-500 bg-gray-800/50 rounded flex justify-between items-center">
                                            <div>
                                                <div className="font-bold text-sm text-white">{c.type} Violation</div>
                                                <div className="text-xs text-gray-500">{c.description}</div>
                                            </div>
                                            <span className={`px-2 py-1 text-xs rounded font-bold ${c.status === 'open' ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-300'}`}>
                                                {c.status.toUpperCase()}
                                            </span>
                                        </div>
                                    ))}
                                    {complianceCases.length === 0 && <div className="text-center text-gray-500 py-10">No active compliance cases detected. Systems nominal.</div>}
                                </div>
                            </Card>
                        </div>
                    </>
                )}

                {/* STRATEGY TAB */}
                {activeTab === 'Strategy' && (
                    <div className="grid grid-cols-1 gap-6">
                        <Card title="Strategic Growth Modeling" className="p-8 bg-gradient-to-br from-gray-800 to-gray-900">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1 space-y-6">
                                    <h3 className="text-2xl font-bold text-white">Scenario Analysis: Aggressive Expansion</h3>
                                    <p className="text-gray-400">
                                        Based on current liquidity of {formatCurrency(financialRatios[0].value * 1000000)} and a burn rate of {formatCurrency(financialRatios[2].value)}, 
                                        the enterprise can sustain a 15% increase in R&D spend for 8 months before requiring additional capital injection.
                                    </p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-300">
                                            <span>Market Penetration Probability</span>
                                            <span>78%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm text-gray-300">
                                            <span>Regulatory Approval Confidence</span>
                                            <span>92%</span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-2">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-1/3 bg-gray-800 p-6 rounded-xl border border-gray-700">
                                    <h4 className="font-bold text-white mb-4">AI Recommendation Engine</h4>
                                    <ul className="space-y-4">
                                        <li className="flex items-start space-x-3">
                                            <span className="text-green-400 text-xl">âœ“</span>
                                            <span className="text-sm text-gray-300">Optimize vendor contracts to reduce variable OPEX by 12%.</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="text-green-400 text-xl">âœ“</span>
                                            <span className="text-sm text-gray-300">Accelerate receivables collection to improve DSO by 5 days.</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="text-yellow-400 text-xl">âš </span>
                                            <span className="text-sm text-gray-300">Monitor geopolitical risk in supply chain region APAC-1.</span>
                                        </li>
                                    </ul>
                                    <button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors" onClick={() => setActiveView && setActiveView(View.Budgets)}>
                                        Adjust Budgets
                                    </button>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CorporateCommandView;

// --- CONSOLIDATED FROM: CorporateCommandView (5).tsx ---

import React, { useContext, useState, useEffect, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, PaymentOrder, Invoice, ComplianceCase, CorporateTransaction } from '../types';
import { GoogleGenAI } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';

// --- EXPANDED DATA STRUCTURES FOR HYPER-DIMENSIONAL ANALYSIS ---

export type TimeSeriesData = { date: string; value: number; secondaryValue?: number; tertiaryValue?: number; };
export type CategoricalData = { category: string; value: number; percentage?: number; color?: string; };
export type FinancialRatio = { name: string; value: number; benchmark: number; status: 'Optimal' | 'Stable' | 'Warning' | 'Critical'; delta: number; };
export type VendorPerformanceMetric = { vendor: string; totalSpend: number; transactionCount: number; avgTransactionValue: number; riskScore: number; lastInteraction: string; };
export type DepartmentalKPI = { department: string; budgetUtilization: number; operationalEfficiency: number; complianceScore: number; headcountSpend: number; };
export type RiskAssessmentData = { riskCategory: string; probability: number; impact: number; velocity: number; mitigationStatus: string; exposureValue: number; };
export type CashFlowProjection = { period: string; inflow: number; outflow: number; netPosition: number; cumulativeCash: number; };
export type AuditLogEntry = { timestamp: string; user: string; action: string; severity: 'Low' | 'Medium' | 'High' | 'Critical'; details: string; };
export type TaxLiabilityBreakdown = { jurisdiction: string; taxType: string; estimatedAmount: number; dueDate: string; status: 'Accrued' | 'Paid' | 'Pending'; };

// High-Frequency Trading & Market Intelligence Structures
export type MarketDataTick = { symbol: string; price: number; change: number; volume: number; timestamp: number; };
export type TradingAlgorithm = { id: string; name: string; strategy: 'Momentum' | 'Arbitrage' | 'Mean Reversion'; status: 'Active' | 'Paused' | 'Terminated'; pnl: number; trades: number; uptime: string; };
export type PortfolioMetrics = { totalValue: number; dailyPnl: number; valueAtRisk: number; sharpeRatio: number; alpha: number; };
export type GlobalMacroIndicator = { name: string; value: number; trend: 'Up' | 'Down' | 'Stable'; impact: 'High' | 'Medium' | 'Low'; region: string; };
export type StrategicInitiative = { id: string; name: string; description: string; budget: number; projectedROI: number; status: 'Planning' | 'Active' | 'Completed'; };

// --- EXPANDED DATA PROCESSING & SIMULATION FUNCTIONS ---

export const generateDailyTransactionAnalytics = (transactions: CorporateTransaction[]): TimeSeriesData[] => {
    const dailyMap: Record<string, { count: number; amount: number }> = {};
    transactions.forEach(tx => {
        const date = new Date(tx.date).toISOString().split('T')[0];
        if (!dailyMap[date]) dailyMap[date] = { count: 0, amount: 0 };
        dailyMap[date].count++;
        dailyMap[date].amount += tx.amount;
    });
    return Object.entries(dailyMap).map(([date, data]) => ({ date, value: data.amount, secondaryValue: data.count })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const calculateEnterpriseFinancialRatios = (invoices: Invoice[], orders: PaymentOrder[], transactions: CorporateTransaction[]): FinancialRatio[] => {
    const currentAssets = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);
    const currentLiabilities = orders.filter(o => o.status !== 'paid').reduce((sum, o) => sum + o.amount, 0);
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const netProfitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
    const burnRate = totalExpenses / 30;
    return [
        { name: 'Current Ratio', value: currentRatio, benchmark: 2.0, status: currentRatio > 2.0 ? 'Optimal' : currentRatio > 1.2 ? 'Stable' : 'Warning', delta: 0.1 },
        { name: 'Net Profit Margin', value: netProfitMargin, benchmark: 20, status: netProfitMargin > 20 ? 'Optimal' : netProfitMargin > 10 ? 'Stable' : 'Warning', delta: -2.5 },
        { name: 'Daily Burn Rate', value: burnRate, benchmark: 5000, status: burnRate < 5000 ? 'Optimal' : 'Warning', delta: 12.4 }
    ];
};

export const generateCashFlowProjections = (invoices: Invoice[], orders: PaymentOrder[]): CashFlowProjection[] => {
    const projections: CashFlowProjection[] = [];
    let currentCash = 1000000;
    for (let i = 0; i < 12; i++) { // Extended to 12 months
        const futureDate = new Date(); futureDate.setMonth(futureDate.getMonth() + i);
        const periodKey = futureDate.toISOString().substring(0, 7);
        const projectedInflow = invoices.filter(inv => new Date(inv.dueDate).getMonth() === futureDate.getMonth()).reduce((sum, inv) => sum + inv.amount, 0) * 0.95;
        const projectedOutflow = orders.filter(ord => new Date(ord.dueDate || '').getMonth() === futureDate.getMonth()).reduce((sum, ord) => sum + ord.amount, 0) * 1.1;
        const net = projectedInflow - projectedOutflow;
        currentCash += net;
        projections.push({ period: periodKey, inflow: projectedInflow, outflow: projectedOutflow, netPosition: net, cumulativeCash: currentCash });
    }
    return projections;
};

export const analyzeVendorEcosystem = (transactions: CorporateTransaction[]): VendorPerformanceMetric[] => {
    const vendorMap: Record<string, VendorPerformanceMetric> = {};
    transactions.forEach(tx => {
        if (!vendorMap[tx.merchant]) vendorMap[tx.merchant] = { vendor: tx.merchant, totalSpend: 0, transactionCount: 0, avgTransactionValue: 0, riskScore: Math.floor(Math.random() * 100), lastInteraction: tx.date };
        const v = vendorMap[tx.merchant];
        v.totalSpend += tx.amount; v.transactionCount++; v.avgTransactionValue = v.totalSpend / v.transactionCount;
        if (new Date(tx.date) > new Date(v.lastInteraction)) v.lastInteraction = tx.date;
    });
    return Object.values(vendorMap).sort((a, b) => b.totalSpend - a.totalSpend);
};

export const segmentOperationalSpend = (transactions: CorporateTransaction[]): CategoricalData[] => {
    const categories = { 'Infrastructure': 0, 'COGS': 0, 'R&D': 0, 'S&M': 0, 'G&A': 0, 'Quantum Computing': 0 };
    transactions.forEach(tx => {
        if (tx.merchant.includes('AWS') || tx.merchant.includes('Server')) categories['Infrastructure'] += tx.amount;
        else if (tx.merchant.includes('Supplier')) categories['COGS'] += tx.amount;
        else if (tx.description.includes('Research')) categories['R&D'] += tx.amount;
        else if (tx.merchant.includes('Ads')) categories['S&M'] += tx.amount;
        else if (tx.description.includes('Quantum')) categories['Quantum Computing'] += tx.amount;
        else categories['G&A'] += tx.amount;
    });
    return Object.entries(categories).map(([category, value]) => ({ category, value }));
};

export const generateEnterpriseRiskHeatmap = (cases: ComplianceCase[], transactions: CorporateTransaction[]): RiskAssessmentData[] => {
    const risks: RiskAssessmentData[] = [
        { riskCategory: 'AML/KYC', probability: 0.15, impact: 0.9, velocity: 0.8, mitigationStatus: 'Monitoring', exposureValue: 500000 },
        { riskCategory: 'Cybersecurity', probability: 0.3, impact: 0.99, velocity: 0.9, mitigationStatus: 'Hardened', exposureValue: 5000000 },
        { riskCategory: 'Geopolitical', probability: 0.4, impact: 0.7, velocity: 0.5, mitigationStatus: 'Contingency Plan', exposureValue: 1200000 },
        { riskCategory: 'Market Volatility', probability: 0.6, impact: 0.5, velocity: 0.95, mitigationStatus: 'Hedged', exposureValue: 2500000 },
        { riskCategory: 'AI Model Drift', probability: 0.25, impact: 0.8, velocity: 0.6, mitigationStatus: 'Continuous Training', exposureValue: 900000 },
    ];
    if (cases.some(c => c.type === 'AML')) risks[0].probability += 0.2;
    if (transactions.some(t => t.amount > 50000)) risks[1].probability += 0.1;
    return risks;
};

// --- MAIN COMPONENT: NEXUS COMMAND ---

interface CorporateDashboardProps { setActiveView: (view: View) => void; }

const CorporateCommandView: React.FC<CorporateDashboardProps> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    if (!context) throw new Error("CorporateCommandView requires DataContext.");
    const { paymentOrders, invoices, complianceCases, corporateTransactions } = context;

    // State Management
    const [activeTab, setActiveTab] = useState<'Overview' | 'Finance' | 'Operations' | 'Risk' | 'Strategy' | 'Markets'>('Overview');
    const [aiInsight, setAiInsight] = useState<string>('Initializing AI...');
    const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [marketData, setMarketData] = useState<MarketDataTick[]>([]);
    const [tradingAlgos, setTradingAlgos] = useState<TradingAlgorithm[]>([
        { id: 'algo-001', name: 'Orion Arbitrage', strategy: 'Arbitrage', status: 'Active', pnl: 125430.50, trades: 10532, uptime: '99.8%' },
        { id: 'algo-002', name: 'Titan Momentum', strategy: 'Momentum', status: 'Active', pnl: 89321.75, trades: 4301, uptime: '99.9%' },
        { id: 'algo-003', name: 'Helios Reversion', strategy: 'Mean Reversion', status: 'Paused', pnl: -12034.10, trades: 887, uptime: '92.1%' },
    ]);

    // Data Aggregation & Memoization
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
    const totalExpenses = corporateTransactions.reduce((acc, t) => acc + t.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    const financialRatios = calculateEnterpriseFinancialRatios(invoices, paymentOrders, corporateTransactions);
    const cashFlowForecast = generateCashFlowProjections(invoices, paymentOrders);
    const dailyVolume = generateDailyTransactionAnalytics(corporateTransactions);
    const operationalSpend = segmentOperationalSpend(corporateTransactions);
    const vendorMetrics = analyzeVendorEcosystem(corporateTransactions);
    const riskHeatmap = generateEnterpriseRiskHeatmap(complianceCases, corporateTransactions);
    const portfolioMetrics: PortfolioMetrics = { totalValue: 15780000, dailyPnl: 214752.25, valueAtRisk: 1200000, sharpeRatio: 2.8, alpha: 0.12 };

    // AI Integration Hook
    useEffect(() => {
        const generateStrategicReport = async () => {
            setIsAiProcessing(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                let promptContext = `Analyze the following data for the '${activeTab}' view and provide a high-level, actionable strategic insight (max 2 sentences). Context: `;
                if (activeTab === 'Overview') promptContext += `Rev $${totalRevenue}, Net $${netIncome}. Critical Risks: ${riskHeatmap.filter(r => r.probability * r.impact > 0.15).length}.`;
                else if (activeTab === 'Finance') promptContext += `Current Ratio ${financialRatios[0].value.toFixed(2)}. Cash Flow Trend: ${cashFlowForecast[0].netPosition > 0 ? 'Positive' : 'Negative'}.`;
                else if (activeTab === 'Operations') promptContext += `Top Spend: ${operationalSpend.sort((a,b) => b.value - a.value)[0]?.category}. Vendor Count: ${vendorMetrics.length}.`;
                else if (activeTab === 'Risk') promptContext += `Highest Risk: ${riskHeatmap.sort((a,b) => b.probability - a.probability)[0]?.riskCategory}. Total Exposure: $${riskHeatmap.reduce((s,r) => s + r.exposureValue, 0)}.`;
                else if (activeTab === 'Markets') promptContext += `Portfolio Value: $${portfolioMetrics.totalValue}. Daily PnL: $${portfolioMetrics.dailyPnl}. VaR: $${portfolioMetrics.valueAtRisk}.`;
                else promptContext += `Based on burn rate of $${financialRatios[2].value.toFixed(2)}/day, suggest 3 strategic moves for growth.`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: promptContext,
                    config: {
                        systemInstruction: "You are a hyper-intelligent AI financial and strategic advisor integrated into the NEXUS COMMAND enterprise OS. Provide concise, data-driven insights.",
                        thinkingConfig: {
                            thinkingBudget: 0, // Disables thinking for faster response in UI
                        },
                    }
                });
                setAiInsight(response.text);
            } catch (error) { setAiInsight("AI link unavailable. Using fallback data."); } 
            finally { setIsAiProcessing(false); setLastUpdated(new Date()); }
        };
        generateStrategicReport();
    }, [activeTab, totalRevenue, netIncome]);

    // Market Data Simulation Hook
    useEffect(() => {
        const symbols = ['NEX-USD', 'BTC-USD', 'ETH-USD', 'QNTM-IDX'];
        const initialPrices: Record<string, number> = { 'NEX-USD': 125.4, 'BTC-USD': 68000, 'ETH-USD': 3500, 'QNTM-IDX': 2400 };
        const interval = setInterval(() => {
            const newTick = symbols[Math.floor(Math.random() * symbols.length)];
            const oldPrice = marketData.find(d => d.symbol === newTick)?.price || initialPrices[newTick];
            const change = (Math.random() - 0.5) * oldPrice * 0.01;
            const newPrice = oldPrice + change;
            setMarketData(prev => [{ symbol: newTick, price: newPrice, change, volume: Math.random() * 10, timestamp: Date.now() }, ...prev.slice(0, 99)]);
        }, 500); // High-frequency update
        return () => clearInterval(interval);
    }, [marketData]);

    // --- UTILITIES & INLINE SUB-COMPONENTS ---
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val);
    const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (<button onClick={() => setActiveTab(id)} className={`px-5 py-2 text-xs font-bold tracking-wider transition-all duration-200 border-b-2 ${activeTab === id ? 'border-blue-500 text-white bg-gray-800/50' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30'}`}>{label}</button>);
    const MetricCard = ({ title, value, subtext, trend, color = 'blue' }: { title: string, value: string, subtext?: string, trend?: number, color?: string }) => (
        <div className={`bg-gray-800/50 border border-gray-700 p-4 rounded-lg shadow-lg relative overflow-hidden group hover:border-${color}-500 transition-colors backdrop-blur-sm`}>
            <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h3>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            {subtext && <div className="text-gray-500 text-xs">{subtext}</div>}
            {trend !== undefined && <div className={`text-xs font-medium mt-2 flex items-center ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>{trend >= 0 ? 'â†‘' : 'â†“'} {Math.abs(trend)}%</div>}
        </div>
    );
    const DeployAlgoForm = () => (
        <Card title="Deploy New Trading Algorithm" className="h-full">
            <form className="space-y-4 text-sm">
                <div><label className="text-gray-400 block mb-1">Algorithm Name</label><input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Apollo Scalper" /></div>
                <div><label className="text-gray-400 block mb-1">Strategy</label><select className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option>Momentum</option><option>Arbitrage</option><option>Mean Reversion</option><option>AI Predictive</option></select></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-gray-400 block mb-1">Capital Allocation</label><input type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="100,000" /></div>
                    <div><label className="text-gray-400 block mb-1">Max Drawdown (%)</label><input type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="5" /></div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors">Deploy & Activate</button>
            </form>
        </Card>
    );

    // --- COMPONENT RENDER ---
    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 space-y-6 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">NEXUS COMMAND</h1>
                    <p className="text-gray-400 text-xs mt-1">Enterprise Operating System v5.0.1 â€¢ {lastUpdated.toLocaleString()}</p>
                </div>
                <div className="flex space-x-1 mt-4 md:mt-0 bg-gray-900/50 rounded-md p-1 border border-gray-800">
                    <TabButton id="Overview" label="OVERVIEW" /><TabButton id="Finance" label="FINANCE" /><TabButton id="Operations" label="OPERATIONS" /><TabButton id="Risk" label="RISK" /><TabButton id="Strategy" label="STRATEGY" /><TabButton id="Markets" label="MARKETS" />
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-2xl rounded-lg" />
                <Card className="relative bg-gray-800/50 backdrop-blur border border-blue-500/30 p-4">
                    <div className="flex items-start space-x-4"><div className="p-2 bg-blue-500/10 rounded-full"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                        <div className="flex-1"><h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">AI Strategic Intelligence</h3>
                            {isAiProcessing ? <div className="h-5 bg-gray-700 rounded w-3/4 animate-pulse" /> : <p className="text-base text-gray-100 leading-relaxed font-light">"{aiInsight}"</p>}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-6 animate-fade-in">
                {activeTab === 'Overview' && (<>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <MetricCard title="Total Revenue (YTD)" value={formatCurrency(totalRevenue)} trend={12.5} color="green" />
                        <MetricCard title="Net Income" value={formatCurrency(netIncome)} trend={8.2} color="blue" />
                        <MetricCard title="Active Risks" value={riskHeatmap.filter(r => r.probability * r.impact > 0.15).length.toString()} subtext="Critical Severity" trend={-5.0} color="red" />
                        <MetricCard title="Cash Runway" value="14.2 Months" subtext="Based on current burn" color="purple" />
                        <MetricCard title="Portfolio PnL (24h)" value={formatCurrency(portfolioMetrics.dailyPnl)} trend={1.8} color="yellow" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px]">
                        <Card title="Cash Flow Forecast (12 Months)" className="lg:col-span-2 h-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={cashFlowForecast} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><XAxis dataKey="period" stroke="#6b7280" fontSize={11} /><YAxis stroke="#6b7280" fontSize={11} tickFormatter={(val) => `$${val/1000}k`} /><Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} /><Area type="monotone" dataKey="cumulativeCash" name="Cash Position" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></Card>
                        <Card title="Operational Spend Mix" className="h-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={operationalSpend} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>{operationalSpend.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip contentStyle={{ backgroundColor: '#1f2937' }} /><Legend verticalAlign="bottom" height={36} iconSize={10} /></PieChart></ResponsiveContainer></Card>
                    </div>
                </>)}

                {activeTab === 'Finance' && (<>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{financialRatios.map((ratio, idx) => (<MetricCard key={idx} title={ratio.name} value={typeof ratio.value === 'number' && ratio.value < 100 ? ratio.value.toFixed(2) : formatNumber(ratio.value)} subtext={`Benchmark: ${ratio.benchmark}`} trend={ratio.delta} color={ratio.status === 'Optimal' ? 'green' : ratio.status === 'Stable' ? 'blue' : 'red'} />))}</div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Card title="Revenue vs Expenses Trend" className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={cashFlowForecast}><XAxis dataKey="period" stroke="#6b7280" /><YAxis stroke="#6b7280" tickFormatter={(val) => `$${val/1000}k`} /><Tooltip contentStyle={{ backgroundColor: '#1f2937' }} /><Legend /><Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Card><Card title="Tax Liability Accrual" className="h-80 overflow-auto"><table className="w-full text-left text-xs text-gray-400"><thead className="bg-gray-800 text-gray-200 uppercase font-bold"><tr><th className="p-2">Jurisdiction</th><th className="p-2">Type</th><th className="p-2 text-right">Amount</th><th className="p-2">Status</th></tr></thead><tbody className="divide-y divide-gray-700">{context.taxLiabilities.map((tax, i) => (<tr key={i} className="hover:bg-gray-800/50"><td className="p-2">{tax.jurisdiction}</td><td className="p-2">{tax.taxType}</td><td className="p-2 text-right font-mono text-white">{formatCurrency(tax.estimatedAmount)}</td><td className="p-2"><span className={`px-2 py-1 rounded text-xs font-bold ${tax.status === 'Paid' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>{tax.status}</span></td></tr>))}</tbody></table></Card></div>
                </>)}

                {activeTab === 'Operations' && (<>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Card title="Daily Transaction Analytics" className="lg:col-span-2 h-96"><ResponsiveContainer width="100%" height="100%"><BarChart data={dailyVolume}><XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickFormatter={(d) => d.substring(5)} /><YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} /><YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} /><Tooltip contentStyle={{ backgroundColor: '#1f2937' }} /><Bar yAxisId="left" dataKey="value" fill="#3b82f6" name="Volume ($)" opacity={0.8} /><Bar yAxisId="right" dataKey="secondaryValue" fill="#10b981" name="Count" barSize={10} /></BarChart></ResponsiveContainer></Card>
                        <Card title="Top Vendor Ecosystem" className="h-96 overflow-auto"><div className="space-y-3">{vendorMetrics.slice(0, 10).map((vendor, i) => (<div key={i} className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-700"><div><div className="font-bold text-white text-sm">{vendor.vendor}</div><div className="text-xs text-gray-500">{vendor.transactionCount} txns â€¢ Risk: {vendor.riskScore}/100</div></div><div className="text-right"><div className="font-mono text-blue-400 text-sm">{formatCurrency(vendor.totalSpend)}</div><div className="text-xs text-gray-500">Avg: {formatCurrency(vendor.avgTransactionValue)}</div></div></div>))}</div></Card>
                    </div>
                </>)}

                {activeTab === 'Risk' && (<>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><MetricCard title="Compliance Score" value="94.2" subtext="Top 5% Industry" color="green" /><MetricCard title="Open Cases" value={complianceCases.filter(c => c.status === 'open').length.toString()} subtext="Requires Attention" color="yellow" /><MetricCard title="Total Risk Exposure" value={formatCurrency(riskHeatmap.reduce((a,b)=>a+b.exposureValue,0))} color="red" /><MetricCard title="Audit Anomalies (24h)" value="3" color="purple" /></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card title="Enterprise Risk Matrix (Prob x Impact x Velocity)" className="h-96">{/* A more complex chart could go here */}<div className="p-4 text-gray-400">Advanced 3D risk visualization module under development. Current heatmap shows critical vectors.</div></Card>
                        <Card title="Compliance Case Log" className="h-96 overflow-auto"><div className="space-y-2">{complianceCases.map((c, i) => (<div key={i} className="p-3 border-l-4 border-red-500 bg-gray-800/50 rounded flex justify-between items-center"><div className="flex-1"><div className="font-bold text-sm text-white">{c.type} Violation</div><div className="text-xs text-gray-500 truncate">{c.description}</div></div><span className={`ml-4 px-2 py-1 text-xs rounded font-bold ${c.status === 'open' ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-300'}`}>{c.status.toUpperCase()}</span></div>))}</div></Card>
                    </div>
                </>)}

                {activeTab === 'Strategy' && (<>
                    <Card title="Strategic Growth & Initiative Modeling"><div className="flex flex-col md:flex-row gap-6"><div className="flex-1 space-y-4"><h3 className="text-xl font-bold text-white">Scenario: Aggressive R&D Expansion</h3><p className="text-gray-400 text-sm">Model based on a 25% increase in R&D spend, targeting a 5% market share increase in 18 months. Simulating impact on cash runway and profitability.</p><div className="space-y-2"><div className="flex justify-between text-sm text-gray-300"><span>Projected ROI</span><span>250%</span></div><div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div></div></div><div className="space-y-2"><div className="flex justify-between text-sm text-gray-300"><span>Runway Impact</span><span className="text-red-400">-6.5 Months</span></div><div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: '40%' }}></div></div></div><button className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition-colors">Run Full Monte Carlo Simulation</button></div><div className="w-full md:w-1/3 bg-gray-800 p-4 rounded-lg border border-gray-700"><h4 className="font-bold text-white mb-3">AI Recommendations</h4><ul className="space-y-3 text-sm"><li><span className="text-green-400">âœ“</span> Optimize vendor contracts to reduce OPEX by 12%.</li><li><span className="text-green-400">âœ“</span> Accelerate receivables collection to improve DSO by 5 days.</li><li><span className="text-yellow-400">âš </span> Monitor geopolitical risk in supply chain region APAC-1.</li></ul><button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => setActiveView(View.Budgets)}>Adjust Budgets</button></div></div></Card>
                </>)}

                {activeTab === 'Markets' && (<>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <MetricCard title="Portfolio Value" value={formatCurrency(portfolioMetrics.totalValue)} color="blue" />
                        <MetricCard title="24h PnL" value={formatCurrency(portfolioMetrics.dailyPnl)} trend={1.8} color={portfolioMetrics.dailyPnl > 0 ? 'green' : 'red'} />
                        <MetricCard title="Value at Risk (95%)" value={formatCurrency(portfolioMetrics.valueAtRisk)} color="red" />
                        <MetricCard title="Sharpe Ratio" value={portfolioMetrics.sharpeRatio.toFixed(2)} color="purple" />
                        <MetricCard title="Alpha" value={portfolioMetrics.alpha.toFixed(3)} color="yellow" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card title="Algorithm Control Panel" className="h-96 overflow-auto"><div className="space-y-3">{tradingAlgos.map(algo => (<div key={algo.id} className={`p-3 rounded border-l-4 ${algo.status === 'Active' ? 'border-green-500' : 'border-yellow-500'} bg-gray-800`}><div className="flex justify-between items-center"><span className="font-bold text-white">{algo.name}</span><span className={`px-2 py-1 text-xs rounded ${algo.status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>{algo.status}</span></div><div className="text-xs text-gray-400 mt-1">{algo.strategy} | PnL: <span className={algo.pnl > 0 ? 'text-green-400' : 'text-red-400'}>{formatCurrency(algo.pnl)}</span></div></div>))}</div></Card>
                            <DeployAlgoForm />
                        </div>
                        <Card title="Live Market Feed" className="h-96 overflow-auto"><div className="font-mono text-xs space-y-1">{marketData.map(tick => (<div key={tick.timestamp} className={`flex justify-between p-1 rounded ${tick.change > 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}><span className="text-blue-400">{tick.symbol}</span><span className="text-white">{tick.price.toFixed(2)}</span><span className={tick.change > 0 ? 'text-green-400' : 'text-red-400'}>{tick.change.toFixed(4)}</span></div>))}</div></Card>
                    </div>
                </>)}
            </div>
        </div>
    );
};

export default CorporateCommandView;


// --- CONSOLIDATED FROM: CorporateCommandView (5)_1.tsx ---

import React, { useContext, useState, useEffect, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, PaymentOrder, Invoice, ComplianceCase, CorporateTransaction } from '../types';
import { GoogleGenAI } from '@google/genai';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';

// --- EXPANDED DATA STRUCTURES FOR HYPER-DIMENSIONAL ANALYSIS ---

export type TimeSeriesData = { date: string; value: number; secondaryValue?: number; tertiaryValue?: number; };
export type CategoricalData = { category: string; value: number; percentage?: number; color?: string; };
export type FinancialRatio = { name: string; value: number; benchmark: number; status: 'Optimal' | 'Stable' | 'Warning' | 'Critical'; delta: number; };
export type VendorPerformanceMetric = { vendor: string; totalSpend: number; transactionCount: number; avgTransactionValue: number; riskScore: number; lastInteraction: string; };
export type DepartmentalKPI = { department: string; budgetUtilization: number; operationalEfficiency: number; complianceScore: number; headcountSpend: number; };
export type RiskAssessmentData = { riskCategory: string; probability: number; impact: number; velocity: number; mitigationStatus: string; exposureValue: number; };
export type CashFlowProjection = { period: string; inflow: number; outflow: number; netPosition: number; cumulativeCash: number; };
export type AuditLogEntry = { timestamp: string; user: string; action: string; severity: 'Low' | 'Medium' | 'High' | 'Critical'; details: string; };
export type TaxLiabilityBreakdown = { jurisdiction: string; taxType: string; estimatedAmount: number; dueDate: string; status: 'Accrued' | 'Paid' | 'Pending'; };

// High-Frequency Trading & Market Intelligence Structures
export type MarketDataTick = { symbol: string; price: number; change: number; volume: number; timestamp: number; };
export type TradingAlgorithm = { id: string; name: string; strategy: 'Momentum' | 'Arbitrage' | 'Mean Reversion'; status: 'Active' | 'Paused' | 'Terminated'; pnl: number; trades: number; uptime: string; };
export type PortfolioMetrics = { totalValue: number; dailyPnl: number; valueAtRisk: number; sharpeRatio: number; alpha: number; };
export type GlobalMacroIndicator = { name: string; value: number; trend: 'Up' | 'Down' | 'Stable'; impact: 'High' | 'Medium' | 'Low'; region: string; };
export type StrategicInitiative = { id: string; name: string; description: string; budget: number; projectedROI: number; status: 'Planning' | 'Active' | 'Completed'; };

// --- EXPANDED DATA PROCESSING & SIMULATION FUNCTIONS ---

export const generateDailyTransactionAnalytics = (transactions: CorporateTransaction[]): TimeSeriesData[] => {
    const dailyMap: Record<string, { count: number; amount: number }> = {};
    transactions.forEach(tx => {
        const date = new Date(tx.date).toISOString().split('T')[0];
        if (!dailyMap[date]) dailyMap[date] = { count: 0, amount: 0 };
        dailyMap[date].count++;
        dailyMap[date].amount += tx.amount;
    });
    return Object.entries(dailyMap).map(([date, data]) => ({ date, value: data.amount, secondaryValue: data.count })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const calculateEnterpriseFinancialRatios = (invoices: Invoice[], orders: PaymentOrder[], transactions: CorporateTransaction[]): FinancialRatio[] => {
    const currentAssets = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);
    const currentLiabilities = orders.filter(o => o.status !== 'paid').reduce((sum, o) => sum + o.amount, 0);
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const netProfitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;
    const burnRate = totalExpenses / 30;
    return [
        { name: 'Current Ratio', value: currentRatio, benchmark: 2.0, status: currentRatio > 2.0 ? 'Optimal' : currentRatio > 1.2 ? 'Stable' : 'Warning', delta: 0.1 },
        { name: 'Net Profit Margin', value: netProfitMargin, benchmark: 20, status: netProfitMargin > 20 ? 'Optimal' : netProfitMargin > 10 ? 'Stable' : 'Warning', delta: -2.5 },
        { name: 'Daily Burn Rate', value: burnRate, benchmark: 5000, status: burnRate < 5000 ? 'Optimal' : 'Warning', delta: 12.4 }
    ];
};

export const generateCashFlowProjections = (invoices: Invoice[], orders: PaymentOrder[]): CashFlowProjection[] => {
    const projections: CashFlowProjection[] = [];
    let currentCash = 1000000;
    for (let i = 0; i < 12; i++) { // Extended to 12 months
        const futureDate = new Date(); futureDate.setMonth(futureDate.getMonth() + i);
        const periodKey = futureDate.toISOString().substring(0, 7);
        const projectedInflow = invoices.filter(inv => new Date(inv.dueDate).getMonth() === futureDate.getMonth()).reduce((sum, inv) => sum + inv.amount, 0) * 0.95;
        const projectedOutflow = orders.filter(ord => new Date(ord.dueDate || '').getMonth() === futureDate.getMonth()).reduce((sum, ord) => sum + ord.amount, 0) * 1.1;
        const net = projectedInflow - projectedOutflow;
        currentCash += net;
        projections.push({ period: periodKey, inflow: projectedInflow, outflow: projectedOutflow, netPosition: net, cumulativeCash: currentCash });
    }
    return projections;
};

export const analyzeVendorEcosystem = (transactions: CorporateTransaction[]): VendorPerformanceMetric[] => {
    const vendorMap: Record<string, VendorPerformanceMetric> = {};
    transactions.forEach(tx => {
        if (!vendorMap[tx.merchant]) vendorMap[tx.merchant] = { vendor: tx.merchant, totalSpend: 0, transactionCount: 0, avgTransactionValue: 0, riskScore: Math.floor(Math.random() * 100), lastInteraction: tx.date };
        const v = vendorMap[tx.merchant];
        v.totalSpend += tx.amount; v.transactionCount++; v.avgTransactionValue = v.totalSpend / v.transactionCount;
        if (new Date(tx.date) > new Date(v.lastInteraction)) v.lastInteraction = tx.date;
    });
    return Object.values(vendorMap).sort((a, b) => b.totalSpend - a.totalSpend);
};

export const segmentOperationalSpend = (transactions: CorporateTransaction[]): CategoricalData[] => {
    const categories = { 'Infrastructure': 0, 'COGS': 0, 'R&D': 0, 'S&M': 0, 'G&A': 0, 'Quantum Computing': 0 };
    transactions.forEach(tx => {
        if (tx.merchant.includes('AWS') || tx.merchant.includes('Server')) categories['Infrastructure'] += tx.amount;
        else if (tx.merchant.includes('Supplier')) categories['COGS'] += tx.amount;
        else if (tx.description.includes('Research')) categories['R&D'] += tx.amount;
        else if (tx.merchant.includes('Ads')) categories['S&M'] += tx.amount;
        else if (tx.description.includes('Quantum')) categories['Quantum Computing'] += tx.amount;
        else categories['G&A'] += tx.amount;
    });
    return Object.entries(categories).map(([category, value]) => ({ category, value }));
};

export const generateEnterpriseRiskHeatmap = (cases: ComplianceCase[], transactions: CorporateTransaction[]): RiskAssessmentData[] => {
    const risks: RiskAssessmentData[] = [
        { riskCategory: 'AML/KYC', probability: 0.15, impact: 0.9, velocity: 0.8, mitigationStatus: 'Monitoring', exposureValue: 500000 },
        { riskCategory: 'Cybersecurity', probability: 0.3, impact: 0.99, velocity: 0.9, mitigationStatus: 'Hardened', exposureValue: 5000000 },
        { riskCategory: 'Geopolitical', probability: 0.4, impact: 0.7, velocity: 0.5, mitigationStatus: 'Contingency Plan', exposureValue: 1200000 },
        { riskCategory: 'Market Volatility', probability: 0.6, impact: 0.5, velocity: 0.95, mitigationStatus: 'Hedged', exposureValue: 2500000 },
        { riskCategory: 'AI Model Drift', probability: 0.25, impact: 0.8, velocity: 0.6, mitigationStatus: 'Continuous Training', exposureValue: 900000 },
    ];
    if (cases.some(c => c.type === 'AML')) risks[0].probability += 0.2;
    if (transactions.some(t => t.amount > 50000)) risks[1].probability += 0.1;
    return risks;
};

// --- MAIN COMPONENT: NEXUS COMMAND ---

interface CorporateDashboardProps { setActiveView: (view: View) => void; }

const CorporateCommandView: React.FC<CorporateDashboardProps> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    if (!context) throw new Error("CorporateCommandView requires DataContext.");
    const { paymentOrders, invoices, complianceCases, corporateTransactions } = context;

    // State Management
    const [activeTab, setActiveTab] = useState<'Overview' | 'Finance' | 'Operations' | 'Risk' | 'Strategy' | 'Markets'>('Overview');
    const [aiInsight, setAiInsight] = useState<string>('Initializing AI...');
    const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [marketData, setMarketData] = useState<MarketDataTick[]>([]);
    const [tradingAlgos, setTradingAlgos] = useState<TradingAlgorithm[]>([
        { id: 'algo-001', name: 'Orion Arbitrage', strategy: 'Arbitrage', status: 'Active', pnl: 125430.50, trades: 10532, uptime: '99.8%' },
        { id: 'algo-002', name: 'Titan Momentum', strategy: 'Momentum', status: 'Active', pnl: 89321.75, trades: 4301, uptime: '99.9%' },
        { id: 'algo-003', name: 'Helios Reversion', strategy: 'Mean Reversion', status: 'Paused', pnl: -12034.10, trades: 887, uptime: '92.1%' },
    ]);

    // Data Aggregation & Memoization
    const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0);
    const totalExpenses = corporateTransactions.reduce((acc, t) => acc + t.amount, 0);
    const netIncome = totalRevenue - totalExpenses;
    const financialRatios = calculateEnterpriseFinancialRatios(invoices, paymentOrders, corporateTransactions);
    const cashFlowForecast = generateCashFlowProjections(invoices, paymentOrders);
    const dailyVolume = generateDailyTransactionAnalytics(corporateTransactions);
    const operationalSpend = segmentOperationalSpend(corporateTransactions);
    const vendorMetrics = analyzeVendorEcosystem(corporateTransactions);
    const riskHeatmap = generateEnterpriseRiskHeatmap(complianceCases, corporateTransactions);
    const portfolioMetrics: PortfolioMetrics = { totalValue: 15780000, dailyPnl: 214752.25, valueAtRisk: 1200000, sharpeRatio: 2.8, alpha: 0.12 };

    // AI Integration Hook
    useEffect(() => {
        const generateStrategicReport = async () => {
            setIsAiProcessing(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                let promptContext = `Analyze the following data for the '${activeTab}' view and provide a high-level, actionable strategic insight (max 2 sentences). Context: `;
                if (activeTab === 'Overview') promptContext += `Rev $${totalRevenue}, Net $${netIncome}. Critical Risks: ${riskHeatmap.filter(r => r.probability * r.impact > 0.15).length}.`;
                else if (activeTab === 'Finance') promptContext += `Current Ratio ${financialRatios[0].value.toFixed(2)}. Cash Flow Trend: ${cashFlowForecast[0].netPosition > 0 ? 'Positive' : 'Negative'}.`;
                else if (activeTab === 'Operations') promptContext += `Top Spend: ${operationalSpend.sort((a,b) => b.value - a.value)[0]?.category}. Vendor Count: ${vendorMetrics.length}.`;
                else if (activeTab === 'Risk') promptContext += `Highest Risk: ${riskHeatmap.sort((a,b) => b.probability - a.probability)[0]?.riskCategory}. Total Exposure: $${riskHeatmap.reduce((s,r) => s + r.exposureValue, 0)}.`;
                else if (activeTab === 'Markets') promptContext += `Portfolio Value: $${portfolioMetrics.totalValue}. Daily PnL: $${portfolioMetrics.dailyPnl}. VaR: $${portfolioMetrics.valueAtRisk}.`;
                else promptContext += `Based on burn rate of $${financialRatios[2].value.toFixed(2)}/day, suggest 3 strategic moves for growth.`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: promptContext,
                    config: {
                        systemInstruction: "You are a hyper-intelligent AI financial and strategic advisor integrated into the NEXUS COMMAND enterprise OS. Provide concise, data-driven insights.",
                        thinkingConfig: {
                            thinkingBudget: 0, // Disables thinking for faster response in UI
                        },
                    }
                });
                setAiInsight(response.text);
            } catch (error) { setAiInsight("AI link unavailable. Using fallback data."); } 
            finally { setIsAiProcessing(false); setLastUpdated(new Date()); }
        };
        generateStrategicReport();
    }, [activeTab, totalRevenue, netIncome]);

    // Market Data Simulation Hook
    useEffect(() => {
        const symbols = ['NEX-USD', 'BTC-USD', 'ETH-USD', 'QNTM-IDX'];
        const initialPrices: Record<string, number> = { 'NEX-USD': 125.4, 'BTC-USD': 68000, 'ETH-USD': 3500, 'QNTM-IDX': 2400 };
        const interval = setInterval(() => {
            const newTick = symbols[Math.floor(Math.random() * symbols.length)];
            const oldPrice = marketData.find(d => d.symbol === newTick)?.price || initialPrices[newTick];
            const change = (Math.random() - 0.5) * oldPrice * 0.01;
            const newPrice = oldPrice + change;
            setMarketData(prev => [{ symbol: newTick, price: newPrice, change, volume: Math.random() * 10, timestamp: Date.now() }, ...prev.slice(0, 99)]);
        }, 500); // High-frequency update
        return () => clearInterval(interval);
    }, [marketData]);

    // --- UTILITIES & INLINE SUB-COMPONENTS ---
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(val);
    const formatNumber = (val: number) => new Intl.NumberFormat('en-US', { notation: 'compact' }).format(val);
    const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (<button onClick={() => setActiveTab(id)} className={`px-5 py-2 text-xs font-bold tracking-wider transition-all duration-200 border-b-2 ${activeTab === id ? 'border-blue-500 text-white bg-gray-800/50' : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30'}`}>{label}</button>);
    const MetricCard = ({ title, value, subtext, trend, color = 'blue' }: { title: string, value: string, subtext?: string, trend?: number, color?: string }) => (
        <div className={`bg-gray-800/50 border border-gray-700 p-4 rounded-lg shadow-lg relative overflow-hidden group hover:border-${color}-500 transition-colors backdrop-blur-sm`}>
            <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`} />
            <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</h3>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            {subtext && <div className="text-gray-500 text-xs">{subtext}</div>}
            {trend !== undefined && <div className={`text-xs font-medium mt-2 flex items-center ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>{trend >= 0 ? 'â†‘' : 'â†“'} {Math.abs(trend)}%</div>}
        </div>
    );
    const DeployAlgoForm = () => (
        <Card title="Deploy New Trading Algorithm" className="h-full">
            <form className="space-y-4 text-sm">
                <div><label className="text-gray-400 block mb-1">Algorithm Name</label><input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Apollo Scalper" /></div>
                <div><label className="text-gray-400 block mb-1">Strategy</label><select className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option>Momentum</option><option>Arbitrage</option><option>Mean Reversion</option><option>AI Predictive</option></select></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-gray-400 block mb-1">Capital Allocation</label><input type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="100,000" /></div>
                    <div><label className="text-gray-400 block mb-1">Max Drawdown (%)</label><input type="number" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="5" /></div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded transition-colors">Deploy & Activate</button>
            </form>
        </Card>
    );

    // --- COMPONENT RENDER ---
    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 space-y-6 font-sans">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">NEXUS COMMAND</h1>
                    <p className="text-gray-400 text-xs mt-1">Enterprise Operating System v5.0.1 â€¢ {lastUpdated.toLocaleString()}</p>
                </div>
                <div className="flex space-x-1 mt-4 md:mt-0 bg-gray-900/50 rounded-md p-1 border border-gray-800">
                    <TabButton id="Overview" label="OVERVIEW" /><TabButton id="Finance" label="FINANCE" /><TabButton id="Operations" label="OPERATIONS" /><TabButton id="Risk" label="RISK" /><TabButton id="Strategy" label="STRATEGY" /><TabButton id="Markets" label="MARKETS" />
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 blur-2xl rounded-lg" />
                <Card className="relative bg-gray-800/50 backdrop-blur border border-blue-500/30 p-4">
                    <div className="flex items-start space-x-4"><div className="p-2 bg-blue-500/10 rounded-full"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                        <div className="flex-1"><h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-1">AI Strategic Intelligence</h3>
                            {isAiProcessing ? <div className="h-5 bg-gray-700 rounded w-3/4 animate-pulse" /> : <p className="text-base text-gray-100 leading-relaxed font-light">"{aiInsight}"</p>}
                        </div>
                    </div>
                </Card>
            </div>

            <div className="space-y-6 animate-fade-in">
                {activeTab === 'Overview' && (<>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <MetricCard title="Total Revenue (YTD)" value={formatCurrency(totalRevenue)} trend={12.5} color="green" />
                        <MetricCard title="Net Income" value={formatCurrency(netIncome)} trend={8.2} color="blue" />
                        <MetricCard title="Active Risks" value={riskHeatmap.filter(r => r.probability * r.impact > 0.15).length.toString()} subtext="Critical Severity" trend={-5.0} color="red" />
                        <MetricCard title="Cash Runway" value="14.2 Months" subtext="Based on current burn" color="purple" />
                        <MetricCard title="Portfolio PnL (24h)" value={formatCurrency(portfolioMetrics.dailyPnl)} trend={1.8} color="yellow" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[400px]">
                        <Card title="Cash Flow Forecast (12 Months)" className="lg:col-span-2 h-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={cashFlowForecast} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}><XAxis dataKey="period" stroke="#6b7280" fontSize={11} /><YAxis stroke="#6b7280" fontSize={11} tickFormatter={(val) => `$${val/1000}k`} /><Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }} /><Area type="monotone" dataKey="cumulativeCash" name="Cash Position" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></Card>
                        <Card title="Operational Spend Mix" className="h-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={operationalSpend} dataKey="value" nameKey="category" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>{operationalSpend.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Pie><Tooltip contentStyle={{ backgroundColor: '#1f2937' }} /><Legend verticalAlign="bottom" height={36} iconSize={10} /></PieChart></ResponsiveContainer></Card>
                    </div>
                </>)}

                {activeTab === 'Finance' && (<>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{financialRatios.map((ratio, idx) => (<MetricCard key={idx} title={ratio.name} value={typeof ratio.value === 'number' && ratio.value < 100 ? ratio.value.toFixed(2) : formatNumber(ratio.value)} subtext={`Benchmark: ${ratio.benchmark}`} trend={ratio.delta} color={ratio.status === 'Optimal' ? 'green' : ratio.status === 'Stable' ? 'blue' : 'red'} />))}</div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Card title="Revenue vs Expenses Trend" className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={cashFlowForecast}><XAxis dataKey="period" stroke="#6b7280" /><YAxis stroke="#6b7280" tickFormatter={(val) => `$${val/1000}k`} /><Tooltip contentStyle={{ backgroundColor: '#1f2937' }} /><Legend /><Bar dataKey="inflow" name="Inflow" fill="#10b981" radius={[4, 4, 0, 0]} /><Bar dataKey="outflow" name="Outflow" fill="#ef4444" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></Card><Card title="Tax Liability Accrual" className="h-80 overflow-auto"><table className="w-full text-left text-xs text-gray-400"><thead className="bg-gray-800 text-gray-200 uppercase font-bold"><tr><th className="p-2">Jurisdiction</th><th className="p-2">Type</th><th className="p-2 text-right">Amount</th><th className="p-2">Status</th></tr></thead><tbody className="divide-y divide-gray-700">{context.taxLiabilities.map((tax, i) => (<tr key={i} className="hover:bg-gray-800/50"><td className="p-2">{tax.jurisdiction}</td><td className="p-2">{tax.taxType}</td><td className="p-2 text-right font-mono text-white">{formatCurrency(tax.estimatedAmount)}</td><td className="p-2"><span className={`px-2 py-1 rounded text-xs font-bold ${tax.status === 'Paid' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>{tax.status}</span></td></tr>))}</tbody></table></Card></div>
                </>)}

                {activeTab === 'Operations' && (<>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Card title="Daily Transaction Analytics" className="lg:col-span-2 h-96"><ResponsiveContainer width="100%" height="100%"><BarChart data={dailyVolume}><XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickFormatter={(d) => d.substring(5)} /><YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} tickFormatter={(val) => `$${val/1000}k`} /><YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} /><Tooltip contentStyle={{ backgroundColor: '#1f2937' }} /><Bar yAxisId="left" dataKey="value" fill="#3b82f6" name="Volume ($)" opacity={0.8} /><Bar yAxisId="right" dataKey="secondaryValue" fill="#10b981" name="Count" barSize={10} /></BarChart></ResponsiveContainer></Card>
                        <Card title="Top Vendor Ecosystem" className="h-96 overflow-auto"><div className="space-y-3">{vendorMetrics.slice(0, 10).map((vendor, i) => (<div key={i} className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-700"><div><div className="font-bold text-white text-sm">{vendor.vendor}</div><div className="text-xs text-gray-500">{vendor.transactionCount} txns â€¢ Risk: {vendor.riskScore}/100</div></div><div className="text-right"><div className="font-mono text-blue-400 text-sm">{formatCurrency(vendor.totalSpend)}</div><div className="text-xs text-gray-500">Avg: {formatCurrency(vendor.avgTransactionValue)}</div></div></div>))}</div></Card>
                    </div>
                </>)}

                {activeTab === 'Risk' && (<>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4"><MetricCard title="Compliance Score" value="94.2" subtext="Top 5% Industry" color="green" /><MetricCard title="Open Cases" value={complianceCases.filter(c => c.status === 'open').length.toString()} subtext="Requires Attention" color="yellow" /><MetricCard title="Total Risk Exposure" value={formatCurrency(riskHeatmap.reduce((a,b)=>a+b.exposureValue,0))} color="red" /><MetricCard title="Audit Anomalies (24h)" value="3" color="purple" /></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card title="Enterprise Risk Matrix (Prob x Impact x Velocity)" className="h-96">{/* A more complex chart could go here */}<div className="p-4 text-gray-400">Advanced 3D risk visualization module under development. Current heatmap shows critical vectors.</div></Card>
                        <Card title="Compliance Case Log" className="h-96 overflow-auto"><div className="space-y-2">{complianceCases.map((c, i) => (<div key={i} className="p-3 border-l-4 border-red-500 bg-gray-800/50 rounded flex justify-between items-center"><div className="flex-1"><div className="font-bold text-sm text-white">{c.type} Violation</div><div className="text-xs text-gray-500 truncate">{c.description}</div></div><span className={`ml-4 px-2 py-1 text-xs rounded font-bold ${c.status === 'open' ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-300'}`}>{c.status.toUpperCase()}</span></div>))}</div></Card>
                    </div>
                </>)}

                {activeTab === 'Strategy' && (<>
                    <Card title="Strategic Growth & Initiative Modeling"><div className="flex flex-col md:flex-row gap-6"><div className="flex-1 space-y-4"><h3 className="text-xl font-bold text-white">Scenario: Aggressive R&D Expansion</h3><p className="text-gray-400 text-sm">Model based on a 25% increase in R&D spend, targeting a 5% market share increase in 18 months. Simulating impact on cash runway and profitability.</p><div className="space-y-2"><div className="flex justify-between text-sm text-gray-300"><span>Projected ROI</span><span>250%</span></div><div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div></div></div><div className="space-y-2"><div className="flex justify-between text-sm text-gray-300"><span>Runway Impact</span><span className="text-red-400">-6.5 Months</span></div><div className="w-full bg-gray-700 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: '40%' }}></div></div></div><button className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded transition-colors">Run Full Monte Carlo Simulation</button></div><div className="w-full md:w-1/3 bg-gray-800 p-4 rounded-lg border border-gray-700"><h4 className="font-bold text-white mb-3">AI Recommendations</h4><ul className="space-y-3 text-sm"><li><span className="text-green-400">âœ“</span> Optimize vendor contracts to reduce OPEX by 12%.</li><li><span className="text-green-400">âœ“</span> Accelerate receivables collection to improve DSO by 5 days.</li><li><span className="text-yellow-400">âš </span> Monitor geopolitical risk in supply chain region APAC-1.</li></ul><button className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={() => setActiveView(View.Budgets)}>Adjust Budgets</button></div></div></Card>
                </>)}

                {activeTab === 'Markets' && (<>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <MetricCard title="Portfolio Value" value={formatCurrency(portfolioMetrics.totalValue)} color="blue" />
                        <MetricCard title="24h PnL" value={formatCurrency(portfolioMetrics.dailyPnl)} trend={1.8} color={portfolioMetrics.dailyPnl > 0 ? 'green' : 'red'} />
                        <MetricCard title="Value at Risk (95%)" value={formatCurrency(portfolioMetrics.valueAtRisk)} color="red" />
                        <MetricCard title="Sharpe Ratio" value={portfolioMetrics.sharpeRatio.toFixed(2)} color="purple" />
                        <MetricCard title="Alpha" value={portfolioMetrics.alpha.toFixed(3)} color="yellow" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card title="Algorithm Control Panel" className="h-96 overflow-auto"><div className="space-y-3">{tradingAlgos.map(algo => (<div key={algo.id} className={`p-3 rounded border-l-4 ${algo.status === 'Active' ? 'border-green-500' : 'border-yellow-500'} bg-gray-800`}><div className="flex justify-between items-center"><span className="font-bold text-white">{algo.name}</span><span className={`px-2 py-1 text-xs rounded ${algo.status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>{algo.status}</span></div><div className="text-xs text-gray-400 mt-1">{algo.strategy} | PnL: <span className={algo.pnl > 0 ? 'text-green-400' : 'text-red-400'}>{formatCurrency(algo.pnl)}</span></div></div>))}</div></Card>
                            <DeployAlgoForm />
                        </div>
                        <Card title="Live Market Feed" className="h-96 overflow-auto"><div className="font-mono text-xs space-y-1">{marketData.map(tick => (<div key={tick.timestamp} className={`flex justify-between p-1 rounded ${tick.change > 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}><span className="text-blue-400">{tick.symbol}</span><span className="text-white">{tick.price.toFixed(2)}</span><span className={tick.change > 0 ? 'text-green-400' : 'text-red-400'}>{tick.change.toFixed(4)}</span></div>))}</div></Card>
                    </div>
                </>)}
            </div>
        </div>
    );
};

export default CorporateCommandView;


// --- CONSOLIDATED FROM: CorporateCommandView (2).tsx ---



// --- CONSOLIDATED FROM: CorporateCommandView (2)_1.tsx ---



// --- CONSOLIDATED FROM: CorporateCommandView (3).tsx ---

import React from 'react';
import './CorporateCommandView.css';

// =================================================================================
// REFACTORING NOTE:
// The original CorporateCommandView component has been completely removed and replaced.
//
// REASONING:
// The previous implementation was a massive, unmanageable form for entering over 200 API keys
// directly into the frontend. This pattern is a critical security vulnerability and is not
// suitable for a production environment. Exposing secret keys to the client-side, even for
// transmission to a backend, risks interception, exposure in browser memory, and logging.
// This design is fundamentally flawed and has been eliminated as per the refactoring mandate.
//
// THE NEW APPROACH:
// This component has been repurposed as a high-level, read-only "Integration Status" dashboard.
// The core principle is that API keys and other secrets MUST be managed exclusively on the
// backend. They should be stored in a secure vault (like AWS Secrets Manager or HashiCorp Vault)
// and loaded into the application environment at runtime. The frontend should never handle
// raw secret keys.
//
// This new view demonstrates a secure pattern: the frontend can query the backend for the
// *status* of an integration (e.g., "Connected," "Configuration Missing") without ever
// accessing the underlying credentials.
// =================================================================================

interface IntegrationStatus {
  name: string;
  category: string;
  status: 'Connected' | 'Not Configured' | 'Error';
}

// Mock data demonstrating what a secure backend API would provide.
// In a real application, this data would be fetched from a secure endpoint
// that verifies user permissions before returning this information.
// The list is focused on a realistic MVP scope.
const mockIntegrationStatuses: IntegrationStatus[] = [
  // Key MVP integrations
  { name: 'Plaid', category: 'Data Aggregator', status: 'Connected' },
  { name: 'Stripe', category: 'Payment Processing', status: 'Connected' },
  { name: 'OpenAI', category: 'AI & Machine Learning', status: 'Not Configured' },
  { name: 'AWS', category: 'Cloud Infrastructure', status: 'Connected' },
  
  // A few other examples to show the concept
  { name: 'Twilio', category: 'Communications', status: 'Not Configured' },
  { name: 'QuickBooks', category: 'Accounting', status: 'Error' },
  { name: 'Mercury', category: 'Banking as a Service', status: 'Connected' },
  { name: 'Unit', category: 'Banking as a Service', status: 'Connected' },
];

const CorporateCommandView: React.FC = () => {
  // In a real implementation, you would use a library like React Query or SWR to fetch this data.
  // Example:
  // const { data: statuses, isLoading, error } = useQuery('integrationStatuses', fetchIntegrationStatuses);

  const getStatusClassName = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'Connected':
        return 'status-connected';
      case 'Not Configured':
        return 'status-not-configured';
      case 'Error':
        return 'status-error';
      default:
        return '';
    }
  };

  return (
    <div className="settings-container">
      <h1>Integration Status</h1>
      <p className="subtitle">
        This dashboard shows the status of key third-party API integrations.
        <br />
        <strong>Note:</strong> API credentials are managed securely on the server-side and are never exposed here.
      </p>

      <div className="status-table-container">
        <table className="status-table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockIntegrationStatuses.map((integration) => (
              <tr key={integration.name}>
                <td>{integration.name}</td>
                <td>{integration.category}</td>
                <td>
                  <span className={`status-pill ${getStatusClassName(integration.status)}`}>
                    {integration.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="architectural-note">
        <h3>Architectural Decision</h3>
        <p>
          The previous version of this page, a form for entering API keys, has been removed to eliminate a critical security vulnerability. The correct, secure pattern for a production application is to manage all secrets (API keys, tokens, credentials) in a dedicated secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault, or encrypted environment variables) on the backend.
        </p>
        <p>
          Configuration of these secrets must be performed by authorized personnel with access to the backend environment, never through a client-facing user interface.
        </p>
      </div>
    </div>
  );
};

export default CorporateCommandView;

// --- CONSOLIDATED FROM: CorporateCommandView (3)_1.tsx ---

import React from 'react';
import './CorporateCommandView.css';

// =================================================================================
// REFACTORING NOTE:
// The original CorporateCommandView component has been completely removed and replaced.
//
// REASONING:
// The previous implementation was a massive, unmanageable form for entering over 200 API keys
// directly into the frontend. This pattern is a critical security vulnerability and is not
// suitable for a production environment. Exposing secret keys to the client-side, even for
// transmission to a backend, risks interception, exposure in browser memory, and logging.
// This design is fundamentally flawed and has been eliminated as per the refactoring mandate.
//
// THE NEW APPROACH:
// This component has been repurposed as a high-level, read-only "Integration Status" dashboard.
// The core principle is that API keys and other secrets MUST be managed exclusively on the
// backend. They should be stored in a secure vault (like AWS Secrets Manager or HashiCorp Vault)
// and loaded into the application environment at runtime. The frontend should never handle
// raw secret keys.
//
// This new view demonstrates a secure pattern: the frontend can query the backend for the
// *status* of an integration (e.g., "Connected," "Configuration Missing") without ever
// accessing the underlying credentials.
// =================================================================================

interface IntegrationStatus {
  name: string;
  category: string;
  status: 'Connected' | 'Not Configured' | 'Error';
}

// Mock data demonstrating what a secure backend API would provide.
// In a real application, this data would be fetched from a secure endpoint
// that verifies user permissions before returning this information.
// The list is focused on a realistic MVP scope.
const mockIntegrationStatuses: IntegrationStatus[] = [
  // Key MVP integrations
  { name: 'Plaid', category: 'Data Aggregator', status: 'Connected' },
  { name: 'Stripe', category: 'Payment Processing', status: 'Connected' },
  { name: 'OpenAI', category: 'AI & Machine Learning', status: 'Not Configured' },
  { name: 'AWS', category: 'Cloud Infrastructure', status: 'Connected' },
  
  // A few other examples to show the concept
  { name: 'Twilio', category: 'Communications', status: 'Not Configured' },
  { name: 'QuickBooks', category: 'Accounting', status: 'Error' },
  { name: 'Mercury', category: 'Banking as a Service', status: 'Connected' },
  { name: 'Unit', category: 'Banking as a Service', status: 'Connected' },
];

const CorporateCommandView: React.FC = () => {
  // In a real implementation, you would use a library like React Query or SWR to fetch this data.
  // Example:
  // const { data: statuses, isLoading, error } = useQuery('integrationStatuses', fetchIntegrationStatuses);

  const getStatusClassName = (status: IntegrationStatus['status']) => {
    switch (status) {
      case 'Connected':
        return 'status-connected';
      case 'Not Configured':
        return 'status-not-configured';
      case 'Error':
        return 'status-error';
      default:
        return '';
    }
  };

  return (
    <div className="settings-container">
      <h1>Integration Status</h1>
      <p className="subtitle">
        This dashboard shows the status of key third-party API integrations.
        <br />
        <strong>Note:</strong> API credentials are managed securely on the server-side and are never exposed here.
      </p>

      <div className="status-table-container">
        <table className="status-table">
          <thead>
            <tr>
              <th>Service Name</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {mockIntegrationStatuses.map((integration) => (
              <tr key={integration.name}>
                <td>{integration.name}</td>
                <td>{integration.category}</td>
                <td>
                  <span className={`status-pill ${getStatusClassName(integration.status)}`}>
                    {integration.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="architectural-note">
        <h3>Architectural Decision</h3>
        <p>
          The previous version of this page, a form for entering API keys, has been removed to eliminate a critical security vulnerability. The correct, secure pattern for a production application is to manage all secrets (API keys, tokens, credentials) in a dedicated secrets manager (e.g., AWS Secrets Manager, HashiCorp Vault, or encrypted environment variables) on the backend.
        </p>
        <p>
          Configuration of these secrets must be performed by authorized personnel with access to the backend environment, never through a client-facing user interface.
        </p>
      </div>
    </div>
  );
};

export default CorporateCommandView;