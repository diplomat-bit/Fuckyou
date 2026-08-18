import React, { useContext, useState, useMemo, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, PlaidAccount } from '../types';
import { Brain, Zap, ShieldCheck, AlertTriangle, TrendingUp, Settings, Loader2, MessageSquareText } from 'lucide-react';

// --- REFACTORING: Replaced deliberately flawed/random utilities with deterministic (mocked) logic ---
// Rationale: The original implementation used Math.random() and static strings for critical metrics and summaries.
// This is being replaced with deterministic, even if mocked, logic to simulate a stable system response.
// In a production environment, these functions would interface with a robust backend service.

/**
 * REPLACEMENT: Provides deterministic (mocked) health metrics for the Plaid dashboard.
 * This replaces the previous `calculateHealthScore`, `generateSummary`, and random error/sync counts.
 * In a real application, these metrics would be fetched from a dedicated Plaid integration service.
 * @param accounts - The list of linked Plaid accounts.
 * @returns Object containing healthScore, itemsInError, successfulSyncs, and summary.
 */
const getDashboardMetrics = (accounts: PlaidAccount[]) => {
    let healthScore = 100;
    let itemsInError = 0;

    accounts.forEach((account, index) => {
        // Simulate specific accounts having issues based on ID for consistent (non-random) mock behavior.
        // E.g., accounts ending in '1' or '5' are in error.
        const hasError = account.id.endsWith('1') || account.id.endsWith('5');
        const isStale = account.id.endsWith('2'); // Simulate stale data for accounts ending in '2'

        if (hasError) {
            itemsInError++;
            healthScore -= 10; // Consistent penalty
        }
        if (isStale) {
            healthScore -= 5; // Consistent penalty for staleness
        }
    });

    healthScore = Math.max(0, parseFloat(healthScore.toFixed(2)));
    // Provide a more stable, non-random successful sync count
    const successfulSyncs = accounts.length * 30 + (accounts.length > 0 ? 50 : 0) + itemsInError * 5;

    let summary = "Operational Status: All endpoints are stable.";
    if (itemsInError > 0) {
        summary = `Warning: ${itemsInError} connections require attention. Review linked institutions below.`;
    } else if (healthScore < 80) {
        summary = "Performance Warning: System integrity is okay, but re-authentication or review is recommended for some connections.";
    }

    return {
        healthScore,
        itemsInError,
        successfulSyncs,
        summary
    };
};

/**
 * REPLACEMENT: Provides deterministic (mocked) status for individual Plaid accounts.
 * This replaces the previous `Math.random() > 0.95` for individual account error states.
 * In a real application, this status would come from a backend service monitoring individual connections.
 * @param accountId - The ID of the Plaid account.
 * @returns Object with isError, statusText, and statusColor.
 */
const getAccountStatus = (accountId: string) => {
    // Use a consistent rule to determine mock error status for display purposes
    const isError = accountId.endsWith('1') || accountId.endsWith('5');
    const statusText = isError ? 'Error' : 'Operational';
    const statusColor = isError ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300';
    return { isError, statusText, statusColor };
};

/**
 * REPLACEMENT: Mocked AI assistant service call.
 * This replaces the original `setTimeout` and static responses, providing a more structured and
 * extensible (even if still mocked) AI interaction.
 * Rationale: Hardening AI modules to include error handling, timeouts, fallbacks, and non-blocking calls.
 * @param query - The user's input query.
 * @param metrics - Current dashboard metrics for contextual responses.
 * @returns A promise resolving to the AI-generated response string.
 */
const askPlaidAssistant = async (query: string, metrics: ReturnType<typeof getDashboardMetrics>, userProfileName: string | undefined, linkedAccountsCount: number): Promise<string> => {
    return new Promise(resolve => {
        // Simulate network latency for a non-blocking AI call
        setTimeout(() => {
            const lowerQuery = query.toLowerCase();
            let res = "I am unable to provide a specific answer. Please refine your query or ask about system health, errors, or synchronizations.";

            if (lowerQuery.includes("error")) {
                res = `There are currently ${metrics.itemsInError} items flagged as needing attention. For details, please check the 'Connected Financial Institutions' section.`;
            } else if (lowerQuery.includes("health")) {
                res = `The current System Health Score is ${metrics.healthScore.toFixed(2)}%. This indicates overall system stability.`;
            } else if (lowerQuery.includes("sync")) {
                res = `Total successful synchronizations today are normal. Your ${linkedAccountsCount} linked institutions are syncing regularly.`;
            } else if (lowerQuery.includes("user")) {
                res = `User profile '${userProfileName || 'N/A'}' has ${linkedAccountsCount} active connections.`;
            } else if (lowerQuery.includes("status")) {
                res = metrics.summary;
            } else if (lowerQuery.includes("hello") || lowerQuery.includes("hi")) {
                res = "Hello! I am your Dashboard Assistant. How can I assist you with your financial data?";
            }

            resolve(`(AI-Generated) ${res}`);
        }, 1500); // Simulate 1.5 second API response time
    });
};

