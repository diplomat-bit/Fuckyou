import React, { useState, useMemo } from 'react';
import { 
    Briefcase, 
    TrendingUp, 
    Users, 
    DollarSign, 
    Target, 
    PieChart, 
    ShieldCheck, 
    Filter, 
    Activity, 
    Globe, 
    Cpu, 
    Database, 
    Link2, 
    ArrowRight,
    Coins,
    FileText,
    Map,
    FileCheck,
    Vote,
    Flame,
    Scale,
    Calculator,
    ShieldAlert,
    RefreshCw,
    Search,
    ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * CONTRACTOR LOBBYING LIST
 * Implementation of a Live Influence-Efficiency ROI Index.
 * Tracks corporate influence on Sovereign infrastructure procurement.
 * Integrated with all Sovereign & Government modules.
 */

interface Contractor {
    id: string;
    name: string;
    roi: number;
    spent: number; // in millions
    impact: string;
    status: 'AGGRESSIVE' | 'STRATEGIC' | 'ESTABLISHED' | 'DISRUPTOR';
}

interface ConnectedModule {
    id: string;
    name: string;
    file: string;
    status: 'ACTIVE' | 'SYNCED' | 'STANDBY' | 'CRITICAL';
    sync: string;
    impact: 'HIGH' | 'MEDIUM' | 'LOW' | 'CRITICAL';
    icon: React.ComponentType<any>;
    desc: string;
    endpoint: string;
}

const ContractorLobbyingList: React.FC = () => {
    // State for contractors
    const [contractors, setContractors] = useState<Contractor[]>([
        { id: 'CON-001', name: 'Lockheed Compute Corp', roi: 14.2, spent: 450, impact: 'Defense Cloud', status: 'AGGRESSIVE' },
        { id: 'CON-002', name: 'Palantir Intelligence', roi: 22.8, spent: 120, impact: 'Neural RAG', status: 'STRATEGIC' },
        { id: 'CON-003', name: 'Google Sovereign AI', roi: 9.4, spent: 890, impact: 'Core OS', status: 'ESTABLISHED' },
        { id: 'CON-004', name: 'SpaceX Logistics', roi: 31.5, spent: 50, impact: 'Satellite Ingress', status: 'DISRUPTOR' },
    ]);

    // Lobbying Intensity Slider (1x to 5x multiplier)
    const [intensity, setIntensity] = useState<number>(1.0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedModule, setSelectedModule] = useState<ConnectedModule | null>(null);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [syncLogs, setSyncLogs] = useState<string[]>([
        'System initialized.',
        'Sovereign ledger handshake established.',
        'Awaiting telemetry from connected modules...'
    ]);

    // Connected Sovereign & Government Modules
    const connectedModules: ConnectedModule[] = [
        { id: 'MOD-WAR', name: 'War Appropriations Tracker', file: 'WarAppropriationsTracker.tsx', status: 'ACTIVE', sync: '99.8%', impact: 'HIGH', icon: Coins, desc: 'Tracks military-industrial complex funding allocations.', endpoint: '/api/procurement/war-appropriations' },
        { id: 'MOD-SEC', name: 'SEC Filing Viewer', file: 'SecFilingViewer.tsx', status: 'SYNCED', sync: '100%', impact: 'MEDIUM', icon: FileText, desc: 'Real-time corporate financial disclosure parsing.', endpoint: '/api/government/sec-filings' },
        { id: 'MOD-GIS', name: 'GIS Property Map', file: 'GisPropertyMap.tsx', status: 'ACTIVE', sync: '94.2%', impact: 'HIGH', icon: Map, desc: 'Geospatial mapping of contractor-owned real estate.', endpoint: '/api/geo-spatial/properties' },
        { id: 'MOD-IRS', name: 'IRS Tax Filing', file: 'IrsTaxFiling.tsx', status: 'STANDBY', sync: '88.0%', impact: 'LOW', icon: FileCheck, desc: 'Automated corporate tax avoidance auditing.', endpoint: '/api/government/irs-tax' },
        { id: 'MOD-VOT', name: 'Florida Voter View', file: 'FloridaVoterView.tsx', status: 'ACTIVE', sync: '97.5%', impact: 'HIGH', icon: Vote, desc: 'Demographic influence and gerrymandering analysis.', endpoint: '/api/government/voter-demographics' },
        { id: 'MOD-IMP', name: 'Impeachment Generator', file: 'ImpeachmentGenerator.tsx', status: 'STANDBY', sync: '100%', impact: 'CRITICAL', icon: Flame, desc: 'Algorithmic political accountability drafting.', endpoint: '/api/government/impeachment-drafts' },
        { id: 'MOD-INJ', name: 'Injustice Dashboard', file: 'InjusticeDashboard.tsx', status: 'ACTIVE', sync: '91.4%', impact: 'HIGH', icon: Scale, desc: 'Systemic bias and lobbying correlation engine.', endpoint: '/api/government/injustice-metrics' },
        { id: 'MOD-AID', name: 'Public Aid Calculator', file: 'PublicAidCalculator.tsx', status: 'SYNCED', sync: '95.6%', impact: 'MEDIUM', icon: Calculator, desc: 'Welfare distribution vs corporate subsidy ratio.', endpoint: '/api/government/public-aid' },
        { id: 'MOD-AUD', name: 'Sovereign Deal Audit', file: 'SovereignDealAudit.tsx', status: 'ACTIVE', sync: '99.9%', impact: 'CRITICAL', icon: ShieldAlert, desc: 'Smart contract auditing for sovereign procurement.', endpoint: '/api/routes/audit' }
    ];

    // Calculate dynamic values based on intensity slider
    const dynamicContractors = useMemo(() => {
        return contractors.map(con => ({
            ...con,
            spent: Math.round(con.spent * intensity),
            roi: parseFloat((con.roi * (1 + (intensity - 1) * 0.15)).toFixed(1))
        }));
    }, [contractors, intensity]);

    const totalSpent = useMemo(() => {
        return dynamicContractors.reduce((acc, curr) => acc + curr.spent, 0);
    }, [dynamicContractors]);

    const avgRoi = useMemo(() => {
        const sum = dynamicContractors.reduce((acc, curr) => acc + curr.roi, 0);
        return (sum / dynamicContractors.length).toFixed(1);
    }, [dynamicContractors]);

    const handleSyncModule = (mod: ConnectedModule) => {
        setIsSyncing(true);
        const newLog = `[${new Date().toLocaleTimeString()}] Syncing with ${mod.file} via ${mod.endpoint}...`;
        setSyncLogs(prev => [newLog, ...prev]);

        setTimeout(() => {
            setIsSyncing(false);
            setSyncLogs(prev => [
                `[${new Date().toLocaleTimeString()}] Successfully synced ${mod.name} (${mod.sync} integrity)`,
                ...prev
            ]);
        }, 1200);
    };

    const filteredModules = connectedModules.filter(mod => 
        mod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mod.file.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 p-8 bg-[#020617] min-h-screen text-gray-100">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-8 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
                        <Briefcase className="text-amber-500 w-10 h-10" />
                        Influence <span className="text-amber-500">ROI Index</span>
                    </h1>
                    <p className="text-xs font-mono text-amber-500/50 uppercase tracking-[0.4em] mt-2">
                        Lobbying Transparency Matrix & Sovereign Integration Hub v3.0
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                        <p className="text-[9px] font-mono text-amber-500 uppercase tracking-widest">Total Market Influence</p>
                        <p className="text-xl font-black text-white">${(totalSpent / 1000).toFixed(2)}B</p>
                    </div>
                    <div className="px-6 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                        <p className="text-[9px] font-mono text-blue-400 uppercase tracking-widest">Connected Modules</p>
                        <p className="text-xl font-black text-white">{connectedModules.length} Active</p>
                    </div>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Avg ROI', value: `${avgRoi}x`, icon: <TrendingUp />, color: 'text-amber-400' },
                    { label: 'Active Lobbyists', value: '1,240', icon: <Users />, color: 'text-blue-400' },
                    { label: 'Capital Deployed', value: `$${totalSpent}M`, icon: <DollarSign />, color: 'text-emerald-400' },
                    { label: 'Policy Impact', value: `${Math.min(99, Math.round(78 * intensity))}%`, icon: <PieChart />, color: 'text-purple-400' },
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:border-white/20 transition-all"
                    >
                        <div className={`p-3 bg-white/5 rounded-xl w-fit ${stat.color}`}>
                            {React.cloneElement(stat.icon as React.ReactElement, { size: 24 } as any)}
                        </div>
                        <div>
                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-2xl font-black text-white">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Lobbying Intensity Simulator */}
            <div className="p-6 bg-gradient-to-r from-amber-950/20 to-blue-950/20 border border-white/10 rounded-3xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                            <Activity size={16} />
                            Lobbying Intensity Simulator
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">Simulate the impact of increased capital deployment on policy ROI and sovereign systems.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs font-mono text-gray-500 uppercase">Multiplier: </span>
                        <span className="text-lg font-black text-white font-mono">{intensity.toFixed(1)}x</span>
                    </div>
                </div>
                <input 
                    type="range" 
                    min="1.0" 
                    max="5.0" 
                    step="0.1" 
                    value={intensity} 
                    onChange={(e) => setIntensity(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-gray-500">
                    <span>1.0x (Baseline)</span>
                    <span>2.5x (Aggressive)</span>
                    <span>5.0x (Hyper-Influence)</span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Contractor Influence Tracker */}
                <div className="lg:col-span-2 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3">
                            <Target className="text-amber-400" />
                            Contractor Influence Tracker
                        </h3>
                        <ShieldCheck className="text-emerald-500" />
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="pb-4 text-[10px] font-mono text-gray-600 uppercase tracking-widest">Contractor Entity</th>
                                    <th className="pb-4 text-[10px] font-mono text-gray-600 uppercase tracking-widest">Capital Spent</th>
                                    <th className="pb-4 text-[10px] font-mono text-gray-600 uppercase tracking-widest">Policy Impact Area</th>
                                    <th className="pb-4 text-[10px] font-mono text-gray-600 uppercase tracking-widest">Influence ROI</th>
                                    <th className="pb-4 text-[10px] font-mono text-gray-600 uppercase tracking-widest">Profile</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-mono">
                                {dynamicContractors.map((con) => (
                                    <tr key={con.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-gray-500 text-[10px]">
                                                    {con.id.split('-')[1]}
                                                </div>
                                                <span className="text-gray-200 font-bold group-hover:text-amber-400 transition-colors">{con.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-6 text-gray-300">${con.spent}M</td>
                                        <td className="py-6 text-gray-400">{con.impact}</td>
                                        <td className="py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-white/5 rounded-full h-1 max-w-[80px]">
                                                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min(100, (con.roi / 50) * 100)}%` }} />
                                                </div>
                                                <span className="text-amber-400 font-bold">{con.roi}x</span>
                                            </div>
                                        </td>
                                        <td className="py-6">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                                con.status === 'AGGRESSIVE' ? 'bg-red-500/20 text-red-500' :
                                                con.status === 'STRATEGIC' ? 'bg-blue-500/20 text-blue-400' :
                                                con.status === 'DISRUPTOR' ? 'bg-purple-500/20 text-purple-400' :
                                                'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                                {con.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Connected Sovereign Modules */}
                <div className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6 flex flex-col">
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3">
                            <Globe className="text-blue-400" />
                            Sovereign Modules
                        </h3>
                        <p className="text-xs text-gray-400">
                            Direct integration with Oko-main government, legal, and financial systems.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search connected files..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Modules List */}
                    <div className="flex-1 overflow-y-auto max-h-[350px] space-y-3 pr-2 custom-scrollbar">
                        {filteredModules.map((mod) => {
                            const Icon = mod.icon;
                            return (
                                <div 
                                    key={mod.id}
                                    onClick={() => setSelectedModule(mod)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 group ${
                                        selectedModule?.id === mod.id 
                                            ? 'bg-blue-500/10 border-blue-500/40' 
                                            : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.07]'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg ${
                                        mod.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' :
                                        mod.status === 'CRITICAL' ? 'bg-red-500/10 text-red-400' :
                                        'bg-blue-500/10 text-blue-400'
                                    }`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                                                {mod.name}
                                            </h4>
                                            <span className="text-[9px] font-mono text-gray-500">{mod.sync}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-400 truncate mt-0.5">{mod.file}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Telemetry Logs */}
                    <div className="p-4 bg-black/40 border border-white/5 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Database size={10} />
                                Telemetry Logs
                            </span>
                            <button 
                                onClick={() => setSyncLogs(['[System] Logs cleared.', ...syncLogs])}
                                className="text-[9px] font-mono text-blue-400 hover:underline"
                            >
                                Clear
                            </button>
                        </div>
                        <div className="h-20 overflow-y-auto text-[9px] font-mono text-gray-400 space-y-1 custom-scrollbar">
                            {syncLogs.map((log, idx) => (
                                <div key={idx} className="truncate">{log}</div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Module Detail Modal / Drawer */}
            <AnimatePresence>
                {selectedModule && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="p-8 bg-white/5 border border-white/10 rounded-[2.5rem] space-y-6"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400">
                                    {React.createElement(selectedModule.icon, { size: 32 })}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-black text-white uppercase">{selectedModule.name}</h3>
                                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[9px] font-mono">
                                            {selectedModule.id}
                                        </span>
                                    </div>
                                    <p className="text-xs font-mono text-gray-400 mt-1">File Path: <span className="text-blue-400">/content/Oko-main/components/{selectedModule.file}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => handleSyncModule(selectedModule)}
                                    disabled={isSyncing}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
                                >
                                    <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                                    {isSyncing ? 'Syncing...' : 'Trigger Sync'}
                                </button>
                                <button 
                                    onClick={() => setSelectedModule(null)}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-bold transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Description</span>
                                <p className="text-xs text-gray-300 leading-relaxed">{selectedModule.desc}</p>
                            </div>
                            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">API Endpoint</span>
                                <p className="text-xs font-mono text-blue-400 truncate">{selectedModule.endpoint}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-mono text-gray-400">REST Gateway Active</span>
                                </div>
                            </div>
                            <div className="p-6 bg-white/5 border border-white/5 rounded-2xl space-y-2">
                                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest">Lobbying Impact Correlation</span>
                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-xs text-gray-300">Sensitivity Index</span>
                                    <span className="text-xs font-bold text-amber-400">{(intensity * 1.5).toFixed(1)}x</span>
                                </div>
                                <div className="w-full bg-white/5 rounded-full h-1.5 mt-2">
                                    <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, intensity * 20)}%` }} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContractorLobbyingList;