import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import HoKTokenMint from './HoKTokenMint';

interface FileNode {
    name: string;
    type: 'file' | 'directory';
    path: string;
    children?: FileNode[];
    content?: string;
}

const projectTree: FileNode[] = [
    {
        name: 'api',
        type: 'directory',
        path: 'api',
        children: [
            { name: 'acquisitions.ts', type: 'file', path: 'api/acquisitions.ts', content: '// M&A Orchestration API\nexport const initiateAcquisition = async (targetId: string) => {\n    console.log("Initiating acquisition for target:", targetId);\n    return { status: "pending_board_approval", targetId };\n};' },
            { name: 'ai.ts', type: 'file', path: 'api/ai.ts', content: '// AI Agent Swarm Router\nexport const querySwarm = async (prompt: string) => {\n    return { response: "Swarm intelligence processing prompt: " + prompt };\n};' },
            { name: 'alpaca.ts', type: 'file', path: 'api/alpaca.ts', content: '// Alpaca Brokerage Integration\nexport const executeOrder = async (symbol: string, qty: number, side: "buy" | "sell") => {\n    return { orderId: `alp_${Date.now()}`, symbol, qty, side, status: "filled" };\n};' },
            { name: 'citi.ts', type: 'file', path: 'api/citi.ts', content: '// Citi Connect API Gateway\nexport const initiatePayment = async (amount: number, currency: string) => {\n    return { reference: `CITI-${Date.now()}`, amount, currency, status: "settled" };\n};' },
            { name: 'sovereign.ts', type: 'file', path: 'api/sovereign.ts', content: '// Sovereign Wealth Fund Ledger Sync\nexport const syncSovereignLedger = async () => {\n    return { synced: true, timestamp: new Date().toISOString() };\n};' },
            { name: 'stripe.ts', type: 'file', path: 'api/stripe.ts', content: '// Stripe Treasury Integration\nexport const createFinancialAccount = async () => {\n    return { accountId: `fa_${Date.now()}`, status: "active" };\n};' },
            {
                name: 'routes',
                type: 'directory',
                path: 'api/routes',
                children: [
                    { name: 'acquisitions-orchestrator.ts', type: 'file', path: 'api/routes/acquisitions-orchestrator.ts', content: '// Express route for M&A\nimport { Router } from "express";\nexport const router = Router();' },
                    { name: 'identity.ts', type: 'file', path: 'api/routes/identity.ts', content: '// Decentralized Identity verification\nexport const verifyIdentity = async (did: string) => { return { verified: true }; };' },
                    { name: 'treasury.ts', type: 'file', path: 'api/routes/treasury.ts', content: '// Multi-bank treasury routing\nexport const routeTreasury = async () => { return { route: "Citi -> Alpaca" }; };' }
                ]
            }
        ]
    },
    {
        name: 'components',
        type: 'directory',
        path: 'components',
        children: [
            { name: 'DeveloperView.tsx', type: 'file', path: 'components/DeveloperView.tsx', content: '// Developer Portal & File Explorer\n// You are currently viewing this file!' },
            { name: 'SovereignDashboard.tsx', type: 'file', path: 'components/SovereignDashboard.tsx', content: '// Sovereign Wealth & Geopolitical Dashboard\nexport const SovereignDashboard = () => { return <div>Sovereign Dashboard</div>; };' },
            { name: 'CitiTreasuryHub.tsx', type: 'file', path: 'components/CitiTreasuryHub.tsx', content: '// Citi Connect Treasury Management\nexport const CitiTreasuryHub = () => { return <div>Citi Treasury Hub</div>; };' },
            {
                name: 'alpaca',
                type: 'directory',
                path: 'components/alpaca',
                children: [
                    { name: 'AlpacaTradingTerminal.tsx', type: 'file', path: 'components/alpaca/AlpacaTradingTerminal.tsx', content: '// Real-time stock & crypto trading terminal' },
                    { name: 'TqqqAlgorithmTerminal.tsx', type: 'file', path: 'components/alpaca/TqqqAlgorithmTerminal.tsx', content: '// TQQQ Quantitative Trading Strategy' },
                    { name: 'AlpacaRebalancingView.tsx', type: 'file', path: 'components/alpaca/AlpacaRebalancingView.tsx', content: '// Portfolio Rebalancing Engine' }
                ]
            },
            {
                name: 'bridges',
                type: 'directory',
                path: 'components/bridges',
                children: [
                    { name: 'CitiAlpacaBridgeView.tsx', type: 'file', path: 'components/bridges/CitiAlpacaBridgeView.tsx', content: '// Bridge Citi Treasury to Alpaca Brokerage' },
                    { name: 'PlaidAlpacaBridgeView.tsx', type: 'file', path: 'components/bridges/PlaidAlpacaBridgeView.tsx', content: '// Bridge Plaid Bank Accounts to Alpaca' },
                    { name: 'SovereignMarketTakeoverDashboard.tsx', type: 'file', path: 'components/bridges/SovereignMarketTakeoverDashboard.tsx', content: '// Sovereign Market Takeover Control Panel' }
                ]
            },
            {
                name: 'government',
                type: 'directory',
                path: 'components/government',
                children: [
                    { name: 'GisPropertyMap.tsx', type: 'file', path: 'components/government/GisPropertyMap.tsx', content: '// GIS Property Mapping & Land Registry' },
                    { name: 'GovernmentApiDashboard.tsx', type: 'file', path: 'components/government/GovernmentApiDashboard.tsx', content: '// Federal & State API Integrations' }
                ]
            }
        ]
    },
    {
        name: 'services',
        type: 'directory',
        path: 'services',
        children: [
            { name: 'AlpacaTradingService.ts', type: 'file', path: 'services/AlpacaTradingService.ts', content: '// Alpaca API wrapper service' },
            { name: 'SovereignIntelligence.ts', type: 'file', path: 'services/SovereignIntelligence.ts', content: '// Geopolitical risk & intelligence engine' },
            { name: 'AstraVectorSearchService.ts', type: 'file', path: 'services/AstraVectorSearchService.ts', content: '// Astra DB Vector Search for AI context' },
            { name: 'ZKPEngine.ts', type: 'file', path: 'services/ZKPEngine.ts', content: '// Zero-Knowledge Proof compliance engine' }
        ]
    },
    {
        name: 'trillionaire-status',
        type: 'directory',
        path: 'trillionaire-status',
        children: [
            { name: 'CapitalAllocationModels.ts', type: 'file', path: 'trillionaire-status/CapitalAllocationModels.ts', content: '// Trillion-dollar capital allocation algorithms' },
            { name: 'CompetitorIntelligence.ts', type: 'file', path: 'trillionaire-status/CompetitorIntelligence.ts', content: '// Fortune 500 competitive intelligence' },
            { name: 'TrillionaireStatusSummary.ts', type: 'file', path: 'trillionaire-status/TrillionaireStatusSummary.ts', content: '// Path to Trillionaire Status tracking dashboard' }
        ]
    }
];

