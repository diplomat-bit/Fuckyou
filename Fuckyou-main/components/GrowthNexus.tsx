import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../context/DataContext';
import InvestmentsView from './InvestmentsView';
import QuantumWeaverView from './QuantumWeaverView';
import CryptoView from './CryptoView';
import AlpacaTradingTerminal from './alpaca/AlpacaTradingTerminal';
import PropertyMarketplace from './real-estate/PropertyMarketplace';
import TaxLienAuctions from './tax-liens/TaxLienAuctions';
import TradingBotsView from './TradingBotsView';
import TokenIssuanceView from './TokenIssuanceView';
import { View } from '../types';
import { TrendingUp, Rocket, Bitcoin, Terminal, Home, FileText, Cpu, Coins } from 'lucide-react';

const GrowthNexus: React.FC = () => {
  const context = useContext(DataContext);
  if (!context) return null;
  const { view, setView } = context;

  const [localTab, setLocalTab] = useState<string>('investments');

  // Sync global view to local tab if it matches one of the primary views
  useEffect(() => {
    if (view === View.Investments) setLocalTab('investments');
    else if (view === View.QuantumWeaver) setLocalTab('quantum');
    else if (view === View.Crypto) setLocalTab('crypto');
  }, [view]);

  const handleTabChange = (tabId: string) => {
    setLocalTab(tabId);
    if (tabId === 'investments') setView(View.Investments);
    else if (tabId === 'quantum') setView(View.QuantumWeaver);
    else if (tabId === 'crypto') setView(View.Crypto);
  };

  const renderInternalView = () => {
    switch (localTab) {
      case 'investments': return <InvestmentsView />;
      case 'quantum': return <QuantumWeaverView />;
      case 'crypto': return <CryptoView />;
      case 'alpaca': return <AlpacaTradingTerminal />;
      case 'realestate': return <PropertyMarketplace />;
      case 'taxliens': return <TaxLienAuctions />;
      case 'bots': return <TradingBotsView />;
      case 'tokenization': return <TokenIssuanceView />;
      default: return <InvestmentsView />;
    }
  };

  const navItems = [
    { id: 'investments', label: 'Capital Vista', icon: TrendingUp },
    { id: 'quantum', label: 'Quantum Forge', icon: Rocket },
    { id: 'crypto', label: 'Web3 Gateway', icon: Bitcoin },
    { id: 'alpaca', label: 'Alpaca Terminal', icon: Terminal },
    { id: 'realestate', label: 'Real Estate', icon: Home },
    { id: 'taxliens', label: 'Tax Liens', icon: FileText },
    { id: 'bots', label: 'Trading Bots', icon: Cpu },
    { id: 'tokenization', label: 'Token Issuance', icon: Coins },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-gray-800 pb-8">
        <div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase">Growth Nexus</h1>
          <p className="text-gray-500 mt-1 font-medium">Incubating ventures and optimizing asset trajectories.</p>
        </div>
        <div className="flex flex-wrap gap-2 p-1 bg-gray-900 border border-gray-800 rounded-2xl max-w-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                localTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </header>

      <div className="relative">
        {renderInternalView()}
      </div>
    </div>
  );
};

export default GrowthNexus;