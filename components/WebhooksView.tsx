// components/views/megadashboard/developer/WebhooksView.tsx
import React, { useState } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

interface Webhook { id: string; url: string; status: 'Active' | 'Disabled'; events: string[]; }
interface WebhookEvent { id: string; webhookId: string; type: string; status: 'Delivered' | 'Failed'; payload: object; error?: string; }

const MOCK_WEBHOOKS: Webhook[] = [
    { id: 'wh-1', url: 'https://api.myapp.com/hooks/demobank', status: 'Active', events: ['transaction.created', 'payment.updated'] },
    { id: 'wh-2', url: 'https://api.my-analytics.com/ingest', status: 'Active', events: ['*'] },
    { id: 'wh-3', url: 'https://old-api.legacy.com/webhook', status: 'Disabled', events: ['user.created'] },
];
const MOCK_EVENTS: WebhookEvent[] = [
    { id: 'evt-1', webhookId: 'wh-1', type: 'transaction.created', status: 'Delivered', payload: { id: 'txn_123', amount: 50.00 } },
    { id: 'evt-2', webhookId: 'wh-2', type: 'user.updated', status: 'Delivered', payload: { id: 'user_abc' } },
    { id: 'evt-3', webhookId: 'wh-1', type: 'payment.updated', status: 'Failed', payload: { id: 'pay_456' }, error: 'Connection timed out after 10000ms' },
];

const WebhooksView: React.FC = () => {
    const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async (event: WebhookEvent) => {
        setSelectedEvent(event);
        setIsLoading(true);
        setAiAnalysis('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `I have a failed webhook delivery. The error was "${event.error}". The payload was ${JSON.stringify(event.payload)}. What is the likely cause of this failure and how can I fix it?`;
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setAiAnalysis(response.text);
        } catch (error) {
            setAiAnalysis("Error generating analysis.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Webhooks</h2>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="text-center"><p className="text-3xl font-bold text-white">3</p><p className="text-sm text-gray-400 mt-1">Endpoints</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">1.5M</p><p className="text-sm text-gray-400 mt-1">Events Delivered (24h)</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">0.2%</p><p className="text-sm text-gray-400 mt-1">Failure Rate</p></Card>
                    <Card className="text-center"><p className="text-3xl font-bold text-white">120ms</p><p className="text-sm text-gray-400 mt-1">Avg. Latency</p></Card>
                </div>
                <Card title="Registered Endpoints">
                     <table className="w-full text-sm text-left text-gray-400">
                         <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr><th>URL</th><th>Status</th><th>Subscribed Events</th></tr>
                        </thead>
                        <tbody>{MOCK_WEBHOOKS.map(wh => (<tr key={wh.id}>
                            <td className="px-6 py-4 font-mono text-white">{wh.url}</td>
                            <td className="px-6 py-4"><span className={`${wh.status === 'Active' ? 'text-green-400' : 'text-gray-500'}`}>{wh.status}</span></td>
                            <td className="px-6 py-4 flex flex-wrap gap-1">{wh.events.map(e => <span key={e} className="text-xs bg-gray-700 px-2 py-0.5 rounded-full">{e}</span>)}</td>
                        </tr>))}</tbody>
                     </table>
                </Card>
                <Card title="Recent Events">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30"><tr><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>{MOCK_EVENTS.map(evt => (<tr key={evt.id}>
                            <td className="px-6 py-4 font-mono text-white">{evt.type}</td>
                            <td className="px-6 py-4"><span className={`${evt.status === 'Delivered' ? 'text-green-400' : 'text-red-400'}`}>{evt.status}</span></td>
                            <td className="px-6 py-4">{evt.status === 'Failed' && <button onClick={() => handleAnalyze(evt)} className="text-xs text-cyan-400 hover:underline">AI Debug</button>}</td>
                        </tr>))}</tbody>
                    </table>
                </Card>
            </div>
            {selectedEvent && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setSelectedEvent(null)}>
                    <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-700"><h3 className="text-lg font-semibold text-white">AI Webhook Debugger</h3></div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <Card title="Failed Event Details"><pre className="text-xs">{JSON.stringify({ error: selectedEvent.error, payload: selectedEvent.payload }, null, 2)}</pre></Card>
                            <Card title="AI Analysis"><p className="text-sm text-gray-300 whitespace-pre-line">{isLoading ? 'Analyzing...' : aiAnalysis}</p></Card>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default WebhooksView;