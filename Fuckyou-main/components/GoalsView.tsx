import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { 
    Target, 
    TrendingUp, 
    CheckCircle, 
    Globe, 
    Shield, 
    Building, 
    Briefcase, 
    Award, 
    Cpu, 
    FileText, 
    MapPin, 
    Coins,
    Zap,
    Scale,
    Users,
    ArrowUpRight
} from 'lucide-react';

type TabType = 'personal' | 'trillionaire' | 'sovereign' | 'assets';

interface Milestone {
    id: string;
    name: string;
    category: string;
    progress: number;
    status: 'Active' | 'Completed' | 'Pending';
    description: string;
    metric: string;
    icon: React.ReactNode;
    relatedFiles: string[];
}

const GoalsView: React.FC = () => {
    const context = useContext(DataContext);
    const [activeTab, setActiveTab] = useState<TabType>('personal');

    // Trillionaire Status Milestones (mapped to trillionaire-status/ files)
    const trillionaireMilestones: Milestone[] = [
        {
            id: 't1',
            name: 'Capital Allocation Models',
            category: 'Trillionaire Status',
            progress: 85,
            status: 'Active',
            description: 'Optimizing capital deployment across Fortune 500 sectors and high-yield algorithms.',
            metric: '$1.2B Allocated',
            icon: <Briefcase className="text-amber-400" size={20} />,
            relatedFiles: ['CapitalAllocationModels.ts', 'MarketCapAnalysis.ts']
        },
        {
            id: 't2',
            name: 'Global Tax Strategy',
            category: 'Trillionaire Status',
            progress: 100,
            status: 'Completed',
            description: 'Structuring international entities and modern treasury ledgers for maximum tax efficiency.',
            metric: 'Optimized to 1.2%',
            icon: <Scale className="text-emerald-400" size={20} />,
            relatedFiles: ['GlobalTaxStrategy.ts', 'RegulatoryComplianceAudit.ts']
        },
        {
            id: 't3',
            name: 'Lobbying & Influence Mapping',
            category: 'Trillionaire Status',
            progress: 60,
            status: 'Active',
            description: 'Tracking and mapping regulatory influence, policy alignment, and contractor lobbying.',
            metric: '42 Agencies Mapped',
            icon: <Users className="text-purple-400" size={20} />,
            relatedFiles: ['LobbyingInfluenceMapping.ts', 'ContractorLobbyingList.tsx']
        },
        {
            id: 't4',
            name: 'Patent Portfolio Audit',
            category: 'Trillionaire Status',
            progress: 45,
            status: 'Active',
            description: 'Evaluating intellectual property, quantum computing patents, and innovation pipelines.',
            metric: '128 Patents Filed',
            icon: <Cpu className="text-cyan-400" size={20} />,
            relatedFiles: ['PatentPortfolioAudit.ts', 'InnovationPipelineResearch.ts']
        },
        {
            id: 't5',
            name: 'Mergers & Acquisitions',
            category: 'Trillionaire Status',
            progress: 70,
            status: 'Active',
            description: 'Identifying high-value acquisition targets and integration paths for sovereign takeover.',
            metric: '3 Deals Pending',
            icon: <TrendingUp className="text-pink-400" size={20} />,
            relatedFiles: ['MergersAndAcquisitions.ts', 'acquisitions.ts']
        },
        {
            id: 't6',
            name: 'Supply Chain Mapping',
            category: 'Trillionaire Status',
            progress: 50,
            status: 'Active',
            description: 'Analyzing global infrastructure, tech stack integration, and supply chain dependencies.',
            metric: '94% Resilience',
            icon: <Globe className="text-blue-400" size={20} />,
            relatedFiles: ['SupplyChainMapping.ts', 'InfrastructureDependencies.ts']
        }
    ];

    // Sovereign & Government Objectives (mapped to government/ and sovereign/ files)
    const sovereignMilestones: Milestone[] = [
        {
            id: 's1',
            name: 'Sovereign Market Takeover',
            category: 'Sovereign Intelligence',
            progress: 40,
            status: 'Active',
            description: 'Executing strategic market positioning, sovereign ledger sync, and institutional hub control.',
            metric: 'Level 4 Clearance',
            icon: <Shield className="text-red-400" size={20} />,
            relatedFiles: ['SovereignMarketTakeoverDashboard.tsx', 'sovereign.ts']
        },
        {
            id: 's2',
            name: 'SEC Filing Compliance',
            category: 'Government Gateway',
            progress: 100,
            status: 'Completed',
            description: 'Automated SEC filing ingestion, analysis, and regulatory compliance checks.',
            metric: '100% Compliant',
            icon: <FileText className="text-indigo-400" size={20} />,
            relatedFiles: ['SecFilingViewer.tsx', 'government-gateway.ts']
        },
        {
            id: 's3',
            name: 'IRS Tax Filing Integration',
            category: 'Government Gateway',
            progress: 95,
            status: 'Active',
            description: 'Direct integration with government gateways for automated tax filing and compliance.',
            metric: 'Ready for Q4',
            icon: <Scale className="text-teal-400" size={20} />,
            relatedFiles: ['IrsTaxFiling.tsx', 'tax-calculator.ts']
        },
        {
            id: 's4',
            name: 'GIS Property Map Synchronization',
            category: 'Geospatial',
            progress: 75,
            status: 'Active',
            description: 'Mapping real estate assets and tax lien foreclosures with geospatial GIS data.',
            metric: '12k Parcels Synced',
            icon: <MapPin className="text-orange-400" size={20} />,
            relatedFiles: ['GisPropertyMap.tsx', 'geo-spatial.ts']
        }
    ];

    // Asset Acquisition Targets (mapped to real-estate/, tax-liens/, and alpaca/ files)
    const assetMilestones: Milestone[] = [
        {
            id: 'a1',
            name: 'Real Estate Alpaca Bridge',
            category: 'Asset Tokenization',
            progress: 80,
            status: 'Active',
            description: 'Tokenizing real estate assets, deed registration, and bridging to Alpaca brokerage.',
            metric: '$45M Tokenized',
            icon: <Building className="text-yellow-500" size={20} />,
            relatedFiles: ['RealEstateAlpacaBridge.tsx', 'DeedRegistrar.tsx', 'EscrowManager.tsx']
        },
        {
            id: 'a2',
            name: 'Tax Lien Auctions',
            category: 'Alternative Assets',
            progress: 65,
            status: 'Active',
            description: 'Tracking foreclosures and bidding on high-yield tax liens via Modern Treasury.',
            metric: '18 Liens Acquired',
            icon: <Coins className="text-lime-400" size={20} />,
            relatedFiles: ['TaxLienAuctions.tsx', 'TaxLienModernTreasuryBridge.tsx']
        },
        {
            id: 'a3',
            name: 'Alpaca Tokenization Hub',
            category: 'Brokerage Integration',
            progress: 90,
            status: 'Active',
            description: 'Minting fractional shares of alternative assets and managing on-chain liquidity.',
            metric: '9 Active Pools',
            icon: <Zap className="text-cyan-400" size={20} />,
            relatedFiles: ['AlpacaTokenizationView.tsx', 'AlpacaCryptoWalletsView.tsx']
        },
        {
            id: 'a4',
            name: 'Crypto Strategy & Yield',
            category: 'Quantitative Trading',
            progress: 100,
            status: 'Completed',
            description: 'Deploying automated BTC swing trading and TQQQ algorithms for continuous yield.',
            metric: '34.2% APY',
            icon: <TrendingUp className="text-violet-400" size={20} />,
            relatedFiles: ['BtcSwingTradingNotebook.tsx', 'TqqqAlgorithmTerminal.tsx', 'crypto-strategy.ts']
        }
    ];

    const renderMilestones = (milestones: Milestone[]) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {milestones.map(milestone => (
                <div key={milestone.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between hover:border-white/10 transition-all duration-300 group">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                                {milestone.icon}
                            </div>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                milestone.status === 'Completed' 
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                            }`}>
                                {milestone.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{milestone.name}</h3>
                        <p className="text-xs text-gray-500 mb-3 font-medium tracking-wider uppercase">{milestone.category}</p>
                        <p className="text-sm text-gray-400 mb-6 line-clamp-2">{milestone.description}</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-gray-500 font-medium">Progress ({milestone.metric})</span>
                                <span className="text-white font-semibold">{milestone.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        milestone.status === 'Completed' ? 'bg-green-500' : 'bg-cyan-500'
                                    }`}
                                    style={{ width: `${milestone.progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5">
                            <div className="flex flex-wrap gap-1.5">
                                {milestone.relatedFiles.map((file, idx) => (
                                    <span key={idx} className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded font-mono border border-white/5">
                                        {file}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Financial & Sovereign Goals</h1>
                    <p className="text-gray-400">Track and manage your personal objectives, trillionaire milestones, and sovereign assets.</p>
                </div>
                <div className="flex items-center gap-2 bg-gray-900/80 border border-white/5 p-1 rounded-xl self-start">
                    <button 
                        onClick={() => setActiveTab('personal')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'personal' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Personal Goals
                    </button>
                    <button 
                        onClick={() => setActiveTab('trillionaire')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'trillionaire' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Trillionaire Status
                    </button>
                    <button 
                        onClick={() => setActiveTab('sovereign')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'sovereign' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Sovereign Objectives
                    </button>
                    <button 
                        onClick={() => setActiveTab('assets')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                            activeTab === 'assets' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Asset Targets
                    </button>
                </div>
            </header>

            {activeTab === 'personal' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {context && context.financialGoals?.map(goal => (
                        <div key={goal.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col justify-between hover:border-white/10 transition-all duration-300">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white">{goal.name}</h3>
                                    {goal.currentAmount >= goal.targetAmount ? (
                                        <CheckCircle className="text-green-400" size={24} />
                                    ) : (
                                        <Target className="text-cyan-400" size={24} />
                                    )}
                                </div>
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-400">Progress</span>
                                            <span className="text-white font-medium">
                                                {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-cyan-500 rounded-full"
                                                style={{ width: `${Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Current</span>
                                        <span className="text-white font-medium">${goal.currentAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Target</span>
                                        <span className="text-white font-medium">${goal.targetAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Deadline</span>
                                        <span className="text-white font-medium">{new Date(goal.targetDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs text-gray-500">Personal Portfolio Goal</span>
                                <button className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold">
                                    Manage <ArrowUpRight size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {(!context || !context.financialGoals || context.financialGoals.length === 0) && (
                        <div className="col-span-full p-12 text-center border border-dashed border-white/10 rounded-2xl">
                            <Target className="mx-auto text-gray-600 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-white mb-2">No Goals Set</h3>
                            <p className="text-gray-400">Define your financial objectives to start tracking progress.</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'trillionaire' && renderMilestones(trillionaireMilestones)}
            {activeTab === 'sovereign' && renderMilestones(sovereignMilestones)}
            {activeTab === 'assets' && renderMilestones(assetMilestones)}
        </div>
    );
};

export default GoalsView;