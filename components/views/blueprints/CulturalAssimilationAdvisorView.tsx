import React, { useState } from 'react';

interface ScenarioFeedback {
  userAction: string;
  aiResponse: string;
  feedback: { text: string; severity: 'Positive' | 'Neutral' | 'Negative' };
}

const CulturalAssimilationAdvisorView: React.FC = () => {
  const [scenario, setScenario] = useState("Negotiating with a German engineer");
  const [userInput, setUserInput] = useState('');
  const [log, setLog] = useState<ScenarioFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInteract = async () => {
    if(!userInput) return;
    setIsLoading(true);
    // MOCK API
    const response: Omit<ScenarioFeedback, 'userAction'> = await new Promise(res => setTimeout(() => res({
      aiResponse: "I see. Let us review the technical specifications one more time. Precision is paramount.",
      feedback: {
        text: "Feedback: Your directness was appropriate. Avoiding small talk and focusing on the technical facts is respected in this context.",
        severity: 'Positive'
      }
    }), 1500));
    setLog(prev => [...prev, { userAction: userInput, ...response }]);
    setUserInput('');
    setIsLoading(false);
  };
  
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Cultural Assimilation Advisor</h1>
      <h3 className="text-lg mb-4">Scenario: {scenario}</h3>
      <div className="bg-gray-900 p-4 rounded-lg h-80 overflow-y-auto mb-4 space-y-4">
        {log.map((item, i) => (
          <div key={i}>
            <p className="font-semibold">You: <span className="font-normal italic">{item.userAction}</span></p>
            <p className="font-semibold">Counterpart: <span className="font-normal italic">"{item.aiResponse}"</span></p>
            <p className={`text-xs mt-1 p-2 rounded ${item.feedback.severity === 'Positive' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{item.feedback.text}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Your response..." className="w-full p-2 bg-gray-700 rounded"/>
        <button onClick={handleInteract} disabled={isLoading} className="p-2 bg-cyan-600 rounded disabled:opacity-50">Interact</button>
      </div>
    </div>
  );
};
export default CulturalAssimilationAdvisorView;
