import React, { useState } from 'react';

interface DebateTurn {
  speaker: 'USER' | 'AI';
  text: string;
  fallacyDetected?: string;
}

const DebateAdversaryView: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [persona, setPersona] = useState('Skeptical Physicist');
  const [history, setHistory] = useState<DebateTurn[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendArgument = async () => {
    if(!userInput) return;
    const userTurn: DebateTurn = { speaker: 'USER', text: userInput };
    setIsLoading(true);
    setHistory(prev => [...prev, userTurn]);
    setUserInput('');

    // MOCK API CALL TO THE NEW API ENDPOINT
    const apiEndpoint = 'https://ce47fe80-dabc-4ad0-b0e7-cf285695b8b8.mock.pstmn.io/ai/advisor/chat';
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // NOTE: The instruction states "this api that doesn't need no apikey", so we omit Authorization header.
        },
        body: JSON.stringify({
          message: userInput,
          sessionId: history.length === 0 ? 'initial-session' : 'continued-session', // Mock session ID logic
          // We are mocking the response structure based on the provided OpenAPI spec for /ai/advisor/chat
        }),
      });

      let aiResponseData: any;
      if (response.ok) {
        aiResponseData = await response.json();
      } else {
        // Handle API errors (e.g., 503 Service Unavailable)
        aiResponseData = {
          text: `Error: AI service returned status ${response.status}. Cannot generate response.`,
          fallacyDetected: 'Service Error'
        };
      }

      const aiTurn: DebateTurn = {
        speaker: 'AI',
        text: aiResponseData.text || aiResponseData.message || 'No response text received from AI.',
        fallacyDetected: aiResponseData.proactiveInsights?.[0]?.title || aiResponseData.fallacyDetected // Using title from insight as a proxy for fallacy detection if available
      };
      
      setHistory(prev => [...prev, aiTurn]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorTurn: DebateTurn = {
        speaker: 'AI',
        text: `Network or processing error occurred: ${error instanceof Error ? error.message : String(error)}.`,
        fallacyDetected: 'Network Error'
      };
      setHistory(prev => [...prev, errorTurn]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">AI Debate Adversary</h1>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Debate Topic" className="p-2 bg-gray-700 rounded"/>
        <input type="text" value={persona} onChange={e => setPersona(e.target.value)} placeholder="AI Persona" className="p-2 bg-gray-700 rounded"/>
      </div>
      <div className="bg-gray-900 p-4 rounded-lg h-80 overflow-y-auto mb-4 space-y-4">
        {history.map((turn, i) => (
          <div key={i} className={`p-2 rounded-lg ${turn.speaker === 'USER' ? 'bg-cyan-800 ml-10' : 'bg-gray-700 mr-10'}`}>
            <p><strong>{turn.speaker === 'USER' ? 'You' : persona}:</strong> {turn.text}</p>
            {turn.fallacyDetected && <p className="text-red-400 text-xs mt-1"><em>Fallacy Detected: {turn.fallacyDetected}</em></p>}
          </div>
        ))}
      </div>
      <textarea value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Your argument..." disabled={isLoading || !topic} className="w-full p-2 bg-gray-700 rounded mb-2" rows={3}/>
      <button onClick={handleSendArgument} disabled={isLoading || !userInput || !topic} className="w-full p-2 bg-cyan-600 rounded disabled:opacity-50">Submit Argument</button>
    </div>
  );
};
export default DebateAdversaryView;