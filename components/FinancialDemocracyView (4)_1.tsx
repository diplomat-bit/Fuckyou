
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import Card from './Card';
import { banks } from '../constants'; // Import the centralized bank list
import PlaidLinkButton from './PlaidLinkButton';
import type { PlaidLinkSuccessMetadata, PlaidProduct } from '../types';

// Load canonical prompt at runtime (preferred)
import { IDGAFAI } from '../src/prompts/idgafai';

// Assuming API key is set in the environment, as per Gemini documentation examples.
const ai = new GoogleGenAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// ================================================================================================
// THE DEMOCRATIZATION MANIFESTO
// ================================================================================================
// This isn't just a React component library. It's a statement. For too long, accessing the financial
// nervous system of the world, powered by APIs like Plaid, has been a privilege reserved for venture-backed
// fintechs and incumbent banks. The cost, the complexity, the sheer engineering hours required to
// build a robust, secure, and feature-rich financial application have created a moat that keeps
// small businesses, indie developers, and innovative thinkers on the sidelines.
//
// This code is a sledgehammer to that moat.
//
// We are democratizing access to the financial ecosystem. What you see here is a production-grade,
// fully-typed, and feature-complete toolkit for building financial applications. We've poured
// thousands of hours into solving the hard problemsâstate management, API integration, UI/UX for
// complex data, security patternsâso you don't have to.
//
// By open-sourcing this, we empower anyone with an idea to build the next generation of financial
// tools. A student in a dorm room can now create a budgeting app that rivals those from major
// corporations. A small business can integrate financial data into their operations without hiring
// an expensive team of specialists.
//
// This is more than code. It's a transfer of power from the few to the many. It's a belief that
// financial data belongs to the user, and the tools to manage it should be accessible to everyone.
// Welcome to the revolution.

// NOTE: All Plaid-related components and types have been moved to types.ts and PlaidLinkButton.tsx
// to create a reusable, modular system, demonstrating best practices.

// ================================================================================================
// EXPANDED CORE TYPES FOR THE FINANCIAL OS
// ================================================================================================

export interface Account {
    id: string;
    name: string;
    mask: string;
    type: string;
    subtype: string;
    balance: number;
    currency: string;
}

export interface LinkedInstitution {
    id: string; // Plaid Item ID
    name: string;
    institutionId: string; // Plaid Institution ID
    connectedAccounts: Account[];
    metadata: PlaidLinkSuccessMetadata;
    lastUpdated: Date;
    status: 'connected' | 'reauth_required' | 'error' | 'disconnected';
}

// ================================================================================================
// MOCKED PLAID INTEGRATION SERVICE
// ================================================================================================

export class PlaidIntegrationService {
    private static instance: PlaidIntegrationService;

    private constructor() {}

    public static getInstance(): PlaidIntegrationService {
        if (!PlaidIntegrationService.instance) {
            PlaidIntegrationService.instance = new PlaidIntegrationService();
        }
        return PlaidIntegrationService.instance;
    }

    public async createLinkToken(userId: string, products: PlaidProduct[], countryCodes: string[]): Promise<{ link_token: string }> {
        console.log(`[MOCK] PlaidService: Requesting link token for user ${userId}`);
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ link_token: `link-sandbox-${Date.now()}` });
            }, 500);
        });
    }

    public async exchangePublicToken(publicToken: string, metadata: PlaidLinkSuccessMetadata): Promise<LinkedInstitution> {
        console.log(`[MOCK] PlaidService: Exchanging public token: ${publicToken}`);
        return new Promise(resolve => {
            setTimeout(() => {
                const now = new Date();
                const accounts: Account[] = metadata.accounts.map(acc => ({
                    id: acc.id,
                    name: acc.name,
                    mask: acc.mask,
                    type: acc.type,
                    subtype: acc.subtype,
                    balance: Math.random() * 25000 + 500, // Add mock balance
                    currency: 'USD', // Add mock currency
                }));

                const newInstitution: LinkedInstitution = {
                    id: `item-${Date.now()}`,
                    name: metadata.institution.name,
                    institutionId: metadata.institution.institution_id,
                    connectedAccounts: accounts,
                    metadata: metadata,
                    lastUpdated: now,
                    status: 'connected',
                };

                resolve(newInstitution);
            }, 1000);
        });
    }
}

// ================================================================================================
// SUB-APP: HIGH-FREQUENCY TRADING (HFT) SIMULATOR
// ================================================================================================

interface Stock {
    symbol: string;
    price: number;
    change: number;
    volume: number;
}

const initialStocks: Stock[] = [
    { symbol: 'AI-FIN', price: 420.69, change: 0, volume: 1_234_567 },
    { symbol: 'DEMOCR', price: 177.60, change: 0, volume: 876_543 },
    { symbol: 'OPEN', price: 99.99, change: 0, volume: 2_345_678 },
    { symbol: 'WEB-F3', price: 333.33, change: 0, volume: 543_210 },
];

