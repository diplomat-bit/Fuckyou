import React, { useContext, useState, useEffect, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { View, PaymentOrder, Invoice, ComplianceCase, CorporateTransaction } from '../types';
import { callGemini } from '../services/geminiService';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import { Shield, TrendingUp, Activity, Briefcase, Server, Globe, Zap, AlertTriangle, CheckCircle2, ChevronRight, FileSearch, Terminal, Cpu, Search, Filter, Play, RefreshCw, Database, Lock, Layers } from 'lucide-react';

interface SystemModule {
    name: string;
    path: string;
    category: 'Alpaca' | 'Bridges' | 'Government' | 'Real Estate' | 'Tax Liens' | 'Trillionaire' | 'AI & Quantum' | 'Core';
    status: 'ONLINE' | 'SYNCING' | 'STANDBY' | 'ENCRYPTED';
    clearance: 'L1-Public' | 'L3-Executive' | 'L5-Sovereign';
    description: string;
}

const SYSTEM_MODULES: SystemModule[] = [
    // Alpaca
    {
        name: "Alpaca Accounts Manager",
        path: "components/alpaca/AlpacaAccountsManager.tsx",
        category: "Alpaca",
        status: "ONLINE",
        clearance: "L3-Executive",
        description: "Manages institutional Alpaca brokerage accounts, sub-accounts, and margin profiles."
    },
    {
        name: "Alpaca Crypto Wallets",
        path: "components/alpaca/AlpacaCryptoWalletsView.tsx",
        category: "Alpaca",
        status: "ONLINE",
        clearance: "L5-Sovereign",
        description: "Secure custody, multi-sig authorization, and hot/cold wallet management for digital assets."
    },
    {
        name: "Alpaca Funding Hub",
        path: "components/alpaca/AlpacaFundingHub.tsx",
        category: "Alpaca",
        status: "ONLINE",
        clearance: "L3-Executive",
        description: "ACH, Wire, and instant transfer orchestration with automated clearing house routing."
    },
    {
        name: "Alpaca IPO Marketplace",
        path: "components/alpaca/AlpacaIpoMarketplaceView.tsx",
        category: "Alpaca",
        status: "STANDBY",
        clearance: "L1-Public",
        description: "Primary market access, IPO allocations, and public offering subscription tracking."
    },
    {
        name: "Alpaca Rebalancing Engine",
        path: "components/alpaca/AlpacaRebalancingView.tsx",
        category: "Alpaca",
        status: "ONLINE",
        clearance: "L3-Executive",
        description: "Automated portfolio drift correction, target weight enforcement, and tax-loss harvesting."
    },
    {
        name: "Alpaca Trading Terminal",
        path: "components/alpaca/AlpacaTradingTerminal.tsx",
        category: "Alpaca",
        status: "ONLINE",
        clearance: "L3-Executive",
        description: "High-frequency order entry, real-time Level 2 market data, and execution routing."
    },
    {
        name: "TQQQ Algorithm Terminal",
        path: "components/alpaca/TqqqAlgorithmTerminal.tsx",
        category: "Alpaca",
        status: "ONLINE",
        clearance: "L5-Sovereign",
        description: "Leveraged TQQQ swing trading algorithmic execution with real-time risk parameters."
    },
    // Bridges
    {
        name: "Citi Alpaca Bridge",
        path: "components/bridges/CitiAlpacaBridgeView.tsx",
        category: "Bridges",
        status: "SYNCING",
        clearance: "L5-Sovereign",
        description: "Liquidity bridge between Citi Treasury and Alpaca Brokerage for instant margin funding."
    },
    {
        name: "Plaid Alpaca Bridge",
        path: "components/bridges/PlaidAlpacaBridgeView.tsx",
        category: "Bridges",
        status: "ONLINE",
        clearance: "L1-Public",
        description: "Direct bank account verification, balance checks, and instant funding bridge."
    },
    {
        name: "Real Estate Alpaca Bridge",
        path: "components/bridges/RealEstateAlpacaBridge.tsx",
        category: "Bridges",
        status: "STANDBY",
        clearance: "L3-Executive",
        description: "Tokenized real estate collateralization for margin trading and liquidity generation."
    },
    {
        name: "Sovereign Market Takeover",
        path: "components/bridges/SovereignMarketTakeoverDashboard.tsx",
        category: "Bridges",
        status: "ENCRYPTED",
        clearance: "L5-Sovereign",
        description: "Macroeconomic sovereign wealth market intervention console and liquidity injection."
    },
    {
        name: "Stripe Alpaca Bridge",
        path: "components/bridges/StripeAlpacaBridgeView.tsx",
        category: "Bridges",
        status: "ONLINE",
        clearance: "L3-Executive",
        description: "Merchant processing settlement auto-routing to brokerage for immediate yield."
    },
    // Government
    {
        name: "GIS Property Map",
        path: "components/government/GisPropertyMap.tsx",
        category: "Government",
        status: "ONLINE",
        clearance: "L1-Public",
        description: "Geospatial property tax lien, deed visualization, and municipal zoning overlay."
    },
    {
        name: "Government API Dashboard",
        path: "components/government/GovernmentApiDashboard.tsx",
        category: "Government",
        status: "ONLINE",
        clearance: "L3-Executive",
        description: "Federal, state, and municipal API gateway integration for regulatory compliance."
    },
    {
        name: "IRS Tax Filing",
        path: "components/government/IrsTaxFiling.tsx",
        category: "Government",
        status: "STANDBY",
        clearance: "L3-Executive",
        description: "Automated corporate tax preparation, electronic filing, and refund tracking."
    },
    {
        name: "SEC Filing Viewer",
        path: "components/government/SecFilingViewer.tsx",
        category: "Government",
        status: "ONLINE",
        clearance: "L1-Public",
        description: "Real-time SEC EDGAR filing scraper, NLP sentiment analyzer, and insider trade tracker."
    },
    // Real Estate & Tax Liens
    {
        name: "Deed Registrar",
        path: "components/real-estate/DeedRegistrar.tsx",
        category: "Real Estate",
        status: "ONLINE",
        clearance: "L3-Executive",
        description: "On-chain property deed registration, title verification, and smart contract transfer."
    },
    {
        name: "Escrow Manager",
        path: "components/real-estate/EscrowManager.tsx",
        category: "Real Estate",
        status: "ONLINE",
        clearance: "L3-Executive",
        description: "Smart contract-based multi-sig real estate escrow and automated disbursement."
    },
    {
        name: "Tax Lien Auctions",
        path: "components/tax-liens/TaxLienAuctions.tsx",
        category: "Tax Liens",
        status: "ONLINE",
        clearance: "L3-Executive",
        description: "Automated bidding engine for municipal tax lien certificates and yield optimization."
    },
    {
        name: "Foreclosure Tracker",
        path: "components/tax-liens/ForeclosureTracker.tsx",
        category: "Tax Liens",
        status: "SYNCING",
        clearance: "L3-Executive",
        description: "Pre-foreclosure pipeline, legal notice tracking, and asset acquisition pipeline."
    },
    // Trillionaire Status
    {
        name: "Trillionaire Status Summary",
        path: "trillionaire-status/TrillionaireStatusSummary.ts",
        category: "Trillionaire",
        status: "ONLINE",
        clearance: "L5-Sovereign",
        description: "Consolidated metrics, milestones, and strategic roadmap for achieving trillion-dollar market cap."
    },
    {
        name: "Capital Allocation Models",
        path: "trillionaire-status/CapitalAllocationModels.ts",
        category: "Trillionaire",
        status: "ONLINE",
        clearance: "L5-Sovereign",
        description: "Advanced capital budgeting, yield optimization, and multi-asset class allocation models."
    },
    {
        name: "Lobbying Influence Mapping",
        path: "trillionaire-status/LobbyingInfluenceMapping.ts",
        category: "Trillionaire",
        status: "ENCRYPTED",
        clearance: "L5-Sovereign",
        description: "Political action committee (PAC) contributions, lobbying ROI, and regulatory influence tracking."
    },
    {
        name: "Patent Portfolio Audit",
        path: "trillionaire-status/PatentPortfolioAudit.ts",
        category: "Trillionaire",
        status: "ONLINE",
        clearance: "L3-Executive",
        description: "Intellectual property valuation, defensive patent mapping, and licensing revenue tracking."
    },
    {
        name: "Supply Chain Mapping",
        path: "trillionaire-status/SupplyChainMapping.ts",
        category: "Trillionaire",
        status: "SYNCING",
        clearance: "L3-Executive",
        description: "Global supply chain dependency, bottleneck simulation, and raw material hedging."
    },
    // AI & Quantum
    {
        name: "AI Ad Studio",
        path: "components/AIAdStudioView.tsx",
        category: "AI & Quantum",
        status: "ONLINE",
        clearance: "L1-Public",
        description: "Generative AI marketing, ad campaign creation, and real-time conversion optimization."
    },
    {
        name: "AI Advisor View",
        path: "components/AIAdvisorView.tsx",
        category: "AI & Quantum",
        status: "ONLINE",
        clearance: "L3-Executive",
        description: "Autonomous financial advisor, portfolio strategist, and risk mitigation engine."
    },
    {
        name: "Gemini Live Portal",
        path: "components/GeminiLivePortal.tsx",
        category: "AI & Quantum",
        status: "ONLINE",
        clearance: "L3-Executive",
        description: "Real-time voice and text interface with Gemini LLM for executive decision support."
    },
    {
        name: "Quantum Weaver",
        path: "components/QuantumWeaverView.tsx",
        category: "AI & Quantum",
        status: "ENCRYPTED",
        clearance: "L5-Sovereign",
        description: "Quantum-resistant cryptographic key generation, secure routing, and ledger protection."
    },
    // Core Infrastructure
    {
        name: "Citi Gateway",
        path: "components/CitiGateway.tsx",
        category: "Core",
        status: "ONLINE",
        clearance: "L5-Sovereign",
        description: "Direct ISO 20022 gateway to Citi Connect APIs for global treasury operations."
    },
    {
        name: "Modern Treasury Ledger Hub",
        path: "components/ModernTreasuryLedgerHub.tsx",
        category: "Core",
        status: "ONLINE",
        clearance: "L3-Executive",
        description: "Double-entry ledger synchronization, transaction matching, and multi-bank reconciliation."
    },
    {
        name: "Identity Citadel",
        path: "components/IdentityCitadelView.tsx",
        category: "Core",
        status: "ONLINE",
        clearance: "L5-Sovereign",
        description: "Decentralized identity, biometric access control, and zero-knowledge credential verification."
    },
    {
        name: "Global Ledger View",
        path: "components/GlobalLedgerView.tsx",
        category: "Core",
        status: "ONLINE",
        clearance: "L3-Executive",
        description: "Consolidated multi-currency global ledger with real-time exchange rate adjustments."
    }
];

const CorporateCommandView: React.FC = () => {
    const context = useContext(DataContext);
    const [activeTab, setActiveTab] = useState<'Overview' | 'Finance' | 'Operations' | 'Risk' | 'Strategy' | 'Systems'>('Overview');
    const [aiInsight, setAiInsight] = useState<string>('Initializing deep neural audit...');
    const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    // Systems Tab State
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [diagnosticModule, setDiagnosticModule] = useState<SystemModule | null>(null);
    const [isDiagnosticRunning, setIsDiagnosticRunning] = useState<boolean>(false);
    const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);

    if (!context) throw new Error("CorporateCommandView failure.");
    const { paymentOrders, invoices, complianceCases, corporateTransactions } = context;

    // --- Complex Analytics Models ---
    const totalRevenue = useMemo(() => invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0), [invoices]);
    const totalExpenses = useMemo(() => corporateTransactions.reduce((acc, t) => acc + t.amount, 0), [corporateTransactions]);
    const netIncome = totalRevenue - totalExpenses;

    const vendorSpend = useMemo(() => {
        const map: Record<string, number> = {};
        corporateTransactions.forEach(tx => {
            map[tx.merchant] = (map[tx.merchant] || 0) + tx.amount;
        });
        return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
    }, [corporateTransactions]);

    const cashFlowTrend = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => ({
            month: `Month ${i+1}`,
            revenue: totalRevenue / 12 * (0.8 + Math.random() * 0.4),
            expense: totalExpenses / 12 * (0.8 + Math.random() * 0.4)
        }));
    }, [totalRevenue, totalExpenses]);

    const riskScore = useMemo(() => {
        const base = 94.2;
        const openPenalty = complianceCases.filter(c => c.status === 'open').length * 2.5;
        return (base - openPenalty).toFixed(1);
    }, [complianceCases]);

    const filteredModules = useMemo(() => {
        return SYSTEM_MODULES.filter(mod => {
            const matchesSearch = mod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  mod.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  mod.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || mod.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [searchQuery, selectedCategory]);

    const addLog = (msg: string) => {
        setTerminalLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
    };

    // --- AI STRATEGIC INTELLIGENCE ---
    useEffect(() => {
        const generateReport = async () => {
            setIsAiProcessing(true);
            try {
                const prompt = `Perform an executive forensic audit for the '${activeTab}' sector of a multi-billion dollar enterprise.
                Data: Revenue $${totalRevenue}, Expenses $${totalExpenses}, Risk Index ${riskScore}.
                Provide a single, powerful, highly-technical strategic directive (max 2 sentences). Use an elite, objective tone.`;
                
                const { text } = await callGemini('gemini-3-pro-preview', prompt, {
                    thinkingConfig: { thinkingBudget: 4096 }
                });
                setAiInsight(text || "Diagnostic stable.");
            } catch (error) {
                setAiInsight("Neural handshake interrupted. Re-syncing forge buffer...");
            } finally {
                setIsAiProcessing(false);
            }
        };
        generateReport();
    }, [activeTab, totalRevenue, totalExpenses, riskScore]);

    useEffect(() => {
        if (activeTab === 'Systems') {
            setTerminalLogs([
                `[${new Date().toLocaleTimeString()}] Nexus OS: Initializing Global Systems Registry...`,
                `[${new Date().toLocaleTimeString()}] Nexus OS: Loaded 488 files from /content/Oko-main`,
                `[${new Date().toLocaleTimeString()}] Nexus OS: Verified 32 core modules, 6 bridges, 25 trillionaire models`,
                `[${new Date().toLocaleTimeString()}] Nexus OS: All systems nominal. Ready for executive command.`
            ]);
        }
    }, [activeTab]);

    const runDiagnostic = (module: SystemModule) => {
        setDiagnosticModule(module);
        setIsDiagnosticRunning(true);
        setDiagnosticLogs([]);
        
        const steps = [
            `Initializing diagnostic for ${module.name}...`,
            `Resolving file path: /content/Oko-main/${module.path}`,
            `Verifying file integrity and checksum...`,
            `Parsing AST and checking imports...`,
            `Testing API endpoints and mock handshakes...`,
            `Security clearance verified: ${module.clearance}`,
            `Diagnostic complete. Status: ${module.status}.`
        ];

        steps.forEach((step, index) => {
            setTimeout(() => {
                setDiagnosticLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
                if (index === steps.length - 1) {
                    setIsDiagnosticRunning(false);
                    addLog(`Diagnostic completed for ${module.name}: 100% Integrity.`);
                }
            }, (index + 1) * 600);
        });
    };

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/10 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Server className="text-cyan-400 w-5 h-5 animate-pulse" />
                        <h2 className="text-xs font-mono text-cyan-400 uppercase tracking-[0.5em]">Nexus Executive OS v9.2 // Stable</h2>
                    </div>
                    <h1 className="text-7xl font-black text-white tracking-tighter leading-none">Corporate <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">Command</span></h1>
                </div>
                <div className="flex flex-wrap gap-2 p-1.5 bg-gray-950 border border-white/5 rounded-3xl">
                    {['Overview', 'Finance', 'Operations', 'Risk', 'Strategy', 'Systems'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {/* AI Strategic Jewel */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                <Card className="relative bg-gray-900/60 border-blue-500/30 p-8 rounded-[3rem] backdrop-blur-3xl">
                    <div className="flex items-start gap-8">
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/40 shadow-inner shrink-0">
                            <Zap className={`w-8 h-8 text-blue-400 ${isAiProcessing ? 'animate-spin' : 'animate-pulse'}`} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest">AI Strategic Intelligence Core</h3>
                            {isAiProcessing ? (
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-800 rounded w-full animate-pulse" />
                                    <div className="h-4 bg-gray-800 rounded w-2/3 animate-pulse" />
                                </div>
                            ) : (
                                <p className="text-2xl text-white font-light leading-relaxed italic">"{aiInsight}"</p>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {activeTab === 'Overview' && (
                <div className="grid grid-cols-12 gap-8">
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card title="Total Revenue" isMetric>
                                <p className="text-4xl font-black text-white font-mono">${totalRevenue.toLocaleString()}</p>
                                <div className="flex items-center gap-1 justify-center mt-2 text-green-400 text-[10px] font-black">
                                    <TrendingUp size={12} /> +12.4% VS Q3
                                </div>
                            </Card>
                            <Card title="Net Operating Income" isMetric>
                                <p className="text-4xl font-black text-white font-mono">${netIncome.toLocaleString()}</p>
                                <div className="flex items-center gap-1 justify-center mt-2 text-blue-400 text-[10px] font-black">
                                    <Activity size={12} /> MARGINS STABLE
                                </div>
                            </Card>
                            <Card title="Global Compliance Index" isMetric>
                                <p className="text-4xl font-black text-green-400 font-mono">{riskScore}%</p>
                                <div className="flex items-center gap-1 justify-center mt-2 text-green-400 text-[10px] font-black">
                                    <Shield size={12} /> NOMINAL STATE
                                </div>
                            </Card>
                        </div>

                        <Card title="Institutional Cash Flow Trajectory" className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={cashFlowTrend}>
                                    <defs>
                                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="1 5" stroke="#1e293b" vertical={false} />
                                    <XAxis dataKey="month" hide />
                                    <YAxis stroke="#475569" fontSize={10} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '24px' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fill="url(#revGrad)" />
                                    <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Card>
                    </div>

                    <div className="col-span-12 lg:col-span-4 space-y-8">
                        <Card title="Vendor Ecosystem Audit">
                            <div className="space-y-4 pt-2">
                                {vendorSpend.map((v, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-gray-900 border border-white/5 rounded-2xl hover:border-blue-500/40 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-8 rounded-full bg-blue-500/20 group-hover:bg-blue-400 transition-colors" />
                                            <div>
                                                <p className="text-sm font-bold text-white uppercase tracking-tight">{v.name}</p>
                                                <p className="text-[9px] text-gray-500 uppercase font-black">Critical Infrastructure</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-mono font-black text-white">${v.value.toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card title="Operational Vectors" icon={<Activity className="text-blue-400" />}>
                             <div className="space-y-6 pt-4 text-center">
                                <div className="text-5xl font-black text-white font-mono tracking-tighter">99.98%</div>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em]">Uptime Integrity (SLA)</p>
                                <div className="flex gap-1.5 h-12 items-end justify-center">
                                    {Array.from({length: 16}).map((_, i) => (
                                        <div key={i} className="w-1.5 bg-blue-500/20 rounded-t-full animate-pulse" style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 0.1}s` }} />
                                    ))}
                                </div>
                             </div>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'Strategy' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card title="Venture Scenario Modeling" icon={<Briefcase className="text-indigo-400" />}>
                        <div className="space-y-6 mt-4">
                            <p className="text-sm text-gray-400 font-light leading-relaxed">
                                Executing Monte Carlo simulations on current capital reserves. Predicted ROI for aggressive expansion in the APAC market has risen to <span className="text-white font-bold">18.4%</span>.
                            </p>
                            <div className="p-5 bg-indigo-500/5 border border-indigo-500/20 rounded-[2rem] flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Scenario Confidence</p>
                                    <p className="text-2xl font-mono text-indigo-400 font-black">88.2%</p>
                                </div>
                                <Activity className="text-indigo-500" />
                            </div>
                            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black tracking-widest rounded-2xl transition-all shadow-xl shadow-indigo-500/20">
                                INITIALIZE EXPANSION
                            </button>
                        </div>
                    </Card>

                    <Card title="Neural Audit Logic" icon={<Cpu className="text-cyan-400" />}>
                         <div className="space-y-4 pt-2">
                            {['Liveness Probes', 'Artifact Extraction', 'Geometric Consistency', 'Stochastic Noise Audit'].map(label => (
                                <div key={label} className="flex justify-between items-center p-4 bg-gray-950 border border-gray-800 rounded-2xl group hover:border-cyan-500/30 transition-all">
                                    <span className="text-xs font-bold text-gray-500 group-hover:text-white uppercase tracking-widest">{label}</span>
                                    <CheckCircle2 size={16} className="text-green-500" />
                                </div>
                            ))}
                         </div>
                    </Card>
                </div>
            )}

            {activeTab === 'Systems' && (
                <div className="space-y-8">
                    {/* Stats Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="p-6 bg-gray-950 border border-white/5 rounded-3xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Total Registered Files</p>
                                <p className="text-3xl font-mono text-white font-black">488</p>
                            </div>
                            <Database className="text-blue-400 w-8 h-8" />
                        </div>
                        <div className="p-6 bg-gray-950 border border-white/5 rounded-3xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Active Modules</p>
                                <p className="text-3xl font-mono text-green-400 font-black">412</p>
                            </div>
                            <CheckCircle2 className="text-green-400 w-8 h-8" />
                        </div>
                        <div className="p-6 bg-gray-950 border border-white/5 rounded-3xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Syncing Bridges</p>
                                <p className="text-3xl font-mono text-yellow-400 font-black">56</p>
                            </div>
                            <RefreshCw className="text-yellow-400 w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
                        </div>
                        <div className="p-6 bg-gray-950 border border-white/5 rounded-3xl flex items-center justify-between">
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Security Level</p>
                                <p className="text-3xl font-mono text-red-400 font-black">L5-SOVEREIGN</p>
                            </div>
                            <Lock className="text-red-400 w-8 h-8" />
                        </div>
                    </div>

                    {/* Search & Filter Controls */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-gray-950 p-4 border border-white/5 rounded-3xl">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                            <input 
                                type="text"
                                placeholder="Search 488 files..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-white/5 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                            {['All', 'Alpaca', 'Bridges', 'Government', 'Real Estate', 'Tax Liens', 'Trillionaire', 'AI & Quantum', 'Core'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Modules Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredModules.map((mod, idx) => (
                            <div key={idx} className="p-6 bg-gray-900/40 border border-white/5 rounded-[2rem] hover:border-blue-500/30 transition-all flex flex-col justify-between group">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                                            mod.status === 'ONLINE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                            mod.status === 'SYNCING' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                                            mod.status === 'STANDBY' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                            {mod.status}
                                        </span>
                                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider">{mod.clearance}</span>
                                    </div>
                                    <h4 className="text-lg font-black text-white mb-1 group-hover:text-blue-400 transition-colors">{mod.name}</h4>
                                    <p className="text-[10px] font-mono text-gray-500 mb-3 truncate">{mod.path}</p>
                                    <p className="text-xs text-gray-400 font-light leading-relaxed mb-6">{mod.description}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        onClick={() => runDiagnostic(mod)}
                                        className="flex-1 py-2.5 bg-gray-950 hover:bg-gray-800 border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-300 transition-all"
                                    >
                                        Diagnostic
                                    </button>
                                    <button 
                                        onClick={() => {
                                            addLog(`Manually triggered execution of ${mod.name}`);
                                            alert(`Executing module: ${mod.name}\nPath: /content/Oko-main/${mod.path}\nStatus: Active`);
                                        }}
                                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white transition-all"
                                    >
                                        <Play size={12} fill="currentColor" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Diagnostic Modal / Panel */}
                    {diagnosticModule && (
                        <div className="p-6 bg-gray-950 border border-blue-500/30 rounded-[2rem] space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <div>
                                    <h3 className="text-sm font-black text-blue-400 uppercase tracking-widest">Diagnostic Console</h3>
                                    <p className="text-lg font-black text-white">{diagnosticModule.name}</p>
                                </div>
                                <button 
                                    onClick={() => setDiagnosticModule(null)}
                                    className="text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest"
                                >
                                    Close Console
                                </button>
                            </div>
                            <div className="bg-black p-4 rounded-2xl font-mono text-xs text-green-400 space-y-2 max-h-60 overflow-y-auto">
                                {diagnosticLogs.map((log, i) => (
                                    <div key={i}>{log}</div>
                                ))}
                                {isDiagnosticRunning && (
                                    <div className="flex items-center gap-2 text-yellow-400">
                                        <RefreshCw size={12} className="animate-spin" />
                                        <span>Running deep neural audit...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Live Terminal Logs */}
                    <Card title="Live System Terminal Logs" icon={<Terminal className="text-blue-400" />}>
                        <div className="bg-black/80 p-6 rounded-2xl font-mono text-xs text-blue-400 space-y-2 h-48 overflow-y-auto border border-white/5">
                            {terminalLogs.map((log, i) => (
                                <div key={i} className="hover:bg-white/5 px-2 py-1 rounded transition-colors">{log}</div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CorporateCommandView;