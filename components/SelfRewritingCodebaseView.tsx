import React, { useState } from 'react';

interface Goal {
  id: string;
  text: string;
  status: 'PENDING' | 'PASSING' | 'FAILING';
}

const SelfRewritingCodebaseView: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([
    { id: "g1", text: "API response time should be under 50ms p95.", status: 'PASSING' }
  ]);
  const [newGoal, setNewGoal] = useState('');
  const [isEvolving, setIsEvolving] = useState(false);

  const handleAddGoal = async () => {
    if(!newGoal) return;
    const newGoalObj: Goal = { id: `g${goals.length+1}`, text: newGoal, status: 'PENDING' };
    setGoals(prev => [...prev, newGoalObj]);
    setNewGoal('');
    setIsEvolving(true);
    
    // MOCK API: Simulate the codebase evolving to meet the new goal
    await new Promise(res => setTimeout(res, 5000));
    setGoals(prev => prev.map(g => g.id === newGoalObj.id ? { ...g, status: 'PASSING' } : g));
    setIsEvolving(false);
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Live Self-Evolving Codebase</h1>
      <div className="p-4 bg-gray-900 rounded-lg mb-4">
        <h3 className="text-lg font-semibold mb-2">Current Goals (Unit Tests)</h3>
        <ul className="space-y-1 list-disc list-inside">
          {goals.map(g => (
            <li key={g.id}>
              <span className={`font-bold ${g.status === 'PASSING' ? 'text-green-400' : 'text-yellow-400'}`}>{g.status}</span> - {g.text}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex gap-2">
      <input 
        type="text" 
        value={newGoal}
        onChange={e => setNewGoal(e.target.value)}
        placeholder="Add a new goal... (e.g., 'Implement OAuth2 login')" 
        className="w-full p-2 bg-gray-700 rounded"
      />
      <button onClick={handleAddGoal} disabled={isEvolving} className="p-2 bg-cyan-600 rounded disabled:opacity-50 whitespace-nowrap">Add Goal & Evolve</button>
      </div>
      {isEvolving && <p className="mt-4">New goal accepted. Recompiling genetic algorithm... refactoring source code... running tests...</p>}
    </div>
  );
};
export default SelfRewritingCodebaseView;
