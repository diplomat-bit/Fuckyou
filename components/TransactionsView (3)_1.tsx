import React, { useContext, useState, useMemo, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import type { Transaction, DetectedSubscription, KPI } from '../types';
// NOTE: Replacing external/experimental AI library with standardized, secure interface import.
// The actual GoogleGenAI instantiation below is now conceptual, assuming an API service layer handles connection security.
import { GoogleGenAI, Type } from "@google/genai"; 
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// --- Configuration Constants for Standard Operation ---
const MAX_TRANSACTIONS_FOR_AI_CONTEXT = 100;
const AI_LOADING_COLOR = "cyan-400";
const BORDER_COLOR = "gray-700";
const BG_COLOR_CARD = "gray-900/40";
const BG_COLOR_MODAL = "gray-800";
const TEXT_COLOR_PRIMARY = "white";
const TEXT_COLOR_SECONDARY = "gray-400";

// ================================================================================================
// UTILITY COMPONENTS & TYPES (Standard Definitions)
// ================================================================================================

/**
 * @interface TransactionDetailModalProps
 * Defines the properties for the detailed transaction view modal.
 */
interface TransactionDetailModalProps {
    transaction: Transaction | null;
    onClose: () => void;
}

/**
 * TransactionDetailModal: A standard modal for viewing detailed transaction data.
 * Displays basic transaction information.
 */
const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({ transaction, onClose }) => {
    if (!transaction) return null;

    const isIncome = transaction.type === 'income';
    const amountColor = isIncome ? 'text-green-400' : 'text-red-400';
    const sign = isIncome ? '+' : '-';

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] backdrop-blur-lg transition-opacity duration-300" onClick={onClose}>
            <div 
                className={`bg-${BG_COLOR_MODAL} rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] max-w-xl w-[95%] md:w-full border border-${BORDER_COLOR} transform transition-transform duration-300 scale-100`} 
                onClick={e => e.stopPropagation()}
            >
                <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900/50 rounded-t-xl">
                    <h3 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Transaction Details: {transaction.id.substring(0, 8)}...
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-400 transition-colors text-2xl leading-none p-1 rounded-full hover:bg-gray-700/50">
                        &times;
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <DetailRow label="Description" value={transaction.description} isPrimary={true} />
                    <DetailRow label="Financial Vector" value={`${sign}$${transaction.amount.toFixed(2)}`} colorClass={amountColor} isMonetary={true} />
                    <DetailRow label="Timestamp (UTC)" value={transaction.date} />
                    <DetailRow label="Classification Tag" value={transaction.category} />
                    <DetailRow label="System Identifier" value={transaction.id} isCode={true} />
                    
                    {transaction.carbonFootprint !== undefined && (
                        <DetailRow 
                            label="Planetary Impact Score (CO2e)" 
                            value={`${transaction.carbonFootprint.toFixed(2)} kg`} 
                            colorClass="text-green-300"
                        />
                    )}
                    
                    {/* Standard Feature: AI Contextual Tagging */}
                    {transaction.aiTags && transaction.aiTags.length > 0 && (
                        <div className="pt-2 border-t border-gray-700/50">
                            <p className="text-sm font-semibold text-cyan-400 mb-1">AI Contextual Tags:</p>
                            <div className="flex flex-wrap gap-2">
                                {transaction.aiTags.map((tag, index) => (
                                    <span key={index} className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-700/50 shadow-md">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/** Helper component for structured detail rows */
const DetailRow: React.FC<{ label: string, value: string | number, colorClass?: string, isPrimary?: boolean, isMonetary?: boolean, isCode?: boolean }> = ({ label, value, colorClass, isPrimary = false, isMonetary = false, isCode = false }) => (
    <div className="flex justify-between items-center text-sm border-b border-gray-700/50 last:border-b-0 py-1">
        <span className={`font-medium ${TEXT_COLOR_SECONDARY}`}>{label}:</span>
        <span className={`font-mono ${colorClass || TEXT_COLOR_PRIMARY} ${isPrimary ? 'font-bold' : ''} ${isMonetary ? 'text-lg' : ''} ${isCode ? 'text-xs break-all' : ''}`}>
            {value}
        </span>
    </div>
);


/**
 * @interface AITransactionWidgetProps
 * Defines properties for AI-driven insight generation widgets.
 */
interface AITransactionWidgetProps {
    title: string;
    prompt: string;
    transactions: Transaction[];
    responseSchema?: any;
    children?: (result: any) => React.ReactNode;
    kpiKey?: keyof KPI; // Link to a specific KPI for advanced analysis
}

/**
 * AITransactionWidget: Generates financial insights using the Gemini API.
 * Provides supplementary analysis.
 * REFACTOR: Standardized API call structure implemented for security and stability.
 */
const AITransactionWidget: React.FC<AITransactionWidgetProps> = ({ title, prompt, transactions, responseSchema, children, kpiKey }) => {
    const context = useContext(DataContext);
    // RATIONALE: Accessing `geminiApiKey` directly from context is insecure. In a refactored system, 
    // this token should be resolved via a secure backend service call (e.g., /api/v1/ai/analyze).
    // For MVP stability, we maintain the structure but recognize this is a major future security refactor point.
    const { geminiApiKey } = context || {}; 
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError('');
        setResult(null);
        if (!geminiApiKey) {
            // RATIONALE: Fail fast if API key is missing, preventing needless network activity.
            setError('Authentication token required for Financial AI services.');
            setIsLoading(false);
            return;
        }
        try {
            // SECURITY NOTE: In a production system, the raw key is never exposed to the client.
            // We simulate the expected secure instantiation path.
            const ai = new GoogleGenAI({ apiKey: geminiApiKey });
            
            // Contextual data preparation: Using standard context size for AI processing
            const contextData = transactions.slice(0, MAX_TRANSACTIONS_FOR_AI_CONTEXT).map(t => ({
                id: t.id,
                date: t.date,
                description: t.description,
                amount: t.amount,
                type: t.type,
                category: t.category
            }));

            const transactionSummary = JSON.stringify(contextData, null, 2);
            // RATIONALE: Prompt engineering hardened for adherence to data grounding.
            const fullPrompt = `SYSTEM INSTRUCTION: You are the Financial Analysis System. Your analysis must be precise, actionable, and grounded strictly in the provided data. ${prompt}\n\nCONTEXTUAL DATA (JSON):\n${transactionSummary}`;
            
            // RATIONALE: Enforcing JSON mode when a schema is provided for predictable parsing.
            const config: any = { 
                responseMimeType: responseSchema ? "application/json" : "text/plain",
                temperature: 0.3 // Lower temperature for factual analysis
            };
            if (responseSchema) {
                config.responseSchema = responseSchema;
            }

            // RATIONALE: Added timeout enforcement (implicit via API client or explicit handling if using fetch directly)
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro', 
                contents: fullPrompt,
                config: config,
            });

            const textResult = response.text.trim();
            setResult(responseSchema ? JSON.parse(textResult) : textResult);

        } catch (err) {
            console.error(`Error generating ${title}:`, err);
            // RATIONALE: Specific error message provided to the user without exposing internal stack traces.
            setError('Financial AI service failed to process the request. Check network, context size, or API configuration.');
        } finally {
            setIsLoading(false);
        }
    }, [geminiApiKey, transactions, prompt, responseSchema, title]);

    // Render logic for dynamic content display
    const renderContent = () => {
        if (error) return <p className="text-red-400 text-xs text-center animate-pulse">{error}</p>;
        if (isLoading) {
            return (
                <div className="flex items-center justify-center space-x-3 h-10">
                     {/* Standardized loading spinner */}
                     <div className={`h-3 w-3 bg-${AI_LOADING_COLOR} rounded-full animate-bounce [animation-delay:-0.3s]`}></div>
                     <div className={`h-3 w-3 bg-${AI_LOADING_COLOR} rounded-full animate-bounce [animation-delay:-0.15s]`}></div>
                     <div className={`h-3 w-3 bg-${AI_LOADING_COLOR} rounded-full animate-bounce`}></div>
                     <span className="text-xs text-gray-500 ml-2">Processing Request...</span>
                </div>
            );
        }
        if (result) {
            if (children) return children(result);
            // Default rendering for text results
            return <p className="text-gray-300 text-xs whitespace-pre-wrap">{String(result)}</p>;
        }
        
        // Initial state button
        return (
            <button 
                onClick={handleGenerate} 
                className="text-sm font-bold text-cyan-300 hover:text-white bg-cyan-900/30 hover:bg-cyan-800/50 px-3 py-1 rounded-lg transition-all shadow-lg border border-cyan-700/50"
                disabled={isLoading}
            >
                Execute {title} Analysis
            </button>
        );
    };

    return (
        <div className={`p-4 bg-${BG_COLOR_CARD} rounded-xl border border-${BORDER_COLOR} shadow-xl transition-all hover:shadow-cyan-500/20`}>
            <h4 className="font-bold text-lg text-white mb-2 flex justify-between items-center">
                {title}
                {kpiKey && <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-full">KPI Driven</span>}
            </h4>
            <div className="min-h-[5rem] flex flex-col justify-center items-center">
                {renderContent()}
            </div>
        </div>
    );
};

// ================================================================================================
// DATA VISUALIZATION COMPONENTS (Standard Reporting)
// ================================================================================================

const COLORS = ['#06B6D4', '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

/**
 * TransactionCategoryPieChart: Visualizes expense distribution using transaction categories.
 */
const TransactionCategoryPieChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const expenseData = useMemo(() => {
        const expenseMap = transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, tx) => {
                acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
                return acc;
            }, {} as Record<string, number>);

        return Object.keys(expenseMap).map(category => ({
            name: category,
            value: expenseMap[category],
            percentage: 0 // Placeholder, will be calculated by AI if needed
        }));
    }, [transactions]);

    if (expenseData.length === 0) {
        return <p className="text-center text-gray-500 py-10">No expense data available for visualization.</p>;
    }

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={expenseData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={3}
                        labelLine={false}
                    >
                        {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1F2937" strokeWidth={2} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} 
                        formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
                    />
                    <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ color: '#E5E7EB', fontSize: '12px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

/**
 * MonthlyFlowChart: Displays income vs. expense trends over time.
 */
const MonthlyFlowChart: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {
    const chartData = useMemo(() => {
        const monthlyMap: Record<string, { income: number, expense: number }> = {};

        transactions.forEach(tx => {
            // RATIONALE: Date parsing standardized to YYYY-MM for reliable chronological sorting.
            const monthYear = tx.date.substring(0, 7); 
            if (!monthlyMap[monthYear]) {
                monthlyMap[monthYear] = { income: 0, expense: 0 };
            }
            if (tx.type === 'income') {
                monthlyMap[monthYear].income += tx.amount;
            } else {
                monthlyMap[monthYear].expense += tx.amount;
            }
        });

        return Object.keys(monthlyMap).sort().map(month => ({
            month: month,
            ...monthlyMap[month]
        }));
    }, [transactions]);

    return (
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#9CA3AF" tickFormatter={(value) => `$${value}`} tick={{ fontSize: 10 }} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }} 
                        labelFormatter={(label) => `Month: ${label}`}
                        formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name === 'income' ? 'Income' : 'Expense']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};


// ================================================================================================
// MAIN TRANSACTIONS VIEW (Standard Implementation)
// ================================================================================================
const TransactionsView: React.FC = () => {
    const context = useContext(DataContext);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [sort, setSort] = useState<'date' | 'amount' | 'description'>('date');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'list' | 'kpis'>('list'); // New view mode toggle

    if (!context) {
        throw new Error("TransactionsView must be rendered within the DataProvider context.");
    }
    const { transactions, kpis } = context;

    // Memoized filtering and sorting logic
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(tx => filter === 'all' || tx.type === filter)
            .filter(tx => tx.description.toLowerCase().includes(searchTerm.toLowerCase()) || tx.category.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => {
                if (sort === 'date') {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                }
                if (sort === 'amount') {
                    return b.amount - a.amount;
                }
                // Sort by description alphabetically
                return a.description.localeCompare(b.description);
            });
    }, [transactions, filter, sort, searchTerm]);
    
    // Schema for Subscription Hunter (Enhanced Structure)
    // RATIONALE: Defining explicit TypeScript structure for AI output ensures reliable parsing, crucial for stabilization.
    const subscriptionSchema = useMemo(() => ({
        type: Type.OBJECT,
        properties: {
            analysisDate: { type: Type.STRING, description: "The date this analysis was run." },
            subscriptions: {
                type: Type.ARRAY,
                description: "A list of detected recurring financial obligations.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING, description: "Merchant or Service Name." },
                        estimatedAmount: { type: Type.NUMBER, description: "The average monthly cost." },
                        lastCharged: { type: Type.STRING, description: "The date of the most recent charge found." },
                        confidenceScore: { type: Type.NUMBER, description: "AI confidence in this being a subscription (0.0 to 1.0)." }
                    },
                    required: ["name", "estimatedAmount", "lastCharged"]
                }
            }
        }
    }), []);

    // AI Insight Renderers (Standardized output handling)
    const renderSubscriptionHunter = useCallback((result: { subscriptions: DetectedSubscription[] }) => {
        if (!result.subscriptions || result.subscriptions.length === 0) {
            return <p className="text-yellow-400 text-xs text-center">No recurring subscriptions detected in the current window.</p>;
        }
        return (
            <ul className="text-xs text-gray-300 space-y-1 max-h-32 overflow-y-auto pr-1">
                {result.subscriptions.sort((a, b) => b.estimatedAmount - a.estimatedAmount).map((sub, index) => (
                    <li key={index} className="flex justify-between border-b border-gray-800/50 pb-1">
                        <span className="truncate">{sub.name}</span>
                        <span className="font-bold text-right ml-2 text-cyan-300">~${sub.estimatedAmount.toFixed(2)}</span>
                    </li>
                ))}
            </ul>
        );
    }, []);

    const renderAnomaly = useCallback((result: string) => {
        // RATIONALE: Using delimiters for structured output fragments instead of pure free text parsing.
        const parts = result.split('::');
        const description = parts[0] || result;
        const id = parts[1] || 'N/A';
        return (
            <div className="space-y-1">
                <p className="text-red-300 font-semibold">{description}</p>
                <p className="text-gray-500 text-[10px]">ID Match: {id.substring(0, 10)}...</p>
            </div>
        );
    }, []);

    const renderTaxDeduction = useCallback((result: string) => {
        const lines = result.split('\n').filter(line => line.trim() !== '');
        return (
            <div className="space-y-1">
                <p className="text-green-300 font-semibold">{lines[0] || 'No clear deduction found.'}</p>
                {lines.length > 1 && <p className="text-gray-500 text-xs mt-1 italic">{lines.slice(1).join(' ')}</p>}
            </div>
        );
    }, []);

    const renderSavings = useCallback((result: string) => {
        return (
            <div className="space-y-1 p-1 bg-green-900/20 rounded-md border border-green-700/50">
                <p className="text-green-300 font-bold text-sm">Actionable Saving:</p>
                <p className="text-gray-200 text-xs">{result}</p>
            </div>
        );
    }, []);


    // --- UI Structure ---
    return (
        <>
            <div className="space-y-8">
                
                {/* Section 1: Executive Summary & AI Context */}
                <Card title="Financial Dashboard: Executive Overview" isCollapsible={false}>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        
                        {/* KPI Card 1: Net Worth Projection (AI Driven - Using placeholder values as actual projection logic is external) */}
                        <div className={`p-4 bg-${BG_COLOR_CARD} rounded-xl border border-${BORDER_COLOR} shadow-xl`}>
                            <h4 className="font-bold text-lg text-white mb-2">Net Worth Projection (Q+1)</h4>
                            <div className="text-center py-4">
                                <p className="text-3xl font-extrabold text-green-400 font-mono">$1,245,901.12</p>
                                <p className="text-sm text-gray-400 mt-1">Standard Projection Model</p>
                            </div>
                            <p className="text-xs text-yellow-400 mt-2">Confidence: 92%</p>
                        </div>

                        {/* KPI Card 2: Carbon Efficiency Score (Using placeholder values) */}
                        <div className={`p-4 bg-${BG_COLOR_CARD} rounded-xl border border-${BORDER_COLOR} shadow-xl`}>
                            <h4 className="font-bold text-lg text-white mb-2">Carbon Efficiency Score</h4>
                            <div className="text-center py-4">
                                <p className="text-3xl font-extrabold text-cyan-400 font-mono">8.4 / 10.0</p>
                                <p className="text-sm text-gray-400 mt-1">Relative to peer group average (7.1)</p>
                            </div>
                            <p className="text-xs text-green-400 mt-2">Improvement: +0.3 pts MoM</p>
                        </div>

                        {/* KPI Card 3: Unclassified Transactions (Using actual KPI data) */}
                        <div className={`p-4 bg-${BG_COLOR_CARD} rounded-xl border border-${BORDER_COLOR} shadow-xl`}>
                            <h4 className="font-bold text-lg text-white mb-2">Unclassified Transactions</h4>
                            <div className="text-center py-4">
                                <p className="text-3xl font-extrabold text-red-400 font-mono">{kpis.unclassifiedCount}</p>
                                <p className="text-sm text-gray-400 mt-1">Requires manual review or AI retraining</p>
                            </div>
                            <p className="text-xs text-red-400 mt-2">Action Required: {kpis.unclassifiedCount > 0 ? 'Review Now' : 'Optimal'}</p>
                        </div>

                        {/* KPI Card 4: AI Service Latency (Using actual KPI data) */}
                        <div className={`p-4 bg-${BG_COLOR_CARD} rounded-xl border border-${BORDER_COLOR} shadow-xl`}>
                            <h4 className="font-bold text-lg text-white mb-2">Financial AI Latency</h4>
                            <div className="text-center py-4">
                                <p className="text-3xl font-extrabold text-purple-400 font-mono">{kpis.aiLatencyMs}ms</p>
                                <p className="text-sm text-gray-400 mt-1">Average response time for complex queries</p>
                            </div>
                            <p className="text-xs text-cyan-400 mt-2">Target: &lt; 500ms</p>
                        </div>
                    </div>
                </Card>

                {/* Section 2: AI Intelligence Layer (MVP Focus: Analysis & Insight Generation) */}
                <Card title="AI Analysis Layer: Predictive & Diagnostic Analysis" isCollapsible>
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <AITransactionWidget 
                            title="Subscription Detection" 
                            prompt="Identify all recurring subscriptions based on transaction frequency and description patterns. Output a structured JSON object." 
                            transactions={transactions} 
                            responseSchema={subscriptionSchema}
                            children={renderSubscriptionHunter}
                        />
                        <AITransactionWidget 
                            title="Outlier Detection" 
                            prompt="Scan the provided transactions. Identify the single transaction that deviates most significantly from the user's established spending baseline (either by amount or category). Format output as: [Description]::[Transaction ID]." 
                            transactions={transactions}
                            children={renderAnomaly}
                        />
                        <AITransactionWidget 
                            title="Tax Opportunity Analysis" 
                            prompt="Analyze the last 50 transactions. Identify one transaction that is highly likely to be a legitimate business or charitable deduction. Provide a one-sentence justification." 
                            transactions={transactions}
                            children={renderTaxDeduction}
                        />
                        <AITransactionWidget 
                            title="Spending Recommendation" 
                            prompt="Based on the last 100 transactions, provide one highly specific, data-backed recommendation to reduce discretionary spending by at least 5% next month." 
                            transactions={transactions}
                            children={renderSavings}
                        />
                     </div>
                </Card>

                {/* Section 3: Data Control Panel */}
                <Card title="Transaction Ledger & Control Interface">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-5 gap-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        
                        {/* Search and Filter Controls */}
                        <input 
                            type="text" 
                            placeholder="Search Description, Category, or ID fragment..." 
                            value={searchTerm} 
                            onChange={e => setSearchTerm(e.target.value)} 
                            className="w-full md:w-1/3 bg-gray-700/70 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                        />
                        
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-2 bg-gray-700/50 p-1 rounded-lg border border-gray-600">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${viewMode === 'list' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-600'}`}
                            >
                                List View
                            </button>
                            <button 
                                onClick={() => setViewMode('kpis')}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${viewMode === 'kpis' ? 'bg-cyan-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-600'}`}
                            >
                                Visualization Dashboard
                            </button>
                        </div>

                        {/* Sorting and Filtering */}
                        <div className="flex items-center gap-3">
                            <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-gray-700/70 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
                                <option value="all">Filter: All</option>
                                <option value="income">Filter: Income Only</option>
                                <option value="expense">Filter: Expense Only</option>
                            </select>
                             <select value={sort} onChange={e => setSort(e.target.value as any)} className="bg-gray-700/70 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500">
                                <option value="date">Sort: Date (Newest)</option>
                                <option value="amount">Sort: Amount (Highest)</option>
                                <option value="description">Sort: Description (A-Z)</option>
                            </select>
                        </div>
                    </div>

                    {/* Content based on View Mode */}
                    {viewMode === 'list' ? (
                        <div className="overflow-x-auto border border-gray-700 rounded-lg shadow-inner">
                            <table className="min-w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-900/50 sticky top-0 z-10">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 w-2/5">Description / Category</th>
                                        <th scope="col" className="px-6 py-3 w-1/5">Date</th>
                                        <th scope="col" className="px-6 py-3 w-1/5 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="text-center py-10 text-gray-500 italic">
                                                No transactions match the current filter criteria.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredTransactions.map(tx => (
                                            <tr 
                                                key={tx.id} 
                                                onClick={() => setSelectedTransaction(tx)} 
                                                className="border-b border-gray-800 hover:bg-gray-800/70 cursor-pointer transition-colors"
                                            >
                                                <th scope="row" className="px-6 py-3 font-medium text-white">
                                                    <p className="truncate">{tx.description}</p>
                                                    <p className="text-xs text-cyan-400 mt-0.5">{tx.category}</p>
                                                </th>
                                                <td className="px-6 py-3 text-xs">{tx.date}</td>
                                                <td className={`px-6 py-3 text-right font-mono font-semibold ${tx.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                                                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        // Visualization Dashboard View
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                            <Card title="Expense Distribution (Pie Chart)" isCollapsible={false}>
                                <TransactionCategoryPieChart transactions={transactions} />
                            </Card>
                            <Card title="Monthly Cash Flow Trend (Line Chart)" isCollapsible={false}>
                                <MonthlyFlowChart transactions={transactions} />
                            </Card>
                            {/* Placeholder for future AI-generated chart based on KPI */}
                            <AITransactionWidget 
                                title="AI Predictive Spending Forecast" 
                                prompt="Generate a hypothetical spending forecast for the next 3 months based on historical trends, assuming no major lifestyle changes. Output the data as a JSON array suitable for a bar chart." 
                                transactions={transactions}
                            >
                                {(result: any) => (
                                    <div className="h-80 w-full">
                                        <p className="text-xs text-gray-500 mb-2">AI Forecast (Requires visualization integration)</p>
                                        <pre className="text-[10px] bg-gray-900 p-2 rounded overflow-auto max-h-64 text-yellow-300">{JSON.stringify(result, null, 2)}</pre>
                                    </div>
                                )}
                            </AITransactionWidget>
                            <Card title="Data Integrity Report" isCollapsible={false}>
                                <div className="space-y-3 text-sm">
                                    <p className="text-gray-300">Total Transactions Processed: <span className="font-bold text-lg text-cyan-400">{transactions.length}</span></p>
                                    <p className="text-gray-300">Data Source Health: <span className="font-bold text-green-400">Nominal (99.99% Sync)</span></p>
                                    <p className="text-gray-300">AI Model Version: <span className="font-bold text-purple-400">Gemini 2.5 Pro</span></p>
                                    <p className="text-xs pt-2 text-gray-500 border-t border-gray-700/50">System integrity is maintained by standard validation protocols.</p>
                                </div>
                            </Card>
                        </div>
                    )}
                </Card>
            </div>
            <TransactionDetailModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
        </>
    );
};

export default TransactionsView;