import React, { useState } from 'react';
import Card from './Card';
import { 
    Network, 
    ShieldCheck, 
    Globe, 
    CheckCircle, 
    Search, 
    AlertCircle, 
    Cpu, 
    Activity,
    Plus,
    Filter,
    Lock,
    RefreshCw,
    FileText,
    X,
    ChevronRight,
    Fingerprint,
    KeyRound,
    Scale,
    Shield
} from 'lucide-react';

interface Issuer {
    id: string;
    name: string;
    status: 'VERIFIED' | 'BETA' | 'WARNING' | 'REVOKED';
    nodes: number;
    trustScore: number;
    type: 'Government' | 'Private' | 'NGO' | 'Sovereign' | 'Decentralized';
    jurisdiction: string;
    zkProofSupported: boolean;
    activeCertificates: number;
    lastAudit: string;
    proofHash: string;
    complianceStandard: string;
}

const INITIAL_ISSUERS: Issuer[] = [
    { 
        id: 'iss-001',
        name: 'Swiss Sovereign ID Authority', 
        status: 'VERIFIED', 
        nodes: 842, 
        trustScore: 99.8, 
        type: 'Government',
        jurisdiction: 'CH - Switzerland',
        zkProofSupported: true,
        activeCertificates: 1420500,
        lastAudit: '2025-02-28 14:22 UTC',
        proofHash: '0x8f92a4e...71b2c4',
        complianceStandard: 'eIDAS 2.0 / ZK-SNARK'
    },
    { 
        id: 'iss-002',
        name: 'Loomis Sovereign Private Enclave', 
        status: 'BETA', 
        nodes: 120, 
        trustScore: 84.1, 
        type: 'Private',
        jurisdiction: 'Global - Offshore Mesh',
        zkProofSupported: true,
        activeCertificates: 45200,
        lastAudit: '2025-02-27 09:15 UTC',
        proofHash: '0x3c11e9a...8801f9',
        complianceStandard: 'FIPS 140-3 Level 4'
    },
    { 
        id: 'iss-003',
        name: 'GlobalID Proxy (UN Sovereign Trust)', 
        status: 'WARNING', 
        nodes: 42, 
        trustScore: 32.5, 
        type: 'NGO',
        jurisdiction: 'UN Multilateral',
        zkProofSupported: false,
        activeCertificates: 890100,
        lastAudit: '2025-02-12 18:40 UTC',
        proofHash: '0x10fa21b...9903e1',
        complianceStandard: 'ISO 27001 (Audit Expired)'
    },
    { 
        id: 'iss-004',
        name: 'Estonia e-Residency Zero-Trust Vault', 
        status: 'VERIFIED', 
        nodes: 612, 
        trustScore: 98.4, 
        type: 'Government',
        jurisdiction: 'EE - Estonia / EU',
        zkProofSupported: true,
        activeCertificates: 312000,
        lastAudit: '2025-03-01 02:10 UTC',
        proofHash: '0xaa441e8...d928a3',
        complianceStandard: 'eIDAS High Security'
    },
    { 
        id: 'iss-005',
        name: 'Aquarius Decentralized Autonomous ID', 
        status: 'VERIFIED', 
        nodes: 1240, 
        trustScore: 99.9, 
        type: 'Decentralized',
        jurisdiction: 'P2P Sovereign Network',
        zkProofSupported: true,
        activeCertificates: 5800400,
        lastAudit: '2025-03-01 11:00 UTC',
        proofHash: '0x7e8124d...11bc90',
        complianceStandard: 'W3C DID v1.0 / ZK-STARK'
    },
    { 
        id: 'iss-006',
        name: 'Liechtenstein Sovereign Trust Vault', 
        status: 'VERIFIED', 
        nodes: 410, 
        trustScore: 96.7, 
        type: 'Sovereign',
        jurisdiction: 'LI - Liechtenstein',
        zkProofSupported: true,
        activeCertificates: 98200,
        lastAudit: '2025-02-25 16:05 UTC',
        proofHash: '0x21c889a...44f001',
        complianceStandard: 'TVTG Token Act Compliant'
    }
];

