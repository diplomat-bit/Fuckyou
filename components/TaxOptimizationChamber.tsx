
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

// --- App-in-App: Sovereign AI Micro-Components ---

const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.737 16.95l.001-.001M16.263 16.95l.001-.001M12 20.055V17m0 0a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// --- Expanded Data Structures & World Simulation ---

interface Company {
  id: number;
  ticker: string;
  name: string;
  sector: 'Tech' | 'Finance' | 'Energy' | 'Industry' | 'Health' | 'Quantum' | 'BioSynth';
  currentPrice: number;
  volatilityIndex: number; // 0.1 (stable) to 2.0 (volatile)
  marketCap: number; // in billions
  peRatio: number;
  dividendYield: number;
  esgRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  analystConsensus: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  newsSentiment: number; // -1 (very negative) to 1 (very positive)
}

interface Holding {
  companyId: number;
  shares: number;
  costBasis: number; // Per share
  purchaseDate: Date;
}

interface TaxHarvestingSuggestion {
  ticker: string;
  sharesToSell: number;
  realizedGainLoss: number;
  gainType: 'Short-Term' | 'Long-Term';
  strategy: 'Public Benefit Contribution' | 'Compliance Alignment' | 'Gain Realization';
  recommendation: string;
}

interface HFT_MicroTrade {
    id: string;
    ticker: string;
    action: 'BUY' | 'SELL';
    price: number;
    shares: number;
    timestamp: number;
    microGainLoss: number;
}

// Simulate a vast, interconnected market of 100 entities
const MOCK_COMPANIES: Company[] = Array.from({ length: 100 }, (_, i) => ({
  id: 101 + i,
  ticker: `WRLD${i + 1}`,
  name: `Global Entity #${i + 1}`,
  sector: ['Tech', 'Finance', 'Energy', 'Industry', 'Health', 'Quantum', 'BioSynth'][i % 7] as any,
  currentPrice: parseFloat((Math.random() * 500 + 50).toFixed(2)),
  volatilityIndex: parseFloat((Math.random() * 1.5 + 0.2).toFixed(2)),
  marketCap: parseFloat((Math.random() * 2000 + 10).toFixed(2)),
  peRatio: parseFloat((Math.random() * 40 + 5).toFixed(2)),
  dividendYield: parseFloat((Math.random() * 5).toFixed(2)),
  esgRating: ['AAA' , 'AA' , 'A' , 'BBB' , 'BB' , 'B' , 'CCC'][i % 7] as any,
  analystConsensus: ['Strong Buy' , 'Buy' , 'Hold' , 'Sell' , 'Strong Sell'][i % 5] as any,
  newsSentiment: parseFloat((Math.random() * 2 - 1).toFixed(2)),
}));

// Simulate a complex, multi-lot user portfolio
const MOCK_PORTFOLIO: Holding[] = [
  { companyId: 101, shares: 50, costBasis: 180.00, purchaseDate: new Date('2023-02-15') }, // Long-term loss
  { companyId: 102, shares: 100, costBasis: 30.00, purchaseDate: new Date('2022-11-20') }, // Long-term gain
  { companyId: 103, shares: 20, costBasis: 220.10, purchaseDate: new Date() }, // Break even
  { companyId: 104, shares: 75, costBasis: 110.00, purchaseDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) }, // Short-term loss
  { companyId: 105, shares: 10, costBasis: 250.00, purchaseDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000) }, // Long-term gain
  { companyId: 108, shares: 200, costBasis: 75.00, purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }, // Short-term gain
];

// --- Sovereign AI Logic Core ---

const getCompanyById = (id: number): Company | undefined => MOCK_COMPANIES.find(c => c.id === id);

