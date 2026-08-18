import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Card from './Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine, PieChart, Pie, Legend } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Search, Menu, ChevronLeft, ChevronRight, Activity, Globe, Server, Database, Shield, Cpu, Zap, Settings as SettingsIcon, Brain, PieChart as PortfolioIcon, Landmark, Atom, FileCode, BarChartBig, Wallet, ShieldCheck, SlidersHorizontal, ArrowUp, ArrowDown, CheckCircle, XCircle, Clock } from 'lucide-react';

// --- Expanded Types ---

interface StockTicker {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    high: number;
    low: number;
    marketCap: string;
    name: string;
    sector: string;
    aiScore: number; // 0-100
    sentiment: 'bullish' | 'bearish' | 'neutral';
    volatilityIndex: number;
    liquidityProvider: string;
}

interface PortfolioAsset {
    symbol: string;
    name: string;
    quantity: number;
    avgCost: number;
    currentValue: number;
    pnl: number;
    pnlPercent: number;
}

interface OrderBookItem {
    price: number;
    size: number;
    total: number;
    type: 'bid' | 'ask';
}

interface AIInsight {
    id: string;
    timestamp: string;
    category: 'Risk' | 'Opportunity' | 'Anomaly' | 'Prediction' | 'Macro';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    confidence: number;
    relatedAsset?: string;
    actionable: boolean;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'system' | 'nexus';
    text: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

interface OperationNode {
    id: string;
    name: string;
    status: 'optimal' | 'degraded' | 'critical' | 'offline';
    load: number; // CPU/Quantum Core Load %
    latency: number; // ms
    region: string;
    type: 'Compute' | 'Storage' | 'QuantumRelay' | 'DataIngest';
}

interface DAOProposal {
    id: string;
    title: string;
    proposer: string;
    status: 'active' | 'passed' | 'failed';
    votesFor: number;
    votesAgainst: number;
    description: string;
    endsIn: string;
}

// --- Live Data Service ---

const fetchLiveCryptoPrices = async (): Promise<Record<string, number>> => {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple,cardano,chainlink,avalanche-2&vs_currencies=usd');
        if (!response.ok) throw new Error("Rate limit");
        const data = await response.json();
        return {
            'BTC-USD': data.bitcoin.usd,
            'ETH-USD': data.ethereum.usd,
            'SOL-USD': data.solana.usd,
            'XRP-USD': data.ripple.usd,
            'ADA-USD': data.cardano.usd,
            'LINK-USD': data.chainlink.usd,
            'AVAX-USD': data['avalanche-2'].usd,
        };
    } catch (e) {
        return {
            'BTC-USD': 64230.50, 'ETH-USD': 3450.00, 'SOL-USD': 145.20,
            'XRP-USD': 0.62, 'ADA-USD': 0.45, 'LINK-USD': 18.50, 'AVAX-USD': 35.80
        };
    }
};

// --- Initial Data Generators ---

