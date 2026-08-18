import React from 'react';
import Card from '../../Card';

const messages = [
    { user: 'Alex Chen', text: 'Hey team, the latest deployment for the API gateway is complete. Let me know if you see any issues.', time: '10:32 AM' },
    { user: 'Brenda Rodriguez', text: 'Looks good on my end! Great work.', time: '10:34 AM' },
    { user: 'The Visionary', text: 'Excellent progress. How is the Q3 roadmap looking?', time: '10:35 AM' },
    { user: 'Fiona Kim', text: 'On track. I will be sharing the updated product specs later today.', time: '10:36 AM' },
];

const DemoBankTeamsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank Teams</h2>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">50</p><p className="text-sm text-gray-400 mt-1">Active Users</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">12</p><p className="text-sm text-gray-400 mt-1">Channels</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">5.2k</p><p className="text-sm text-gray-400 mt-1">Messages Sent (24h)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">25</p><p className="text-sm text-gray-400 mt-1">Active Meetings</p></Card>
            </div>
            
            <Card title="#general">
                 <div className="h-96 flex flex-col">
                    <div className="flex-grow space-y-4 overflow-y-auto p-4 bg-gray-900/50 rounded-t-lg">
                        {messages.map((msg, i) => (
                            <div key={i} className="flex flex-col items-start">
                                <div className="flex items-baseline gap-2">
                                    <span className={`font-semibold ${msg.user === 'The Visionary' ? 'text-cyan-300' : 'text-white'}`}>{msg.user}</span>
                                    <span className="text-xs text-gray-500">{msg.time}</span>
                                </div>
                                <p className="text-gray-300">{msg.text}</p>
                            </div>
                        ))}
                    </div>
                     <div className="p-4 border-t border-gray-700">
                        <input type="text" placeholder="Message #general" className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-2 text-white" />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankTeamsView;