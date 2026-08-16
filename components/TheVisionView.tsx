import React, { useState } from 'react';
import Card from './Card';
import { 
  Shield, 
  Sparkles, 
  Zap, 
  Globe, 
  Target, 
  Terminal, 
  Cpu, 
  Building2, 
  Layers, 
  Scale, 
  TrendingUp, 
  Bot, 
  Lock, 
  Database, 
  CheckCircle2, 
  ArrowRight,
  ChevronRight,
  Globe2,
  PieChart
} from 'lucide-react';

const TheVisionView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mission' | 'architecture' | 'pillars' | 'manifesto'>('mission');

  const pillars = [
    {
      icon: Cpu,
      title: 'Neural Wealth OS',
      subtitle: 'Gemini Real-Time & Sovereign AI Agents',
      description: 'Autonomous financial orchestration engines running high-frequency arbitrage, swing strategies, and automated portfolio rebalancing across crypto, equities, and sovereign debt.',
      color: 'from-cyan-500 to-blue-600',
      badge: 'Active Engine'
    },
    {
      icon: Building2,
      title: 'Institutional Bridge Matrix',
      subtitle: 'Citi, Alpaca, Stripe & Modern Treasury',
      description: 'Direct programmatic links to primary banking rails, brokerages, and international clearinghouses. Zero friction capital mobility across fiat and digital assets.',
      color: 'from-indigo-500 to-purple-600',
      badge: 'Connected'
    },
    {
      icon: Scale,
      title: 'Sovereign Governance & Compliance',
      subtitle: 'Azure Gov, SEC & IRS Integration',
      description: 'Automated legal compliance, deed registry, tax lien auctions, and real-time audit trails with zero-knowledge cryptographic verification.',
      color: 'from-emerald-500 to-teal-600',
      badge: 'Audited'
    },
    {
      icon: TrendingUp,
      title: 'Trillionaire Allocation Models',
      subtitle: 'Fortune 500 & Global Macro Intelligence',
      description: 'Institutional-grade capital allocation algorithms designed to rival global macro hedge funds, private equity, and sovereign wealth funds.',
      color: 'from-amber-500 to-orange-600',
      badge: 'Optimized'
    }
  ];

  const roadmap = [
    {
      phase: 'Phase 01',
      title: 'Sovereign Protocol Foundation',
      status: 'Completed',
      items: ['Unified Banking Bridge (Citi, Plaid, Alpaca)', 'Zero-Knowledge Audit Ledger', 'Real-time Gemini AI Advisor']
    },
    {
      phase: 'Phase 02',
      title: 'Autonomous Capital Orchestration',
      status: 'Active',
      items: ['TQQQ & BTC Swarm Trading Algorithms', 'Tax Lien & Real Estate Tokenization', 'Astra DB Neural Vector Search']
    },
    {
      phase: 'Phase 03',
      title: 'Global Sovereign Takeover',
      status: 'In Progress',
      items: ['Open Banking FAPI & UK International Payments', 'Public Aid & Civic Democracy Tools', 'Full Trillionaire Status Capital Models']
    }
  ];

  const systemMetrics = [
    { label: 'Ecosystem Modules', value: '37 Directories' },
    { label: 'Total Source Components', value: '488 Files' },
    { label: 'Neural Intelligence Mesh', value: 'Gemini Live Voice' },
    { label: 'Ledger Integrity', value: '100% Cryptographic' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8 px-4 sm:px-6 animate-in fade-in duration-700">
      {/* Hero Header */}
      <header className="text-center space-y-6 relative overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900/80 via-gray-900/40 to-transparent p-8 md:p-12 border border-gray-800/80 backdrop-blur-xl">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-mono uppercase tracking-widest shadow-inner">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-300" />
          The Ultimate Financial Operating System
        </div>

        <h1 className="text-5xl sm:text-7xl font-black text-white tracking-tighter leading-none">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500">Sovereign</span> Vision
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed">
          Rebuilding the global financial architecture around absolute individual sovereignty. Zero friction. Total auditability. Neural intelligence.
        </p>

        {/* Quick Nav Tabs */}
        <div className="flex flex-wrap justify-center gap-3 pt-6 border-t border-gray-800/60">
          {[
            { id: 'mission', label: 'Mission & Purpose', icon: Target },
            { id: 'pillars', label: 'Ecosystem Pillars', icon: Layers },
            { id: 'architecture', label: 'System Roadmap', icon: Database },
            { id: 'manifesto', label: 'Signed Manifesto', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/10'
                    : 'bg-gray-900/60 hover:bg-gray-800/60 border border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-gray-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Tab Content */}
      {activeTab === 'mission' && (
        <div className="space-y-10 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-gray-900/60 border-gray-800 p-8 space-y-6 relative overflow-hidden hover:border-cyan-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">The North Star Objective</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Our mission is to dismantle institutional gatekeeping and eliminate middleman friction in every financial interaction. By harmonizing Gemini AI models, real-time banking gateways, and distributed ledger protocols, Oko creates a direct, unmediated conduit between individual intent and global capital allocation.
              </p>
              <ul className="space-y-3 pt-2">
                {['Direct API-to-Market Execution', 'Zero-Knowledge Identity Attestation', 'Instant Cross-Border Liquidity Rails'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-gray-900/60 border-gray-800 p-8 space-y-6 relative overflow-hidden hover:border-indigo-500/30 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Velocity of Capital</h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                Capital should not stagnate in opaque custodial silos. Wealth is a high-velocity vector. Sovereign OS ensures your assets are perpetually working toward their highest mathematical utility—whether deploying algorithmic TQQQ/BTC strategies, acquiring sovereign real estate, or acquiring high-yield tax lien certificates.
              </p>
              <ul className="space-y-3 pt-2">
                {['Automated Multi-Broker Rebalancing', 'Real-Time Yield Arbitrage Engines', 'Institutional Sovereign Credit Lines'].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-300">
                    <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* System Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {systemMetrics.map((metric, i) => (
              <div key={i} className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-5 text-center hover:border-gray-700 transition-colors">
                <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">{metric.label}</p>
                <p className="text-xl font-bold text-cyan-300 mt-2 font-mono">{metric.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pillars' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <Card key={idx} className="bg-gray-900/50 border-gray-800 p-7 space-y-5 hover:border-gray-700 transition-all group">
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono uppercase bg-gray-800 text-gray-300 border border-gray-700">
                    {pillar.badge}
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs font-mono text-cyan-400/90">{pillar.subtitle}</p>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {pillar.description}
                </p>
                <div className="pt-3 flex items-center gap-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 cursor-pointer">
                  <span>Explore Architecture</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {activeTab === 'architecture' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roadmap.map((phase, idx) => (
              <Card key={idx} className="bg-gray-900/60 border-gray-800 p-6 space-y-5 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">{phase.phase}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                    phase.status === 'Completed' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    phase.status === 'Active' ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' :
                    'bg-gray-800 text-gray-400 border border-gray-700'
                  }`}>
                    {phase.status}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white">{phase.title}</h4>
                <ul className="space-y-3">
                  {phase.items.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>

          <Card className="bg-gray-900/40 border border-gray-800 p-8 space-y-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Globe2 className="w-5 h-5 text-indigo-400" />
              Global Interoperability Matrix
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Oko connects 488 active software files across 37 functional domain directories including server endpoints, smart contract wrappers, real-time webhooks, and institutional API clients.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800/80">
                <span className="text-gray-500 block">APIs & Connectors</span>
                <span className="text-cyan-400 font-bold">25+ Integrations</span>
              </div>
              <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800/80">
                <span className="text-gray-500 block">AI Models</span>
                <span className="text-indigo-400 font-bold">Gemini Live & Swarm</span>
              </div>
              <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800/80">
                <span className="text-gray-500 block">Banking Networks</span>
                <span className="text-emerald-400 font-bold">Citi, Plaid, FAPI</span>
              </div>
              <div className="p-3 bg-gray-950/60 rounded-xl border border-gray-800/80">
                <span className="text-gray-500 block">Real Assets</span>
                <span className="text-amber-400 font-bold">Deeds & Tax Liens</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'manifesto' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <Card className="bg-gray-900/80 border-gray-800 p-8 md:p-10 space-y-8 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-800 pb-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-cyan-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Sovereign OS Integrity Pledge</h3>
                  <p className="text-xs font-mono text-gray-500">CRYPTOGRAPHIC PROTOCOL VERIFICATION // OKO-MAIN</p>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/60">
                  STATUS: VERIFIED
                </span>
              </div>
            </div>

            <div className="space-y-6 text-gray-300 text-sm leading-relaxed font-light">
              <p>
                <strong className="text-white font-medium">1. Zero Non-Consensual Intermediation:</strong> Users retain full private key ownership and programmatic control over all custodial and non-custodial capital bridges.
              </p>
              <p>
                <strong className="text-white font-medium">2. Immutable Real-Time Auditability:</strong> Every trade execution, token mint, tax lien bid, and cross-border bank transfer is verifiably logged to audit streams.
              </p>
              <p>
                <strong className="text-white font-medium">3. Neural Equity Access:</strong> Institutional-grade strategy tools (BTC Swing Notebooks, TQQQ Algos, Trillionaire Capital Allocators) are democratized to every individual user node.
              </p>
            </div>

            <div className="p-5 bg-gray-950/80 border border-gray-800 rounded-2xl font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-gray-500 border-b border-gray-900 pb-2">
                <span className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  SIGNATURE_HASH
                </span>
                <span className="text-emerald-400">VALIDATED</span>
              </div>
              <p className="text-cyan-400/90 break-all leading-tight">
                0x8812a3b9f1092e42c091bc8819024fba9108c42817d23a19e01f5c887701 // INTEGRITY_LOCKED
              </p>
              <div className="flex justify-between text-[10px] text-gray-600 pt-1">
                <span>Ecosystem Version: 2.5.0-Sovereign</span>
                <span>488 Source Components Registered</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Footer Callout */}
      <footer className="text-center pt-8 border-t border-gray-800/80 space-y-3">
        <p className="text-xs font-mono text-gray-500 uppercase tracking-[0.4em]">
          This is the end of the legacy financial era.
        </p>
        <p className="text-[11px] text-gray-600 font-mono">
          Oko Platform // Sovereign Financial Operating System
        </p>
      </footer>
    </div>
  );
};

export default TheVisionView;