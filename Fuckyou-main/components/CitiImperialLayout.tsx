import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Shield, 
  Cpu, 
  Coins, 
  Compass, 
  Bell, 
  User, 
  ChevronDown, 
  Activity, 
  Zap, 
  Layers, 
  Landmark, 
  TrendingUp, 
  Lock, 
  Globe, 
  Terminal,
  Sparkles,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';

interface CitiImperialLayoutProps {
  children?: React.ReactNode;
}

export default function CitiImperialLayout({ children }: CitiImperialLayoutProps) {
  const [aiStatus, setAiStatus] = useState<'OPTIMAL' | 'CALCULATING' | 'SYNCHRONIZING'>('OPTIMAL');
  const [cognitiveLoad, setCognitiveLoad] = useState(98.9994);
  const [treasuryBalance, setTreasuryBalance] = useState(847209384720.00);
  const [activeTab, setActiveTab] = useState('sovereign-vaults');
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Modern Treasury pipeline cleared $12.4B Sovereign Bond settlement.", time: "Just now" },
    { id: 2, text: "Citi AI Oracle predicted 4.2bps yield shift; reallocating $45B.", time: "2m ago" },
    { id: 3, text: "Quantum encryption keys rotated successfully.", time: "12m ago" }
  ]);

  // Simulate real-time high-end AI activity
  useEffect(() => {
    const interval = setInterval(() => {
      setCognitiveLoad(prev => {
        const change = (Math.random() - 0.5) * 0.001;
        return parseFloat(Math.min(99.9999, Math.max(98.0000, prev + change)).toFixed(4));
      });
      setTreasuryBalance(prev => prev + (Math.random() > 0.5 ? 1000000 : -850000));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden relative">
      
      {/* Background Luxury Gradients & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#121212_1px,transparent_1px),linear-gradient(to_bottom,#121212_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Gilded Border Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80 relative z-50" />

      {/* Main Container */}
      <div className="flex min-h-screen flex-col lg:flex-row relative z-10">
        
        {/* Sidebar - Left Gilded Panel */}
        <aside className="w-full lg:w-80 bg-neutral-950/90 backdrop-blur-xl border-r border-amber-500/10 flex flex-col justify-between p-6 relative">
          {/* Diamond Cut Corner Accents */}
          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-amber-500/30 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-amber-500/30 pointer-events-none" />

          <div>
            {/* Brand Header */}
            <div className="flex items-center gap-3 mb-10">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-600 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-black border border-amber-500/40 p-2.5 rounded-lg">
                  <Crown className="h-6 w-6 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs tracking-[0.3em] text-amber-500 font-bold uppercase">Citibank</span>
                  <span className="text-[9px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">SOVEREIGN</span>
                </div>
                <h1 className="text-lg font-extrabold tracking-tight text-white font-serif">Imperial AI</h1>
              </div>
            </div>

            {/* AI Status Widget */}
            <div className="mb-8 p-4 rounded-lg bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] tracking-widest text-neutral-400 uppercase font-mono">Cognitive Engine</span>
                <span className="flex items-center gap-1.5 text-[10px] text-amber-400 font-mono font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                  {aiStatus}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-500">AI Sovereign Load</span>
                  <span className="font-mono text-amber-300">{cognitiveLoad}%</span>
                </div>
                <div className="w-full bg-neutral-900 h-1 rounded-full overflow-hidden border border-neutral-800">
                  <div 
                    className="bg-gradient-to-r from-amber-600 to-yellow-400 h-full transition-all duration-500" 
                    style={{ width: `${cognitiveLoad}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-500 font-mono pt-1">
                  <span>Latency: 0.0001ms</span>
                  <span>Quantum Sync</span>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1.5">
              <p className="text-[10px] tracking-[0.2em] text-neutral-500 uppercase font-bold mb-3 px-3">Sovereign Portals</p>
              
              {[
                { id: 'sovereign-vaults', label: 'Sovereign Vaults', icon: Landmark, desc: 'Multi-trillion asset custody' },
                { id: 'modern-treasury', label: 'Modern Treasury', icon: Layers, desc: 'Real-time programmatic rails' },
                { id: 'quantum-arbitrage', label: 'Quantum Arbitrage', icon: Cpu, desc: 'AI-driven yield optimization' },
                { id: 'imperial-ledger', label: 'Imperial Ledger', icon: Coins, desc: 'Immutable gold-backed records' },
                { id: 'oracle-insights', label: 'Oracle Insights', icon: Compass, desc: 'Predictive global macro AI' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-start gap-3.5 px-4 py-3 rounded-lg transition-all duration-300 text-left group relative ${
                      isActive 
                        ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-500 text-white' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50 border-l-2 border-transparent'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mt-0.5 transition-colors ${isActive ? 'text-amber-400' : 'text-neutral-500 group-hover:text-amber-400'}`} />
                    <div>
                      <div className="text-xs font-bold tracking-wide">{item.label}</div>
                      <div className="text-[10px] text-neutral-500 group-hover:text-neutral-400 transition-colors">{item.desc}</div>
                    </div>
                    {isActive && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-900">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-neutral-900/40 border border-neutral-800/60">
              <div className="relative">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 flex items-center justify-center text-black font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                  HSH
                </div>
                <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">His Serene Highness</p>
                <p className="text-[9px] text-amber-500/80 font-mono tracking-wider truncate">SOVEREIGN FUND VII</p>
              </div>
              <ChevronDown className="h-4 w-4 text-neutral-500 cursor-pointer hover:text-white" />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-neutral-950">
          
          {/* Top Navigation Bar */}
          <header className="h-20 border-b border-amber-500/10 px-6 lg:px-10 flex items-center justify-between bg-neutral-950/80 backdrop-blur-md relative z-20">
            {/* Left: Live Market Status */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500 animate-pulse" />
                <span className="text-[11px] tracking-wider text-neutral-400 font-mono">CITI SOVEREIGN NETWORK:</span>
                <span className="text-[11px] text-emerald-400 font-mono font-bold">ONLINE</span>
              </div>
              <div className="h-4 w-px bg-neutral-800" />
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-neutral-500" />
                <span className="text-[11px] text-neutral-400 font-mono">GLOBAL LIQUIDITY POOL:</span>
                <span className="text-[11px] text-amber-400 font-mono font-bold">$1.48 Quadrillion</span>
              </div>
            </div>

            {/* Right: Actions & Notifications */}
            <div className="flex items-center gap-4 ml-auto md:ml-0">
              {/* Modern Treasury Sync Indicator */}
              <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 px-3 py-1.5 rounded-full">
                <RefreshCw className="h-3 w-3 text-amber-400 animate-spin" />
                <span className="text-[9px] tracking-widest text-amber-300 font-mono font-bold">MODERN TREASURY SYNCED</span>
              </div>

              {/* Notifications */}
              <div className="relative group">
                <button className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-400 hover:border-amber-500/30 transition-all">
                  <Bell className="h-4 w-4" />
                </button>
                {/* Dropdown preview on hover */}
                <div className="absolute right-0 mt-2 w-80 bg-neutral-950 border border-amber-500/20 rounded-lg shadow-2xl p-4 hidden group-hover:block z-50">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-900">
                    <span className="text-xs font-bold text-amber-400">Sovereign Alerts</span>
                    <span className="text-[9px] text-neutral-500">Real-time</span>
                  </div>
                  <div className="space-y-3">
                    {notifications.map(n => (
                      <div key={n.id} className="text-[11px] text-neutral-300 leading-relaxed">
                        <p>{n.text}</p>
                        <span className="text-[9px] text-neutral-500 font-mono">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg">
                <Shield className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-mono text-neutral-300 hidden sm:inline">QUANTUM SECURE</span>
              </div>
            </div>
          </header>

          {/* Dynamic Dashboard Content */}
          <div className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8">
            
            {/* Hero Banner - The Pinnacle of Wealth & AI */}
            <div className="relative rounded-2xl overflow-hidden border border-amber-500/20 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 p-8 lg:p-12 shadow-[0_0_50px_rgba(212,175,55,0.05)]">
              {/* Diamond Cut Corner Accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-amber-500/40 pointer-events-none" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-amber-500/40 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-amber-500/40 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-amber-500/40 pointer-events-none" />

              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] tracking-widest uppercase font-mono mb-6">
                  <Sparkles className="h-3 w-3" /> Sovereign AI Wealth Oracle Active
                </div>
                <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight text-white font-serif mb-4 leading-tight">
                  The World's Most Exclusive <br />
                  <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                    Autonomous Sovereign Treasury
                  </span>
                </h2>
                <p className="text-neutral-400 text-sm lg:text-base leading-relaxed mb-8">
                  Synthesizing Citibank's elite private banking legacy with cutting-edge Sovereign AI and Modern Treasury programmatic rails. Managing multi-billion dollar liquidity flows with zero human friction.
                </p>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-neutral-900">
                  <div>
                    <p className="text-[10px] tracking-wider text-neutral-500 uppercase font-mono mb-1">Total Sovereign Assets</p>
                    <p className="text-xl lg:text-2xl font-bold text-white font-mono">
                      ${treasuryBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-wider text-neutral-500 uppercase font-mono mb-1">Modern Treasury Pipelines</p>
                    <p className="text-xl lg:text-2xl font-bold text-amber-400 font-mono">1,402 Active</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-wider text-neutral-500 uppercase font-mono mb-1">AI Yield Generation</p>
                    <p className="text-xl lg:text-2xl font-bold text-emerald-400 font-mono flex items-center gap-1">
                      +32.48% <ArrowUpRight className="h-5 w-5" />
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Abstract AI Grid */}
              <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden lg:block opacity-20 pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
              </div>
            </div>

            {/* Main Content Slot */}
            <div className="relative">
              {children ? (
                children
              ) : (
                /* Default Dashboard View if no children provided */
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Column: Real-time Ledger & Modern Treasury */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 relative">
                      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-amber-500/30" />
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-base font-bold text-white">Modern Treasury Programmatic Flows</h3>
                          <p className="text-xs text-neutral-500">Real-time automated ledger synchronization</p>
                        </div>
                        <span className="text-xs text-amber-400 font-mono bg-amber-500/5 border border-amber-500/20 px-2.5 py-1 rounded">
                          API V4.2 Secure
                        </span>
                      </div>

                      {/* Transaction Table */}
                      <div className="space-y-4">
                        {[
                          { id: "TXN-9082", desc: "Sovereign Wealth Fund VII Allocation", amount: "+$4,250,000,000.00", status: "SETTLED", type: "Treasury Transfer" },
                          { id: "TXN-8812", desc: "AI-Driven Arbitrage Yield Harvest", amount: "+$128,492,010.45", status: "SETTLED", type: "Quantum Yield" },
                          { id: "TXN-7741", desc: "London Real Estate Tokenization Liquidity", amount: "-$850,000,000.00", status: "PROCESSING", type: "Asset Purchase" },
                          { id: "TXN-6610", desc: "Modern Treasury Automated Tax Escrow", amount: "-$45,000,000.00", status: "SETTLED", type: "Compliance" }
                        ].map((txn, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-neutral-900/40 border border-neutral-900 hover:border-amber-500/20 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded bg-neutral-950 border border-neutral-800">
                                <Terminal className="h-4 w-4 text-amber-500" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white">{txn.desc}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-neutral-500 font-mono">{txn.id}</span>
                                  <span className="text-[10px] text-neutral-600">•</span>
                                  <span className="text-[10px] text-neutral-500">{txn.type}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className={`text-xs font-bold font-mono ${txn.amount.startsWith('+') ? 'text-emerald-400' : 'text-neutral-300'}`}>
                                {txn.amount}
                              </p>
                              <span className={`inline-block text-[9px] font-mono px-1.5 py-0.5 rounded mt-1 ${
                                txn.status === 'SETTLED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                              }`}>
                                {txn.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Oracle & Security */}
                  <div className="space-y-8">
                    {/* AI Oracle Card */}
                    <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/20 rounded-xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-amber-500/30" />
                      <div className="absolute -right-10 -top-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
                      
                      <div className="flex items-center gap-2 mb-4">
                        <Cpu className="h-5 w-5 text-amber-400" />
                        <h3 className="text-sm font-bold text-white tracking-wide">Sovereign AI Oracle</h3>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                        Continuous deep-learning analysis of global macro liquidity, geopolitical risk vectors, and Modern Treasury ledger flows.
                      </p>

                      <div className="space-y-4">
                        <div className="p-3.5 rounded-lg bg-black/60 border border-neutral-800">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] text-neutral-400 font-bold">Macro Yield Prediction</span>
                            <span className="text-[10px] text-emerald-400 font-mono">99.8% Confidence</span>
                          </div>
                          <p className="text-xs text-neutral-300">US 10-Year Treasury yields expected to compress by 4.2bps within 18 hours. Recommending immediate reallocation.</p>
                        </div>

                        <div className="p-3.5 rounded-lg bg-black/60 border border-neutral-800">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[11px] text-neutral-400 font-bold">Liquidity Optimization</span>
                            <span className="text-[10px] text-amber-400 font-mono">Active</span>
                          </div>
                          <p className="text-xs text-neutral-300">Modern Treasury pipeline routing optimized to bypass European clearing delays, saving $1.2M in overnight carry costs.</p>
                        </div>
                      </div>
                    </div>

                    {/* Imperial Security Card */}
                    <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-6 relative">
                      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-amber-500/30" />
                      <div className="flex items-center gap-2 mb-4">
                        <Lock className="h-5 w-5 text-amber-500" />
                        <h3 className="text-sm font-bold text-white tracking-wide">Quantum Vault Security</h3>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-500">Encryption Standard</span>
                          <span className="font-mono text-neutral-300">AES-GCM 4096-Quantum</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-500">Multi-Sig Custody</span>
                          <span className="font-mono text-neutral-300">Citi Sovereign AI + 3 Signatories</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-500">Hardware Security Module</span>
                          <span className="font-mono text-emerald-400">FIPS 140-3 Level 4</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>

          </div>

          {/* Footer / Real-time Ticker */}
          <footer className="h-12 border-t border-neutral-900 bg-black px-6 flex items-center justify-between text-[10px] text-neutral-500 font-mono relative z-20">
            <div className="flex items-center gap-4 overflow-hidden whitespace-nowrap">
              <span className="text-amber-500 font-bold">LIVE LEDGER FEED:</span>
              <span className="animate-pulse text-neutral-400">
                [Modern Treasury] Settled $1.2B USD to Tokyo Custody • [Citi AI] Rebalanced $450M Sovereign Gold Trust • [Quantum Vault] Keys rotated successfully
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <span>SYSTEM LATENCY: 0.0001ms</span>
              <span>COGNITIVE SYNC: 100%</span>
            </div>
          </footer>

        </main>

      </div>
    </div>
  );
}