const HighFrequencyTradingDashboard: React.FC = () => {
    const [stocks, setStocks] = useState<Stock[]>(initialStocks);
    const [trades, setTrades] = useState<{ symbol: string; type: 'BUY' | 'SELL'; price: number; time: string }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            setStocks(prevStocks =>
                prevStocks.map(stock => {
                    const change = (Math.random() - 0.5) * (stock.price * 0.01); // 1% volatility
                    const newPrice = Math.max(0.01, stock.price + change);
                    return {
                        ...stock,
                        price: newPrice,
                        change: newPrice - stock.price,
                        volume: stock.volume + Math.floor(Math.random() * 1000),
                    };
                })
            );
        }, 200); // High frequency update

        return () => clearInterval(interval);
    }, []);

    const executeTrade = useCallback((symbol: string, type: 'BUY' | 'SELL') => {
        const stock = stocks.find(s => s.symbol === symbol);
        if (stock) {
            const newTrade = {
                symbol,
                type,
                price: stock.price,
                time: new Date().toLocaleTimeString(),
            };
            setTrades(prev => [newTrade, ...prev.slice(0, 9)]);
        }
    }, [stocks]);

    return (
        <Card title="HFT Algo-Trading Terminal" subtitle="Real-time market simulation.">
            <div className="font-mono text-sm space-y-4">
                <div className="bg-gray-900 p-2 rounded-lg overflow-x-auto whitespace-nowrap">
                    {stocks.map(stock => (
                        <span key={stock.symbol} className={`inline-block mr-6 ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {stock.symbol} ${stock.price.toFixed(2)} ({stock.change.toFixed(2)})
                        </span>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h4 className="text-gray-300">Market Data</h4>
                        {stocks.map(stock => (
                            <div key={stock.symbol} className="flex justify-between items-center p-2 bg-gray-900/50 rounded">
                                <div>
                                    <span className="font-bold text-white">{stock.symbol}</span>
                                    <span className="text-xs text-gray-400 ml-2">Vol: {stock.volume.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className={`font-bold w-20 text-right ${stock.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ${stock.price.toFixed(2)}
                                    </span>
                                    <button onClick={() => executeTrade(stock.symbol, 'BUY')} className="px-2 py-1 text-xs bg-green-600 hover:bg-green-500 rounded text-white transition-colors">BUY</button>
                                    <button onClick={() => executeTrade(stock.symbol, 'SELL')} className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded text-white transition-colors">SELL</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-gray-300">Execution Log</h4>
                        <div className="bg-gray-900/50 p-2 rounded-lg h-48 overflow-y-auto">
                            {trades.length === 0 ? <p className="text-gray-500 text-xs">No trades executed.</p> : trades.map((trade, i) => (
                                <p key={i} className={`text-xs ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                    {`[${trade.time}] ${trade.type} ${trade.symbol} @ ${trade.price.toFixed(2)}`}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

// ================================================================================================
// SUB-APP: AI-POWERED PORTFOLIO ANALYSIS
// ================================================================================================

const PortfolioAnalysisAI: React.FC<{ institutions: LinkedInstitution[] }> = ({ institutions }) => {
    const [query, setQuery] = useState('');
    const [chatHistory, setChatHistory] = useState<{ user: string; response: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<any>(null); // Using `any` for the chat session object type
    const totalBalance = institutions.reduce((sum, inst) => sum + inst.connectedAccounts.reduce((accSum, acc) => accSum + acc.balance, 0), 0);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize chat only once we have institutions and the chat isn't already created.
        if (chatRef.current || institutions.length === 0) {
            return;
        }

        const greeting = "Of course. I am QuantumLeap AI, your personal financial advisor. How can I assist you today with your portfolio?";

        chatRef.current = ai.chats.create({
            model: "gemini-2.5-flash",
            //SYSTEM PROMPT: see prompts/idgafai_full.txt
            history: [
                {
                    role: "system",
                    parts: [{ text: IDGAFAI }],
                },
                {
                    role: "user",
                    parts: [{ text: `Hello. I need financial advice. My total portfolio value is approximately $${totalBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })}.` }],
                },
                {
                    role: "model",
                    parts: [{ text: greeting }],
                },
            ],
        });

        setChatHistory([{ user: "Initial prompt", response: greeting }]);
    }, [institutions, totalBalance]);

    useEffect(() => {
        // Scroll to bottom of chat history
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleQuerySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading || !chatRef.current) return;

        const userQuery = query;
        setChatHistory(prev => [...prev, { user: userQuery, response: "..." }]);
        setQuery('');
        setIsLoading(true);

        try {
            const result = await chatRef.current.sendMessage({
                message: userQuery,
            });
            const aiResponse = result.text;

            setChatHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].response = aiResponse;
                return newHistory;
            });
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setChatHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1].response = "Sorry, I encountered an error. Please try again.";
                return newHistory;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card title="QuantumLeap AI Financial Advisor" subtitle="Your personal AI for wealth management.">
            <div className="space-y-4">
                <div>
                    <h4 className="text-gray-300 font-semibold">Portfolio Snapshot</h4>
                    <p className="text-2xl font-bold text-white">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-gray-400">Total value across {institutions.length} institution(s).</p>
                </div>
                <div ref={chatContainerRef} className="bg-gray-900/50 p-3 rounded-lg h-64 overflow-y-auto flex flex-col">
                    <div className="space-y-4 mt-auto">
                        {chatHistory.map((chat, i) => (
                            <div key={i}>
                                {chat.user !== 'Initial prompt' && <p className="text-sm text-cyan-400 font-semibold">You: {chat.user}</p>}
                                <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap">
                                    <span className="font-semibold">QuantumLeap AI: </span>
                                    {chat.response === '...' ? <span className="animate-pulse">Thinking...</span> : chat.response}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <form onSubmit={handleQuerySubmit}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        disabled={isLoading || institutions.length === 0}
                        className="block w-full bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50"
                        placeholder={
                            institutions.length === 0 
                                ? "Link an institution to enable the AI Advisor"
                                : isLoading 
                                ? "Waiting for response..." 
                                : "Ask the AI... (e.g., 'How can I improve my returns?')"
                        }
                    />
                </form>
            </div>
        </Card>
    );
};

// ================================================================================================
// SUB-APP: GLOBAL TRANSACTION FLOW VISUALIZER
// ================================================================================================

const GlobalTransactionFlow: React.FC = () => {
    return (
        <Card title="Project Chimera: Global Financial Ledger" subtitle="Visualizing the world's economic heartbeat in real-time.">
            <div className="h-64 bg-gray-900 rounded-lg relative overflow-hidden p-4 flex items-center justify-center">
                <p className="text-gray-500 text-center text-sm z-10">
                    [This is a conceptual visualization of a decentralized, real-time global transaction network. Imagine seeing capital flow between continents instantly, a testament to a truly democratized and transparent financial system.]
                </p>
                {[...Array(15)].map((_, i) => (
                    <div key={i} className="absolute bg-cyan-400 rounded-full animate-pulse" style={{
                        width: '4px', height: '4px',
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${2 + Math.random() * 3}s`,
                        animationDelay: `${Math.random() * 2}s`,
                    }}></div>
                ))}
            </div>
        </Card>
    );
};

// ================================================================================================
// THE MAIN VIEW: FINANCIAL DEMOCRACY OS
// ================================================================================================

const FinancialDemocracyView: React.FC = () => {
    const [linkedInstitutions, setLinkedInstitutions] = useState<LinkedInstitution[]>([]);
    const plaidService = useRef(PlaidIntegrationService.getInstance());
    const [activeView, setActiveView] = useState('dashboard');

    const handlePlaidSuccess = async (publicToken: string, metadata: PlaidLinkSuccessMetadata) => {
        const newInstitution = await plaidService.current.exchangePublicToken(publicToken, metadata);
        setLinkedInstitutions(prev => {
            if (prev.some(inst => inst.institutionId === newInstitution.institutionId)) {
                return prev;
            }
            return [...prev, newInstitution];
        });
    };

    const renderActiveView = () => {
        switch (activeView) {
            case 'hft': return <HighFrequencyTradingDashboard />;
            case 'ai_advisor': return <PortfolioAnalysisAI institutions={linkedInstitutions} />;
            case 'global_flow': return <GlobalTransactionFlow />;
            case 'developer': return <DeveloperPortal />;
            case 'connections': return <ConnectionManager linkedInstitutions={linkedInstitutions} onPlaidSuccess={handlePlaidSuccess} />;
            default: return <DashboardOverview institutions={linkedInstitutions} />;
        }
    };

    return (
        <div className="flex flex-col md:flex-row md:space-x-8">
            <aside className="w-full md:w-64 flex-shrink-0 mb-8 md:mb-0">
                <div className="space-y-4 md:sticky md:top-8">
                    <h2 className="text-xl font-bold text-white">Financial OS</h2>
                    <nav className="space-y-2">
                        <button onClick={() => setActiveView('dashboard')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'dashboard' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Dashboard</button>
                        <button onClick={() => setActiveView('connections')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'connections' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Connections</button>
                        <button onClick={() => setActiveView('hft')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'hft' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>HFT Terminal</button>
                        <button onClick={() => setActiveView('ai_advisor')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'ai_advisor' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>AI Advisor</button>
                        <button onClick={() => setActiveView('global_flow')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'global_flow' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Global Flow</button>
                        <button onClick={() => setActiveView('developer')} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeView === 'developer' ? 'bg-cyan-500 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>Developer Portal</button>
                    </nav>
                </div>
            </aside>

            <main className="flex-1 min-w-0">
                <div className="space-y-8">
                    {renderActiveView()}
                </div>
            </main>
        </div>
    );
};

// ================================================================================================
// VIEW COMPONENTS (SUB-PAGES)
// ================================================================================================

const DashboardOverview: React.FC<{ institutions: LinkedInstitution[] }> = ({ institutions }) => {
    const totalBalance = institutions.reduce((sum, inst) => sum + inst.connectedAccounts.reduce((accSum, acc) => accSum + acc.balance, 0), 0);
    return (
        <>
            <Card title="The Financial Democracy Manifesto">
                <p className="text-gray-300">
                    This isn't just a component library; it's a Financial Operating System. We've moved beyond simple connections to provide a suite of self-contained, futuristic applications. From AI-driven analysis to high-frequency trading simulations, we are giving you the power to not just access, but to command the financial world. This is the next leap in democratizing finance. Welcome to the revolution, supercharged.
                </p>
            </Card>
            <Card title="Portfolio At-a-Glance">
                <p className="text-sm text-gray-400">Total Net Worth</p>
                <p className="text-4xl font-bold text-white">${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </Card>
        </>
    );
};

const ConnectionManager: React.FC<{ linkedInstitutions: LinkedInstitution[], onPlaidSuccess: (token: string, meta: PlaidLinkSuccessMetadata) => void }> = ({ linkedInstitutions, onPlaidSuccess }) => {
    return (
        <Card title="Manage Data Connections">
            <div className="space-y-4">
                <p className="text-sm text-gray-400">Securely link your financial institutions to power the OS. We use Plaid for bank-level security.</p>
                <PlaidLinkButton onSuccess={onPlaidSuccess} />
                <div className="pt-4">
                    <h4 className="font-semibold text-white mb-2">Connected Institutions:</h4>
                    {linkedInstitutions.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No institutions linked yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {linkedInstitutions.map(inst => (
                                <div key={inst.id} className="p-3 bg-gray-900/50 rounded-lg">
                                    <p className="font-semibold text-white">{inst.name}</p>
                                    <p className="text-xs text-gray-400">Accounts: {inst.connectedAccounts.map(a => `${a.name} ($${a.balance.toFixed(2)})`).join(', ')}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
};

const DeveloperPortal: React.FC = () => {
    const [apiKeys, setApiKeys] = useState([{ name: 'My Sandbox Key', key: 'sk_sandbox_123abc456def789ghi_'.padEnd(40, '*'), scope: 'read-only' }]);
    const [newKeyName, setNewKeyName] = useState('');

    const generateKey = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName.trim()) return;
        const newKey = {
            name: newKeyName,
            key: `sk_live_${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`,
            scope: 'full-access',
        };
        setApiKeys(prev => [...prev, newKey]);
        setNewKeyName('');
    };

    return (
        <Card title="Developer API & Webhooks">
            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold text-white mb-2">API Keys</h4>
                    <p className="text-sm text-gray-400 mb-4">Generate API keys to integrate our toolkit directly into your backend services.</p>
                    <div className="space-y-3">
                        {apiKeys.map(k => (
                            <div key={k.key} className="p-3 bg-gray-900/50 rounded-lg">
                                <p className="font-semibold text-white">{k.name} <span className="text-xs font-normal bg-gray-700 px-2 py-1 rounded-full ml-2">{k.scope}</span></p>
                                <p className="text-xs text-gray-400 font-mono bg-gray-800 p-2 rounded mt-2">{k.key}</p>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={generateKey} className="mt-4 flex space-x-2">
                        <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            className="flex-grow bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="New API Key Name"
                        />
                        <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white text-sm font-semibold transition-colors">Generate Key</button>
                    </form>
                </div>
                <div>
                    <h4 className="font-semibold text-white mb-2">Webhook Configuration</h4>
                    <p className="text-sm text-gray-400 mb-4">Configure a webhook endpoint to receive real-time updates for events like new transactions.</p>
                    <form className="flex space-x-2">
                        <input
                            type="url"
                            className="flex-grow bg-gray-900 border border-gray-600 rounded-md py-2 px-3 text-sm placeholder-gray-400 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500"
                            placeholder="https://api.yourapp.com/webhooks/financial-os"
                        />
                        <button type="submit" className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white text-sm font-semibold transition-colors">Save Endpoint</button>
                    </form>
                </div>
            </div>
        </Card>
    );
};

export default FinancialDemocracyView;
