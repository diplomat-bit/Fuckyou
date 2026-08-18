import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Globe, 
  Cpu, 
  Zap, 
  TrendingUp, 
  LayoutGrid, 
  CreditCard, 
  Landmark, 
  Terminal,
  Activity,
  Server,
  Users,
  ArrowRight,
  Lock
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const FeatureCard = ({ icon: Icon, title, description, delay }: { icon: any, title: string, description: string, delay: string }) => (
  <div className={`group p-6 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-cyan-500/30 hover:bg-gray-900/60 transition-all duration-500 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards ${delay}`}>
    <div className="w-12 h-12 rounded-lg bg-gray-800/50 flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
      <Icon className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2 font-mono">{title}</h3>
    <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
  </div>
);

const StatItem = ({ value, label }: { value: string, label: string }) => (
  <div className="flex flex-col items-center md:items-start space-y-1 group cursor-default">
    <span className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 font-mono group-hover:scale-105 transition-transform duration-300">
      {value}
    </span>
    <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">{label}</span>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const authContext = useContext(AuthContext);
  const isAuthenticated = authContext?.isAuthenticated;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEnter = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-gray-800 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Cpu className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight font-mono">NEXUS<span className="text-cyan-400">OS</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
            <a href="#enterprise" className="hover:text-white transition-colors">Enterprise</a>
          </div>

          <button 
            onClick={handleEnter}
            className="px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 text-sm font-medium transition-all duration-300 flex items-center gap-2 group"
          >
            {isAuthenticated ? 'Launch Console' : 'Sign In'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-cyan-400" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            SYSTEM OPERATIONAL v4.0.2
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
            The Operating System <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
              For Sovereign Wealth
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Orchestrate your financial empire with military-grade precision. 
            AI-driven insights, quantum-resistant security, and global asset management in one unified interface.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            <button 
              onClick={handleEnter}
              className="w-full md:w-auto px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-lg transition-all duration-300 shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_rgba(6,182,212,0.5)] hover:scale-105 flex items-center justify-center gap-2"
            >
              <Terminal className="w-5 h-5" />
              Initialize System
            </button>
            <button 
              onClick={() => navigate('/modules')}
              className="w-full md:w-auto px-8 py-4 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-white font-bold text-lg transition-all duration-300 hover:bg-gray-800 flex items-center justify-center gap-2"
            >
              <LayoutGrid className="w-5 h-5 text-gray-400" />
              Explore Modules
            </button>
          </div>

          {/* Stats */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-gray-800 pt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <StatItem value="$42B+" label="Assets Managed" />
            <StatItem value="0.0ms" label="Latency Target" />
            <StatItem value="256-bit" label="Encryption" />
            <StatItem value="24/7" label="AI Surveillance" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-black/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Capabilities</h2>
            <p className="text-gray-400 max-w-xl">Advanced modules designed for the modern financial architect.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Landmark}
              title="Global Treasury"
              description="Unified view of multi-currency accounts, real-time liquidity management, and automated sweeping rules."
              delay="delay-0"
            />
            <FeatureCard 
              icon={TrendingUp}
              title="AI Trading Lab"
              description="Deploy algorithmic strategies across Forex, Crypto, and Equities markets with predictive modeling."
              delay="delay-100"
            />
            <FeatureCard 
              icon={Shield}
              title="Compliance Oracle"
              description="Real-time regulatory scanning and automated KYC/KYB verification for global operations."
              delay="delay-200"
            />
            <FeatureCard 
              icon={CreditCard}
              title="Card Issuance"
              description="Instant virtual card generation with granular spend controls and dynamic limits."
              delay="delay-300"
            />
            <FeatureCard 
              icon={Globe}
              title="Cross-Border Rails"
              description="Seamless international transfers via SWIFT, SEPA, and ACH with optimized FX rates."
              delay="delay-400"
            />
            <FeatureCard 
              icon={Zap}
              title="Quantum Weaver"
              description="Next-generation asset allocation engine utilizing quantum-inspired optimization algorithms."
              delay="delay-500"
            />
          </div>
        </div>
      </section>

      {/* Interface Preview / Bento Grid */}
      <section id="enterprise" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
            {/* Large Card */}
            <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-gray-900 border border-gray-800 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="text-cyan-400" />
                  <h3 className="text-2xl font-bold">Real-Time Analytics</h3>
                </div>
                <p className="text-gray-400 max-w-md">
                  Visualize cash flow, P&L, and exposure across all entities in a single, high-fidelity dashboard.
                </p>
              </div>
              {/* Abstract UI Representation */}
              <div className="absolute bottom-0 right-0 w-3/4 h-3/4 bg-gray-950 rounded-tl-3xl border-t border-l border-gray-800 p-6 shadow-2xl translate-y-4 translate-x-4 transition-transform duration-500 group-hover:translate-y-2 group-hover:translate-x-2">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="h-32 w-full bg-gray-900 rounded-xl animate-pulse" />
                    <div className="h-32 w-full bg-gray-900 rounded-xl animate-pulse delay-75" />
                  </div>
                  <div className="h-48 w-full bg-gray-900 rounded-xl animate-pulse delay-150" />
                </div>
              </div>
            </div>

            {/* Side Card 1 */}
            <div className="rounded-3xl bg-gray-900 border border-gray-800 p-8 flex flex-col justify-between group hover:border-indigo-500/30 transition-colors">
              <div>
                <Server className="w-8 h-8 text-indigo-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">API First</h3>
                <p className="text-gray-400 text-sm">Full programmatic access to all banking primitives.</p>
              </div>
              <div className="mt-4 font-mono text-xs text-gray-500 bg-black p-3 rounded-lg border border-gray-800">
                <span className="text-purple-400">POST</span> /v1/transfers/execute
              </div>
            </div>

            {/* Side Card 2 */}
            <div className="rounded-3xl bg-gray-900 border border-gray-800 p-8 flex flex-col justify-between group hover:border-emerald-500/30 transition-colors">
              <div>
                <Users className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">Multi-Entity</h3>
                <p className="text-gray-400 text-sm">Manage subsidiaries and holding companies effortlessly.</p>
              </div>
              <div className="flex -space-x-2 mt-4">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-[10px] font-bold">
                    E{i}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 px-6 bg-gradient-to-b from-black to-gray-900/50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-8">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Fortress-Grade Security</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-12">
            Your assets are protected by state-of-the-art encryption, multi-signature authorization, and continuous AI threat monitoring.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['SOC2 Type II', 'ISO 27001', 'GDPR Compliant', '256-bit AES', 'Biometric Auth'].map((badge) => (
              <span key={badge} className="px-4 py-2 rounded-full bg-gray-900 border border-gray-800 text-sm text-gray-400 font-mono">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-950/20" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight">Ready to Ascend?</h2>
          <p className="text-xl text-gray-400 mb-10">
            Join the elite network of sovereign individuals and corporations leveraging Nexus OS.
          </p>
          <button 
            onClick={handleEnter}
            className="px-10 py-5 rounded-full bg-white text-black font-bold text-lg hover:bg-cyan-50 transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-105"
          >
            Begin Onboarding
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-black py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Cpu className="text-gray-600 w-5 h-5" />
            <span className="text-gray-500 font-mono text-sm">NEXUS OS &copy; 2024</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Protocol</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Engagement</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;