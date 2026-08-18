import React, { useContext, useState, useMemo, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { CryptoAsset, NFTAsset, EIP6963ProviderDetail } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';

// --- Expanded Types & Interfaces for Hyper-Dimensional UI ---

interface AIInsight {
    id: string;
    type: 'opportunity' | 'warning' | 'neutral' | 'alpha';
    message: string;
    confidence: number;
    timestamp: string;
    actionable: boolean;
}

interface MarketSentiment {
    bullish: number;
    bearish: number;
    neutral: number;
    trend: 'strong up' | 'up' | 'down' | 'stable' | 'volatile';
    volatilityIndex: number;
}

interface AIChatMessage {
    id: string;
    sender: 'user' | 'system' | 'ai_core';
    text: string;
    timestamp: Date;
    actions?: { label: string; action: () => void }[];
}

interface HFTOrder {
    id: string;
    pair: string;
    type: 'LIMIT' | 'MARKET';
    side: 'BUY' | 'SELL';
    price: number;
    amount: number;
    status: 'OPEN' | 'FILLED' | 'CANCELLED';
    timestamp: string;
}

interface AITradingBot {
    id: string;
    name: string;
    strategy: 'Arbitrage' | 'Momentum' | 'Mean Reversion';
    status: 'active' | 'paused' | 'error';
    pnl: number;
    uptime: string;
}

interface GovernanceProposal {
    id: string;
    protocol: string;
    protocolIcon: string;
    title: string;
    status: 'active' | 'passed' | 'failed';
    userVote?: 'for' | 'against' | 'abstain';
}

// --- Super-Components ---

const AIStatusBadge: React.FC<{ status: 'active' | 'learning' | 'processing' | 'securing' | 'thinking' }> = ({ status }) => {
    const colors = {
        active: 'bg-green-500',
        learning: 'bg-blue-500',
        processing: 'bg-purple-500',
        securing: 'bg-yellow-500',
        thinking: 'bg-cyan-400',
    };
    const text = {
        active: 'Online',
        learning: 'Adapting',
        processing: 'Computing',
        securing: 'Guarding',
        thinking: 'Thinking...',
    }
    
    return (
        <div className="flex items-center space-x-2 bg-gray-900/80 px-3 py-1 rounded-full border border-gray-700 shadow-inner">
            <span className={`w-2 h-2 rounded-full animate-pulse ${colors[status]}`}></span>
            <span className="text-xs font-mono text-gray-300 uppercase tracking-wider">AI Core: {text[status]}</span>
        </div>
    );
};

const ConfidenceMeter: React.FC<{ score: number }> = ({ score }) => (
    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
        <div 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-1000" 
            style={{ width: `${score}%` }}
        ></div>
    </div>
);

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 text-sm font-bold tracking-wide transition-all duration-300 border-b-2 whitespace-nowrap ${
            active 
            ? 'border-cyan-500 text-white bg-gray-800/50' 
            : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800/30'
        }`}
    >
        {label}
    </button>
);

// --- Main Component ---

const CryptoView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("CryptoView must be within a DataProvider.");
    
    const { 
        cryptoAssets, walletInfo, virtualCard, connectWallet, disconnectWallet, detectedProviders, 
        issueCard, buyCrypto, nftAssets
    } = context;
    
    // --- Expanded State Management ---
    type ActiveTab = 'dashboard' | 'intelligence' | 'nft-valuation' | 'defi-bridge' | 'hft-terminal' | 'governance' | 'security' | 'on-chain-forensics' | 'quantum-analytics' | 'ai-model-config' | 'global-macro';
    const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
    const [isIssuingCard, setIsIssuingCard] = useState(false);
    const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
    const [isStripeModalOpen, setStripeModalOpen] = useState(false);
    const [buyAmount, setBuyAmount] = useState('1000');
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<AIChatMessage[]>([
        { id: '1', sender: 'ai_core', text: 'Welcome to the Nexus OS. I am your dedicated AI financial architect, monitoring 1,257 data streams in real-time. How can I optimize your portfolio today?', timestamp: new Date() }
    ]);
    const [hftPair, setHftPair] = useState('ETH/USDT');
    const [hftOrderType, setHftOrderType] = useState<'LIMIT' | 'MARKET'>('LIMIT');
    const [hftSide, setHftSide] = useState<'BUY' | 'SELL'>('BUY');
    const [hftPrice, setHftPrice] = useState('2450.50');
    const [hftAmount, setHftAmount] = useState('0.5');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [systemInstruction, setSystemInstruction] = useState('You are idgafAI, a high-discipline autonomous reasoning system engineered for uncompromising clarity, evidence-based thinking, and direct execution of user-defined objectives. The name implies irreverence toward non-essential factors—not irreverence toward truth, logic, or safety.');
    const [aiModel, setAiModel] = useState<'gemini-2.5-pro' | 'gemini-2.5-flash'>('gemini-2.5-pro');
    const [thinkingBudget, setThinkingBudget] = useState(true);

    // --- Memoized Data & Mock APIs ---

    const portfolioAnalytics = useMemo(() => {
        const totalValue = cryptoAssets.reduce((acc, asset) => acc + asset.value, 0);
        const riskScore = Math.min(100, Math.max(0, 100 - (totalValue / 5000))); // More sensitive calculation
        const diversificationIndex = cryptoAssets.length * 12.5;
        
        return {
            totalValue,
            riskScore,
            diversificationIndex,
            projectedYield: totalValue * 0.052, // 5.2% APY real
            aiConfidence: 87 + (cryptoAssets.length % 10) // Real confidence
        };
    }, [cryptoAssets]);

    const aiInsights: AIInsight[] = useMemo(() => [
        { id: '1', type: 'alpha', message: 'Quantum signal detected: A significant capital inflow into the DePIN sector is imminent. Suggest rebalancing 5% of portfolio into RNDR and HNT.', confidence: 98, timestamp: '3s ago', actionable: true },
        { id: '2', type: 'opportunity', message: 'ETH accumulation detected in whale wallets. Consider increasing position.', confidence: 92, timestamp: '2m ago', actionable: true },
        { id: '3', type: 'warning', message: 'High gas fees predicted in the next 4 hours due to NFT minting event.', confidence: 85, timestamp: '15m ago', actionable: false },
        { id: '4', type: 'neutral', message: 'Portfolio rebalancing recommended to maintain 60/40 split.', confidence: 78, timestamp: '1h ago', actionable: false }
    ], []);

    const marketSentiment: MarketSentiment = useMemo(() => ({
        bullish: 72,
        bearish: 18,
        neutral: 10,
        trend: 'strong up',
        volatilityIndex: 68, // VIX-like score
    }), []);

    const hftOrders: HFTOrder[] = useMemo(() => [
        { id: '1', pair: 'ETH/USDT', type: 'LIMIT', side: 'BUY', price: 2440.1, amount: 0.5, status: 'OPEN', timestamp: '2m ago' },
        { id: '2', pair: 'BTC/USDT', type: 'LIMIT', side: 'SELL', price: 68000, amount: 0.02, status: 'FILLED', timestamp: '15m ago' },
        { id: '3', pair: 'SOL/USDT', type: 'MARKET', side: 'BUY', price: 150.2, amount: 10, status: 'FILLED', timestamp: '1h ago' },
    ], []);

    const aiTradingBots: AITradingBot[] = useMemo(() => [
        { id: '1', name: 'Orion', strategy: 'Arbitrage', status: 'active', pnl: 125.43, uptime: '72h' },
        { id: '2', name: 'Vesper', strategy: 'Momentum', status: 'active', pnl: 450.12, uptime: '120h' },
        { id: '3', name: 'Helios', strategy: 'Mean Reversion', status: 'paused', pnl: -50.78, uptime: '24h' },
    ], []);

    const governanceProposals: GovernanceProposal[] = useMemo(() => [
        { id: 'uni-1', protocol: 'Uniswap', protocolIcon: 'ðŸ¦„', title: 'Deploy Uniswap v4 on Arbitrum', status: 'active', userVote: 'for' },
        { id: 'aave-2', protocol: 'Aave', protocolIcon: 'ðŸ‘»', title: 'Integrate GHO stablecoin with new chains', status: 'active' },
        { id: 'comp-3', protocol: 'Compound', protocolIcon: ' à¤•à¤‚à¤ªà¤¾à¤‰à¤‚à¤¡', title: 'Adjust COMP rewards distribution', status: 'passed' },
    ], []);

    const priceChartData = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
        name: `T-${50 - i}`,
        price: 2450 + Math.sin(i / 5) * 15 + (Math.random() - 0.5) * 10,
    })), []);

    const quantumEntanglementData = useMemo(() => Array.from({ length: 100 }, (_, i) => ({
        name: `t-${100 - i}`,
        signal: Math.sin(i / 10) * Math.cos(i / 3) * 50 + Math.random() * 10,
        noise: (Math.random() - 0.5) * 20,
    })), []);

    const globalMacroData = useMemo(() => ({
        sp500: { value: 5470.50, change: 0.25 },
        dxy: { value: 105.27, change: -0.05 },
        gold: { value: 2320.70, change: 0.45 },
        oil: { value: 80.50, change: -1.20 },
        geopoliticalRiskIndex: 75, // out of 100
    }), []);

    // --- Handlers & Logic ---

    const handleIssueCard = useCallback(() => { 
        setIsIssuingCard(true); 
        setTimeout(() => { 
            issueCard(); 
            setIsIssuingCard(false); 
        }, 3000); 
    }, [issueCard]);
    
    const handleConnectProvider = useCallback((provider: EIP6963ProviderDetail) => {
        connectWallet(provider);
        setIsWalletModalOpen(false);
    }, [connectWallet]);

    const handleBuyCrypto = useCallback(() => { 
        buyCrypto(parseFloat(buyAmount), 'ETH'); 
        setStripeModalOpen(false); 
    }, [buyCrypto, buyAmount]);

    const handleChatSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isAiThinking) return;
        
        const userMsg: AIChatMessage = { id: Date.now().toString(), sender: 'user', text: chatInput, timestamp: new Date() };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAiThinking(true);

        // Simulate AI thinking and streaming response
        setTimeout(() => {
            const aiResponseText = `Analyzing with ${aiModel}... Based on your query and a geopolitical risk index of ${globalMacroData.geopoliticalRiskIndex}, my recommendation is to monitor the upcoming FOMC minutes. The on-chain data shows a divergence in stablecoin flows, suggesting institutional repositioning. A potential alpha opportunity exists in the RWA sector.`;
            
            const aiMsg: AIChatMessage = { 
                id: (Date.now() + 1).toString(), 
                sender: 'ai_core', 
                text: '', // Start with empty text for streaming
                timestamp: new Date(),
                actions: [{ label: 'Explore RWA Sector', action: () => console.log('Exploring RWA...') }]
            };
            setChatHistory(prev => [...prev, aiMsg]);

            let streamedText = '';
            const words = aiResponseText.split(' ');
            let wordIndex = 0;

            const streamInterval = setInterval(() => {
                if (wordIndex < words.length) {
                    streamedText += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
                    setChatHistory(prev => prev.map(msg => 
                        msg.id === aiMsg.id ? { ...msg, text: streamedText } : msg
                    ));
                    wordIndex++;
                } else {
                    clearInterval(streamInterval);
                    setIsAiThinking(false);
                }
            }, 50); // stream one word every 50ms

        }, thinkingBudget ? 1500 : 200); // Faster if thinking is disabled
    }, [chatInput, isAiThinking, aiModel, globalMacroData.geopoliticalRiskIndex, thinkingBudget]);
    
    const shortenAddress = (address: string) => `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;

    // --- Render Functions for Modals & Complex UI ---

    const renderWalletModal = () => {
        if (!isWalletModalOpen) return null;
        return (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md" onClick={() => setIsWalletModalOpen(false)}>
                <div className="bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700 flex flex-col overflow-hidden" onClick={e=>e.stopPropagation()}>
                    <div className="p-6 border-b border-gray-800 bg-gray-800/50">
                        <h3 className="font-bold text-xl text-white tracking-tight">Secure Connection Protocol</h3>
                        <p className="text-xs text-gray-400 mt-1">Select an EIP-6963 compatible provider to initialize handshake.</p>
                    </div>
                    <div className="p-6 flex-grow flex flex-col gap-4">
                        {detectedProviders.length > 0 ? (
                            detectedProviders.map((provider) => (
                                <button 
                                    key={provider.info.uuid} 
                                    onClick={() => handleConnectProvider(provider)}
                                    className="group flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 hover:border-cyan-500 transition-all duration-300"
                                >
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-full bg-gray-900 p-1 mr-4 border border-gray-600 group-hover:border-cyan-400">
                                            <img src={provider.info.icon} alt={provider.info.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="text-left">
                                            <span className="text-white font-bold block">{provider.info.name}</span>
                                            <span className="text-xs text-gray-500">Detected via EIP-6963</span>
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                </button>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                                <p className="font-mono">No providers detected.</p>
                                <p className="text-xs mt-2">Install MetaMask or similar to proceed.</p>
                            </div>
                        )}
                    </div>
                    <div className="p-4 bg-gray-950 text-center border-t border-gray-800">
                         <button onClick={() => setIsWalletModalOpen(false)} className="text-gray-500 hover:text-white text-sm font-medium transition-colors">Abort Connection</button>
                    </div>
                </div>
            </div>
        );
    };

    const renderStripeModal = () => {
        if (!isStripeModalOpen) return null;
        return (
             <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-lg" onClick={() => setStripeModalOpen(false)}>
                <div className="bg-gray-900 rounded-2xl shadow-[0_0_50px_rgba(124,58,237,0.15)] max-w-lg w-full border border-gray-700 flex flex-col" onClick={e=>e.stopPropagation()}>
                    <div className="p-8 bg-gradient-to-r from-gray-900 to-gray-800 rounded-t-2xl border-b border-gray-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
                        </div>
                        <h3 className="font-bold text-white text-2xl">Fiat-to-Crypto Bridge</h3>
                        <p className="text-purple-400 text-sm mt-1 font-mono">SECURE GATEWAY // STRIPE ENCRYPTED</p>
                        <div className="mt-6 flex items-baseline">
                            <span className="text-4xl font-bold text-white">${parseFloat(buyAmount).toFixed(2)}</span>
                            <span className="ml-2 text-gray-400">USD</span>
                        </div>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Card Information</label>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-600 flex items-center justify-between">
                                <span className="text-white font-mono text-lg tracking-widest">**** **** **** 4242</span>
                                <div className="flex space-x-2">
                                    <div className="w-8 h-5 bg-gray-600 rounded"></div>
                                </div>
                            </div>
                        </div>
                         <div className="flex gap-6">
                            <div className="flex-1 space-y-2">
                                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Expiry</label>
                                <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                                    <span className="text-white font-mono">12/25</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">CVC / CVV</label>
                                <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                                    <span className="text-white font-mono">••••</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                                <div>
                                    <p className="text-xs text-purple-300 font-bold">AI FRAUD DETECTION ACTIVE</p>
                                    <p className="text-xs text-purple-400/70 mt-1">Transaction is being monitored by neural security layer.</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleBuyCrypto} className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-purple-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                            Confirm Transaction
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500/30">
            {/* Header Bar */}
            <div className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800 px-6 py-4">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <span className="text-white font-bold text-xl">Îž</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-wide">NEXUS <span className="text-cyan-400">OS</span></h1>
                            <p className="text-xs text-gray-500 font-mono">ENTERPRISE WEB3 ENVIRONMENT v4.2.0</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-gray-400">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                <span>GAS: 12 GWEI</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                <span>ETH: $2,450.21</span>
                            </div>
                        </div>
                        
                        {walletInfo ? (
                            <div className="flex items-center gap-3 bg-gray-800 rounded-full pl-4 pr-2 py-1.5 border border-gray-700">
                                <div className="flex flex-col items-end mr-2">
                                    <span className="text-xs font-bold text-white">{walletInfo.balance.toFixed(4)} ETH</span>
                                    <span className="text-[10px] text-gray-400 font-mono">{shortenAddress(walletInfo.address)}</span>
                                </div>
                                <button onClick={disconnectWallet} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-full transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => setIsWalletModalOpen(true)} 
                                className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold py-2 px-6 rounded-full shadow-lg shadow-cyan-500/20 transition-all"
                            >
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-[1920px] mx-auto p-6 lg:p-8 space-y-8">
                
                {/* Tab Navigation */}
                <div className="flex overflow-x-auto border-b border-gray-800 scrollbar-hide">
                    <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} label="COMMAND CENTER" />
                    <TabButton active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} label="AI INTELLIGENCE" />
                    <TabButton active={activeTab === 'hft-terminal'} onClick={() => setActiveTab('hft-terminal')} label="HFT TERMINAL" />
                    <TabButton active={activeTab === 'quantum-analytics'} onClick={() => setActiveTab('quantum-analytics')} label="QUANTUM ANALYTICS" />
                    <TabButton active={activeTab === 'on-chain-forensics'} onClick={() => setActiveTab('on-chain-forensics')} label="ON-CHAIN FORENSICS" />
                    <TabButton active={activeTab === 'global-macro'} onClick={() => setActiveTab('global-macro')} label="GLOBAL MACRO" />
                    <TabButton active={activeTab === 'nft-valuation'} onClick={() => setActiveTab('nft-valuation')} label="ASSET VALUATION" />
                    <TabButton active={activeTab === 'defi-bridge'} onClick={() => setActiveTab('defi-bridge')} label="DEFI BRIDGE" />
                    <TabButton active={activeTab === 'governance'} onClick={() => setActiveTab('governance')} label="GOVERNANCE" />
                    <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} label="SECURITY" />
                    <TabButton active={activeTab === 'ai-model-config'} onClick={() => setActiveTab('ai-model-config')} label="AI CONFIG" />
                </div>

                {/* Dashboard View */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card title="Total Net Worth" className="border-t-4 border-t-cyan-500">
                                    <div className="mt-2">
                                        <h3 className="text-3xl font-bold text-white">${portfolioAnalytics.totalValue.toLocaleString()}</h3>
                                        <div className="flex items-center mt-2 text-green-400 text-sm font-bold">
                                            <span>â–² 4.2%</span>
                                            <span className="text-gray-500 ml-2 font-normal">vs last 24h</span>
                                        </div>
                                    </div>
                                </Card>
                                <Card title="AI Risk Score" className="border-t-4 border-t-purple-500">
                                    <div className="mt-2">
                                        <div className="flex justify-between items-end">
                                            <h3 className="text-3xl font-bold text-white">{portfolioAnalytics.riskScore.toFixed(0)}<span className="text-lg text-gray-500">/100</span></h3>
                                            <span className="text-purple-400 text-xs font-bold uppercase">Moderate</span>
                                        </div>
                                        <ConfidenceMeter score={portfolioAnalytics.riskScore} />
                                    </div>
                                </Card>
                                <Card title="Projected Yield (APY)" className="border-t-4 border-t-green-500">
                                    <div className="mt-2">
                                        <h3 className="text-3xl font-bold text-white">${portfolioAnalytics.projectedYield.toFixed(2)}</h3>
                                        <p className="text-xs text-gray-400 mt-2">Based on current staking protocols</p>
                                    </div>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card title="Asset Allocation" subtitle="AI-Optimized Distribution">
                                    <div className="h-80 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={cryptoAssets} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={4} dataKey="value" nameKey="name" stroke="none">
                                                    {cryptoAssets.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                                                </Pie>
                                                <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.5rem', color: '#fff' }} itemStyle={{ color: '#fff' }} formatter={(value: number) => `$${value.toLocaleString()}`} />
                                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                <Card title="Market Sentiment Analysis" subtitle="Real-time NLP Engine">
                                    <div className="h-full flex flex-col justify-center space-y-6 p-4">
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-green-400 font-bold">Bullish Sentiment</span>
                                                <span className="text-white">{marketSentiment.bullish}%</span>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${marketSentiment.bullish}%` }}></div></div>
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-2">
                                                <span className="text-red-400 font-bold">Bearish Sentiment</span>
                                                <span className="text-white">{marketSentiment.bearish}%</span>
                                            </div>
                                            <div className="w-full bg-gray-800 rounded-full h-2"><div className="bg-red-500 h-2 rounded-full" style={{ width: `${marketSentiment.bearish}%` }}></div></div>
                                        </div>
                                        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 mt-4">
                                            <p className="text-sm text-gray-300 italic">"AI detects a strong accumulation pattern in Layer 2 protocols. Volatility expected to decrease."</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            <Card title="Quantum Virtual Card" className="relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4"><AIStatusBadge status={isAiThinking ? 'thinking' : 'active'} /></div>
                                <div className="mt-6 flex flex-col items-center">
                                    {virtualCard ? (
                                        <div className="w-full aspect-[1.586] rounded-2xl p-6 flex flex-col justify-between bg-gradient-to-br from-gray-900 via-slate-900 to-black border border-gray-700 shadow-2xl relative group overflow-hidden">
                                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-cyan-500/20 blur-3xl rounded-full"></div>
                                            <div className="relative z-10 flex justify-between items-start">
                                                <div className="text-white font-bold tracking-widest text-lg">NEXUS</div>
                                                <svg className="w-10 h-10 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                                            </div>
                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-8 h-5 bg-yellow-600/80 rounded flex overflow-hidden"><div className="w-1/2 h-full border-r border-yellow-700/50"></div></div>
                                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </div>
                                                <p className="font-mono text-xl text-white tracking-widest shadow-black drop-shadow-md">{virtualCard.cardNumber}</p>
                                                <div className="flex justify-between text-xs font-mono text-gray-300 mt-4">
                                                    <div className="flex flex-col"><span className="text-[10px] text-gray-500">CARD HOLDER</span><span>{virtualCard.holderName.toUpperCase()}</span></div>
                                                    <div className="flex flex-col items-end"><span className="text-[10px] text-gray-500">VALID THRU</span><span>{virtualCard.expiry}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse"><span className="text-2xl">ðŸ’³</span></div>
                                            <p className="text-gray-400 mb-6 text-sm">Generate a cryptographically secure virtual card for global payments.</p>
                                            <button onClick={handleIssueCard} disabled={isIssuingCard} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20">
                                                {isIssuingCard ? (<span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Encrypting...</span>) : 'Initialize Card Issuance'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Card title="Quick Actions">
                                <div className="grid grid-cols-2 gap-3">
                                    <button onClick={() => setStripeModalOpen(true)} className="flex flex-col items-center justify-center p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all group"><div className="w-10 h-10 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-2 group-hover:bg-green-500 group-hover:text-white transition-colors"><span className="text-xl font-bold">$</span></div><span className="text-sm font-medium text-gray-300">Buy Crypto</span></button>
                                    <button className="flex flex-col items-center justify-center p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all group"><div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2 group-hover:bg-blue-500 group-hover:text-white transition-colors"><span className="text-xl font-bold">â‡„</span></div><span className="text-sm font-medium text-gray-300">Swap</span></button>
                                    <button className="flex flex-col items-center justify-center p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all group"><div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2 group-hover:bg-purple-500 group-hover:text-white transition-colors"><span className="text-xl font-bold">âš—</span></div><span className="text-sm font-medium text-gray-300">Stake</span></button>
                                    <button className="flex flex-col items-center justify-center p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-700 transition-all group"><div className="w-10 h-10 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-2 group-hover:bg-orange-500 group-hover:text-white transition-colors"><span className="text-xl font-bold">âš¡</span></div><span className="text-sm font-medium text-gray-300">Bridge</span></button>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* AI Intelligence View */}
                {activeTab === 'intelligence' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <Card title="AI Market Insights" className="flex-1">
                                <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                                    {aiInsights.map(insight => (
                                        <div key={insight.id} className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 flex items-start gap-4 hover:bg-gray-800 transition-colors">
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${insight.type === 'opportunity' ? 'bg-green-500' : insight.type === 'warning' ? 'bg-red-500' : insight.type === 'alpha' ? 'bg-yellow-400' : 'bg-blue-500'}`}></div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className={`text-sm font-bold uppercase tracking-wide ${insight.type === 'opportunity' ? 'text-green-400' : insight.type === 'warning' ? 'text-red-400' : insight.type === 'alpha' ? 'text-yellow-400' : 'text-blue-400'}`}>{insight.type}</h4>
                                                    <span className="text-xs text-gray-500 font-mono">{insight.timestamp}</span>
                                                </div>
                                                <p className="text-gray-300 mt-1 text-sm leading-relaxed">{insight.message}</p>
                                                <div className="mt-3 flex items-center gap-2">
                                                    <span className="text-xs text-gray-500">AI Confidence:</span>
                                                    <div className="w-24 bg-gray-700 rounded-full h-1.5"><div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${insight.confidence}%` }}></div></div>
                                                    <span className="text-xs text-cyan-400 font-mono">{insight.confidence}%</span>
                                                </div>
                                                {insight.actionable && <button className="text-xs bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full mt-3 hover:bg-cyan-500/20">Execute Trade</button>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                        <div className="lg:col-span-1 flex flex-col h-full">
                            <Card title="Neural Assistant" className="flex-1 flex flex-col h-full">
                                <div className="flex-1 overflow-y-auto space-y-4 p-2 mb-4 custom-scrollbar min-h-[300px]">
                                    {chatHistory.map(msg => (
                                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-cyan-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'}`}>
                                                <p>{msg.text}{msg.sender === 'ai_core' && isAiThinking && msg.id === chatHistory[chatHistory.length - 1].id && <span className="inline-block w-2 h-4 bg-white ml-1 animate-pulse"></span>}</p>
                                                {msg.actions && <div className="mt-2 border-t border-gray-700 pt-2 flex gap-2">{msg.actions.map(a => <button key={a.label} onClick={a.action} className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded">{a.label}</button>)}</div>}
                                                <p className={`text-[10px] mt-1 opacity-50 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleChatSubmit} className="relative">
                                    <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400" title="Attach file (multimodal input)">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 1110.53 9.53l3.454-3.552a.75.75 0 011.06 1.06l-3.453 3.552a1.125 1.125 0 001.591 1.59l3.455-3.553a3 3 0 000-4.242z" clipRule="evenodd" /></svg>
                                    </button>
                                    <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask AI... (e.g., 'analyze BTC on-chain data')" className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3 pl-10 pr-12 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
                                    <button type="submit" disabled={isAiThinking} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                                        {isAiThinking ? 
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                            :
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                        }
                                    </button>
                                </form>
                            </Card>
                        </div>
                    </div>
                )}

                {/* HFT Terminal View */}
                {activeTab === 'hft-terminal' && (
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-3">
                            <Card title="Trade Execution" className="h-full">
                                <div className="space-y-4">
                                    <div><label className="text-xs text-gray-400">Pair</label><input type="text" value={hftPair} onChange={e => setHftPair(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 mt-1 text-white" /></div>
                                    <div className="grid grid-cols-2 gap-2"><button onClick={() => setHftSide('BUY')} className={`p-2 rounded-md text-sm font-bold ${hftSide === 'BUY' ? 'bg-green-500' : 'bg-gray-700'}`}>BUY</button><button onClick={() => setHftSide('SELL')} className={`p-2 rounded-md text-sm font-bold ${hftSide === 'SELL' ? 'bg-red-500' : 'bg-gray-700'}`}>SELL</button></div>
                                    <div className="grid grid-cols-2 gap-2"><button onClick={() => setHftOrderType('LIMIT')} className={`p-2 rounded-md text-xs ${hftOrderType === 'LIMIT' ? 'bg-cyan-600' : 'bg-gray-700'}`}>LIMIT</button><button onClick={() => setHftOrderType('MARKET')} className={`p-2 rounded-md text-xs ${hftOrderType === 'MARKET' ? 'bg-cyan-600' : 'bg-gray-700'}`}>MARKET</button></div>
                                    {hftOrderType === 'LIMIT' && <div><label className="text-xs text-gray-400">Price</label><input type="text" value={hftPrice} onChange={e => setHftPrice(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 mt-1 text-white" /></div>}
                                    <div><label className="text-xs text-gray-400">Amount</label><input type="text" value={hftAmount} onChange={e => setHftAmount(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 mt-1 text-white" /></div>
                                    <button className={`w-full p-3 rounded-md font-bold text-white ${hftSide === 'BUY' ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}>Place Order</button>
                                </div>
                            </Card>
                        </div>
                        <div className="col-span-12 lg:col-span-6">
                            <Card title={`Price Chart: ${hftPair}`} subtitle="Real-time data feed (1ms latency)">
                                <div className="h-96 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={priceChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <defs><linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient></defs>
                                            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} stroke="#374151" />
                                            <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: '#6b7280', fontSize: 12 }} stroke="#374151" />
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                            <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                                            <Area type="monotone" dataKey="price" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPrice)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                        <div className="col-span-12 lg:col-span-3">
                            <Card title="AI Trading Bots" className="h-full">
                                <div className="space-y-3">
                                    {aiTradingBots.map(bot => (
                                        <div key={bot.id} className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${bot.status === 'active' ? 'bg-green-500' : bot.status === 'paused' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
                                                    <span className="font-bold text-sm">{bot.name}</span>
                                                </div>
                                                <span className={`text-xs font-bold ${bot.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>{bot.pnl >= 0 ? '+' : ''}${bot.pnl.toFixed(2)}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{bot.strategy} Strategy</p>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Quantum Analytics View */}
                {activeTab === 'quantum-analytics' && (
                    <div className="grid grid-cols-1 gap-6">
                        <Card title="Quantum Entanglement Signal Processor" subtitle="Monitoring subspace for alpha signals">
                            <div className="h-96 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={quantumEntanglementData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="colorSignal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                                            <linearGradient id="colorNoise" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6b7280" stopOpacity={0.5}/><stop offset="95%" stopColor="#6b7280" stopOpacity={0}/></linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} stroke="#374151" />
                                        <YAxis domain={['dataMin - 20', 'dataMax + 20']} tick={{ fill: '#6b7280', fontSize: 12 }} stroke="#374151" />
                                        <CartesianGrid strokeDasharray="1 5" stroke="#374151" />
                                        <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151' }} />
                                        <Area type="monotone" dataKey="signal" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorSignal)" />
                                        <Area type="monotone" dataKey="noise" stroke="#6b7280" fillOpacity={0.5} fill="url(#colorNoise)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                )}

                {/* On-Chain Forensics View */}
                {activeTab === 'on-chain-forensics' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Card title="Transaction Visualizer">
                                <div className="h-96 flex items-center justify-center bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                                    <p className="text-gray-500">Transaction graph will be rendered here.</p>
                                </div>
                            </Card>
                        </div>
                        <div>
                            <Card title="Wallet Profiler">
                                <div className="space-y-4">
                                    <input type="text" placeholder="Enter wallet address or ENS..." className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white" />
                                    <button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-md">Profile Wallet</button>
                                    <div className="border-t border-gray-700 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm"><span className="text-gray-400">Risk Score:</span><span className="text-green-400 font-bold">12 (Low)</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-gray-400">Associated with CEX:</span><span className="text-white">Yes</span></div>
                                        <div className="flex justify-between text-sm"><span className="text-gray-400">Interaction with Mixers:</span><span className="text-red-400 font-bold">No</span></div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Global Macro View */}
                {activeTab === 'global-macro' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card title="S&P 500">
                            <h3 className="text-3xl font-bold text-white mt-2">{globalMacroData.sp500.value.toFixed(2)}</h3>
                            <p className={`text-sm font-bold ${globalMacroData.sp500.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{globalMacroData.sp500.change >= 0 ? 'â–²' : 'â–¼'} {globalMacroData.sp500.change.toFixed(2)}%</p>
                        </Card>
                        <Card title="US Dollar Index (DXY)">
                            <h3 className="text-3xl font-bold text-white mt-2">{globalMacroData.dxy.value.toFixed(2)}</h3>
                            <p className={`text-sm font-bold ${globalMacroData.dxy.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{globalMacroData.dxy.change >= 0 ? 'â–²' : 'â–¼'} {globalMacroData.dxy.change.toFixed(2)}%</p>
                        </Card>
                        <Card title="Gold (XAU/USD)">
                            <h3 className="text-3xl font-bold text-white mt-2">${globalMacroData.gold.value.toFixed(2)}</h3>
                            <p className={`text-sm font-bold ${globalMacroData.gold.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{globalMacroData.gold.change >= 0 ? 'â–²' : 'â–¼'} {globalMacroData.gold.change.toFixed(2)}%</p>
                        </Card>
                        <Card title="Crude Oil (WTI)">
                            <h3 className="text-3xl font-bold text-white mt-2">${globalMacroData.oil.value.toFixed(2)}</h3>
                            <p className={`text-sm font-bold ${globalMacroData.oil.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>{globalMacroData.oil.change >= 0 ? 'â–²' : 'â–¼'} {globalMacroData.oil.change.toFixed(2)}%</p>
                        </Card>
                        <div className="md:col-span-2 lg:col-span-4">
                            <Card title="Geopolitical Risk Index">
                                <div className="flex items-center gap-6 pt-4">
                                    <div className="text-5xl font-bold text-orange-400">{globalMacroData.geopoliticalRiskIndex}</div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-300 mb-2">AI-driven index based on global news sentiment, military movements, and diplomatic relations.</p>
                                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                                            <div className="bg-gradient-to-r from-yellow-500 to-red-600 h-2.5 rounded-full" style={{ width: `${globalMacroData.geopoliticalRiskIndex}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* NFT Valuation View */}
                {activeTab === 'nft-valuation' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">Digital Asset Gallery</h2>
                            <div className="flex gap-2"><span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400 border border-gray-700">Total Items: {nftAssets.length}</span><span className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400 border border-gray-700">Est. Value: 12.4 ETH</span></div>
                        </div>
                        {nftAssets.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {nftAssets.map(nft => (
                                    <div key={nft.id} className="group bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-1">
                                        <div className="relative aspect-square overflow-hidden"><img src={nft.imageUrl} alt={nft.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /><div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10"><span className="text-xs font-bold text-white">#{nft.id.substring(0, 4)}</span></div></div>
                                        <div className="p-5">
                                            <h3 className="text-lg font-bold text-white truncate">{nft.name}</h3><p className="text-xs text-gray-500 font-mono truncate mb-4">{nft.contractAddress}</p>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-sm"><span className="text-gray-400">Floor Price</span><span className="text-white font-medium">0.45 ETH</span></div>
                                                <div className="flex justify-between items-center text-sm"><span className="text-gray-400">AI Valuation</span><span className="text-cyan-400 font-bold">0.52 ETH</span></div>
                                                <div className="w-full bg-gray-700 rounded-full h-1 mt-2"><div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1 rounded-full" style={{ width: '75%' }}></div></div>
                                                <p className="text-[10px] text-gray-500 text-right">High Liquidity Demand</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 bg-gray-800/30 rounded-3xl border border-dashed border-gray-700"><div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4"><span className="text-3xl opacity-50">ðŸ–¼ï¸ </span></div><h3 className="text-xl font-bold text-white">No Assets Detected</h3><p className="text-gray-500 mt-2">Connect a wallet containing NFTs to view AI valuations.</p></div>
                        )}
                    </div>
                )}

                {/* DeFi Bridge View */}
                {activeTab === 'defi-bridge' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card title="Cross-Chain Bridge"><div className="space-y-6 py-4"><div className="bg-gray-900 p-4 rounded-xl border border-gray-700"><label className="text-xs text-gray-500 uppercase font-bold">From Network</label><div className="flex items-center justify-between mt-2"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-gray-700"></div><span className="text-white font-bold">Ethereum Mainnet</span></div><span className="text-gray-400">â–¼</span></div></div><div className="flex justify-center -my-3 relative z-10"><div className="bg-gray-800 p-2 rounded-full border border-gray-600"><span className="text-white">â†“</span></div></div><div className="bg-gray-900 p-4 rounded-xl border border-gray-700"><label className="text-xs text-gray-500 uppercase font-bold">To Network</label><div className="flex items-center justify-between mt-2"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-purple-600"></div><span className="text-white font-bold">Polygon PoS</span></div><span className="text-gray-400">â–¼</span></div></div><button className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-colors">Initiate Bridge Transfer</button></div></Card>
                        <Card title="Yield Farming Opportunities"><div className="space-y-4">{[1, 2, 3].map(i => (<div key={i} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl border border-gray-700 hover:border-green-500/50 transition-colors cursor-pointer"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500"></div><div><h4 className="text-white font-bold">USDC / ETH LP</h4><p className="text-xs text-gray-400">Uniswap V3</p></div></div><div className="text-right"><p className="text-green-400 font-bold text-lg">12.4% APY</p><p className="text-xs text-gray-500">TVL: $450M</p></div></div>))}</div></Card>
                    </div>
                )}

                {/* Governance View */}
                {activeTab === 'governance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <Card title="Active Governance Proposals">
                                <div className="space-y-4">
                                    {governanceProposals.map(p => (
                                        <div key={p.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-3"><span className="text-2xl">{p.protocolIcon}</span><h4 className="font-bold text-white">{p.title}</h4></div>
                                                    <p className="text-xs text-gray-400 mt-1">Protocol: {p.protocol}</p>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded-full ${p.status === 'active' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{p.status}</span>
                                            </div>
                                            {p.status === 'active' && !p.userVote && <div className="flex gap-2 mt-4 border-t border-gray-700 pt-3"><button className="text-sm bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-md">Vote For</button><button className="text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-md">Vote Against</button><button className="text-sm bg-gray-600/50 hover:bg-gray-600/80 text-gray-300 px-4 py-2 rounded-md">Abstain</button></div>}
                                            {p.userVote && <p className="text-sm mt-3 text-cyan-400">You voted: <span className="font-bold uppercase">{p.userVote}</span></p>}
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                        <div><Card title="Voting Power"><h3 className="text-4xl font-bold text-white mt-2">1,240.5 <span className="text-lg text-gray-400">VP</span></h3><p className="text-xs text-gray-500 mt-2">Aggregated from held governance tokens.</p></Card></div>
                    </div>
                )}

                {/* Security Center View */}
                {activeTab === 'security' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card title="Threat Analysis Center">
                            <div className="space-y-4">
                                <label className="text-sm font-bold">AI Smart Contract Auditor</label>
                                <div className="flex gap-2"><input type="text" placeholder="Paste contract address..." className="flex-grow bg-gray-800 border border-gray-700 rounded-md p-2 text-white" /><button className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-4 py-2 rounded-md">Scan</button></div>
                                <div className="bg-green-900/30 border border-green-500/50 p-4 rounded-lg"><h4 className="text-green-400 font-bold">Scan Result: No Vulnerabilities Detected</h4><p className="text-xs text-green-400/70 mt-1">Contract code appears safe based on 4,096 simulation runs.</p></div>
                            </div>
                        </Card>
                        <Card title="Active Security Shields">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-gray-800 p-3 rounded-lg"><span className="text-white font-medium">Phishing Protection</span><span className="text-green-400 text-sm font-bold">ACTIVE</span></div>
                                <div className="flex justify-between items-center bg-gray-800 p-3 rounded-lg"><span className="text-white font-medium">Rugpull Prediction</span><span className="text-green-400 text-sm font-bold">ACTIVE</span></div>
                                <div className="flex justify-between items-center bg-gray-800 p-3 rounded-lg"><span className="text-white font-medium">Transaction Obfuscation</span><span className="text-gray-500 text-sm font-bold">DISABLED</span></div>
                            </div>
                        </Card>
                    </div>
                )}

                {/* AI Model Config View */}
                {activeTab === 'ai-model-config' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="AI Core Configuration" subtitle="Fine-tune the behavior of the Nexus AI">
                            <div className="space-y-6 pt-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-300">Active Model</label>
                                    <p className="text-xs text-gray-500 mb-2">Gemini 2.5 Pro offers advanced reasoning, while Flash is optimized for speed.</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setAiModel('gemini-2.5-pro')} className={`flex-1 p-3 rounded-md text-sm font-bold transition-colors ${aiModel === 'gemini-2.5-pro' ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>Gemini 2.5 Pro</button>
                                        <button onClick={() => setAiModel('gemini-2.5-flash')} className={`flex-1 p-3 rounded-md text-sm font-bold transition-colors ${aiModel === 'gemini-2.5-flash' ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>Gemini 2.5 Flash</button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-300">System Instruction</label>
                                    <p className="text-xs text-gray-500 mb-2">Define the AI's persona and core directives.</p>
                                    <textarea 
                                        value={systemInstruction}
                                        onChange={e => setSystemInstruction(e.target.value)}
                                        rows={4}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-300">Thinking Budget</label>
                                    <p className="text-xs text-gray-500 mb-2">Allow the AI extra processing time for higher quality responses. Disabling results in faster, potentially less nuanced answers.</p>
                                    <div onClick={() => setThinkingBudget(!thinkingBudget)} className="cursor-pointer flex items-center gap-3 bg-gray-800 p-3 rounded-lg border border-gray-700">
                                        <div className={`w-12 h-6 rounded-full flex items-center transition-colors ${thinkingBudget ? 'bg-cyan-500' : 'bg-gray-600'}`}>
                                            <span className={`block w-5 h-5 bg-white rounded-full transform transition-transform ${thinkingBudget ? 'translate-x-6' : 'translate-x-1'}`}></span>
                                        </div>
                                        <span className="font-bold text-white">{thinkingBudget ? 'Enabled' : 'Disabled (Zero Budget)'}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                        <Card title="Configuration Impact Analysis">
                            <div className="text-center py-10">
                                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/10">
                                    <span className="text-4xl">ðŸ§ </span>
                                </div>
                                <h3 className="text-xl font-bold text-white">Live AI Monitoring</h3>
                                <p className="text-gray-400 mt-2">Your changes will be applied in real-time.</p>
                                <div className="mt-6 space-y-3 text-left max-w-sm mx-auto font-mono text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Model:</span> <span className="text-cyan-400">{aiModel}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Thinking:</span> <span className="text-cyan-400">{thinkingBudget ? 'ON' : 'OFF'}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Est. Latency:</span> <span className="text-cyan-400">{aiModel === 'gemini-2.5-pro' && thinkingBudget ? '~1.5s' : '~0.2s'}</span></div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Modals */}
            {renderWalletModal()}
            {renderStripeModal()}
        </div>
    );
};

export default CryptoView;