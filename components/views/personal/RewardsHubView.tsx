// components/views/personal/RewardsHubView.tsx
import React, { useContext, useState } from 'react';
import { DataContext } from '../../../context/DataContext';
import Card from '../../Card';
import type { RewardItem } from '../../../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const REWARD_ICONS: { [key: string]: React.FC<{ className?: string }> } = {
    cash: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    gift: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4H5z" /></svg>,
    leaf: ({ className }) => <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const mockPointsHistory = [
    { month: 'Jan', earned: 12000 }, { month: 'Feb', earned: 15000 },
    { month: 'Mar', earned: 13000 }, { month: 'Apr', earned: 18000 },
    { month: 'May', earned: 22000 }, { month: 'Jun', earned: 25000 },
];


const RewardsHubView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("RewardsHubView must be within a DataProvider.");
    
    const { gamification, rewardPoints, rewardItems, redeemReward } = context;
    const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
    
    const handleRedeem = (item: RewardItem) => {
        const success = redeemReward(item);
        if (success) {
            setFeedback({ type: 'success', message: `Successfully redeemed ${item.name}!`});
        } else {
            setFeedback({ type: 'error', message: "Not enough points to redeem this item."});
        }
        setTimeout(() => setFeedback(null), 3000);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Rewards Hub</h2>
            {feedback && (
                <div className={`p-4 rounded-lg text-white text-sm ${feedback.type === 'success' ? 'bg-green-500/50' : 'bg-red-500/50'}`}>
                    {feedback.message}
                </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card title="Your Points">
                    <p className="text-6xl font-bold text-center text-white my-4">{rewardPoints.balance.toLocaleString()}</p>
                    <p className="text-center text-gray-400">Points</p>
                </Card>
                <Card title="Your Level" className="lg:col-span-2">
                    <div className="flex flex-col justify-center h-full">
                        <div className="flex justify-between items-baseline">
                             <h3 className="text-2xl font-semibold text-white">{gamification.levelName}</h3>
                             <p className="text-lg text-gray-400">Level {gamification.level}</p>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-4 mt-4">
                            <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-4 rounded-full text-right pr-2 text-xs text-white" style={{ width: `${gamification.progress}%` }}>
                                {gamification.progress.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
             <Card title="Points Earned Over Time">
                <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={mockPointsHistory}>
                        <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }} />
                        <Line type="monotone" dataKey="earned" stroke="#8884d8" strokeWidth={2} name="Points Earned" />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
            <Card title="Redeem Your Points">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rewardItems.map(item => {
                        const Icon = REWARD_ICONS[item.iconName];
                        return (
                            <Card key={item.id} className="flex flex-col text-center">
                                <div className="flex-grow">
                                    <div className="w-16 h-16 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center text-cyan-300">
                                        <Icon className="w-8 h-8" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-white mt-4">{item.name}</h4>
                                    <p className="text-sm text-gray-400 mt-2">{item.description}</p>
                                </div>
                                <div className="mt-6">
                                    <p className="font-mono text-xl text-cyan-300 mb-4">{item.cost.toLocaleString()} Points</p>
                                    <button onClick={() => handleRedeem(item)} disabled={rewardPoints.balance < item.cost} className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm disabled:opacity-50">
                                        Redeem
                                    </button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default RewardsHubView;