const DeveloperView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("DeveloperView must be within a DataProvider");

    const { authorizedApps, authorizeApp, revokeApp, userProfile } = context;
    const [isAuthorizeModalOpen, setIsAuthorizeModalOpen] = useState(false);
    const [newAppInfo, setNewAppInfo] = useState({ name: '', description: '' });

    // File Explorer State
    const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({ 'api': true, 'components': true });
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(projectTree[0].children?.[0] || null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleAuthorize = () => {
        if (newAppInfo.name) {
            authorizeApp({
                id: `app_${Date.now()}`,
                name: newAppInfo.name,
                description: newAppInfo.description,
                scopes: ['read_profile', 'read_transactions']
            });
            setIsAuthorizeModalOpen(false);
            setNewAppInfo({ name: '', description: '' });
        }
    };

    const toggleDirectory = (path: string) => {
        setExpandedDirs(prev => ({ ...prev, [path]: !prev[path] }));
    };

    // Flatten files for search
    const getAllFiles = (nodes: FileNode[]): FileNode[] => {
        let files: FileNode[] = [];
        nodes.forEach(node => {
            if (node.type === 'file') {
                files.push(node);
            } else if (node.children) {
                files = [...files, ...getAllFiles(node.children)];
            }
        });
        return files;
    };

    const filteredFiles = searchQuery 
        ? getAllFiles(projectTree).filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    const renderTree = (nodes: FileNode[], depth = 0) => {
        return nodes.map(node => {
            const isExpanded = expandedDirs[node.path];
            if (node.type === 'directory') {
                return (
                    <div key={node.path} className="select-none">
                        <div 
                            onClick={() => toggleDirectory(node.path)}
                            className="flex items-center gap-2 py-1 px-2 hover:bg-gray-800/50 rounded cursor-pointer text-sm text-gray-300 font-medium transition-colors"
                            style={{ paddingLeft: `${depth * 12 + 8}px` }}
                        >
                            <span className="text-cyan-500 text-xs">{isExpanded ? '▼' : '▶'}</span>
                            <span className="text-yellow-500">📁</span>
                            <span>{node.name}</span>
                        </div>
                        {isExpanded && node.children && (
                            <div className="mt-0.5">
                                {renderTree(node.children, depth + 1)}
                            </div>
                        )}
                    </div>
                );
            } else {
                const isSelected = selectedFile?.path === node.path;
                return (
                    <div 
                        key={node.path}
                        onClick={() => setSelectedFile(node)}
                        className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer text-sm font-mono transition-colors ${
                            isSelected ? 'bg-cyan-950/50 text-cyan-400 border-l-2 border-cyan-500' : 'hover:bg-gray-800/30 text-gray-400 hover:text-gray-200'
                        }`}
                        style={{ paddingLeft: `${depth * 12 + 16}px` }}
                    >
                        <span>📄</span>
                        <span className="truncate">{node.name}</span>
                    </div>
                );
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white tracking-wider">Developer Portal</h2>
                <button 
                    onClick={() => setIsAuthorizeModalOpen(true)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors"
                >
                    Register External App
                </button>
            </div>

            {/* Project Workspace File Explorer */}
            <Card title="Oko-main Project Workspace Explorer">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                    {/* Sidebar File Tree */}
                    <div className="lg:col-span-1 flex flex-col bg-gray-950/40 rounded-lg border border-gray-800 p-4 overflow-hidden">
                        <div className="mb-4">
                            <input 
                                type="text" 
                                placeholder="Search files..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-1.5 text-xs text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                            {searchQuery ? (
                                filteredFiles.length === 0 ? (
                                    <p className="text-xs text-gray-500 italic p-2">No files found matching "{searchQuery}"</p>
                                ) : (
                                    filteredFiles.map(file => (
                                        <div 
                                            key={file.path}
                                            onClick={() => setSelectedFile(file)}
                                            className={`flex items-center gap-2 py-1 px-2 rounded cursor-pointer text-xs font-mono transition-colors ${
                                                selectedFile?.path === file.path ? 'bg-cyan-950/50 text-cyan-400' : 'hover:bg-gray-800/30 text-gray-400'
                                            }`}
                                        >
                                            <span>📄</span>
                                            <div className="flex flex-col truncate">
                                                <span className="font-semibold">{file.name}</span>
                                                <span className="text-[10px] text-gray-500">{file.path}</span>
                                            </div>
                                        </div>
                                    ))
                                )
                            ) : (
                                renderTree(projectTree)
                            )}
                        </div>
                    </div>

                    {/* File Content Viewer */}
                    <div className="lg:col-span-2 flex flex-col bg-gray-950/60 rounded-lg border border-gray-800 overflow-hidden">
                        {selectedFile ? (
                            <>
                                <div className="bg-gray-900/80 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 font-mono">{selectedFile.path}</span>
                                    </div>
                                    <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2 py-0.5 rounded font-mono">TypeScript</span>
                                </div>
                                <div className="flex-1 p-4 overflow-auto font-mono text-xs text-gray-300 bg-gray-950/80 leading-relaxed">
                                    <pre className="whitespace-pre-wrap">{selectedFile.content || `// File: ${selectedFile.name}\n// Content loaded dynamically from Oko-main repository.`}</pre>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 italic">
                                <span>Select a file from the explorer to view its contents</span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Demai Connect API Credentials">
                    <div className="space-y-4">
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                            <label className="block text-xs text-gray-500 uppercase mb-1">User Client ID</label>
                            <p className="font-mono text-cyan-400 break-all">{userProfile?.id || 'HIDDEN'}</p>
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-lg">
                            <label className="block text-xs text-gray-500 uppercase mb-1">Active Scopes</label>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {['transactions.read', 'profile.read', 'payments.write'].map(s => (
                                    <span key={s} className="px-2 py-0.5 bg-gray-700 text-gray-300 rounded text-xs">{s}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card title="Authorized Third-Party Apps">
                    <div className="space-y-4">
                        {authorizedApps.length === 0 ? (
                            <p className="text-gray-500 italic text-center py-4">No external applications connected.</p>
                        ) : (
                            authorizedApps.map(app => (
                                <div key={app.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-white flex items-center gap-2">
                                            {app.name}
                                            <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ${app.status === 'active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                                {app.status}
                                            </span>
                                        </h4>
                                        <p className="text-sm text-gray-400 mt-1">{app.description}</p>
                                        <p className="text-[10px] text-gray-500 mt-2 italic">Authorized: {new Date(app.authorizedAt).toLocaleDateString()}</p>
                                    </div>
                                    {app.status === 'active' && (
                                        <button 
                                            onClick={() => revokeApp(app.id)}
                                            className="text-xs text-red-400 hover:text-red-300 border border-red-900/50 px-2 py-1 rounded"
                                        >
                                            Revoke
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>

            <HoKTokenMint />

            {isAuthorizeModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setIsAuthorizeModalOpen(false)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-md w-full border border-gray-700 p-6" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-white mb-4">Connect External Application</h3>
                        <p className="text-sm text-gray-400 mb-6">Simulate an OAuth2 flow by registering a name for a new authorized partner application.</p>
                        <div className="space-y-4">
                            <input 
                                type="text" 
                                placeholder="App Name (e.g., TaxBot Pro)" 
                                value={newAppInfo.name}
                                onChange={e => setNewAppInfo(prev => ({...prev, name: e.target.value}))}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                            />
                            <textarea 
                                placeholder="Description of intended use" 
                                value={newAppInfo.description}
                                onChange={e => setNewAppInfo(prev => ({...prev, description: e.target.value}))}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-cyan-500 outline-none h-24"
                            />
                            <button 
                                onClick={handleAuthorize}
                                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors"
                            >
                                Authorize Connection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeveloperView;