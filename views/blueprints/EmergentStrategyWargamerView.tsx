import React, { useState } from 'react';

interface GameState {
  year: number;
  marketShare: number;
  competitorActions: string[];
  newsEvents: string[];
}

const EmergentStrategyWargamerView: React.FC = () => {
  const [strategy, setStrategy] = useState('');
  const [log, setLog] = useState<GameState[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdvanceYear = async () => {
    setIsLoading(true);
    // MOCK API for simulating one year
    const newState: GameState = await new Promise(res => setTimeout(() => res({
      year: (log[log.length-1]?.year || 2024) + 1,
      marketShare: (log[log.length-1]?.marketShare || 20) * (0.95 + Math.random() * 0.1), // Fluctuate share
      competitorActions: ["FinFuture Inc. launched 'AI Wallet', acquiring 5% market share."],
      newsEvents: ["Global regulators announce inquiry into FinTech data practices."]
    }), 2000));
    setLog(prev => [...prev, newState]);
    setIsLoading(false);
  };
  
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Emergent Strategy Wargamer</h1>
      <textarea value={strategy} onChange={e => setStrategy(e.target.value)} placeholder="Your strategic directive for this year... (e.g., 'Focus on R&D for AI products, maintain marketing spend.')" rows={3} className="w-full p-2 bg-gray-700 rounded mb-2"/>
      <button onClick={handleAdvanceYear} disabled={isLoading} className="w-full p-2 bg-cyan-600 rounded disabled:opacity-50">Execute Strategy & Advance One Year</button>
      <div className="mt-4 bg-gray-900 p-4 rounded-lg h-96 overflow-y-auto">
        {log.length === 0 && <p className="text-gray-500">The simulation log will appear here.</p>}
        {log.map(state => (
          <div key={state.year} className="mb-4 pb-4 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-cyan-300">Year: {state.year}</h3>
            <p><strong>Your Market Share:</strong> {state.marketShare.toFixed(1)}%</p>
            <p><strong>Competitor Actions:</strong></p>
            <ul className="list-disc list-inside text-sm text-gray-400">{state.competitorActions.map((a,i) => <li key={i}>{a}</li>)}</ul>
            <p><strong>Market News:</strong></p>
            <ul className="list-disc list-inside text-sm text-gray-400">{state.newsEvents.map((e,i) => <li key={i}>{e}</li>)}</ul>
          </div>
        ))}
        {isLoading && <p>Simulating market response...</p>}
      </div>
    </div>
  );
};
export default EmergentStrategyWargamerView;