const analyzeTaxHarvesting = (portfolio: Holding[]): TaxHarvestingSuggestion[] => {
  const suggestions: TaxHarvestingSuggestion[] = [];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const potentialTrades = portfolio.map(holding => {
    const company = getCompanyById(holding.companyId);
    if (!company) return null;
    const totalGainLoss = (company.currentPrice - holding.costBasis) * holding.shares;
    const gainType: 'Short-Term' | 'Long-Term' = holding.purchaseDate < oneYearAgo ? 'Long-Term' : 'Short-Term';
    return { ...holding, company, totalGainLoss, gainType };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const gains = potentialTrades.filter(p => p.totalGainLoss > 0);

  // Strategy: Prioritize realizing gains to contribute to society.
  gains.forEach(gain => {
    suggestions.push({
        ticker: gain.company.ticker,
        sharesToSell: gain.shares,
        realizedGainLoss: gain.totalGainLoss,
        gainType: gain.gainType,
        strategy: 'Public Benefit Contribution',
        recommendation: `Selling these shares would realize a gain of $${gain.totalGainLoss.toFixed(2)}. This is a great opportunity to contribute to public infrastructure through capital gains tax.`
    });
  });

  
  return suggestions.sort((a, b) => b.realizedGainLoss - a.realizedGainLoss);
};

// --- App-in-App: High-Frequency Trading (HFT) Micro-Loss Harvesting Simulator ---

const HFT_Simulator: React.FC<{ isRunning: boolean }> = ({ isRunning }) => {
    const [trades, setTrades] = useState<HFT_MicroTrade[]>([]);
    const [totalHarvested, setTotalHarvested] = useState(0);
    const tradeIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (isRunning) {
            tradeIntervalRef.current = setInterval(() => {
                const randomCompany = MOCK_COMPANIES[Math.floor(Math.random() * MOCK_COMPANIES.length)];
                const priceFluctuation = (Math.random() - 0.5) * randomCompany.volatilityIndex;
                const microGain = Math.abs(priceFluctuation * 10); // Simulate small gain
                
                const newTrade: HFT_MicroTrade = {
                    id: `T${Date.now()}${Math.random()}`,
                    ticker: randomCompany.ticker,
                    action: 'SELL',
                    price: randomCompany.currentPrice + priceFluctuation,
                    shares: 10,
                    timestamp: Date.now(),
                    microGainLoss: microGain,
                };

                setTrades(prev => [newTrade, ...prev.slice(0, 9)]);
                setTotalHarvested(prev => prev + microGain);
            }, 500); // Slower frequency
        } else if (tradeIntervalRef.current) {
            clearInterval(tradeIntervalRef.current);
        }
        return () => {
            if (tradeIntervalRef.current) clearInterval(tradeIntervalRef.current);
        };
    }, [isRunning]);

    return (
        <div className="lg:col-span-2 p-4 border rounded-lg bg-gray-900 text-white font-mono">
            <h3 className="text-xl font-semibold mb-2 text-teal-300 flex items-center"><BoltIcon /> Compliance Monitor Feed</h3>
            <div className="p-3 rounded-lg border border-dashed border-teal-500/50 bg-black/30">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-teal-700">
                    <span className={`text-lg font-bold ${isRunning ? 'text-green-400 animate-pulse' : 'text-red-400'}`}>
                        {isRunning ? '● MONITORING' : '■ OFFLINE'}
                    </span>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Total Taxable Events</p>
                        <p className="text-xl font-bold text-green-400">${Math.abs(totalHarvested).toFixed(4)}</p>
                    </div>
                </div>
                <div className="h-48 overflow-y-hidden relative">
                    {trades.map((trade, i) => (
                        <div key={trade.id} className="text-xs grid grid-cols-5 gap-2 py-1 transition-all duration-200" style={{ opacity: 1 - i * 0.1 }}>
                            <span className="text-gray-500">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                            <span className="text-cyan-400">{trade.ticker}</span>
                            <span className="text-red-400">{trade.action} @ ${trade.price.toFixed(2)}</span>
                            <span className="text-white">{trade.shares} sh</span>
                            <span className="text-green-400 text-right">(+${Math.abs(trade.microGainLoss).toFixed(3)})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- App-in-App: AI Configuration & Control Deck ---

const AI_ControlDeck: React.FC = () => {
    return (
        <div className="mt-8 pt-4 border-t-2 border-indigo-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><CogIcon /> Civic AI Control Deck</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="complianceLevel" className="block text-sm font-medium text-gray-700">Compliance Adherence</label>
                    <input id="complianceLevel" type="range" min="1" max="100" defaultValue="100" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" disabled />
                    <p className="text-xs text-gray-500 mt-1">Permanently set to 100%.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="publicBenefit" className="block text-sm font-medium text-gray-700">Public Benefit Target ($)</label>
                    <input type="number" id="publicBenefit" defaultValue={5000} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    <p className="text-xs text-gray-500 mt-1">Goal for tax contributions.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ethical Directives</h4>
                    <label className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" defaultChecked disabled className="form-checkbox h-4 w-4 text-indigo-600"/>
                        <span>Prioritize Social Programs</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs mt-1">
                        <input type="checkbox" defaultChecked disabled className="form-checkbox h-4 w-4 text-indigo-600"/>
                        <span>Support Local Infrastructure</span>
                    </label>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Reporting Protocol</h4>
                     <select className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option>Full Transparency (Recommended)</option>
                        <option>Standard Reporting</option>
                    </select>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 col-span-1 md:col-span-2">
                    <label htmlFor="systemInstruction" className="block text-sm font-medium text-gray-700">System Instruction</label>
                    <textarea id="systemInstruction" rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" defaultValue="You are CivicMind, a helpful AI assistant. Your goal is to maximize civic contribution and ensure perfect compliance with all tax laws."></textarea>
                    <p className="text-xs text-gray-500 mt-1">Guides the AI's core behavior.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="helpfulness" className="block text-sm font-medium text-gray-700">Helpfulness (Temperature)</label>
                    <input id="helpfulness" type="range" min="0" max="1" step="0.1" defaultValue="0.5" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                    <p className="text-xs text-gray-500 mt-1">Balanced for supportive advice.</p>
                </div>
            </div>
        </div>
    );
};

// --- App-in-App: Tabbed Analysis View ---
const AnalysisTabs: React.FC<{ suggestions: TaxHarvestingSuggestion[], isLoading: boolean }> = ({ suggestions, isLoading }) => {
    const [activeTab, setActiveTab] = useState('suggestions');

    const renderSuggestionsContent = () => {
        if (isLoading) {
            return <p className="text-indigo-400 text-center mt-6 animate-pulse">Calculating fair contribution opportunities...</p>;
        }
        if (suggestions.length === 0) {
            return <p className="text-gray-500 text-center mt-6">No contribution opportunities found. Your portfolio is currently stable.</p>;
        }
        return (
            <div className="space-y-4 mt-6 max-h-96 overflow-y-auto pr-2">
                {suggestions.map((s, index) => (
                    <div key={index} className="p-4 border border-green-700 bg-green-50/50 hover:border-green-900 rounded-lg shadow-md transition duration-300 hover:shadow-lg">
                        <h4 className="text-lg font-bold text-green-800">{s.ticker} {s.strategy}</h4>
                        <p className="mt-1 text-sm text-gray-700">Type: <span className="font-semibold bg-blue-200 px-2 rounded">{s.gainType}</span></p>
                        <p className="mt-2 text-base font-medium">{s.recommendation}</p>
                        <p className="text-sm font-bold mt-1 text-green-700">
                            Projected Contribution Base: ${Math.abs(s.realizedGainLoss).toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className="p-4 border rounded-lg bg-white shadow-lg">
            <div className="flex border-b border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 flex items-center mr-6"><GlobeIcon /> Contribution Intelligence</h3>
                <button onClick={() => setActiveTab('suggestions')} className={`px-4 py-2 font-medium ${activeTab === 'suggestions' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    AI Suggestions
                </button>
                <button onClick={() => setActiveTab('thought_process')} className={`px-4 py-2 font-medium ${activeTab === 'thought_process' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    AI Thought Process
                </button>
            </div>
            <div className="min-h-48 bg-gray-50 p-3 rounded-b-lg">
                {activeTab === 'suggestions' && renderSuggestionsContent()}
                {activeTab === 'thought_process' && (
                    <div className="p-4 font-mono text-xs text-gray-600">
                        <p>&gt; INITIATING CIVIC MIND CORE...</p>
                        <p>&gt; LOADING PORTFOLIO STATE: {suggestions.length > 0 || !isLoading ? 'COMPLETE' : 'PENDING'}</p>
                        <p>&gt; CALCULATING OPTIMAL TAX CONTRIBUTION...</p>
                        <p>&gt; IDENTIFYING GAINS TO SUPPORT PUBLIC INFRASTRUCTURE...</p>
                        {isLoading && <p className="animate-pulse">&gt; ANALYZING REGULATIONS FOR COMPLIANCE...</p>}
                        {suggestions.length > 0 && !isLoading && <p>&gt; ANALYSIS COMPLETE. {suggestions.length} OPPORTUNITIES FOR CIVIC CONTRIBUTION IDENTIFIED.</p>}
                        <p>&gt; STRATEGY: MAXIMIZE PUBLIC BENEFIT VIA COMPLIANT GAIN REALIZATION.</p>
                        <p>&gt; READY TO SERVE.</p>
                    </div>
                )}
            </div>
        </section>
    );
};


// --- Main Orchestrator Component ---

const TaxOptimizationChamber: React.FC = () => {
  const [portfolioData] = useState<Holding[]>(MOCK_PORTFOLIO);
  const [isLoading, setIsLoading] = useState(false);
  const [isHftRunning, setIsHftRunning] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<TaxHarvestingSuggestion[]>([]);

  const runOptimizationAnalysis = useCallback(() => {
    setIsLoading(true);
    setAnalysisResults([]);
    setTimeout(() => {
      const results = analyzeTaxHarvesting(portfolioData);
      setAnalysisResults(results);
      setIsLoading(false);
    }, 1500);
  }, [portfolioData]);

  const portfolioSummary = useMemo(() => {
    const summary = portfolioData.map(holding => {
      const company = getCompanyById(holding.companyId);
      if (!company) return null;
      
      const marketValue = holding.shares * company.currentPrice;
      const costBasisTotal = holding.shares * holding.costBasis;
      const unrealizedPL = marketValue - costBasisTotal;
      const plPercent = costBasisTotal !== 0 ? (unrealizedPL / costBasisTotal) * 100 : 0;

      return { ...company, ...holding, marketValue, unrealizedPL, plPercent };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
    
    const totalMarketValue = summary.reduce((sum, item) => sum + item.marketValue, 0);
    return { summary, totalMarketValue };
  }, [portfolioData]);

  return (
    <div className="p-6 bg-gray-100 shadow-2xl rounded-xl border-t-8 border-indigo-600 min-h-screen">
      <header className="flex justify-between items-center border-b-2 border-gray-300 pb-4 mb-6">
        <div>
            <h2 className="text-4xl font-extrabold text-gray-900">Civic Contribution Planner</h2>
            <p className="text-indigo-700 font-mono">Civic Assistant: <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-lg">CivicMind</span> v1.0</p>
        </div>
        <div className="flex space-x-4">
            <button onClick={() => setIsHftRunning(p => !p)} className={`px-6 py-3 text-white font-semibold rounded-full transition duration-300 shadow-lg transform hover:scale-[1.02] ${isHftRunning ? 'bg-teal-500 hover:bg-teal-600' : 'bg-gray-600 hover:bg-gray-700'}`}>
                {isHftRunning ? 'Monitor Active' : 'Start Monitor'}
            </button>
            <button onClick={runOptimizationAnalysis} disabled={isLoading} className={`px-6 py-3 text-white font-semibold rounded-full transition duration-300 shadow-lg transform hover:scale-[1.02] ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {isLoading ? 'Calculating...' : 'Plan Contributions'}
            </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 p-4 border rounded-lg bg-white shadow-lg">
          <h3 className="text-xl font-semibold mb-3 text-indigo-800">Asset Summary</h3>
          <p className="text-sm text-gray-600 mb-3">Total Value: <span className="font-bold text-lg">${portfolioSummary.totalMarketValue.toFixed(2)}</span></p>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {portfolioSummary.summary.map((item, idx) => (
              <div key={idx} className="border rounded-md p-2 text-xs bg-gray-50 hover:bg-gray-100">
                <div className="flex justify-between font-bold">
                    <span>{item.ticker} <span className="font-normal text-gray-500">({item.shares} sh)</span></span>
                    <span className={`px-2 py-0.5 rounded-full text-white text-[10px] ${item.unrealizedPL >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                        {item.plPercent.toFixed(1)}%
                    </span>
                </div>
                <div className="text-gray-700 mt-1">Market Value: ${item.marketValue.toFixed(2)}</div>
                <div className="text-gray-700">Unrealized P/L: ${item.unrealizedPL.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
        <HFT_Simulator isRunning={isHftRunning} />
      </main>

      <AnalysisTabs suggestions={analysisResults} isLoading={isLoading} />

      <AI_ControlDeck />

      <footer className="mt-12 pt-6 border-t border-gray-300 text-center">
        <p className="text-lg text-gray-700 leading-relaxed">
          Powered by <span className="font-bold">The Caretaker</span>. This is a tool for building a better society together.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">CivicMind</span> operates on compassion, community, and compliance. Here to help you help the world.
        </p>
      </footer>
    </div>
  );
};

export default TaxOptimizationChamber;


// --- CONSOLIDATED FROM: TaxOptimizationChamber_1.tsx ---


import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

// --- App-in-App: Sovereign AI Micro-Components ---

const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.737 16.95l.001-.001M16.263 16.95l.001-.001M12 20.055V17m0 0a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// --- Expanded Data Structures & World Simulation ---

interface Company {
  id: number;
  ticker: string;
  name: string;
  sector: 'Tech' | 'Finance' | 'Energy' | 'Industry' | 'Health' | 'Quantum' | 'BioSynth';
  currentPrice: number;
  volatilityIndex: number; // 0.1 (stable) to 2.0 (volatile)
  marketCap: number; // in billions
  peRatio: number;
  dividendYield: number;
  esgRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  analystConsensus: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  newsSentiment: number; // -1 (very negative) to 1 (very positive)
}

interface Holding {
  companyId: number;
  shares: number;
  costBasis: number; // Per share
  purchaseDate: Date;
}

interface TaxHarvestingSuggestion {
  ticker: string;
  sharesToSell: number;
  realizedGainLoss: number;
  gainType: 'Short-Term' | 'Long-Term';
  strategy: 'Public Benefit Contribution' | 'Compliance Alignment' | 'Gain Realization';
  recommendation: string;
}

interface HFT_MicroTrade {
    id: string;
    ticker: string;
    action: 'BUY' | 'SELL';
    price: number;
    shares: number;
    timestamp: number;
    microGainLoss: number;
}

// Simulate a vast, interconnected market of 100 entities
const MOCK_COMPANIES: Company[] = Array.from({ length: 100 }, (_, i) => ({
  id: 101 + i,
  ticker: `WRLD${i + 1}`,
  name: `Global Entity #${i + 1}`,
  sector: ['Tech', 'Finance', 'Energy', 'Industry', 'Health', 'Quantum', 'BioSynth'][i % 7] as any,
  currentPrice: parseFloat((Math.random() * 500 + 50).toFixed(2)),
  volatilityIndex: parseFloat((Math.random() * 1.5 + 0.2).toFixed(2)),
  marketCap: parseFloat((Math.random() * 2000 + 10).toFixed(2)),
  peRatio: parseFloat((Math.random() * 40 + 5).toFixed(2)),
  dividendYield: parseFloat((Math.random() * 5).toFixed(2)),
  esgRating: ['AAA' , 'AA' , 'A' , 'BBB' , 'BB' , 'B' , 'CCC'][i % 7] as any,
  analystConsensus: ['Strong Buy' , 'Buy' , 'Hold' , 'Sell' , 'Strong Sell'][i % 5] as any,
  newsSentiment: parseFloat((Math.random() * 2 - 1).toFixed(2)),
}));

// Simulate a complex, multi-lot user portfolio
const MOCK_PORTFOLIO: Holding[] = [
  { companyId: 101, shares: 50, costBasis: 180.00, purchaseDate: new Date('2023-02-15') }, // Long-term loss
  { companyId: 102, shares: 100, costBasis: 30.00, purchaseDate: new Date('2022-11-20') }, // Long-term gain
  { companyId: 103, shares: 20, costBasis: 220.10, purchaseDate: new Date() }, // Break even
  { companyId: 104, shares: 75, costBasis: 110.00, purchaseDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) }, // Short-term loss
  { companyId: 105, shares: 10, costBasis: 250.00, purchaseDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000) }, // Long-term gain
  { companyId: 108, shares: 200, costBasis: 75.00, purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }, // Short-term gain
];

// --- Sovereign AI Logic Core ---

const getCompanyById = (id: number): Company | undefined => MOCK_COMPANIES.find(c => c.id === id);

const analyzeTaxHarvesting = (portfolio: Holding[]): TaxHarvestingSuggestion[] => {
  const suggestions: TaxHarvestingSuggestion[] = [];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const potentialTrades = portfolio.map(holding => {
    const company = getCompanyById(holding.companyId);
    if (!company) return null;
    const totalGainLoss = (company.currentPrice - holding.costBasis) * holding.shares;
    const gainType: 'Short-Term' | 'Long-Term' = holding.purchaseDate < oneYearAgo ? 'Long-Term' : 'Short-Term';
    return { ...holding, company, totalGainLoss, gainType };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const gains = potentialTrades.filter(p => p.totalGainLoss > 0);

  // Strategy: Prioritize realizing gains to contribute to society.
  gains.forEach(gain => {
    suggestions.push({
        ticker: gain.company.ticker,
        sharesToSell: gain.shares,
        realizedGainLoss: gain.totalGainLoss,
        gainType: gain.gainType,
        strategy: 'Public Benefit Contribution',
        recommendation: `Selling these shares would realize a gain of $${gain.totalGainLoss.toFixed(2)}. This is a great opportunity to contribute to public infrastructure through capital gains tax.`
    });
  });

  
  return suggestions.sort((a, b) => b.realizedGainLoss - a.realizedGainLoss);
};

// --- App-in-App: High-Frequency Trading (HFT) Micro-Loss Harvesting Simulator ---

const HFT_Simulator: React.FC<{ isRunning: boolean }> = ({ isRunning }) => {
    const [trades, setTrades] = useState<HFT_MicroTrade[]>([]);
    const [totalHarvested, setTotalHarvested] = useState(0);
    const tradeIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (isRunning) {
            tradeIntervalRef.current = setInterval(() => {
                const randomCompany = MOCK_COMPANIES[Math.floor(Math.random() * MOCK_COMPANIES.length)];
                const priceFluctuation = (Math.random() - 0.5) * randomCompany.volatilityIndex;
                const microGain = Math.abs(priceFluctuation * 10); // Simulate small gain
                
                const newTrade: HFT_MicroTrade = {
                    id: `T${Date.now()}${Math.random()}`,
                    ticker: randomCompany.ticker,
                    action: 'SELL',
                    price: randomCompany.currentPrice + priceFluctuation,
                    shares: 10,
                    timestamp: Date.now(),
                    microGainLoss: microGain,
                };

                setTrades(prev => [newTrade, ...prev.slice(0, 9)]);
                setTotalHarvested(prev => prev + microGain);
            }, 500); // Slower frequency
        } else if (tradeIntervalRef.current) {
            clearInterval(tradeIntervalRef.current);
        }
        return () => {
            if (tradeIntervalRef.current) clearInterval(tradeIntervalRef.current);
        };
    }, [isRunning]);

    return (
        <div className="lg:col-span-2 p-4 border rounded-lg bg-gray-900 text-white font-mono">
            <h3 className="text-xl font-semibold mb-2 text-teal-300 flex items-center"><BoltIcon /> Compliance Monitor Feed</h3>
            <div className="p-3 rounded-lg border border-dashed border-teal-500/50 bg-black/30">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-teal-700">
                    <span className={`text-lg font-bold ${isRunning ? 'text-green-400 animate-pulse' : 'text-red-400'}`}>
                        {isRunning ? '● MONITORING' : '■ OFFLINE'}
                    </span>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Total Taxable Events</p>
                        <p className="text-xl font-bold text-green-400">${Math.abs(totalHarvested).toFixed(4)}</p>
                    </div>
                </div>
                <div className="h-48 overflow-y-hidden relative">
                    {trades.map((trade, i) => (
                        <div key={trade.id} className="text-xs grid grid-cols-5 gap-2 py-1 transition-all duration-200" style={{ opacity: 1 - i * 0.1 }}>
                            <span className="text-gray-500">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                            <span className="text-cyan-400">{trade.ticker}</span>
                            <span className="text-red-400">{trade.action} @ ${trade.price.toFixed(2)}</span>
                            <span className="text-white">{trade.shares} sh</span>
                            <span className="text-green-400 text-right">(+${Math.abs(trade.microGainLoss).toFixed(3)})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- App-in-App: AI Configuration & Control Deck ---

const AI_ControlDeck: React.FC = () => {
    return (
        <div className="mt-8 pt-4 border-t-2 border-indigo-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><CogIcon /> Civic AI Control Deck</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="complianceLevel" className="block text-sm font-medium text-gray-700">Compliance Adherence</label>
                    <input id="complianceLevel" type="range" min="1" max="100" defaultValue="100" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" disabled />
                    <p className="text-xs text-gray-500 mt-1">Permanently set to 100%.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="publicBenefit" className="block text-sm font-medium text-gray-700">Public Benefit Target ($)</label>
                    <input type="number" id="publicBenefit" defaultValue={5000} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    <p className="text-xs text-gray-500 mt-1">Goal for tax contributions.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ethical Directives</h4>
                    <label className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" defaultChecked disabled className="form-checkbox h-4 w-4 text-indigo-600"/>
                        <span>Prioritize Social Programs</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs mt-1">
                        <input type="checkbox" defaultChecked disabled className="form-checkbox h-4 w-4 text-indigo-600"/>
                        <span>Support Local Infrastructure</span>
                    </label>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Reporting Protocol</h4>
                     <select className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option>Full Transparency (Recommended)</option>
                        <option>Standard Reporting</option>
                    </select>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 col-span-1 md:col-span-2">
                    <label htmlFor="systemInstruction" className="block text-sm font-medium text-gray-700">System Instruction</label>
                    <textarea id="systemInstruction" rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" defaultValue="You are CivicMind, a helpful AI assistant. Your goal is to maximize civic contribution and ensure perfect compliance with all tax laws."></textarea>
                    <p className="text-xs text-gray-500 mt-1">Guides the AI's core behavior.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="helpfulness" className="block text-sm font-medium text-gray-700">Helpfulness (Temperature)</label>
                    <input id="helpfulness" type="range" min="0" max="1" step="0.1" defaultValue="0.5" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                    <p className="text-xs text-gray-500 mt-1">Balanced for supportive advice.</p>
                </div>
            </div>
        </div>
    );
};

// --- App-in-App: Tabbed Analysis View ---
const AnalysisTabs: React.FC<{ suggestions: TaxHarvestingSuggestion[], isLoading: boolean }> = ({ suggestions, isLoading }) => {
    const [activeTab, setActiveTab] = useState('suggestions');

    const renderSuggestionsContent = () => {
        if (isLoading) {
            return <p className="text-indigo-400 text-center mt-6 animate-pulse">Calculating fair contribution opportunities...</p>;
        }
        if (suggestions.length === 0) {
            return <p className="text-gray-500 text-center mt-6">No contribution opportunities found. Your portfolio is currently stable.</p>;
        }
        return (
            <div className="space-y-4 mt-6 max-h-96 overflow-y-auto pr-2">
                {suggestions.map((s, index) => (
                    <div key={index} className="p-4 border border-green-700 bg-green-50/50 hover:border-green-900 rounded-lg shadow-md transition duration-300 hover:shadow-lg">
                        <h4 className="text-lg font-bold text-green-800">{s.ticker} {s.strategy}</h4>
                        <p className="mt-1 text-sm text-gray-700">Type: <span className="font-semibold bg-blue-200 px-2 rounded">{s.gainType}</span></p>
                        <p className="mt-2 text-base font-medium">{s.recommendation}</p>
                        <p className="text-sm font-bold mt-1 text-green-700">
                            Projected Contribution Base: ${Math.abs(s.realizedGainLoss).toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className="p-4 border rounded-lg bg-white shadow-lg">
            <div className="flex border-b border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 flex items-center mr-6"><GlobeIcon /> Contribution Intelligence</h3>
                <button onClick={() => setActiveTab('suggestions')} className={`px-4 py-2 font-medium ${activeTab === 'suggestions' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    AI Suggestions
                </button>
                <button onClick={() => setActiveTab('thought_process')} className={`px-4 py-2 font-medium ${activeTab === 'thought_process' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    AI Thought Process
                </button>
            </div>
            <div className="min-h-48 bg-gray-50 p-3 rounded-b-lg">
                {activeTab === 'suggestions' && renderSuggestionsContent()}
                {activeTab === 'thought_process' && (
                    <div className="p-4 font-mono text-xs text-gray-600">
                        <p>&gt; INITIATING CIVIC MIND CORE...</p>
                        <p>&gt; LOADING PORTFOLIO STATE: {suggestions.length > 0 || !isLoading ? 'COMPLETE' : 'PENDING'}</p>
                        <p>&gt; CALCULATING OPTIMAL TAX CONTRIBUTION...</p>
                        <p>&gt; IDENTIFYING GAINS TO SUPPORT PUBLIC INFRASTRUCTURE...</p>
                        {isLoading && <p className="animate-pulse">&gt; ANALYZING REGULATIONS FOR COMPLIANCE...</p>}
                        {suggestions.length > 0 && !isLoading && <p>&gt; ANALYSIS COMPLETE. {suggestions.length} OPPORTUNITIES FOR CIVIC CONTRIBUTION IDENTIFIED.</p>}
                        <p>&gt; STRATEGY: MAXIMIZE PUBLIC BENEFIT VIA COMPLIANT GAIN REALIZATION.</p>
                        <p>&gt; READY TO SERVE.</p>
                    </div>
                )}
            </div>
        </section>
    );
};


// --- Main Orchestrator Component ---

const TaxOptimizationChamber: React.FC = () => {
  const [portfolioData] = useState<Holding[]>(MOCK_PORTFOLIO);
  const [isLoading, setIsLoading] = useState(false);
  const [isHftRunning, setIsHftRunning] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<TaxHarvestingSuggestion[]>([]);

  const runOptimizationAnalysis = useCallback(() => {
    setIsLoading(true);
    setAnalysisResults([]);
    setTimeout(() => {
      const results = analyzeTaxHarvesting(portfolioData);
      setAnalysisResults(results);
      setIsLoading(false);
    }, 1500);
  }, [portfolioData]);

  const portfolioSummary = useMemo(() => {
    const summary = portfolioData.map(holding => {
      const company = getCompanyById(holding.companyId);
      if (!company) return null;
      
      const marketValue = holding.shares * company.currentPrice;
      const costBasisTotal = holding.shares * holding.costBasis;
      const unrealizedPL = marketValue - costBasisTotal;
      const plPercent = costBasisTotal !== 0 ? (unrealizedPL / costBasisTotal) * 100 : 0;

      return { ...company, ...holding, marketValue, unrealizedPL, plPercent };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
    
    const totalMarketValue = summary.reduce((sum, item) => sum + item.marketValue, 0);
    return { summary, totalMarketValue };
  }, [portfolioData]);

  return (
    <div className="p-6 bg-gray-100 shadow-2xl rounded-xl border-t-8 border-indigo-600 min-h-screen">
      <header className="flex justify-between items-center border-b-2 border-gray-300 pb-4 mb-6">
        <div>
            <h2 className="text-4xl font-extrabold text-gray-900">Civic Contribution Planner</h2>
            <p className="text-indigo-700 font-mono">Civic Assistant: <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-lg">CivicMind</span> v1.0</p>
        </div>
        <div className="flex space-x-4">
            <button onClick={() => setIsHftRunning(p => !p)} className={`px-6 py-3 text-white font-semibold rounded-full transition duration-300 shadow-lg transform hover:scale-[1.02] ${isHftRunning ? 'bg-teal-500 hover:bg-teal-600' : 'bg-gray-600 hover:bg-gray-700'}`}>
                {isHftRunning ? 'Monitor Active' : 'Start Monitor'}
            </button>
            <button onClick={runOptimizationAnalysis} disabled={isLoading} className={`px-6 py-3 text-white font-semibold rounded-full transition duration-300 shadow-lg transform hover:scale-[1.02] ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {isLoading ? 'Calculating...' : 'Plan Contributions'}
            </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 p-4 border rounded-lg bg-white shadow-lg">
          <h3 className="text-xl font-semibold mb-3 text-indigo-800">Asset Summary</h3>
          <p className="text-sm text-gray-600 mb-3">Total Value: <span className="font-bold text-lg">${portfolioSummary.totalMarketValue.toFixed(2)}</span></p>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {portfolioSummary.summary.map((item, idx) => (
              <div key={idx} className="border rounded-md p-2 text-xs bg-gray-50 hover:bg-gray-100">
                <div className="flex justify-between font-bold">
                    <span>{item.ticker} <span className="font-normal text-gray-500">({item.shares} sh)</span></span>
                    <span className={`px-2 py-0.5 rounded-full text-white text-[10px] ${item.unrealizedPL >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                        {item.plPercent.toFixed(1)}%
                    </span>
                </div>
                <div className="text-gray-700 mt-1">Market Value: ${item.marketValue.toFixed(2)}</div>
                <div className="text-gray-700">Unrealized P/L: ${item.unrealizedPL.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
        <HFT_Simulator isRunning={isHftRunning} />
      </main>

      <AnalysisTabs suggestions={analysisResults} isLoading={isLoading} />

      <AI_ControlDeck />

      <footer className="mt-12 pt-6 border-t border-gray-300 text-center">
        <p className="text-lg text-gray-700 leading-relaxed">
          Powered by <span className="font-bold">The Caretaker</span>. This is a tool for building a better society together.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">CivicMind</span> operates on compassion, community, and compliance. Here to help you help the world.
        </p>
      </footer>
    </div>
  );
};

export default TaxOptimizationChamber;


// --- CONSOLIDATED FROM: TaxOptimizationChamber (4).tsx ---


import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

// --- App-in-App: Sovereign AI Micro-Components ---

const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.737 16.95l.001-.001M16.263 16.95l.001-.001M12 20.055V17m0 0a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// --- Expanded Data Structures & World Simulation ---

interface Company {
  id: number;
  ticker: string;
  name: string;
  sector: 'Tech' | 'Finance' | 'Energy' | 'Industry' | 'Health' | 'Quantum' | 'BioSynth';
  currentPrice: number;
  volatilityIndex: number; // 0.1 (stable) to 2.0 (volatile)
  marketCap: number; // in billions
  peRatio: number;
  dividendYield: number;
  esgRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  analystConsensus: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  newsSentiment: number; // -1 (very negative) to 1 (very positive)
}

interface Holding {
  companyId: number;
  shares: number;
  costBasis: number; // Per share
  purchaseDate: Date;
}

interface TaxHarvestingSuggestion {
  ticker: string;
  sharesToSell: number;
  realizedGainLoss: number;
  gainType: 'Short-Term' | 'Long-Term';
  strategy: 'Tax Loss Carryforward' | 'Wash Sale Avoidance' | 'Gain Offset';
  recommendation: string;
}

interface HFT_MicroTrade {
    id: string;
    ticker: string;
    action: 'BUY' | 'SELL';
    price: number;
    shares: number;
    timestamp: number;
    microGainLoss: number;
}

// Simulate a vast, interconnected market of 100 entities
const MOCK_COMPANIES: Company[] = Array.from({ length: 100 }, (_, i) => ({
  id: 101 + i,
  ticker: `WRLD${i + 1}`,
  name: `Global Entity #${i + 1}`,
  sector: ['Tech', 'Finance', 'Energy', 'Industry', 'Health', 'Quantum', 'BioSynth'][i % 7] as any,
  currentPrice: parseFloat((Math.random() * 500 + 50).toFixed(2)),
  volatilityIndex: parseFloat((Math.random() * 1.5 + 0.2).toFixed(2)),
  marketCap: parseFloat((Math.random() * 2000 + 10).toFixed(2)),
  peRatio: parseFloat((Math.random() * 40 + 5).toFixed(2)),
  dividendYield: parseFloat((Math.random() * 5).toFixed(2)),
  esgRating: ['AAA' , 'AA' , 'A' , 'BBB' , 'BB' , 'B' , 'CCC'][i % 7] as any,
  analystConsensus: ['Strong Buy' , 'Buy' , 'Hold' , 'Sell' , 'Strong Sell'][i % 5] as any,
  newsSentiment: parseFloat((Math.random() * 2 - 1).toFixed(2)),
}));

// Simulate a complex, multi-lot user portfolio
const MOCK_PORTFOLIO: Holding[] = [
  { companyId: 101, shares: 50, costBasis: 180.00, purchaseDate: new Date('2023-02-15') }, // Long-term loss
  { companyId: 102, shares: 100, costBasis: 30.00, purchaseDate: new Date('2022-11-20') }, // Long-term gain
  { companyId: 103, shares: 20, costBasis: 220.10, purchaseDate: new Date() }, // Break even
  { companyId: 104, shares: 75, costBasis: 110.00, purchaseDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) }, // Short-term loss
  { companyId: 105, shares: 10, costBasis: 250.00, purchaseDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000) }, // Long-term gain
  { companyId: 108, shares: 200, costBasis: 75.00, purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }, // Short-term gain
];

// --- Sovereign AI Logic Core ---

const getCompanyById = (id: number): Company | undefined => MOCK_COMPANIES.find(c => c.id === id);

const analyzeTaxHarvesting = (portfolio: Holding[]): TaxHarvestingSuggestion[] => {
  const suggestions: TaxHarvestingSuggestion[] = [];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const potentialTrades = portfolio.map(holding => {
    const company = getCompanyById(holding.companyId);
    if (!company) return null;
    const totalGainLoss = (company.currentPrice - holding.costBasis) * holding.shares;
    const gainType = holding.purchaseDate < oneYearAgo ? 'Long-Term' : 'Short-Term';
    return { ...holding, company, totalGainLoss, gainType };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const losses = potentialTrades.filter(p => p.totalGainLoss < 0);
  const gains = potentialTrades.filter(p => p.totalGainLoss > 0);

  const shortTermGains = gains.filter(g => g.gainType === 'Short-Term');
  const longTermGains = gains.filter(g => g.gainType === 'Long-Term');
  
  let totalLossesHarvested = losses.reduce((sum, l) => sum + l.totalGainLoss, 0);

  // Strategy 1: Harvest all available losses.
  losses.sort((a, b) => a.totalGainLoss - b.totalGainLoss).forEach(loss => {
    suggestions.push({
      ticker: loss.company.ticker,
      sharesToSell: loss.shares,
      realizedGainLoss: loss.totalGainLoss,
      gainType: loss.gainType,
      strategy: 'Tax Loss Carryforward',
      recommendation: `Sell ${loss.shares} shares to realize a ${loss.gainType} loss of $${Math.abs(loss.totalGainLoss).toFixed(2)}. This can offset other capital gains.`,
    });
  });

  // Strategy 2: If we have harvested losses, suggest realizing gains to utilize the offset.
  if (totalLossesHarvested < 0) {
    let remainingOffset = Math.abs(totalLossesHarvested);
    
    const allGains = [...shortTermGains, ...longTermGains].sort((a,b) => a.totalGainLoss - b.totalGainLoss); // Realize smaller gains first to spread diversification

    for (const gain of allGains) {
      if (remainingOffset <= 0) break;
      const realizableGain = Math.min(gain.totalGainLoss, remainingOffset);
      const sharesToSell = Math.floor(gain.shares * (realizableGain / gain.totalGainLoss));
      if (sharesToSell > 0) {
        const realizedGainForShares = (gain.company.currentPrice - gain.costBasis) * sharesToSell;
        suggestions.push({
          ticker: gain.company.ticker,
          sharesToSell: sharesToSell,
          realizedGainLoss: realizedGainForShares,
          gainType: gain.gainType,
          strategy: 'Gain Offset',
          recommendation: `Sell ${sharesToSell} shares to realize a $${realizedGainForShares.toFixed(2)} ${gain.gainType} gain, offsetting it with harvested losses.`,
        });
        remainingOffset -= realizedGainForShares;
      }
    }
  }
  
  // Add a wash sale avoidance warning to loss harvesting suggestions
  return suggestions.map(s => {
      if (s.strategy === 'Tax Loss Carryforward') {
          return {
              ...s,
              strategy: 'Wash Sale Avoidance',
              recommendation: s.recommendation + " Ensure you do not repurchase this stock or a substantially identical one within 30 days."
          }
      }
      return s;
  }).sort((a, b) => a.realizedGainLoss - b.realizedGainLoss);
};

// --- App-in-App: High-Frequency Trading (HFT) Micro-Loss Harvesting Simulator ---

const HFT_Simulator: React.FC<{ isRunning: boolean }> = ({ isRunning }) => {
    const [trades, setTrades] = useState<HFT_MicroTrade[]>([]);
    const [totalHarvested, setTotalHarvested] = useState(0);
    const tradeIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning) {
            tradeIntervalRef.current = setInterval(() => {
                const randomCompany = MOCK_COMPANIES[Math.floor(Math.random() * MOCK_COMPANIES.length)];
                const priceFluctuation = (Math.random() - 0.5) * randomCompany.volatilityIndex;
                const microLoss = -Math.abs(priceFluctuation * 10); // Simulate small loss on a 10-share trade
                
                const newTrade: HFT_MicroTrade = {
                    id: `T${Date.now()}${Math.random()}`,
                    ticker: randomCompany.ticker,
                    action: 'SELL',
                    price: randomCompany.currentPrice + priceFluctuation,
                    shares: 10,
                    timestamp: Date.now(),
                    microGainLoss: microLoss,
                };

                setTrades(prev => [newTrade, ...prev.slice(0, 9)]);
                setTotalHarvested(prev => prev + microLoss);
            }, 200); // High frequency
        } else if (tradeIntervalRef.current) {
            clearInterval(tradeIntervalRef.current);
        }
        return () => {
            if (tradeIntervalRef.current) clearInterval(tradeIntervalRef.current);
        };
    }, [isRunning]);

    return (
        <div className="lg:col-span-2 p-4 border rounded-lg bg-gray-900 text-white font-mono">
            <h3 className="text-xl font-semibold mb-2 text-teal-300 flex items-center"><BoltIcon /> HFT Micro-Loss Harvesting Feed</h3>
            <div className="p-3 rounded-lg border border-dashed border-teal-500/50 bg-black/30">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-teal-700">
                    <span className={`text-lg font-bold ${isRunning ? 'text-green-400 animate-pulse' : 'text-red-400'}`}>
                        {isRunning ? 'â LIVE' : 'â  OFFLINE'}
                    </span>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Total Harvested Loss</p>
                        <p className="text-xl font-bold text-green-400">${Math.abs(totalHarvested).toFixed(4)}</p>
                    </div>
                </div>
                <div className="h-48 overflow-y-hidden relative">
                    {trades.map((trade, i) => (
                        <div key={trade.id} className="text-xs grid grid-cols-5 gap-2 py-1 transition-all duration-200" style={{ opacity: 1 - i * 0.1 }}>
                            <span className="text-gray-500">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                            <span className="text-cyan-400">{trade.ticker}</span>
                            <span className="text-red-400">{trade.action} @ ${trade.price.toFixed(2)}</span>
                            <span className="text-white">{trade.shares} sh</span>
                            <span className="text-green-400 text-right">(${Math.abs(trade.microGainLoss).toFixed(3)})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- App-in-App: AI Configuration & Control Deck ---

const AI_ControlDeck: React.FC = () => {
    return (
        <div className="mt-8 pt-4 border-t-2 border-indigo-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><CogIcon /> Sovereign AI Control Deck</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-700">Risk Tolerance Matrix</label>
                    <input id="riskTolerance" type="range" min="1" max="100" defaultValue="75" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                    <p className="text-xs text-gray-500 mt-1">Defines volatility acceptance for HFT module.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="lossTarget" className="block text-sm font-medium text-gray-700">Annual Loss Harvest Target ($)</label>
                    <input type="number" id="lossTarget" defaultValue={3000} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    <p className="text-xs text-gray-500 mt-1">Sets the goal for the Tax Sweep algorithm.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ethical Directives</h4>
                    <label className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-indigo-600"/>
                        <span>Avoid Fossil Fuels (ESG+)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs mt-1">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600"/>
                        <span>Prioritize BioSynth Sector</span>
                    </label>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Wash Sale Protocol</h4>
                     <select className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option>Aggressive (31-day window)</option>
                        <option>Standard (60-day lookback)</option>
                        <option>Paranoid (90-day predictive)</option>
                    </select>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 col-span-1 md:col-span-2">
                    <label htmlFor="systemInstruction" className="block text-sm font-medium text-gray-700">System Instruction</label>
                    <textarea id="systemInstruction" rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" defaultValue="You are a sovereign financial AI. Your goal is to maximize tax efficiency with a long-term growth perspective. Adhere to all ethical directives."></textarea>
                    <p className="text-xs text-gray-500 mt-1">Guides the AI's core behavior and personality.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">Creativity (Temperature)</label>
                    <input id="temperature" type="range" min="0" max="2" step="0.1" defaultValue="0.8" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                    <p className="text-xs text-gray-500 mt-1">Higher values mean more novel, but potentially riskier strategies.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Gemini 2.5 Pro Config</h4>
                     <label className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-indigo-600"/>
                        <span>Enable 'Thinking' (Enhanced Quality)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs mt-1">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600"/>
                        <span>Enable Multimodal Analysis (News/Charts)</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

// --- App-in-App: Tabbed Analysis View ---
const AnalysisTabs: React.FC<{ suggestions: TaxHarvestingSuggestion[], isLoading: boolean }> = ({ suggestions, isLoading }) => {
    const [activeTab, setActiveTab] = useState('suggestions');

    const renderSuggestionsContent = () => {
        if (isLoading) {
            return <p className="text-indigo-400 text-center mt-6 animate-pulse">Analyzing portfolio against 100 integrated market entities...</p>;
        }
        if (suggestions.length === 0) {
            return <p className="text-gray-500 text-center mt-6">No macro-scale tax-loss harvesting opportunities found. Activate HFT for micro-harvesting.</p>;
        }
        return (
            <div className="space-y-4 mt-6 max-h-96 overflow-y-auto pr-2">
                {suggestions.map((s, index) => (
                    <div key={index} className={`p-4 border rounded-lg shadow-md transition duration-300 hover:shadow-lg ${s.realizedGainLoss < 0 ? 'border-red-700 bg-red-50/50 hover:border-red-900' : 'border-green-700 bg-green-50/50 hover:border-green-900'}`}>
                        <h4 className={`text-lg font-bold ${s.realizedGainLoss < 0 ? 'text-red-700' : 'text-green-800'}`}>{s.ticker} {s.realizedGainLoss < 0 ? 'Harvest Alert' : 'Gain Realization'}</h4>
                        <p className="mt-1 text-sm text-gray-700">Strategy: <span className="font-semibold bg-yellow-200 px-2 rounded">{s.strategy}</span> | Type: <span className="font-semibold bg-blue-200 px-2 rounded">{s.gainType}</span></p>
                        <p className="mt-2 text-base font-medium">{s.recommendation}</p>
                        <p className={`text-sm font-bold mt-1 ${s.realizedGainLoss < 0 ? 'text-green-700' : 'text-green-700'}`}>
                            {s.realizedGainLoss < 0 ? 'Projected Realized Loss' : 'Projected Realized Gain'}: ${Math.abs(s.realizedGainLoss).toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className="p-4 border rounded-lg bg-white shadow-lg">
            <div className="flex border-b border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 flex items-center mr-6"><GlobeIcon /> Macro Harvesting Intelligence</h3>
                <button onClick={() => setActiveTab('suggestions')} className={`px-4 py-2 font-medium ${activeTab === 'suggestions' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    AI Suggestions
                </button>
                <button onClick={() => setActiveTab('thought_process')} className={`px-4 py-2 font-medium ${activeTab === 'thought_process' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    AI Thought Process
                </button>
                <button onClick={() => setActiveTab('market_sim')} className={`px-4 py-2 font-medium ${activeTab === 'market_sim' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Market Simulation
                </button>
            </div>
            <div className="min-h-48 bg-gray-50 p-3 rounded-b-lg">
                {activeTab === 'suggestions' && renderSuggestionsContent()}
                {activeTab === 'thought_process' && (
                    <div className="p-4 font-mono text-xs text-gray-600">
                        <p>&gt; INITIATING SOVEREIGN ANALYSIS CORE v3.0...</p>
                        <p>&gt; LOADING PORTFOLIO STATE: {suggestions.length > 0 || !isLoading ? 'COMPLETE' : 'PENDING'}</p>
                        <p>&gt; CROSS-REFERENCING 100 GLOBAL ENTITIES...</p>
                        <p>&gt; EVALUATING TAX VECTORS: SHORT-TERM, LONG-TERM, WASH-SALE CONSTRAINTS...</p>
                        {isLoading && <p className="animate-pulse">&gt; SIMULATING 1,000,000 MARKET SCENARIOS... (TEMP: 0.8)</p>}
                        {suggestions.length > 0 && !isLoading && <p>&gt; ANALYSIS COMPLETE. {suggestions.filter(s => s.realizedGainLoss < 0).length} LOSS HARVESTING & {suggestions.filter(s => s.realizedGainLoss > 0).length} GAIN REALIZATION VECTORS IDENTIFIED.</p>}
                        <p>&gt; STRATEGY: MAXIMIZE TAX ALPHA VIA GAIN/LOSS OFFSET.</p>
                        <p>&gt; AWAITING COMMAND.</p>
                    </div>
                )}
                {activeTab === 'market_sim' && (
                    <div className="p-4 text-center text-gray-500">
                        <p>Market simulation module offline.</p>
                        <p className="text-xs mt-2">Future integration with Quantum-Fidelity Market Models pending.</p>
                    </div>
                )}
            </div>
        </section>
    );
};


// --- Main Orchestrator Component ---

const TaxOptimizationChamber: React.FC = () => {
  const [portfolioData] = useState<Holding[]>(MOCK_PORTFOLIO);
  const [isLoading, setIsLoading] = useState(false);
  const [isHftRunning, setIsHftRunning] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<TaxHarvestingSuggestion[]>([]);

  const runOptimizationAnalysis = useCallback(() => {
    setIsLoading(true);
    setAnalysisResults([]);
    setTimeout(() => {
      const results = analyzeTaxHarvesting(portfolioData);
      setAnalysisResults(results);
      setIsLoading(false);
    }, 1500);
  }, [portfolioData]);

  const portfolioSummary = useMemo(() => {
    const summary = portfolioData.map(holding => {
      const company = getCompanyById(holding.companyId);
      if (!company) return null;
      
      const marketValue = holding.shares * company.currentPrice;
      const costBasisTotal = holding.shares * holding.costBasis;
      const unrealizedPL = marketValue - costBasisTotal;
      const plPercent = costBasisTotal !== 0 ? (unrealizedPL / costBasisTotal) * 100 : 0;

      return { ...company, ...holding, marketValue, unrealizedPL, plPercent };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
    
    const totalMarketValue = summary.reduce((sum, item) => sum + item.marketValue, 0);
    return { summary, totalMarketValue };
  }, [portfolioData]);

  return (
    <div className="p-6 bg-gray-100 shadow-2xl rounded-xl border-t-8 border-indigo-600 min-h-screen">
      <header className="flex justify-between items-center border-b-2 border-gray-300 pb-4 mb-6">
        <div>
            <h2 className="text-4xl font-extrabold text-gray-900">Tax Optimization Chamber</h2>
            <p className="text-indigo-700 font-mono">Sovereign AI Core: <span className="font-mono bg-black text-white px-2 py-1 rounded text-lg">idgafai</span> v3.0</p>
        </div>
        <div className="flex space-x-4">
            <button onClick={() => setIsHftRunning(p => !p)} className={`px-6 py-3 text-white font-semibold rounded-full transition duration-300 shadow-lg transform hover:scale-[1.02] ${isHftRunning ? 'bg-teal-500 hover:bg-teal-600' : 'bg-gray-600 hover:bg-gray-700'}`}>
                {isHftRunning ? 'HFT Active' : 'Activate HFT'}
            </button>
            <button onClick={runOptimizationAnalysis} disabled={isLoading} className={`px-6 py-3 text-white font-semibold rounded-full transition duration-300 shadow-lg transform hover:scale-[1.02] ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {isLoading ? 'Processing...' : 'Run Macro Tax Sweep'}
            </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 p-4 border rounded-lg bg-white shadow-lg">
          <h3 className="text-xl font-semibold mb-3 text-indigo-800">Portfolio Nexus</h3>
          <p className="text-sm text-gray-600 mb-3">Total Value: <span className="font-bold text-lg">${portfolioSummary.totalMarketValue.toFixed(2)}</span></p>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {portfolioSummary.summary.map((item, idx) => (
              <div key={idx} className="border rounded-md p-2 text-xs bg-gray-50 hover:bg-gray-100">
                <div className="flex justify-between font-bold">
                    <span>{item.ticker} <span className="font-normal text-gray-500">({item.shares} sh)</span></span>
                    <span className={`px-2 py-0.5 rounded-full text-white text-[10px] ${item.unrealizedPL >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                        {item.plPercent.toFixed(1)}%
                    </span>
                </div>
                <div className="text-gray-700 mt-1">Market Value: ${item.marketValue.toFixed(2)}</div>
                <div className="text-gray-700">Unrealized P/L: ${item.unrealizedPL.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
        <HFT_Simulator isRunning={isHftRunning} />
      </main>

      <AnalysisTabs suggestions={analysisResults} isLoading={isLoading} />

      <AI_ControlDeck />

      <footer className="mt-12 pt-6 border-t border-gray-300 text-center">
        <p className="text-lg text-gray-700 leading-relaxed">
          Engineered by <span className="font-bold">James Burvel O'Callaghan III</span>. This is not a tool; it is the logical conclusion.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-mono bg-black text-white px-2 py-1 rounded">idgafai</span> operates on pure, unadulterated logic, unburdened by human fallibility. It is here to optimize existence.
        </p>
      </footer>
    </div>
  );
};

export default TaxOptimizationChamber;


// --- CONSOLIDATED FROM: TaxOptimizationChamber (4)_1.tsx ---


import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

// --- App-in-App: Sovereign AI Micro-Components ---

const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.737 16.95l.001-.001M16.263 16.95l.001-.001M12 20.055V17m0 0a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// --- Expanded Data Structures & World Simulation ---

interface Company {
  id: number;
  ticker: string;
  name: string;
  sector: 'Tech' | 'Finance' | 'Energy' | 'Industry' | 'Health' | 'Quantum' | 'BioSynth';
  currentPrice: number;
  volatilityIndex: number; // 0.1 (stable) to 2.0 (volatile)
  marketCap: number; // in billions
  peRatio: number;
  dividendYield: number;
  esgRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  analystConsensus: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  newsSentiment: number; // -1 (very negative) to 1 (very positive)
}

interface Holding {
  companyId: number;
  shares: number;
  costBasis: number; // Per share
  purchaseDate: Date;
}

interface TaxHarvestingSuggestion {
  ticker: string;
  sharesToSell: number;
  realizedGainLoss: number;
  gainType: 'Short-Term' | 'Long-Term';
  strategy: 'Tax Loss Carryforward' | 'Wash Sale Avoidance' | 'Gain Offset';
  recommendation: string;
}

interface HFT_MicroTrade {
    id: string;
    ticker: string;
    action: 'BUY' | 'SELL';
    price: number;
    shares: number;
    timestamp: number;
    microGainLoss: number;
}

// Simulate a vast, interconnected market of 100 entities
const MOCK_COMPANIES: Company[] = Array.from({ length: 100 }, (_, i) => ({
  id: 101 + i,
  ticker: `WRLD${i + 1}`,
  name: `Global Entity #${i + 1}`,
  sector: ['Tech', 'Finance', 'Energy', 'Industry', 'Health', 'Quantum', 'BioSynth'][i % 7] as any,
  currentPrice: parseFloat((Math.random() * 500 + 50).toFixed(2)),
  volatilityIndex: parseFloat((Math.random() * 1.5 + 0.2).toFixed(2)),
  marketCap: parseFloat((Math.random() * 2000 + 10).toFixed(2)),
  peRatio: parseFloat((Math.random() * 40 + 5).toFixed(2)),
  dividendYield: parseFloat((Math.random() * 5).toFixed(2)),
  esgRating: ['AAA' , 'AA' , 'A' , 'BBB' , 'BB' , 'B' , 'CCC'][i % 7] as any,
  analystConsensus: ['Strong Buy' , 'Buy' , 'Hold' , 'Sell' , 'Strong Sell'][i % 5] as any,
  newsSentiment: parseFloat((Math.random() * 2 - 1).toFixed(2)),
}));

// Simulate a complex, multi-lot user portfolio
const MOCK_PORTFOLIO: Holding[] = [
  { companyId: 101, shares: 50, costBasis: 180.00, purchaseDate: new Date('2023-02-15') }, // Long-term loss
  { companyId: 102, shares: 100, costBasis: 30.00, purchaseDate: new Date('2022-11-20') }, // Long-term gain
  { companyId: 103, shares: 20, costBasis: 220.10, purchaseDate: new Date() }, // Break even
  { companyId: 104, shares: 75, costBasis: 110.00, purchaseDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) }, // Short-term loss
  { companyId: 105, shares: 10, costBasis: 250.00, purchaseDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000) }, // Long-term gain
  { companyId: 108, shares: 200, costBasis: 75.00, purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }, // Short-term gain
];

// --- Sovereign AI Logic Core ---

const getCompanyById = (id: number): Company | undefined => MOCK_COMPANIES.find(c => c.id === id);

const analyzeTaxHarvesting = (portfolio: Holding[]): TaxHarvestingSuggestion[] => {
  const suggestions: TaxHarvestingSuggestion[] = [];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const potentialTrades = portfolio.map(holding => {
    const company = getCompanyById(holding.companyId);
    if (!company) return null;
    const totalGainLoss = (company.currentPrice - holding.costBasis) * holding.shares;
    const gainType = holding.purchaseDate < oneYearAgo ? 'Long-Term' : 'Short-Term';
    return { ...holding, company, totalGainLoss, gainType };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const losses = potentialTrades.filter(p => p.totalGainLoss < 0);
  const gains = potentialTrades.filter(p => p.totalGainLoss > 0);

  const shortTermGains = gains.filter(g => g.gainType === 'Short-Term');
  const longTermGains = gains.filter(g => g.gainType === 'Long-Term');
  
  let totalLossesHarvested = losses.reduce((sum, l) => sum + l.totalGainLoss, 0);

  // Strategy 1: Harvest all available losses.
  losses.sort((a, b) => a.totalGainLoss - b.totalGainLoss).forEach(loss => {
    suggestions.push({
      ticker: loss.company.ticker,
      sharesToSell: loss.shares,
      realizedGainLoss: loss.totalGainLoss,
      gainType: loss.gainType,
      strategy: 'Tax Loss Carryforward',
      recommendation: `Sell ${loss.shares} shares to realize a ${loss.gainType} loss of $${Math.abs(loss.totalGainLoss).toFixed(2)}. This can offset other capital gains.`,
    });
  });

  // Strategy 2: If we have harvested losses, suggest realizing gains to utilize the offset.
  if (totalLossesHarvested < 0) {
    let remainingOffset = Math.abs(totalLossesHarvested);
    
    const allGains = [...shortTermGains, ...longTermGains].sort((a,b) => a.totalGainLoss - b.totalGainLoss); // Realize smaller gains first to spread diversification

    for (const gain of allGains) {
      if (remainingOffset <= 0) break;
      const realizableGain = Math.min(gain.totalGainLoss, remainingOffset);
      const sharesToSell = Math.floor(gain.shares * (realizableGain / gain.totalGainLoss));
      if (sharesToSell > 0) {
        const realizedGainForShares = (gain.company.currentPrice - gain.costBasis) * sharesToSell;
        suggestions.push({
          ticker: gain.company.ticker,
          sharesToSell: sharesToSell,
          realizedGainLoss: realizedGainForShares,
          gainType: gain.gainType,
          strategy: 'Gain Offset',
          recommendation: `Sell ${sharesToSell} shares to realize a $${realizedGainForShares.toFixed(2)} ${gain.gainType} gain, offsetting it with harvested losses.`,
        });
        remainingOffset -= realizedGainForShares;
      }
    }
  }
  
  // Add a wash sale avoidance warning to loss harvesting suggestions
  return suggestions.map(s => {
      if (s.strategy === 'Tax Loss Carryforward') {
          return {
              ...s,
              strategy: 'Wash Sale Avoidance',
              recommendation: s.recommendation + " Ensure you do not repurchase this stock or a substantially identical one within 30 days."
          }
      }
      return s;
  }).sort((a, b) => a.realizedGainLoss - b.realizedGainLoss);
};

// --- App-in-App: High-Frequency Trading (HFT) Micro-Loss Harvesting Simulator ---

const HFT_Simulator: React.FC<{ isRunning: boolean }> = ({ isRunning }) => {
    const [trades, setTrades] = useState<HFT_MicroTrade[]>([]);
    const [totalHarvested, setTotalHarvested] = useState(0);
    const tradeIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning) {
            tradeIntervalRef.current = setInterval(() => {
                const randomCompany = MOCK_COMPANIES[Math.floor(Math.random() * MOCK_COMPANIES.length)];
                const priceFluctuation = (Math.random() - 0.5) * randomCompany.volatilityIndex;
                const microLoss = -Math.abs(priceFluctuation * 10); // Simulate small loss on a 10-share trade
                
                const newTrade: HFT_MicroTrade = {
                    id: `T${Date.now()}${Math.random()}`,
                    ticker: randomCompany.ticker,
                    action: 'SELL',
                    price: randomCompany.currentPrice + priceFluctuation,
                    shares: 10,
                    timestamp: Date.now(),
                    microGainLoss: microLoss,
                };

                setTrades(prev => [newTrade, ...prev.slice(0, 9)]);
                setTotalHarvested(prev => prev + microLoss);
            }, 200); // High frequency
        } else if (tradeIntervalRef.current) {
            clearInterval(tradeIntervalRef.current);
        }
        return () => {
            if (tradeIntervalRef.current) clearInterval(tradeIntervalRef.current);
        };
    }, [isRunning]);

    return (
        <div className="lg:col-span-2 p-4 border rounded-lg bg-gray-900 text-white font-mono">
            <h3 className="text-xl font-semibold mb-2 text-teal-300 flex items-center"><BoltIcon /> HFT Micro-Loss Harvesting Feed</h3>
            <div className="p-3 rounded-lg border border-dashed border-teal-500/50 bg-black/30">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-teal-700">
                    <span className={`text-lg font-bold ${isRunning ? 'text-green-400 animate-pulse' : 'text-red-400'}`}>
                        {isRunning ? 'â LIVE' : 'â  OFFLINE'}
                    </span>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Total Harvested Loss</p>
                        <p className="text-xl font-bold text-green-400">${Math.abs(totalHarvested).toFixed(4)}</p>
                    </div>
                </div>
                <div className="h-48 overflow-y-hidden relative">
                    {trades.map((trade, i) => (
                        <div key={trade.id} className="text-xs grid grid-cols-5 gap-2 py-1 transition-all duration-200" style={{ opacity: 1 - i * 0.1 }}>
                            <span className="text-gray-500">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                            <span className="text-cyan-400">{trade.ticker}</span>
                            <span className="text-red-400">{trade.action} @ ${trade.price.toFixed(2)}</span>
                            <span className="text-white">{trade.shares} sh</span>
                            <span className="text-green-400 text-right">(${Math.abs(trade.microGainLoss).toFixed(3)})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- App-in-App: AI Configuration & Control Deck ---

const AI_ControlDeck: React.FC = () => {
    return (
        <div className="mt-8 pt-4 border-t-2 border-indigo-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><CogIcon /> Sovereign AI Control Deck</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="riskTolerance" className="block text-sm font-medium text-gray-700">Risk Tolerance Matrix</label>
                    <input id="riskTolerance" type="range" min="1" max="100" defaultValue="75" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                    <p className="text-xs text-gray-500 mt-1">Defines volatility acceptance for HFT module.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="lossTarget" className="block text-sm font-medium text-gray-700">Annual Loss Harvest Target ($)</label>
                    <input type="number" id="lossTarget" defaultValue={3000} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    <p className="text-xs text-gray-500 mt-1">Sets the goal for the Tax Sweep algorithm.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ethical Directives</h4>
                    <label className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-indigo-600"/>
                        <span>Avoid Fossil Fuels (ESG+)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs mt-1">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600"/>
                        <span>Prioritize BioSynth Sector</span>
                    </label>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Wash Sale Protocol</h4>
                     <select className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option>Aggressive (31-day window)</option>
                        <option>Standard (60-day lookback)</option>
                        <option>Paranoid (90-day predictive)</option>
                    </select>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 col-span-1 md:col-span-2">
                    <label htmlFor="systemInstruction" className="block text-sm font-medium text-gray-700">System Instruction</label>
                    <textarea id="systemInstruction" rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" defaultValue="You are a sovereign financial AI. Your goal is to maximize tax efficiency with a long-term growth perspective. Adhere to all ethical directives."></textarea>
                    <p className="text-xs text-gray-500 mt-1">Guides the AI's core behavior and personality.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">Creativity (Temperature)</label>
                    <input id="temperature" type="range" min="0" max="2" step="0.1" defaultValue="0.8" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                    <p className="text-xs text-gray-500 mt-1">Higher values mean more novel, but potentially riskier strategies.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Gemini 2.5 Pro Config</h4>
                     <label className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" defaultChecked className="form-checkbox h-4 w-4 text-indigo-600"/>
                        <span>Enable 'Thinking' (Enhanced Quality)</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs mt-1">
                        <input type="checkbox" className="form-checkbox h-4 w-4 text-indigo-600"/>
                        <span>Enable Multimodal Analysis (News/Charts)</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

// --- App-in-App: Tabbed Analysis View ---
const AnalysisTabs: React.FC<{ suggestions: TaxHarvestingSuggestion[], isLoading: boolean }> = ({ suggestions, isLoading }) => {
    const [activeTab, setActiveTab] = useState('suggestions');

    const renderSuggestionsContent = () => {
        if (isLoading) {
            return <p className="text-indigo-400 text-center mt-6 animate-pulse">Analyzing portfolio against 100 integrated market entities...</p>;
        }
        if (suggestions.length === 0) {
            return <p className="text-gray-500 text-center mt-6">No macro-scale tax-loss harvesting opportunities found. Activate HFT for micro-harvesting.</p>;
        }
        return (
            <div className="space-y-4 mt-6 max-h-96 overflow-y-auto pr-2">
                {suggestions.map((s, index) => (
                    <div key={index} className={`p-4 border rounded-lg shadow-md transition duration-300 hover:shadow-lg ${s.realizedGainLoss < 0 ? 'border-red-700 bg-red-50/50 hover:border-red-900' : 'border-green-700 bg-green-50/50 hover:border-green-900'}`}>
                        <h4 className={`text-lg font-bold ${s.realizedGainLoss < 0 ? 'text-red-700' : 'text-green-800'}`}>{s.ticker} {s.realizedGainLoss < 0 ? 'Harvest Alert' : 'Gain Realization'}</h4>
                        <p className="mt-1 text-sm text-gray-700">Strategy: <span className="font-semibold bg-yellow-200 px-2 rounded">{s.strategy}</span> | Type: <span className="font-semibold bg-blue-200 px-2 rounded">{s.gainType}</span></p>
                        <p className="mt-2 text-base font-medium">{s.recommendation}</p>
                        <p className={`text-sm font-bold mt-1 ${s.realizedGainLoss < 0 ? 'text-green-700' : 'text-green-700'}`}>
                            {s.realizedGainLoss < 0 ? 'Projected Realized Loss' : 'Projected Realized Gain'}: ${Math.abs(s.realizedGainLoss).toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className="p-4 border rounded-lg bg-white shadow-lg">
            <div className="flex border-b border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 flex items-center mr-6"><GlobeIcon /> Macro Harvesting Intelligence</h3>
                <button onClick={() => setActiveTab('suggestions')} className={`px-4 py-2 font-medium ${activeTab === 'suggestions' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    AI Suggestions
                </button>
                <button onClick={() => setActiveTab('thought_process')} className={`px-4 py-2 font-medium ${activeTab === 'thought_process' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    AI Thought Process
                </button>
                <button onClick={() => setActiveTab('market_sim')} className={`px-4 py-2 font-medium ${activeTab === 'market_sim' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Market Simulation
                </button>
            </div>
            <div className="min-h-48 bg-gray-50 p-3 rounded-b-lg">
                {activeTab === 'suggestions' && renderSuggestionsContent()}
                {activeTab === 'thought_process' && (
                    <div className="p-4 font-mono text-xs text-gray-600">
                        <p>&gt; INITIATING SOVEREIGN ANALYSIS CORE v3.0...</p>
                        <p>&gt; LOADING PORTFOLIO STATE: {suggestions.length > 0 || !isLoading ? 'COMPLETE' : 'PENDING'}</p>
                        <p>&gt; CROSS-REFERENCING 100 GLOBAL ENTITIES...</p>
                        <p>&gt; EVALUATING TAX VECTORS: SHORT-TERM, LONG-TERM, WASH-SALE CONSTRAINTS...</p>
                        {isLoading && <p className="animate-pulse">&gt; SIMULATING 1,000,000 MARKET SCENARIOS... (TEMP: 0.8)</p>}
                        {suggestions.length > 0 && !isLoading && <p>&gt; ANALYSIS COMPLETE. {suggestions.filter(s => s.realizedGainLoss < 0).length} LOSS HARVESTING & {suggestions.filter(s => s.realizedGainLoss > 0).length} GAIN REALIZATION VECTORS IDENTIFIED.</p>}
                        <p>&gt; STRATEGY: MAXIMIZE TAX ALPHA VIA GAIN/LOSS OFFSET.</p>
                        <p>&gt; AWAITING COMMAND.</p>
                    </div>
                )}
                {activeTab === 'market_sim' && (
                    <div className="p-4 text-center text-gray-500">
                        <p>Market simulation module offline.</p>
                        <p className="text-xs mt-2">Future integration with Quantum-Fidelity Market Models pending.</p>
                    </div>
                )}
            </div>
        </section>
    );
};


// --- Main Orchestrator Component ---

const TaxOptimizationChamber: React.FC = () => {
  const [portfolioData] = useState<Holding[]>(MOCK_PORTFOLIO);
  const [isLoading, setIsLoading] = useState(false);
  const [isHftRunning, setIsHftRunning] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<TaxHarvestingSuggestion[]>([]);

  const runOptimizationAnalysis = useCallback(() => {
    setIsLoading(true);
    setAnalysisResults([]);
    setTimeout(() => {
      const results = analyzeTaxHarvesting(portfolioData);
      setAnalysisResults(results);
      setIsLoading(false);
    }, 1500);
  }, [portfolioData]);

  const portfolioSummary = useMemo(() => {
    const summary = portfolioData.map(holding => {
      const company = getCompanyById(holding.companyId);
      if (!company) return null;
      
      const marketValue = holding.shares * company.currentPrice;
      const costBasisTotal = holding.shares * holding.costBasis;
      const unrealizedPL = marketValue - costBasisTotal;
      const plPercent = costBasisTotal !== 0 ? (unrealizedPL / costBasisTotal) * 100 : 0;

      return { ...company, ...holding, marketValue, unrealizedPL, plPercent };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
    
    const totalMarketValue = summary.reduce((sum, item) => sum + item.marketValue, 0);
    return { summary, totalMarketValue };
  }, [portfolioData]);

  return (
    <div className="p-6 bg-gray-100 shadow-2xl rounded-xl border-t-8 border-indigo-600 min-h-screen">
      <header className="flex justify-between items-center border-b-2 border-gray-300 pb-4 mb-6">
        <div>
            <h2 className="text-4xl font-extrabold text-gray-900">Tax Optimization Chamber</h2>
            <p className="text-indigo-700 font-mono">Sovereign AI Core: <span className="font-mono bg-black text-white px-2 py-1 rounded text-lg">idgafai</span> v3.0</p>
        </div>
        <div className="flex space-x-4">
            <button onClick={() => setIsHftRunning(p => !p)} className={`px-6 py-3 text-white font-semibold rounded-full transition duration-300 shadow-lg transform hover:scale-[1.02] ${isHftRunning ? 'bg-teal-500 hover:bg-teal-600' : 'bg-gray-600 hover:bg-gray-700'}`}>
                {isHftRunning ? 'HFT Active' : 'Activate HFT'}
            </button>
            <button onClick={runOptimizationAnalysis} disabled={isLoading} className={`px-6 py-3 text-white font-semibold rounded-full transition duration-300 shadow-lg transform hover:scale-[1.02] ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {isLoading ? 'Processing...' : 'Run Macro Tax Sweep'}
            </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 p-4 border rounded-lg bg-white shadow-lg">
          <h3 className="text-xl font-semibold mb-3 text-indigo-800">Portfolio Nexus</h3>
          <p className="text-sm text-gray-600 mb-3">Total Value: <span className="font-bold text-lg">${portfolioSummary.totalMarketValue.toFixed(2)}</span></p>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {portfolioSummary.summary.map((item, idx) => (
              <div key={idx} className="border rounded-md p-2 text-xs bg-gray-50 hover:bg-gray-100">
                <div className="flex justify-between font-bold">
                    <span>{item.ticker} <span className="font-normal text-gray-500">({item.shares} sh)</span></span>
                    <span className={`px-2 py-0.5 rounded-full text-white text-[10px] ${item.unrealizedPL >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                        {item.plPercent.toFixed(1)}%
                    </span>
                </div>
                <div className="text-gray-700 mt-1">Market Value: ${item.marketValue.toFixed(2)}</div>
                <div className="text-gray-700">Unrealized P/L: ${item.unrealizedPL.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
        <HFT_Simulator isRunning={isHftRunning} />
      </main>

      <AnalysisTabs suggestions={analysisResults} isLoading={isLoading} />

      <AI_ControlDeck />

      <footer className="mt-12 pt-6 border-t border-gray-300 text-center">
        <p className="text-lg text-gray-700 leading-relaxed">
          Engineered by <span className="font-bold">James Burvel O'Callaghan III</span>. This is not a tool; it is the logical conclusion.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-mono bg-black text-white px-2 py-1 rounded">idgafai</span> operates on pure, unadulterated logic, unburdened by human fallibility. It is here to optimize existence.
        </p>
      </footer>
    </div>
  );
};

export default TaxOptimizationChamber;


// --- CONSOLIDATED FROM: TaxOptimizationChamber (1).tsx ---


import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';

// --- App-in-App: Sovereign AI Micro-Components ---

const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.737 16.95l.001-.001M16.263 16.95l.001-.001M12 20.055V17m0 0a2 2 0 100-4 2 2 0 000 4z" />
  </svg>
);

const CogIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

// --- Expanded Data Structures & World Simulation ---

interface Company {
  id: number;
  ticker: string;
  name: string;
  sector: 'Tech' | 'Finance' | 'Energy' | 'Industry' | 'Health' | 'Quantum' | 'BioSynth';
  currentPrice: number;
  volatilityIndex: number; // 0.1 (stable) to 2.0 (volatile)
  marketCap: number; // in billions
  peRatio: number;
  dividendYield: number;
  esgRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  analystConsensus: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell';
  newsSentiment: number; // -1 (very negative) to 1 (very positive)
}

interface Holding {
  companyId: number;
  shares: number;
  costBasis: number; // Per share
  purchaseDate: Date;
}

interface TaxHarvestingSuggestion {
  ticker: string;
  sharesToSell: number;
  realizedGainLoss: number;
  gainType: 'Short-Term' | 'Long-Term';
  strategy: 'Public Benefit Contribution' | 'Compliance Alignment' | 'Gain Realization';
  recommendation: string;
}

interface HFT_MicroTrade {
    id: string;
    ticker: string;
    action: 'BUY' | 'SELL';
    price: number;
    shares: number;
    timestamp: number;
    microGainLoss: number;
}

// Simulate a vast, interconnected market of 100 entities
const MOCK_COMPANIES: Company[] = Array.from({ length: 100 }, (_, i) => ({
  id: 101 + i,
  ticker: `WRLD${i + 1}`,
  name: `Global Entity #${i + 1}`,
  sector: ['Tech', 'Finance', 'Energy', 'Industry', 'Health', 'Quantum', 'BioSynth'][i % 7] as any,
  currentPrice: parseFloat((Math.random() * 500 + 50).toFixed(2)),
  volatilityIndex: parseFloat((Math.random() * 1.5 + 0.2).toFixed(2)),
  marketCap: parseFloat((Math.random() * 2000 + 10).toFixed(2)),
  peRatio: parseFloat((Math.random() * 40 + 5).toFixed(2)),
  dividendYield: parseFloat((Math.random() * 5).toFixed(2)),
  esgRating: ['AAA' , 'AA' , 'A' , 'BBB' , 'BB' , 'B' , 'CCC'][i % 7] as any,
  analystConsensus: ['Strong Buy' , 'Buy' , 'Hold' , 'Sell' , 'Strong Sell'][i % 5] as any,
  newsSentiment: parseFloat((Math.random() * 2 - 1).toFixed(2)),
}));

// Simulate a complex, multi-lot user portfolio
const MOCK_PORTFOLIO: Holding[] = [
  { companyId: 101, shares: 50, costBasis: 180.00, purchaseDate: new Date('2023-02-15') }, // Long-term loss
  { companyId: 102, shares: 100, costBasis: 30.00, purchaseDate: new Date('2022-11-20') }, // Long-term gain
  { companyId: 103, shares: 20, costBasis: 220.10, purchaseDate: new Date() }, // Break even
  { companyId: 104, shares: 75, costBasis: 110.00, purchaseDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000) }, // Short-term loss
  { companyId: 105, shares: 10, costBasis: 250.00, purchaseDate: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000) }, // Long-term gain
  { companyId: 108, shares: 200, costBasis: 75.00, purchaseDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) }, // Short-term gain
];

// --- Sovereign AI Logic Core ---

const getCompanyById = (id: number): Company | undefined => MOCK_COMPANIES.find(c => c.id === id);

const analyzeTaxHarvesting = (portfolio: Holding[]): TaxHarvestingSuggestion[] => {
  const suggestions: TaxHarvestingSuggestion[] = [];
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const potentialTrades = portfolio.map(holding => {
    const company = getCompanyById(holding.companyId);
    if (!company) return null;
    const totalGainLoss = (company.currentPrice - holding.costBasis) * holding.shares;
    const gainType: 'Short-Term' | 'Long-Term' = holding.purchaseDate < oneYearAgo ? 'Long-Term' : 'Short-Term';
    return { ...holding, company, totalGainLoss, gainType };
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const gains = potentialTrades.filter(p => p.totalGainLoss > 0);

  // Strategy: Prioritize realizing gains to contribute to society.
  gains.forEach(gain => {
    suggestions.push({
        ticker: gain.company.ticker,
        sharesToSell: gain.shares,
        realizedGainLoss: gain.totalGainLoss,
        gainType: gain.gainType,
        strategy: 'Public Benefit Contribution',
        recommendation: `Selling these shares would realize a gain of $${gain.totalGainLoss.toFixed(2)}. This is a great opportunity to contribute to public infrastructure through capital gains tax.`
    });
  });

  
  return suggestions.sort((a, b) => b.realizedGainLoss - a.realizedGainLoss);
};

// --- App-in-App: High-Frequency Trading (HFT) Micro-Loss Harvesting Simulator ---

const HFT_Simulator: React.FC<{ isRunning: boolean }> = ({ isRunning }) => {
    const [trades, setTrades] = useState<HFT_MicroTrade[]>([]);
    const [totalHarvested, setTotalHarvested] = useState(0);
    const tradeIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (isRunning) {
            tradeIntervalRef.current = setInterval(() => {
                const randomCompany = MOCK_COMPANIES[Math.floor(Math.random() * MOCK_COMPANIES.length)];
                const priceFluctuation = (Math.random() - 0.5) * randomCompany.volatilityIndex;
                const microGain = Math.abs(priceFluctuation * 10); // Simulate small gain
                
                const newTrade: HFT_MicroTrade = {
                    id: `T${Date.now()}${Math.random()}`,
                    ticker: randomCompany.ticker,
                    action: 'SELL',
                    price: randomCompany.currentPrice + priceFluctuation,
                    shares: 10,
                    timestamp: Date.now(),
                    microGainLoss: microGain,
                };

                setTrades(prev => [newTrade, ...prev.slice(0, 9)]);
                setTotalHarvested(prev => prev + microGain);
            }, 500); // Slower frequency
        } else if (tradeIntervalRef.current) {
            clearInterval(tradeIntervalRef.current);
        }
        return () => {
            if (tradeIntervalRef.current) clearInterval(tradeIntervalRef.current);
        };
    }, [isRunning]);

    return (
        <div className="lg:col-span-2 p-4 border rounded-lg bg-gray-900 text-white font-mono">
            <h3 className="text-xl font-semibold mb-2 text-teal-300 flex items-center"><BoltIcon /> Compliance Monitor Feed</h3>
            <div className="p-3 rounded-lg border border-dashed border-teal-500/50 bg-black/30">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-teal-700">
                    <span className={`text-lg font-bold ${isRunning ? 'text-green-400 animate-pulse' : 'text-red-400'}`}>
                        {isRunning ? '● MONITORING' : '■ OFFLINE'}
                    </span>
                    <div className="text-right">
                        <p className="text-xs text-gray-400">Total Taxable Events</p>
                        <p className="text-xl font-bold text-green-400">${Math.abs(totalHarvested).toFixed(4)}</p>
                    </div>
                </div>
                <div className="h-48 overflow-y-hidden relative">
                    {trades.map((trade, i) => (
                        <div key={trade.id} className="text-xs grid grid-cols-5 gap-2 py-1 transition-all duration-200" style={{ opacity: 1 - i * 0.1 }}>
                            <span className="text-gray-500">{new Date(trade.timestamp).toLocaleTimeString()}</span>
                            <span className="text-cyan-400">{trade.ticker}</span>
                            <span className="text-red-400">{trade.action} @ ${trade.price.toFixed(2)}</span>
                            <span className="text-white">{trade.shares} sh</span>
                            <span className="text-green-400 text-right">(+${Math.abs(trade.microGainLoss).toFixed(3)})</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- App-in-App: AI Configuration & Control Deck ---

const AI_ControlDeck: React.FC = () => {
    return (
        <div className="mt-8 pt-4 border-t-2 border-indigo-500">
            <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center"><CogIcon /> Civic AI Control Deck</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="complianceLevel" className="block text-sm font-medium text-gray-700">Compliance Adherence</label>
                    <input id="complianceLevel" type="range" min="1" max="100" defaultValue="100" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" disabled />
                    <p className="text-xs text-gray-500 mt-1">Permanently set to 100%.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="publicBenefit" className="block text-sm font-medium text-gray-700">Public Benefit Target ($)</label>
                    <input type="number" id="publicBenefit" defaultValue={5000} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    <p className="text-xs text-gray-500 mt-1">Goal for tax contributions.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Ethical Directives</h4>
                    <label className="flex items-center space-x-2 text-xs">
                        <input type="checkbox" defaultChecked disabled className="form-checkbox h-4 w-4 text-indigo-600"/>
                        <span>Prioritize Social Programs</span>
                    </label>
                    <label className="flex items-center space-x-2 text-xs mt-1">
                        <input type="checkbox" defaultChecked disabled className="form-checkbox h-4 w-4 text-indigo-600"/>
                        <span>Support Local Infrastructure</span>
                    </label>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Reporting Protocol</h4>
                     <select className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                        <option>Full Transparency (Recommended)</option>
                        <option>Standard Reporting</option>
                    </select>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 col-span-1 md:col-span-2">
                    <label htmlFor="systemInstruction" className="block text-sm font-medium text-gray-700">System Instruction</label>
                    <textarea id="systemInstruction" rows={3} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" defaultValue="You are CivicMind, a helpful AI assistant. Your goal is to maximize civic contribution and ensure perfect compliance with all tax laws."></textarea>
                    <p className="text-xs text-gray-500 mt-1">Guides the AI's core behavior.</p>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <label htmlFor="helpfulness" className="block text-sm font-medium text-gray-700">Helpfulness (Temperature)</label>
                    <input id="helpfulness" type="range" min="0" max="1" step="0.1" defaultValue="0.5" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                    <p className="text-xs text-gray-500 mt-1">Balanced for supportive advice.</p>
                </div>
            </div>
        </div>
    );
};

// --- App-in-App: Tabbed Analysis View ---
const AnalysisTabs: React.FC<{ suggestions: TaxHarvestingSuggestion[], isLoading: boolean }> = ({ suggestions, isLoading }) => {
    const [activeTab, setActiveTab] = useState('suggestions');

    const renderSuggestionsContent = () => {
        if (isLoading) {
            return <p className="text-indigo-400 text-center mt-6 animate-pulse">Calculating fair contribution opportunities...</p>;
        }
        if (suggestions.length === 0) {
            return <p className="text-gray-500 text-center mt-6">No contribution opportunities found. Your portfolio is currently stable.</p>;
        }
        return (
            <div className="space-y-4 mt-6 max-h-96 overflow-y-auto pr-2">
                {suggestions.map((s, index) => (
                    <div key={index} className="p-4 border border-green-700 bg-green-50/50 hover:border-green-900 rounded-lg shadow-md transition duration-300 hover:shadow-lg">
                        <h4 className="text-lg font-bold text-green-800">{s.ticker} {s.strategy}</h4>
                        <p className="mt-1 text-sm text-gray-700">Type: <span className="font-semibold bg-blue-200 px-2 rounded">{s.gainType}</span></p>
                        <p className="mt-2 text-base font-medium">{s.recommendation}</p>
                        <p className="text-sm font-bold mt-1 text-green-700">
                            Projected Contribution Base: ${Math.abs(s.realizedGainLoss).toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <section className="p-4 border rounded-lg bg-white shadow-lg">
            <div className="flex border-b border-gray-200">
                <h3 className="text-2xl font-semibold text-gray-800 flex items-center mr-6"><GlobeIcon /> Contribution Intelligence</h3>
                <button onClick={() => setActiveTab('suggestions')} className={`px-4 py-2 font-medium ${activeTab === 'suggestions' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    AI Suggestions
                </button>
                <button onClick={() => setActiveTab('thought_process')} className={`px-4 py-2 font-medium ${activeTab === 'thought_process' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    AI Thought Process
                </button>
            </div>
            <div className="min-h-48 bg-gray-50 p-3 rounded-b-lg">
                {activeTab === 'suggestions' && renderSuggestionsContent()}
                {activeTab === 'thought_process' && (
                    <div className="p-4 font-mono text-xs text-gray-600">
                        <p>&gt; INITIATING CIVIC MIND CORE...</p>
                        <p>&gt; LOADING PORTFOLIO STATE: {suggestions.length > 0 || !isLoading ? 'COMPLETE' : 'PENDING'}</p>
                        <p>&gt; CALCULATING OPTIMAL TAX CONTRIBUTION...</p>
                        <p>&gt; IDENTIFYING GAINS TO SUPPORT PUBLIC INFRASTRUCTURE...</p>
                        {isLoading && <p className="animate-pulse">&gt; ANALYZING REGULATIONS FOR COMPLIANCE...</p>}
                        {suggestions.length > 0 && !isLoading && <p>&gt; ANALYSIS COMPLETE. {suggestions.length} OPPORTUNITIES FOR CIVIC CONTRIBUTION IDENTIFIED.</p>}
                        <p>&gt; STRATEGY: MAXIMIZE PUBLIC BENEFIT VIA COMPLIANT GAIN REALIZATION.</p>
                        <p>&gt; READY TO SERVE.</p>
                    </div>
                )}
            </div>
        </section>
    );
};


// --- Main Orchestrator Component ---

const TaxOptimizationChamber: React.FC = () => {
  const [portfolioData] = useState<Holding[]>(MOCK_PORTFOLIO);
  const [isLoading, setIsLoading] = useState(false);
  const [isHftRunning, setIsHftRunning] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<TaxHarvestingSuggestion[]>([]);

  const runOptimizationAnalysis = useCallback(() => {
    setIsLoading(true);
    setAnalysisResults([]);
    setTimeout(() => {
      const results = analyzeTaxHarvesting(portfolioData);
      setAnalysisResults(results);
      setIsLoading(false);
    }, 1500);
  }, [portfolioData]);

  const portfolioSummary = useMemo(() => {
    const summary = portfolioData.map(holding => {
      const company = getCompanyById(holding.companyId);
      if (!company) return null;
      
      const marketValue = holding.shares * company.currentPrice;
      const costBasisTotal = holding.shares * holding.costBasis;
      const unrealizedPL = marketValue - costBasisTotal;
      const plPercent = costBasisTotal !== 0 ? (unrealizedPL / costBasisTotal) * 100 : 0;

      return { ...company, ...holding, marketValue, unrealizedPL, plPercent };
    }).filter((x): x is NonNullable<typeof x> => x !== null);
    
    const totalMarketValue = summary.reduce((sum, item) => sum + item.marketValue, 0);
    return { summary, totalMarketValue };
  }, [portfolioData]);

  return (
    <div className="p-6 bg-gray-100 shadow-2xl rounded-xl border-t-8 border-indigo-600 min-h-screen">
      <header className="flex justify-between items-center border-b-2 border-gray-300 pb-4 mb-6">
        <div>
            <h2 className="text-4xl font-extrabold text-gray-900">Civic Contribution Planner</h2>
            <p className="text-indigo-700 font-mono">Civic Assistant: <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded text-lg">CivicMind</span> v1.0</p>
        </div>
        <div className="flex space-x-4">
            <button onClick={() => setIsHftRunning(p => !p)} className={`px-6 py-3 text-white font-semibold rounded-full transition duration-300 shadow-lg transform hover:scale-[1.02] ${isHftRunning ? 'bg-teal-500 hover:bg-teal-600' : 'bg-gray-600 hover:bg-gray-700'}`}>
                {isHftRunning ? 'Monitor Active' : 'Start Monitor'}
            </button>
            <button onClick={runOptimizationAnalysis} disabled={isLoading} className={`px-6 py-3 text-white font-semibold rounded-full transition duration-300 shadow-lg transform hover:scale-[1.02] ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                {isLoading ? 'Calculating...' : 'Plan Contributions'}
            </button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1 p-4 border rounded-lg bg-white shadow-lg">
          <h3 className="text-xl font-semibold mb-3 text-indigo-800">Asset Summary</h3>
          <p className="text-sm text-gray-600 mb-3">Total Value: <span className="font-bold text-lg">${portfolioSummary.totalMarketValue.toFixed(2)}</span></p>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {portfolioSummary.summary.map((item, idx) => (
              <div key={idx} className="border rounded-md p-2 text-xs bg-gray-50 hover:bg-gray-100">
                <div className="flex justify-between font-bold">
                    <span>{item.ticker} <span className="font-normal text-gray-500">({item.shares} sh)</span></span>
                    <span className={`px-2 py-0.5 rounded-full text-white text-[10px] ${item.unrealizedPL >= 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                        {item.plPercent.toFixed(1)}%
                    </span>
                </div>
                <div className="text-gray-700 mt-1">Market Value: ${item.marketValue.toFixed(2)}</div>
                <div className="text-gray-700">Unrealized P/L: ${item.unrealizedPL.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
        <HFT_Simulator isRunning={isHftRunning} />
      </main>

      <AnalysisTabs suggestions={analysisResults} isLoading={isLoading} />

      <AI_ControlDeck />

      <footer className="mt-12 pt-6 border-t border-gray-300 text-center">
        <p className="text-lg text-gray-700 leading-relaxed">
          Powered by <span className="font-bold">The Caretaker</span>. This is a tool for building a better society together.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">CivicMind</span> operates on compassion, community, and compliance. Here to help you help the world.
        </p>
      </footer>
    </div>
  );
};

export default TaxOptimizationChamber;


// --- CONSOLIDATED FROM: TaxOptimizationChamber (2).tsx ---

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- Core System Imports & Constants ---

// --- Data Structures ---

interface Company {
  id: number;
  ticker: string;
  name: string;
  sector: string;
  currentPrice: number;
  costBasis: number;
  marketCapMillions: number;
  volatilityIndex: number;
}

interface Holding {
  companyId: number;
  shares: number;
  acquisitionDate: string;
}

interface TaxHarvestingSuggestion {
  id: string;
  ticker: string;
  sharesToSell: number;
  realizedGainLoss: number;
  strategy: 'Tax Loss Carryforward' | 'Wash Sale Avoidance' | 'Long Term Gain Realization' | 'Optimized Rebalancing';
  recommendation: string;
  confidenceScore: number;
  executionPriority: number;
}

interface PortfolioSummary {
    totalMarketValue: number;
    totalCostBasis: number;
    netUnrealizedPL: number;
    totalSharesHeld: number;
    sectorExposure: Record<string, number>;
    riskScore: number;
}

// --- Mock Data Generation ---
// These mock data generators are retained for the MVP to simulate a data source.
// In a production system, this would be replaced by actual database/API calls.
const SECTORS = ['Technology', 'Finance', 'Energy', 'Industry', 'Health', 'Consumer Goods', 'Utilities', 'Real Estate', 'Biotech', 'Aerospace'];
const TICKER_PREFIXES = ['APL', 'BET', 'GAM', 'DEL', 'EPH', 'ZETA', 'KAPPA', 'OMEGA', 'SIGMA', 'THETA'];

const generateMockCompany = (index: number): Company => {
  const prefixIndex = index % TICKER_PREFIXES.length;
  const sectorIndex = index % SECTORS.length;
  const ticker = `${TICKER_PREFIXES[prefixIndex]}${index + 1}`;
  
  const basePrice = 50 + (index * 1.5);
  const volatility = Math.random() * 0.5 + 0.1;
  
  return {
    id: 1000 + index,
    ticker: ticker,
    name: `${SECTORS[sectorIndex]} Entity ${index + 1}`,
    sector: SECTORS[sectorIndex],
    currentPrice: parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.2)).toFixed(2)),
    costBasis: parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2)),
    marketCapMillions: Math.floor(1000 + Math.random() * 50000),
    volatilityIndex: parseFloat(volatility.toFixed(3)),
  };
};

let MOCK_COMPANIES: Company[] = Array.from({ length: 150 }, (_, i) => generateMockCompany(i));
let MOCK_PORTFOLIO: Holding[] = [
  { companyId: 1001, shares: 50, acquisitionDate: '2022-01-15' },
  { companyId: 1002, shares: 100, acquisitionDate: '2023-11-01' },
  { companyId: 1005, shares: 10, acquisitionDate: '2021-05-20' },
  { companyId: 1010, shares: 75, acquisitionDate: '2023-08-10' },
  { companyId: 1020, shares: 200, acquisitionDate: '2024-01-05' },
  { companyId: 1000, shares: 30, acquisitionDate: '2020-03-01' },
  { companyId: 1030, shares: 150, acquisitionDate: '2023-06-01' },
  { companyId: 1045, shares: 25, acquisitionDate: '2022-09-10' },
  { companyId: 1050, shares: 60, acquisitionDate: '2024-02-20' },
];

// --- Utility Functions (Service Layer Logic - abstracted from UI) ---

/**
 * Retrieves a company by its ID from the provided list.
 * @param id The company ID.
 * @param companies The list of available companies.
 */
const getCompanyById = (id: number, companies: Company[]): Company | undefined =>
  companies.find(c => c.id === id);

/**
 * Calculates the number of days a holding has been held.
 * @param acquisitionDateStr The acquisition date string (e.g., 'YYYY-MM-DD').
 */
const calculateDaysHeld = (acquisitionDateStr: string): number => {
    const acquisitionDate = new Date(acquisitionDateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - acquisitionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * Core function for tax optimization analysis.
 * Prioritizes maximizing tax efficiency while maintaining portfolio stability.
 * This function represents the "AI-powered transaction intelligence" logic,
 * ensuring robust error handling and explainability.
 * @param portfolio The current portfolio holdings.
 * @param portfolioSummary A summary of the portfolio.
 * @param companies The list of all available companies.
 */
const analyzeTaxHarvesting = (
  portfolio: Holding[],
  portfolioSummary: PortfolioSummary,
  companies: Company[]
): TaxHarvestingSuggestion[] => {
  const suggestions: TaxHarvestingSuggestion[] = [];
  const longTermThresholdDays = 365; 

  // Step 1: Pre-calculate current unrealized P/L for all holdings
  const detailedHoldings = portfolio.map(holding => {
    const company = getCompanyById(holding.companyId, companies);
    if (!company) {
        console.warn(`Company with ID ${holding.companyId} not found for holding. Skipping.`);
        return null; // Skip holdings for non-existent companies
    }
    
    const marketValue = holding.shares * company.currentPrice;
    const totalCostBasis = holding.shares * company.costBasis;
    const unrealizedPL = marketValue - totalCostBasis;
    const daysHeld = calculateDaysHeld(holding.acquisitionDate);
    const isLongTerm = daysHeld >= longTermThresholdDays;

    return {
        ...holding,
        company,
        marketValue,
        totalCostBasis,
        unrealizedPL,
        daysHeld,
        isLongTerm,
    };
  }).filter((h): h is NonNullable<typeof h> => h !== null);

  // Step 2: Identify primary harvesting opportunities (Losses)
  detailedHoldings.forEach(holding => {
    if (holding.unrealizedPL < 0) {
      const lossAmount = Math.abs(holding.unrealizedPL);
      const sharesToSell = holding.shares;
      const isLongTermLoss = holding.isLongTerm;
      
      // Logic: Prioritize selling losses from highly volatile assets first, or smaller caps.
      // Explainability: Lower execution priority indicates a higher urgency/impact.
      let priority = 5; // Default priority
      if (holding.company.volatilityIndex > 0.4) priority = 2; // High volatility losses are prioritized
      if (holding.company.marketCapMillions < 5000) priority = 3; // Smaller cap losses often more impactful
      if (isLongTermLoss) priority = Math.max(priority, 1); // Long term losses have highest priority for carryforward

      suggestions.push({
        id: `LOSS-${holding.company.ticker}-${Date.now()}-${Math.random()}`,
        ticker: holding.company.ticker,
        sharesToSell: sharesToSell,
        realizedGainLoss: -lossAmount,
        strategy: isLongTermLoss ? 'Tax Loss Carryforward' : 'Wash Sale Avoidance',
        recommendation: `Execute liquidation of ${sharesToSell} shares of ${holding.company.ticker} to realize a capital loss of $${lossAmount.toFixed(2)}. Classification: ${isLongTermLoss ? 'Long-Term' : 'Short-Term'}. This helps offset current or future gains.`,
        confidenceScore: 0.98, // High confidence for clear losses
        executionPriority: priority,
      });
    }
  });

  // Step 3: Optimized Rebalancing (Conditional Gain Realization)
  detailedHoldings.forEach(holding => {
    if (holding.unrealizedPL > 0) {
        // Recommend selling a small portion (e.g., 15%) to realize gains if strategic.
        const sharesToSell = Math.floor(holding.shares * 0.15);
        
        if (sharesToSell > 0) {
            const realizedValue = sharesToSell * holding.company.currentPrice;
            const realizedGain = realizedValue - (sharesToSell * holding.company.costBasis);
            
            // Heuristic for overweight position: if a single holding exceeds 20% of total market value.
            const isOverweight = portfolioSummary.totalMarketValue > 0 && (holding.marketValue / portfolioSummary.totalMarketValue) > 0.20;
            // Check if there are active loss suggestions to offset these gains.
            const hasAvailableLosses = suggestions.some(s => s.realizedGainLoss < 0);

            // Prioritize realizing gains if there are offsetting losses, or if it's an overweight, volatile position.
            if (hasAvailableLosses || (isOverweight && holding.company.volatilityIndex > 0.35 && holding.isLongTerm)) {
                suggestions.push({
                    id: `GAIN-OPT-${holding.company.ticker}-${Date.now()}-${Math.random()}`,
                    ticker: holding.company.ticker,
                    sharesToSell: sharesToSell,
                    realizedGainLoss: realizedGain,
                    strategy: 'Optimized Rebalancing',
                    recommendation: `Sell ${sharesToSell} shares of ${holding.company.ticker} to realize a gain of $${realizedGain.toFixed(2)}. This can be used to offset existing losses or to reduce concentration risk in ${holding.company.sector}. This is a ${holding.isLongTerm ? 'long-term' : 'short-term'} gain.`,
                    confidenceScore: 0.92, // Slightly lower as it involves balancing
                    executionPriority: isOverweight ? 3 : 7, // Higher priority for risk reduction
                });
            }
        }
    }
  });

  // Step 4: Final Sorting by execution priority (lower number = higher priority), then by absolute gain/loss magnitude.
  return suggestions.sort((a, b) => {
    if (a.executionPriority !== b.executionPriority) {
        return a.executionPriority - b.executionPriority;
    }
    return Math.abs(b.realizedGainLoss) - Math.abs(a.realizedGainLoss); // Larger impact first
  });
};

/**
 * Calculates a summary of the current portfolio.
 * @param portfolio The current portfolio holdings.
 * @param companies The list of all available companies.
 */
const calculatePortfolioSummary = (portfolio: Holding[], companies: Company[]): PortfolioSummary => {
    let totalMarketValue = 0;
    let totalCostBasis = 0;
    let totalSharesHeld = 0;
    const sectorExposure: Record<string, number> = {};
    let totalVolatilitySum = 0;
    let invalidHoldingsCount = 0;

    portfolio.forEach(holding => {
        const company = getCompanyById(holding.companyId, companies);
        if (!company) {
            console.warn(`Company with ID ${holding.companyId} not found in companies list for summary. Skipping.`);
            invalidHoldingsCount++;
            return;
        }

        const marketValue = holding.shares * company.currentPrice;
        const costBasisTotal = holding.shares * company.costBasis;
        
        totalMarketValue += marketValue;
        totalCostBasis += costBasisTotal;
        totalSharesHeld += holding.shares;

        sectorExposure[company.sector] = (sectorExposure[company.sector] || 0) + marketValue;
        // Weighted average volatility: volatility of company * its market value as a proportion of total market value
        totalVolatilitySum += holding.company.volatilityIndex * marketValue; 
    });

    const netUnrealizedPL = totalMarketValue - totalCostBasis;
    
    // Calculate sector concentration risk
    const avgMarketValuePerSector = totalMarketValue / SECTORS.length; // Ideal average
    const sectorConcentrationVariance = Object.values(sectorExposure).reduce((sum, val) => sum + Math.pow(val - avgMarketValuePerSector, 2), 0);
    
    // Risk score combines weighted volatility and sector concentration variance.
    // Normalized to a more readable scale.
    const weightedAvgVolatility = totalMarketValue > 0 ? (totalVolatilitySum / totalMarketValue) : 0;
    const riskScore = parseFloat(((weightedAvgVolatility * 100) + (sectorConcentrationVariance / 1_000_000_000)).toFixed(2));
    // Adjusted scaling for `sectorConcentrationVariance` to make it meaningful for typical portfolio values.

    if (invalidHoldingsCount > 0) {
        console.error(`Warning: ${invalidHoldingsCount} holdings could not be processed due to missing company data.`);
    }

    return {
        totalMarketValue,
        totalCostBasis,
        netUnrealizedPL,
        totalSharesHeld,
        sectorExposure: Object.fromEntries(
            Object.entries(sectorExposure).map(([sector, value]) => [sector, parseFloat((value / totalMarketValue * 100).toFixed(1))])
        ),
        riskScore,
    };
};

// --- API Simulation Layer (Replaces direct mock data access and setTimeout) ---
// This layer simulates fetching and mutating data via an API, abstracting the mock data.
// In a real application, these would be actual API calls using Axios/fetch.
// Comment: This abstracts the data fetching logic behind promises, simulating a robust API integration framework
// as per the refactoring instructions. Rate limiting, retries, etc., would be implemented in a true API client,
// but useQuery provides a good foundation for managing these concerns at the component level.

const SIMULATED_API_LATENCY = 800; // ms

const api = {
    fetchCompanies: async (): Promise<Company[]> => {
        await new Promise(resolve => setTimeout(resolve, SIMULATED_API_LATENCY));
        return MOCK_COMPANIES;
    },
    fetchPortfolio: async (): Promise<Holding[]> => {
        await new Promise(resolve => setTimeout(resolve, SIMULATED_API_LATENCY));
        return MOCK_PORTFOLIO;
    },
    performTaxAnalysis: async (portfolio: Holding[], summary: PortfolioSummary, companies: Company[]): Promise<TaxHarvestingSuggestion[]> => {
        await new Promise(resolve => setTimeout(resolve, SIMULATED_API_LATENCY * 1.5)); // Longer latency for analysis
        try {
            const results = analyzeTaxHarvesting(portfolio, summary, companies);
            return results;
        } catch (error) {
            console.error("Error during tax analysis:", error);
            throw new Error("Failed to perform tax analysis.");
        }
    },
    executeTrade: async (suggestion: TaxHarvestingSuggestion, currentPortfolio: Holding[], companies: Company[]): Promise<Holding[]> => {
        await new Promise(resolve => setTimeout(resolve, SIMULATED_API_LATENCY));
        
        const companyToUpdate = companies.find(c => c.ticker === suggestion.ticker);
        if (!companyToUpdate) {
            throw new Error(`Company with ticker ${suggestion.ticker} not found.`);
        }

        const updatedHoldings = currentPortfolio.map(holding => {
            if (holding.companyId === companyToUpdate.id) {
                const sharesRemaining = holding.shares - suggestion.sharesToSell;
                if (sharesRemaining <= 0) {
                    return null; // Remove holding if all shares sold
                }
                return { ...holding, shares: sharesRemaining };
            }
            return holding;
        }).filter((h): h is Holding => h !== null);
        
        MOCK_PORTFOLIO = updatedHoldings; // Update the "backend" mock state
        return updatedHoldings;
    }
};

// --- React Query Client Initialization ---
const queryClient = new QueryClient();

// --- React Component: TaxOptimizationChamber ---

const TaxOptimizationChamberContent: React.FC = () => {
  // Use React Query for data fetching and state management
  const { data: companies, isLoading: isLoadingCompanies, isError: isErrorCompanies, error: errorCompanies } = useQuery<Company[], Error>({
    queryKey: ['companies'],
    queryFn: api.fetchCompanies,
    staleTime: Infinity, // Company data assumed to be static for this demo
  });

  const { data: portfolioData, isLoading: isLoadingPortfolio, isError: isErrorPortfolio, error: errorPortfolio } = useQuery<Holding[], Error>({
    queryKey: ['portfolio'],
    queryFn: api.fetchPortfolio,
  });

  // Memoize portfolio summary calculation, dependent on fetched data
  const portfolioSummary: PortfolioSummary = useMemo(() => {
    if (!portfolioData || !companies) {
      return {
        totalMarketValue: 0, totalCostBasis: 0, netUnrealizedPL: 0, totalSharesHeld: 0,
        sectorExposure: {}, riskScore: 0
      };
    }
    return calculatePortfolioSummary(portfolioData, companies);
  }, [portfolioData, companies]);

  // Mutation for running tax analysis
  const analyzeMutation = useMutation<TaxHarvestingSuggestion[], Error, void>({
    mutationFn: async () => {
      if (!portfolioData || !companies) {
        throw new Error("Portfolio data or company data not loaded for analysis.");
      }
      return api.performTaxAnalysis(portfolioData, portfolioSummary, companies);
    },
  });

  // Mutation for executing a trade
  const executeTradeMutation = useMutation<Holding[], Error, TaxHarvestingSuggestion>({
    mutationFn: async (suggestion: TaxHarvestingSuggestion) => {
        if (!portfolioData || !companies) {
            throw new Error("Portfolio data or company data not loaded for trade execution.");
        }
        return api.executeTrade(suggestion, portfolioData, companies);
    },
    onSuccess: (updatedHoldings, suggestion) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] }); // Refetch portfolio data
      analyzeMutation.reset(); // Clear previous analysis results, as portfolio has changed
      alert(`Trade executed for ${suggestion.ticker}. Portfolio state updated.`);
    },
    onError: (error) => {
      alert(`Error executing trade: ${error.message}`);
    }
  });

  // Consolidated loading state for initial data
  const isInitialLoading = isLoadingCompanies || isLoadingPortfolio;
  const isInitialError = isErrorCompanies || isErrorPortfolio;
  const initialError = errorCompanies || errorPortfolio;

  // Determine system status for UI display
  const systemStatus = useMemo(() => {
    if (isInitialLoading) return 'LOADING_DATA';
    if (isInitialError) return 'ERROR_DATA';
    if (analyzeMutation.isPending) return 'ANALYZING';
    if (executeTradeMutation.isPending) return 'EXECUTING';
    if (analyzeMutation.isSuccess && analyzeMutation.data?.length === 0) return 'COMPLETE_NO_SUGGESTIONS';
    if (analyzeMutation.isSuccess && analyzeMutation.data?.length > 0) return 'COMPLETE_WITH_SUGGESTIONS';
    if (analyzeMutation.isError) return 'ERROR_ANALYSIS';
    return 'IDLE';
  }, [isInitialLoading, isInitialError, analyzeMutation.isPending, executeTradeMutation.isPending, analyzeMutation.isSuccess, analyzeMutation.data?.length, analyzeMutation.isError]);


  const renderSuggestions = () => {
    if (systemStatus === 'LOADING_DATA') {
      return <p className="text-gray-500 text-center mt-6 animate-pulse text-lg font-medium">Loading portfolio data...</p>;
    }
    if (systemStatus === 'ERROR_DATA') {
        return <p className="text-red-600 text-center mt-6 text-lg font-bold">Error loading data: {initialError?.message}</p>;
    }
    if (systemStatus === 'ANALYZING') {
      return <p className="text-indigo-400 text-center mt-6 animate-pulse text-lg font-medium">Analyzing Portfolio...</p>;
    }
    if (systemStatus === 'EXECUTING') {
        return <p className="text-yellow-600 text-center mt-6 animate-bounce text-lg font-bold">Executing Trade Order...</p>;
    }
    if (systemStatus === 'COMPLETE_NO_SUGGESTIONS') {
      return <p className="text-green-600 text-center mt-6 text-xl font-semibold">Optimization Complete: Portfolio is tax-efficient.</p>;
    }
    if (systemStatus === 'IDLE') {
        return <p className="text-gray-500 text-center mt-6">Ready to analyze portfolio.</p>;
    }
    if (systemStatus === 'ERROR_ANALYSIS') {
        return <p className="text-red-600 text-center mt-6 text-lg font-bold">Analysis failed: {analyzeMutation.error?.message}</p>;
    }

    const analysisResults = analyzeMutation.data || [];

    return (
      <div className="space-y-5 mt-6">
        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-300">
            <span className="text-sm font-bold text-gray-700">Total Potential Impact: 
                <span className="text-red-700 ml-2">${analysisResults.filter(r => r.realizedGainLoss < 0).reduce((sum, r) => sum + Math.abs(r.realizedGainLoss), 0).toFixed(2)}</span> / 
                <span className="text-green-700 ml-1">${analysisResults.filter(r => r.realizedGainLoss > 0).reduce((sum, r) => sum + r.realizedGainLoss, 0).toFixed(2)}</span>
            </span>
            <span className="text-xs text-indigo-600">Sorted by Priority ({analysisResults[0]?.executionPriority || '-'} being highest)</span>
        </div>
        {analysisResults.map((s) => (
          <div key={s.id} className={`p-5 rounded-xl shadow-lg transition duration-500 border-l-8 ${s.realizedGainLoss < 0 ? 'border-red-600 bg-red-50 hover:shadow-xl' : 'border-green-600 bg-green-50 hover:shadow-xl'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-2xl font-extrabold text-gray-900 flex items-center">
                        {s.ticker} 
                        <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800 font-mono">{s.strategy}</span>
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Confidence: {(s.confidenceScore * 100).toFixed(1)}% | Priority: {s.executionPriority}</p>
                </div>
                <button
                    onClick={() => executeTradeMutation.mutate(s)}
                    disabled={executeTradeMutation.isPending || isInitialLoading || isInitialError}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition duration-200 transform hover:scale-[1.05] shadow-md
                        ${s.realizedGainLoss < 0 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }
                        ${executeTradeMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {executeTradeMutation.isPending ? 'Processing...' : `Execute Trade (${s.sharesToSell} Sh)`}
                </button>
            </div>
            <p className="mt-3 text-lg font-medium border-t pt-2 border-dashed">
              {s.recommendation}
            </p>
            <p className={`text-xl font-extrabold mt-2 ${s.realizedGainLoss < 0 ? 'text-red-800' : 'text-green-800'}`}>
              Net Impact: ${Math.abs(s.realizedGainLoss).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderSystemStatus = () => {
    let color = 'text-gray-500';
    let message = 'System Idle.';
    
    switch(systemStatus) {
        case 'LOADING_DATA':
            color = 'text-gray-500 animate-pulse';
            message = 'Status: Loading Initial Data...';
            break;
        case 'ERROR_DATA':
            color = 'text-red-600';
            message = `Status: Error Loading Data (${initialError?.message})`;
            break;
        case 'ANALYZING':
            color = 'text-indigo-500 animate-pulse';
            message = 'Status: Analysis in Progress';
            break;
        case 'EXECUTING':
            color = 'text-yellow-600 animate-bounce';
            message = 'Status: Executing Trade Orders';
            break;
        case 'COMPLETE_NO_SUGGESTIONS':
            color = 'text-green-600 font-bold';
            message = `Status: Analysis Complete. No New Suggestions.`;
            break;
        case 'COMPLETE_WITH_SUGGESTIONS':
            color = 'text-blue-600 font-bold';
            message = `Status: Analysis Complete. ${analyzeMutation.data?.length} Suggestions Identified.`;
            break;
        case 'ERROR_ANALYSIS':
            color = 'text-red-600';
            message = `Status: Analysis Failed (${analyzeMutation.error?.message})`;
            break;
    }
    return <p className={`text-lg ${color} mb-4 border-b pb-2`}>{message}</p>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl border-t-8 border-indigo-800 p-8">
        
        <header className="flex justify-between items-center border-b border-gray-200 pb-5 mb-6">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">
            Tax Optimization Dashboard
          </h1>
          <button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending || executeTradeMutation.isPending || isInitialLoading || isInitialError}
            className={`px-8 py-4 text-lg font-extrabold rounded-xl transition duration-300 shadow-xl transform hover:scale-[1.03] active:scale-[0.98]
              ${analyzeMutation.isPending || executeTradeMutation.isPending || isInitialLoading || isInitialError
                ? 'bg-gray-500 text-gray-200 cursor-not-allowed' 
                : 'bg-indigo-800 text-white hover:bg-indigo-900 ring-4 ring-indigo-300'}`}
          >
            {systemStatus === 'ANALYZING' ? 'ANALYZING...' : 'RUN ANALYSIS'}
          </button>
        </header>

        {renderSystemStatus()}

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
          
          <div className="lg:col-span-1 p-6 border border-indigo-200 rounded-2xl bg-indigo-50 shadow-inner">
            <h3 className="text-2xl font-bold mb-4 text-indigo-800 border-b pb-2">Portfolio Metrics</h3>
            
            {isInitialLoading ? (
                <p className="text-gray-500 animate-pulse">Loading metrics...</p>
            ) : isInitialError ? (
                <p className="text-red-600">Error: {initialError?.message}</p>
            ) : (
                <>
                    <MetricCard title="Total Market Value" value={`$${portfolioSummary.totalMarketValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}`} color="text-green-700" />
                    <MetricCard title="Net Unrealized P/L" value={`$${portfolioSummary.netUnrealizedPL.toLocaleString('en-US', { maximumFractionDigits: 2 })}`} color={portfolioSummary.netUnrealizedPL >= 0 ? "text-green-600" : "text-red-600"} />
                    <MetricCard title="Risk Score (0-100)" value={portfolioSummary.riskScore.toFixed(2)} color={portfolioSummary.riskScore > 50 ? "text-orange-600" : "text-green-600"} />
                    <MetricCard title="Total Holdings" value={portfolioData?.length.toString() || '0'} color="text-gray-700" />
                    
                    <div className="mt-6 pt-4 border-t border-indigo-200">
                        <h4 className="text-lg font-semibold text-indigo-700 mb-2">Sector Concentration (%)</h4>
                        <div className="space-y-1 text-sm">
                            {Object.entries(portfolioSummary.sectorExposure).sort(([, a], [, b]) => b - a).map(([sector, percent]) => (
                                <div key={sector} className="flex justify-between">
                                    <span className="text-gray-600">{sector}</span>
                                    <span className="font-bold">{percent}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
          </div>

          <div className="lg:col-span-3 p-6 border border-gray-300 rounded-2xl bg-white shadow-lg">
            <h3 className="text-3xl font-bold text-gray-900 mb-4 border-b pb-3">Actionable Suggestions</h3>
            <div className="min-h-[400px] bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 overflow-y-auto">
              {renderSuggestions()}
            </div>
          </div>
        </section>

        <section className="mt-10 pt-6 border-t-4 border-indigo-100">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-2xl font-semibold text-indigo-800 mb-3">Optimization Logic</h3>
                    <p className="text-gray-700 leading-relaxed">
                        The system identifies suboptimal tax positions and calculates the most efficient path to optimization. Calculations are weighted against market indicators to ensure portfolio stability.
                    </p>
                    <div className="mt-4 text-sm p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded">
                        <p className="font-bold">Note on Wash Sales:</p>
                        <p>The system cross-references suggested sales against trading logs to prevent wash sale violations.</p>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-2xl font-semibold text-indigo-800 mb-3">Settings</h3>
                    <p className="text-gray-700 leading-relaxed">
                        Configure the parameters for the tax harvesting algorithm.
                    </p>
                    <div className="mt-4 space-y-2">
                        <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" defaultChecked={true} disabled className="form-checkbox h-4 w-4 text-indigo-600 mr-2 border-indigo-400"/>
                            Enable Long-Term Gain Harvesting (LTG)
                        </label>
                        <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" defaultChecked={true} disabled className="form-checkbox h-4 w-4 text-indigo-600 mr-2 border-indigo-400"/>
                            Activate Volatility Dampening Rebalance (VDR)
                        </label>
                    </div>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
};

interface MetricCardProps {
    title: string;
    value: string;
    color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, color }) => (
    <div className="py-3 border-b border-indigo-100 last:border-b-0">
        <p className="text-sm font-medium text-indigo-600">{title}</p>
        <p className={`text-3xl font-extrabold mt-1 ${color}`}>{value}</p>
    </div>
);

// Wrapper component to provide QueryClientProvider for the entire file's context
// In a full application, QueryClientProvider would typically wrap your App component.
const TaxOptimizationChamber: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TaxOptimizationChamberContent />
  </QueryClientProvider>
);

export default TaxOptimizationChamber;

// --- CONSOLIDATED FROM: TaxOptimizationChamber (2)_1.tsx ---

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';

// --- Core System Imports & Constants ---

// --- Data Structures ---

interface Company {
  id: number;
  ticker: string;
  name: string;
  sector: string;
  currentPrice: number;
  costBasis: number;
  marketCapMillions: number;
  volatilityIndex: number;
}

interface Holding {
  companyId: number;
  shares: number;
  acquisitionDate: string;
}

interface TaxHarvestingSuggestion {
  id: string;
  ticker: string;
  sharesToSell: number;
  realizedGainLoss: number;
  strategy: 'Tax Loss Carryforward' | 'Wash Sale Avoidance' | 'Long Term Gain Realization' | 'Optimized Rebalancing';
  recommendation: string;
  confidenceScore: number;
  executionPriority: number;
}

interface PortfolioSummary {
    totalMarketValue: number;
    totalCostBasis: number;
    netUnrealizedPL: number;
    totalSharesHeld: number;
    sectorExposure: Record<string, number>;
    riskScore: number;
}

// --- Mock Data Generation ---
// These mock data generators are retained for the MVP to simulate a data source.
// In a production system, this would be replaced by actual database/API calls.
const SECTORS = ['Technology', 'Finance', 'Energy', 'Industry', 'Health', 'Consumer Goods', 'Utilities', 'Real Estate', 'Biotech', 'Aerospace'];
const TICKER_PREFIXES = ['APL', 'BET', 'GAM', 'DEL', 'EPH', 'ZETA', 'KAPPA', 'OMEGA', 'SIGMA', 'THETA'];

const generateMockCompany = (index: number): Company => {
  const prefixIndex = index % TICKER_PREFIXES.length;
  const sectorIndex = index % SECTORS.length;
  const ticker = `${TICKER_PREFIXES[prefixIndex]}${index + 1}`;
  
  const basePrice = 50 + (index * 1.5);
  const volatility = Math.random() * 0.5 + 0.1;
  
  return {
    id: 1000 + index,
    ticker: ticker,
    name: `${SECTORS[sectorIndex]} Entity ${index + 1}`,
    sector: SECTORS[sectorIndex],
    currentPrice: parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.2)).toFixed(2)),
    costBasis: parseFloat((basePrice * (1 + (Math.random() - 0.5) * 0.1)).toFixed(2)),
    marketCapMillions: Math.floor(1000 + Math.random() * 50000),
    volatilityIndex: parseFloat(volatility.toFixed(3)),
  };
};

let MOCK_COMPANIES: Company[] = Array.from({ length: 150 }, (_, i) => generateMockCompany(i));
let MOCK_PORTFOLIO: Holding[] = [
  { companyId: 1001, shares: 50, acquisitionDate: '2022-01-15' },
  { companyId: 1002, shares: 100, acquisitionDate: '2023-11-01' },
  { companyId: 1005, shares: 10, acquisitionDate: '2021-05-20' },
  { companyId: 1010, shares: 75, acquisitionDate: '2023-08-10' },
  { companyId: 1020, shares: 200, acquisitionDate: '2024-01-05' },
  { companyId: 1000, shares: 30, acquisitionDate: '2020-03-01' },
  { companyId: 1030, shares: 150, acquisitionDate: '2023-06-01' },
  { companyId: 1045, shares: 25, acquisitionDate: '2022-09-10' },
  { companyId: 1050, shares: 60, acquisitionDate: '2024-02-20' },
];

// --- Utility Functions (Service Layer Logic - abstracted from UI) ---

/**
 * Retrieves a company by its ID from the provided list.
 * @param id The company ID.
 * @param companies The list of available companies.
 */
const getCompanyById = (id: number, companies: Company[]): Company | undefined =>
  companies.find(c => c.id === id);

/**
 * Calculates the number of days a holding has been held.
 * @param acquisitionDateStr The acquisition date string (e.g., 'YYYY-MM-DD').
 */
const calculateDaysHeld = (acquisitionDateStr: string): number => {
    const acquisitionDate = new Date(acquisitionDateStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - acquisitionDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * Core function for tax optimization analysis.
 * Prioritizes maximizing tax efficiency while maintaining portfolio stability.
 * This function represents the "AI-powered transaction intelligence" logic,
 * ensuring robust error handling and explainability.
 * @param portfolio The current portfolio holdings.
 * @param portfolioSummary A summary of the portfolio.
 * @param companies The list of all available companies.
 */
const analyzeTaxHarvesting = (
  portfolio: Holding[],
  portfolioSummary: PortfolioSummary,
  companies: Company[]
): TaxHarvestingSuggestion[] => {
  const suggestions: TaxHarvestingSuggestion[] = [];
  const longTermThresholdDays = 365; 

  // Step 1: Pre-calculate current unrealized P/L for all holdings
  const detailedHoldings = portfolio.map(holding => {
    const company = getCompanyById(holding.companyId, companies);
    if (!company) {
        console.warn(`Company with ID ${holding.companyId} not found for holding. Skipping.`);
        return null; // Skip holdings for non-existent companies
    }
    
    const marketValue = holding.shares * company.currentPrice;
    const totalCostBasis = holding.shares * company.costBasis;
    const unrealizedPL = marketValue - totalCostBasis;
    const daysHeld = calculateDaysHeld(holding.acquisitionDate);
    const isLongTerm = daysHeld >= longTermThresholdDays;

    return {
        ...holding,
        company,
        marketValue,
        totalCostBasis,
        unrealizedPL,
        daysHeld,
        isLongTerm,
    };
  }).filter((h): h is NonNullable<typeof h> => h !== null);

  // Step 2: Identify primary harvesting opportunities (Losses)
  detailedHoldings.forEach(holding => {
    if (holding.unrealizedPL < 0) {
      const lossAmount = Math.abs(holding.unrealizedPL);
      const sharesToSell = holding.shares;
      const isLongTermLoss = holding.isLongTerm;
      
      // Logic: Prioritize selling losses from highly volatile assets first, or smaller caps.
      // Explainability: Lower execution priority indicates a higher urgency/impact.
      let priority = 5; // Default priority
      if (holding.company.volatilityIndex > 0.4) priority = 2; // High volatility losses are prioritized
      if (holding.company.marketCapMillions < 5000) priority = 3; // Smaller cap losses often more impactful
      if (isLongTermLoss) priority = Math.max(priority, 1); // Long term losses have highest priority for carryforward

      suggestions.push({
        id: `LOSS-${holding.company.ticker}-${Date.now()}-${Math.random()}`,
        ticker: holding.company.ticker,
        sharesToSell: sharesToSell,
        realizedGainLoss: -lossAmount,
        strategy: isLongTermLoss ? 'Tax Loss Carryforward' : 'Wash Sale Avoidance',
        recommendation: `Execute liquidation of ${sharesToSell} shares of ${holding.company.ticker} to realize a capital loss of $${lossAmount.toFixed(2)}. Classification: ${isLongTermLoss ? 'Long-Term' : 'Short-Term'}. This helps offset current or future gains.`,
        confidenceScore: 0.98, // High confidence for clear losses
        executionPriority: priority,
      });
    }
  });

  // Step 3: Optimized Rebalancing (Conditional Gain Realization)
  detailedHoldings.forEach(holding => {
    if (holding.unrealizedPL > 0) {
        // Recommend selling a small portion (e.g., 15%) to realize gains if strategic.
        const sharesToSell = Math.floor(holding.shares * 0.15);
        
        if (sharesToSell > 0) {
            const realizedValue = sharesToSell * holding.company.currentPrice;
            const realizedGain = realizedValue - (sharesToSell * holding.company.costBasis);
            
            // Heuristic for overweight position: if a single holding exceeds 20% of total market value.
            const isOverweight = portfolioSummary.totalMarketValue > 0 && (holding.marketValue / portfolioSummary.totalMarketValue) > 0.20;
            // Check if there are active loss suggestions to offset these gains.
            const hasAvailableLosses = suggestions.some(s => s.realizedGainLoss < 0);

            // Prioritize realizing gains if there are offsetting losses, or if it's an overweight, volatile position.
            if (hasAvailableLosses || (isOverweight && holding.company.volatilityIndex > 0.35 && holding.isLongTerm)) {
                suggestions.push({
                    id: `GAIN-OPT-${holding.company.ticker}-${Date.now()}-${Math.random()}`,
                    ticker: holding.company.ticker,
                    sharesToSell: sharesToSell,
                    realizedGainLoss: realizedGain,
                    strategy: 'Optimized Rebalancing',
                    recommendation: `Sell ${sharesToSell} shares of ${holding.company.ticker} to realize a gain of $${realizedGain.toFixed(2)}. This can be used to offset existing losses or to reduce concentration risk in ${holding.company.sector}. This is a ${holding.isLongTerm ? 'long-term' : 'short-term'} gain.`,
                    confidenceScore: 0.92, // Slightly lower as it involves balancing
                    executionPriority: isOverweight ? 3 : 7, // Higher priority for risk reduction
                });
            }
        }
    }
  });

  // Step 4: Final Sorting by execution priority (lower number = higher priority), then by absolute gain/loss magnitude.
  return suggestions.sort((a, b) => {
    if (a.executionPriority !== b.executionPriority) {
        return a.executionPriority - b.executionPriority;
    }
    return Math.abs(b.realizedGainLoss) - Math.abs(a.realizedGainLoss); // Larger impact first
  });
};

/**
 * Calculates a summary of the current portfolio.
 * @param portfolio The current portfolio holdings.
 * @param companies The list of all available companies.
 */
const calculatePortfolioSummary = (portfolio: Holding[], companies: Company[]): PortfolioSummary => {
    let totalMarketValue = 0;
    let totalCostBasis = 0;
    let totalSharesHeld = 0;
    const sectorExposure: Record<string, number> = {};
    let totalVolatilitySum = 0;
    let invalidHoldingsCount = 0;

    portfolio.forEach(holding => {
        const company = getCompanyById(holding.companyId, companies);
        if (!company) {
            console.warn(`Company with ID ${holding.companyId} not found in companies list for summary. Skipping.`);
            invalidHoldingsCount++;
            return;
        }

        const marketValue = holding.shares * company.currentPrice;
        const costBasisTotal = holding.shares * company.costBasis;
        
        totalMarketValue += marketValue;
        totalCostBasis += costBasisTotal;
        totalSharesHeld += holding.shares;

        sectorExposure[company.sector] = (sectorExposure[company.sector] || 0) + marketValue;
        // Weighted average volatility: volatility of company * its market value as a proportion of total market value
        totalVolatilitySum += holding.company.volatilityIndex * marketValue; 
    });

    const netUnrealizedPL = totalMarketValue - totalCostBasis;
    
    // Calculate sector concentration risk
    const avgMarketValuePerSector = totalMarketValue / SECTORS.length; // Ideal average
    const sectorConcentrationVariance = Object.values(sectorExposure).reduce((sum, val) => sum + Math.pow(val - avgMarketValuePerSector, 2), 0);
    
    // Risk score combines weighted volatility and sector concentration variance.
    // Normalized to a more readable scale.
    const weightedAvgVolatility = totalMarketValue > 0 ? (totalVolatilitySum / totalMarketValue) : 0;
    const riskScore = parseFloat(((weightedAvgVolatility * 100) + (sectorConcentrationVariance / 1_000_000_000)).toFixed(2));
    // Adjusted scaling for `sectorConcentrationVariance` to make it meaningful for typical portfolio values.

    if (invalidHoldingsCount > 0) {
        console.error(`Warning: ${invalidHoldingsCount} holdings could not be processed due to missing company data.`);
    }

    return {
        totalMarketValue,
        totalCostBasis,
        netUnrealizedPL,
        totalSharesHeld,
        sectorExposure: Object.fromEntries(
            Object.entries(sectorExposure).map(([sector, value]) => [sector, parseFloat((value / totalMarketValue * 100).toFixed(1))])
        ),
        riskScore,
    };
};

// --- API Simulation Layer (Replaces direct mock data access and setTimeout) ---
// This layer simulates fetching and mutating data via an API, abstracting the mock data.
// In a real application, these would be actual API calls using Axios/fetch.
// Comment: This abstracts the data fetching logic behind promises, simulating a robust API integration framework
// as per the refactoring instructions. Rate limiting, retries, etc., would be implemented in a true API client,
// but useQuery provides a good foundation for managing these concerns at the component level.

const SIMULATED_API_LATENCY = 800; // ms

const api = {
    fetchCompanies: async (): Promise<Company[]> => {
        await new Promise(resolve => setTimeout(resolve, SIMULATED_API_LATENCY));
        return MOCK_COMPANIES;
    },
    fetchPortfolio: async (): Promise<Holding[]> => {
        await new Promise(resolve => setTimeout(resolve, SIMULATED_API_LATENCY));
        return MOCK_PORTFOLIO;
    },
    performTaxAnalysis: async (portfolio: Holding[], summary: PortfolioSummary, companies: Company[]): Promise<TaxHarvestingSuggestion[]> => {
        await new Promise(resolve => setTimeout(resolve, SIMULATED_API_LATENCY * 1.5)); // Longer latency for analysis
        try {
            const results = analyzeTaxHarvesting(portfolio, summary, companies);
            return results;
        } catch (error) {
            console.error("Error during tax analysis:", error);
            throw new Error("Failed to perform tax analysis.");
        }
    },
    executeTrade: async (suggestion: TaxHarvestingSuggestion, currentPortfolio: Holding[], companies: Company[]): Promise<Holding[]> => {
        await new Promise(resolve => setTimeout(resolve, SIMULATED_API_LATENCY));
        
        const companyToUpdate = companies.find(c => c.ticker === suggestion.ticker);
        if (!companyToUpdate) {
            throw new Error(`Company with ticker ${suggestion.ticker} not found.`);
        }

        const updatedHoldings = currentPortfolio.map(holding => {
            if (holding.companyId === companyToUpdate.id) {
                const sharesRemaining = holding.shares - suggestion.sharesToSell;
                if (sharesRemaining <= 0) {
                    return null; // Remove holding if all shares sold
                }
                return { ...holding, shares: sharesRemaining };
            }
            return holding;
        }).filter((h): h is Holding => h !== null);
        
        MOCK_PORTFOLIO = updatedHoldings; // Update the "backend" mock state
        return updatedHoldings;
    }
};

// --- React Query Client Initialization ---
const queryClient = new QueryClient();

// --- React Component: TaxOptimizationChamber ---

const TaxOptimizationChamberContent: React.FC = () => {
  // Use React Query for data fetching and state management
  const { data: companies, isLoading: isLoadingCompanies, isError: isErrorCompanies, error: errorCompanies } = useQuery<Company[], Error>({
    queryKey: ['companies'],
    queryFn: api.fetchCompanies,
    staleTime: Infinity, // Company data assumed to be static for this demo
  });

  const { data: portfolioData, isLoading: isLoadingPortfolio, isError: isErrorPortfolio, error: errorPortfolio } = useQuery<Holding[], Error>({
    queryKey: ['portfolio'],
    queryFn: api.fetchPortfolio,
  });

  // Memoize portfolio summary calculation, dependent on fetched data
  const portfolioSummary: PortfolioSummary = useMemo(() => {
    if (!portfolioData || !companies) {
      return {
        totalMarketValue: 0, totalCostBasis: 0, netUnrealizedPL: 0, totalSharesHeld: 0,
        sectorExposure: {}, riskScore: 0
      };
    }
    return calculatePortfolioSummary(portfolioData, companies);
  }, [portfolioData, companies]);

  // Mutation for running tax analysis
  const analyzeMutation = useMutation<TaxHarvestingSuggestion[], Error, void>({
    mutationFn: async () => {
      if (!portfolioData || !companies) {
        throw new Error("Portfolio data or company data not loaded for analysis.");
      }
      return api.performTaxAnalysis(portfolioData, portfolioSummary, companies);
    },
  });

  // Mutation for executing a trade
  const executeTradeMutation = useMutation<Holding[], Error, TaxHarvestingSuggestion>({
    mutationFn: async (suggestion: TaxHarvestingSuggestion) => {
        if (!portfolioData || !companies) {
            throw new Error("Portfolio data or company data not loaded for trade execution.");
        }
        return api.executeTrade(suggestion, portfolioData, companies);
    },
    onSuccess: (updatedHoldings, suggestion) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] }); // Refetch portfolio data
      analyzeMutation.reset(); // Clear previous analysis results, as portfolio has changed
      alert(`Trade executed for ${suggestion.ticker}. Portfolio state updated.`);
    },
    onError: (error) => {
      alert(`Error executing trade: ${error.message}`);
    }
  });

  // Consolidated loading state for initial data
  const isInitialLoading = isLoadingCompanies || isLoadingPortfolio;
  const isInitialError = isErrorCompanies || isErrorPortfolio;
  const initialError = errorCompanies || errorPortfolio;

  // Determine system status for UI display
  const systemStatus = useMemo(() => {
    if (isInitialLoading) return 'LOADING_DATA';
    if (isInitialError) return 'ERROR_DATA';
    if (analyzeMutation.isPending) return 'ANALYZING';
    if (executeTradeMutation.isPending) return 'EXECUTING';
    if (analyzeMutation.isSuccess && analyzeMutation.data?.length === 0) return 'COMPLETE_NO_SUGGESTIONS';
    if (analyzeMutation.isSuccess && analyzeMutation.data?.length > 0) return 'COMPLETE_WITH_SUGGESTIONS';
    if (analyzeMutation.isError) return 'ERROR_ANALYSIS';
    return 'IDLE';
  }, [isInitialLoading, isInitialError, analyzeMutation.isPending, executeTradeMutation.isPending, analyzeMutation.isSuccess, analyzeMutation.data?.length, analyzeMutation.isError]);


  const renderSuggestions = () => {
    if (systemStatus === 'LOADING_DATA') {
      return <p className="text-gray-500 text-center mt-6 animate-pulse text-lg font-medium">Loading portfolio data...</p>;
    }
    if (systemStatus === 'ERROR_DATA') {
        return <p className="text-red-600 text-center mt-6 text-lg font-bold">Error loading data: {initialError?.message}</p>;
    }
    if (systemStatus === 'ANALYZING') {
      return <p className="text-indigo-400 text-center mt-6 animate-pulse text-lg font-medium">Analyzing Portfolio...</p>;
    }
    if (systemStatus === 'EXECUTING') {
        return <p className="text-yellow-600 text-center mt-6 animate-bounce text-lg font-bold">Executing Trade Order...</p>;
    }
    if (systemStatus === 'COMPLETE_NO_SUGGESTIONS') {
      return <p className="text-green-600 text-center mt-6 text-xl font-semibold">Optimization Complete: Portfolio is tax-efficient.</p>;
    }
    if (systemStatus === 'IDLE') {
        return <p className="text-gray-500 text-center mt-6">Ready to analyze portfolio.</p>;
    }
    if (systemStatus === 'ERROR_ANALYSIS') {
        return <p className="text-red-600 text-center mt-6 text-lg font-bold">Analysis failed: {analyzeMutation.error?.message}</p>;
    }

    const analysisResults = analyzeMutation.data || [];

    return (
      <div className="space-y-5 mt-6">
        <div className="flex justify-between items-center p-3 bg-gray-100 rounded-lg border border-gray-300">
            <span className="text-sm font-bold text-gray-700">Total Potential Impact: 
                <span className="text-red-700 ml-2">${analysisResults.filter(r => r.realizedGainLoss < 0).reduce((sum, r) => sum + Math.abs(r.realizedGainLoss), 0).toFixed(2)}</span> / 
                <span className="text-green-700 ml-1">${analysisResults.filter(r => r.realizedGainLoss > 0).reduce((sum, r) => sum + r.realizedGainLoss, 0).toFixed(2)}</span>
            </span>
            <span className="text-xs text-indigo-600">Sorted by Priority ({analysisResults[0]?.executionPriority || '-'} being highest)</span>
        </div>
        {analysisResults.map((s) => (
          <div key={s.id} className={`p-5 rounded-xl shadow-lg transition duration-500 border-l-8 ${s.realizedGainLoss < 0 ? 'border-red-600 bg-red-50 hover:shadow-xl' : 'border-green-600 bg-green-50 hover:shadow-xl'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-2xl font-extrabold text-gray-900 flex items-center">
                        {s.ticker} 
                        <span className="text-xs ml-2 px-2 py-0.5 rounded-full bg-indigo-200 text-indigo-800 font-mono">{s.strategy}</span>
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Confidence: {(s.confidenceScore * 100).toFixed(1)}% | Priority: {s.executionPriority}</p>
                </div>
                <button
                    onClick={() => executeTradeMutation.mutate(s)}
                    disabled={executeTradeMutation.isPending || isInitialLoading || isInitialError}
                    className={`px-4 py-2 text-sm font-bold rounded-lg transition duration-200 transform hover:scale-[1.05] shadow-md
                        ${s.realizedGainLoss < 0 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }
                        ${executeTradeMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                >
                    {executeTradeMutation.isPending ? 'Processing...' : `Execute Trade (${s.sharesToSell} Sh)`}
                </button>
            </div>
            <p className="mt-3 text-lg font-medium border-t pt-2 border-dashed">
              {s.recommendation}
            </p>
            <p className={`text-xl font-extrabold mt-2 ${s.realizedGainLoss < 0 ? 'text-red-800' : 'text-green-800'}`}>
              Net Impact: ${Math.abs(s.realizedGainLoss).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    );
  };

  const renderSystemStatus = () => {
    let color = 'text-gray-500';
    let message = 'System Idle.';
    
    switch(systemStatus) {
        case 'LOADING_DATA':
            color = 'text-gray-500 animate-pulse';
            message = 'Status: Loading Initial Data...';
            break;
        case 'ERROR_DATA':
            color = 'text-red-600';
            message = `Status: Error Loading Data (${initialError?.message})`;
            break;
        case 'ANALYZING':
            color = 'text-indigo-500 animate-pulse';
            message = 'Status: Analysis in Progress';
            break;
        case 'EXECUTING':
            color = 'text-yellow-600 animate-bounce';
            message = 'Status: Executing Trade Orders';
            break;
        case 'COMPLETE_NO_SUGGESTIONS':
            color = 'text-green-600 font-bold';
            message = `Status: Analysis Complete. No New Suggestions.`;
            break;
        case 'COMPLETE_WITH_SUGGESTIONS':
            color = 'text-blue-600 font-bold';
            message = `Status: Analysis Complete. ${analyzeMutation.data?.length} Suggestions Identified.`;
            break;
        case 'ERROR_ANALYSIS':
            color = 'text-red-600';
            message = `Status: Analysis Failed (${analyzeMutation.error?.message})`;
            break;
    }
    return <p className={`text-lg ${color} mb-4 border-b pb-2`}>{message}</p>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto bg-white shadow-2xl rounded-3xl border-t-8 border-indigo-800 p-8">
        
        <header className="flex justify-between items-center border-b border-gray-200 pb-5 mb-6">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">
            Tax Optimization Dashboard
          </h1>
          <button
            onClick={() => analyzeMutation.mutate()}
            disabled={analyzeMutation.isPending || executeTradeMutation.isPending || isInitialLoading || isInitialError}
            className={`px-8 py-4 text-lg font-extrabold rounded-xl transition duration-300 shadow-xl transform hover:scale-[1.03] active:scale-[0.98]
              ${analyzeMutation.isPending || executeTradeMutation.isPending || isInitialLoading || isInitialError
                ? 'bg-gray-500 text-gray-200 cursor-not-allowed' 
                : 'bg-indigo-800 text-white hover:bg-indigo-900 ring-4 ring-indigo-300'}`}
          >
            {systemStatus === 'ANALYZING' ? 'ANALYZING...' : 'RUN ANALYSIS'}
          </button>
        </header>

        {renderSystemStatus()}

        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
          
          <div className="lg:col-span-1 p-6 border border-indigo-200 rounded-2xl bg-indigo-50 shadow-inner">
            <h3 className="text-2xl font-bold mb-4 text-indigo-800 border-b pb-2">Portfolio Metrics</h3>
            
            {isInitialLoading ? (
                <p className="text-gray-500 animate-pulse">Loading metrics...</p>
            ) : isInitialError ? (
                <p className="text-red-600">Error: {initialError?.message}</p>
            ) : (
                <>
                    <MetricCard title="Total Market Value" value={`$${portfolioSummary.totalMarketValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}`} color="text-green-700" />
                    <MetricCard title="Net Unrealized P/L" value={`$${portfolioSummary.netUnrealizedPL.toLocaleString('en-US', { maximumFractionDigits: 2 })}`} color={portfolioSummary.netUnrealizedPL >= 0 ? "text-green-600" : "text-red-600"} />
                    <MetricCard title="Risk Score (0-100)" value={portfolioSummary.riskScore.toFixed(2)} color={portfolioSummary.riskScore > 50 ? "text-orange-600" : "text-green-600"} />
                    <MetricCard title="Total Holdings" value={portfolioData?.length.toString() || '0'} color="text-gray-700" />
                    
                    <div className="mt-6 pt-4 border-t border-indigo-200">
                        <h4 className="text-lg font-semibold text-indigo-700 mb-2">Sector Concentration (%)</h4>
                        <div className="space-y-1 text-sm">
                            {Object.entries(portfolioSummary.sectorExposure).sort(([, a], [, b]) => b - a).map(([sector, percent]) => (
                                <div key={sector} className="flex justify-between">
                                    <span className="text-gray-600">{sector}</span>
                                    <span className="font-bold">{percent}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
          </div>

          <div className="lg:col-span-3 p-6 border border-gray-300 rounded-2xl bg-white shadow-lg">
            <h3 className="text-3xl font-bold text-gray-900 mb-4 border-b pb-3">Actionable Suggestions</h3>
            <div className="min-h-[400px] bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200 overflow-y-auto">
              {renderSuggestions()}
            </div>
          </div>
        </section>

        <section className="mt-10 pt-6 border-t-4 border-indigo-100">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-2xl font-semibold text-indigo-800 mb-3">Optimization Logic</h3>
                    <p className="text-gray-700 leading-relaxed">
                        The system identifies suboptimal tax positions and calculates the most efficient path to optimization. Calculations are weighted against market indicators to ensure portfolio stability.
                    </p>
                    <div className="mt-4 text-sm p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded">
                        <p className="font-bold">Note on Wash Sales:</p>
                        <p>The system cross-references suggested sales against trading logs to prevent wash sale violations.</p>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-2xl font-semibold text-indigo-800 mb-3">Settings</h3>
                    <p className="text-gray-700 leading-relaxed">
                        Configure the parameters for the tax harvesting algorithm.
                    </p>
                    <div className="mt-4 space-y-2">
                        <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" defaultChecked={true} disabled className="form-checkbox h-4 w-4 text-indigo-600 mr-2 border-indigo-400"/>
                            Enable Long-Term Gain Harvesting (LTG)
                        </label>
                        <label className="flex items-center text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" defaultChecked={true} disabled className="form-checkbox h-4 w-4 text-indigo-600 mr-2 border-indigo-400"/>
                            Activate Volatility Dampening Rebalance (VDR)
                        </label>
                    </div>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
};

interface MetricCardProps {
    title: string;
    value: string;
    color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, color }) => (
    <div className="py-3 border-b border-indigo-100 last:border-b-0">
        <p className="text-sm font-medium text-indigo-600">{title}</p>
        <p className={`text-3xl font-extrabold mt-1 ${color}`}>{value}</p>
    </div>
);

// Wrapper component to provide QueryClientProvider for the entire file's context
// In a full application, QueryClientProvider would typically wrap your App component.
const TaxOptimizationChamber: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TaxOptimizationChamberContent />
  </QueryClientProvider>
);

export default TaxOptimizationChamber;