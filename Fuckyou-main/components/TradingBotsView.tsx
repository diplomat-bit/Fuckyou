import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { 
    Bot, Activity, Zap, ShieldAlert, Play, Pause, Settings, 
    TrendingUp, Plus, RefreshCw, Sliders, Terminal, CheckCircle2, 
    AlertCircle, DollarSign, Layers, ArrowUpRight, ArrowDownRight, Cpu 
} from 'lucide-react';

interface BotStrategy {
    id: string;
    name: string;
    type: string;
    status: 'running' | 'paused' | 'backtesting' | 'error';
    pnl24h: number;
    totalPnl: number;
    winRate: number;
    trades24h: number;
    allocation: number;
    riskProfile: 'Conservative' | 'Moderate' | 'Aggressive' | 'Sovereign';
    description: string;
    lastExecuted: string;
}

const INITIAL_BOTS: BotStrategy[] = [
    {
        id: 'bot-1',
        name: 'TQQQ Sovereign Momentum Terminal',
        type: 'Triple Leveraged ETF Strategy',
        status: 'running',
        pnl24h: 3.42,
        totalPnl: 48.15,
        winRate: 74.2,
        trades24h: 18,
        allocation: 150000,
        riskProfile: 'Aggressive',
        description: 'Algorithmic dynamic hedging & volatility breakout model tuned for TQQQ/SQQQ rotation.',
        lastExecuted: '2 mins ago'
    },
    {
        id: 'bot-2',
        name: 'BTC/USD Swing Arbitrage Engine',
        type: 'Crypto Cross-Venue Arbitrage',
        status: 'running',
        pnl24h: 1.84,
        totalPnl: 32.80,
        winRate: 88.5,
        trades24h: 42,
        allocation: 250000,
        riskProfile: 'Moderate',
        description: 'Orderbook imbalance & statistical arbitrage between Coinbase, Kraken, and Alpaca Crypto.',
        lastExecuted: '34 secs ago'
    },
    {
        id: 'bot-3',
        name: 'Yield Farmer Pro (DeFi + Modern Treasury)',
        type: 'Automated Liquidity Optimization',
        status: 'running',
        pnl24h: 0.65,
        totalPnl: 14.30,
        winRate: 99.1,
        trades24h: 6,
        allocation: 500000,
        riskProfile: 'Conservative',
        description: 'Optimizes yield routes across Aave v3, Lido, and Automated Money Market Treasury Sweep.',
        lastExecuted: '12 mins ago'
    },
    {
        id: 'bot-4',
        name: 'Tax-Lien Distressed Debt Sweeper',
        type: 'Government Lien Auction Bot',
        status: 'paused',
        pnl24h: 0.00,
        totalPnl: 22.10,
        winRate: 91.0,
        trades24h: 0,
        allocation: 100000,
        riskProfile: 'Sovereign',
        description: 'Real-time monitoring of Florida, NY, and CA tax certificate auctions with instant lien bidding.',
        lastExecuted: '3 days ago'
    }
];

const INITIAL_LOGS = [
    { id: '1', time: '14:32:05', bot: 'TQQQ Momentum', message: 'Executed BUY order 250 shares TQQQ @ $68.42', type: 'info' },
    { id: '2', time: '14:31:18', bot: 'BTC Swing Engine', message: 'Arb gap filled across Alpaca/Kraken (+0.14% spread)', type: 'success' },
    { id: '3', time: '14:28:40', bot: 'Yield Farmer Pro', message: 'Rebalanced 50,000 USDC into High-Yield Treasury Vault', type: 'info' },
    { id: '4', time: '14:15:02', bot: 'TQQQ Momentum', message: 'Stop-loss trailing stop moved to $67.80', type: 'warning' },
    { id: '5', time: '14:00:00', bot: 'System', message: 'Neural Risk Model recalculation completed. All systems nominal.', type: 'system' }
];

