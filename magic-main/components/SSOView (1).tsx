import React, { useState, useCallback, useMemo } from 'react';
import Card from './Card';
import { 
    Cpu, Zap, ShieldCheck, AlertTriangle, Link, Settings, 
    Globe, Terminal, Code, Brain, Infinity, Rocket, 
    Building2, Search, CheckCircle2, Lock, Fingerprint
} from 'lucide-react';

interface SSOProvider {
    id: string;
    name: string;
    description: string;
    category: 'IDENTITY' | 'FINANCE' | 'OPERATIONS';
    icon: React.ReactNode;
    color: string;
    status: 'AVAILABLE' | 'LINKED' | 'MAINTENANCE';
}

// FIX: Moved Cloud component definition before SSO_PROVIDERS where it is used.
const Cloud = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c2.5 0 4.5-2 4.5-4.5 0-2.4-1.8-4.3-4.1-4.5-1.1-3.6-4.4-6-8.4-6-4.5 0-8.2 3.5-8.5 7.9C1.1 12.5 1 13.2 1 14c0 2.8 2.2 5 5 5h11.5z"/></svg>
);

const SSO_PROVIDERS: SSOProvider[] = [
    { 
        id: 'workday', 
        name: 'Workday', 
        description: 'Synchronize human capital and enterprise financial datasets.', 
        category: 'FINANCE',
        icon: <Building2 className="w-8 h-8" />, 
        color: 'border-blue-500 text-blue-400',
        status: 'AVAILABLE'
    },
    { 
        id: 'salesforce', 
        name: 'Salesforce', 
        description: 'Link CRM relationship dynamics with capital flow analytics.', 
        category: 'OPERATIONS',
        icon: <Cloud className="w-8 h-8" />, 
        color: 'border-cyan-500 text-cyan-400',
        status: 'AVAILABLE'
    },
    { 
        id: 'office365', 
        name: 'Microsoft 365', 
        description: 'Standard enterprise identity anchor for corporate sovereignty.', 
        category: 'IDENTITY',
        icon: <Zap className="w-8 h-8" />, 
        color: 'border-indigo-500 text-indigo-400',
        status: 'AVAILABLE'
    },
    { 
        id: 'google', 
        name: 'Google Workspace', 
        description: 'Seamless integration with the planetary productivity grid.', 
        category: 'IDENTITY',
        icon: <Globe className="w-8 h-8" />, 
        color: 'border-green-500 text-green-400',
        status: 'AVAILABLE'
    },
    { 
        id: 'auth0', 
        name: 'Auth0 Management', 
        description: 'Advanced administrative control over the Nexus trust anchor.', 
        category: 'IDENTITY',
        icon: <ShieldCheck className="w-8 h-8" />, 
        color: 'border-purple-500 text-purple-400',
        status: 'LINKED'
    },
];

