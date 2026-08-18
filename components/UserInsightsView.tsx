// components/views/megadashboard/userclient/UserInsightsView.tsx
// This component has been architected as a comprehensive user insights dashboard.
// It features multiple complex charts using the Recharts library to visualize
// key business metrics like user growth, cohort engagement, churn, and satisfaction.
// The code is intentionally detailed to represent a production-quality analytics view.

import React from 'react';
import Card from '../../../Card';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// ================================================================================================
// MOCK DATA FOR CHARTS
// ================================================================================================

const userGrowthData = [
    { name: 'Jan', users: 4000 }, { name: 'Feb', users: 4300 },
    { name: 'Mar', users: 5000 }, { name: 'Apr', users: 5800 },
    { name: 'May', users: 6500 }, { name: 'Jun', users: 7800 },
];

const engagementByCohortData = [
    { cohort: 'Jan \'24', w1: 85, w2: 72, w3: 65, w4: 60 },
    { cohort: 'Feb \'24', w1: 88, w2: 78, w3: 70, w4: 68 },
    { cohort: 'Mar \'24', w1: 92, w2: 85, w3: 80, w4: 78 },
    { cohort: 'Apr \'24', w1: 90, w2: 82, w3: 75, w4: 71 },
];

const churnPredictionData = [
    { month: 'Jul', actual: 2.1, predicted: 2.2 },
    { month: 'Aug', actual: 2.3, predicted: 2.3 },
    { month: 'Sep', actual: 2.2, predicted: 2.4 },
    { month: 'Oct', predicted: 2.5 },
    { month: 'Nov', predicted: 2.6 },
];

const userSatisfactionData = [
    { name: 'CSAT', value: 91, fill: '#10b981' },
    { name: 'NPS', value: 65, fill: '#06b6d4' },
    { name: 'CES', value: 85, fill: '#6366f1' },
];

// ================================================================================================
// AI INSIGHTS (STATIC MOCK)
// ================================================================================================

const aiInsights = [
    "The March '24 cohort shows significantly higher week-over-week retention. Investigate marketing campaigns from that period.",
    "Predicted churn is trending upwards for Q4. Proactive retention campaigns are recommended for at-risk user segments.",
    "User growth is accelerating, but the average Customer Effort Score (CES) has slightly decreased. Monitor support tickets for friction points."
];

// ================================================================================================
// MAIN VIEW COMPONENT
// ================================================================================================

const UserInsightsView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">User & Client Insights</h2>
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">12,500</p><p className="text-sm text-gray-400 mt-1">Total Active Users</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">85%</p><p className="text-sm text-gray-400 mt-1">Monthly Active Users</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">$125</p><p className="text-sm text-gray-400 mt-1">Lifetime Value (LTV)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-red-400">2.2%</p><p className="text-sm text-gray-400 mt-1">Monthly Churn</p></Card>
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="User Growth">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={userGrowthData}>
                             <defs><linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/><stop offset="95%" stopColor="#8884d8" stopOpacity={0}/></linearGradient></defs>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Area type="monotone" dataKey="users" stroke="#8884d8" fill="url(#colorUsers)" name="Active Users" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Engagement by Cohort (Weekly Retention %)">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={engagementByCohortData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                            <XAxis dataKey="cohort" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" unit="%" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                            <Bar dataKey="w1" fill="#06b6d4" name="Week 1" />
                            <Bar dataKey="w2" fill="#3b82f6" name="Week 2" />
                            <Bar dataKey="w3" fill="#6366f1" name="Week 3" />
                            <Bar dataKey="w4" fill="#8b5cf6" name="Week 4" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                 <Card title="AI-Generated Key Insights" className="lg:col-span-2">
                     <ul className="space-y-4 list-disc list-inside text-gray-300">
                        {aiInsights.map((insight, index) => <li key={index}>{insight}</li>)}
                     </ul>
                </Card>
                <Card title="Churn Prediction (%)" className="lg:col-span-3">
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={churnPredictionData}>
                             <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                            <XAxis dataKey="month" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" unit="%" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Legend />
                            <Line type="monotone" dataKey="actual" stroke="#10b981" name="Actual Churn" strokeWidth={2} />
                            <Line type="monotone" dataKey="predicted" stroke="#ef4444" name="AI Predicted Churn" strokeWidth={2} strokeDasharray="5 5" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card title="User Satisfaction Scores">
                 <ResponsiveContainer width="100%" height={300}>
                     <RadialBarChart 
                        innerRadius="20%" 
                        outerRadius="80%" 
                        data={userSatisfactionData} 
                        startAngle={180} 
                        endAngle={0}
                    >
                        <RadialBar 
                            minAngle={15} 
                            background 
                            clockwise
                            dataKey="value" 
                        />
                        <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" align="center" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                    </RadialBarChart>
                </ResponsiveContainer>
            </Card>

        </div>
    );
};

export default UserInsightsView;