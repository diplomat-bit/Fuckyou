import React from 'react';
import Card from '../../Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';

// In a real app, this data would come from a dedicated file or a live API call
const modelPerformanceData = [
  { name: 'Jan', accuracy: 92.5 }, { name: 'Feb', accuracy: 93.1 },
  { name: 'Mar', accuracy: 92.8 }, { name: 'Apr', accuracy: 94.2 },
  { name: 'May', accuracy: 94.5 }, { name: 'Jun', accuracy: 95.1 },
];
const apiUsageData = [
    { name: 'Vision API', calls: 120000 }, { name: 'NLP API', calls: 85000 },
    { name: 'Translation API', calls: 45000 }, { name: 'Prediction API', calls: 250000 },
];
const deployedModels = [
    { id: 1, name: 'fraud-detection-v3', endpoint: '...', status: 'Online' },
    { id: 2, name: 'product-recommender-v1.2', endpoint: '...', status: 'Online' },
    { id: 3, name: 'churn-predictor-v2', endpoint: '...', status: 'Scaling' },
    { id: 4, name: 'sentiment-analyzer-v1', endpoint: '...', status: 'Offline' },
];

const DemoBankAIPlatformView: React.FC = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Demo Bank AI Platform</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="text-center"><p className="text-3xl font-bold text-white">4</p><p className="text-sm text-gray-400 mt-1">Deployed Models</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">500k</p><p className="text-sm text-gray-400 mt-1">API Calls (24h)</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">95.1%</p><p className="text-sm text-gray-400 mt-1">Avg. Model Accuracy</p></Card>
                <Card className="text-center"><p className="text-3xl font-bold text-white">150ms</p><p className="text-sm text-gray-400 mt-1">Avg. Inference Time</p></Card>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="API Calls by Type">
                    <ResponsiveContainer width="100%" height={300}>
                         <BarChart data={apiUsageData}>
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Bar dataKey="calls" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Primary Model Performance (Accuracy %)">
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={modelPerformanceData}>
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" domain={[90, 100]} unit="%" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderColor: '#4b5563' }}/>
                            <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card title="Deployed Models">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-400">
                        <thead className="text-xs text-gray-300 uppercase bg-gray-900/30">
                            <tr>
                                <th scope="col" className="px-6 py-3">Model Name</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deployedModels.map(model => (
                                <tr key={model.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-mono text-white">{model.name}</td>
                                    <td className="px-6 py-4">
                                         <span className={`px-2 py-1 text-xs rounded-full ${model.status === 'Online' ? 'bg-green-500/20 text-green-300' : model.status === 'Scaling' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-gray-500/20 text-gray-300'}`}>{model.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default DemoBankAIPlatformView;
