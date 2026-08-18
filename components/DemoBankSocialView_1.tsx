import React from 'react';
import Card from '../../Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

// In a real app, this data would come from a dedicated file e.g., /data/platform/socialData.ts
const engagementData = [
    { name: 'Week 1', engagement: 2200 }, { name: 'Week 2', engagement: 2800 },
    { name: 'Week 3', engagement: 2000 }, { name: 'Week 4', engagement: 2780 },
    { name: 'Week 5', engagement: 1890 }, { name: 'Week 6', engagement: 2390 },
];
const followerData = [
    { name: 'Jan', followers: 4000 }, { name: 'Feb', followers: 4300 },
    { name: 'Mar', followers: 5000 }, { name: 'Apr', followers: 5100 },
    { name: 'May', followers: 5500 }, { name: 'Jun', followers: 6200 },
];
const recentPosts = [
    { id: 1, platform: 'X', content: 'Announcing our new AI-powered savings tools!', likes: 1200, shares: 350, date: '2h ago' },
    { id: 2, platform: 'LinkedIn', content: 'Our CEO discusses the future of finance...', likes: 850, shares: 120, date: '1d ago' },
    { id: 3, platform: 'Instagram', content: 'Behind the scenes at Demo Bank #fintech', likes: 2500, shares: 50, date: '2d ago' },
];

const DemoBankSocialView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Social</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">1.2M</p><p className="text-sm text-gray-400 mt-1">Total Followers</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">2.5%</p><p className="text-sm text-gray-400 mt-1">Engagement Rate</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">25.6k</p><p className="text-sm text-gray-400 mt-1">Impressions (24h)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">+1.2k</p><p className="text-sm text-gray-400 mt-1">New Followers (7d)</p></Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Follower Growth">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={followerData}>
                            <defs><linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Area type="monotone" dataKey="followers" stroke="#8884d8" fill="url(#colorFollowers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Weekly Engagement">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={engagementData}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                            <Bar dataKey="engagement" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
            
            <Card title="Recent Posts">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Platform</th>
                                <th scope="col" className="px-6 py-3">Content</th>
                                <th scope="col" className="px-6 py-3">Likes</th>
                                <th scope="col" className="px-6 py-3">Shares</th>
                                <th scope="col" className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentPosts.map(post => (
                                <tr key={post.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-bold text-white">{post.platform}</td>
                                    <td className="px-6 py-4">{post.content}</td>
                                    <td className="px-6 py-4">{post.likes.toLocaleString()}</td>
                                    <td className="px-6 py-4">{post.shares.toLocaleString()}</td>
                                    <td className="px-6 py-4">{post.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankSocialView;