const TrustRegistryView: React.FC = () => {
    const [issuers, setIssuers] = useState<Issuer[]>(INITIAL_ISSUERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState<string>('ALL');
    const [selectedIssuer, setSelectedIssuer] = useState<Issuer | null>(null);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Form state for registering new entity
    const [newIssuer, setNewIssuer] = useState({
        name: '',
        type: 'Private' as Issuer['type'],
        jurisdiction: '',
        complianceStandard: 'W3C DID / ZK-STARK',
        zkProofSupported: true
    });

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
        }, 800);
    };

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIssuer.name || !newIssuer.jurisdiction) return;

        const created: Issuer = {
            id: `iss-00${issuers.length + 1}`,
            name: newIssuer.name,
            status: 'BETA',
            nodes: 1,
            trustScore: 85.0,
            type: newIssuer.type,
            jurisdiction: newIssuer.jurisdiction,
            zkProofSupported: newIssuer.zkProofSupported,
            activeCertificates: 1,
            lastAudit: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
            proofHash: '0x' + Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join(''),
            complianceStandard: newIssuer.complianceStandard
        };

        setIssuers([created, ...issuers]);
        setNewIssuer({
            name: '',
            type: 'Private',
            jurisdiction: '',
            complianceStandard: 'W3C DID / ZK-STARK',
            zkProofSupported: true
        });
        setIsRegisterModalOpen(false);
    };

    const filteredIssuers = issuers.filter(issuer => {
        const matchesSearch = issuer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              issuer.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              issuer.complianceStandard.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'ALL' || issuer.type.toUpperCase() === selectedType.toUpperCase();
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-16">
            <header className="border-b border-gray-800 pb-10 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Network className="text-blue-400 w-5 h-5 animate-pulse" />
                        <h2 className="text-xs font-mono text-blue-400 uppercase tracking-[0.4em]">Decentralized Trust Protocol</h2>
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter">
                        Trust <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Registry</span>
                    </h1>
                    <p className="text-gray-400 mt-4 max-w-3xl font-light leading-relaxed">
                        Reversing the traditional "Root of Trust." Instead of state entities auditing you without consent, 
                        you and decentralized verification nodes continuously audit the identity issuers.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleRefresh}
                        className="p-3 bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-xl transition-all"
                        title="Sync Trust Telemetry"
                    >
                        <RefreshCw size={18} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
                    </button>
                    <button
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all"
                    >
                        <Plus size={16} />
                        Register Issuer
                    </button>
                </div>
            </header>

            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-gray-900/60 p-4 rounded-2xl border border-gray-800 backdrop-blur-md">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search issuers, standards, or jurisdictions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    <Filter size={16} className="text-gray-500 hidden md:block" />
                    {['ALL', 'GOVERNMENT', 'PRIVATE', 'NGO', 'SOVEREIGN', 'DECENTRALIZED'].map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                                selectedType === type 
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                                    : 'bg-gray-950 text-gray-400 hover:text-white border border-gray-800'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Issuers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredIssuers.map((issuer) => (
                    <Card key={issuer.id} title={issuer.name} subtitle={`${issuer.type} • ${issuer.jurisdiction}`} variant="interactive">
                        <div className="space-y-6 mt-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Trust Score</p>
                                    <p className={`text-4xl font-mono font-black ${
                                        issuer.trustScore >= 90 ? 'text-blue-400' : 
                                        issuer.trustScore >= 70 ? 'text-yellow-400' : 'text-red-400'
                                    }`}>
                                        {issuer.trustScore}%
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Audit Nodes</p>
                                    <p className="text-xl font-mono text-white">{issuer.nodes.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="space-y-2 pt-2 border-t border-gray-800/80 text-xs font-mono">
                                <div className="flex justify-between text-gray-400">
                                    <span>Standard:</span>
                                    <span className="text-gray-200 font-semibold">{issuer.complianceStandard}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>ZK Proofs:</span>
                                    <span className={issuer.zkProofSupported ? "text-emerald-400 font-semibold flex items-center gap-1" : "text-gray-500"}>
                                        {issuer.zkProofSupported ? <ShieldCheck size={12} /> : null}
                                        {issuer.zkProofSupported ? 'SUPPORTED' : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Certificates:</span>
                                    <span className="text-gray-200">{issuer.activeCertificates.toLocaleString()}</span>
                                </div>
                            </div>
                            
                            <div className={`p-3 rounded-xl border flex items-center justify-between text-[10px] font-black uppercase tracking-widest ${
                                issuer.status === 'VERIFIED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                                issuer.status === 'WARNING' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                                issuer.status === 'REVOKED' ? 'bg-zinc-800 border-zinc-700 text-zinc-400' :
                                'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                            }`}>
                                <div className="flex items-center gap-2">
                                    {issuer.status === 'VERIFIED' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                    <span>{issuer.status}</span>
                                </div>
                                <span className="font-mono opacity-60 text-[9px]">{issuer.proofHash.slice(0, 10)}...</span>
                            </div>
                            
                            <button 
                                onClick={() => setSelectedIssuer(issuer)}
                                className="w-full py-3 bg-gray-950 border border-gray-800 hover:border-blue-500/40 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all rounded-xl flex items-center justify-center gap-2"
                            >
                                <FileText size={14} />
                                View Audit Trail
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Registry Telemetry */}
            <Card title="Registry Telemetry & Consensus" icon={<Activity className="text-blue-400" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-4">
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800/80">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Active Ledger</p>
                            <Cpu size={16} className="text-blue-400" />
                        </div>
                        <p className="text-lg font-mono font-bold text-white">Citadel-L1 Sovereign</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-1">Block #18,940,210</p>
                    </div>
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800/80">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Consensus Mode</p>
                            <ShieldCheck size={16} className="text-indigo-400" />
                        </div>
                        <p className="text-lg font-mono font-bold text-white">Proof-of-Audit (PoA)</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-1">3,266 Verified Validators</p>
                    </div>
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800/80">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Peer Verification</p>
                            <Globe size={16} className="text-emerald-400" />
                        </div>
                        <p className="text-lg font-mono font-bold text-emerald-400">STABLE / OPTIMAL</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-1">Zero Privacy Leak Detected</p>
                    </div>
                    <div className="bg-gray-950 p-4 rounded-xl border border-gray-800/80">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-mono">Global Latency</p>
                            <Activity size={16} className="text-yellow-400" />
                        </div>
                        <p className="text-lg font-mono font-bold text-white">124 ms</p>
                        <p className="text-[10px] text-gray-500 font-mono mt-1">p99: 182 ms</p>
                    </div>
                </div>
            </Card>

            {/* Issuer Audit Modal */}
            {selectedIssuer && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-950">
                            <div className="flex items-center gap-3">
                                <Shield className="text-blue-400" size={24} />
                                <div>
                                    <h3 className="text-xl font-bold text-white">{selectedIssuer.name}</h3>
                                    <p className="text-xs font-mono text-gray-400">{selectedIssuer.type} • {selectedIssuer.jurisdiction}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedIssuer(null)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto font-mono text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                                    <span className="text-xs text-gray-500 uppercase">Trust Score Rating</span>
                                    <div className="text-3xl font-black text-blue-400 mt-1">{selectedIssuer.trustScore}%</div>
                                </div>
                                <div className="bg-gray-950 p-4 rounded-xl border border-gray-800">
                                    <span className="text-xs text-gray-500 uppercase">Status</span>
                                    <div className="text-xl font-black text-emerald-400 mt-2">{selectedIssuer.status}</div>
                                </div>
                            </div>

                            <div className="space-y-3 bg-gray-950 p-4 rounded-xl border border-gray-800">
                                <h4 className="text-xs uppercase text-gray-400 font-bold border-b border-gray-800 pb-2">Cryptographic Audit Credentials</h4>
                                <div className="flex justify-between text-xs py-1">
                                    <span className="text-gray-500">Proof Hash:</span>
                                    <span className="text-blue-400 font-mono break-all">{selectedIssuer.proofHash}</span>
                                </div>
                                <div className="flex justify-between text-xs py-1">
                                    <span className="text-gray-500">Compliance Spec:</span>
                                    <span className="text-gray-200">{selectedIssuer.complianceStandard}</span>
                                </div>
                                <div className="flex justify-between text-xs py-1">
                                    <span className="text-gray-500">Last Telemetry Audit:</span>
                                    <span className="text-gray-200">{selectedIssuer.lastAudit}</span>
                                </div>
                                <div className="flex justify-between text-xs py-1">
                                    <span className="text-gray-500">ZK Zero-Knowledge:</span>
                                    <span className={selectedIssuer.zkProofSupported ? "text-emerald-400 font-bold" : "text-gray-500"}>
                                        {selectedIssuer.zkProofSupported ? "ENABLED (Non-Interactive)" : "DISABLED"}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs uppercase text-gray-400 font-bold">Consensus Verification Node Distribution</h4>
                                <div className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 flex justify-between items-center text-xs">
                                    <span className="text-gray-400">Total Validating Nodes</span>
                                    <span className="text-white font-bold">{selectedIssuer.nodes} active peers</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-800 bg-gray-950 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedIssuer(null)}
                                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xs font-mono font-bold uppercase transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Register Issuer Modal */}
            {isRegisterModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-950">
                            <div className="flex items-center gap-3">
                                <Plus className="text-blue-400" size={20} />
                                <h3 className="text-lg font-bold text-white">Register New Identity Issuer</h3>
                            </div>
                            <button 
                                onClick={() => setIsRegisterModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleRegister} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Issuer / Authority Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Neo-Sovereign Identity Mint"
                                    value={newIssuer.name}
                                    onChange={(e) => setNewIssuer({...newIssuer, name: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Issuer Type</label>
                                    <select
                                        value={newIssuer.type}
                                        onChange={(e) => setNewIssuer({...newIssuer, type: e.target.value as Issuer['type']})}
                                        className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                                    >
                                        <option value="Government">Government</option>
                                        <option value="Private">Private</option>
                                        <option value="NGO">NGO</option>
                                        <option value="Sovereign">Sovereign</option>
                                        <option value="Decentralized">Decentralized</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Jurisdiction</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. DE / Global Mesh"
                                        value={newIssuer.jurisdiction}
                                        onChange={(e) => setNewIssuer({...newIssuer, jurisdiction: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-gray-400 uppercase mb-1">Compliance Standard</label>
                                <input
                                    type="text"
                                    value={newIssuer.complianceStandard}
                                    onChange={(e) => setNewIssuer({...newIssuer, complianceStandard: e.target.value})}
                                    className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all font-mono"
                                />
                            </div>

                            <div className="flex items-center justify-between bg-gray-950 p-3 rounded-xl border border-gray-800">
                                <span className="text-xs font-mono text-gray-300">Enable ZK Proof Support</span>
                                <input 
                                    type="checkbox"
                                    checked={newIssuer.zkProofSupported}
                                    onChange={(e) => setNewIssuer({...newIssuer, zkProofSupported: e.target.checked})}
                                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsRegisterModalOpen(false)}
                                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-mono uppercase"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold uppercase shadow-md shadow-blue-600/30"
                                >
                                    Submit Registration
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrustRegistryView;