import React, { useContext, useMemo } from 'react';
import BalanceSummary from './BalanceSummary';
import RecentTransactions from './RecentTransactions';
import WealthTimeline from './WealthTimeline';
import { AIInsights } from './AIInsights';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View } from '../types';
import { 
    Database, Zap, Globe, Target, 
    Cpu, Landmark, CheckCircle, Crown, Code, Fingerprint, ShieldCheck, Activity
} from 'lucide-react';

const Dashboard: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("Dashboard requires DataContext.");

    const { 
        transactions, financialGoals, 
        setActiveView, creditScore, rewardPoints, assets, isProductionApproved, plaidProducts
    } = context;

    const totalManagedValue = useMemo(() => assets.reduce((sum, a) => sum + a.value, 0), [assets]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 p-2 md:p-6 bg-gray-950 min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-800 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                         <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded text-[10px] text-green-400 font-black tracking-widest uppercase">Production Environment</div>
                         <div className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] text-cyan-400 font-black tracking-widest uppercase">Handshake Stable</div>
                    </div>
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase font-mono italic">Nexus OS</h1>
                    <p className="text-emerald-400 mt-1 flex items-center gap-2 font-mono text-sm tracking-widest uppercase">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                        SIGNAL: {isProductionApproved ? 'PRODUCTION_ACTIVE' : 'INITIALIZING'} // 15/15 PROTOCOLS SYNCED
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setActiveView(View.ComplianceOracle)} className="px-4 py-2 bg-indigo-900/20 hover:bg-indigo-900/40 border border-indigo-500/50 rounded-xl text-sm font-bold text-indigo-300 flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                        <ShieldCheck size={18} /> CMMC LEVEL 3 CERTIFIED
                    </button>
                    <button onClick={() => setActiveView(View.SendMoney)} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white text-sm font-bold shadow-lg shadow-cyan-500/20 transition-all active:scale-95 uppercase tracking-widest">
                        Initiate Capital Flow
                    </button>
                </div>
            </header>

            {/* Production Metrics Deck */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="border-cyan-500/20 bg-cyan-950/5 text-center py-6 group hover:border-cyan-500/50 transition-all">
                    <Fingerprint className="w-8 h-8 mx-auto text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-black text-white font-mono">{(creditScore.score/100).toFixed(2)}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Trust Score (Q-Resistant)</p>
                </Card>
                <Card className="border-purple-500/20 bg-purple-950/5 text-center py-6 group hover:border-purple-500/50 transition-all">
                    <Activity className="w-8 h-8 mx-auto text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-black text-white font-mono">{plaidProducts.length}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Active Protocols</p>
                </Card>
                <Card className="border-green-500/20 bg-green-950/5 text-center py-6 group hover:border-green-500/50 transition-all">
                    <Database className="w-8 h-8 mx-auto text-green-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-black text-white font-mono">100%</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Ledger Integrity</p>
                </Card>
                <Card className="border-emerald-500/20 bg-emerald-950/5 text-center py-6 group hover:border-emerald-500/50 transition-all">
                    <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-3xl font-black text-white font-mono">VERIFIED</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Identity Verified</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Data Nexus */}
                <div className="lg:col-span-8 space-y-8">
                    <Card title="Sovereign Wealth Topology" className="h-[450px] relative overflow-hidden bg-black/40 border-indigo-900/50 p-0">
                        <div className="absolute top-6 left-6 z-10">
                            <span className="px-3 py-1.5 bg-indigo-900/40 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold font-mono rounded-lg backdrop-blur">MULTIVERSE_PROJECTION_V6</span>
                        </div>
                        <WealthTimeline />
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <BalanceSummary />
                        <AIInsights />
                    </div>
                </div>

                {/* Tactical Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <Card title="Production Authority" className="border-indigo-500/20 bg-indigo-950/5 p-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-indigo-500/20">
                                <Code className="text-indigo-400" />
                                <div>
                                    <p className="text-xs font-bold text-white uppercase">License: Apache 2.0</p>
                                    <p className="text-[10px] text-gray-400 font-mono">Open Source Institutional Standard</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-emerald-500/20">
                                <div className="flex items-center gap-4">
                                    <Landmark className="text-emerald-400" />
                                    <div>
                                        <p className="text-xs font-bold text-white uppercase">Net Liquidity</p>
                                        <p className="text-[10px] text-gray-400 font-mono">Verified Reserves</p>
                                    </div>
                                </div>
                                <span className="text-lg font-black text-white">${(totalManagedValue / 1000000).toFixed(2)}M</span>
                            </div>
                        </div>
                    </Card>

                    <Card title="Strategic Phase Allocation" className="border-green-500/20 p-6">
                        <div className="space-y-6">
                            {[
                                { name: "Phase 0: Launch", pct: 100 },
                                { name: "Phase 1: Deep Insights", pct: 45 },
                                { name: "Phase 2: Wealth Sync", pct: 12 }
                            ].map(phase => (
                                <div key={phase.name} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-gray-300">{phase.name}</span>
                                        <span className="text-green-400 font-mono">{phase.pct}%</span>
                                    </div>
                                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-green-500 h-full transition-all duration-1000" style={{ width: `${phase.pct}%` }}></div>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setActiveView(View.FinancialGoals)} className="w-full py-3 bg-gray-900 hover:bg-gray-800 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] transition-all border border-gray-800">Review Full Protocol</button>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-12">
                    <RecentTransactions transactions={transactions.slice(0, 10)} setActiveView={setActiveView} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;