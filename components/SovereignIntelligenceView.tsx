import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  BookOpen, 
  Calculator, 
  Landmark, 
  BarChart3, 
  Scale,
  Search,
  Cpu,
  Terminal,
  Activity,
  Zap,
  Globe,
  MessageSquare,
  CreditCard,
  Mic,
  FileText,
  Building2,
  MapPin,
  Users,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';

import StoryViewer from './StoryViewer';
import AdministrationAudit from './AdministrationAudit';
import WarAppropriationsTracker from './WarAppropriationsTracker';
import InjusticeDashboard from './InjusticeDashboard';
import PublicAidCalculator from './PublicAidCalculator';
import SovereignDealAudit from './SovereignDealAudit';
import ImpeachmentGenerator from './ImpeachmentGenerator';
import SovereignChat from './SovereignChat';
import AriaComms from './AriaComms';
import CitiGateway from './CitiGateway';

import ContractorLobbyingList from './ContractorLobbyingList';
import FloridaVoterView from './FloridaVoterView';
import GasPriceCorrelation from './GasPriceCorrelation';
import GisPropertyMap from './government/GisPropertyMap';
import GovernmentApiDashboard from './government/GovernmentApiDashboard';
import IrsTaxFiling from './government/IrsTaxFiling';
import SecFilingViewer from './government/SecFilingViewer';
import SovereignMarketTakeoverDashboard from './bridges/SovereignMarketTakeoverDashboard';

type ActiveView = 
  | 'dashboard' 
  | 'manifesto' 
  | 'audit' 
  | 'war-ledger' 
  | 'calculator' 
  | 'deals' 
  | 'impeachment' 
  | 'comms' 
  | 'aria' 
  | 'citi-gateway'
  | 'gov-api'
  | 'sec-viewer'
  | 'irs-tax'
  | 'gis-map'
  | 'contractors'
  | 'market-takeover'
  | 'voters'
  | 'gas-correlation';

export default function SovereignIntelligenceView() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [activeCategory, setActiveCategory] = useState<'all' | 'core' | 'finance' | 'gov' | 'comms'>('all');

  const navigation = [
    { id: 'dashboard', name: 'Injustice Ledger', icon: BarChart3, category: 'core' },
    { id: 'manifesto', name: '100 Pages of Truth', icon: BookOpen, category: 'core' },
    { id: 'audit', name: 'Admin Performance', icon: Activity, category: 'core' },
    { id: 'war-ledger', name: 'War Fund Tracker', icon: Landmark, category: 'core' },
    { id: 'calculator', name: 'Aid Discrepancy', icon: Calculator, category: 'core' },
    { id: 'impeachment', name: 'Impeachment Gen', icon: Scale, category: 'core' },

    { id: 'deals', name: 'Sovereign Deals', icon: Cpu, category: 'finance' },
    { id: 'market-takeover', name: 'Market Takeover', icon: TrendingUp, category: 'finance' },
    { id: 'citi-gateway', name: 'Citi Gateway', icon: CreditCard, category: 'finance' },

    { id: 'gov-api', name: 'Gov API Hub', icon: Building2, category: 'gov' },
    { id: 'sec-viewer', name: 'SEC Filings', icon: FileText, category: 'gov' },
    { id: 'irs-tax', name: 'IRS Tax Portal', icon: FileSpreadsheet, category: 'gov' },
    { id: 'gis-map', name: 'GIS Spatial Map', icon: MapPin, category: 'gov' },
    { id: 'contractors', name: 'Lobbying Audit', icon: Users, category: 'gov' },
    { id: 'voters', name: 'Voter Ledger', icon: Globe, category: 'gov' },
    { id: 'gas-correlation', name: 'Gas Correlation', icon: Zap, category: 'gov' },

    { id: 'aria', name: 'Aria Voice', icon: Mic, category: 'comms' },
    { id: 'comms', name: 'Sovereign Chat', icon: MessageSquare, category: 'comms' },
  ];

  const filteredNavigation = activeCategory === 'all' 
    ? navigation 
    : navigation.filter(n => n.category === activeCategory);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10 h-24">
        <div className="max-w-[1600px] mx-auto h-full px-6 flex flex-col justify-center gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-xl">
                <ShieldAlert className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-xs font-black uppercase tracking-[0.2em] leading-none">Sovereign Intelligence Suite</h1>
                <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-[0.4em]">Aquarius Sovereign OS</span>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
              {[
                { id: 'all', label: 'All Modules' },
                { id: 'core', label: 'Core Intelligence' },
                { id: 'finance', label: 'Sovereign Finance' },
                { id: 'gov', label: 'Gov & Audit' },
                { id: 'comms', label: 'Comms' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`px-3 py-1 text-[9px] font-extrabold uppercase tracking-widest rounded-lg transition-all ${
                    activeCategory === cat.id ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">MASTER KERNEL ONLINE</span>
              </div>
            </div>
          </div>

          {/* Module Navigation Scroll View */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {filteredNavigation.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ActiveView)}
                className={`
                  px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0
                  ${activeView === item.id 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
              >
                <item.icon size={12} />
                {item.name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-28 pb-16 px-6">
        <div className="max-w-[1600px] mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              {activeView === 'dashboard' && <InjusticeDashboard />}
              {activeView === 'manifesto' && <StoryViewer />}
              {activeView === 'audit' && <AdministrationAudit />}
              {activeView === 'war-ledger' && <WarAppropriationsTracker />}
              {activeView === 'calculator' && <PublicAidCalculator />}
              {activeView === 'deals' && <SovereignDealAudit />}
              {activeView === 'impeachment' && <ImpeachmentGenerator />}
              {activeView === 'aria' && <AriaComms />}
              {activeView === 'comms' && <SovereignChat />}
              {activeView === 'citi-gateway' && <CitiGateway />}

              {activeView === 'gov-api' && <GovernmentApiDashboard />}
              {activeView === 'sec-viewer' && <SecFilingViewer />}
              {activeView === 'irs-tax' && <IrsTaxFiling />}
              {activeView === 'gis-map' && <GisPropertyMap />}
              {activeView === 'contractors' && <ContractorLobbyingList />}
              {activeView === 'market-takeover' && <SovereignMarketTakeoverDashboard />}
              {activeView === 'voters' && <FloridaVoterView />}
              {activeView === 'gas-correlation' && <GasPriceCorrelation />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Status Ticker Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-8 bg-black border-t border-white/10 flex items-center px-6 z-50 overflow-hidden">
        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-8">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Terminal size={10} className="text-emerald-500" /> SYSTEM_INTEGRITY: 100.0%
              </span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Globe size={10} className="text-blue-500" /> SOVEREIGN_NODES_ACTIVE: 1,420
              </span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Zap size={10} className="text-orange-500" /> AQUARIUS_KERNEL: ONLINE
              </span>
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Search size={10} className="text-red-500" /> AUDIT_MODE: LIVE_ENFORCEMENT
              </span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
