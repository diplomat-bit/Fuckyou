import React, { useState } from 'react';

interface MeetingSummary {
  transcript: { participant: string; text: string }[];
  actionItems: { assignee: string; task: string }[];
  mindMapUrl: string; // URL to a 3D model
}

const HolographicMeetingScribeView: React.FC = () => {
  const [meetingUrl, setMeetingUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MeetingSummary | null>(null);

  const handleJoinAndScribe = async () => {
    setIsLoading(true);
    setResult(null);
    // MOCK API
    const response: MeetingSummary = await new Promise(res => setTimeout(() => res({
      transcript: [
        { participant: "Avatar Alice", text: "We need to focus on Q4 growth." },
        { participant: "Avatar Bob", text: "Agreed. I can take point on the new marketing campaign." }
      ],
      actionItems: [{ assignee: "Avatar Bob", task: "Lead new marketing campaign for Q4." }],
      mindMapUrl: "/mock/3d/meeting_mind_map.glb"
    }), 3000));
    setResult(response);
    setIsLoading(false);
  };
  
  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Holographic Meeting Scribe</h1>
      <div className="flex gap-2">
        <input
          type="text"
          value={meetingUrl}
          onChange={e => setMeetingUrl(e.target.value)}
          placeholder="Enter Holographic Meeting URL..."
          className="w-full p-2 bg-gray-700 rounded"
        />
        <button onClick={handleJoinAndScribe} disabled={isLoading} className="p-2 bg-cyan-600 rounded disabled:opacity-50 whitespace-nowrap">Join and Scribe</button>
      </div>
      {isLoading && <p className="mt-4">Joining spatial meeting... mapping participants...</p>}
      {result && (
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">Action Items</h3>
            <ul className="list-disc list-inside bg-gray-900 p-4 rounded">{result.actionItems.map((item, i) => <li key={i}><strong>{item.assignee}:</strong> {item.task}</li>)}</ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Mind Map</h3>
            <p className="bg-gray-900 p-4 rounded">3D mind map generated at: <a href={result.mindMapUrl} className="text-cyan-400 hover:underline">{result.mindMapUrl}</a></p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Transcript</h3>
            <div className="bg-gray-900 p-4 rounded max-h-60 overflow-y-auto">{result.transcript.map((t, i) => <p key={i}><strong className="text-cyan-300">{t.participant}:</strong> {t.text}</p>)}</div>
          </div>
        </div>
      )}
    </div>
  );
};
export default HolographicMeetingScribeView;