const TradingBotsView: React.FC = () => {
    const context = useContext(DataContext);
    const [bots, setBots] = useState<BotStrategy[]>(INITIAL_BOTS);
    const [selectedBot, setSelectedBot] = useState<BotStrategy | null>(INITIAL_BOTS[0]);
    const [activeTab, setActiveTab] = useState<'overview' | 'terminal' | 'logs'>('overview');
    const [logs, setLogs] = useState(INITIAL_LOGS);
    const [isSimulating, setIsSimulating] = useState(false);

    if (!context) return null;

    const toggleBotStatus = (id: string) => {
        setBots(prev => prev.map(bot => {
            if (bot.id === id) {
                const nextStatus = bot.status === 'running' ? 'paused' : 'running';
                const newLog = {
                    id: Date.now().toString(),
                    time: new Date().toLocaleTimeString(),
                    bot: bot.name,
                    message: `Strategy ${nextStatus === 'running' ? 'activated' : 'paused'} by operator.`,
                    type: nextStatus === 'running' ? 'success' : 'warning'
                };
                setLogs(l => [newLog, ...l]);
                return { ...bot, status: nextStatus };
            }
            return bot;
        }));
    };

    const runQuickScan = () => {
        setIsSimulating(true);
        setTimeout(() => {
            setIsSimulating(false);
            const scanLog = {
                id: Date.now().toString(),
                time: new Date().toLocaleTimeString(),
                bot: 'Neural Engine',
                message: 'Global alpha scan finished. 3 optimal execution routes detected across Alpaca & Citi.',
                type: 'success'
            };
            setLogs(l => [scanLog, ...l]);
        }, 1200);
    };

    const totalAllocation = bots.reduce((acc, b) => acc + b.allocation, 0);
    const runningBotsCount = bots.filter(b => b.status === 'running').length;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 text-gray-100">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                            <Bot size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                                Autonomous Trading Matrix
                                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                                    OKO v4.2
                                </span>
                            </h1>
                            <p className="text-gray-400 text-sm mt-1">
                                Algorithmic execution, multi-asset quantitative strategies & high-frequency yield bots.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={runQuickScan}
                        disabled={isSimulating}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl border border-white/10 font-medium text-sm transition-all shadow-lg active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isSimulating ? 'animate-spin text-cyan-400' : ''} />
                        {isSimulating ? 'Scanning Markets...' : 'Run Alpha Scan'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20 active:scale-95">
                        <Plus size={16} />
                        Deploy New Bot
                    </button>
                </div>
            </header>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Strategies</span>
                        <Cpu className="text-cyan-400" size={18} />
                    </div>
                    <div className="text-3xl font-black text-white flex items-baseline gap-2">
                        {runningBotsCount} <span className="text-sm font-normal text-gray-400">/ {bots.length} active</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        Neural cluster online
                    </div>
                </div>

                <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Capital Allocated</span>
                        <DollarSign className="text-purple-400" size={18} />
                    </div>
                    <div className="text-3xl font-black text-white">
                        ${totalAllocation.toLocaleString()}
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                        Pooled across 4 liquidity venues
                    </div>
                </div>

                <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">24h Alpha Return</span>
                        <TrendingUp className="text-emerald-400" size={18} />
                    </div>
                    <div className="text-3xl font-black text-emerald-400 flex items-center gap-1">
                        +2.48%
                    </div>
                    <div className="mt-2 text-xs text-emerald-400/80 flex items-center gap-1">
                        <ArrowUpRight size={14} /> +$24,800 unrealized gain
                    </div>
                </div>

                <div className="bg-gray-900/60 border border-white/5 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Risk Matrix Threshold</span>
                        <ShieldAlert className="text-amber-400" size={18} />
                    </div>
                    <div className="text-3xl font-black text-white">
                        Optimal
                    </div>
                    <div className="mt-2 text-xs text-amber-400/80">
                        Max drawdown limit: 3.5%
                    </div>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        activeTab === 'overview'
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Layers size={16} />
                    Active Bots ({bots.length})
                </button>
                <button
                    onClick={() => setActiveTab('terminal')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        activeTab === 'terminal'
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Sliders size={16} />
                    Bot Control & Parameter Tuning
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        activeTab === 'logs'
                            ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <Terminal size={16} />
                    Execution Terminal & Telemetry
                </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Bot Cards List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Zap className="text-cyan-400" size={18} />
                            Deployed Quantitative Algorithms
                        </h2>

                        {bots.map((bot) => (
                            <div
                                key={bot.id}
                                onClick={() => setSelectedBot(bot)}
                                className={`p-5 rounded-2xl border transition-all cursor-pointer backdrop-blur-xl ${
                                    selectedBot?.id === bot.id
                                        ? 'bg-cyan-950/20 border-cyan-500/40 shadow-lg shadow-cyan-950/30'
                                        : 'bg-gray-900/40 border-white/5 hover:border-white/20 hover:bg-gray-900/70'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-3 rounded-xl ${
                                            bot.status === 'running' 
                                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                                                : 'bg-gray-800 text-gray-500 border border-gray-700'
                                        }`}>
                                            <Bot size={22} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-base font-bold text-white">{bot.name}</h3>
                                                <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                                                    bot.status === 'running' 
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                }`}>
                                                    {bot.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">{bot.type}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleBotStatus(bot.id);
                                        }}
                                        className={`p-2 rounded-xl border transition-all ${
                                            bot.status === 'running'
                                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                        }`}
                                        title={bot.status === 'running' ? 'Pause Bot' : 'Activate Bot'}
                                    >
                                        {bot.status === 'running' ? <Pause size={18} /> : <Play size={18} />}
                                    </button>
                                </div>

                                <p className="text-xs text-gray-300 mt-3 line-clamp-2 leading-relaxed">
                                    {bot.description}
                                </p>

                                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5 text-xs">
                                    <div>
                                        <div className="text-gray-500">24h Return</div>
                                        <div className={`font-bold mt-0.5 ${bot.pnl24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {bot.pnl24h >= 0 ? '+' : ''}{bot.pnl24h}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">All-Time PnL</div>
                                        <div className="font-bold text-white mt-0.5">+{bot.totalPnl}%</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Win Rate</div>
                                        <div className="font-bold text-cyan-400 mt-0.5">{bot.winRate}%</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">Capital</div>
                                        <div className="font-bold text-white mt-0.5">${(bot.allocation / 1000).toFixed(0)}k</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bot Details Panel */}
                    <div className="space-y-6">
                        {selectedBot ? (
                            <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6 sticky top-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{selectedBot.name}</h3>
                                        <span className="text-xs text-gray-400 font-mono">ID: {selectedBot.id}</span>
                                    </div>
                                    <button 
                                        onClick={() => toggleBotStatus(selectedBot.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                            selectedBot.status === 'running'
                                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-rose-500/30'
                                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                                        }`}
                                    >
                                        {selectedBot.status === 'running' ? 'Halt Bot' : 'Start Bot'}
                                    </button>
                                </div>

                                <div className="space-y-4 text-sm">
                                    <div>
                                        <span className="text-xs text-gray-400 uppercase font-semibold">Strategy Overview</span>
                                        <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                                            {selectedBot.description}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 bg-black/30 p-3 rounded-xl border border-white/5">
                                        <div>
                                            <div className="text-xs text-gray-500">Risk Profile</div>
                                            <div className="font-semibold text-amber-400 text-xs mt-0.5">{selectedBot.riskProfile}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">24h Executions</div>
                                            <div className="font-semibold text-white text-xs mt-0.5">{selectedBot.trades24h} trades</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Last Trigger</div>
                                            <div className="font-semibold text-gray-300 text-xs mt-0.5">{selectedBot.lastExecuted}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500">Allocated Pool</div>
                                            <div className="font-semibold text-cyan-400 text-xs mt-0.5">${selectedBot.allocation.toLocaleString()}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                                            <span>Target PnL Allocation</span>
                                            <span className="text-white font-medium">82% Achieved</span>
                                        </div>
                                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 w-[82%]" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-white/10 flex gap-2">
                                    <button 
                                        onClick={() => setActiveTab('terminal')}
                                        className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl text-xs transition-all border border-white/10 flex items-center justify-center gap-1.5"
                                    >
                                        <Settings size={14} />
                                        Tune Parameters
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-900/40 border border-white/5 rounded-2xl p-8 text-center text-gray-500">
                                Select a bot to view full telemetry and parameters.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB 2: TERMINAL / PARAMETER TUNING */}
            {activeTab === 'terminal' && selectedBot && (
                <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sliders className="text-cyan-400" size={20} />
                                Configuration: {selectedBot.name}
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">Adjust quantitative thresholds, max leverage, and risk parameters.</p>
                        </div>
                        <button 
                            onClick={() => {
                                const newLog = {
                                    id: Date.now().toString(),
                                    time: new Date().toLocaleTimeString(),
                                    bot: selectedBot.name,
                                    message: 'Updated hyperparameters saved and synced to execution cluster.',
                                    type: 'info'
                                };
                                setLogs(l => [newLog, ...l]);
                                alert('Parameters updated successfully!');
                            }}
                            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20"
                        >
                            Save Parameters
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-xs font-semibold uppercase text-gray-400">Capital Allocation ($)</span>
                                <input 
                                    type="number" 
                                    defaultValue={selectedBot.allocation}
                                    className="mt-1.5 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs font-semibold uppercase text-gray-400">Max Stop Loss (%)</span>
                                <input 
                                    type="number" 
                                    defaultValue={2.5}
                                    step={0.1}
                                    className="mt-1.5 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs font-semibold uppercase text-gray-400">Take Profit Threshold (%)</span>
                                <input 
                                    type="number" 
                                    defaultValue={6.0}
                                    step={0.1}
                                    className="mt-1.5 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                                />
                            </label>
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-xs font-semibold uppercase text-gray-400">Execution Frequency</span>
                                <select className="mt-1.5 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500">
                                    <option value="realtime">High-Frequency Real-Time (&lt; 10ms)</option>
                                    <option value="5m">5 Minute Dynamic Candle</option>
                                    <option value="1h">1 Hour Swing Sweeper</option>
                                    <option value="daily">End of Day Rebalance</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-xs font-semibold uppercase text-gray-400">Risk Profile Override</span>
                                <select defaultValue={selectedBot.riskProfile} className="mt-1.5 w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-500">
                                    <option value="Conservative">Conservative (Low Volatility)</option>
                                    <option value="Moderate">Moderate (Standard Momentum)</option>
                                    <option value="Aggressive">Aggressive (Leveraged Momentum)</option>
                                    <option value="Sovereign">Sovereign (Max Takeover Alpha)</option>
                                </select>
                            </label>

                            <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-xl flex items-center gap-3">
                                <ShieldAlert size={20} className="text-cyan-400 shrink-0" />
                                <span className="text-xs text-cyan-200">
                                    Smart Circuit Breaker: Automatically halts orders if slippage exceeds 0.5% or venue depth degrades.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: EXECUTION LOGS */}
            {activeTab === 'logs' && (
                <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Terminal className="text-cyan-400" size={20} />
                            Real-Time Cluster Execution Log
                        </h2>
                        <span className="text-xs font-mono text-gray-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            Live Stream Active
                        </span>
                    </div>

                    <div className="bg-black/60 rounded-xl p-4 font-mono text-xs space-y-2 max-h-[400px] overflow-y-auto border border-white/10">
                        {logs.map((log) => (
                            <div key={log.id} className="flex items-start gap-3 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                <span className="text-gray-500 shrink-0">{log.time}</span>
                                <span className="text-cyan-400 font-semibold shrink-0">[{log.bot}]</span>
                                <span className={`flex-1 ${
                                    log.type === 'error' ? 'text-rose-400' :
                                    log.type === 'warning' ? 'text-amber-300' :
                                    log.type === 'success' ? 'text-emerald-400' : 'text-gray-300'
                                }`}>
                                    {log.message}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TradingBotsView;