const SSOView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [linkingProvider, setLinkingProvider] = useState<SSOProvider | null>(null);
    const [handshakeStep, setHandshakeStep] = useState(0);

    const filteredProviders = useMemo(() => {
        return SSO_PROVIDERS.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const startLinking = (provider: SSOProvider) => {
        if (provider.status === 'LINKED') return;
        setLinkingProvider(provider);
        setHandshakeStep(1);
        
        // Simulate OAuth Handshake Steps
        const steps = 5;
        for (let i = 1; i <= steps; i++) {
            setTimeout(() => {
                setHandshakeStep(i);
                if (i === steps) {
                    setTimeout(() => {
                        setLinkingProvider(null);
                        setHandshakeStep(0);
                        alert(`${provider.name} linked successfully via secure OIDC tunnel.`);
                    }, 1000);
                }
            }, i * 1200);
        }
    };

    const handshakeMessages = [
        "Initializing secure tunnel...",
        "Requesting OAuth Grant...",
        "Validating remote PKI certificate...",
        "Establishing persistent JWT bridge...",
        "Handshake finalized. Synchronizing profile..."
    ];

    return (
        <div className="p-6 md:p-10 space-y-10 min-h-screen bg-gray-950 font-sans relative">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8">
                <div>
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-tighter">
                        Nexus Identity Hub
                    </h1>
                    <p className="mt-2 text-xl text-gray-400">
                        Manage your sovereign federated links across the enterprise grid.
                    </p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="Search enterprise providers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all shadow-inner"
                    />
                </div>
            </header>

            {/* Simulated Handshake Modal Overlay */}
            {linkingProvider && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-gray-900 border border-blue-500/50 rounded-[2.5rem] p-10 text-center shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                        <div className="relative w-32 h-32 mx-auto mb-8">
                            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-blue-400 animate-pulse">
                                    {linkingProvider.icon}
                                </div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Linking {linkingProvider.name}</h3>
                        <p className="text-sm font-mono text-blue-400/80 mb-6 h-6">
                            {handshakeMessages[handshakeStep - 1] || "Verifying connection..."}
                        </p>
                        <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                                className="bg-blue-500 h-full transition-all duration-700" 
                                style={{ width: `${(handshakeStep / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Providers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProviders.map(provider => (
                    <div 
                        key={provider.id}
                        onClick={() => startLinking(provider)}
                        className={`group relative p-8 rounded-[2rem] border-2 bg-gray-900/40 backdrop-blur transition-all duration-500 cursor-pointer ${
                            provider.status === 'LINKED' 
                            ? 'border-green-500/50 bg-green-500/5 shadow-green-500/10' 
                            : 'border-gray-800 hover:border-blue-500/50 hover:bg-gray-800/40'
                        }`}
                    >
                        <div className={`p-4 rounded-2xl bg-gray-800 border border-gray-700 mb-6 w-fit transition-transform group-hover:scale-110 duration-500 ${provider.color.split(' ')[1]}`}>
                            {provider.icon}
                        </div>
                        
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-2xl font-bold text-white">{provider.name}</h3>
                            {provider.status === 'LINKED' && (
                                <CheckCircle2 className="text-green-400 w-6 h-6" />
                            )}
                        </div>
                        
                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                            {provider.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-800 px-3 py-1 rounded-full">
                                {provider.category}
                            </span>
                            <span className={`text-xs font-bold uppercase tracking-tighter flex items-center gap-1 ${
                                provider.status === 'LINKED' ? 'text-green-400' : 'text-blue-400'
                            }`}>
                                {provider.status === 'LINKED' ? 'Secure Bridge Active' : 'Establish Tunnel'}
                                <Rocket size={14} className={provider.status === 'LINKED' ? 'hidden' : 'inline'} />
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Protocol Governance Section */}
            <section className="mt-20">
                <Card title="Handshake Protocol Sovereignty" className="border-indigo-500/20 bg-indigo-950/5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 text-gray-300">
                            <h3 className="text-2xl font-bold text-white">Trust is Mathematical</h3>
                            <p className="leading-relaxed">
                                Federated identity within the Nexus is not a matter of shared secrets, but of verified provenance. Every link you establish utilizes the **OIDC (OpenID Connect)** protocol, secured via **RS256** asymmetric cryptography.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <ShieldCheck className="text-cyan-400 w-5 h-5 shrink-0 mt-1" />
                                    <span>Zero-Trust Architecture: We never store your third-party credentials.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Lock className="text-cyan-400 w-5 h-5 shrink-0 mt-1" />
                                    <span>Encrypted Handshake: All metadata exchange occurs via mutually authenticated TLS.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Fingerprint className="text-cyan-400 w-5 h-5 shrink-0 mt-1" />
                                    <span>Biometric Anchoring: Critical SSO operations require local node heartbeat verification.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-black/40 border border-gray-800 rounded-[2rem] p-8 font-mono text-xs text-blue-300/70 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4"><Infinity className="text-blue-500/20 w-32 h-32" /></div>
                            <p className="text-blue-400 mb-4">&gt; ANALYZING FEDERATED TOKENS...</p>
                            <p className="mb-2">issuer: citibankdemobusinessinc.us.auth0.com</p>
                            <p className="mb-2">audience: https://ce47fe80-dabc-4ad0-b0e7...</p>
                            <p className="mb-2">alg: RS256</p>
                            <p className="mb-2">iat: {Math.floor(Date.now() / 1000)}</p>
                            <p className="mb-2">exp: {Math.floor(Date.now() / 1000) + 3600}</p>
                            <p className="text-green-400 mt-4">&gt; STATUS: ALL SIGNATURES VERIFIED // TRUST STEADY</p>
                        </div>
                    </div>
                </Card>
            </section>

            <footer className="text-center pt-12 border-t border-gray-800 text-[10px] text-gray-700 font-mono tracking-widest uppercase">
                Federated Identity Subsystem v4.2.0-Alpha // Quantum Link: STABLE
            </footer>
        </div>
    );
};

export default SSOView;