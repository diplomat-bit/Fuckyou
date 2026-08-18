import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { 
    Key, Shield, Copy, Eye, EyeOff, Plus, CheckCircle, 
    XCircle, RefreshCw, Play, ExternalLink, Database, 
    Cpu, Globe, Landmark, CreditCard, ShieldAlert, Check, Trash2
} from 'lucide-react';

interface APIKey {
    id: string;
    platform: string;
    name: string;
    key: string;
    status: 'active' | 'inactive' | 'expired';
    lastUsed: string;
    created: string;
    category: 'Brokerage' | 'Banking' | 'AI & Data' | 'Government' | 'Sovereign';
}

const APIKeysView: React.FC = () => {
    const context = useContext(DataContext);
    const [showKey, setShowKey] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [testingId, setTestingId] = useState<string | null>(null);
    const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});
    const [keys, setKeys] = useState<APIKey[]>([
        { 
            id: 'alpaca-prod', 
            platform: 'Alpaca Brokerage API', 
            name: 'Production Trading Terminal', 
            key: 'AK_PROD_ALPACA_91a8f2c3d4e5f6', 
            status: 'active', 
            lastUsed: '2 mins ago', 
            created: '2023-10-15',
            category: 'Brokerage'
        },
        { 
            id: 'citi-connect', 
            platform: 'Citi Connect Gateway', 
            name: 'Sovereign Ledger Sync', 
            key: 'CITI_CLIENT_SEC_88271a99b88cc', 
            status: 'active', 
            lastUsed: '1 hour ago', 
            created: '2023-11-01',
            category: 'Banking'
        },
        { 
            id: 'plaid-link', 
            platform: 'Plaid Link Bridge', 
            name: 'Retail Bank Aggregator', 
            key: 'PLAID_SECRET_sandbox_992100ffaa', 
            status: 'active', 
            lastUsed: 'Just now', 
            created: '2023-11-02',
            category: 'Banking'
        },
        { 
            id: 'stripe-treasury', 
            platform: 'Stripe Treasury', 
            name: 'Card Issuance & Payouts', 
            key: 'sk_live_stripe_51Nx992811a00bb', 
            status: 'active', 
            lastUsed: '12 hours ago', 
            created: '2023-09-20',
            category: 'Banking'
        },
        { 
            id: 'modern-treasury', 
            platform: 'Modern Treasury Ledger', 
            name: 'Real-time Ledger Sync', 
            key: 'MT_LIVE_KEY_88112233445566', 
            status: 'active', 
            lastUsed: '3 days ago', 
            created: '2023-10-10',
            category: 'Banking'
        },
        { 
            id: 'astra-db', 
            platform: 'Astra DB Vector Search', 
            name: 'Cognitive Memory Store', 
            key: 'AstraCS:token_992211_aabbccddeeff', 
            status: 'active', 
            lastUsed: '5 mins ago', 
            created: '2023-11-05',
            category: 'AI & Data'
        },
        { 
            id: 'gemini-ai', 
            platform: 'Gemini Live Portal', 
            name: 'Autonomous Advisor Agent', 
            key: 'GEMINI_API_KEY_v1_9922881100', 
            status: 'active', 
            lastUsed: 'Just now', 
            created: '2023-11-08',
            category: 'AI & Data'
        },
        { 
            id: 'azure-gov', 
            platform: 'Azure Gov Compliance', 
            name: 'Sovereign Sentry Engine', 
            key: 'AZURE_GOV_CLIENT_SECRET_991122', 
            status: 'active', 
            lastUsed: '1 day ago', 
            created: '2023-10-25',
            category: 'Government'
        },
        { 
            id: 'sovereign-intel', 
            platform: 'Sovereign Intelligence', 
            name: 'Global Market Takeover', 
            key: 'SOV_INTEL_BEARER_TOKEN_992288', 
            status: 'active', 
            lastUsed: '4 mins ago', 
            created: '2023-11-12',
            category: 'Sovereign'
        },
        { 
            id: 'gov-gateway', 
            platform: 'Government Gateway API', 
            name: 'IRS Tax Filing & SEC Audits', 
            key: 'GOV_GATEWAY_SECURE_KEY_882211', 
            status: 'inactive', 
            lastUsed: 'Never', 
            created: '2023-11-14',
            category: 'Government'
        }
    ]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newKeyPlatform, setNewKeyPlatform] = useState('Alpaca Brokerage API');
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyCategory, setNewKeyCategory] = useState<'Brokerage' | 'Banking' | 'AI & Data' | 'Government' | 'Sovereign'>('Brokerage');

    if (!context) return null;

    const toggleKeyVisibility = (id: string) => {
        setShowKey(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleCopyToClipboard = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleTestConnection = (id: string, platform: string) => {
        setTestingId(id);
        setTestResults(prev => ({ ...prev, [id]: { success: false, message: 'Connecting...' } }));

        setTimeout(() => {
            const isSuccess = id !== 'gov-gateway'; // Simulate failure for inactive gateway
            setTestResults(prev => ({
                ...prev,
                [id]: {
                    success: isSuccess,
                    message: isSuccess 
                        ? `Successfully authenticated with ${platform} gateway.` 
                        : `Authentication failed. Please check credentials for ${platform}.`
                }
            }));
            setTestingId(null);
        }, 1200);
    };

    const handleRevokeKey = (id: string) => {
        if (confirm('Are you sure you want to revoke this API key? Any active integrations using this key will fail immediately.')) {
            setKeys(prev => prev.filter(k => k.id !== id));
        }
    };

    const handleCreateKey = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newKeyName) return;

        const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const generatedKey = `sk_${newKeyCategory.toLowerCase().replace(' & ', '_')}_${randomHex}`;

        const newKey: APIKey = {
            id: `custom-${Date.now()}`,
            platform: newKeyPlatform,
            name: newKeyName,
            key: generatedKey,
            status: 'active',
            lastUsed: 'Never',
            created: new Date().toISOString().split('T')[0],
            category: newKeyCategory
        };

        setKeys(prev => [newKey, ...prev]);
        setIsModalOpen(false);
        setNewKeyName('');
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'Brokerage': return <Landmark className="text-emerald-400" size={18} />;
            case 'Banking': return <CreditCard className="text-cyan-400" size={18} />;
            case 'AI & Data': return <Cpu className="text-purple-400" size={18} />;
            case 'Government': return <Shield className="text-amber-400" size={18} />;
            case 'Sovereign': return <Globe className="text-rose-400" size={18} />;
            default: return <Key className="text-gray-400" size={18} />;
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                        <Key className="text-cyan-400" size={32} />
                        API Key Management
                    </h1>
                    <p className="text-gray-400">
                        Securely manage credentials, tokens, and endpoints for all integrated financial, AI, and sovereign systems.
                    </p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:scale-[1.02]"
                >
                    <Plus size={18} />
                    Generate New Key
                </button>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/40 border border-white/5 rounded-xl p-4">
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Active Keys</div>
                    <div className="text-2xl font-black text-white mt-1">{keys.filter(k => k.status === 'active').length}</div>
                </div>
                <div className="bg-gray-900/40 border border-white/5 rounded-xl p-4">
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Connected Gateways</div>
                    <div className="text-2xl font-black text-cyan-400 mt-1">10 / 10</div>
                </div>
                <div className="bg-gray-900/40 border border-white/5 rounded-xl p-4">
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Last Sync Status</div>
                    <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                        <CheckCircle size={20} /> Operational
                    </div>
                </div>
                <div className="bg-gray-900/40 border border-white/5 rounded-xl p-4">
                    <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Security Level</div>
                    <div className="text-2xl font-black text-purple-400 mt-1">Military Grade</div>
                </div>
            </div>

            {/* Active Keys Section */}
            <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Database className="text-cyan-400" size={20} />
                    Active Platform Credentials
                </h2>
                
                <div className="space-y-4">
                    {keys.map((apiKey) => (
                        <div 
                            key={apiKey.id} 
                            className="flex flex-col lg:flex-row lg:items-center justify-between p-5 bg-black/30 rounded-xl border border-white/5 gap-4 hover:border-white/10 transition-all"
                        >
                            <div className="flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="p-1.5 bg-white/5 rounded-lg">
                                        {getCategoryIcon(apiKey.category)}
                                    </span>
                                    <div>
                                        <span className="text-sm font-bold text-white block">{apiKey.platform}</span>
                                        <span className="text-xs text-gray-400">{apiKey.name}</span>
                                    </div>
                                    <span className={`ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                        apiKey.status === 'active' 
                                            ? 'bg-emerald-500/20 text-emerald-400' 
                                            : 'bg-red-500/20 text-red-400'
                                    }`}>
                                        {apiKey.status}
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-white/5 text-gray-400">
                                        {apiKey.category}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-400 font-mono bg-black/40 p-2 rounded-lg border border-white/5 w-fit max-w-full overflow-x-auto">
                                    <span className="select-all">
                                        {showKey[apiKey.id] ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                                    </span>
                                    <div className="flex items-center gap-1.5 ml-4 shrink-0">
                                        <button 
                                            onClick={() => toggleKeyVisibility(apiKey.id)} 
                                            className="hover:text-white transition-colors p-1 hover:bg-white/5 rounded"
                                            title={showKey[apiKey.id] ? "Hide Key" : "Show Key"}
                                        >
                                            {showKey[apiKey.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                        <button 
                                            onClick={() => handleCopyToClipboard(apiKey.id, apiKey.key)} 
                                            className="hover:text-white transition-colors p-1 hover:bg-white/5 rounded relative" 
                                            title="Copy to clipboard"
                                        >
                                            {copiedId === apiKey.id ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Test Connection Results */}
                            {testResults[apiKey.id] && (
                                <div className={`text-xs p-2.5 rounded-lg border max-w-xs ${
                                    testResults[apiKey.id].success 
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}>
                                    {testResults[apiKey.id].message}
                                </div>
                            )}

                            <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center text-xs text-gray-500 gap-1 shrink-0">
                                <div>Created: {apiKey.created}</div>
                                <div>Last used: {apiKey.lastUsed}</div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button 
                                    onClick={() => handleTestConnection(apiKey.id, apiKey.platform)}
                                    disabled={testingId === apiKey.id}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/5 disabled:opacity-50"
                                >
                                    {testingId === apiKey.id ? (
                                        <RefreshCw size={12} className="animate-spin" />
                                    ) : (
                                        <Play size={12} />
                                    )}
                                    Test Ping
                                </button>
                                <button 
                                    onClick={() => handleRevokeKey(apiKey.id)}
                                    className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                    title="Revoke Key"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Security Best Practices */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex gap-4">
                <Shield className="text-blue-400 shrink-0" size={24} />
                <div>
                    <h3 className="text-sm font-bold text-blue-400 mb-1">Security Best Practices & Compliance</h3>
                    <p className="text-xs text-blue-300/80 leading-relaxed">
                        Never share your secret keys. Keep them guarded and secure. Do not commit them to version control or expose them in client-side code. Consider rotating your keys periodically to maintain optimal security. All API requests are audited and logged via the <span className="text-cyan-400 font-mono">Sovereign Sentry Engine</span>.
                    </p>
                </div>
            </div>

            {/* Generate Key Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-gray-950 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Key className="text-cyan-400" size={20} />
                                Generate New API Key
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <XCircle size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateKey} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                    Platform / Service
                                </label>
                                <select 
                                    value={newKeyPlatform}
                                    onChange={(e) => setNewKeyPlatform(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="Alpaca Brokerage API">Alpaca Brokerage API</option>
                                    <option value="Citi Connect Gateway">Citi Connect Gateway</option>
                                    <option value="Plaid Link Bridge">Plaid Link Bridge</option>
                                    <option value="Stripe Treasury">Stripe Treasury</option>
                                    <option value="Modern Treasury Ledger">Modern Treasury Ledger</option>
                                    <option value="Astra DB Vector Search">Astra DB Vector Search</option>
                                    <option value="Gemini Live Portal">Gemini Live Portal</option>
                                    <option value="Azure Gov Compliance">Azure Gov Compliance</option>
                                    <option value="Sovereign Intelligence">Sovereign Intelligence</option>
                                    <option value="Government Gateway API">Government Gateway API</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                    Category
                                </label>
                                <select 
                                    value={newKeyCategory}
                                    onChange={(e) => setNewKeyCategory(e.target.value as any)}
                                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                                >
                                    <option value="Brokerage">Brokerage</option>
                                    <option value="Banking">Banking</option>
                                    <option value="AI & Data">AI & Data</option>
                                    <option value="Government">Government</option>
                                    <option value="Sovereign">Sovereign</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                                    Key Description / Name
                                </label>
                                <input 
                                    type="text"
                                    placeholder="e.g. Production Trading Terminal"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    required
                                    className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors border border-white/5 text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-colors text-sm"
                                >
                                    Generate Key
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default APIKeysView;