import React, { useState } from 'react';
import Card from './Card';
import { 
  Globe, Shield, Scale, Info, Share2, EyeOff, 
  Vote, Landmark, DollarSign, ShieldAlert, FileText, Users, TrendingUp, AlertTriangle 
} from 'lucide-react';

import FloridaVoterView from './FloridaVoterView';
import InjusticeDashboard from './InjusticeDashboard';
import PublicAidCalculator from './PublicAidCalculator';
import WarAppropriationsTracker from './WarAppropriationsTracker';
import WealthDistributionChart from './WealthDistributionChart';
import ImpeachmentGenerator from './ImpeachmentGenerator';
import ContractorLobbyingList from './ContractorLobbyingList';
import { PoliticalComplianceView } from './PoliticalComplianceView';
import SovereignDealAudit from './SovereignDealAudit';

const FinancialDemocracyView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'voter-aid' | 'lobbying-compliance' | 'war-wealth' | 'impeachment'>('overview');

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-gray-800 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-mono text-emerald-400 uppercase tracking-[0.3em]">Fiscal Sovereignty Node 01</h2>
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter">Democracy Hub</h1>
        </div>
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-2">
           <Shield className="w-4 h-4 text-emerald-400" />
           <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Transparency Protocol: V-Active</span>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-800 pb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'overview'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          Overview & Treaties
        </button>
        <button
          onClick={() => setActiveTab('voter-aid')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'voter-aid'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          Voter & Public Aid
        </button>
        <button
          onClick={() => setActiveTab('lobbying-compliance')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'lobbying-compliance'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          Lobbying & Compliance
        </button>
        <button
          onClick={() => setActiveTab('war-wealth')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'war-wealth'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          War & Wealth Metrics
        </button>
        <button
          onClick={() => setActiveTab('impeachment')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'impeachment'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
          }`}
        >
          Impeachment Engine
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Card title="The Financial Democracy Manifesto" icon={<Scale className="w-5 h-5 text-emerald-400" />}>
             <div className="prose prose-invert max-w-none text-gray-400 mt-4 leading-relaxed">
               <p>This OS believes in a world where financial data belongs exclusively to the user, not the institution. The Democracy Hub is where you audit our ethics and control your treaties.</p>
               <ul className="space-y-4 mt-6">
                 <li className="flex gap-4">
                   <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-xs">01</div>
                   <div>
                      <h4 className="text-white font-bold text-sm">Zero Knowledge Storage</h4>
                      <p className="text-xs">Your keys are hashed and discarded. We never see your neural signatures.</p>
                   </div>
                 </li>
                 <li className="flex gap-4">
                   <div className="w-8 h-8 rounded bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 font-bold text-xs">02</div>
                   <div>
                      <h4 className="text-white font-bold text-sm">Unrestricted Portability</h4>
                      <p className="text-xs">Export your entire fiscal trajectory to any DLT node instantly.</p>
                   </div>
                 </li>
               </ul>
             </div>
          </Card>

          <div className="space-y-8">
            <Card title="Active Data Treaties" icon={<Share2 className="w-5 h-5 text-blue-400" />}>
               <div className="space-y-4 mt-4">
                  <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl flex justify-between items-center group">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 font-black">P</div>
                        <div>
                          <p className="text-sm font-bold text-white">Plaid Network Link</p>
                          <p className="text-[10px] text-gray-500">Expires: Dec 2024</p>
                        </div>
                     </div>
                     <button className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Revoke
                     </button>
                  </div>
                  
                  <div className="p-4 bg-gray-900 border border-gray-800 rounded-2xl flex justify-between items-center group opacity-50">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 font-black">S</div>
                        <div>
                          <p className="text-sm font-bold text-white">Stripe Settlement Gate</p>
                          <p className="text-[10px] text-gray-500">Inactive since 12d</p>
                        </div>
                     </div>
                     <button className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors">
                        Re-Auth
                     </button>
                  </div>
               </div>
            </Card>

            <Card title="System Audit Insights" icon={<Info className="w-5 h-5 text-gray-400" />}>
               <div className="p-4 bg-gray-950 rounded-2xl border border-gray-800">
                  <p className="text-xs text-gray-500 leading-relaxed italic">
                    "No anomalous data extraction identified. Your current data sharing footprint is 34% below the average for your tier, maximizing your privacy advantage."
                  </p>
               </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'voter-aid' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Vote className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Florida Voter Registration & Analytics</h3>
              </div>
              <FloridaVoterView />
            </div>
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Public Aid Calculator</h3>
              </div>
              <PublicAidCalculator />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'lobbying-compliance' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Contractor Lobbying Registry</h3>
              </div>
              <ContractorLobbyingList />
            </div>
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Political Compliance Audit</h3>
              </div>
              <PoliticalComplianceView />
            </div>
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Landmark className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Sovereign Deal Audit</h3>
              </div>
              <SovereignDealAudit />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'war-wealth' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-bold text-white">War Appropriations Tracker</h3>
              </div>
              <WarAppropriationsTracker />
            </div>
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-bold text-white">Injustice & Disparity Dashboard</h3>
              </div>
              <InjusticeDashboard />
            </div>
          </div>
          <div className="space-y-6">
            <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Wealth Distribution Chart</h3>
              </div>
              <WealthDistributionChart />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'impeachment' && (
        <div className="max-w-4xl mx-auto">
          <div className="p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-white">Impeachment Resolution Generator</h3>
            </div>
            <ImpeachmentGenerator />
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialDemocracyView;