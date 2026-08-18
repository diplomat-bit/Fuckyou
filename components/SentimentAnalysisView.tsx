// components/views/megadashboard/analytics/SentimentAnalysisView.tsx
import React from 'react';
import Card from '../../../Card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const sentimentTrendData = [
    { name: 'Jan', positive: 85, negative: 10 },
    { name: 'Feb', positive: 88, negative: 8 },
    { name: 'Mar', positive: 82, negative: 15 },
    { name: 'Apr', positive: 90, negative: 5 },
    { name: 'May', positive: 92, negative: 4 },
    { name: 'Jun', positive: 91, negative: 6 },
];

const emergingTopics = [
    { topic: 'Mobile App Speed', sentiment: 'Negative', volume: 125 },
    { topic: 'New Savings Feature', sentiment: 'Positive', volume: 350 },
    { topic: 'Customer Support Wait Times', sentiment: 'Negative', volume: 88 },
];

const SentimentAnalysisView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">AI Sentiment Analysis Engine</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-green-400">91%</p><p className="text-sm text-gray-400 mt-1">Overall Positive Sentiment</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">3</p><p className="text-sm text-gray-400 mt-1">Emerging Negative Topics</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">1.2M</p><p className="text-sm text-gray-400 mt-1">Sources Analyzed (24h)</p></Card>
            </div>

            <Card title="Sentiment Trend (Last 6 Months)">
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sentimentTrendData}>
                        <XAxis dataKey="name" stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" unit="%" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                        <Legend />
                        <Line type="monotone" dataKey="positive" name="Positive" stroke="#10b981" strokeWidth={2} />
                        <Line type="monotone" dataKey="negative" name="Negative" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>

            <Card title="AI-Detected Emerging Topics">
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Topic</th>
                                <th scope="col" className="px-6 py-3">Sentiment</th>
                                <th scope="col" className="px-6 py-3">Mention Volume</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emergingTopics.map((topic, index) => (
                                <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-white">{topic.topic}</td>
                                    <td className="px-6 py-4">
                                        <span className={topic.sentiment === 'Positive' ? 'text-green-400' : 'text-red-400'}>{topic.sentiment}</span>
                                    </td>
                                    <td className="px-6 py-4">{topic.volume}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default SentimentAnalysisView;