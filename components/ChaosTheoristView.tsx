import React, { useState } from 'react';

interface LeveragePoint {
  action: string;
  cost: string;
  outcomeProbability: number;
  timeToImpact: string;
}

const ChaosTheoristView: React.FC = () => {
  const [goal, setGoal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<LeveragePoint | null>(null);

  const handleFindLeverage = async () => {
    setIsLoading(true);
    setResult(null);
    // MOCK API
    const response: LeveragePoint = await new Promise(res => setTimeout(() => res({
      action: "Seed clouds with silver iodide via 3 drone flights over the Sierra Nevada mountain range on Tuesday.",
      cost: "~$25,000 USD",
      outcomeProbability: 0.62,
      timeToImpact: "90-120 days"
    }), 4000));
    setResult(response);
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Chaotic System Leverage Finder</h1>
      <textarea
        value={goal}
        onChange={e => setGoal(e.target.value)}
        placeholder="Desired Outcome (e.g., 'Increase rainfall in Central Valley by 5% in Q4')"
        rows={3}
        className="w-full p-2 mb-4 bg-gray-700 rounded"
      />
      <button onClick={handleFindLeverage} disabled={isLoading} className="w-full p-2 bg-cyan-600 rounded disabled:opacity-50">Find Smallest Leverage Point</button>
      {isLoading && <p className="mt-4">Modeling non-linear system dynamics... searching for strange attractors...</p>}
      {result && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-xl font-semibold">Optimal Leverage Point Identified</h3>
          <p className="mt-2"><strong>Action:</strong> {result.action}</p>
          <p><strong>Estimated Cost:</strong> {result.cost}</p>
          <p><strong>Probability of Desired Outcome:</strong> {(result.outcomeProbability * 100).toFixed(0)}%</p>
          <p><strong>Lead Time to Impact:</strong> {result.timeToImpact}</p>
        </div>
      )}
    </div>
  );
};
export default ChaosTheoristView;
