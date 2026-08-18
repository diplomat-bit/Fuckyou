import React, { useState, useMemo } from 'react';
import { View } from '../types';
import {
    AcademicCapIcon,
    AdjustmentsIcon,
    BeakerIcon,
    BellIcon,
    BriefcaseIcon,
    CashIcon,
    ChartBarIcon,
    ChevronRightIcon,
    ChipIcon,
    CloudIcon,
    CogIcon,
    CubeTransparentIcon,
    CurrencyDollarIcon,
    DatabaseIcon,
    DocumentReportIcon,
    EyeIcon,
    FireIcon,
    GlobeAltIcon,
    GlobeIcon,
    HomeIcon,
    KeyIcon,
    LibraryIcon,
    LightningBoltIcon,
    LockClosedIcon,
    LogoutIcon,
    PresentationChartLineIcon,
    PuzzleIcon,
    ReceiptTaxIcon,
    ScaleIcon,
    ShareIcon,
    ShieldCheckIcon,
    SparklesIcon,
    SwitchHorizontalIcon,
    TerminalIcon,
    TrendingUpIcon,
    UsersIcon,
} from '@heroicons/react/outline';

const DemoBankLogo: React.FC<{className?: string}> = ({className}) => (
     <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="4"/>
        <path d="M30 70V30H55C65 30 65 40 55 40H30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M55 70V30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

// Expanded Navigation Item Types for a more complex, futuristic sidebar
export interface NavHeader {
    type: 'header';
    label: string;
}

export interface NavDivider {
    type: 'divider';
}

export interface NavLink {
    type?: 'link';
    id: View;
    label: string;
    description: string;
    icon: React.ReactElement;
}

export interface NavGroup {
    type: 'group';
    label: string;
    icon: React.ReactElement;
    children: (NavLink | NavGroup)[];
}

export type NavItem = NavHeader | NavDivider | NavLink | NavGroup;

// Massively expanded navigation structure as per instructions
const NAV_ITEMS: NavItem[] = [
    { type: 'header', label: 'Core Banking' },
    { id: 'dashboard', label: 'Global Dashboard', description: 'Unified operational overview of all sectors.', icon: <HomeIcon /> },
    { id: 'accounts', label: 'Customer Accounts', description: 'Manage retail and corporate accounts.', icon: <UsersIcon /> },
    { id: 'transactions', label: 'Transaction Ledger', description: 'Browse and audit all financial movements.', icon: <LibraryIcon /> },
    { type: 'divider' },
    {
        type: 'group',
        label: 'High-Frequency Trading',
        icon: <LightningBoltIcon />,
        children: [
            { id: 'hft_dashboard', label: 'HFT Command Center', description: 'Real-time trading analytics & P/L.', icon: <ChartBarIcon /> },
            { id: 'hft_market_data', label: 'Market Data Feeds', description: 'Connect to low-latency data sources.', icon: <CloudIcon /> },
            {
                type: 'group',
                label: 'Algorithmic Strategies',
                icon: <AdjustmentsIcon />,
                children: [
                    { id: 'hft_strategy_builder', label: 'Strategy Builder', description: 'Design, code, and backtest models.', icon: <BeakerIcon /> },
                    { id: 'hft_quant_ide', label: 'Quantum IDE', description: 'Develop in a quantum-native environment.', icon: <TerminalIcon /> },
                    { id: 'hft_live_strategies', label: 'Live Strategies', description: 'Monitor and manage active trading bots.', icon: <ChipIcon /> },
                ]
            },
            { id: 'hft_risk_management', label: 'Risk Control Matrix', description: 'Pre-trade and post-trade risk controls.', icon: <ShieldCheckIcon /> },
            { id: 'hft_reporting', label: 'Execution Analysis', description: 'Analyze slippage, latency, and fill rates.', icon: <DocumentReportIcon /> },
        ]
    },
    {
        type: 'group',
        label: 'Wealth & Asset Management',
        icon: <TrendingUpIcon />,
        children: [
            { id: 'wm_client_portfolios', label: 'Client Portfolios', description: 'Holistic view of client assets and performance.', icon: <BriefcaseIcon /> },
            { id: 'wm_market_research', label: 'Market Research', description: 'AI-driven insights and market analysis.', icon: <GlobeAltIcon /> },
            { id: 'wm_trade_execution', label: 'Trade Execution', description: 'Place and manage orders across asset classes.', icon: <CurrencyDollarIcon /> },
            { id: 'wm_compliance', label: 'Robo-Compliance', description: 'Automated regulatory adherence checks.', icon: <ShieldCheckIcon /> },
        ]
    },
    { type: 'divider' },
    {
        type: 'group',
        label: 'Global Entity Interaction Network (GEIN)',
        icon: <GlobeIcon />,
        children: [
            { id: 'gein_overview', label: 'GEIN Overview', description: 'Macro-level view of the global network.', icon: <EyeIcon /> },
            {
                type: 'group',
                label: 'Data Ingestion & Fusion',
                icon: <PuzzleIcon />,
                children: [
                    { id: 'gein_ingest_sentient', label: 'Sentient World Simulation', description: 'Ingest data from global SWS feeds.', icon: <CloudIcon /> },
                    { id: 'gein_ingest_quantum', label: 'Quantum Entanglement Feeds', description: 'Real-time quantum state data.', icon: <CubeTransparentIcon /> },
                    { id: 'gein_ingest_noospheric', label: 'Noospheric Resonance', description: 'Tap into collective consciousness data.', icon: <ShareIcon /> },
                ]
            },
            {
                type: 'group',
                label: 'Holistic Analysis Engine',
                icon: <ChipIcon />,
                children: [
                    { id: 'gein_analysis_cross_dim', label: 'Cross-Dimensional Matrix', description: 'Correlate data across realities.', icon: <SwitchHorizontalIcon /> },
                    { id: 'gein_analysis_geopolitical', label: 'Geopolitical Vector Analysis', description: 'Model nation-state interactions.', icon: <ScaleIcon /> },
                    { id: 'gein_analysis_memetic', label: 'Memetic Trajectory Engine', description: 'Track and predict idea propagation.', icon: <FireIcon /> },
                ]
            },
            {
                type: 'group',
                label: 'Predictive Simulation',
                icon: <BeakerIcon />,
                children: [
                    { id: 'gein_sim_singularity', label: 'Economic Singularity', description: 'Simulate post-scarcity economies.', icon: <TrendingUpIcon /> },
                    { id: 'gein_sim_first_contact', label: 'First Contact Scenarios', description: 'Model potential exopolitical events.', icon: <GlobeAltIcon /> },
                    { id: 'gein_sim_timeline', label: 'Timeline Vulnerability', description: 'Identify and mitigate temporal paradoxes.', icon: <LightningBoltIcon /> },
                ]
            },
            { id: 'gein_visualization', label: 'Network Visualization', description: 'Render the GEIN in a 4D interface.', icon: <PresentationChartLineIcon /> },
            { id: 'gein_ethics', label: 'Ethical Oversight', description: 'AI-driven ethical and moral compass.', icon: <ShieldCheckIcon /> },
        ]
    },
    { type: 'divider' },
    {
        type: 'group',
        label: 'Future Technologies Division',
        icon: <SparklesIcon />,
        children: [
            { id: 'future_quantum_if', label: 'Quantum Interface', description: 'Access quantum computing financial models.', icon: <CubeTransparentIcon /> },
            { id: 'future_neuralink', label: 'Neuralink Analytics', description: 'Brain-computer interface data streams.', icon: <ShareIcon /> },
            { id: 'future_web5', label: 'Web5 Integration', description: 'Manage decentralized identity and data.', icon: <KeyIcon /> },
            { id: 'future_biocomputing', label: 'Bio-Computing Cloud', description: 'Leverage DNA-based data storage & processing.', icon: <ChipIcon /> },
            {
                type: 'group',
                label: 'DAO Governance',
                icon: <UsersIcon />,
                children: [
                    { id: 'dao_treasury', label: 'DAO Treasury', description: 'Monitor and manage decentralized assets.', icon: <CashIcon /> },
                    { id: 'dao_governance', label: 'Governance Portal', description: 'Vote on and create on-chain proposals.', icon: <ScaleIcon /> },
                    { id: 'dao_reputation', label: 'Reputation Engine', description: 'Manage on-chain identity and trust scores.', icon: <AcademicCapIcon /> },
                ]
            },
            {
                type: 'group',
                label: 'Metaverse Operations',
                icon: <CubeTransparentIcon />,
                children: [
                    { id: 'meta_asset_mgmt', label: 'Digital Asset Management', description: 'Manage virtual real estate and NFTs.', icon: <HomeIcon /> },
                    { id: 'meta_econ_monitor', label: 'Virtual Economy Monitor', description: 'Track economic indicators in the metaverse.', icon: <ChartBarIcon /> },
                ]
            },
        ]
    },
    { type: 'divider' },
    { type: 'header', label: 'Administration' },
    { id: 'reporting', label: 'Regulatory Reporting', description: 'Generate and submit compliance reports.', icon: <DocumentReportIcon /> },
    {
        type: 'group',
        label: 'Security & Identity',
        icon: <ShieldCheckIcon />,
        children: [
            { id: 'security_center', label: 'Threat Intelligence', description: 'Real-time global threat detection.', icon: <ShieldCheckIcon /> },
            { id: 'security_iam', label: 'Identity & Access', description: 'Manage multi-factor biometric access.', icon: <KeyIcon /> },
            { id: 'security_crypto', label: 'Cryptography Mgmt', description: 'Control post-quantum encryption keys.', icon: <LockClosedIcon /> },
        ]
    },
    { id: 'audit_logs', label: 'Audit Logs', description: 'Immutable logs of all system activities.', icon: <DatabaseIcon /> },
    { id: 'settings', label: 'System Settings', description: 'Configure global platform parameters.', icon: <CogIcon /> },
    { id: 'knowledge_base', label: 'Knowledge Base', description: 'Documentation and training materials.', icon: <AcademicCapIcon /> },
];


interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [openGroups, setOpenGroups] = useState<Set<string>>(new Set(['High-Frequency Trading']));

    const toggleGroup = (label: string) => {
        setOpenGroups(prev => {
            const newSet = new Set(prev);
            if (newSet.has(label)) {
                newSet.delete(label);
            } else {
                newSet.add(label);
            }
            return newSet;
        });
    };

    const { filteredItems, forceOpen } = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase().trim();
        if (!lowercasedTerm) {
            return { filteredItems: NAV_ITEMS, forceOpen: new Set<string>() };
        }

        const newForceOpen = new Set<string>();

        function filterAndMark(items: NavItem[]): (NavItem | null)[] {
            return items.map(item => {
                if (item.type === 'group') {
                    const newChildren = filterAndMark(item.children);
                    if (newChildren.some(child => child !== null)) {
                        newForceOpen.add(item.label);
                        return { ...item, children: newChildren.filter(c => c !== null) as (NavLink | NavGroup)[] };
                    }
                }
                if (item.id) { // NavLink
                    if (item.label.toLowerCase().includes(lowercasedTerm) || item.description.toLowerCase().includes(lowercasedTerm)) {
                        return item;
                    }
                }
                if (item.type === 'header' || item.type === 'divider') {
                    return item;
                }
                return null;
            });
        }

        let partiallyFiltered = filterAndMark(NAV_ITEMS).filter(item => item !== null) as NavItem[];
        
        const finalFiltered: NavItem[] = [];
        for (let i = 0; i < partiallyFiltered.length; i++) {
            const item = partiallyFiltered[i];
            if (item.type === 'header') {
                let hasContent = false;
                for (let j = i + 1; j < partiallyFiltered.length; j++) {
                    const nextItem = partiallyFiltered[j];
                    if (nextItem.type === 'header') break;
                    if (nextItem.type !== 'divider') {
                        hasContent = true;
                        break;
                    }
                }
                if (hasContent) finalFiltered.push(item);
            } else if (item.type === 'divider') {
                const prevItem = finalFiltered[finalFiltered.length - 1];
                const nextItem = partiallyFiltered[i + 1];
                if (prevItem && nextItem && prevItem.type !== 'header' && prevItem.type !== 'divider' && nextItem.type !== 'header') {
                    finalFiltered.push(item);
                }
            } else {
                finalFiltered.push(item);
            }
        }

        return { filteredItems: finalFiltered, forceOpen: newForceOpen };
    }, [searchTerm]);

    const renderNavItems = (items: NavItem[], level = 0): React.ReactNode => {
        return items.map((item, index) => {
            if (item.type === 'header') {
                return <li key={`header-${item.label}-${index}`} className="px-3 pt-6 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">{item.label}</li>;
            }
            if (item.type === 'divider') {
                return <li key={`divider-${index}`}><hr className="my-3 border-gray-700/50" /></li>;
            }
            if (item.type === 'group') {
                const isGroupOpen = openGroups.has(item.label) || (searchTerm.length > 0 && forceOpen.has(item.label));
                return (
                    <li key={item.label}>
                        <button
                            onClick={() => toggleGroup(item.label)}
                            className="w-full flex items-center justify-between space-x-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-200 text-gray-300 hover:bg-gray-700/50 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            style={{ paddingLeft: `${0.75 + level * 1.25}rem` }}
                        >
                            <div className="flex items-center space-x-3">
                                {React.cloneElement(item.icon, { className: 'h-5 w-5 flex-shrink-0' })}
                                <span className="font-medium">{item.label}</span>
                            </div>
                            <ChevronRightIcon className={`h-4 w-4 transition-transform duration-200 ${isGroupOpen ? 'rotate-90' : ''}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isGroupOpen ? 'max-h-[1000px]' : 'max-h-0'}`}>
                            <ul className="pt-1">
                                {renderNavItems(item.children, level + 1)}
                            </ul>
                        </div>
                    </li>
                );
            }
            const isActive = activeView === item.id;
            return (
                <li key={item.id}>
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setActiveView(item.id);
                            if (window.innerWidth < 1024) setIsOpen(false);
                        }}
                        className={`flex flex-col items-start rounded-lg transition-colors duration-200 group ${isActive ? 'bg-cyan-500/20' : 'hover:bg-gray-700/50'}`}
                        style={{ paddingLeft: `${0.75 + level * 1.25}rem`, paddingRight: '0.75rem', paddingTop: '0.6rem', paddingBottom: '0.6rem' }}
                    >
                        <div className="flex items-center space-x-3">
                            {React.cloneElement(item.icon, { className: `h-5 w-5 flex-shrink-0 ${isActive ? 'text-cyan-300' : 'text-gray-400 group-hover:text-gray-200'}` })}
                            <span className={`text-sm font-medium ${isActive ? 'text-cyan-200' : 'text-gray-300 group-hover:text-white'}`}>{item.label}</span>
                        </div>
                        <p className={`pl-8 text-xs transition-colors mt-1 ${isActive ? 'text-cyan-300/80' : 'text-gray-500 group-hover:text-gray-400'}`}>
                            {item.description}
                        </p>
                    </a>
                </li>
            );
        });
    };

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-30 lg:hidden ${isOpen ? 'block' : 'hidden'}`} onClick={() => setIsOpen(false)}></div>
            
            <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-900/70 backdrop-blur-lg border-r border-gray-700/50 z-40 flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
                <div className="flex items-center justify-between h-20 border-b border-gray-700/50 px-6 flex-shrink-0">
                    <div className="flex items-center space-x-3 text-cyan-400">
                       <DemoBankLogo className="h-10 w-10" />
                       <span className="font-bold text-lg text-white tracking-wide">DEMO BANK</span>
                    </div>
                </div>

                <div className="p-4 flex-shrink-0">
                    <input 
                        type="text"
                        placeholder="Search modules & apps..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                </div>

                <nav className="flex-grow overflow-y-auto px-2 pb-4">
                    <ul>
                        {renderNavItems(filteredItems)}
                    </ul>
                </nav>

                <div className="mt-auto flex-shrink-0 border-t border-gray-700/50 p-4">
                    <div className="flex items-center space-x-4">
                        <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="User" />
                        <div className="flex-grow">
                            <p className="text-sm font-semibold text-white">Jane Doe</p>
                            <p className="text-xs text-gray-400">Quantum Analyst</p>
                        </div>
                        <button className="p-2 rounded-full text-gray-400 hover:bg-gray-700/50 hover:text-white">
                            <LogoutIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;