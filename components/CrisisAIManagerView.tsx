import React, { useState } from 'react';

type CrisisType = 'DATA_BREACH' | 'PRODUCT_FAILURE' | 'EXECUTIVE_SCANDAL';
interface CommsPackage {
  pressRelease: string;
  internalMemo: string;
  twitterThread: string[];
  supportScript: string;
}

const CrisisAIManagerView: React.FC = () => {
  const [crisisType, setCrisisType] = useState<CrisisType>('DATA_BREACH');
  const [facts, setFacts] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CommsPackage | null>(null);

  const handleGenerateComms = async () => {
    setIsLoading(true);
    setResult(null);
    // MOCK API
    const response: CommsPackage = await new Promise(res => setTimeout(() => res({
      pressRelease: `FOR IMMEDIATE RELEASE: [Company] Addresses Security Incident...`,
      internalMemo: `Team, This morning we identified a security incident. Here is what you need to know and our immediate next steps...`,
      twitterThread: [`1/ We recently identified a security incident. We are taking immediate action to address it.`, `2/ Our investigation is ongoing, and we will provide updates as they become available.`, `3/ Customer trust is our top priority. We are working tirelessly to secure our systems.`],
      supportScript: `Thank you for calling. I understand you have questions about the recent security notification. I can confirm we are investigating and will provide information directly to affected customers...`
    }), 2000));
    setResult(response);
    setIsLoading(false);
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Crisis AI Communications Manager</h1>
      <select value={crisisType} onChange={e => setCrisisType(e.target.value as CrisisType)} className="w-full p-2 mb-4 bg-gray-700 rounded">
        <option value="DATA_BREACH">Data Breach</option>
        <option value="PRODUCT_FAILURE">Product Failure</option>
        <option value="EXECUTIVE_SCANDAL">Executive Scandal</option>
      </select>
      <textarea
        value={facts}
        onChange={e => setFacts(e.target.value)}
        placeholder="Enter key facts (e.g., '50k user emails exposed, no passwords. Discovered 8am today.')"
        rows={4}
        className="w-full p-2 mb-4 bg-gray-700 rounded"
      />
      <button onClick={handleGenerateComms} disabled={isLoading} className="w-full p-2 bg-cyan-600 rounded disabled:opacity-50">Generate Unified Comms Package</button>
      {isLoading && <p className="mt-4">Analyzing legal precedent and sentiment... drafting response...</p>}
      {result && Object.entries(result).map(([key, value]) => (
        <div key={key} className="mt-4">
          <h3 className="text-xl font-semibold mb-2">{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</h3>
          <div className="bg-gray-900 p-4 rounded">
            {Array.isArray(value) ? value.map((v, i) => <pre key={i} className="whitespace-pre-wrap">{v}</pre>) : <pre className="whitespace-pre-wrap">{value as string}</pre>}
          </div>
        </div>
      ))}
    </div>
  );
};
export default CrisisAIManagerView;
