import React, { useState, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { APIStatus } from '../types';
import Card from './Card';
import { ResponsiveContainer, AreaChart, Area, Tooltip as RechartsTooltip } from 'recharts';

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

interface SystemIntegration {
    id: string;
    name: string;
    category: 'Bridges' | 'Sovereign & Gov' | 'AI & Data' | 'Core Banking';
    description: string;
    status: 'Active' | 'Inactive' | 'Syncing' | 'Degraded';
    lastSync: string;
    endpoints: string[];
    latency: number;
    filePath: string;
}

const APIIntegrationView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("APIIntegrationView must be within a DataProvider.");
    
    const { 
        apiStatus, 
        modernTreasuryApiKey, setModernTreasuryApiKey,
        modernTreasuryOrganizationId, setModernTreasuryOrganizationId,
        modernTreasuryPublishableKey, setModernTreasuryPublishableKey,
        modernTreasuryWebhookUrl, setModernTreasuryWebhookUrl,
        modernTreasuryWebhookSigningKey, setModernTreasuryWebhookSigningKey
    } = context;

    const [isMtModalOpen, setIsMtModalOpen] = useState(false);
    const [mtApiKeyInput, setMtApiKeyInput] = useState(modernTreasuryApiKey || '');
    const [mtOrgIdInput, setMtOrgIdInput] = useState(modernTreasuryOrganizationId || '');
    const [mtPublishableKeyInput, setMtPublishableKeyInput] = useState(modernTreasuryPublishableKey || '');
    const [mtWebhookUrlInput, setMtWebhookUrlInput] = useState(modernTreasuryWebhookUrl || '');
    const [mtWebhookSigningKeyInput, setMtWebhookSigningKeyInput] = useState(modernTreasuryWebhookSigningKey || '');

    // Search and filter states for Oko-Main integrations
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedIntegration, setSelectedIntegration] = useState<SystemIntegration | null>(null);

    // Oko-Main System Integrations Registry
    const [integrations, setIntegrations] = useState<SystemIntegration[]>([
        {
            id: 'citi-alpaca',
            name: 'Citi-Alpaca Bridge',
            category: 'Bridges',
            description: 'Bridges Citi Treasury accounts with Alpaca brokerage accounts for automated liquidity sweeps.',
            status: 'Active',
            lastSync: '3 mins ago',
            endpoints: ['POST /api/v1/bridges/citi-alpaca/sweep', 'GET /api/v1/bridges/citi-alpaca/status'],
            latency: 42,
            filePath: 'components/bridges/CitiAlpacaBridgeView.tsx'
        },
        {
            id: 'plaid-alpaca',
            name: 'Plaid-Alpaca Bridge',
            category: 'Bridges',
            description: 'Connects external bank accounts via Plaid to fund Alpaca brokerage accounts instantly.',
            status: 'Active',
            lastSync: '12 mins ago',
            endpoints: ['POST /api/v1/bridges/plaid-alpaca/link', 'POST /api/v1/bridges/plaid-alpaca/transfer'],
            latency: 118,
            filePath: 'components/bridges/PlaidAlpacaBridgeView.tsx'
        },
        {
            id: 'real-estate-alpaca',
            name: 'Real Estate Alpaca Bridge',
            category: 'Bridges',
            description: 'Enables tokenized real estate assets to be used as collateral for Alpaca margin accounts.',
            status: 'Active',
            lastSync: '1 hour ago',
            endpoints: ['POST /api/v1/bridges/real-estate/collateralize', 'GET /api/v1/bridges/real-estate/valuation'],
            latency: 156,
            filePath: 'components/bridges/RealEstateAlpacaBridge.tsx'
        },
        {
            id: 'sovereign-takeover',
            name: 'Sovereign Market Takeover',
            category: 'Sovereign & Gov',
            description: 'Monitors sovereign wealth fund movements and triggers automated defensive market positions.',
            status: 'Active',
            lastSync: 'Just now',
            endpoints: ['GET /api/v1/sovereign/analytics', 'POST /api/v1/sovereign/takeover/execute'],
            latency: 14,
            filePath: 'components/bridges/SovereignMarketTakeoverDashboard.tsx'
        },
        {
            id: 'stripe-alpaca',
            name: 'Stripe-Alpaca Bridge',
            category: 'Bridges',
            description: 'Sweeps Stripe merchant processing balances directly into high-yield Alpaca cash accounts.',
            status: 'Active',
            lastSync: '45 mins ago',
            endpoints: ['POST /api/v1/bridges/stripe-alpaca/sweep', 'GET /api/v1/bridges/stripe-alpaca/history'],
            latency: 89,
            filePath: 'components/bridges/StripeAlpacaBridgeView.tsx'
        },
        {
            id: 'tax-lien-mt',
            name: 'Tax Lien Modern Treasury Bridge',
            category: 'Bridges',
            description: 'Automates tax lien auction bidding and registers successful acquisitions on Modern Treasury ledgers.',
            status: 'Active',
            lastSync: '2 hours ago',
            endpoints: ['POST /api/v1/bridges/tax-liens/bid', 'POST /api/v1/bridges/tax-liens/ledger'],
            latency: 210,
            filePath: 'components/bridges/TaxLienModernTreasuryBridge.tsx'
        },
        {
            id: 'azure-gov',
            name: 'Azure Gov Compliance',
            category: 'Sovereign & Gov',
            description: 'Validates all financial transactions against ITAR, FedRAMP, and DoD compliance frameworks.',
            status: 'Active',
            lastSync: '5 mins ago',
            endpoints: ['POST /api/v1/compliance/azure-gov/validate', 'GET /api/v1/compliance/azure-gov/audit-trail'],
            latency: 28,
            filePath: 'api/azureGovCompliance.ts'
        },
        {
            id: 'astra-vector',
            name: 'Astra DB Vector Search',
            category: 'AI & Data',
            description: 'Powers semantic search and long-term memory for AI financial advisors using Astra DB.',
            status: 'Active',
            lastSync: 'Just now',
            endpoints: ['POST /api/v1/ai/vector/search', 'POST /api/v1/ai/vector/index'],
            latency: 18,
            filePath: 'services/AstraVectorSearchService.ts'
        },
        {
            id: 'gemini-live',
            name: 'Gemini Live Portal',
            category: 'AI & Data',
            description: 'Real-time voice and multimodal AI interface for hands-free portfolio management.',
            status: 'Active',
            lastSync: 'Just now',
            endpoints: ['WS /api/v1/ai/gemini/live-stream', 'POST /api/v1/ai/gemini/analyze'],
            latency: 35,
            filePath: 'components/GeminiLivePortal.tsx'
        },
        {
            id: 'openbanking-fapi',
            name: 'OpenBanking FAPI',
            category: 'Core Banking',
            description: 'Financial-grade API security layer implementing JWE/JWS and mutual TLS for open banking.',
            status: 'Active',
            lastSync: '10 mins ago',
            endpoints: ['POST /api/v1/fapi/token', 'POST /api/v1/fapi/consent'],
            latency: 45,
            filePath: 'components/OpenBankingFapiView.tsx'
        },
        {
            id: 'gov-gateway',
            name: 'Government Gateway',
            category: 'Sovereign & Gov',
            description: 'Direct integration with IRS, SEC, and GIS property databases for automated filing and mapping.',
            status: 'Active',
            lastSync: '3 hours ago',
            endpoints: ['POST /api/v1/gov/irs/file', 'GET /api/v1/gov/gis/property-data'],
            latency: 340,
            filePath: 'components/government/GovernmentApiDashboard.tsx'
        },
        {
            id: 'sovereign-sentry',
            name: 'Sovereign Sentry Engine',
            category: 'Sovereign & Gov',
            description: 'Real-time threat detection and automated circuit breakers for sovereign-level market attacks.',
            status: 'Active',
            lastSync: 'Just now',
            endpoints: ['GET /api/v1/sovereign/sentry/threats', 'POST /api/v1/sovereign/sentry/mitigate'],
            latency: 8,
            filePath: 'components/SovereignSentryEngine.tsx'
        }
    ]);

    const handleSaveMtKey = async () => {
        setModernTreasuryApiKey(mtApiKeyInput);
        setModernTreasuryOrganizationId(mtOrgIdInput);
        setModernTreasuryPublishableKey(mtPublishableKeyInput);
        setModernTreasuryWebhookUrl(mtWebhookUrlInput);
        setModernTreasuryWebhookSigningKey(mtWebhookSigningKeyInput);
        
        try {
            await fetch('/api/v1/config/secrets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    MODERN_TREASURY_API_KEY: mtApiKeyInput,
                    MODERN_TREASURY_ORGANIZATION_ID: mtOrgIdInput,
                    MT_PUBLISHABLE_KEY: mtPublishableKeyInput,
                    MT_WEBHOOK_URL: mtWebhookUrlInput,
                    MT_WEBHOOK_KEY: mtWebhookSigningKeyInput
                })
            });
            console.log("Modern Treasury config secrets saved to server.");
        } catch (e) {
            console.error("Failed to save Modern Treasury config secrets to backend", e);
        }
        
        setIsMtModalOpen(false);
    };

    const triggerSync = (id: string) => {
        setIntegrations(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, status: 'Syncing' };
            }
            return item;
        }));

        setTimeout(() => {
            setIntegrations(prev => prev.map(item => {
                if (item.id === id) {
                    return { 
                        ...item, 
                        status: 'Active', 
                        lastSync: 'Just now',
                        latency: Math.floor(Math.random() * 150) + 10
                    };
                }
                return item;
            }));
        }, 1500);
    };

    const StatusIndicator: React.FC<{ status: APIStatus['status'] | SystemIntegration['status'] }> = ({ status }) => {
        const colors = {
            'Operational': { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400' },
            'Active': { bg: 'bg-green-500/20', text: 'text-green-300', dot: 'bg-green-400' },
            'Syncing': { bg: 'bg-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-400 animate-ping' },
            'Degraded Performance': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', dot: 'bg-yellow-400' },
            'Degraded': { bg: 'bg-yellow-500/20', text: 'text-yellow-300', dot: 'bg-yellow-400' },
            'Partial Outage': { bg: 'bg-orange-500/20', text: 'text-orange-300', dot: 'bg-orange-400' },
            'Major Outage': { bg: 'bg-red-500/20', text: 'text-red-300', dot: 'bg-red-400' },
            'Inactive': { bg: 'bg-gray-500/20', text: 'text-gray-300', dot: 'bg-gray-400' },
        };
        const style = colors[status] || colors['Inactive'];
        return (
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                <div className={`w-2 h-2 rounded-full ${style.dot}`}></div>
                {status}
            </div>
        );
    };

    const filteredIntegrations = integrations.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.filePath.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="p-6 space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Oko-Main API Integrations</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage, monitor, and synchronize all cross-platform bridges, sovereign gateways, and AI services.</p>
                </div>
                <button 
                    onClick={() => setIsMtModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                >
                    <SettingsIcon className="w-4 h-4" />
                    Configure Modern Treasury
                </button>
            </header>

            {/* Webhook Orchestration Panel */}
            <Card className="p-6 bg-blue-950/20 border-blue-800/40">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
                            </svg>
                            Webhook Orchestration & Event Stream
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">Monitor real-time event streams from Modern Treasury, Stripe, and Sovereign Sentry.</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-mono tracking-wider">LISTENING</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800/50">
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-mono">Modern Treasury</div>
                        <div className="text-lg font-bold text-white truncate">{modernTreasuryWebhookUrl || "None"}</div>
                        <div className="mt-2 h-1 w-full bg-gray-800 overflow-hidden rounded-full">
                            <div className="h-full bg-blue-500 w-3/4 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800/50">
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-mono">Status</div>
                        <div className="text-lg font-bold text-green-400">Synchronized</div>
                        <div className="text-[10px] text-gray-500 mt-1">Last handshake: 2m ago</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800/50">
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-mono">Events (24h)</div>
                        <div className="text-lg font-bold text-white">1,248</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-mono text-blue-400">+12% vs yesterday</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800/50">
                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-mono">Success Rate</div>
                        <div className="text-lg font-bold text-white">99.98%</div>
                        <div className="mt-2 h-1 w-full bg-gray-800 overflow-hidden rounded-full">
                            <div className="h-full bg-green-500 w-[99.98%]"></div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Oko-Main System Integrations Registry Section */}
            <div className="space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Oko-Main System Bridges & Gateways</h2>
                        <p className="text-sm text-gray-400">Direct control panel for all integrated files, services, and bridges in the Oko-Main architecture.</p>
                    </div>
                    
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <input 
                            type="text"
                            placeholder="Search integrations or files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                        />
                        <div className="flex bg-gray-900 border border-gray-800 rounded-lg p-0.5">
                            {['All', 'Bridges', 'Sovereign & Gov', 'AI & Data', 'Core Banking'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredIntegrations.map((item) => (
                        <Card key={item.id} className="p-6 bg-gray-900/40 border-gray-800/80 hover:border-gray-700/80 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start gap-2 mb-3">
                                    <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-[10px] font-mono uppercase tracking-wider">
                                        {item.category}
                                    </span>
                                    <StatusIndicator status={item.status} />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                                <p className="text-xs text-gray-400 line-clamp-2 mb-4">{item.description}</p>
                                
                                <div className="bg-black/30 rounded-lg p-3 mb-4 space-y-2">
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-gray-500">File Path:</span>
                                        <span className="text-gray-300 font-mono truncate max-w-[180px]" title={item.filePath}>
                                            {item.filePath}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-gray-500">Latency:</span>
                                        <span className="text-blue-400 font-mono">{item.latency}ms</span>
                                    </div>
                                    <div className="flex justify-between text-[11px]">
                                        <span className="text-gray-500">Last Sync:</span>
                                        <span className="text-gray-300">{item.lastSync}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mt-2">
                                <button 
                                    onClick={() => setSelectedIntegration(item)}
                                    className="flex-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs font-medium transition-colors"
                                >
                                    Inspect API
                                </button>
                                <button 
                                    onClick={() => triggerSync(item.id)}
                                    disabled={item.status === 'Syncing'}
                                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 rounded text-xs font-medium transition-colors disabled:opacity-50"
                                >
                                    {item.status === 'Syncing' ? 'Syncing...' : 'Sync Now'}
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Original API Status Cards */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">External Provider Latency</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {apiStatus.map((api) => (
                        <Card key={api.id} className="p-6 bg-gray-900/50 border-gray-800">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{api.name}</h3>
                                    <p className="text-sm text-gray-400">{api.description}</p>
                                </div>
                                <StatusIndicator status={api.status} />
                            </div>
                            <div className="h-24 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={api.latencyHistory}>
                                        <Area 
                                            type="monotone" 
                                            dataKey="latency" 
                                            stroke="#3b82f6" 
                                            fill="#3b82f622" 
                                            strokeWidth={2} 
                                        />
                                        <RechartsTooltip 
                                            contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                                            itemStyle={{ color: '#3b82f6' }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 flex justify-between items-center text-xs text-gray-500">
                                <span>Last 24h Latency</span>
                                <span>{api.latencyHistory[api.latencyHistory.length - 1]?.latency}ms</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Modern Treasury Config Modal */}
            {isMtModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md p-8 bg-gray-900 border-gray-800">
                        <h2 className="text-2xl font-bold text-white mb-6">Modern Treasury Config</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">API Key</label>
                                <input 
                                    type="password"
                                    value={mtApiKeyInput}
                                    onChange={(e) => setMtApiKeyInput(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="sk_live_..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Organization ID</label>
                                <input 
                                    type="text"
                                    value={mtOrgIdInput}
                                    onChange={(e) => setMtOrgIdInput(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="org_..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Publishable Key</label>
                                <input 
                                    type="text"
                                    value={mtPublishableKeyInput}
                                    onChange={(e) => setMtPublishableKeyInput(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="pk_live_..."
                                />
                            </div>
                            <div className="pt-4 border-t border-gray-800">
                                <h3 className="text-sm font-semibold text-gray-300 mb-3">Webhook Configuration</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Endpoint URL</label>
                                        <input 
                                            type="text"
                                            value={mtWebhookUrlInput}
                                            onChange={(e) => setMtWebhookUrlInput(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="https://your-app.com/api/v1/mt/webhook"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Signing Key</label>
                                        <input 
                                            type="password"
                                            value={mtWebhookSigningKeyInput}
                                            onChange={(e) => setMtWebhookSigningKeyInput(e.target.value)}
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="whsec_..."
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button 
                                    onClick={() => setIsMtModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveMtKey}
                                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Save Config
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Integration Inspector Modal */}
            {selectedIntegration && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg p-8 bg-gray-900 border-gray-800">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <span className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-[10px] font-mono uppercase tracking-wider">
                                    {selectedIntegration.category}
                                </span>
                                <h2 className="text-2xl font-bold text-white mt-1">{selectedIntegration.name}</h2>
                            </div>
                            <button 
                                onClick={() => setSelectedIntegration(null)}
                                className="text-gray-400 hover:text-white text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Description</h4>
                                <p className="text-sm text-gray-300">{selectedIntegration.description}</p>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Source File Path</h4>
                                <code className="block bg-black/40 p-2 rounded text-xs text-blue-400 font-mono break-all">
                                    {selectedIntegration.filePath}
                                </code>
                            </div>

                            <div>
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Registered Endpoints</h4>
                                <div className="space-y-1.5">
                                    {selectedIntegration.endpoints.map((ep, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-black/20 p-2 rounded text-xs font-mono">
                                            <span className="text-green-400">{ep.split(' ')[0]}</span>
                                            <span className="text-gray-300">{ep.split(' ')[1]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Latency</h4>
                                    <span className="text-lg font-bold text-white font-mono">{selectedIntegration.latency} ms</span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Last Sync</h4>
                                    <span className="text-lg font-bold text-white">{selectedIntegration.lastSync}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button 
                                onClick={() => setSelectedIntegration(null)}
                                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                            >
                                Close Inspector
                            </button>
                            <button 
                                onClick={() => {
                                    triggerSync(selectedIntegration.id);
                                    setSelectedIntegration(null);
                                }}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Trigger Sync
                            </button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default APIIntegrationView;