import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Cpu, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  TrendingDown, 
  Coins, 
  Layers, 
  Zap, 
  Globe, 
  ChevronRight, 
  RefreshCw, 
  Sliders, 
  Eye, 
  FileText, 
  ArrowUpRight,
  DollarSign
} from 'lucide-react';

// Premium Types
interface ConsentScope {
  id: string;
  name: string;
  category: 'Read' | 'Write' | 'Admin';
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  exposureValue: string; // Estimated exposure in billions
  modernTreasuryEndpoint: string;
  citibankApiRoute: string;
  enabled: boolean;
}

interface AIRecommendation {
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL_EXPOSURE';
  score: number; // 0 - 100 (higher is safer)
  message: string;
  actionPlan: string;
  suggestedDeactivations: string[];
  estimatedSavings: string; // e.g., "$420M potential liability reduction"
}

export default function AggregatorConsentManager() {
  // State for Consent Scopes
  const [scopes, setScopes] = useState<ConsentScope[]>([
    {
      id: 'accounts_details_transactions',
      name: 'Transaction Ledger Sync',
      category: 'Read',
      description: 'Real-time streaming of multi-currency transaction ledgers and historical balances.',
      riskLevel: 'Medium',
      exposureValue: '$2.4B',
      modernTreasuryEndpoint: '/v1/ledger_entries',
      citibankApiRoute: '/v1/asset-servicing/transactions',
      enabled: true,
    },
    {
      id: 'accounts_routing_number',
      name: 'Modern Treasury High-Value Routing',
      category: 'Admin',
      description: 'Access to routing numbers, virtual accounts, and clearing house identifiers for Fedwire/CHIPS.',
      riskLevel: 'Critical',
      exposureValue: '$8.5B',
      modernTreasuryEndpoint: '/v1/virtual_accounts',
      citibankApiRoute: '/v1/payment-exchange/routing',
      enabled: true,
    },
    {
      id: 'accounts_statements',
      name: 'Historical Wealth Audits',
      category: 'Read',
      description: 'Generates certified PDF/JSON statements for sovereign wealth fund compliance.',
      riskLevel: 'Low',
      exposureValue: '$0.8B',
      modernTreasuryEndpoint: '/v1/documents',
      citibankApiRoute: '/v1/wealth-management/statements',
      enabled: false,
    },
    {
      id: 'payment_initiation',
      name: 'Automated Liquidity Sweeps',
      category: 'Write',
      description: 'Initiates high-value outbound payments and automated treasury sweeps across global nodes.',
      riskLevel: 'Critical',
      exposureValue: '$12.1B',
      modernTreasuryEndpoint: '/v1/payment_orders',
      citibankApiRoute: '/v1/wire-transfers/initiate',
      enabled: true,
    },
    {
      id: 'real_time_balances',
      name: 'Instant Treasury Valuation',
      category: 'Read',
      description: 'Sub-millisecond balance updates across Citibank Private Bank accounts and Modern Treasury ledgers.',
      riskLevel: 'Low',
      exposureValue: '$1.2B',
      modernTreasuryEndpoint: '/v1/balances',
      citibankApiRoute: '/v1/liquidity/real-time-balance',
      enabled: true,
    },
  ]);

  // UI States
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'matrix' | 'audit' | 'topology'>('matrix');
  const [portfolioValue, setPortfolioValue] = useState<number>(14820500000); // $14.82B
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<string[]>([
    'System initialized: Citi-Quantum AI Safeguard active.',
    'Modern Treasury ledger sync established via TLS 1.3.',
    'Citibank Private Bank API handshake verified.'
  ]);

  // Add log helper
  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 15)]);
  };

  // Toggle Scope Handler
  const handleToggleScope = (id: string) => {
    setScopes(prev => prev.map(scope => {
      if (scope.id === id) {
        const nextState = !scope.enabled;
        addLog(`Scope '${scope.name}' ${nextState ? 'ENABLED' : 'DISABLED'} by administrator.`);
        return { ...scope, enabled: nextState };
      }
      return scope;
    }));
  };

  // AI Recommendation Engine (Dynamic calculation based on active scopes)
  const aiRecommendation = useMemo<AIRecommendation>(() => {
    const active = scopes.filter(s => s.enabled);
    const criticalActive = active.filter(s => s.riskLevel === 'Critical');
    const mediumActive = active.filter(s => s.riskLevel === 'Medium');
    
    let score = 100;
    score -= (criticalActive.length * 25);
    score -= (mediumActive.length * 10);
    if (score < 0) score = 0;

    let status: 'OPTIMAL' | 'WARNING' | 'CRITICAL_EXPOSURE' = 'OPTIMAL';
    let message = 'Your multi-billion dollar portfolio is fully optimized and shielded.';
    let actionPlan = 'No immediate action required. The current configuration minimizes exposure while maintaining core Modern Treasury liquidity sweeps.';
    let suggestedDeactivations: string[] = [];
    let estimatedSavings = '$0';

    if (score < 50) {
      status = 'CRITICAL_EXPOSURE';
      message = 'High-risk exposure detected. Multiple critical write/admin scopes are active simultaneously.';
      actionPlan = 'We recommend immediately deactivating "Automated Liquidity Sweeps" or "Modern Treasury High-Value Routing" unless an active high-value wire window is open.';
      suggestedDeactivations = ['payment_initiation', 'accounts_routing_number'];
      estimatedSavings = '$12.1 Billion';
    } else if (score < 80) {
      status = 'WARNING';
      message = 'Moderate exposure. Elevated risk due to active transaction ledger streaming and routing access.';
      actionPlan = 'Consider disabling "Transaction Ledger Sync" if real-time reconciliation is not required for the next 4 hours.';
      suggestedDeactivations = ['accounts_details_transactions'];
      estimatedSavings = '$2.4 Billion';
    }

    return {
      status,
      score,
      message,
      actionPlan,
      suggestedDeactivations,
      estimatedSavings
    };
  }, [scopes]);

  // AI Auto-Optimization Routine
  const triggerAiOptimization = () => {
    setIsOptimizing(true);
    addLog('Citi-Quantum AI: Initiating portfolio exposure minimization protocol...');
    
    setTimeout(() => {
      setScopes(prev => prev.map(scope => {
        if (aiRecommendation.suggestedDeactivations.includes(scope.id)) {
          addLog(`Citi-Quantum AI: Automatically deactivated high-risk scope: ${scope.name}`);
          return { ...scope, enabled: false };
        }
        return scope;
      }));
      setIsOptimizing(false);
      addLog('Citi-Quantum AI: Optimization complete. Portfolio risk score restored to optimal levels.');
    }, 1500);
  };

  // Authorize Handshake
  const handleAuthorize = () => {
    setIsAuthorized(true);
    addLog('Citibank & Modern Treasury handshake authorized. Multi-billion dollar ledger locked.');
    alert('Handshake Authorized. Secure cryptographic tokens dispatched to Citibank Private Bank & Modern Treasury endpoints.');
  };

  // Revoke All
  const handleRevokeAll = () => {
    setScopes(prev => prev.map(s => ({ ...s, enabled: false })));
    setIsAuthorized(false);
    addLog('EMERGENCY REVOCATION TRIGGERED. All API scopes disabled. Modern Treasury ledgers frozen.');
  };

  // Simulate real-time portfolio value fluctuation (very high-end touch)
  useEffect(() => {
    const interval = setInterval(() => {
      setPortfolioValue(prev => prev + (Math.random() - 0.48) * 150000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-[#E5E4E2] font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Top Premium Status Bar */}
      <div className="border-b border-[#1F1F2E] bg-[#0E0E14] px-8 py-3 flex justify-between items-center text-xs tracking-widest text-[#8E8E93]">
        <div className="flex items-center space-x-3">
          <span className="inline-block w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
          <span className="font-mono text-[#D4AF37]">CITIBANK PRIVATE ELITE</span>
          <span className="text-[#3A3A4C]">|</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-[#D4AF37]" />
            QUANTUM AI SAFEGUARD ACTIVE
          </span>
        </div>
        <div className="flex items-center space-x-6 font-mono">
          <span>SECURE NODE: MT-CITI-9982</span>
          <span className="text-[#3A3A4C]">|</span>
          <span>PORTFOLIO VALUE: <span className="text-white font-bold">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> USD</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="max-w-7xl mx-auto px-8 pt-12 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold tracking-[0.3em] uppercase mb-2">
              <Shield className="w-4 h-4" />
              Consensus &amp; Authorization Matrix
            </div>
            <h1 className="text-4xl font-extralight tracking-tight text-white">
              Aggregator <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#E5E4E2]">Consent Manager</span>
            </h1>
            <p className="text-[#8E8E93] mt-2 max-w-2xl text-sm leading-relaxed">
              Orchestrate high-fidelity data scopes between Citibank Private Bank accounts and Modern Treasury ledger infrastructure. Powered by real-time AI risk mitigation to safeguard multi-billion dollar corporate liquidity.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="bg-gradient-to-b from-[#161622] to-[#0E0E14] border border-[#2C2C3E] rounded-xl p-4 min-w-[180px] shadow-2xl">
              <div className="text-xs text-[#8E8E93] uppercase tracking-wider">Active Scopes</div>
              <div className="text-2xl font-semibold text-white mt-1">
                {scopes.filter(s => s.enabled).length} <span className="text-xs text-[#8E8E93] font-normal">/ {scopes.length}</span>
              </div>
              <div className="text-[10px] text-[#D4AF37] mt-1 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Modern Treasury Sync
              </div>
            </div>

            <div className="bg-gradient-to-b from-[#161622] to-[#0E0E14] border border-[#2C2C3E] rounded-xl p-4 min-w-[180px] shadow-2xl">
              <div className="text-xs text-[#8E8E93] uppercase tracking-wider">AI Risk Index</div>
              <div className="text-2xl font-semibold mt-1 flex items-center gap-2">
                <span style={{
                  color: aiRecommendation.score > 75 ? '#10B981' : aiRecommendation.score > 45 ? '#F59E0B' : '#EF4444'
                }}>
                  {aiRecommendation.score}%
                </span>
                <span className="text-xs text-[#8E8E93] font-normal">Score</span>
              </div>
              <div className="text-[10px] text-[#8E8E93] mt-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#D4AF37]" />
                {aiRecommendation.status}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#1F1F2E] mt-10 gap-8">
          <button 
            onClick={() => setActiveTab('matrix')}
            className={`pb-4 text-sm font-medium tracking-wider transition-all relative ${activeTab === 'matrix' ? 'text-[#D4AF37]' : 'text-[#8E8E93] hover:text-white'}`}
          >
            {activeTab === 'matrix' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />}
            Permission Matrix
          </button>
          <button 
            onClick={() => setActiveTab('topology')}
            className={`pb-4 text-sm font-medium tracking-wider transition-all relative ${activeTab === 'topology' ? 'text-[#D4AF37]' : 'text-[#8E8E93] hover:text-white'}`}
          >
            {activeTab === 'topology' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />}
            Citibank &amp; Modern Treasury Topology
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`pb-4 text-sm font-medium tracking-wider transition-all relative ${activeTab === 'audit' ? 'text-[#D4AF37]' : 'text-[#8E8E93] hover:text-white'}`}
          >
            {activeTab === 'audit' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />}
            Real-Time Audit Log
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-8 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left & Middle Columns: Interactive Matrix or Topology */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-white tracking-wide flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#D4AF37]" />
                  Granular Scope Authorization
                </h2>
                <span className="text-xs text-[#8E8E93]">Click any scope to toggle authorization state</span>
              </div>

              {/* Scope Cards */}
              <div className="space-y-4">
                {scopes.map((scope) => {
                  const isCritical = scope.riskLevel === 'Critical';
                  const isMedium = scope.riskLevel === 'Medium';
                  
                  return (
                    <div 
                      key={scope.id}
                      className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
                        scope.enabled 
                          ? 'bg-gradient-to-r from-[#12121A] to-[#181825] border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.05)]' 
                          : 'bg-[#0E0E14] border-[#1F1F2E] opacity-60 hover:opacity-80'
                      }`}
                    >
                      {/* Top accent line for enabled critical scopes */}
                      {scope.enabled && isCritical && (
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 to-[#D4AF37]" />
                      )}

                      <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="space-y-2 max-w-xl">
                          <div className="flex items-center gap-3">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono tracking-widest uppercase ${
                              scope.category === 'Admin' ? 'bg-red-950 text-red-400 border border-red-800' :
                              scope.category === 'Write' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                              'bg-blue-950 text-blue-400 border border-blue-800'
                            }`}>
                              {scope.category}
                            </span>
                            <h3 className="text-base font-medium text-white">{scope.name}</h3>
                            <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                              isCritical ? 'text-red-400 bg-red-500/10' :
                              isMedium ? 'text-amber-400 bg-amber-500/10' :
                              'text-emerald-400 bg-emerald-500/10'
                            }`}>
                              {scope.riskLevel} Risk
                            </span>
                          </div>

                          <p className="text-xs text-[#8E8E93] leading-relaxed">
                            {scope.description}
                          </p>

                          {/* API Endpoints Mapping */}
                          <div className="pt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-mono text-[#5C5C70]">
                            <span className="flex items-center gap-1">
                              <span className="text-[#D4AF37]">Citi:</span> {scope.citibankApiRoute}
                            </span>
                            <span className="hidden md:inline">|</span>
                            <span className="flex items-center gap-1">
                              <span className="text-[#E5E4E2]">Modern Treasury:</span> {scope.modernTreasuryEndpoint}
                            </span>
                          </div>
                        </div>

                        {/* Toggle Switch & Exposure Value */}
                        <div className="flex md:flex-col items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-[#1F1F2E]">
                          <div className="text-right mb-2 hidden md:block">
                            <div className="text-[10px] text-[#8E8E93] uppercase tracking-wider">Exposure Value</div>
                            <div className="text-sm font-mono font-semibold text-white">{scope.exposureValue}</div>
                          </div>

                          <button
                            onClick={() => handleToggleScope(scope.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              scope.enabled ? 'bg-[#D4AF37]' : 'bg-[#1F1F2E]'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${
                                scope.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'topology' && (
            <div className="bg-[#0E0E14] border border-[#1F1F2E] rounded-2xl p-8 space-y-8">
              <div>
                <h2 className="text-lg font-medium text-white tracking-wide">Citibank &amp; Modern Treasury Integration Topology</h2>
                <p className="text-xs text-[#8E8E93] mt-1">Visualizing the secure, high-value data pipeline and ledger synchronization.</p>
              </div>

              {/* Topology Diagram */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center relative">
                
                {/* Citibank Node */}
                <div className="bg-gradient-to-b from-[#12121A] to-[#181825] border border-[#D4AF37]/30 rounded-xl p-6 text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#D4AF37] text-black text-[9px] font-bold px-2.5 py-0.5 rounded-full tracking-widest">
                    CITIBANK CORE
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/30">
                    <Globe className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Citi Private Bank API</h4>
                  <p className="text-[11px] text-[#8E8E93] mt-2">Sovereign wealth accounts, multi-currency vaults, and institutional custody.</p>
                  <div className="mt-4 pt-3 border-t border-[#1F1F2E] text-[10px] font-mono text-[#D4AF37]">
                    Mutual TLS (mTLS) Active
                  </div>
                </div>

                {/* Secure AI Gateway (Middle) */}
                <div className="flex flex-col items-center justify-center py-4 md:py-0">
                  <div className="w-full h-[1px] bg-gradient-to-r from-[#D4AF37] to-[#E5E4E2] hidden md:block relative">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#0B0B0F] px-3 py-1 border border-[#2C2C3E] rounded-full text-[10px] font-mono text-[#D4AF37] flex items-center gap-1">
                      <Cpu className="w-3 h-3 animate-spin" /> AI Shield
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <span className="text-[10px] text-[#8E8E93] block">Real-Time Risk Audit</span>
                    <span className="text-xs font-mono text-white font-bold">0.04ms Latency</span>
                  </div>
                </div>

                {/* Modern Treasury Node */}
                <div className="bg-gradient-to-b from-[#12121A] to-[#181825] border border-[#E5E4E2]/30 rounded-xl p-6 text-center relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#E5E4E2] text-black text-[9px] font-bold px-2.5 py-0.5 rounded-full tracking-widest">
                    MODERN TREASURY
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#E5E4E2]/10 flex items-center justify-center mx-auto mb-4 border border-[#E5E4E2]/30">
                    <Layers className="w-6 h-6 text-[#E5E4E2]" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">Ledger &amp; Payment Engine</h4>
                  <p className="text-[11px] text-[#8E8E93] mt-2">Double-entry ledger database, automated payment orchestration, and virtual accounts.</p>
                  <div className="mt-4 pt-3 border-t border-[#1F1F2E] text-[10px] font-mono text-[#E5E4E2]">
                    Webhooks Configured
                  </div>
                </div>

              </div>

              {/* Security Details */}
              <div className="bg-[#12121A] border border-[#1F1F2E] rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                  <h5 className="font-semibold text-white flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Citibank Security Protocol
                  </h5>
                  <p className="text-[#8E8E93] leading-relaxed">
                    All outbound requests are signed using HSM-backed private keys. Consent tokens are scoped strictly to the authorized endpoints and expire automatically every 24 hours.
                  </p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-semibold text-white flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#E5E4E2]" />
                    Modern Treasury Ledger Integrity
                  </h5>
                  <p className="text-[#8E8E93] leading-relaxed">
                    Ledger entries are immutable. Any scope modification triggers an automated reconciliation audit to ensure no pending payment orders are orphaned.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-[#0E0E14] border border-[#1F1F2E] rounded-2xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-white tracking-wide">Real-Time Audit Log</h2>
                <button 
                  onClick={() => {
                    setLogs([]);
                    addLog('Audit log cleared by administrator.');
                  }}
                  className="text-xs text-[#8E8E93] hover:text-white transition-colors"
                >
                  Clear Logs
                </button>
              </div>
              <div className="bg-black rounded-xl p-4 font-mono text-xs text-[#8E8E93] space-y-2.5 max-h-[400px] overflow-y-auto border border-[#1F1F2E]">
                {logs.map((log, index) => (
                  <div key={index} className="border-b border-[#12121A] pb-2 last:border-0">
                    <span className="text-[#D4AF37]">&gt;</span> {log}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: AI Safeguard & Actions */}
        <div className="space-y-6">
          
          {/* AI Safeguard Panel */}
          <div className="bg-gradient-to-b from-[#161622] to-[#0E0E14] border border-[#D4AF37]/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Decorative gold glow */}
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/30">
                <Cpu className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wider text-white uppercase">Citi-Quantum AI</h3>
                <p className="text-[10px] text-[#8E8E93]">Portfolio Safeguard Engine</p>
              </div>
            </div>

            {/* Risk Meter */}
            <div className="bg-black/40 border border-[#1F1F2E] rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-[#8E8E93]">Portfolio Exposure Risk</span>
                <span className="text-xs font-mono font-bold text-white">
                  {100 - aiRecommendation.score}% Exposure
                </span>
              </div>
              <div className="w-full bg-[#1F1F2E] h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500"
                  style={{ 
                    width: `${100 - aiRecommendation.score}%`,
                    backgroundColor: aiRecommendation.score > 75 ? '#10B981' : aiRecommendation.score > 45 ? '#F59E0B' : '#EF4444'
                  }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-[10px] text-[#5C5C70]">
                <span>Secure (0%)</span>
                <span>Critical (100%)</span>
              </div>
            </div>

            {/* AI Recommendation Text */}
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                  {aiRecommendation.status === 'OPTIMAL' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                  {aiRecommendation.status === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  {aiRecommendation.status === 'CRITICAL_EXPOSURE' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                  Status: {aiRecommendation.status}
                </div>
                <p className="text-xs text-[#8E8E93] leading-relaxed">
                  {aiRecommendation.message}
                </p>
              </div>

              {aiRecommendation.status !== 'OPTIMAL' && (
                <div className="bg-black/30 border border-[#1F1F2E] rounded-lg p-3 space-y-2">
                  <div className="text-[11px] font-semibold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5" />
                    AI Recommended Action Plan
                  </div>
                  <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                    {aiRecommendation.actionPlan}
                  </p>
                  <div className="pt-1 flex justify-between items-center text-[10px] font-mono">
                    <span className="text-[#8E8E93]">Potential Liability Reduction:</span>
                    <span className="text-emerald-400 font-bold">{aiRecommendation.estimatedSavings}</span>
                  </div>
                </div>
              )}

              {/* Auto-Optimize Button */}
              <button
                onClick={triggerAiOptimization}
                disabled={isOptimizing || aiRecommendation.status === 'OPTIMAL'}
                className={`w-full py-3 px-4 rounded-xl font-medium text-xs tracking-wider transition-all flex items-center justify-center gap-2 ${
                  aiRecommendation.status === 'OPTIMAL'
                    ? 'bg-[#1F1F2E] text-[#5C5C70] cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-[0.98]'
                }`}
              >
                {isOptimizing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Optimizing Portfolio Scopes...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    Auto-Optimize via AI Safeguard
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Action Panel */}
          <div className="bg-[#0E0E14] border border-[#1F1F2E] rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase">Consensus Actions</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleAuthorize}
                className="w-full py-3 px-4 bg-white text-black hover:bg-[#E5E4E2] rounded-xl font-semibold text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <Lock className="w-4 h-4" />
                Authorize Secure Handshake
              </button>

              <button
                onClick={handleRevokeAll}
                className="w-full py-3 px-4 bg-transparent hover:bg-red-950/20 border border-red-900/50 text-red-400 rounded-xl font-semibold text-xs tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Emergency Revoke All Access
              </button>
            </div>

            <div className="pt-4 border-t border-[#1F1F2E] text-[10px] text-[#8E8E93] space-y-2">
              <div className="flex justify-between">
                <span>Last Handshake:</span>
                <span className="font-mono text-white">Never (Pending Auth)</span>
              </div>
              <div className="flex justify-between">
                <span>Cryptographic Standard:</span>
                <span className="font-mono text-white">ECDSA P-256</span>
              </div>
              <div className="flex justify-between">
                <span>Compliance Audit:</span>
                <span className="font-mono text-[#D4AF37]">SDR-992 Compliant</span>
              </div>
            </div>
          </div>

          {/* Modern Treasury Ledger Preview */}
          <div className="bg-[#0E0E14] border border-[#1F1F2E] rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold tracking-wider text-white uppercase">Ledger Preview</h3>
              <span className="text-[10px] font-mono text-[#E5E4E2] bg-[#E5E4E2]/10 px-2 py-0.5 rounded">Live Sync</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-black/40 p-3 rounded-lg border border-[#1F1F2E] space-y-2">
                <div className="flex justify-between text-[10px] text-[#8E8E93]">
                  <span>LEDGER ID</span>
                  <span>STATUS</span>
                </div>
                <div className="flex justify-between text-white font-semibold">
                  <span>lg_usr_992811</span>
                  <span className="text-emerald-400">ACTIVE</span>
                </div>
              </div>

              <div className="bg-black/40 p-3 rounded-lg border border-[#1F1F2E] space-y-2">
                <div className="flex justify-between text-[10px] text-[#8E8E93]">
                  <span>PENDING WIRE VOLUME</span>
                  <span>COUNT</span>
                </div>
                <div className="flex justify-between text-white font-semibold">
                  <span>$4.20 Billion</span>
                  <span>12 Orders</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Premium Footer */}
      <footer className="border-t border-[#1F1F2E] bg-[#0E0E14] py-8 text-center text-xs text-[#5C5C70] tracking-wider">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            © {new Date().getFullYear()} Citibank Private Bank &amp; Modern Treasury. All sovereign rights reserved.
          </div>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-white transition-colors">Sovereign Privacy Policy</a>
            <a href="#terms" className="hover:text-white transition-colors">Institutional Terms of Custody</a>
            <a href="#security" className="hover:text-white transition-colors">Quantum Cryptography Standards</a>
          </div>
        </div>
      </footer>
    </div>
  );
}