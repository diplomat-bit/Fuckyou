import React, { useState } from 'react';

interface Reconstruction {
  protoWord: string;
  meaning: string;
  confidence: number;
  descendantEvidence: { language: string, word: string }[];
}

const LinguisticFossilFinderView: React.FC = () => {
  const [concept, setConcept] = useState('water');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Reconstruction | null>(null);
  
  const handleReconstruct = async () => {
    setIsLoading(true);
    setResult(null);
    // MOCK API
    const response: Reconstruction = await new Promise(res => setTimeout(() => res({
      protoWord: "*wódr̥",
      meaning: "Water",
      confidence: 0.99,
      descendantEvidence: [
        { language: "Hittite", word: "wātar" },
        { language: "Sanskrit", word: "uda" },
        { language: "Gothic", word: "watō" }
      ]
    }), 2000));
    setResult(response);
    setIsLoading(false);
  };
  
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Linguistic Fossil Finder (Proto-Indo-European)</h1>
      <div className="flex gap-2">
        <input type="text" value={concept} onChange={e => setConcept(e.target.value)} placeholder="Enter a modern concept (e.g., 'water')" className="w-full p-2 bg-gray-700 rounded"/>
        <button onClick={handleReconstruct} disabled={isLoading} className="p-2 bg-cyan-600 rounded disabled:opacity-50 whitespace-nowrap">Reconstruct PIE Word</button>
      </div>
      {isLoading && <p className="mt-4">Analyzing phonetic shifts across 500 languages...</p>}
      {result && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <h3 className="text-xl font-semibold">Reconstruction Result</h3>
          <h2 className="text-4xl font-mono text-cyan-300 my-2">{result.protoWord}</h2>
          <p><strong>Meaning:</strong> {result.meaning} (Confidence: {(result.confidence * 100)}%)</p>
          <h4 className="font-semibold mt-2">Evidence from Descendant Languages:</h4>
          <ul className="list-disc list-inside text-sm">
            {result.descendantEvidence.map(e => <li key={e.language}><strong>{e.language}:</strong> {e.word}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
};
export default LinguisticFossilFinderView;