const generateStockData = (livePrices?: Record<string, number>): StockTicker[] => [
    { symbol: 'BTC-USD', name: 'Bitcoin Core', price: livePrices?.['BTC-USD'] || 64230.50, change: 0, changePercent: 0, volume: 450000000, high: 0, low: 0, marketCap: '1.2T', sector: 'Crypto', aiScore: 88, sentiment: 'bullish', volatilityIndex: 0.45, liquidityProvider: 'Global Pool' },
    { symbol: 'ETH-USD', name: 'Ethereum Network', price: livePrices?.['ETH-USD'] || 3450.00, change: 0, changePercent: 0, volume: 220000000, high: 0, low: 0, marketCap: '400B', sector: 'Crypto', aiScore: 72, sentiment: 'neutral', volatilityIndex: 0.38, liquidityProvider: 'Global Pool' },
    { symbol: 'SOL-USD', name: 'Solana', price: livePrices?.['SOL-USD'] || 145.20, change: 0, changePercent: 0, volume: 80000000, high: 0, low: 0, marketCap: '65B', sector: 'Crypto', aiScore: 91, sentiment: 'bullish', volatilityIndex: 0.65, liquidityProvider: 'Regional Pool' },
    { symbol: 'NVDA', name: 'NVIDIA AI Compute', price: 890.10, change: 15.50, changePercent: 1.74, volume: 55000000, high: 900.00, low: 880.00, marketCap: '2.2T', sector: 'Technology', aiScore: 96, sentiment: 'bullish', volatilityIndex: 0.25, liquidityProvider: 'NYSE' },
    { symbol: 'MSFT', name: 'Microsoft Enterprise', price: 420.00, change: -2.10, changePercent: -0.50, volume: 22000000, high: 425.50, low: 418.90, marketCap: '3.1T', sector: 'Technology', aiScore: 91, sentiment: 'bullish', volatilityIndex: 0.15, liquidityProvider: 'NASDAQ' },
    { symbol: 'SYNTH-AI', name: 'AI Sector Synthetic', price: 1250.75, change: 12.30, changePercent: 0.98, volume: 15000000, high: 1260, low: 1240, marketCap: 'N/A', sector: 'Synthetic', aiScore: 99, sentiment: 'bullish', volatilityIndex: 0.8, liquidityProvider: 'DAO Liquidity' },
];

const generateOrderBook = (basePrice: number): OrderBookItem[] => {
    const spread = basePrice * 0.0005;
    const asks = Array.from({ length: 50 }, (_, i) => ({ price: basePrice + spread + (i * basePrice * 0.0001), size: Math.random() * 5 + 0.1, total: 0, type: 'ask' as const })).reverse();
    const bids = Array.from({ length: 50 }, (_, i) => ({ price: basePrice - spread - (i * basePrice * 0.0001), size: Math.random() * 5 + 0.1, total: 0, type: 'bid' as const }));
    return [...asks, ...bids];
};

const generateLiveChartData = (basePrice: number, points: number) => {
    let currentPrice = basePrice;
    return Array.from({ length: points }, (_, i) => {
        const time = new Date(Date.now() - (points - i) * 60000);
        const volatility = 0.002;
        const change = (Math.random() - 0.5) * volatility * currentPrice;
        currentPrice += change;
        return { time: time.getHours().toString().padStart(2, '0') + ':' + time.getMinutes().toString().padStart(2, '0'), price: currentPrice, volume: Math.floor(Math.random() * 5000) + 1000, aiPrediction: currentPrice * (1 + (Math.random() - 0.5) * 0.01), sentimentScore: 50 + (Math.random() - 0.5) * 20 };
    });
};

const initialNodes: OperationNode[] = [
    { id: 'n1', name: 'Tokyo-1', status: 'optimal', load: 45, latency: 8, region: 'APAC', type: 'Compute' },
    { id: 'n2', name: 'London-Core', status: 'degraded', load: 88, latency: 45, region: 'EMEA', type: 'QuantumRelay' },
    { id: 'n3', name: 'NY-Fin', status: 'optimal', load: 32, latency: 12, region: 'NA', type: 'Compute' },
    { id: 'n4', name: 'Singapore-Edge', status: 'critical', load: 99, latency: 120, region: 'APAC', type: 'DataIngest' },
    { id: 'n5', name: 'Frankfurt-Data', status: 'optimal', load: 60, latency: 22, region: 'EMEA', type: 'Storage' },
    { id: 'n6', name: 'Zurich-Quantum', status: 'optimal', load: 15, latency: 1, region: 'EMEA', type: 'QuantumRelay' },
];

const initialProposals: DAOProposal[] = [
    { id: 'dp001', title: 'Onboard SYNTH-AI to Global Pool', proposer: '0x...a4f2', status: 'active', votesFor: 125000, votesAgainst: 15000, description: 'Integrate the new AI-driven synthetic asset into the primary liquidity pool to increase platform volume.', endsIn: '2d 4h' },
    { id: 'dp002', title: 'Reduce Trading Fees by 5%', proposer: '0x...b8e1', status: 'passed', votesFor: 250000, votesAgainst: 10000, description: 'A successful proposal to lower platform fees to attract more high-frequency traders.', endsIn: 'Ended' },
];

