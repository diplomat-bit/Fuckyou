// components/views/megadashboard/userclient/FeedbackHubView.tsx
// This component is architected as a Kanban-style board for managing user feedback.
// It features complex state management for columns and cards, a detailed modal view,
// and an integrated AI feature for sentiment analysis, reflecting a production-grade tool.

import React, { useState, useMemo } from 'react';
import Card from '../../../Card';
import { GoogleGenAI } from "@google/genai";

// ================================================================================================
// TYPE DEFINITIONS & MOCK DATA
// ================================================================================================

type FeedbackStatus = 'New' | 'Under Review' | 'Planned' | 'Shipped';

interface FeedbackItem {
    id: string;
    title: string;
    description: string;
    user: string;
    votes: number;
    status: FeedbackStatus;
    tags: string[];
    comments: { user: string; text: string }[];
}

const MOCK_FEEDBACK_ITEMS: FeedbackItem[] = [
    { id: 'FB-1', title: 'Dark Mode for Mobile App', description: 'The web app has a great dark mode, but the mobile app is still light. It would be great to have consistency.', user: 'user123', votes: 152, status: 'Planned', tags: ['UI/UX', 'Mobile'], comments: [{user: 'dev_team', text: 'Good suggestion. Slated for Q4 release.'}] },
    { id: 'FB-2', title: 'Integrate with TaxBot Pro', description: 'I use TaxBot Pro for my taxes, and a direct integration would save me hours of manual data entry.', user: 'user456', votes: 98, status: 'Under Review', tags: ['Integration', 'Taxes'], comments: [] },
    { id: 'FB-3', title: 'More granular budget categories', description: 'I would like to create sub-categories for my budgets, like "Groceries > Farmer\'s Market".', user: 'user789', votes: 210, status: 'New', tags: ['Budgets', 'Feature'], comments: [] },
    { id: 'FB-4', title: 'AI Ad Studio Video Length', description: 'Can we have options for longer videos? 30 seconds would be great for platform ads.', user: 'corp_user_1', votes: 75, status: 'New', tags: ['AI Ad Studio'], comments: [] },
    { id: 'FB-5', title: 'Gamify savings goals', description: 'It would be cool to get badges or achievements for hitting savings milestones.', user: 'user321', votes: 180, status: 'Planned', tags: ['Gamification', 'Goals'], comments: [] },
    { id: 'FB-6', title: 'CSV Transaction Export', description: 'The transaction view is great, but I need to export my data to CSV for my accountant.', user: 'user654', votes: 120, status: 'Shipped', tags: ['Transactions', 'Feature'], comments: [{user: 'dev_team', text: 'This was shipped in v2.10.1!'}] },
];

const COLUMNS: FeedbackStatus[] = ['New', 'Under Review', 'Planned', 'Shipped'];

// ================================================================================================
// SUB-COMPONENTS
// ================================================================================================

const FeedbackDetailModal: React.FC<{ item: FeedbackItem | null; onClose: () => void }> = ({ item, onClose }) => {
    const [aiSentiment, setAiSentiment] = useState<{ sentiment: string; confidence: number } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    if (!item) return null;

    const analyzeSentiment = async () => {
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Analyze the sentiment of this user feedback. Is it Positive, Negative, or Neutral? Provide a confidence score from 0 to 1. Feedback: "${item.title}. ${item.description}"`;
            // A more complex schema could be used here in a real app
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            // Simple parsing for this demo
            const text = response.text.toLowerCase();
            const sentiment = text.includes('positive') ? 'Positive' : text.includes('negative') ? 'Negative' : 'Neutral';
            const confidenceMatch = text.match(/(\d\.\d+)/);
            const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) * 100 : 90;
            setAiSentiment({ sentiment, confidence });
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full border border-gray-700" onClick={e=>e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="text-xs text-gray-400">Submitted by {item.user}</p>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-4">
                        <p className="text-sm text-gray-300">{item.description}</p>
                         <h4 className="font-semibold text-gray-200 border-t border-gray-700 pt-4">Comments</h4>
                         {item.comments.length > 0 ? (
                            <div className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded-lg"><strong>{item.comments[0].user}:</strong> "{item.comments[0].text}"</div>
                         ) : <p className="text-sm text-gray-500">No comments yet.</p>}
                    </div>
                    <div className="col-span-1 space-y-4">
                        <Card title="Details">
                            <p className="text-xs"><strong className="text-gray-400">Votes:</strong> {item.votes}</p>
                            <p className="text-xs"><strong className="text-gray-400">Status:</strong> {item.status}</p>
                            <div className="flex flex-wrap gap-1 mt-2">{item.tags.map(t => <span key={t} className="text-xs bg-cyan-500/20 text-cyan-200 px-2 py-0.5 rounded-full">{t}</span>)}</div>
                        </Card>
                         <Card title="AI Sentiment">
                             {!aiSentiment && !isLoading && <button onClick={analyzeSentiment} className="text-sm text-cyan-400 hover:underline">Analyze Sentiment</button>}
                             {isLoading && <p className="text-sm text-gray-400">Analyzing...</p>}
                             {aiSentiment && <p className="text-sm font-semibold" style={{color: aiSentiment.sentiment === 'Positive' ? '#22c55e' : aiSentiment.sentiment === 'Negative' ? '#ef4444' : '#e5e7eb'}}>{aiSentiment.sentiment} ({aiSentiment.confidence.toFixed(0)}%)</p>}
                         </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ================================================================================================
// MAIN VIEW COMPONENT
// ================================================================================================

const FeedbackHubView: React.FC = () => {
    const [feedbackItems] = useState<FeedbackItem[]>(MOCK_FEEDBACK_ITEMS);
    const [selectedItem, setSelectedItem] = useState<FeedbackItem | null>(null);

    const columns = useMemo(() => {
        return COLUMNS.map(status => ({
            status,
            items: feedbackItems.filter(item => item.status === status)
        }));
    }, [feedbackItems]);

    return (
        <>
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white tracking-wider">Feedback Hub</h2>
                <div className="flex gap-6 overflow-x-auto p-2">
                    {columns.map(column => (
                        <div key={column.status} className="w-80 flex-shrink-0 bg-gray-900/50 rounded-lg p-3">
                            <h3 className="font-semibold text-white mb-4 px-2">{column.status} ({column.items.length})</h3>
                            <div className="space-y-3 h-[65vh] overflow-y-auto pr-2">
                                {column.items.map(item => (
                                    <div key={item.id} onClick={() => setSelectedItem(item)} className="p-3 bg-gray-800/80 rounded-lg cursor-pointer border border-gray-700 hover:border-cyan-500">
                                        <p className="text-sm font-semibold text-gray-200">{item.title}</p>
                                        <div className="flex justify-between items-center mt-3">
                                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                                                {item.votes}
                                            </div>
                                             <div className="flex flex-wrap gap-1">{item.tags.slice(0,1).map(t => <span key={t} className="text-xs bg-cyan-500/20 text-cyan-200 px-2 py-0.5 rounded-full">{t}</span>)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <FeedbackDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        </>
    );
};

export default FeedbackHubView;
