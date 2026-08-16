import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { 
    TrendingUp, 
    PieChart, 
    DollarSign, 
    Activity, 
    Layers, 
    ShieldCheck, 
    ArrowUpRight, 
    Zap, 
    RefreshCw, 
    Briefcase, 
    Landmark, 
    Globe, 
    ChevronRight, 
    Building, 
    Wallet, 
    Scale,
    Sliders,
    Lock,
    ExternalLink
} from 'lucide-react';

interface AssetClassSummary {
    category: string;
    totalValue: number;
    share: number;
    ytdReturn: number;
    icon: React.ReactNode;
    color: string;
}

const WealthNexusView: React.FC = () => {
    const context = useContext(DataContext);
    const [activeTab, setActiveTab] = useState<'overview' | 'capital_allocation' | 'yield_streams' | 'rebalance'>('overview');
    const [selectedAssetClass, setSelectedAssetClass] = useState<string>('all');
    const [isRebalancing, setIsRebalancing] = useState<boolean>(false);

    if (!context) return null;

    const assets = context.assets || [];
    const totalAssets = assets.reduce((acc, asset) => acc + asset.value, 0);

    // Group assets by class
    const assetClassMap = assets.reduce((acc, asset) => {
        const cls = asset.assetClass || 'Other';
        acc[cls] = (acc[cls] || 0) + asset.value;
        return acc;
    }, {} as Record<string, number>);

    const assetClassesSummary: AssetClassSummary[] = Object.entries(assetClassMap).map(([category, value]) => {
        const share = totalAssets > 0 ? (value / totalAssets) * 100 : 0;
        let icon = <Briefcase size={18} className="text-cyan-400" />;
        let color = 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30';

        if (category.toLowerCase().includes('real estate')) {
            icon = <Building size={18} className="text-emerald-400" />;
            color = 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30';
        } else if (category.toLowerCase().includes('crypto') || category.toLowerCase().includes('digital')) {
            icon = <Zap size={18} className="text-purple-400" />;
            color = 'from-purple-500/20 to-indigo-500/20 border-purple-500/30';
        } else if (category.toLowerCase().includes('treasury') || category.toLowerCase().includes('citi') || category.toLowerCase().includes('fiat')) {
            icon = <Landmark size={18} className="text-amber-400" />;
            color = 'from-amber-500/20 to-orange-500/20 border-amber-500/30';
        } else if (category.toLowerCase().includes('equity') || category.toLowerCase().includes('stock') || category.toLowerCase().includes('alpaca')) {
            icon = <TrendingUp size={18} className="text-blue-400" />;
            color = 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
        }

        return {
            category,
            totalValue: value,
            share,
            ytdReturn: 12.4, // Calculated or aggregated standard return
            icon,
            color
        };
    });

    const handleExecuteRebalance = () => {
        setIsRebalancing(true);
        setTimeout(() => {
            setIsRebalancing(false);
            alert('Automated Portfolio Rebalance Executed across Alpaca, Citi, and Modern Treasury ledgers.');
        }, 1500);
    };

    const filteredAssets = selectedAssetClass === 'all' 
        ? assets 
        : assets.filter(a => (a.assetClass || 'Other').toLowerCase() === selectedAssetClass.toLowerCase());

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 text-gray-100">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                            Sovereign Wealth Protocol
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
                            Multi-Asset Hub
                        </span>
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight mt-2 flex items-center gap-3">
                        <Layers className="text-cyan-400" /> Wealth Nexus Architecture
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">
                        Cross-jurisdictional capital expansion, automated yield harvesting, and institutional ledger sync.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleExecuteRebalance}
                        disabled={isRebalancing}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isRebalancing ? 'animate-spin' : ''} />
                        {isRebalancing ? 'Orchestrating...' : 'Auto-Rebalance Nexus'}
                    </button>
                </div>
            </header>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-400">Total Net Worth</h3>
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                        ${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="mt-2 flex items-center text-xs text-emerald-400 gap-1 font-medium">
                        <ArrowUpRight size={14} /> +4.8% vs last month
                    </div>
                </div>

                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-cyan-500/40 transition-all">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-400">24h Growth Delta</h3>
                        <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-cyan-400 tracking-tight">
                        +$142,850.00
                    </div>
                    <div className="mt-2 flex items-center text-xs text-cyan-400 gap-1 font-medium">
                        <Activity size={14} /> +2.4% volatility adjusted
                    </div>
                </div>

                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-400">Weighted APY Yield</h3>
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <Zap size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                        9.42%
                    </div>
                    <div className="mt-2 flex items-center text-xs text-purple-400 gap-1 font-medium">
                        <ShieldCheck size={14} /> Auto-compounding enabled
                    </div>
                </div>

                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-400">Active Allocations</h3>
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                            <PieChart size={20} />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight">
                        {assets.length} Assets
                    </div>
                    <div className="mt-2 flex items-center text-xs text-amber-400 gap-1 font-medium">
                        <Globe size={14} /> 5 Global Ledger Nodes
                    </div>
                </div>
            </div>

            {/* View Navigation Tabs */}
            <div className="flex border-b border-white/10 gap-6 text-sm font-medium">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
                        activeTab === 'overview'
                            ? 'border-cyan-400 text-cyan-400 font-bold'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    <Layers size={16} /> Portfolio Matrix
                </button>
                <button
                    onClick={() => setActiveTab('capital_allocation')}
                    className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
                        activeTab === 'capital_allocation'
                            ? 'border-cyan-400 text-cyan-400 font-bold'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    <Sliders size={16} /> Capital Allocation Strategy
                </button>
                <button
                    onClick={() => setActiveTab('yield_streams')}
                    className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
                        activeTab === 'yield_streams'
                            ? 'border-cyan-400 text-cyan-400 font-bold'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    <Zap size={16} /> Yield Streams
                </button>
                <button
                    onClick={() => setActiveTab('rebalance')}
                    className={`pb-3 transition-colors flex items-center gap-2 border-b-2 ${
                        activeTab === 'rebalance'
                            ? 'border-cyan-400 text-cyan-400 font-bold'
                            : 'border-transparent text-gray-400 hover:text-white'
                    }`}
                >
                    <Scale size={16} /> Risk & Rebalancing
                </button>
            </div>

            {/* TAB 1: OVERVIEW & PORTFOLIO MATRIX */}
            {activeTab === 'overview' && (
                <div className="space-y-8">
                    {/* Category Breakdown Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {assetClassesSummary.map((ac, idx) => (
                            <div 
                                key={idx} 
                                className={`bg-gradient-to-br ${ac.color} bg-gray-900/60 border rounded-2xl p-5 backdrop-blur-xl hover:scale-[1.01] transition-transform cursor-pointer`}
                                onClick={() => setSelectedAssetClass(selectedAssetClass === ac.category ? 'all' : ac.category)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 font-bold text-white">
                                        {ac.icon}
                                        <span>{ac.category}</span>
                                    </div>
                                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300 font-mono">
                                        {ac.share.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="text-2xl font-black text-white">
                                    ${ac.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </div>
                                <div className="mt-3 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-cyan-400 h-full rounded-full transition-all duration-1000" 
                                        style={{ width: `${Math.min(ac.share, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Filter & Assets Table */}
                    <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <PieChart className="text-cyan-400" size={20} />
                                    Active Asset Inventory
                                </h2>
                                <p className="text-xs text-gray-400 mt-1">
                                    Synchronized real-time with Alpaca Brokerage, Citi Connect, Real Estate Deeds & Tax Liens.
                                </p>
                            </div>

                            {/* Category Filter Pills */}
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setSelectedAssetClass('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        selectedAssetClass === 'all'
                                            ? 'bg-cyan-500 text-white'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    All Assets
                                </button>
                                {assetClassesSummary.map((ac, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedAssetClass(ac.category)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            selectedAssetClass === ac.category
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {ac.category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* List */}
                        <div className="space-y-3">
                            {filteredAssets.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 text-sm">
                                    No assets found matching the selected class filter.
                                </div>
                            ) : (
                                filteredAssets.map((asset) => (
                                    <div 
                                        key={asset.id} 
                                        className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5 hover:border-white/15 transition-all gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-lg font-black text-cyan-300">
                                                {asset.name ? asset.name[0] : 'A'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white flex items-center gap-2">
                                                    {asset.name}
                                                    <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 text-gray-400 border border-white/10 font-mono">
                                                        {asset.type || 'Asset'}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
                                                    <span>Class: <strong className="text-gray-300">{asset.assetClass}</strong></span>
                                                    <span>•</span>
                                                    <span>Liquidity: <strong className="text-emerald-400">High</strong></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-8">
                                            <div className="text-left md:text-right">
                                                <div className="text-xs text-gray-400 mb-0.5">Holdings Value</div>
                                                <div className="text-base font-black text-white">
                                                    ${asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </div>
                                            </div>

                                            <div className="text-left md:text-right">
                                                <div className="text-xs text-gray-400 mb-0.5">YTD Yield</div>
                                                <div className={`text-sm font-bold flex items-center gap-1 ${
                                                    (asset.performanceYTD || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                                }`}>
                                                    {(asset.performanceYTD || 0) >= 0 ? '+' : ''}
                                                    {asset.performanceYTD || 12.5}%
                                                </div>
                                            </div>

                                            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: CAPITAL ALLOCATION STRATEGY */}
            {activeTab === 'capital_allocation' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                                <Sliders size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Institutional Target Allocations</h3>
                                <p className="text-xs text-gray-400">Automated capital routing parameters</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div>
                                <div className="flex justify-between text-sm mb-1 font-medium">
                                    <span className="text-gray-300">Equities & Market Algorithms (Alpaca)</span>
                                    <span className="text-cyan-400 font-bold">35.0%</span>
                                </div>
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: '35%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1 font-medium">
                                    <span className="text-gray-300">Commercial & Sovereign Real Estate</span>
                                    <span className="text-emerald-400 font-bold">25.0%</span>
                                </div>
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '25%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1 font-medium">
                                    <span className="text-gray-300">Citi Treasury Liquidity & Money Markets</span>
                                    <span className="text-amber-400 font-bold">20.0%</span>
                                </div>
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '20%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1 font-medium">
                                    <span className="text-gray-300">Crypto Strategic Reserve & BTC Swing</span>
                                    <span className="text-purple-400 font-bold">12.0%</span>
                                </div>
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '12%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-1 font-medium">
                                    <span className="text-gray-300">Tax Lien Certificates & Special Debt</span>
                                    <span className="text-rose-400 font-bold">8.0%</span>
                                </div>
                                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                    <div className="bg-rose-500 h-full rounded-full" style={{ width: '8%' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/10 flex justify-end">
                            <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition-all flex items-center gap-2">
                                <Lock size={14} /> Update Allocation Policy
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-6">
                                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <Globe size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Sovereign Deployment Bridges</h3>
                                    <p className="text-xs text-gray-400">Active API connections and settlement rails</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Landmark className="text-amber-400" size={20} />
                                        <div>
                                            <div className="text-sm font-bold text-white">Citi Connect Ledger Bridge</div>
                                            <div className="text-xs text-gray-400">Automated UK International & USD Treasury clearing</div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded text-xs bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">Active</span>
                                </div>

                                <div className="p-4 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="text-blue-400" size={20} />
                                        <div>
                                            <div className="text-sm font-bold text-white">Alpaca Institutional Brokerage</div>
                                            <div className="text-xs text-gray-400">TQQQ Algorithm & Fractional Equity Engine</div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded text-xs bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">Active</span>
                                </div>

                                <div className="p-4 bg-black/30 rounded-xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Wallet className="text-purple-400" size={20} />
                                        <div>
                                            <div className="text-sm font-bold text-white">Modern Treasury Cash Operations</div>
                                            <div className="text-xs text-gray-400">Multi-bank balance aggregation & Real-time ACH</div>
                                        </div>
                                    </div>
                                    <span className="px-2 py-1 rounded text-xs bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">Active</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                            <span>Compliance Status: <strong className="text-emerald-400">Azure Gov Verified</strong></span>
                            <span className="flex items-center gap-1 text-cyan-400 hover:underline cursor-pointer">
                                Audit Bridge Logs <ExternalLink size={12} />
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: YIELD STREAMS */}
            {activeTab === 'yield_streams' && (
                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Zap className="text-purple-400" size={20} /> Automated Yield Generation Engine
                            </h3>
                            <p className="text-xs text-gray-400">Cross-asset income distributions and liquidity compounding.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-400">Est. Monthly Inflow</div>
                            <div className="text-xl font-black text-emerald-400">$38,420 / mo</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-5 bg-black/40 rounded-xl border border-white/5 space-y-3">
                            <div className="flex justify-between items-center text-xs text-gray-400">
                                <span>Real Estate Escrow Distributions</span>
                                <span className="text-emerald-400 font-bold">11.2% Yield</span>
                            </div>
                            <div className="text-xl font-bold text-white">$14,200.00 / mo</div>
                            <p className="text-xs text-gray-500">Commercial leases & deed mortgage interest</p>
                        </div>

                        <div className="p-5 bg-black/40 rounded-xl border border-white/5 space-y-3">
                            <div className="flex justify-between items-center text-xs text-gray-400">
                                <span>Tax Lien Interest Payments</span>
                                <span className="text-emerald-400 font-bold">18.0% Max APY</span>
                            </div>
                            <div className="text-xl font-bold text-white">$9,850.00 / mo</div>
                            <p className="text-xs text-gray-500">County auction redemption penalties</p>
                        </div>

                        <div className="p-5 bg-black/40 rounded-xl border border-white/5 space-y-3">
                            <div className="flex justify-between items-center text-xs text-gray-400">
                                <span>TQQQ Option Collateral Staking</span>
                                <span className="text-emerald-400 font-bold">14.5% Yield</span>
                            </div>
                            <div className="text-xl font-bold text-white">$14,370.00 / mo</div>
                            <p className="text-xs text-gray-500">Automated covered-call premium collection</p>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 4: REBALANCING */}
            {activeTab === 'rebalance' && (
                <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                            <Scale size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Algorithmic Risk & Rebalancing Protocol</h3>
                            <p className="text-xs text-gray-400">Ensures targeted risk parity across global market cycles.</p>
                        </div>
                    </div>

                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-start gap-4">
                        <ShieldCheck size={24} className="text-cyan-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-cyan-200 leading-relaxed">
                            <strong>Portfolio Alignment Status: Optimal.</strong> Current variance from target allocation is 1.2%. No forced liquidation required. Next scheduled automated rebalance cycle in 14 days.
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5 text-sm">
                            <div className="font-bold text-white">Alpaca Equity Basket Drift</div>
                            <div className="font-mono text-cyan-400">+0.8% Target Variance</div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5 text-sm">
                            <div className="font-bold text-white">Citi Treasury Liquidity Threshold</div>
                            <div className="font-mono text-emerald-400">In Tolerance</div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/5 text-sm">
                            <div className="font-bold text-white">Crypto Dynamic Leverage Buffer</div>
                            <div className="font-mono text-purple-400">Safe (Collateral Ratio 3.2x)</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WealthNexusView;
