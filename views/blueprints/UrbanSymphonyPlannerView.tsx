import React, { useState } from 'react';

interface CityPlan {
  planId: string;
  mapImageUrl: string; // URL to a top-down city plan image
  harmonyScore: number;
  efficiencyScore: number;
  livabilityScore: number;
}

const UrbanSymphonyPlannerView: React.FC = () => {
  const [constraints, setConstraints] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CityPlan | null>(null);

  const handleDesign = async () => {
    setIsLoading(true);
    setResult(null);
    // MOCK API
    const response: CityPlan = await new Promise(res => setTimeout(() => res({
      planId: "USP-Plan-01",
      mapImageUrl: "https://images.unsplash.com/photo-1542345336-221c5b6b1078?q=80&w=2000",
      harmonyScore: 0.92,
      efficiencyScore: 0.88,
      livabilityScore: 0.95
    }), 5000));
    setResult(response);
    setIsLoading(false);
  };
  
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Urban Symphony Planner</h1>
      <textarea 
        value={constraints} 
        onChange={e => setConstraints(e.target.value)}
        placeholder="Design Constraints (e.g., 'Population: 1M, Green space: 30% min, riverfront focus')" 
        rows={4}
        className="w-full p-2 mb-4 bg-gray-700 rounded"
      />
      <button onClick={handleDesign} disabled={isLoading} className="w-full p-2 bg-cyan-600 rounded disabled:opacity-50">Design City Plan</button>
      {isLoading && <p className="mt-4">Composing urban harmony... optimizing psychoacoustic zones...</p>}
      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">City Plan Generated (ID: {result.planId})</h2>
          <img src={result.mapImageUrl} alt="Generated City Plan" className="mt-2 rounded-lg w-full object-cover h-64"/>
          <div className="grid grid-cols-3 gap-4 text-center mt-4">
            <div><p className="text-2xl font-bold">{result.harmonyScore}</p><p className="text-xs text-gray-400">Harmony Score</p></div>
            <div><p className="text-2xl font-bold">{result.efficiencyScore}</p><p className="text-xs text-gray-400">Efficiency Score</p></div>
            <div><p className="text-2xl font-bold">{result.livabilityScore}</p><p className="text-xs text-gray-400">Livability Score</p></div>
          </div>
        </div>
      )}
    </div>
  );
};
export default UrbanSymphonyPlannerView;
