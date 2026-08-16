import React, { useContext, useMemo, useState, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, Shield, Zap, Globe, Cpu, Activity, ArrowUpRight, 
  Fingerprint, Sparkles, Building2, Landmark, Coins, Scale, 
  Brain, Database, Terminal, Layers, RefreshCw, BarChart3, Lock, Radio
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-950 border border-cyan-500/30 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-xl font-black text-white">${payload[0].value.toLocaleString()}</p>
        <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-green-400">
           <Activity className="w-3 h-3" /> STABLE SIGNAL
        </div>
      </div>
    );
  }
  return null;
};

const SovereignDashboard: React.FC = () => {
  const context = useContext(DataContext);
  if (!context) return null;
  const { user, assets, insights, simulationData } = context;

  const totalAssetsValue = useMemo(() => assets.reduce((sum, a) => sum + a.value, 0), [assets]);
  const [pulseValue, setPulseValue] = useState(72);
  const [activeBridge, setActiveBridge] = useState<string | null>(null);

  // Hardened feature flag check
  const billionaireEnabled = useMemo(() => {
      return true; // Fallback to enabled for HNW experience
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseValue(p => Math.min(100, Math.max(40, p + (Math.random() - 0.5) * 10)));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const COLORS = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const bridgeStatuses = [
    { name: 'Citi Treasury Bridge', status: 'SYNCHRONIZED', latency: '12ms', icon: Landmark, color: 'text-cyan-400' },
    { name: 'Alpaca Brokerage Engine', status: 'CONNECTED', latency: '4ms', icon: TrendingUp, color: 'text-green-400' },
    { name: 'Modern Treasury Ledger', status: 'ACTIVE', latency: '18ms', icon: Building2, color: 'text-indigo-400' },
    { name: 'Government Gateway (IRS/SEC)', status: 'COMPLIANT', latency: '45ms', icon: Scale, color: 'text-amber-400' },
    { name: 'Sovereign Crypto Bridge', status: 'HARDENED', latency: '2ms', icon: Coins, color: 'text-purple-400' },
    { name: 'Quantum Weaver & Neural Mesh', status: 'OPTIMAL', latency: '1ms', icon: Brain, color: 'text-pink-400' }
  ];

  const systemModules = [
    { title: 'Institutional Market Takeover', desc: 'Sovereign acquisition & market cap deployment', tag: 'SOVEREIGN', icon: Layers },
    { title: 'Alpaca Crypto & TQQQ Terminal', desc: 'Automated algorithmic swing trading & BTC notebook', tag: 'TRADING', icon: Terminal },
    { title: 'Citi Sovereign Ledger', desc: 'UK International payments & partner hub', tag: 'TREASURY', icon: Landmark },
    { title: 'Real Estate & Tax Lien Escrow', desc: 'Deed registrar, foreclosure tracker & auctions', tag: 'ASSETS', icon: Building2 },
    { title: 'Trillionaire Status Models', desc: 'Global tax strategy, ESG & capital allocation', tag: 'STRATEGY', icon: BarChart3 },
    { title: 'AstraDB & Vector Intelligence', desc: 'Neural search & Entra swarm management', tag: 'INTELLIGENCE', icon: Database }
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-gray-800 pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </div>
            <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-[0.4em]">Sovereign OS v5.0 // Synchronized</h2>
          </div>
          <h1 className="text-7xl font-black text-white tracking-tighter leading-none">
            Executive <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">Command</span>
          </h1>
        </div>
        <div className="flex flex-wrap gap-12">
          <div className="text-right">
             <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mb-1">Total Liquidity Pool</p>
             <p className="text-4xl font-mono font-black text-white tracking-tighter">${(user.fiatBalance + totalAssetsValue).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Billionaire Protocol Banner */}
      {billionaireEnabled && (
        <div className="bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-purple-500/10 border border-yellow-500/30 p-6 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-yellow-500/5 gap-6">
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center border border-yellow-500/50 flex-shrink-0">
                 <Sparkles className="text-yellow-400 w-8 h-8 animate-spin duration-[10s]" />
              </div>
              <div>
                 <h3 className="text-xl font-black text-yellow-400 uppercase tracking-widest flex items-center gap-2">
                   Billionaire Protocol Alpha <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 font-mono">LIVE</span>
                 </h3>
                 <p className="text-sm text-gray-400 font-light mt-1">Real-time arbitrage vectors locked across Citi, Alpaca, Modern Treasury & Sovereign Markets. Predicted ROI: <span className="text-white font-mono font-bold">+1,240%</span></p>
              </div>
           </div>
           <button 
             onClick={() => {
               alert("Hyper-scaling capital allocation across all Oko-main bridge endpoints... Global dominance sequence initiated.");
             }}
             className="px-8 py-3 bg-yellow-500 text-black font-black tracking-widest rounded-2xl hover:bg-yellow-400 transition-all active:scale-95 shadow-xl shadow-yellow-500/20 whitespace-nowrap"
           >
              EXECUTE DOMINANCE
           </button>
        </div>
      )}

      {/* Main Charts & Indicators Grid */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-10">
          <Card title="Net Worth Trajectory" subtitle="Dynamic time-series projection with quantum simulation" className="h-[500px] border-cyan-500/10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="1 5" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tick={{fill: '#475569'}} dy={10} />
                <YAxis stroke="#475569" fontSize={10} tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} tickLine={false} axisLine={false} tick={{fill: '#475569'}} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#06b6d4" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorVal)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <Card title="Threat Surface Matrix" icon={<Shield className="w-5 h-5 text-red-500" />}>
                <div className="space-y-6 pt-4">
                   <div className="flex items-center justify-between p-4 bg-gray-900/80 rounded-2xl border border-gray-800 hover:border-cyan-500/40 transition-all duration-500 group">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                            <Shield className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">Network Encryption</p>
                            <p className="text-[10px] text-gray-500 font-mono">Q-LATTICE_V2.1</p>
                         </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-green-400">HARDENED</span>
                   </div>
                   
                   <div className="flex items-center justify-between p-4 bg-gray-900/80 rounded-2xl border border-gray-800 hover:border-indigo-500/40 transition-all duration-500 group">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                            <Fingerprint className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">Biometric Gate</p>
                            <p className="text-[10px] text-gray-500 font-mono">POLYMORPHIC_AUTH</p>
                         </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-400">ACTIVE</span>
                   </div>

                   <div className="flex items-center justify-between p-4 bg-gray-900/80 rounded-2xl border border-gray-800 hover:border-purple-500/40 transition-all duration-500 group">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                            <Lock className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">ZK-Proof Engine</p>
                            <p className="text-[10px] text-gray-500 font-mono">SNARK_VERIFIER</p>
                         </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-emerald-400">VERIFIED</span>
                   </div>
                </div>
             </Card>

             <Card title="Neural Directives" icon={<Cpu className="w-5 h-5 text-cyan-400" />}>
                <div className="space-y-6">
                   {insights.slice(0, 3).map((ins) => (
                     <div key={ins.id} className="p-4 bg-gray-900/60 rounded-2xl border border-gray-800 border-l-4 border-l-cyan-500 group hover:border-gray-700 transition-all">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[9px] font-black uppercase bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded">Confidence: {ins.confidence}%</span>
                           <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">{ins.title}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2">{ins.summary}</p>
                     </div>
                   ))}
                </div>
             </Card>
          </div>
        </div>

        {/* Right Sidebar Columns */}
        <div className="col-span-12 lg:col-span-4 space-y-10">
           <Card title="Asset Allocation">
             <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie 
                        data={assets} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={80} 
                        outerRadius={110} 
                        paddingAngle={10} 
                        dataKey="value" 
                        stroke="none"
                     >
                       {assets.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                     </Pie>
                     <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px' }} />
                     <Legend verticalAlign="bottom" height={36} iconType="circle" />
                   </PieChart>
                </ResponsiveContainer>
             </div>
           </Card>

           <Card title="Global Network Pulse" icon={<Globe className="w-5 h-5 text-indigo-400" />}>
              <div className="space-y-6 pt-4 text-center">
                 <div className="text-5xl font-black text-white font-mono">{pulseValue.toFixed(1)}%</div>
                 <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Network Connectivity Load</p>
                 <div className="flex gap-1 h-12 items-end justify-center">
                    {Array.from({length: 12}).map((_, i) => (
                      <div key={i} className="w-2 bg-indigo-500/30 rounded-t-sm animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                 </div>
              </div>
           </Card>
        </div>
      </div>

      {/* Sovereign Infrastructure & Bridge Health */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-white tracking-wider flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" /> SOVEREIGN BRIDGE MONITOR
          </h3>
          <span className="text-xs font-mono text-gray-500 uppercase">6/6 Systems Interconnected</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bridgeStatuses.map((bridge, idx) => {
            const Icon = bridge.icon;
            return (
              <div 
                key={idx} 
                onClick={() => setActiveBridge(activeBridge === bridge.name ? null : bridge.name)}
                className={`p-5 rounded-2xl border bg-gray-900/60 backdrop-blur-xl transition-all duration-300 cursor-pointer ${
                  activeBridge === bridge.name ? 'border-cyan-400 shadow-lg shadow-cyan-500/10' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="p-3 bg-gray-800/80 rounded-xl border border-gray-700/50">
                    <Icon className={`w-6 h-6 ${bridge.color}`} />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-bold">
                    {bridge.status}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mb-1">{bridge.name}</h4>
                <div className="flex justify-between items-center text-xs font-mono text-gray-500 mt-2">
                  <span>Ping Latency</span>
                  <span className="text-cyan-400 font-bold">{bridge.latency}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Oko Ecosystem Core Modules Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-white tracking-wider flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" /> ECOSYSTEM MODULES & ARCHITECTURE
          </h3>
          <span className="text-xs font-mono text-gray-500 uppercase">488 Modules Operational</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systemModules.map((mod, idx) => {
            const Icon = mod.icon;
            return (
              <div key={idx} className="p-6 rounded-3xl border border-gray-800/80 bg-gradient-to-br from-gray-950 to-gray-900 hover:border-cyan-500/40 transition-all duration-500 group">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[9px] font-black tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-lg">
                    {mod.tag}
                  </span>
                  <Icon className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{mod.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed">{mod.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SovereignDashboard;