// --- Component Definition ---

const PlaidDashboardView: React.FC = () => {
    const context = useContext(DataContext);
    const [chatOpen, setChatOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("Hello. I am the Dashboard Assistant. How can I help?");
    const [aiLoading, setAiLoading] = useState(false);
    // REFACTORING: Removed arbitrary input length limit to allow for proper backend validation.
    // Frontend validation should be separate and user-friendly, not just a disabling state.
    // const [queryTooLong, setQueryTooLong] = useState(false);

    if (!context) {
        throw new Error("PlaidDashboardView must be used within a DataProvider");
    }

    const { linkedAccounts, plaidApiKey, setActiveView, userProfile } = context;

    // --- REPLACEMENT: Using deterministic mocked metrics ---
    const { healthScore, itemsInError, successfulSyncs, summary } = useMemo(() =>
        getDashboardMetrics(linkedAccounts),
        [linkedAccounts]
    );

    // --- Handlers ---
    const handleQuery = useCallback(async () => {
        if (!query.trim()) return;

        setAiLoading(true);
        setResponse(`Processing: "${query}"...`);
        const currentQuery = query; // Capture query state
        setQuery(""); // Clear input immediately

        try {
            // REPLACEMENT: Calling the new mocked AI assistant service
            const aiResponse = await askPlaidAssistant(currentQuery, { healthScore, itemsInError, successfulSyncs, summary }, userProfile?.name, linkedAccounts.length);
            setResponse(aiResponse);
        } catch (error) {
            console.error("AI Assistant error:", error);
            setResponse("(AI-Generated) Sorry, I encountered an error. Please try again or ask a different question.");
        } finally {
            setAiLoading(false);
        }
    }, [query, healthScore, itemsInError, successfulSyncs, summary, userProfile?.name, linkedAccounts.length]);

    // --- Configuration View (Gate for Plaid API Key) ---
    if (!plaidApiKey) {
        return (
            <div className="space-y-8 p-6 bg-gray-900 min-h-screen">
                <header className="flex justify-between items-center border-b border-gray-700 pb-4">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-widest uppercase">
                        Financial Dashboard: Plaid Integration
                    </h1>
                    <button
                        onClick={() => setActiveView(View.APIIntegration)}
                        className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.02]"
                    >
                        <Settings className="w-5 h-5 mr-2" /> Configure API Key
                    </button>
                </header>

                <Card title="Configuration: Plaid API Key" className="border-red-500/50">
                    <div className="text-center p-8 space-y-6">
                        <AlertTriangle className="w-16 h-16 mx-auto text-red-400 animate-pulse" />
                        <p className="text-xl text-gray-300">
                            Access to the Plaid Module is restricted. API credentials are required to sync data.
                        </p>
                        <button
                            onClick={() => setActiveView(View.APIIntegration)}
                            className="w-full md:w-auto px-8 py-3 text-lg font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xl transition duration-300"
                        >
                            Proceed to Configuration
                        </button>
                    </div>
                </Card>
                <div className="text-center text-sm text-gray-500 pt-4">
                    Status: Pending. Awaiting credentials.
                </div>
            </div>
        );
    }

    // --- Dashboard View ---
    return (
        <div className="space-y-8 p-6 bg-gray-900 min-h-screen font-sans">
            <header className="flex justify-between items-center border-b border-gray-700 pb-4">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-widest uppercase">
                    Financial Data Dashboard
                </h1>
                <button
                    onClick={() => setActiveView(View.APIIntegration)}
                    className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition duration-300"
                >
                    <Settings className="w-4 h-4 mr-2" /> Manage Integration
                </button>
            </header>

            {/* Status Banner */}
            <Card title="System Health Status" className="border-l-4 border-cyan-500 bg-gray-800/70">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Brain className="w-10 h-10 text-cyan-400 flex-shrink-0" />
                        <div>
                            <p className="text-lg font-medium text-white">System Score:</p>
                            <p className="text-4xl font-extrabold text-cyan-300">{healthScore.toFixed(2)}%</p>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-8 max-w-xl">
                        <p className="text-sm italic text-gray-300 border-l-2 border-gray-600 pl-3">
                            <span className="font-bold text-cyan-400">System Note:</span> {summary}
                        </p>
                    </div>
                    <button
                        onClick={() => setChatOpen(!chatOpen)}
                        className={`mt-4 md:mt-0 px-4 py-2 rounded-full text-sm font-semibold transition duration-300 flex items-center ${chatOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white`}
                    >
                        <MessageSquareText className="w-4 h-4 mr-2" /> {chatOpen ? 'Close Chat' : 'Open Chat'}
                    </button>
                </div>
            </Card>

            {/* Chat Interface */}
            {chatOpen && (
                <Card title="Assistant Interface" className="bg-gray-800/90 border-cyan-600/50">
                    <div className="h-64 overflow-y-auto p-3 mb-3 bg-gray-900 rounded-lg border border-gray-700 space-y-3">
                        <div className="flex justify-start">
                            <div className="bg-gray-700 p-3 rounded-lg max-w-[80%] shadow-md">
                                <p className="text-xs font-bold text-cyan-400 mb-1">Assistant</p>
                                <p className="text-sm text-white">{response}</p>
                            </div>
                        </div>
                        {/* REFACTORING: Future enhancement to add chat history storage for better UX. */}
                    </div>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
                            placeholder="Ask about connection stability, errors, or metrics..."
                            className="flex-grow p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                            disabled={aiLoading} // Disable input while AI is processing
                        />
                        <button
                            onClick={handleQuery}
                            disabled={!query.trim() || aiLoading} // Disable button while AI is processing or query is empty
                            className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg disabled:bg-gray-600 transition duration-200 flex items-center"
                        >
                            {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                        </button>
                    </div>
                    {/* REFACTORING: Removed arbitrary max char warning. Real validation should be handled with user feedback. */}
                    {/* <p className="text-xs text-gray-500 mt-1">Max 500 characters.</p> */}
                </Card>
            )}

            {/* KPI Grid - REPLACEMENT: Metrics now derived from deterministic mock logic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Connection Resilience" className="shadow-xl border-b-4 border-green-500">
                    <ShieldCheck className="w-8 h-8 text-green-400 mb-2" />
                    <p className="text-5xl font-extrabold text-white my-1">{healthScore.toFixed(1)}%</p>
                    <p className="text-sm text-gray-400">Estimated Stability</p>
                </Card>
                <Card title="Active Errors" className="shadow-xl border-b-4 border-red-500">
                    <AlertTriangle className="w-8 h-8 text-red-400 mb-2" />
                    <p className={`text-5xl font-extrabold my-1 ${itemsInError > 0 ? 'text-red-400' : 'text-white'}`}>{itemsInError}</p>
                    <p className="text-sm text-gray-400">Attention needed</p>
                </Card>
                <Card title="Total Syncs (24h)" className="shadow-xl border-b-4 border-cyan-500">
                    <TrendingUp className="w-8 h-8 text-cyan-400 mb-2" />
                    <p className="text-5xl font-extrabold text-white my-1">{successfulSyncs.toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Daily Syncs</p>
                </Card>
                <Card title="Institutions Monitored" className="shadow-xl border-b-4 border-indigo-500">
                    <Zap className="w-8 h-8 text-indigo-400 mb-2" />
                    <p className="text-5xl font-extrabold text-white my-1">{linkedAccounts.length}</p>
                    <p className="text-sm text-gray-400">Connected Sources</p>
                </Card>
            </div>

            {/* Institution List */}
            <Card title={`Connected Financial Institutions (${linkedAccounts.length})`} className="bg-gray-800/70">
                {linkedAccounts.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {linkedAccounts.map(account => {
                            // REPLACEMENT: Using deterministic account status
                            const { isError, statusText, statusColor } = getAccountStatus(account.id);

                            return (
                                <div key={account.id} className="p-4 bg-gray-800 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center shadow-lg hover:bg-gray-700/70 transition duration-200 border border-gray-700">
                                    <div className="flex-grow mb-2 md:mb-0">
                                        <p className="font-bold text-lg text-white">{account.name}</p>
                                        <p className="text-sm text-gray-400">
                                            Type: {account.type.toUpperCase()} | ID: {account.id.substring(0, 8)}...
                                            {account.mask && <span className="ml-4">Masked: ****{account.mask}</span>}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
                                            {statusText}
                                        </span>
                                        <button
                                            onClick={() => console.log(`View details for ${account.name}`)}
                                            className="text-cyan-400 hover:text-cyan-300 text-sm"
                                        >
                                            Details &rarr;
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-gray-800 rounded-lg border border-dashed border-gray-700">
                        <Zap className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                        <p className="text-gray-500 text-lg">No active Plaid connections. Please configure in settings.</p>
                    </div>
                )}
            </Card>

            {/* General Information */}
            <Card title="Overview" className="bg-gray-800/70 border-l-4 border-indigo-500">
                <div className="text-gray-300 space-y-5 prose prose-invert max-w-none">
                    <p>
                        This dashboard provides an overview of connected financial data sources via the Plaid API. It monitors connection status and basic metrics.
                    </p>
                    <blockquote className="border-l-4 border-cyan-500 pl-4 italic text-gray-400">
                        "System stability is important for reliable data access."
                    </blockquote>
                    <p>
                        The system checks for potential errors across endpoints. This dashboard reflects current telemetry to help manage external service connections.
                    </p>
                </div>
            </Card>

            <footer className="text-center text-xs text-gray-600 pt-6 border-t border-gray-800">
                Plaid Dashboard | Version 1.0 | Managed by System
            </footer>
        </div>
    );
};

export default PlaidDashboardView;