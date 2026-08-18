import React, { useState, useEffect } from 'react';

interface AccountHolding {
  cusip: string;
  assetClass: string;
  price: number;
  changeInValue: number;
  assetName: string;
}

interface Strategy {
  title: string;
  description: string;
  riskLevel: 'Ultra-High' | 'Existential' | 'Galactic';
  estimatedCapitalRequirement: string;
}

export const SovereignWealthAIAdvisor: React.FC = () => {
  const [holdings, setHoldings] = useState<AccountHolding[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const response = await fetch('/api/accounts/details');
        const data = await response.json();
        setHoldings(data.holdings);
        generateUltraExclusiveStrategies(data.holdings);
      } catch (error) {
        console.error('Failed to fetch sovereign portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, []);

  const generateUltraExclusiveStrategies = (data: AccountHolding[]) => {
    const totalValue = data.reduce((acc, curr) => acc + curr.price, 0);
    
    const aiStrategies: Strategy[] = [
      {
        title: "Near-Earth Asteroid Mining Syndicate",
        description: "Leveraging Citibank's liquidity to secure mineral rights on 16 Psyche. Projected ROI exceeds traditional terrestrial commodities by 40,000%.",
        riskLevel: "Galactic",
        estimatedCapitalRequirement: `$${(totalValue * 0.4).toLocaleString()}B`
      },
      {
        title: "Sovereign Private Island Sovereignty Acquisition",
        description: "Acquisition of sovereign-status landmasses in the South Pacific. Includes private defense contracting and independent satellite uplink infrastructure.",
        riskLevel: "Existential",
        estimatedCapitalRequirement: `$${(totalValue * 0.15).toLocaleString()}B`
      },
      {
        title: "Quantum-Entangled High-Frequency Trading",
        description: "Deploying proprietary quantum processors to front-run global markets via Modern Treasury settlement rails before the trade is even executed.",
        riskLevel: "Ultra-High",
        estimatedCapitalRequirement: `$${(totalValue * 0.05).toLocaleString()}B`
      }
    ];
    setStrategies(aiStrategies);
  };

  if (loading) return <div className="p-8 text-gold animate-pulse">Calibrating Sovereign AI...</div>;

  return (
    <div className="bg-black border border-gold-500 p-8 rounded-lg shadow-2xl text-white font-serif">
      <h1 className="text-4xl font-bold mb-6 text-gold-400 uppercase tracking-widest">Sovereign Wealth AI Advisor</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl mb-4 border-b border-gold-800">Portfolio Analysis</h2>
          <ul className="space-y-2">
            {holdings.map((h) => (
              <li key={h.cusip} className="flex justify-between text-sm">
                <span>{h.assetName}</span>
                <span className="text-green-400">${h.price.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="text-xl mb-4 border-b border-gold-800">Ultra-Exclusive Strategies</h2>
          <div className="space-y-6">
            {strategies.map((s, idx) => (
              <div key={idx} className="bg-gray-900 p-4 rounded border-l-4 border-gold-500">
                <h3 className="font-bold text-gold-300">{s.title}</h3>
                <p className="text-xs mt-1 opacity-80">{s.description}</p>
                <div className="mt-2 flex justify-between text-[10px] uppercase font-bold">
                  <span className="text-red-500">{s.riskLevel}</span>
                  <span className="text-blue-400">{s.estimatedCapitalRequirement}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <footer className="mt-8 pt-4 border-t border-gold-900 text-[10px] text-center opacity-50">
        Powered by Citibank Global Wealth & Modern Treasury Settlement Protocols. Confidentiality Level: Sovereign.
      </footer>
    </div>
  );
};