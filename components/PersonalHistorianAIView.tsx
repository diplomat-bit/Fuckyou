import React, { useState } from 'react';

interface Memory {
  id: string;
  title: string;
  summary: string;
  assets: { type: 'PHOTO' | 'EMAIL' | 'DOCUMENT', url: string }[];
  vrExperienceUrl: string;
}

const PersonalHistorianAIView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Memory | null>(null);
  
  const handleRecall = async () => {
    setIsLoading(true);
    setResult(null);
    // MOCK API
    const response: Memory = await new Promise(res => setTimeout(() => res({
      id: "mem-italy-2018",
      title: "Trip to Italy - Summer 2018",
      summary: "A 10-day trip focusing on Rome and Florence, key highlights include the Colosseum and Uffizi Gallery.",
      assets: [
        {type: "PHOTO", url: "#"},
        {type: "EMAIL", url: "#"}
      ],
      vrExperienceUrl: "#"
    }), 2500));
    setResult(response);
    setIsLoading(false);
  };
  
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Personal Historian AI</h1>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Recall a memory (e.g., 'My first marathon')" 
          className="w-full p-2 bg-gray-700 rounded"
        />
        <button onClick={handleRecall} disabled={isLoading} className="p-2 bg-cyan-600 rounded disabled:opacity-50">Recall</button>
      </div>
      {isLoading && <p className="mt-4">Searching digital archives... reconstructing timeline...</p>}
      {result && (
        <div className="mt-4 p-4 bg-gray-900 rounded-lg">
          <h2 className="text-xl font-semibold">Recalled Memory: {result.title}</h2>
          <p className="text-gray-400 mt-2">{result.summary}</p>
          <p className="mt-2">Launch <a href={result.vrExperienceUrl} className="text-cyan-400 hover:underline">VR Memory Palace Experience</a></p>
          <h4 className="font-semibold mt-2">Key Assets:</h4>
          <ul className="list-disc list-inside">
            {result.assets.map((asset, i) => <li key={i}><a href={asset.url} className="text-cyan-400 hover:underline">{asset.type}</a></li>)}
          </ul>
        </div>
      )}
    </div>
  );
};
export default PersonalHistorianAIView;