// --- Main Component ---

const InvestmentsView: React.FC = () => {
    // --- Layout State ---
    const [activeTab, setActiveTab] = useState<'dashboard' | 'trading' | 'portfolio' | 'ai-hub' | 'infrastructure' | 'governance' | 'settings'>('dashboard');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // --- Data State ---
    const [stocks, setStocks] = useState<StockTicker[]>(generateStockData());
    const [selectedStock, setSelectedStock] = useState<StockTicker>(stocks[0]);
    const [chartData, setChartData] = useState(generateLiveChartData(stocks[0].price, 120));
    const [orderBook, setOrderBook] = useState<OrderBookItem[]>(generateOrderBook(stocks[0].price));
    const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
    
    // --- AI & Ops State ---
    const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{ id: '1', sender: 'nexus', text: 'NEXUS-7 Quantum Core online. All systems nominal.', timestamp: new Date().toLocaleTimeString() }]);
    const [chatInput, setChatInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [opsNodes, setOpsNodes] = useState<OperationNode[]>(initialNodes);
    const [daoProposals, setDaoProposals] = useState<DAOProposal[]>(initialProposals);
    
    // --- Settings State ---
    const [tickRate, setTickRate] = useState(500); // ms for HFT feel
    const [showPredictions, setShowPredictions] = useState(true);
    const [theme, setTheme] = useState('dark');

    // --- Initialization ---
    useEffect(() => {
        fetchLiveCryptoPrices().then(prices => {
            const updatedStocks = generateStockData(prices);
            setStocks(updatedStocks);
            const current = updatedStocks.find(s => s.symbol === selectedStock.symbol);
            if (current) {
                setSelectedStock(current);
                setChartData(generateLiveChartData(current.price, 120));
                setOrderBook(generateOrderBook(current.price));
            }
        });
    }, []);

    // --- Live Ticker Loop ---
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            setStocks(prev => prev.map(stock => {
                const move = (Math.random() - 0.5) * (stock.price * 0.001);
                const newPrice = stock.price + move;
                return { ...stock, price: newPrice, change: move, changePercent: (move / stock.price) * 100, high: Math.max(stock.high || newPrice, newPrice), low: Math.min(stock.low || newPrice, newPrice) };
            }));

            setChartData(prev => {
                const currentStock = stocks.find(s => s.symbol === selectedStock.symbol) || selectedStock;
                const move = (Math.random() - 0.5) * (currentStock.price * 0.001);
                const newPrice = currentStock.price + move;
                const newPoint = { time: timeStr, price: newPrice, volume: Math.floor(Math.random() * 1000), aiPrediction: showPredictions ? newPrice * (1 + (Math.random() - 0.5) * 0.02) : 0, sentimentScore: 50 + (Math.random() - 0.5) * 10 };
                return [...prev.slice(1), newPoint];
            });

            setOrderBook(prev => prev.map(item => ({ ...item, size: Math.max(0.1, item.size + (Math.random() - 0.5)), price: item.price + (Math.random() - 0.5) * 0.1 })).sort((a, b) => b.price - a.price));
            
            setOpsNodes(prev => prev.map(node => ({...node, load: Math.min(100, Math.max(0, node.load + (Math.random() - 0.5) * 5)), latency: Math.max(1, node.latency + (Math.random() - 0.5) * 2)})));

        }, tickRate);

        return () => clearInterval(interval);
    }, [selectedStock.symbol, tickRate, showPredictions, stocks]);

    // --- Handlers ---

    const handleStockSelect = (stock: StockTicker) => {
        setSelectedStock(stock);
        setChartData(generateLiveChartData(stock.price, 120));
        setOrderBook(generateOrderBook(stock.price));
    };

    const handleAISend = async () => {
        if (!chatInput.trim()) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: chatInput, timestamp: new Date().toLocaleTimeString() };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAiThinking(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemInstruction = "You are NEXUS-7, a high-frequency trading AI assistant. Provide concise, actionable insights based on the provided context.";
            const context = `Context: Asset is ${selectedStock.symbol} at $${selectedStock.price.toFixed(2)}. Current sentiment is ${selectedStock.sentiment}, with a volatility index of ${selectedStock.volatilityIndex.toFixed(2)}.`;
            
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: [{ role: 'user', parts: [{ text: `${context}\n\nUser: ${userMsg.text}` }] }],
                config: {
                    systemInstruction: systemInstruction,
                    temperature: 0.2, // Lower for more deterministic, factual responses in a financial context.
                    thinkingConfig: {
                        thinkingBudget: 0, // Disables thinking for faster HFT-style responses.
                    },
                }
            });

            const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'nexus', text: result.response.text(), timestamp: new Date().toLocaleTimeString() };
            setChatHistory(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'system', text: "Quantum Entanglement Comms disrupted. Fallback: Volatility suggests holding.", timestamp: new Date().toLocaleTimeString() };
            setChatHistory(prev => [...prev, errorMsg]);
        } finally {
            setIsAiThinking(false);
        }
    };

    const optimizeNode = (id: string) => setOpsNodes(prev => prev.map(n => n.id === id ? { ...n, status: 'optimal', load: Math.max(20, n.load - 30), latency: Math.max(5, n.latency - 20) } : n));

    // --- Renderers ---

    const renderSidebar = () => (
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-[#0b0e11] border-r border-gray-800 flex flex-col transition-all duration-300 z-30 flex-shrink-0`}>
            <div className="h-16 flex items-center justify-center border-b border-gray-800">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 cursor-pointer" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                    <span className="font-bold text-white text-xl">{sidebarCollapsed ? 'N7' : 'NEXUS'}</span>
                </div>
            </div>
            <div className="flex flex-col gap-2 p-2 mt-4">
                {[
                    { id: 'dashboard', icon: BarChartBig, label: 'Market Overview' },
                    { id: 'trading', icon: Globe, label: 'HFT Terminal' },
                    { id: 'portfolio', icon: PortfolioIcon, label: 'Portfolio & Risk' },
                    { id: 'ai-hub', icon: Brain, label: 'Neural Core' },
                    { id: 'infrastructure', icon: Server, label: 'Global Infrastructure' },
                    { id: 'governance', icon: Landmark, label: 'DAO Governance' },
                    { id: 'settings', icon: SettingsIcon, label: 'System Config' }
                ].map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex items-center p-3 rounded-lg transition-all duration-200 group ${activeTab === item.id ? 'bg-cyan-900/20 text-cyan-400 border-l-2 border-cyan-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`} title={sidebarCollapsed ? item.label : ''}>
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!sidebarCollapsed && <span className="ml-3 text-sm font-medium truncate">{item.label}</span>}
                    </button>
                ))}
            </div>
            <div className="mt-auto p-4 border-t border-gray-800">
                 {!sidebarCollapsed ? (
                    <div className="bg-purple-900/20 border border-purple-800 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Atom className="w-4 h-4 text-purple-400 animate-spin" />
                            <span className="text-xs font-bold text-purple-400">QUANTUM LINK</span>
                        </div>
                        <div className="text-[10px] text-gray-500">Latency: 1.4ms (FTL)</div>
                    </div>
                 ) : ( <Atom className="w-5 h-5 text-purple-400 mx-auto animate-spin" /> )}
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="flex-1 p-6 overflow-y-auto bg-[#0b0e11] h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stocks.slice(0, 4).map(stock => (
                    <Card key={stock.symbol} className="bg-[#15191e] border-gray-800 hover:border-cyan-500/50 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-gray-400 text-xs font-bold uppercase">{stock.name}</h3>
                                <div className="text-2xl font-bold text-white mt-1">${stock.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                            </div>
                            <div className={`text-xs font-bold px-2 py-1 rounded ${stock.change >= 0 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>{stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</div>
                        </div>
                        <div className="mt-4 h-1 bg-gray-800 rounded-full overflow-hidden"><div className={`h-full ${stock.sentiment === 'bullish' ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${stock.aiScore}%` }}></div></div>
                        <div className="mt-1 text-[10px] text-gray-500 text-right">AI Confidence: {stock.aiScore}%</div>
                    </Card>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px] mb-6">
                <div className="lg:col-span-2 bg-[#15191e] border border-gray-800 rounded-lg flex flex-col">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-3"><h2 className="text-white font-bold text-lg">{selectedStock.symbol}</h2><span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">Live Feed</span></div>
                        <div className="flex gap-2">{['1H', '4H', '1D', '1W'].map(t => (<button key={t} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 rounded transition-colors">{t}</button>))}</div>
                    </div>
                    <div className="flex-1 p-2 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs><linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" />
                                <XAxis dataKey="time" stroke="#5e6673" tick={{fontSize: 10}} minTickGap={30} />
                                <YAxis domain={['auto', 'auto']} orientation="right" stroke="#5e6673" tick={{fontSize: 10}} tickFormatter={(val) => val.toFixed(2)} width={60} />
                                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                                <Area type="monotone" dataKey="price" stroke="#06b6d4" fill="url(#colorPrice)" strokeWidth={2} />
                                {showPredictions && <Area type="monotone" dataKey="aiPrediction" stroke="#8b5cf6" fill="none" strokeDasharray="5 5" strokeWidth={1} />}
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-[#15191e] border border-gray-800 rounded-lg flex flex-col overflow-hidden">
                    <div className="p-3 border-b border-gray-800 font-bold text-xs text-gray-400 uppercase">Order Book</div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {orderBook.map((order, i) => (
                            <div key={i} className="flex justify-between text-xs p-1 px-3 hover:bg-gray-800 relative">
                                <div className={`absolute inset-0 ${order.type === 'ask' ? 'bg-red-500/10' : 'bg-green-500/10'}`} style={{ width: `${Math.min(100, order.size * 5)}%` }}></div>
                                <span className={`z-10 font-mono ${order.type === 'ask' ? 'text-red-400' : 'text-green-400'}`}>{order.price.toFixed(2)}</span>
                                <span className="z-10 text-gray-400">{order.size.toFixed(4)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTrading = () => (
        <div className="flex-1 flex flex-col lg:flex-row bg-[#0b0e11] h-full overflow-hidden">
            <div className="w-full lg:w-64 bg-[#15191e] border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" /><input type="text" placeholder="Search Assets" className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-9 py-2 text-sm text-white focus:border-cyan-500 outline-none" /></div></div>
                <div className="flex-1 overflow-y-auto">{stocks.map(stock => (<div key={stock.symbol} onClick={() => handleStockSelect(stock)} className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors ${selectedStock.symbol === stock.symbol ? 'bg-gray-800 border-l-2 border-l-cyan-500' : ''}`}><div className="flex justify-between mb-1"><span className="font-bold text-white text-sm">{stock.symbol}</span><span className="text-white text-sm">${stock.price.toFixed(2)}</span></div><div className="flex justify-between text-xs"><span className="text-gray-500">{stock.name}</span><span className={stock.change >= 0 ? 'text-green-400' : 'text-red-400'}>{stock.changePercent.toFixed(2)}%</span></div></div>))}</div>
            </div>
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 bg-[#0b0e11] p-4 relative"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="grad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#1f2937" /><XAxis dataKey="time" stroke="#4b5563" /><YAxis orientation="right" stroke="#4b5563" domain={['auto', 'auto']} /><Tooltip contentStyle={{backgroundColor: '#111827'}} /><Area type="monotone" dataKey="price" stroke="#10b981" fill="url(#grad)" strokeWidth={2} /></AreaChart></ResponsiveContainer></div>
                <div className="h-[240px] bg-[#15191e] border-t border-gray-800 p-4 flex gap-4">
                    <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {['Market', 'Limit', 'Stop Limit', 'TWAP'].map(type => <button key={type} className={`py-2 rounded ${type === 'Limit' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>{type}</button>)}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-xs text-gray-500">Price (USD)</label><input type="number" defaultValue={selectedStock.price.toFixed(2)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1 text-white font-mono" /></div>
                            <div><label className="text-xs text-gray-500">Amount ({selectedStock.symbol.split('-')[0]})</label><input type="number" placeholder="0.00" className="w-full bg-gray-900 border border-gray-700 rounded p-2 mt-1 text-white font-mono" /></div>
                        </div>
                        <div><input type="range" className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /></div>
                    </div>
                    <div className="w-48 flex flex-col gap-2">
                        <button className="flex-1 bg-green-600 hover:bg-green-500 text-white rounded font-bold shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"><ArrowUp size={16}/>BUY / LONG</button>
                        <button className="flex-1 bg-red-600 hover:bg-red-500 text-white rounded font-bold shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"><ArrowDown size={16}/>SELL / SHORT</button>
                    </div>
                </div>
            </div>
        </div>
    );
    
    const renderPortfolio = () => (
        <div className="flex-1 p-8 bg-[#0b0e11] overflow-y-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Portfolio & Risk Analysis</h1>
            <p className="text-gray-400 mb-8">Comprehensive overview of asset allocation, performance, and risk exposure.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Total Value" className="lg:col-span-1 bg-[#15191e] border-gray-800"><div className="text-4xl font-bold text-cyan-400">$1,245,678.90</div><div className="text-green-400 mt-2">+ $12,345.67 (+1.01%) Today</div></Card>
                <Card title="Risk Exposure (VaR 95%)" className="bg-[#15191e] border-gray-800"><div className="text-4xl font-bold text-yellow-400">$45,123.00</div><div className="text-gray-400 mt-2">Max potential 1-day loss</div></Card>
                <Card title="Sharpe Ratio" className="bg-[#15191e] border-gray-800"><div className="text-4xl font-bold text-purple-400">2.15</div><div className="text-gray-400 mt-2">Excellent risk-adjusted return</div></Card>
            </div>
        </div>
    );

    const renderAIHub = () => (
        <div className="flex-1 flex flex-col lg:flex-row h-full bg-[#0b0e11] overflow-hidden">
            <div className="flex-1 p-6 flex flex-col">
                <div className="flex-1 bg-[#15191e] border border-gray-800 rounded-xl flex flex-col shadow-2xl">
                    <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-[#15191e] to-[#1a2026]"><div className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${isAiThinking ? 'bg-purple-500 animate-ping' : 'bg-green-500'}`}></div><h2 className="text-lg font-bold text-white">NEXUS-7 Neural Interface</h2></div></div>
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">{chatHistory.map((msg, idx) => (<div key={msg.id + idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[80%] p-4 rounded-xl text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'}`}><div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div><div className="text-[10px] opacity-50 mt-2 text-right">{msg.timestamp}</div></div></div>))}{isAiThinking && (<div className="flex justify-start"><div className="bg-gray-800 p-4 rounded-xl rounded-bl-none border border-gray-700 flex gap-2"><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div></div></div>)}</div>
                    <div className="p-4 border-t border-gray-800 bg-[#1a2026]"><div className="flex gap-4"><input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAISend()} placeholder="Analyze market conditions..." className="flex-1 bg-[#0b0e11] border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-cyan-500 outline-none" /><button onClick={handleAISend} className="px-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold">SEND</button></div></div>
                </div>
            </div>
            <div className="w-full lg:w-80 bg-[#15191e] border-l border-gray-800 p-6 overflow-y-auto">
                <h3 className="text-gray-400 text-xs font-bold uppercase mb-4">Active Directives</h3>
                <div className="space-y-4"><div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"><div className="flex justify-between mb-2"><span className="text-white font-bold text-sm">Risk Mitigation</span><span className="text-green-400 text-xs">Active</span></div><p className="text-xs text-gray-400">Monitoring BTC-USD variance for liquidation thresholds.</p></div><div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"><div className="flex justify-between mb-2"><span className="text-white font-bold text-sm">Sentiment Analysis</span><span className="text-yellow-400 text-xs">Learning</span></div><p className="text-xs text-gray-400">Ingesting global news feeds. Volatility index updated.</p></div><div className="mt-8"><h3 className="text-gray-400 text-xs font-bold uppercase mb-4">Model Performance</h3><div className="space-y-2"><div className="flex justify-between text-xs text-gray-400"><span>Accuracy</span><span>98.7%</span></div><div className="w-full bg-gray-800 h-1.5 rounded-full"><div className="bg-purple-500 h-full w-[98.7%]"></div></div><div className="flex justify-between text-xs text-gray-400 mt-2"><span>Inference Latency</span><span>0.8ms</span></div><div className="w-full bg-gray-800 h-1.5 rounded-full"><div className="bg-cyan-500 h-full w-[95%]"></div></div></div></div></div>
            </div>
        </div>
    );

    const renderInfrastructure = () => (
        <div className="flex-1 p-8 bg-[#0b0e11] overflow-y-auto">
            <div className="mb-8"><h1 className="text-3xl font-bold text-white mb-2">Global Infrastructure Map</h1><p className="text-gray-400">Real-time quantum network optimization. Click nodes to re-route computational load.</p></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#15191e] rounded-xl border border-gray-800 p-6 relative min-h-[400px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                    <div className="relative w-full h-full">{opsNodes.map((node, i) => (<div key={node.id} onClick={() => optimizeNode(node.id)} className={`absolute p-3 rounded-lg border transition-all duration-500 cursor-pointer transform hover:scale-110 ${node.status === 'optimal' ? 'bg-green-900/30 border-green-500' : node.status === 'critical' ? 'bg-red-900/30 border-red-500 animate-pulse' : 'bg-yellow-900/30 border-yellow-500'}`} style={{ top: `${10 + (i * 15)}%`, left: `${15 + (i % 2) * 50}%` }}><div className="flex items-center gap-2 mb-1">{node.type === 'QuantumRelay' ? <Atom size={16} className="text-purple-400"/> : <Server size={16} className="text-cyan-400"/>}<span className="font-bold text-white text-sm">{node.name}</span></div><div className="text-xs text-gray-400 mb-2">{node.region} - {node.type}</div><div className="w-32 bg-gray-800 rounded-full h-1.5 overflow-hidden"><div className={`h-full transition-all duration-1000 ${node.load > 90 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{width: `${node.load}%`}}></div></div><div className="text-[10px] text-right mt-1 text-gray-500">{node.load}% Load / {node.latency.toFixed(1)}ms</div></div>))}<svg className="absolute inset-0 pointer-events-none opacity-30"><path d="M150 100 L 400 200 L 150 300" stroke="#4b5563" strokeWidth="2" fill="none" /></svg></div>
                </div>
                <div className="flex flex-col gap-4">
                    <Card title="System Events" className="flex-1 bg-[#15191e] border-gray-800"><div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">{opsNodes.filter(n => n.status !== 'optimal').map(n => (<div key={n.id + 'alert'} className="p-3 bg-gray-800/50 border-l-2 border-red-500 rounded flex justify-between items-center"><div><div className="text-red-400 text-xs font-bold uppercase">Latency Spike</div><div className="text-white text-sm">{n.name} load exceeded 90% threshold.</div></div><button onClick={() => optimizeNode(n.id)} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded">Fix</button></div>))}<div className="p-3 bg-gray-800/50 border-l-2 border-green-500 rounded"><div className="text-green-400 text-xs font-bold uppercase">Optimization</div><div className="text-white text-sm">Route B-72 rebalanced successfully.</div></div><div className="p-3 bg-gray-800/50 border-l-2 border-blue-500 rounded"><div className="text-blue-400 text-xs font-bold uppercase">Sync</div><div className="text-white text-sm">Global ledger synchronization complete.</div></div></div></Card>
                </div>
            </div>
        </div>
    );

    const renderDAOGovernance = () => (
        <div className="flex-1 p-8 bg-[#0b0e11] overflow-y-auto">
            <h1 className="text-3xl font-bold text-white mb-2">DAO Governance Protocol</h1>
            <p className="text-gray-400 mb-8">Participate in the decentralized future of the platform. Your vote matters.</p>
            <div className="space-y-6">
                {daoProposals.map(p => (
                    <Card key={p.id} className="bg-[#15191e] border-gray-800">
                        <div className="flex justify-between items-start mb-4">
                            <div><h3 className="text-lg font-bold text-white">{p.title}</h3><p className="text-xs text-gray-500">Proposed by: {p.proposer}</p></div>
                            <span className={`px-3 py-1 text-xs font-bold rounded-full ${p.status === 'active' ? 'bg-blue-900 text-blue-300' : p.status === 'passed' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{p.status.toUpperCase()}</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-4">{p.description}</p>
                        <div className="w-full bg-gray-800 rounded-full h-4 flex overflow-hidden mb-2"><div className="bg-green-500" style={{width: `${(p.votesFor / (p.votesFor + p.votesAgainst)) * 100}%`}}></div><div className="bg-red-500" style={{width: `${(p.votesAgainst / (p.votesFor + p.votesAgainst)) * 100}%`}}></div></div>
                        <div className="flex justify-between text-xs text-gray-400"><span>{p.votesFor.toLocaleString()} For</span><span>{p.votesAgainst.toLocaleString()} Against</span></div>
                        {p.status === 'active' && <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center"><span className="text-sm text-yellow-400">Ends in: {p.endsIn}</span><div className="flex gap-2"><button className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-bold">Vote For</button><button className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm font-bold">Vote Against</button></div></div>}
                    </Card>
                ))}
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="flex-1 p-8 bg-[#0b0e11] overflow-y-auto">
             <h1 className="text-3xl font-bold text-white mb-8">System Configuration</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Data Feed Configuration" className="bg-[#15191e] border-gray-800">
                    <div className="space-y-4">
                        <div><label className="text-gray-400 text-sm block mb-2">Simulation Tick Rate (ms)</label><div className="flex items-center gap-4"><input type="range" min="100" max="2000" value={tickRate} onChange={e => setTickRate(Number(e.target.value))} className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer" /><span className="text-white font-mono w-12">{tickRate}</span></div></div>
                        <div className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"><span className="text-white text-sm">Show AI Prediction Layer</span><button onClick={() => setShowPredictions(!showPredictions)} className={`w-12 h-6 rounded-full transition-colors relative ${showPredictions ? 'bg-cyan-600' : 'bg-gray-600'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${showPredictions ? 'left-7' : 'left-1'}`}></div></button></div>
                    </div>
                </Card>
                <Card title="Security Protocols" className="bg-[#15191e] border-gray-800">
                    <div className="space-y-3"><div className="flex justify-between items-center p-2 border-b border-gray-800"><span className="text-gray-300 text-sm">Two-Factor Auth</span><span className="text-green-400 text-xs font-bold">ENABLED</span></div><div className="flex justify-between items-center p-2 border-b border-gray-800"><span className="text-gray-300 text-sm">API Key Rotation</span><span className="text-yellow-400 text-xs font-bold">30 DAYS</span></div><div className="flex justify-between items-center p-2"><span className="text-gray-300 text-sm">Session Timeout</span><span className="text-white text-xs">15 MIN</span></div></div>
                </Card>
             </div>
        </div>
    );

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'dashboard': return renderDashboard();
            case 'trading': return renderTrading();
            case 'portfolio': return renderPortfolio();
            case 'ai-hub': return renderAIHub();
            case 'infrastructure': return renderInfrastructure();
            case 'governance': return renderDAOGovernance();
            case 'settings': return renderSettings();
            default: return renderDashboard();
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-black text-white">
            {renderSidebar()}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                 {renderActiveTab()}
            </div>
        </div>
    );
};

export default InvestmentsView;